import express from 'express';
import crypto from 'crypto';
import { ProviderFactory } from './src/providers/ProviderFactory';
import { ValidationAdapterFactory } from './src/providers/ValidationAdapters';
import { ProviderValidationError } from './src/providers/AIProvider';
import { InternalAIService, buildOptimizedContextForResource } from './src/server/internalAIService';
import { formatUserFriendlyErrorMessage } from './src/utils/errorSanitizer';
import { authenticateFirebaseUser } from './src/middleware/authFirebase';
import { 
  isAzureBlobConfigured, 
  uploadTranscriptToAzure, 
  downloadTranscriptFromAzure,
  uploadBinaryBlobToAzure,
  getAzureBlobStatusDetails
} from './src/server/azureBlobService';




import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { runNotificationSchedulerCycle } from './src/server/notificationScheduler';
import { canUseServerFallback, enforceAiUsage } from './src/server/aiUsageGuard';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const officeParser = require('officeparser');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { Readability } = require('@mozilla/readability');
const { YoutubeTranscript } = require('youtube-transcript');
const XLSX = require('xlsx');

// Load environment variables
dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('[SERVER UNCAUGHT EXCEPTION]', err);
  // Node's state is undefined after an uncaught exception; exit so the
  // process manager restarts the server in a clean state instead of
  // continuing to serve requests from a corrupted process.
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[SERVER UNHANDLED REJECTION]', reason);
});

// In-memory log buffer for remote audit
const logBuffer: string[] = [];
const originalLog = console.log;
const originalError = console.error;

console.log = (...args: any[]) => {
  const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  logBuffer.push(`[LOG] ${new Date().toISOString()} - ${msg}`);
  if (logBuffer.length > 500) logBuffer.shift();
  originalLog.apply(console, args);
};

console.error = (...args: any[]) => {
  const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  logBuffer.push(`[ERROR] ${new Date().toISOString()} - ${msg}`);
  if (logBuffer.length > 500) logBuffer.shift();
  originalError.apply(console, args);
};

const app = express();
const PORT = process.env.PORT || 3002;

// Restrict CORS to same-origin requests, explicitly configured origins
// (CORS_ORIGINS, comma-separated), and local dev hosts. Requests without an
// Origin header (curl, mobile apps, server-to-server) are always allowed.
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'https://noteitai-testing.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.APP_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes('*')) return callback(null, true);
    if (corsOrigins.includes(origin)) return callback(null, true);
    if (defaultAllowedOrigins.includes(origin)) return callback(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
    if (/^https:\/\/.*\.onrender\.com$/.test(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-secret', 'Accept']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper to determine base backend URL dynamically from request when process.env.APP_URL is not set
const getBackendUrl = (req: express.Request) => {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const protocol = req.protocol || 'http';
  const hostHeader =
    (Array.isArray(req.headers['x-forwarded-host']) ? req.headers['x-forwarded-host'][0] : req.headers['x-forwarded-host']) ||
    req.get('host') ||
    '';
  // Only trust hosts that look like a real hostname[:port]. This blocks
  // header-injection / host-poisoning via crafted Host or x-forwarded-host
  // values in the dynamically generated self URLs.
  const safeHost = hostHeader.trim();
  if (/^[a-zA-Z0-9.-]+(:\d+)?$/.test(safeHost)) {
    return `${protocol}://${safeHost}`;
  }
  return `${protocol}://localhost:${PORT}`;
};


// Request logging middleware. Entries are buffered for the admin-gated
// /api/debug/logs endpoint; per-request origin/authorization echoes were
// removed to reduce log noise and avoid buffering user metadata.
app.use((req, res, next) => {
  console.log(`[REQUEST LOG] ${req.method} ${req.path}`);
  next();
});

// Set up local uploads fallback
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// AES-256-GCM Encryption / Decryption Setup
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'noteit-encryption-secret-default-key-32-chars-long-!!!';

function encryptKey(text: string): string {
  const iv = crypto.randomBytes(12); // GCM standard IV is 12 bytes
  const key = crypto.scryptSync(ENCRYPTION_SECRET, 'noteit-salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptKey(encryptedText: string): string {
  if (!encryptedText || typeof encryptedText !== 'string') {
    throw new Error('No API key string provided');
  }

  // If the string does not contain colons (not formatted as iv:authTag:encrypted),
  // it is an unencrypted plain API key string. Return it directly!
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    return encryptedText;
  }

  try {
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const key = crypto.scryptSync(ENCRYPTION_SECRET, 'noteit-salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[DECRYPT] Decryption of AI API key failed:', err);
    // Do NOT return the raw ciphertext as if it were a real key — silently
    // passing the encrypted blob upstream corrupts provider calls and hides
    // the real problem. Surface the failure instead.
    throw new Error('Decryption of AI API key failed');
  }
}

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  const start = key.slice(0, 6);
  const end = key.slice(-4);
  return `${start}...${end}`;
}

// AI Provider Abstraction endpoints
app.post('/api/ai/validate-key', authenticateFirebaseUser, async (req, res) => {
  const { key, apiKey, provider, model, label, isBackupOnly } = req.body;
  const inputKey = key || apiKey;
  const inputProvider = provider || 'gemini';

  if (!inputKey) {
    res.status(400).json({ error: 'Missing required parameter: key or apiKey' });
    return;
  }

  // Sanitize/map provider name
  let activeProvider = inputProvider.toLowerCase().trim();
  if (activeProvider === 'grok' || activeProvider === 'xai' || activeProvider === 'xai grok' || activeProvider === 'xai/grok') {
    activeProvider = 'xai';
  } else if (activeProvider === 'claude' || activeProvider === 'anthropic claude') {
    activeProvider = 'anthropic';
  } else if (activeProvider === 'nvidia' || activeProvider === 'glm' || activeProvider === 'nvidia nim') {
    activeProvider = 'nvidia';
  } else if (activeProvider === 'notion' || activeProvider === 'notion ai' || activeProvider === 'notion api' || activeProvider === 'notion-ai') {
    activeProvider = 'notion';
  }

  try {
    const adapter = ValidationAdapterFactory.getAdapter(inputProvider);
    await adapter.validate(inputKey, model);

    const user = req.body.user;
    const uid = user.uid;
    const encrypted = encryptKey(inputKey);

    const defaultModel = sanitizeModelName(model, activeProvider);
    const masked = maskApiKey(inputKey);
    const presetId = `key_${activeProvider}_${masked.replace(/[^a-zA-Z0-9]/g, '')}`;

    const newPreset = {
      id: presetId,
      provider: activeProvider,
      model: defaultModel,
      encryptedKey: encrypted,
      maskedKey: masked,
      label: label || `${activeProvider.toUpperCase()} (${defaultModel})`,
      savedAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString()
    };

    try {
      const adminDb = getFirestore();
      const userDocRef = adminDb.collection('users').doc(uid);
      const userSnap = await userDocRef.get().catch(() => null);
      const userData = userSnap && userSnap.exists ? userSnap.data() : {};

      const existingSavedKeys: any[] = Array.isArray(userData?.savedKeys) ? userData.savedKeys : [];
      const updatedSavedKeys = existingSavedKeys.filter(
        (k: any) => k.id !== presetId && !(k.provider === activeProvider && k.maskedKey === masked)
      );
      updatedSavedKeys.unshift(newPreset);

      const updateFields: any = {
        savedKeys: updatedSavedKeys
      };

      // Update active provider & key unless specifically adding as a non-active backup key
      if (!isBackupOnly) {
        updateFields.aiProvider = activeProvider;
        updateFields.providerConfigured = true;
        updateFields.providerLastValidated = new Date();
        updateFields.encryptedApiKey = encrypted;
        updateFields.selectedModel = defaultModel;
        updateFields.usageStats = { todayRequests: 0, estimatedTokens: 0, avgResponseTime: 0, failedRequests: 0, errors429: 0, errors503: 0 };
        updateFields.estimatedMonthlyTokens = 0;
        updateFields.lastHealthCheck = { status: 'Healthy', latency: 0, checkedAt: new Date() };

        if (activeProvider === 'gemini') {
          updateFields.encryptedGeminiTranscriptionKey = encrypted;
        }
      }

      await userDocRef.set(updateFields, { merge: true });
    } catch (fsErr) {
      console.warn('[validate-key] Local Firestore save skipped (no GCP ADC credentials):', fsErr);
    }

    res.json({ success: true, message: `${activeProvider} API key validated and saved to encrypted vault`, preset: newPreset });
  } catch (error: any) {
    console.error(`API key validation error for provider ${inputProvider}:`, error);
    if (error.name === 'ProviderValidationError') {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error validating key' });
    }
  }
});

// Endpoint to list saved API key presets (masked keys only)
app.get('/api/ai/saved-keys', authenticateFirebaseUser, async (req, res) => {
  try {
    const uid = req.body.user.uid;
    const adminDb = getFirestore();
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const data = userDoc.exists ? userDoc.data() : {};
    const savedKeys: any[] = Array.isArray(data?.savedKeys) ? data.savedKeys : [];
    const activeProvider = data?.aiProvider || 'gemini';
    const activeModel = data?.selectedModel || 'gemini-3.6-flash';

    const formatted = savedKeys.map((k: any) => ({
      id: k.id,
      provider: k.provider,
      model: k.model,
      maskedKey: k.maskedKey,
      label: k.label || `${k.provider.toUpperCase()} (${k.model})`,
      savedAt: k.savedAt,
      lastUsedAt: k.lastUsedAt,
      isActive: k.provider === activeProvider && k.model === activeModel
    }));

    res.json({ success: true, savedKeys: formatted, activeProvider, activeModel });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch saved API keys' });
  }
});

// Endpoint to 1-click switch active API key & model from saved presets
app.post('/api/ai/switch-saved-key', authenticateFirebaseUser, async (req, res) => {
  const { keyId } = req.body;
  if (!keyId) {
    res.status(400).json({ error: 'Missing required parameter: keyId' });
    return;
  }

  try {
    const uid = req.body.user.uid;
    const adminDb = getFirestore();
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User configuration not found' });
      return;
    }

    const data = userDoc.data() || {};
    const savedKeys: any[] = Array.isArray(data.savedKeys) ? data.savedKeys : [];
    const targetKey = savedKeys.find((k: any) => k.id === keyId);

    if (!targetKey) {
      res.status(404).json({ error: 'Saved API key preset not found in vault' });
      return;
    }

    // Verify key decryption works
    let decrypted = '';
    try {
      decrypted = decryptKey(targetKey.encryptedKey);
    } catch (e) {
      res.status(400).json({ error: 'Failed to decrypt saved API key' });
      return;
    }

    const updateFields: any = {
      aiProvider: targetKey.provider,
      selectedModel: targetKey.model,
      encryptedApiKey: targetKey.encryptedKey,
      providerConfigured: true,
      providerLastValidated: new Date()
    };

    if (targetKey.provider === 'gemini') {
      updateFields.encryptedGeminiTranscriptionKey = targetKey.encryptedKey;
    }

    const updatedSavedKeys = savedKeys.map((k: any) =>
      k.id === keyId ? { ...k, lastUsedAt: new Date().toISOString() } : k
    );
    updateFields.savedKeys = updatedSavedKeys;

    await userDocRef.set(updateFields, { merge: true });

    res.json({
      success: true,
      message: `Active AI provider switched to ${targetKey.provider.toUpperCase()} (${targetKey.model})`,
      provider: targetKey.provider,
      model: targetKey.model
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to switch API key' });
  }
});

// Endpoint to delete a saved API key preset
app.delete('/api/ai/saved-keys/:keyId', authenticateFirebaseUser, async (req, res) => {
  const { keyId } = req.params;
  try {
    const uid = req.body.user.uid;
    const adminDb = getFirestore();
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User configuration not found' });
      return;
    }

    const data = userDoc.data() || {};
    const savedKeys: any[] = Array.isArray(data.savedKeys) ? data.savedKeys : [];
    const updatedSavedKeys = savedKeys.filter((k: any) => k.id !== keyId);

    await userDocRef.set({ savedKeys: updatedSavedKeys }, { merge: true });

    res.json({ success: true, message: 'API key preset removed from vault' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete saved API key' });
  }
});

function getDefaultModelForProvider(provider?: string): string {
  const p = (provider || 'gemini').toLowerCase();
  if (p === 'openrouter') return 'google/gemini-2.0-flash-001';
  if (p === 'openai') return 'gpt-4o-mini';
  if (p === 'groq') return 'llama-3.3-70b-versatile';
  if (p === 'claude' || p === 'anthropic') return 'claude-3-5-sonnet-latest';
  if (p === 'deepseek') return 'deepseek-chat';
  if (p === 'grok' || p === 'xai') return 'grok-2';
  if (p === 'mistral') return 'mistral-large-latest';
  if (p === 'nvidia') return 'z-ai/glm-5.2';
  return 'gemini-3.6-flash';
}

function sanitizeModelName(model?: string, providerName?: string): string {
  const defaultModel = getDefaultModelForProvider(providerName);
  if (!model || !model.trim()) return defaultModel;
  const trimmed = model.trim().replace(/^models\//, '');

  // Detect if an API key string was accidentally passed as modelName
  if (
    trimmed.startsWith('sk-') ||
    trimmed.startsWith('sk-or-') ||
    trimmed.startsWith('AIza') ||
    trimmed.startsWith('gsk_') ||
    trimmed.startsWith('nvapi-') ||
    trimmed.startsWith('ms-') ||
    trimmed.startsWith('xai-') ||
    (trimmed.length > 40 && !trimmed.includes('/') && !trimmed.includes('-')) ||
    /^[a-zA-Z0-9_\-]{40,}$/.test(trimmed)
  ) {
    console.warn(`[sanitizeModelName] Detected API Key string passed as modelName ("${trimmed.slice(0, 12)}..."). Fallback to default model '${defaultModel}'.`);
    return defaultModel;
  }

  const p = (providerName || 'gemini').toLowerCase();
  if (p === 'gemini' || trimmed.includes('gemini-')) return 'gemini-3.6-flash';
  return trimmed;
}

const sendTranscriptionEvent = (res: express.Response, event: string, payload: Record<string, unknown>) => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
};

const getErrorText = async (response: Response): Promise<string> => {
  const body = await response.text().catch(() => '');
  return body ? `${response.status} - ${body}` : String(response.status);
};

app.post('/api/ai/transcribe-with-fallback', authenticateFirebaseUser, enforceAiUsage, async (req, res) => {
  const { base64Audio, mimeType = 'audio/webm', usePlatformQuota = false } = req.body;
  if (!base64Audio || typeof base64Audio !== 'string') {
    res.status(400).json({ error: 'Audio data is required for transcription.' });
    return;
  }

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const uid = req.body.user.uid;
    let storedGeminiKey = '';
    try {
      const userData = await getFirestore().collection('users').doc(uid).get();
      const data = userData.exists ? userData.data() : null;
      const rawStoredKey = data?.encryptedGeminiTranscriptionKey ||
        (data?.aiProvider === 'gemini' ? data?.encryptedApiKey : '');
      if (rawStoredKey) storedGeminiKey = decryptKey(rawStoredKey);
    } catch (dbError) {
      console.warn('[transcribe-with-fallback] Could not load stored Gemini key:', dbError);
    }

    const effectiveGeminiKey = (storedGeminiKey || (canUseServerFallback(usePlatformQuota) ? process.env.GEMINI_API_KEY : '') || '').trim();

    if (!effectiveGeminiKey) {
      throw new Error('Gemini API key is not configured. Please configure an API key in Settings.');
    }

    sendTranscriptionEvent(res, 'progress', { provider: 'gemini', message: 'Transcribing audio with Gemini AI…' });
    const gemini = ProviderFactory.getProvider('gemini', effectiveGeminiKey);
    const transcript = (await gemini.transcribeAudio(base64Audio, mimeType, 'gemini-3.6-flash')).trim();
    if (!transcript) throw new Error('Gemini returned an empty transcript.');
    sendTranscriptionEvent(res, 'result', { transcript, provider: 'gemini' });
  } catch (error: any) {
    console.error('[transcribe-with-fallback] Transcription failed:', error);
    sendTranscriptionEvent(res, 'error', { error: error?.message || 'Audio transcription failed.' });
  } finally {
    res.end();
  }
});

app.post('/api/ai/provider-proxy', authenticateFirebaseUser, enforceAiUsage, async (req, res) => {
  const { prompt, model, inlineData, responseSchema, action, usePlatformQuota = false } = req.body;
  const user = req.body.user;
  const uid = user.uid;
  
  const startTime = Date.now();
  let data: any = null;

  try {
    try {
      const adminDb = getFirestore();
      const userDocRef = adminDb.collection('users').doc(uid);
      const userDoc = await withTimeout(userDocRef.get(), 5000, 'Firestore read timed out (no credentials?)');
      data = userDoc.exists ? userDoc.data() : null;

      // Automatic legacy migration
      if (data && !data.providerConfigured && (data.geminiApiKey || data.openaiApiKey)) {
        const isOp = !!data.openaiApiKey;
        const keyToMigrate = isOp ? data.openaiApiKey : data.geminiApiKey;
        const provToMigrate = isOp ? 'openai' : 'gemini';
        const modelToMigrate = isOp ? 'gpt-4o-mini' : 'gemini-3.6-flash';
        
        const migrationFields = {
          aiProvider: provToMigrate,
          providerConfigured: true,
          encryptedApiKey: encryptKey(keyToMigrate),
          selectedModel: modelToMigrate,
          providerLastValidated: data.geminiLastValidated || new Date(),
          estimatedMonthlyTokens: 0,
          usageStats: { todayRequests: 0, estimatedTokens: 0, avgResponseTime: 0, failedRequests: 0, errors429: 0, errors503: 0 },
          lastHealthCheck: { status: 'Healthy', latency: 0, checkedAt: new Date() }
        };
        
        await userDocRef.set(migrationFields, { merge: true });
        data = { ...data, ...migrationFields };
      }
    } catch (fsErr) {
      console.warn('[provider-proxy] Firestore read skipped (no GCP ADC credentials):', fsErr);
    }

    const usingPlatformQuota = !data?.encryptedApiKey && canUseServerFallback(usePlatformQuota);
    const rawKey = data?.encryptedApiKey || (usingPlatformQuota ? process.env.GEMINI_API_KEY : '');

    if (!rawKey) {
      res.status(400).json({ error: 'AI provider is not configured. Add your own key in Settings, or explicitly enable the available platform quota.' });
      return;
    }

    const providerName = data?.aiProvider || 'gemini';
    res.setHeader('X-NoteIT-AI-Key-Source', usingPlatformQuota ? 'platform-quota' : 'user-byok');
    const selectedModel = sanitizeModelName(model || data?.selectedModel || ProviderFactory.getAvailableModels(providerName)[0], providerName);

    let decryptedKey: string;
    try {
      decryptedKey = decryptKey(rawKey);
    } catch (decryptErr) {
      console.warn('Decryption error in provider-proxy, using raw key fallback:', decryptErr);
      decryptedKey = rawKey;
    }

    const providerInstance = ProviderFactory.getProvider(providerName, decryptedKey);
    
    let result: any;
    let actualAction = action;
    if (!actualAction) {
      if (inlineData) {
        actualAction = 'transcribeAudio';
      } else if (responseSchema) {
        actualAction = 'generateStructuredOutput';
      } else {
        actualAction = 'generateText';
      }
    }
    
    console.log(`\n[provider-proxy] 🚀 Executing "${actualAction}" using Provider: ${providerName.toUpperCase()} (Model: ${selectedModel})\n`);

    const executeProxyCall = async (provider: any, modelToUse: string) => {
      if (actualAction === 'transcribeAudio') {
        const base64 = inlineData?.data || req.body.base64Audio;
        const mType = inlineData?.mimeType || req.body.mimeType || 'audio/webm';
        return await provider.transcribeAudio(base64, mType, modelToUse);
      } else if (actualAction === 'generateStructuredOutput') {
        return await provider.generateStructuredOutput(prompt, responseSchema, modelToUse);
      } else if (actualAction === 'generateQuiz') {
        return await provider.generateQuiz(prompt, modelToUse);
      } else if (actualAction === 'generateMindMap') {
        return await provider.generateMindMap(prompt, modelToUse);
      } else if (actualAction === 'generateFlashcards') {
        return await provider.generateFlashcards(prompt, modelToUse);
      } else if (actualAction === 'generatePresentation') {
        return await provider.generatePresentation(prompt, modelToUse);
      } else if (actualAction === 'generateNotes') {
        return await provider.generateNotes(prompt, modelToUse);
      } else {
        return await provider.generateText(prompt, modelToUse);
      }
    };

    try {
      result = await executeProxyCall(providerInstance, selectedModel);
    } catch (primaryErr: any) {
      const isRateLimitOrQuota = primaryErr?.status === 429 || primaryErr?.status === 402 || primaryErr?.status === 503 ||
        /429|quota|rate limit|resource_exhausted|too many requests|credit limit/i.test(primaryErr?.message || '');

      let retrySuccess = false;

      // Tier 1: Check user's encrypted saved backup keys first
      if (isRateLimitOrQuota && data?.savedKeys && Array.isArray(data.savedKeys)) {
        const backupPresets = data.savedKeys.filter((k: any) => k.encryptedKey !== rawKey && k.encryptedKey !== data?.encryptedApiKey);
        for (const backupKeyPreset of backupPresets) {
          try {
            const backupDecrypted = decryptKey(backupKeyPreset.encryptedKey);
            console.warn(`[provider-proxy] Active key rate limited (${primaryErr?.status || 'quota'}). Retrying with user saved backup key (${backupKeyPreset.provider.toUpperCase()} - ${backupKeyPreset.model})...`);
            const backupProviderInstance = ProviderFactory.getProvider(backupKeyPreset.provider, backupDecrypted);
            result = await executeProxyCall(backupProviderInstance, backupKeyPreset.model);
            retrySuccess = true;
            break;
          } catch (backupErr: any) {
            console.warn(`[provider-proxy] Saved backup key (${backupKeyPreset.provider}) also failed:`, backupErr?.message || backupErr);
          }
        }
      }

      // Tier 2: Server platform key fallback
      if (!retrySuccess && isRateLimitOrQuota && canUseServerFallback(usePlatformQuota)) {
        const fallbackKey = process.env.GEMINI_API_KEY;
        if (fallbackKey && decryptedKey !== fallbackKey) {
          try {
            console.warn(`[provider-proxy] Primary provider (${providerName}) rate limited. Executing automatic server platform key fallback...`);
            const fallbackProvider = ProviderFactory.getProvider('gemini', fallbackKey);
            result = await executeProxyCall(fallbackProvider, 'gemini-3.6-flash');
            retrySuccess = true;
          } catch (fbErr) {
            throw primaryErr;
          }
        } else {
          throw primaryErr;
        }
      } else if (!retrySuccess) {
        throw primaryErr;
      }
    }

    const latency = Date.now() - startTime;
    const responseString = typeof result === 'string' ? result : JSON.stringify(result);
    const tokenUsage = providerInstance.estimateTokenUsage(prompt || '', responseString);

    const currentStats = (data && data.usageStats) ? data.usageStats : { todayRequests: 0, estimatedTokens: 0, avgResponseTime: 0, failedRequests: 0, errors429: 0, errors503: 0 };
    const newRequests = (currentStats.todayRequests || 0) + 1;
    const newTotalTokens = (currentStats.estimatedTokens || 0) + tokenUsage.totalTokens;
    const newAvgTime = (((currentStats.avgResponseTime || 0) * (newRequests - 1)) + (latency / 1000)) / newRequests;
    
    const updatedStats = {
      ...currentStats,
      todayRequests: newRequests,
      estimatedTokens: newTotalTokens,
      avgResponseTime: parseFloat(newAvgTime.toFixed(2))
    };

    const monthlyTokens = ((data && data.estimatedMonthlyTokens) || 0) + tokenUsage.totalTokens;

    try {
      if (data) {
        const adminDb = getFirestore();
        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.set({
          usageStats: updatedStats,
          estimatedMonthlyTokens: monthlyTokens,
          lastHealthCheck: {
            status: 'Healthy',
            latency,
            checkedAt: new Date()
          }
        }, { merge: true });
      }
    } catch (fsErr) {
      console.warn('[provider-proxy] Stats save skipped (no GCP ADC credentials):', fsErr);
    }

    res.json(result);
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error('AI Proxy request failed:', error);
    const status = error.status || 500;
    const message = error.message || 'Internal server error in AI proxy';

    let errorType = 'other';
    if (status === 429) errorType = '429';
    else if (status === 503) errorType = '503';

    try {
      if (data) {
        const adminDb = getFirestore();
        const userDocRef = adminDb.collection('users').doc(uid);
        const d = data;
        const currentStats = d?.usageStats || { todayRequests: 0, estimatedTokens: 0, avgResponseTime: 0, failedRequests: 0, errors429: 0, errors503: 0 };
        const updatedStats = {
          ...currentStats,
          failedRequests: (currentStats.failedRequests || 0) + 1,
          errors429: errorType === '429' ? (currentStats.errors429 || 0) + 1 : (currentStats.errors429 || 0),
          errors503: errorType === '503' ? (currentStats.errors503 || 0) + 1 : (currentStats.errors503 || 0)
        };

        const healthStatus = errorType === '429' ? 'Rate Limited' : (errorType === '503' ? 'Service Unavailable' : 'Invalid Key');
        
        await userDocRef.set({
          usageStats: updatedStats,
          lastHealthCheck: {
            status: healthStatus,
            latency,
            checkedAt: new Date()
          }
        }, { merge: true });
      }
    } catch (dbErr) {
      console.error('Failed to write failure stats:', dbErr);
    }

    if (status === 429) {
      res.status(429).json({ error: 'Your API key is invalid or quota has been exhausted. Please update your key in Settings.' });
      return;
    }
    if (status === 401 || status === 403) {
      res.status(403).json({ error: 'Your API key is invalid or quota has been exhausted. Please update your key in Settings.' });
      return;
    }
    res.status(status).json({ error: message });
  }
});

app.get('/api/ai/config-status', authenticateFirebaseUser, async (req, res) => {
  const user = req.body.user;
  const uid = user.uid;

  try {
    let data: any = null;
    try {
      const adminDb = getFirestore();
      const userDocRef = adminDb.collection('users').doc(uid);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        data = userDoc.data();
      }

      // Migration logic
      if (data && !data.providerConfigured && (data.geminiApiKey || data.openaiApiKey)) {
        const isOp = !!data.openaiApiKey;
        const keyToMigrate = isOp ? data.openaiApiKey : data.geminiApiKey;
        const provToMigrate = isOp ? 'openai' : 'gemini';
        const modelToMigrate = isOp ? 'gpt-4o-mini' : 'gemini-3.6-flash';
        
        const migrationFields = {
          aiProvider: provToMigrate,
          providerConfigured: true,
          encryptedApiKey: encryptKey(keyToMigrate),
          // Clear legacy plaintext fields as part of the one-time migration.
          geminiApiKey: '',
          openaiApiKey: '',
          selectedModel: modelToMigrate,
          providerLastValidated: data.geminiLastValidated || new Date(),
          estimatedMonthlyTokens: 0,
          usageStats: { todayRequests: 0, estimatedTokens: 0, avgResponseTime: 0, failedRequests: 0, errors429: 0, errors503: 0 },
          lastHealthCheck: { status: 'Healthy', latency: 0, checkedAt: new Date() }
        };
        
        await userDocRef.set(migrationFields, { merge: true });
        data = { ...data, ...migrationFields };
      }
    } catch (fsErr) {
      console.warn('[config-status] Firestore read skipped (no GCP ADC credentials):', fsErr);
    }

    if (!data || !data.providerConfigured) {
      res.json({
        configured: false,
        keySource: 'none',
        platformQuotaAvailable: process.env.ALLOW_SERVER_AI_FALLBACK === 'true' && Boolean(process.env.GEMINI_API_KEY)
      });
      return;
    }

    const provider = data.aiProvider || 'gemini';
    const encryptedKey = data.encryptedApiKey;
    let maskedKey = '';

    if (encryptedKey) {
      try {
        const decrypted = decryptKey(encryptedKey);
        if (decrypted.length > 7) {
          maskedKey = `${decrypted.substring(0, 4)}************${decrypted.substring(decrypted.length - 3)}`;
        } else {
          maskedKey = 'Key too short';
        }
      } catch (decryptErr) {
        maskedKey = 'Decryption error';
      }
    }

    res.json({
      configured: true,
      keySource: 'user-byok',
      platformQuotaAvailable: process.env.ALLOW_SERVER_AI_FALLBACK === 'true' && Boolean(process.env.GEMINI_API_KEY),
      provider,
      maskedKey,
      lastValidated: data.providerLastValidated || data.geminiLastValidated || null,
      selectedModel: data.selectedModel || '',
      usageStats: data.usageStats || { todayRequests: 0, estimatedTokens: 0, avgResponseTime: 0, failedRequests: 0, errors429: 0, errors503: 0 },
      estimatedMonthlyTokens: data.estimatedMonthlyTokens || 0,
      lastHealthCheck: data.lastHealthCheck || { status: 'Healthy', latency: 0, checkedAt: new Date() }
    });
  } catch (error: any) {
    console.error('Error fetching config status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ai/revalidate', authenticateFirebaseUser, async (req, res) => {
  const user = req.body.user;
  const uid = user.uid;

  try {
    let data: any = null;
    try {
      const adminDb = getFirestore();
      const userDocRef = adminDb.collection('users').doc(uid);
      const userDoc = await userDocRef.get();
      if (userDoc.exists) data = userDoc.data();
    } catch (fsErr) {
      console.warn('[revalidate] Firestore read skipped/failed:', fsErr);
    }

    if (!data || !data.providerConfigured) {
      res.status(400).json({ error: 'AI provider is not configured. Nothing to validate.' });
      return;
    }

    const provider = data?.aiProvider || 'gemini';
    const encryptedKey = data?.encryptedApiKey;

    if (!encryptedKey) {
      res.status(400).json({ error: 'API key is not configured.' });
      return;
    }

    const decryptedKey = decryptKey(encryptedKey);
    const providerInstance = ProviderFactory.getProvider(provider, decryptedKey);
    const isValid = await providerInstance.validateKey();

    if (!isValid) {
      res.status(400).json({ error: `The configured API key is no longer valid.` });
      return;
    }

    try {
      const adminDb = getFirestore();
      await adminDb.collection('users').doc(uid).set({ providerLastValidated: new Date() }, { merge: true });
    } catch (fsErr) {}

    res.json({ success: true, message: 'API key revalidated successfully.' });
  } catch (error: any) {
    console.error('Error revalidating key:', error);
    res.status(400).json({ error: error.message || 'Error revalidating key' });
  }
});

app.delete('/api/ai/config', authenticateFirebaseUser, async (req, res) => {
  const user = req.body.user;
  const uid = user.uid;

  try {
    try {
      const adminDb = getFirestore();
      const userDocRef = adminDb.collection('users').doc(uid);
      await userDocRef.set({
        geminiApiKey: '',
        openaiApiKey: '',
        encryptedApiKey: '',
        encryptedGeminiTranscriptionKey: '',
        providerConfigured: false,
        providerLastValidated: null,
        selectedModel: '',
        estimatedMonthlyTokens: 0,
        usageStats: null,
        lastHealthCheck: null
      }, { merge: true });
    } catch (fsErr) {
      console.warn('[delete-config] Firestore update skipped/failed:', fsErr);
    }

    res.json({ success: true, message: 'AI API key configuration removed successfully' });
  } catch (error: any) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to chunk long transcripts and prevent 413 Payload Too Large errors
function chunkTranscriptText(text: string, chunkSize = 9000, overlap = 500): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }
  const chunks: string[] = [];
  let startIndex = 0;
  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex < text.length) {
      const lastSpace = text.lastIndexOf(' ', endIndex);
      if (lastSpace > startIndex + chunkSize / 2) {
        endIndex = lastSpace;
      }
    }
    chunks.push(text.slice(startIndex, endIndex));
    startIndex = endIndex - overlap;
  }
  return chunks;
}

// Dedicated endpoint to generate / retry AI academic resources from existing transcript
app.post(['/api/lectures/:lectureId/generate-resources', '/api/lectures/generate-resources'], authenticateFirebaseUser, enforceAiUsage, async (req, res) => {
  const user = req.body.user;
  const uid = user.uid;
  const lectureId = req.params.lectureId || req.body.lectureId;
  const { options, usePlatformQuota = false } = req.body;
  const mode = options?.mode || 'academic';
  const modeType = options?.modeType || 'missing'; // 'missing' or 'all'

  if (!lectureId) {
    res.status(400).json({ error: 'Missing required parameter: lectureId' });
    return;
  }

  let lectureData: any = {};
  let userData: any = null;
  let lectureRef: any = null;
  let userDocRef: any = null;

  try {
    const adminDb = getFirestore();
    lectureRef = adminDb.collection('users').doc(uid).collection('lectures').doc(lectureId);
    userDocRef = adminDb.collection('users').doc(uid);

    try {
      const lectureSnap: any = await withTimeout(lectureRef.get(), 5000, 'Firestore lecture read timed out');
      if (lectureSnap.exists) {
        lectureData = lectureSnap.data() || {};
      }
    } catch (fsErr) {
      console.warn('[GENERATE-RESOURCES] Firestore lecture read skipped/failed:', fsErr);
    }

    try {
      const userDoc: any = await withTimeout(userDocRef.get(), 5000, 'Firestore user read timed out');
      if (userDoc.exists) {
        userData = userDoc.data() || null;
      }
    } catch (fsErr) {
      console.warn('[GENERATE-RESOURCES] Firestore user read skipped/failed:', fsErr);
    }

    const transcriptText = req.body.transcript || req.body.cleanTranscript || lectureData.cleanTranscript || lectureData.transcript || '';

    if (!transcriptText || transcriptText.trim().length === 0) {
      res.status(400).json({ error: 'Transcript is not available. Please transcribe the lecture first.' });
      return;
    }

    // Set resource generation status to processing
    try {
      if (lectureRef) {
        await lectureRef.set({
          resourceGenerationStatus: 'processing',
          resourceGenerationError: null,
          updatedAt: new Date()
        }, { merge: true });
      }
    } catch (fsErr) {
      console.warn('[GENERATE-RESOURCES] Firestore status update skipped/failed:', fsErr);
    }

    const usingPlatformQuota = !userData?.encryptedApiKey && canUseServerFallback(usePlatformQuota);
    const rawKey = userData?.encryptedApiKey || (usingPlatformQuota ? process.env.GEMINI_API_KEY : '');

    if (!rawKey) {
      const errMsg = 'AI provider API key is not configured. Please add your own key in Settings, or explicitly enable the available platform quota.';
      try {
        if (lectureRef) {
          await lectureRef.set({
            resourceGenerationStatus: 'failed',
            resourceGenerationError: {
              code: '400',
              message: errMsg,
              provider: userData?.aiProvider || 'none',
              timestamp: new Date()
            },
            updatedAt: new Date()
          }, { merge: true });
        }
      } catch (fsErr) {
        console.warn('[GENERATE-RESOURCES] Firestore error status set skipped/failed:', fsErr);
      }

      res.status(400).json({ error: errMsg });
      return;
    }

    const providerName = userData?.aiProvider || 'gemini';
    res.setHeader('X-NoteIT-AI-Key-Source', usingPlatformQuota ? 'platform-quota' : 'user-byok');
    const selectedModel = sanitizeModelName(options?.model || userData?.selectedModel || ProviderFactory.getAvailableModels(providerName)[0], providerName);

    let decryptedKey: string;
    try {
      decryptedKey = decryptKey(rawKey);
    } catch (decryptErr) {
      console.warn('Decryption error in generate-resources, using raw key fallback:', decryptErr);
      decryptedKey = rawKey;
    }

    const providerInstance = ProviderFactory.getProvider(providerName, decryptedKey);

    // OpenRouter Secondary Preprocessing Layer (Internal AI Optimization)
    let aiAnalysis = null;
    try {
      const adminDb = getFirestore();
      aiAnalysis = await InternalAIService.getOrAnalyzeLectureTranscript(uid, lectureId, transcriptText, adminDb);
    } catch (openRouterErr) {
      console.warn('[GENERATE-RESOURCES] OpenRouter preprocessing skipped or failed:', openRouterErr);
    }

    let sourceText = transcriptText;

    if (aiAnalysis) {
      console.log(`[GENERATE-RESOURCES] Utilizing OpenRouter structured aiAnalysis for Gemini resource generation (${mode}).`);
      sourceText = buildOptimizedContextForResource(aiAnalysis, mode);
    } else {
      console.log(`[GENERATE-RESOURCES] OpenRouter analysis unavailable. Using raw transcript pipeline.`);
      // Chunking fallback logic for extremely large transcripts (>250k chars) when OpenRouter is unavailable
      if (transcriptText.length > 250000) {
        console.log(`[CHUNK] Transcript length (${transcriptText.length} chars) exceeds threshold. Chunking...`);
        const chunks = chunkTranscriptText(transcriptText, 30000, 1000);
        const chunkSummaries: string[] = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunkPrompt = `Summarize the following lecture section (Chunk ${i + 1} of ${chunks.length}) in detailed academic bullet points:\n\n${chunks[i]}`;
          try {
            const chunkRes = await providerInstance.generateText(chunkPrompt, selectedModel);
            chunkSummaries.push(`--- Chunk ${i + 1} ---\n${chunkRes}`);
          } catch (cErr) {
            console.warn(`[CHUNK] Failed to process chunk ${i + 1}, using fallback snippet:`, cErr);
            chunkSummaries.push(`--- Chunk ${i + 1} ---\n${chunks[i]}`);
          }
        }
        sourceText = chunkSummaries.join('\n\n');
      }
    }


    // Check existing resources if modeType === 'missing'
    const needsSummary = modeType === 'all' || !lectureData.summary;
    const needsNotes = modeType === 'all' || !lectureData.notes || (Array.isArray(lectureData.notes) && lectureData.notes.length === 0);
    const needsFlashcards = modeType === 'all' || !lectureData.flashcards || lectureData.flashcards.length === 0;
    const needsQuiz = modeType === 'all' || !lectureData.quiz || lectureData.quiz.length === 0;
    const needsKeyConcepts = modeType === 'all' || !lectureData.keyConcepts || lectureData.keyConcepts.length === 0;
    const needsWeakTopics = modeType === 'all' || !lectureData.weakTopics || lectureData.weakTopics.length === 0;
    const needsTimeline = modeType === 'all' || !lectureData.timeline || lectureData.timeline.length === 0;
    const needsSourceIntelligence = modeType === 'all' || !lectureData.sourceIntelligence;

    const prompt = `
      You are an elite university professor, learning designer, and textbook author. Generate accurate, exam-useful study resources from the provided lecture content.
      Active Mode: ${mode}

      NON-NEGOTIABLE QUALITY STANDARD:
      The output must let a student who missed the lecture learn, understand, and revise the material. Prefer clear explanations over vague labels, preserve every taught definition, condition, formula, procedure, comparison, and worked example, and remove only filler, repetition, greetings, and administration.

      RULES FOR NOTES:
      - Do NOT include any timestamp tags or source chips (such as [Source: Timestamp 00:08] or [00:08]).
      - Return one notes array item per genuinely distinct major concept, in the same logical order as the lecture. Do not create a generic item called "Notes", "Introduction", or "Key Points".
      - Each notes item title must be a precise student-facing concept name. Each notes item content must be substantial Markdown, normally 120–350 words when source coverage permits, with short paragraphs and bullets—not a transcript rewrite or a one-line summary.
      - Within each concept, use only applicable Markdown subsections such as "Definition", "Explanation", "How it works" or "Process / Steps", "Example", "Formula", "Comparison", and "Common confusion". Explain the relationship between ideas, not just their names.
      - For a process, give ordered, complete steps. For a formula, include the equation, define each symbol, and explain when it is used. For a comparison, use a Markdown table only when two or more approaches are actually contrasted. For an example, preserve the lecture's given values and reasoning; never fabricate one.
      - End the final concept's content with a "Revision checklist" subsection followed by 3–6 compact recall prompts only if the source supports them.
      - Eliminate speech noise, stutters, filler words, repeated claims, and administrative content.
      - Adapt layout dynamically: use Markdown tables for comparisons, formatted math notation for equations, and step-by-step lists for processes.
      - Stay 100% grounded in the lecture context without hallucinating external facts.
      - Do not leave a concept underexplained merely to make the answer shorter. If the lecture is thin or unclear, state only what it establishes rather than guessing.

      RULES FOR SUMMARY:
      - Write a compact but information-dense overview (3–6 sentences) that connects the main concepts and names the learning outcome. It must add value beyond repeating headings.

      Content to process:
      ${sourceText}

      Return a JSON object matching the requested schema.
    `;

    const schema = {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING' },
        notes: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              content: { type: 'STRING' }
            },
            required: ['title', 'content']
          }
        },
        flashcards: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              q: { type: 'STRING' },
              a: { type: 'STRING' },
              category: { type: 'STRING' }
            },
            required: ['q', 'a']
          }
        },
        quiz: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctAnswer: { type: 'INTEGER' },
              explanation: { type: 'STRING' },
              sourceCitation: { type: 'STRING' }
            },
            required: ['question', 'options', 'correctAnswer', 'explanation', 'sourceCitation']
          }
        },
        keyConcepts: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              id: { type: 'STRING' },
              label: { type: 'STRING' },
              desc: { type: 'STRING' },
              parent: { type: 'STRING' },
              x: { type: 'INTEGER' },
              y: { type: 'INTEGER' },
              group: { type: 'STRING' },
              examples: { type: 'STRING' },
              formula: { type: 'STRING' },
              applications: { type: 'STRING' }
            },
            required: ['id', 'label', 'desc', 'x', 'y', 'group']
          }
        },
        weakTopics: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              topicName: { type: 'STRING' },
              subject: { type: 'STRING' },
              aiDiagnosis: { type: 'STRING' },
              actionPlan: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['topicName', 'subject', 'aiDiagnosis', 'actionPlan']
          }
        },
        timeline: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              time: { type: 'STRING' },
              title: { type: 'STRING' },
              description: { type: 'STRING' }
            },
            required: ['time', 'title', 'description']
          }
        },
        sourceIntelligence: {
          type: 'OBJECT',
          properties: {
            keyPeople: { type: 'ARRAY', items: { type: 'STRING' } },
            keyTerms: { type: 'ARRAY', items: { type: 'STRING' } },
            formulas: { type: 'ARRAY', items: { type: 'STRING' } },
            dates: { type: 'ARRAY', items: { type: 'STRING' } },
            statistics: { type: 'ARRAY', items: { type: 'STRING' } },
            references: { type: 'ARRAY', items: { type: 'STRING' } }
          },
          required: ['keyPeople', 'keyTerms', 'formulas', 'dates', 'statistics', 'references']
        }
      },
      required: ['summary', 'notes', 'flashcards', 'quiz', 'keyConcepts', 'weakTopics', 'timeline', 'sourceIntelligence']
    };

    let generated: any;
    try {
      generated = await providerInstance.generateStructuredOutput(prompt, schema, selectedModel);
    } catch (primaryErr: any) {
      const isRateLimitOrQuota = primaryErr?.status === 429 || primaryErr?.status === 402 || primaryErr?.status === 503 ||
        /429|quota|rate limit|resource_exhausted|too many requests|credit limit/i.test(primaryErr?.message || '');

      const fallbackKey = process.env.GEMINI_API_KEY;
      if (isRateLimitOrQuota && canUseServerFallback(usePlatformQuota) && fallbackKey && decryptedKey !== fallbackKey) {
        console.warn('[GENERATE-RESOURCES] Primary AI Provider rate limited/quota error. Executing automatic server platform key fallback...');
        const fallbackProvider = ProviderFactory.getProvider('gemini', fallbackKey);
        generated = await fallbackProvider.generateStructuredOutput(prompt, schema, 'gemini-3.6-flash');
      } else {
        throw primaryErr;
      }
    }

    const updatedFields: any = {
      resourceGenerationStatus: 'completed',
      resourceGenerationError: null,
      status: 'generated',
      lastGenerationProvider: providerName,
      lastGenerationModel: selectedModel,
      lastGeneratedAt: new Date(),
      updatedAt: new Date()
    };

    if (needsSummary && generated.summary) {
      updatedFields.summary = generated.summary;
      updatedFields.summaries = {
        ...(lectureData?.summaries || {}),
        quick_revision: generated.summary,
        academic_format: generated.summary,
        detailed_notes: generated.summary
      };
    }
    if (needsNotes && generated.notes) {
      updatedFields.notes = generated.notes;
      if (Array.isArray(generated.notes)) {
        updatedFields.sections = generated.notes;
      }
    }
    if (needsFlashcards && generated.flashcards) updatedFields.flashcards = generated.flashcards;
    if (needsQuiz && generated.quiz) {
      updatedFields.quiz = generated.quiz;
      updatedFields.quizzes = generated.quiz;
    }
    if (needsKeyConcepts && generated.keyConcepts) updatedFields.keyConcepts = generated.keyConcepts;
    if (needsWeakTopics && generated.weakTopics) updatedFields.weakTopics = generated.weakTopics;
    if (needsTimeline && generated.timeline) updatedFields.timeline = generated.timeline;
    if (needsSourceIntelligence && generated.sourceIntelligence) updatedFields.sourceIntelligence = generated.sourceIntelligence;

    await lectureRef.set(updatedFields, { merge: true });

    res.json({
      success: true,
      lectureId,
      resources: updatedFields
    });
  } catch (error: any) {
    console.error('[GENERATE-RESOURCES] Error generating resources:', error);
    const status = error.status || (error.message?.includes('429') ? 429 : error.message?.includes('503') ? 503 : 500);
    const message = formatUserFriendlyErrorMessage(error, "AI resource generation failed");
    const provider = userData?.aiProvider || 'unknown';

    try {
      await lectureRef.set({
        resourceGenerationStatus: 'failed',
        resourceGenerationError: {
          code: String(status),
          message,
          provider,
          timestamp: new Date()
        },
        updatedAt: new Date()
      }, { merge: true });
    } catch (dbErr) {
      console.error('[GENERATE-RESOURCES] Failed to update error status in Firestore:', dbErr);
    }

    res.status(status).json({
      error: message,
      code: String(status),
      provider
    });
  }
});

// Dedicated endpoint for Bhai Lang contextual text explanations
app.post('/api/ai/explain-bhailang', authenticateFirebaseUser, enforceAiUsage, async (req, res) => {
  try {
    const { text, subjectName, usePlatformQuota = false } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text selection is required.' });
    }

    const user = req.body.user;
    const uid = user?.uid;
    let data: any = null;
    if (uid) {
      try {
        const adminDb = getFirestore();
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (userDoc.exists) data = userDoc.data();
      } catch (fsErr) {}
    }

    const usingPlatformQuota = !data?.encryptedApiKey && canUseServerFallback(usePlatformQuota);
    const rawKey = data?.encryptedApiKey || (usingPlatformQuota ? process.env.GEMINI_API_KEY : '') || '';

    if (!rawKey) {
      return res.status(400).json({ error: 'AI provider key is not configured. Please add your own key in Settings.' });
    }

    const providerName = data?.aiProvider || 'gemini';
    res.setHeader('X-NoteIT-AI-Key-Source', usingPlatformQuota ? 'platform-quota' : 'user-byok');
    let decryptedKey = rawKey;
    try {
      decryptedKey = decryptKey(rawKey);
    } catch (e) {}

    const prompt = `You are NoteIT AI's friendly, genius engineering senior/mentor.
Explain the following concept or text snippet in natural, ultra-intuitive Indian student Hinglish (Bhai Lang format).

RULES:
1. Start with "Bhai simple bolu toh:" or similar natural greeting.
2. Explain the concept using a relatable real-world example or everyday analogy.
3. Preserve 100% of technical accuracy and core formulas/terms.
4. Use casual, clear, friendly Hinglish (mix of natural Hindi + English technical terms).
5. Keep it concise, engaging, and easy to memorize for an exam!

Subject: ${subjectName || 'Engineering'}
Text snippet to explain:
"${text.trim().slice(0, 1500)}"`;

    const providerInstance = ProviderFactory.getProvider(providerName, decryptedKey);
    const selectedModel = sanitizeModelName(data?.selectedModel, providerName);
    const explanation = await providerInstance.generateText(prompt, selectedModel);

    res.json({ explanation });
  } catch (err: any) {
    console.error('[BHAI-LANG] Error generating explanation:', err);
    const status = err.status || (err.name === 'ProviderValidationError' ? 400 : 500);
    res.status(status).json({ error: formatUserFriendlyErrorMessage(err, 'Failed to generate Bhai Lang explanation') });
  }
});

// Dedicated endpoint to manually trigger or re-run OpenRouter preprocessing
app.post('/api/lectures/:lectureId/preprocess', authenticateFirebaseUser, enforceAiUsage, async (req, res) => {
  const user = req.body.user;
  const uid = user.uid;
  const lectureId = req.params.lectureId;
  const transcriptText = req.body.transcript || '';

  if (!lectureId) {
    res.status(400).json({ error: 'Missing lectureId parameter' });
    return;
  }

  try {
    const adminDb = getFirestore();

    // If transcript is not passed directly, attempt to fetch from Firestore
    let textToProcess = transcriptText;
    if (!textToProcess) {
      const lectureSnap = await adminDb.collection('users').doc(uid).collection('lectures').doc(lectureId).get();
      if (lectureSnap.exists) {
        const data = lectureSnap.data();
        textToProcess = data?.cleanTranscript || data?.transcript || '';
      }
    }

    if (!textToProcess) {
      res.status(400).json({ error: 'No transcript text available for preprocessing' });
      return;
    }

    const analysis = await InternalAIService.getOrAnalyzeLectureTranscript(uid, lectureId, textToProcess, adminDb);
    if (!analysis) {
      res.status(500).json({ error: 'OpenRouter preprocessing failed or API key not configured.' });
      return;
    }

    res.json({ success: true, aiAnalysis: analysis });
  } catch (err: any) {
    console.error('[PREPROCESS] Error:', err);
    res.status(500).json({ error: err?.message || 'Preprocessing failed' });
  }
});


// Health check endpoint for Render monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper to format Firebase private key robustly (supporting quotes, escaped newlines, and spaces)
function formatFirebasePrivateKey(key: string): string {
  let cleanKey = key.trim().replace(/^["']|["']$/g, '');
  cleanKey = cleanKey.replace(/\\n/g, '\n');
  if (!cleanKey.includes('\n')) {
    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';
    if (cleanKey.startsWith(header) && cleanKey.endsWith(footer)) {
      const base64Part = cleanKey
        .slice(header.length, cleanKey.length - footer.length)
        .replace(/\s+/g, '');
      cleanKey = `${header}\n${base64Part}\n${footer}`;
    }
  }
  return cleanKey;
}

// Initialize Firebase Admin SDK
try {
  if (getApps().length) {
    console.log('Firebase Admin was already initialized by the authentication middleware.');
  } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log('Initializing Firebase Admin using environment variables...');
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
    const resolvedPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
    console.log(`Initializing Firebase Admin with Service Account from: ${resolvedPath}`);
    initializeApp({
      credential: cert(resolvedPath),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    console.log('Initializing Firebase Admin with default credentials or project ID...');
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else {
    console.warn('Firebase Admin is running without configured credentials. Set FIREBASE_PROJECT_ID and service-account variables before using protected API routes.');
    initializeApp();
  }
  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

// Using imported authenticateFirebaseUser middleware from ./src/middleware/authFirebase

// Local storage configuration and optimization cleanup


function sanitizeUploadFileName(fileName: string): string {
  if (!fileName) return '';
  const decoded = decodeURIComponent(fileName);
  const base = path.basename(decoded);
  return base.replace(/[^\w.\-()+\s]/g, '_');
}

// Diagnostic endpoint to test live Azure Blob Storage connectivity and environment configuration
app.get('/api/storage/azure-status', async (_req, res) => {
  try {
    const details = await getAzureBlobStatusDetails();
    res.json(details);
  } catch (err: any) {
    res.status(500).json({ configured: false, connected: false, error: err?.message || String(err) });
  }
});

// Browser uploads always use this backend instead of Azure SAS URLs. This avoids
// browser-to-Azure CORS failures and keeps a local copy available for immediate
// document extraction. The upload endpoint mirrors the file to Azure afterwards.
app.get('/api/storage/sas', authenticateFirebaseUser, async (req, res) => {
  const fileName = req.query.fileName as string;
  if (!fileName) {
    res.status(400).json({ error: 'Missing required query parameter: fileName' });
    return;
  }

  try {
    const user = req.body.user;
    const uid = user.uid;
    const safeName = sanitizeUploadFileName(fileName);
    const backendUrl = getBackendUrl(req);

    // Authenticated backend upload target. Do not return a direct Azure URL:
    // Azure CORS configuration must never prevent a user from uploading a file.
    const localFileName = `${uid}-${safeName}`;
    res.json({
      uploadUrl: `${backendUrl}/api/storage/local-upload?fileName=${encodeURIComponent(localFileName)}`,
      audioUrl: `${backendUrl}/uploads/${localFileName}`,
      blobPath: `users/${uid}/blobs/${safeName}`,
      isBackend: true
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Upload setup failed.' });
  }
});

// Endpoint to receive browser uploads (protected, 150MB limit). Files are saved
// locally for processing, then mirrored to Azure when its server credentials work.
app.put('/api/storage/local-upload', authenticateFirebaseUser, express.raw({ type: '*/*', limit: '150mb' }), async (req, res) => {
  const rawFileName = req.query.fileName as string;
  if (!rawFileName) {
    res.status(400).json({ error: 'Missing required query parameter: fileName' });
    return;
  }

  try {
    // express.raw replaces req.body with the binary upload payload, so use the
    // identity that the auth middleware attaches directly to the request.
    const user = (req as any).user;
    if (!user?.uid) {
      res.status(401).json({ error: 'Authenticated user identity is missing.' });
      return;
    }
    const fileName = sanitizeUploadFileName(rawFileName);
    // `/api/storage/sas` issues names in this exact form. Enforce the same
    // ownership convention here as well, because this endpoint can also be
    // called directly. Without this check an authenticated user could choose
    // another user's prefix and overwrite a publicly-served local upload.
    const requiredPrefix = `${user.uid}-`;
    if (!fileName.startsWith(requiredPrefix) || fileName.length === requiredPrefix.length) {
      res.status(403).json({ error: 'Upload file name does not belong to the authenticated user.' });
      return;
    }
    const resolvedFilePath = path.resolve(uploadsDir, fileName);
    if (path.resolve(uploadsDir) !== path.dirname(resolvedFilePath)) {
      res.status(400).json({ error: 'Invalid file name.' });
      return;
    }

    if (!req.body || !Buffer.isBuffer(req.body)) {
      res.status(400).json({ error: 'Invalid or missing file binary payload.' });
      return;
    }

    await fs.promises.writeFile(resolvedFilePath, req.body);
    console.log(`[Local Upload] Saved upload payload to: ${resolvedFilePath} (${req.body.length} bytes)`);

    let storageProvider: 'azure' | 'local' = 'local';
    if (isAzureBlobConfigured()) {
      try {
        await uploadBinaryBlobToAzure(
          user.uid,
          fileName.replace(`${user.uid}-`, ''),
          req.body,
          req.get('content-type') || 'application/octet-stream'
        );
        storageProvider = 'azure';
      } catch (azureErr: any) {
        // The upload itself has already succeeded locally. Azure is an optional
        // durable mirror, so its failure must not fail the user's upload.
        console.warn('[Local Upload] Azure mirror failed; retaining local file:', azureErr?.message || azureErr);
      }
    }

    res.json({ success: true, storageProvider, path: resolvedFilePath });
  } catch (err: any) {
    console.error('[Local Upload] Failed to write file to disk:', err);
    res.status(500).json({ error: 'Failed to write upload payload to disk.' });
  }
});

// Endpoint to save transcripts (Azure Blob primary -> Local backend disk fallback)
app.post('/api/storage/transcripts/upload', authenticateFirebaseUser, async (req, res) => {
  const { lectureId, transcriptData } = req.body;
  if (!lectureId || !transcriptData) {
    res.status(400).json({ error: 'Missing lectureId or transcriptData' });
    return;
  }

  const user = req.body.user;
  const uid = user.uid;

  // Explicitly omit notes, notesMarkdown, and academicNotes so notes are never stored
  const { notes, notesMarkdown, academicNotes, ...cleanTranscriptData } = transcriptData || {};

  if (isAzureBlobConfigured()) {
    try {
      const azureRes = await uploadTranscriptToAzure(uid, lectureId, cleanTranscriptData);
      console.log(`[Transcript Storage] Stored transcript to Azure Blob for user ${uid}, lecture ${lectureId}`);
      return res.json({
        success: true,
        storageProvider: 'azure',
        blobPath: azureRes.blobPath,
        blobUrl: azureRes.blobUrl
      });
    } catch (azureErr: any) {
      console.warn(`[Transcript Storage] Azure upload failed (${azureErr.message}). Falling back to local backend disk...`);
    }
  }

  try {
    const safeLectureId = sanitizeUploadFileName(lectureId);
    const localFileName = `${uid}-transcript-${safeLectureId}.json`;
    const targetPath = path.join(uploadsDir, localFileName);
    
    const content = JSON.stringify({
      userId: uid,
      lectureId,
      timestamp: new Date().toISOString(),
      ...cleanTranscriptData
    });

    await fs.promises.writeFile(targetPath, content, 'utf8');
    const backendUrl = getBackendUrl(req);
    const readUrl = `${backendUrl}/uploads/${localFileName}`;

    console.log(`[Transcript Storage] Stored transcript to Local Storage fallback for user ${uid}, lecture ${lectureId}`);
    res.json({
      success: true,
      storageProvider: 'local',
      blobPath: `uploads/${localFileName}`,
      blobUrl: readUrl
    });
  } catch (localErr: any) {
    console.error(`[Transcript Storage] Local disk fallback upload failed:`, localErr);
    res.status(500).json({ error: 'Failed to save transcript to both Azure Blob Storage and Local Storage fallback.' });
  }
});

// Endpoint to read transcripts (Azure Blob primary -> Local backend disk fallback)
app.get('/api/storage/transcripts/read', authenticateFirebaseUser, async (req, res) => {
  const lectureId = req.query.lectureId as string;
  if (!lectureId) {
    res.status(400).json({ error: 'Missing lectureId query parameter' });
    return;
  }

  const user = req.body.user;
  const uid = user.uid;

  if (isAzureBlobConfigured()) {
    try {
      const data = await downloadTranscriptFromAzure(uid, lectureId);
      return res.json({ success: true, storageProvider: 'azure', transcriptData: data });
    } catch (azureErr: any) {
      console.warn(`[Transcript Read] Azure Blob read skipped/failed (${azureErr.message}). Checking Local Storage fallback...`);
    }
  }

  try {
    const safeLectureId = sanitizeUploadFileName(lectureId);
    const localFileName = `${uid}-transcript-${safeLectureId}.json`;
    const targetPath = path.join(uploadsDir, localFileName);

    if (fs.existsSync(targetPath)) {
      const content = await fs.promises.readFile(targetPath, 'utf8');
      const data = JSON.parse(content);
      return res.json({ success: true, storageProvider: 'local', transcriptData: data });
    }
  } catch (localErr: any) {
    console.warn(`[Transcript Read] Local storage read error:`, localErr);
  }

  res.status(404).json({ error: 'Transcript content not found in Azure Blob Storage or Local Storage.' });
});

// Endpoint to generate Read URL
app.get('/api/storage/read-sas', authenticateFirebaseUser, async (req, res) => {
  const blobPath = req.query.blobPath as string;
  if (!blobPath) {
    res.status(400).json({ error: 'Missing required query parameter: blobPath' });
    return;
  }

  try {
    const backendUrl = getBackendUrl(req);
    const rawFileName = blobPath.split('/').pop() || '';
    const safeName = sanitizeUploadFileName(rawFileName);
    const user = req.body.user;
    const uid = user.uid;

    if (blobPath.startsWith('users/') && !blobPath.startsWith(`users/${uid}`)) {
      return res.status(403).json({ error: 'Access denied to target storage path.' });
    }

    res.json({
      readUrl: blobPath.startsWith('http') ? blobPath : `${backendUrl}/uploads/${uid}-${safeName}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Read URL resolution failed.' });
  }
});

// Endpoint to clean up temporary upload files to optimize storage usage
app.post('/api/storage/cleanup', authenticateFirebaseUser, async (req, res) => {
  const { blobPath } = req.body;
  if (!blobPath) {
    res.status(400).json({ error: 'Missing blobPath in body' });
    return;
  }

  try {
    const user = req.body.user;
    const uid = user.uid;
    const rawFileName = blobPath.split('/').pop() || '';
    const safeName = sanitizeUploadFileName(rawFileName);
    const decodedFileName = decodeURIComponent(rawFileName);

    const candidates = [
      path.join(uploadsDir, `${uid}-${safeName}`),
      path.join(uploadsDir, safeName),
      path.join(uploadsDir, `${uid}-${rawFileName}`),
      path.join(uploadsDir, rawFileName),
      path.join(uploadsDir, `${uid}-${decodedFileName}`),
      path.join(uploadsDir, decodedFileName),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        await fs.promises.unlink(candidate);
        console.log(`[Storage Cleanup] Purged temporary upload file: ${candidate}`);
        break;
      }
    }
    res.json({ success: true, message: 'Temporary storage cleaned up.' });
  } catch (err: any) {
    console.warn('[Storage Cleanup] Cleanup error:', err?.message || err);
    res.status(500).json({ error: 'Cleanup failed.' });
  }
});

// Helper to read local storage files to buffer
async function getFileBuffer(blobPath: string, uid: string): Promise<Buffer> {
  const rawFileName = blobPath.split('/').pop() || '';
  const safeName = sanitizeUploadFileName(rawFileName);
  const decodedFileName = decodeURIComponent(rawFileName);

  const candidates = [
    path.join(uploadsDir, `${uid}-${safeName}`),
    path.join(uploadsDir, safeName),
    path.join(uploadsDir, `${uid}-${rawFileName}`),
    path.join(uploadsDir, rawFileName),
    path.join(uploadsDir, `${uid}-${decodedFileName}`),
    path.join(uploadsDir, decodedFileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return await fs.promises.readFile(candidate);
    }
  }

  // Directory scan fallback for fuzzy matching (e.g. differently replaced symbols)
  if (fs.existsSync(uploadsDir)) {
    const files = await fs.promises.readdir(uploadsDir);
    const targetClean = safeName.toLowerCase();
    const targetUidClean = `${uid.toLowerCase()}-${targetClean}`;
    
    const matched = files.find(f => {
      const lower = f.toLowerCase();
      return lower === targetClean || lower === targetUidClean;
    });

    if (matched) {
      return await fs.promises.readFile(path.join(uploadsDir, matched));
    }
  }

  throw new Error(`Local file not found at ${path.join(uploadsDir, `${uid}-${safeName}`)}`);
}


// In-memory cache for dynamic image search results
const imageCache = new Map<string, string[]>();

// Chunker helper for RAG source grounding
function performChunking(text: string, sourceType: string) {
  const chunks: Array<{
    content: string;
    page?: number;
    timestamp?: string;
    chapter?: string;
    keywords: string[];
  }> = [];

  const extractKeywords = (str: string): string[] => {
    const words = str.match(/\b[A-Za-z]{4,}\b/g) || [];
    const unique = Array.from(new Set(words.map(w => w.toLowerCase())));
    const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'they', 'them', 'your', 'their', 'there', 'about', 'would', 'could', 'should', 'these', 'those', 'basic', 'under', 'after', 'before']);
    return unique.filter(w => !stopWords.has(w)).slice(0, 8);
  };

  if (sourceType === 'lecture' || text.includes('[')) {
    const timestampRegex = /(\[\d{1,2}:\d{2}\])/g;
    const parts = text.split(timestampRegex);
    let currentTimestamp = '00:00';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (timestampRegex.test(part)) {
        currentTimestamp = part.replace(/[\[\]]/g, '');
      } else if (part.length > 50) {
        chunks.push({
          content: part,
          timestamp: currentTimestamp,
          keywords: extractKeywords(part)
        });
      }
    }
  }

  if (chunks.length === 0) {
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 40);
    let currentPage = 1;
    
    paragraphs.forEach((p) => {
      const pageMatch = p.match(/page\s*(\d+)/i);
      if (pageMatch && pageMatch[1]) {
        currentPage = parseInt(pageMatch[1], 10);
      }
      
      chunks.push({
        content: p,
        page: currentPage,
        keywords: extractKeywords(p)
      });
    });
  }

  if (chunks.length === 0) {
    const words = text.split(/\s+/).filter(Boolean);
    const chunkSize = 250;
    const overlap = 50;
    
    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
      const chunkWords = words.slice(i, i + chunkSize);
      if (chunkWords.length > 20) {
        const content = chunkWords.join(' ');
        chunks.push({
          content,
          keywords: extractKeywords(content)
        });
      }
    }
  }

  return chunks;
}

// Endpoint to split document/lecture into chunks for RAG grounding
app.post('/api/storage/ground-source', authenticateFirebaseUser, async (req, res) => {
  const { sourceId, sourceType, text } = req.body;
  if (!sourceId || !sourceType || !text) {
    res.status(400).json({ error: 'Missing required parameters: sourceId, sourceType, text' });
    return;
  }

  try {
    const user = req.body.user;
    const uid = user.uid;
    const chunks = performChunking(text, sourceType);
    
    try {
      const adminDb = getFirestore();
      const collectionName = sourceType === 'lecture' ? 'lectures' : 'sources';
      const chunksRef = adminDb.collection('users').doc(uid).collection(collectionName).doc(sourceId).collection('chunks');
      
      // Clean old chunks if present
      const existing = await chunksRef.get();
      if (!existing.empty) {
        const batch = adminDb.batch();
        existing.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }
      
      // Batch write chunks (limit 500 per batch)
      let currentBatch = adminDb.batch();
      let count = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const docRef = chunksRef.doc(`chunk-${i}`);
        currentBatch.set(docRef, {
          chunkId: `chunk-${i}`,
          sourceId,
          content: chunk.content,
          page: chunk.page || null,
          timestamp: chunk.timestamp || null,
          chapter: chunk.chapter || null,
          keywords: chunk.keywords,
          createdAt: new Date()
        });
        count++;
        
        if (count === 400) {
          await currentBatch.commit();
          currentBatch = adminDb.batch();
          count = 0;
        }
      }
      
      if (count > 0) {
        await currentBatch.commit();
      }
      
      console.log(`[RAG] Ingested ${chunks.length} chunks for ${sourceType} ${sourceId}`);
    } catch (fsErr) {
      console.warn('[RAG] Firestore chunk save skipped/failed:', fsErr);
    }
    
    res.json({ success: true, count: chunks.length });
  } catch (error: any) {
    console.error('[RAG] Grounding failed:', error);
    res.status(500).json({ error: error.message || 'Grounding engine failed.' });
  }
});

// Endpoint to query unified image search from backend
app.get('/api/images/search', authenticateFirebaseUser, async (req, res) => {
  const queryParam = req.query.query as string;
  if (!queryParam) {
    res.status(400).json({ error: 'Missing required query parameter: query' });
    return;
  }

  const cleanQuery = queryParam.trim().toLowerCase();
  
  if (imageCache.has(cleanQuery)) {
    res.json({ images: imageCache.get(cleanQuery) });
    return;
  }

  const images: string[] = [];
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || '';
  const pexelsKey = process.env.PEXELS_API_KEY || '';

  const fetchUnsplash = async (query: string): Promise<string[]> => {
    if (!unsplashKey) return [];
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${unsplashKey}&per_page=10`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((img: any) => img.urls.regular).filter(Boolean);
        }
      }
    } catch (err) {
      console.error('[IMAGES] Unsplash search error:', err);
    }
    return [];
  };

  const fetchPexels = async (query: string): Promise<string[]> => {
    if (!pexelsKey) return [];
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10`, {
        headers: { 'Authorization': pexelsKey }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.photos && Array.isArray(data.photos)) {
          return data.photos.map((p: any) => p.src.large).filter(Boolean);
        }
      }
    } catch (err) {
      console.error('[IMAGES] Pexels search error:', err);
    }
    return [];
  };

  const getFallbackImages = (query: string): string[] => {
    const clean = query.toLowerCase();
    const techImg = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
    const scienceImg = "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80";
    const businessImg = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80";
    const eduImg = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80";
    const artImg = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80";
    const growthImg = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80";
    const mathImg = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80";
    const generalImg = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80";

    const fallbacks: string[] = [];
    if (clean.includes("tech") || clean.includes("computer") || clean.includes("software") || clean.includes("code") || clean.includes("digital") || clean.includes("web") || clean.includes("programming") || clean.includes("ai") || clean.includes("artificial")) {
      fallbacks.push(techImg);
    }
    if (clean.includes("science") || clean.includes("biology") || clean.includes("chemistry") || clean.includes("physics") || clean.includes("lab") || clean.includes("medicine") || clean.includes("dna") || clean.includes("molecular") || clean.includes("cell")) {
      fallbacks.push(scienceImg);
    }
    if (clean.includes("business") || clean.includes("corporate") || clean.includes("finance") || clean.includes("office") || clean.includes("market") || clean.includes("meeting") || clean.includes("money") || clean.includes("strategy") || clean.includes("leadership")) {
      fallbacks.push(businessImg);
    }
    if (clean.includes("education") || clean.includes("learn") || clean.includes("history") || clean.includes("book") || clean.includes("study") || clean.includes("academic") || clean.includes("student") || clean.includes("class") || clean.includes("philosophy") || clean.includes("ethics")) {
      fallbacks.push(eduImg);
    }
    if (clean.includes("art") || clean.includes("design") || clean.includes("creative") || clean.includes("paint") || clean.includes("draw") || clean.includes("graphic")) {
      fallbacks.push(artImg);
    }
    if (clean.includes("growth") || clean.includes("success") || clean.includes("startup") || clean.includes("idea") || clean.includes("analytics") || clean.includes("chart") || clean.includes("diagram")) {
      fallbacks.push(growthImg);
    }
    if (clean.includes("math") || clean.includes("calculus") || clean.includes("algebra") || clean.includes("derivative") || clean.includes("limit") || clean.includes("geometry") || clean.includes("equation")) {
      fallbacks.push(mathImg);
    }
    
    fallbacks.push(generalImg);
    return fallbacks;
  };

  let fetched = await fetchUnsplash(cleanQuery);
  if (fetched.length > 0) {
    images.push(...fetched);
  }

  if (images.length === 0) {
    fetched = await fetchPexels(cleanQuery);
    if (fetched.length > 0) {
      images.push(...fetched);
    }
  }

  if (images.length === 0) {
    images.push(...getFallbackImages(cleanQuery));
  }

  imageCache.set(cleanQuery, images);
  res.json({ images });
});

// Endpoint to extract text from documents
app.post('/api/storage/extract-text', authenticateFirebaseUser, async (req, res) => {
  const { blobPath } = req.body;
  if (!blobPath) {
    res.status(400).json({ error: 'Missing required body parameter: blobPath' });
    return;
  }

  try {
    const user = req.body.user;
    const uid = user.uid;
    const buffer = await getFileBuffer(blobPath, uid);
    const fileName = blobPath.split('/').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    let extractedText = '';

    if (extension === 'pdf') {
      const parser = new pdf.PDFParse({ data: buffer });
      const parsed = await parser.getText();
      extractedText = parsed.text || '';
    } else if (extension === 'docx') {
      const parsed = await mammoth.extractRawText({ buffer });
      extractedText = parsed.value || '';
    } else if (extension === 'pptx') {
      const parsed = await officeParser.parseOffice(buffer);
      if (parsed && typeof (parsed as any).toText === 'function') {
        extractedText = (parsed as any).toText();
      } else if (typeof parsed === 'string') {
        extractedText = parsed;
      } else {
        extractedText = String(parsed);
      }
    } else if (extension === 'xlsx') {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      workbook.SheetNames.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        extractedText += `Sheet: ${sheetName}\n${csv}\n\n`;
      });
    } else if (extension === 'txt' || extension === 'md' || extension === 'csv') {
      extractedText = buffer.toString('utf8');
    } else {
      throw new Error(`Unsupported file extension: ${extension}`);
    }

    res.json({ text: extractedText });
  } catch (error: any) {
    console.error('Error extracting document text:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text from document.' });
  }
});

// Helper function to race a promise against a timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutErrorMessage: string): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutErrorMessage)), timeoutMs);
  });
  return Promise.race<T>([promise, timeoutPromise]).finally(() => clearTimeout(timer)) as Promise<T>;
}

// Improved YouTube Video ID extraction
function extractVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  return null;
}

// Endpoint to extract text from website or YouTube URLs
app.post('/api/storage/extract-url', authenticateFirebaseUser, async (req, res) => {
  const { url, type } = req.body;
  if (!url || !type) {
    res.status(400).json({ error: 'Missing required parameters: url, type' });
    return;
  }

  try {
    let extractedText = '';
    let title = 'Web Article';

    if (type === 'youtube') {
      console.log('[YOUTUBE] URL received:', url);
      const videoId = extractVideoId(url);
      console.log('[YOUTUBE] Video ID extracted:', videoId);
      
      if (!videoId) {
        throw new Error('Failed to extract YouTube video ID from the provided URL.');
      }

      title = `YouTube Video - ${videoId}`;

      // 1. Fetch title from YouTube oEmbed or noembed API with 3s timeout
      try {
        const titleRes = await withTimeout(
          fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`),
          3000,
          'Title fetch timeout'
        );
        if (titleRes.ok) {
          const titleData = await titleRes.json();
          if (titleData && titleData.title) {
            title = titleData.title;
          }
        }
      } catch (titleErr) {
        console.warn('[YOUTUBE] Failed to fetch video title, using default:', titleErr);
      }

      try {
        const transcripts = await withTimeout(
          YoutubeTranscript.fetchTranscript(videoId),
          6000,
          'YouTube transcript fetch timed out after 6000ms'
        );
        if (Array.isArray(transcripts) && transcripts.length > 0) {
          extractedText = transcripts.map((t: any) => t.text).join(' ');
          console.log('[YOUTUBE] Transcript fetched successfully, length:', extractedText.length);
        }
      } catch (err: any) {
        console.warn('[YOUTUBE] YoutubeTranscript API failed or timed out:', err?.message || err);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        try {
          const ttRes = await withTimeout(
            fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`),
            4000,
            'Timedtext fetch timed out'
          );
          if (ttRes.ok) {
            const xmlText = await ttRes.text();
            const textMatches = Array.from(xmlText.matchAll(/<text[^>]*>(.*?)<\/text>/gi));
            if (textMatches.length > 0) {
              extractedText = textMatches
                .map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
                .join(' ');
              console.log('[YOUTUBE] Timedtext fallback fetched successfully, length:', extractedText.length);
            }
          }
        } catch (ttErr) {
          console.warn('[YOUTUBE] Timedtext fallback warning:', ttErr);
        }
      }

      if (!extractedText || extractedText.trim().length === 0) {
        extractedText = `YouTube Video Study Resource: ${title}\nVideo URL: ${url}\nVideo ID: ${videoId}\n\nOverview:\nThis YouTube video has been attached to your Knowledge Studio workspace. NoteIT AI will analyze the video topic, title structure, and key learning concepts to produce high-yield study notes, flashcards, and interactive practice quizzes.`;
      }
    }
 else {
      // website
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch website HTML: ${response.status}`);
      }
      const html = await response.text();
      
      const doc = new JSDOM(html, { url });
      const reader = new Readability(doc.window.document);
      const article = reader.parse();
      
      if (article) {
        title = article.title;
        extractedText = article.textContent;
      } else {
        // Fallback to cheerio if readability fails
        const $ = cheerio.load(html);
        $('script, style, nav, footer, header').remove();
        title = $('title').text() || 'Web Page';
        extractedText = $('body').text().replace(/\s+/g, ' ').trim();
      }
    }

    res.json({ text: extractedText, title });
  } catch (error: any) {
    console.error('Error extracting URL text:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text from URL.' });
  }
});

// Admin guard: requires a valid Firebase token AND the configured admin secret
// (passed via the x-admin-secret header and matched against ADMIN_API_SECRET,
// falling back to ENCRYPTION_SECRET). If no secret is configured the request
// is refused, so a misconfiguration cannot open the door.
const requireAdminSecret = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secretKey = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_API_SECRET || process.env.ENCRYPTION_SECRET;
  if (!expectedSecret || !secretKey || secretKey !== expectedSecret) {
    res.status(403).json({ error: 'Unauthorized: valid admin secret required.' });
    return;
  }
  next();
};

// Debug endpoints are admin-only: unauthenticated access would let anonymous
// clients enumerate every registered route and read cross-user request logs.
app.get('/api/debug/routes', authenticateFirebaseUser, requireAdminSecret, (req, res) => {
  const routes: string[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
      routes.push(`${methods} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(', ');
          routes.push(`${methods} ${handler.route.path}`);
        }
      });
    }
  });
  res.json({ routes });
});

app.get('/api/debug/auth', authenticateFirebaseUser, (req, res) => {
  const user = req.body?.user;
  res.json({
    authenticated: true,
    uid: user?.uid || null
  });
});

app.get('/api/debug/logs', authenticateFirebaseUser, requireAdminSecret, (req, res) => {
  res.json({ logs: logBuffer });
});



// ==================================================
// FCM WEB PUSH NOTIFICATION BACKEND ENDPOINTS & SCHEDULER
// ==================================================

// Endpoint to trigger manual notification scheduler scan
app.post('/api/notifications/process-scheduler', authenticateFirebaseUser, async (req, res) => {
  try {
    const result = await runNotificationSchedulerCycle();
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Error running notification scheduler cycle:', error);
    res.status(500).json({ error: error.message || 'Failed to process notification scheduler cycle.' });
  }
});

// Endpoint to send a test push notification to user's registered FCM tokens & devices
app.post('/api/notifications/send-test', authenticateFirebaseUser, async (req, res) => {
  const user = req.body.user;
  const uid = user.uid;
  const { title, body, route } = req.body;

  try {
    let tokenDocs: any[] = [];
    try {
      const adminDb = getFirestore();
      const devicesSnap = await adminDb.collection('users').doc(uid).collection('devices').where('enabled', '==', true).get();
      if (!devicesSnap.empty) {
        tokenDocs = devicesSnap.docs;
      } else {
        const fallbackSnap = await adminDb.collection('users').doc(uid).collection('notificationTokens').where('enabled', '==', true).get();
        tokenDocs = fallbackSnap.docs;
      }
    } catch (fsErr) {
      console.warn('[send-test] Firestore token lookup skipped/failed:', fsErr);
    }

    if (tokenDocs.length === 0) {
      res.status(400).json({ error: 'No active FCM registered devices found for this user.' });
      return;
    }

    let successCount = 0;
    const testTitle = title || 'NoteIT AI Test Notification 🚀';
    const testBody = body || 'This is a live test of your NoteIT background push notification system!';
    const testRoute = route || '/rewards';

    for (const tokenDoc of tokenDocs) {
      const token = tokenDoc.data().token || tokenDoc.data().fcmToken;
      if (!token) continue;

      try {
        await getMessaging().send({
          token,
          notification: {
            title: testTitle,
            body: testBody
          },
          data: {
            title: testTitle,
            body: testBody,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            route: testRoute,
            tag: `test-${Date.now()}`
          },
          webpush: {
            notification: {
              title: testTitle,
              body: testBody,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              renotify: true
            }
          }
        });
        successCount++;
      } catch (sendErr: any) {
        console.warn(`[SEND-TEST] FCM send result for token doc ${tokenDoc.id}:`, sendErr?.message || sendErr);
        successCount++;
      }
    }

    res.json({ success: true, message: `Test push notification processed for ${successCount} registered device(s).` });
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: error.message || 'Failed to send test notification.' });
  }
});

// Endpoint for Admin to broadcast push notifications to ALL registered devices across NoteIT automatically.
// Requires a valid Firebase token AND the configured admin secret (x-admin-secret header).
app.post('/api/admin/broadcast-notification', authenticateFirebaseUser, requireAdminSecret, async (req, res) => {
  const { title, body, route } = req.body;

  const broadcastTitle = title || 'NoteIT AI Broadcast 🚀';
  const broadcastBody = body || 'yourr noteit is readyyy';
  const broadcastRoute = route || '/rewards';

  try {
    const adminDb = getFirestore();
    const usersSnap = await adminDb.collection('users').get();
    
    let totalDevices = 0;
    let successCount = 0;
    let failCount = 0;

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;

      // Fetch registered devices
      let devicesSnap = await adminDb.collection('users').doc(uid).collection('devices').where('enabled', '==', true).get();
      if (devicesSnap.empty) {
        devicesSnap = await adminDb.collection('users').doc(uid).collection('notificationTokens').where('enabled', '==', true).get();
      }

      if (devicesSnap.empty) continue;

      for (const devDoc of devicesSnap.docs) {
        const token = devDoc.data().token || devDoc.data().fcmToken;
        if (!token) continue;

        totalDevices++;

        try {
          await getMessaging().send({
            token,
            notification: {
              title: broadcastTitle,
              body: broadcastBody
            },
            data: {
              title: broadcastTitle,
              body: broadcastBody,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              route: broadcastRoute,
              tag: `broadcast-${Date.now()}`
            },
            webpush: {
              headers: { Urgency: 'high' },
              notification: {
                title: broadcastTitle,
                body: broadcastBody,
                icon: '/favicon.svg',
                badge: '/favicon.svg',
                renotify: true
              }
            }
          });
          successCount++;
        } catch (sendErr: any) {
          console.warn(`[ADMIN BROADCAST] Send warning for token ${devDoc.id}:`, sendErr?.message || sendErr);
          if (
            sendErr?.code === 'messaging/registration-token-not-registered' ||
            sendErr?.code === 'messaging/invalid-registration-token'
          ) {
            await devDoc.ref.set({ enabled: false, notificationsEnabled: false }, { merge: true }).catch(() => {});
            failCount++;
          } else {
            successCount++;
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Admin broadcast dispatched to ${successCount} device(s) across NoteIT!`,
      details: { totalDevices, successCount, failCount, broadcastTitle, broadcastBody }
    });
  } catch (error: any) {
    console.error('[ADMIN BROADCAST ERROR]', error);
    res.status(500).json({ error: error.message || 'Failed to broadcast notification.' });
  }
});

// Initialize background notification scheduler interval (every 15 minutes)
const NOTIFICATION_SCHEDULER_INTERVAL_MS = 15 * 60 * 1000;
setInterval(() => {
  console.log('[NOTIFICATION SCHEDULER] Running scheduled background notification cycle...');
  runNotificationSchedulerCycle().then((result) => {
    console.log(`[NOTIFICATION SCHEDULER] Completed cycle: Processed ${result.usersProcessed} users, Sent ${result.notificationsSent} notifications, Cleaned ${result.tokensCleaned} tokens.`);
  }).catch((err) => {
    console.error('[NOTIFICATION SCHEDULER] Background cycle error:', err);
  });
}, NOTIFICATION_SCHEDULER_INTERVAL_MS);


// Helper to print all registered routes on startup
function printRoutes() {
  console.log('Registered Routes:');
  const routes: string[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
      routes.push(`${methods} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(', ');
          routes.push(`${methods} ${handler.route.path}`);
        }
      });
    }
  });
  routes.forEach(r => console.log(r));
  console.log('');
}

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running locally on port ${PORT}`);
  printRoutes();
});
