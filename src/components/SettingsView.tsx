/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Sparkles, 
  Link2, 
  ShieldCheck, 
  CreditCard,
  Check,
  RefreshCw,
  ExternalLink,
  Key,
  Trash2,
  Lock,
  ChevronDown,
  Search,
  Activity,
  TrendingUp,
  AlertTriangle,
  Sun,
  Moon,
  Palette,
  Trophy,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { PageId, UserSettings } from '../types';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { API_BASE_URL } from '../config';
import { validateApiKeyDirect } from '../providers/ValidationAdapters';
import { MascotAvatarPicker } from './bauhaus/MascotAvatarPicker';
import NotificationSettingsSection from './NotificationSettingsSection';

const PROVIDER_METADATA: Record<string, {
  name: string;
  description: string;
  defaultModel: string;
  docLink: string;
  getKeyLink: string;
  models: string[];
  endpoint: string;
}> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Highly capable multimodal model for fast note synthesis, quizzes, and mind maps.',
    defaultModel: 'gemini-3.6-flash',
    docLink: 'https://ai.google.dev/gemini-api/docs',
    getKeyLink: 'https://aistudio.google.com/apikey',
    models: ['gemini-3.6-flash'],
    endpoint: 'generativelanguage.googleapis.com'
  },
  notion: {
    name: 'Notion AI / Notion API',
    description: 'Integrate Notion AI & Workspace API key for note synthesis and smart study tools.',
    defaultModel: 'notion-ai-v1',
    docLink: 'https://developers.notion.com/docs',
    getKeyLink: 'https://www.notion.so/my-integrations',
    models: ['notion-ai-v1', 'notion-workspace-v1'],
    endpoint: 'api.notion.com/v1'
  },
  groq: {
    name: 'Groq',
    description: 'Ultra-low latency open models. Excellent for speedy revision synthesis.',
    defaultModel: 'llama-3.3-70b-versatile',
    docLink: 'https://console.groq.com/docs',
    getKeyLink: 'https://console.groq.com/keys',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    endpoint: 'api.groq.com/openai/v1'
  },
  openai: {
    name: 'OpenAI',
    description: 'Industry-standard general purpose models with high accuracy and speed.',
    defaultModel: 'gpt-4o-mini',
    docLink: 'https://platform.openai.com/docs',
    getKeyLink: 'https://platform.openai.com/api-keys',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'o3-mini', 'o1-mini'],
    endpoint: 'api.openai.com/v1'
  },
  anthropic: {
    name: 'Anthropic Claude',
    description: 'Advanced reasoning and writing capabilities. Top-tier notes output quality.',
    defaultModel: 'claude-3-5-sonnet-latest',
    docLink: 'https://docs.anthropic.com',
    getKeyLink: 'https://console.anthropic.com/settings/keys',
    models: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-20240229'],
    endpoint: 'api.anthropic.com/v1'
  },
  deepseek: {
    name: 'DeepSeek',
    description: 'High-performance cost-effective reasoning and general-purpose models.',
    defaultModel: 'deepseek-chat',
    docLink: 'https://api-docs.deepseek.com',
    getKeyLink: 'https://platform.deepseek.com/api_keys',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    endpoint: 'api.deepseek.com/v1'
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Access any open or closed model through a single unified API key.',
    defaultModel: 'google/gemini-2.0-flash-001',
    docLink: 'https://openrouter.ai/docs',
    getKeyLink: 'https://openrouter.ai/keys',
    models: ['google/gemini-2.0-flash-001', 'google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-chat', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini'],
    endpoint: 'openrouter.ai/api/v1'
  },
  mistral: {
    name: 'Mistral',
    description: 'Sovereign European open-source models with high academic synthesis reasoning.',
    defaultModel: 'mistral-large-latest',
    docLink: 'https://docs.mistral.ai',
    getKeyLink: 'https://console.mistral.ai/api-keys',
    models: ['mistral-large-latest', 'mistral-small-latest', 'open-mixtral-8x22b', 'codestral-latest'],
    endpoint: 'api.mistral.ai/v1'
  },
  xai: {
    name: 'xAI Grok',
    description: 'Advanced reasoning, vision, and real-time knowledge capabilities from xAI.',
    defaultModel: 'grok-2',
    docLink: 'https://docs.x.ai',
    getKeyLink: 'https://console.x.ai',
    models: ['grok-2', 'grok-2-latest', 'grok-beta'],
    endpoint: 'api.x.ai/v1'
  },
  nvidia: {
    name: 'NVIDIA GLM',
    description: 'High-performance GLM models hosted on NVIDIA NIM API catalog.',
    defaultModel: 'z-ai/glm-5.2',
    docLink: 'https://build.nvidia.com/z-ai/glm-5.2',
    getKeyLink: 'https://build.nvidia.com/',
    models: ['z-ai/glm-5.2'],
    endpoint: 'integrate.api.nvidia.com/v1'
  }
};

const PROVIDER_COSTS: Record<string, { input: number; output: number }> = {
  gemini: { input: 0.075, output: 0.30 }, // per million tokens
  groq: { input: 0.59, output: 0.79 },
  openai: { input: 0.15, output: 0.60 },
  anthropic: { input: 3.00, output: 15.00 },
  deepseek: { input: 0.14, output: 0.28 },
  openrouter: { input: 0.10, output: 0.40 },
  mistral: { input: 2.00, output: 6.00 },
  xai: { input: 2.00, output: 10.00 },
  nvidia: { input: 0.55, output: 0.55 },
  notion: { input: 0.50, output: 1.50 }
};


const COUNTRY_CODES = [
  { code: '+1', name: 'United States / Canada (+1)' },
  { code: '+44', name: 'United Kingdom (+44)' },
  { code: '+91', name: 'India (+91)' },
  { code: '+61', name: 'Australia (+61)' },
  { code: '+49', name: 'Germany (+49)' },
  { code: '+33', name: 'France (+33)' },
  { code: '+81', name: 'Japan (+81)' },
  { code: '+86', name: 'China (+86)' },
  { code: '+55', name: 'Brazil (+55)' }
];

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  setActivePage: (page: PageId) => void;
  initialTab?: string;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
  onLogOut?: () => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  setActivePage,
  initialTab,
  theme = 'dark',
  setTheme,
  onLogOut
}: SettingsViewProps) {
  
  // Local state
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'rewards' | 'notifications' | 'ai' | 'usage' | 'security' | 'billing'>((initialTab as any) || 'profile');

  
  // Profile edits
  const [firstName, setFirstName] = useState(settings.profile.firstName || '');
  const [lastName, setLastName] = useState(settings.profile.lastName || '');
  const [emailAddress, setEmailAddress] = useState(settings.profile.emailAddress || '');
  const [institution, setInstitution] = useState(settings.profile.institution || '');
  const [countryCode, setCountryCode] = useState(settings.profile.countryCode || '');
  const [phoneNumber, setPhoneNumber] = useState(settings.profile.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(settings.profile.avatarUrl || '');
  const [error, setError] = useState<string | null>(null);
  
  // Canvas Credentials
  const [canvasUrl, setCanvasUrl] = useState(settings.integrations.canvasUrl || '');
  const [canvasToken, setCanvasToken] = useState('••••••••••••••••••••••••');
  const [isLmsSyncing, setIsLmsSyncing] = useState(false);

  // AI Levels
  const [proactive, setProactive] = useState(settings.aiLevels.proactiveConceptSuggestion);
  const [bibliography, setBibliography] = useState(settings.aiLevels.automatedBibliography);
  const [synthesis, setSynthesis] = useState(settings.aiLevels.highIntensitySynthesis);

  // AI Provider & API Keys state
  const [aiProvider, setAiProvider] = useState<string>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [showNewKeyPassword, setShowNewKeyPassword] = useState(false);
  
  // Search & custom dropdowns
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Configuration Status state
  const [configStatus, setConfigStatus] = useState<{
    configured: boolean;
    keySource?: 'user-byok' | 'platform-quota' | 'none';
    platformQuotaAvailable?: boolean;
    provider?: string;
    maskedKey?: string;
    lastValidated?: string | null;
    selectedModel?: string;
    usageStats?: {
      todayRequests: number;
      estimatedTokens: number;
      avgResponseTime: number;
      failedRequests: number;
      errors429: number;
      errors503: number;
    };
    estimatedMonthlyTokens?: number;
    lastHealthCheck?: {
      status: string;
      latency: number;
      checkedAt: string;
    };
  } | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [revalidating, setRevalidating] = useState(false);
  const [deletingKey, setDeletingKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showReplaceForm, setShowReplaceForm] = useState(false);

  // Saved Keys Vault state
  const [savedKeys, setSavedKeys] = useState<Array<{
    id: string;
    provider: string;
    model: string;
    maskedKey: string;
    label: string;
    savedAt: string;
    lastUsedAt?: string;
    isActive: boolean;
  }>>([]);
  const [loadingSavedKeys, setLoadingSavedKeys] = useState(false);
  const [switchingKeyId, setSwitchingKeyId] = useState<string | null>(null);
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dynamic AI Usage Telemetry & Daily Reset State (Resets daily for Gemini & active providers at 00:00 UTC)
  const [telemetry, setTelemetry] = useState<{
    todayRequests: number;
    todayTokens: number;
    monthlyTokens: number;
    failedRequests: number;
    rateLimits429: number;
    serverFaults503: number;
    avgResponseSpeedSec: number;
    lastResetDate: string;
  }>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('noteit_ai_telemetry');
        if (raw) {
          const parsed = JSON.parse(raw);
          // Auto-reset daily counters if date changed
          if (parsed.lastResetDate !== todayStr) {
            return {
              todayRequests: 0,
              todayTokens: 0,
              monthlyTokens: (parsed.monthlyTokens || 0) + (parsed.todayTokens || 0),
              failedRequests: 0,
              rateLimits429: 0,
              serverFaults503: 0,
              avgResponseSpeedSec: parsed.avgResponseSpeedSec || 0.78,
              lastResetDate: todayStr
            };
          }
          return parsed;
        }
      } catch (err) {
        console.warn("Failed to parse local AI telemetry state:", err);
      }
    }
    return {
      todayRequests: 14,
      todayTokens: 24500,
      monthlyTokens: 148500,
      failedRequests: 0,
      rateLimits429: 0,
      serverFaults503: 0,
      avgResponseSpeedSec: 0.78,
      lastResetDate: todayStr
    };
  });

  // Countdown timer for daily midnight UTC reset (Google Gemini API daily quota reset window)
  const [resetCountdown, setResetCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diffSec = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      setResetCountdown(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );

      // Check day transition for automatic midnight reset
      const todayStr = now.toISOString().split('T')[0];
      setTelemetry(prev => {
        if (prev.lastResetDate !== todayStr) {
          const updated = {
            ...prev,
            todayRequests: 0,
            todayTokens: 0,
            monthlyTokens: prev.monthlyTokens + prev.todayTokens,
            failedRequests: 0,
            rateLimits429: 0,
            serverFaults503: 0,
            lastResetDate: todayStr
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('noteit_ai_telemetry', JSON.stringify(updated));
          }
          return updated;
        }
        return prev;
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetTelemetryNow = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const resetState = {
      todayRequests: 0,
      todayTokens: 0,
      monthlyTokens: telemetry.monthlyTokens,
      failedRequests: 0,
      rateLimits429: 0,
      serverFaults503: 0,
      avgResponseSpeedSec: 0.65,
      lastResetDate: todayStr
    };
    setTelemetry(resetState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('noteit_ai_telemetry', JSON.stringify(resetState));
    }
  };

  // Dynamic Cost & Quota Calculator
  const getDynamicUsageMetrics = () => {
    const activeProv = (aiProvider || configStatus?.provider || 'gemini').toLowerCase();
    const totalMonthlyTokens = (telemetry.monthlyTokens || 0) + (telemetry.todayTokens || 0);

    let maxMonthlyQuota = 45000000; // 45M Tokens for Gemini Free (1.5M/day)
    let dailyRequestLimit = 1500; // 1,500 RPD for Gemini Free
    let isFreeTier = false;
    let costPerMillionUSD = 0.18;

    if (activeProv.includes('gemini')) {
      isFreeTier = true;
      maxMonthlyQuota = 45000000;
      dailyRequestLimit = 1500;
      costPerMillionUSD = 0.00; // Free API key
    } else if (activeProv.includes('groq')) {
      isFreeTier = false;
      maxMonthlyQuota = 432000000;
      dailyRequestLimit = 14400;
      costPerMillionUSD = 0.69;
    } else if (activeProv.includes('openai')) {
      isFreeTier = false;
      maxMonthlyQuota = 10000000;
      dailyRequestLimit = 500;
      costPerMillionUSD = 0.375;
    } else if (activeProv.includes('anthropic') || activeProv.includes('claude')) {
      isFreeTier = false;
      maxMonthlyQuota = 5000000;
      dailyRequestLimit = 250;
      costPerMillionUSD = 9.00;
    } else if (activeProv.includes('deepseek')) {
      isFreeTier = false;
      maxMonthlyQuota = 20000000;
      dailyRequestLimit = 10000;
      costPerMillionUSD = 0.28;
    }

    const estimatedCostUSD = (totalMonthlyTokens / 1000000) * costPerMillionUSD;
    const estimatedCostINR = isFreeTier ? '0.00' : (estimatedCostUSD * 85.5).toFixed(2);
    const bandwidthPercentage = Math.min(100, Math.max(0.1, Number(((totalMonthlyTokens / maxMonthlyQuota) * 100).toFixed(2))));

    return {
      provName: PROVIDER_METADATA[activeProv]?.name || activeProv.toUpperCase(),
      totalMonthlyTokens,
      maxMonthlyQuota,
      dailyRequestLimit,
      isFreeTier,
      estimatedCostINR,
      bandwidthPercentage
    };
  };

  // Migration State
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  const handleMigrateStorage = async () => {
    if (!auth.currentUser) return;
    if (!window.confirm("This will migrate all legacy AI assets to subcollections. It may take a few minutes. Continue?")) return;
    
    setIsMigrating(true);
    setMigrationStatus("Migrating Lectures...");
    
    try {
      const uid = auth.currentUser.uid;
      
      // Migrate Lectures
      const lecturesSnap = await getDocs(collection(db, 'users', uid, 'lectures'));
      for (const docSnap of lecturesSnap.docs) {
        const data = docSnap.data();
        const lectureRef = doc(db, 'users', uid, 'lectures', docSnap.id);
        const updates: any = {};
        let needsUpdate = false;
        
        const migrateAsset = async (assetData: any, type: string) => {
          if (!assetData) return;
          const assetRef = doc(db, 'users', uid, 'lectures', docSnap.id, 'assets', type);
          await setDoc(assetRef, { data: assetData, updatedAt: new Date() });
          needsUpdate = true;
        };
        
        if (data.notes) { 
          if (data.notes.academic) await migrateAsset(data.notes.academic, 'notes_academic'); 
          if (data.notes.executive) await migrateAsset(data.notes.executive, 'notes_executive'); 
          if (data.notes.revision) await migrateAsset(data.notes.revision, 'notes_revision'); 
          if (data.notes.bhailang) await migrateAsset(data.notes.bhailang, 'notes_bhailang'); 
          updates.notes = deleteField(); 
        }
        if (data.summaries) { 
          if (data.summaries.academic) await migrateAsset(data.summaries.academic, 'summaries_academic'); 
          if (data.summaries.executive) await migrateAsset(data.summaries.executive, 'summaries_executive'); 
          if (data.summaries.revision) await migrateAsset(data.summaries.revision, 'summaries_revision'); 
          updates.summaries = deleteField(); 
        }
        if (data.flashcards) { await migrateAsset(data.flashcards, 'flashcards'); updates.flashcards = deleteField(); }
        if (data.quiz) { await migrateAsset(data.quiz, 'quiz'); updates.quiz = deleteField(); }
        if (data.keyConcepts) { await migrateAsset(data.keyConcepts, 'keyConcepts'); updates.keyConcepts = deleteField(); }
        
        if (needsUpdate) await updateDoc(lectureRef, updates);
      }
      
      setMigrationStatus("Migrating Knowledge Studio sources...");
      // Migrate Sources
      const sourcesSnap = await getDocs(collection(db, 'users', uid, 'sources'));
      for (const docSnap of sourcesSnap.docs) {
        const data = docSnap.data();
        const sourceRef = doc(db, 'users', uid, 'sources', docSnap.id);
        const updates: any = {};
        let needsUpdate = false;
        
        const migrateAsset = async (assetData: any, type: string) => {
          if (!assetData) return;
          const assetRef = doc(db, 'users', uid, 'sources', docSnap.id, 'assets', type);
          await setDoc(assetRef, { data: assetData, updatedAt: new Date() });
          needsUpdate = true;
        };
        
        const fields = Object.keys(data);
        for (const field of fields) {
          if (field.startsWith('notes_') || field.startsWith('summary_') || field === 'flashcards' || field === 'quiz' || field === 'keyConcepts') {
            await migrateAsset(data[field], field === 'keyConcepts' ? 'mindmap' : field);
            updates[field] = deleteField();
          }
        }
        
        if (needsUpdate) await updateDoc(sourceRef, updates);
      }
      
      setMigrationStatus("Migration complete! You can now purge local data to fetch fresh caches.");
    } catch (err: any) {
      console.error(err);
      setMigrationStatus(`Error during migration: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // Synchronize local state with settings prop when it loads asynchronously
  React.useEffect(() => {
    if (settings.profile) {
      setFirstName(settings.profile.firstName || '');
      setLastName(settings.profile.lastName || '');
      setEmailAddress(settings.profile.emailAddress || '');
      setInstitution(settings.profile.institution || '');
      setCountryCode(settings.profile.countryCode || '');
      setPhoneNumber(settings.profile.phoneNumber || '');
      setAvatarUrl(settings.profile.avatarUrl || '');
    }
    if (settings.integrations) {
      setCanvasUrl(settings.integrations.canvasUrl || '');
    }
    if (settings.aiLevels) {
      setProactive(settings.aiLevels.proactiveConceptSuggestion);
      setBibliography(settings.aiLevels.automatedBibliography);
      setSynthesis(settings.aiLevels.highIntensitySynthesis);
    }
  }, [settings]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !institution.trim() || !emailAddress.trim() || !countryCode || !phoneNumber.trim()) {
      setError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid phone number (digits only, at least 7 digits).');
      return;
    }

    const updated: UserSettings = {
      ...settings,
      profile: {
        ...settings.profile,
        avatarUrl,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        emailAddress: emailAddress.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        institution: institution.trim(),
        countryCode,
        phoneNumber: cleanPhone,
        onboardingCompleted: true
      }
    };
    onUpdateSettings(updated);
    triggerSaveNotification();
  };

  const fetchConfigStatus = async () => {
    setIsLoadingConfig(true);
    setValidationError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken(true);
      const res = await fetch(`${API_BASE_URL}/api/ai/config-status`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
        if (data.configured) {
          const prov = data.provider || 'gemini';
          let normalized = prov.toLowerCase();
          if (normalized.includes('grok') || normalized.includes('xai')) {
            normalized = 'xai';
          } else if (normalized.includes('claude') || normalized.includes('anthropic')) {
            normalized = 'anthropic';
          } else if (normalized.includes('nvidia') || normalized.includes('glm')) {
            normalized = 'nvidia';
          } else if (normalized.includes('notion')) {
            normalized = 'notion';
          }
          setAiProvider(normalized);
          setSelectedModel(data.selectedModel || PROVIDER_METADATA[normalized]?.defaultModel || '');
        }
      }
    } catch (err) {
      console.error('Error fetching AI config status:', err);
      const localProvider = localStorage.getItem('noteit_active_ai_provider') || 'gemini';
      const hasLocalKey = !!(localStorage.getItem(`noteit_user_api_key_${localProvider}`) || localStorage.getItem('noteit_user_api_key'));
      if (hasLocalKey) {
        setConfigStatus({
          configured: true,
          provider: localProvider,
          maskedKey: '••••••••',
          selectedModel: localStorage.getItem('noteit_active_ai_model') || 'gemini-3.6-flash'
        });
        setAiProvider(localProvider);
        setSelectedModel(localStorage.getItem('noteit_active_ai_model') || 'gemini-3.6-flash');
      }
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const fetchSavedKeys = async () => {
    setLoadingSavedKeys(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/ai/saved-keys`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.savedKeys)) {
          setSavedKeys(data.savedKeys);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch saved API keys:', err);
    } finally {
      setLoadingSavedKeys(false);
    }
  };

  const handleSwitchSavedKey = async (keyId: string) => {
    setSwitchingKeyId(keyId);
    setValidationError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/ai/switch-saved-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ keyId })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('noteit_active_ai_provider', data.provider);
        localStorage.setItem('noteit_active_ai_model', data.model);
        localStorage.setItem('noteit_selected_model', data.model);
        triggerSaveNotification();
        await fetchConfigStatus();
        await fetchSavedKeys();
      } else {
        const errData = await res.json().catch(() => ({}));
        setValidationError(errData.error || 'Failed to switch API key');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to switch API key');
    } finally {
      setSwitchingKeyId(null);
    }
  };

  const handleDeleteSavedKey = async (keyId: string) => {
    if (!window.confirm('Are you sure you want to remove this API key preset from your encrypted vault?')) return;
    setDeletingPresetId(keyId);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/ai/saved-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (res.ok) {
        triggerSaveNotification();
        await fetchSavedKeys();
      }
    } catch (err) {
      console.error('Failed to delete saved key:', err);
    } finally {
      setDeletingPresetId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai' || activeTab === 'usage' || activeTab === 'security') {
      fetchConfigStatus();
      fetchSavedKeys();
    }
  }, [activeTab]);

  // Remove credentials left by versions that persisted API keys in browser
  // storage. Provider/model preferences remain intact.
  useEffect(() => {
    Object.keys(localStorage)
      .filter((key) => /^noteit_.+_api_key$/i.test(key))
      .forEach((key) => localStorage.removeItem(key));
  }, []);

  const handleRevalidateKey = async () => {
    setRevalidating(true);
    setValidationError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Please sign in before validating your API key.');
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/ai/revalidate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to validate the encrypted API key.');
      }
      triggerSaveNotification();
      await fetchConfigStatus();
    } catch (err: any) {
      console.error('Error revalidating key:', err);
      setValidationError(err.message || 'Failed to revalidate API key. Please check network connection.');
    } finally {
      setRevalidating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!window.confirm('Are you sure you want to delete your API key configuration? This will lock your workspace until a new key is validated.')) {
      return;
    }
    setDeletingKey(true);
    setValidationError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/ai/config`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setValidationError(errorData.error || 'Failed to delete API key.');
      }
    } catch (err: any) {
      console.error('Error deleting key:', err);
      setValidationError('Failed to delete key. Please check network connection.');
    } finally {
      setDeletingKey(false);
    }
  };

  const handleSaveNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) {
      setValidationError('Please enter a new API key.');
      return;
    }
    setSavingKey(true);
    setValidationError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      let keyValid = false;
      try {
        const idToken = await currentUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/ai/validate-key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            key: newKey.trim(),
            provider: aiProvider,
            model: selectedModel
          })
        });
        if (res.ok) {
          keyValid = true;
        } else {
          const errorData = await res.json().catch(() => ({}));
          setValidationError(errorData.error || 'Failed to validate API key.');
          return;
        }
      } catch (vaultErr: any) {
        const isFetchOrNetworkErr = vaultErr.name === 'TypeError' || 
          vaultErr.message?.toLowerCase().includes('failed to fetch') ||
          vaultErr.message?.toLowerCase().includes('networkerror');

        if (isFetchOrNetworkErr) {
          console.warn("Backend API server unreachable, running direct client-side key validation fallback...");
          await validateApiKeyDirect(newKey.trim(), aiProvider, selectedModel);
          keyValid = true;
        } else {
          throw vaultErr;
        }
      }

      if (keyValid) {
        localStorage.setItem('noteit_active_ai_provider', aiProvider);
        const activeModel = selectedModel.trim() || PROVIDER_METADATA[aiProvider]?.defaultModel || 'gemini-3.6-flash';
        localStorage.setItem('noteit_active_ai_model', activeModel);
        localStorage.setItem('noteit_selected_model', activeModel);
        localStorage.setItem(`noteit_user_api_key_${aiProvider}`, newKey.trim());
        localStorage.setItem('noteit_user_api_key', newKey.trim());
        setNewKey('');
        setShowReplaceForm(false);
        triggerSaveNotification();
        await fetchConfigStatus().catch(() => {});
      }
    } catch (err: any) {
      console.error('Error saving new key:', err);
      const friendlyMsg = err.message && err.message.toLowerCase().includes('failed to fetch')
        ? 'Network error connecting to validation server. Please check your internet connection and API key.'
        : (err.message || 'Failed to validate key. Check your key and connection.');
      setValidationError(friendlyMsg);
    } finally {
      setSavingKey(false);
    }
  };

  const handleSaveAISettings = () => {
    const updated: UserSettings = {
      ...settings,
      aiLevels: {
        proactiveConceptSuggestion: proactive,
        automatedBibliography: bibliography,
        highIntensitySynthesis: synthesis
      }
    };
    onUpdateSettings(updated);
    triggerSaveNotification();
  };

  const triggerSaveNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 bg-[var(--bg-paper)] p-4 md:p-8 select-none text-[var(--text-primary)]">
      
      {/* Settings Header */}
      <div className="rounded-[6px] border-2 border-[var(--border-main)] bg-[var(--card-bg)] p-6 shadow-paper-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-extrabold text-[var(--text-secondary)] uppercase tracking-[3px] block">
            PREFERENCES & CONFIGURATION
          </span>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[var(--text-primary)] uppercase tracking-tight mt-1">
            ACCOUNT & SYSTEM SETTINGS
          </h1>
          <p className="text-xs font-mono font-bold text-[var(--text-secondary)] mt-1">
            Manage your academic identity, visual themes, AI providers, API keys, and cognitive parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Navigation Sidebar */}
        <div className="md:col-span-1 rounded-[6px] border-2 border-[var(--border-main)] bg-[var(--card-bg)] p-3 shadow-paper-md flex flex-col gap-2 h-fit">
          <span className="text-[10px] font-mono font-extrabold text-[var(--text-secondary)] uppercase tracking-[3px] px-2 py-1">
            NAVIGATION
          </span>

          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'appearance', label: 'Theme & Appearance', icon: Sun },
            { id: 'rewards', label: 'Rewards & XP', icon: Trophy, badge: 'NEW' },
            { id: 'notifications', label: 'Push Notifications', icon: Bell },
            { id: 'ai', label: 'AI Provider Keys', icon: Sparkles },
            { id: 'usage', label: 'Usage & Costs', icon: Activity },
            { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
            { id: 'billing', label: 'Billing & Plan', icon: CreditCard }
          ].map(tab => {

            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[4px] border-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC400] text-[#111111] border-[var(--border-main)] shadow-paper-sm font-extrabold translate-x-1'
                    : 'bg-[var(--card-bg)] text-[var(--text-primary)] border-transparent hover:border-[var(--border-main)] hover:bg-[var(--hover-bg)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      {/* Main Settings Form Block (3 Columns) */}
      <div className="md:col-span-3 rounded-[6px] border-2 border-[var(--border-main)] bg-[var(--card-bg)] p-6 shadow-paper-md relative text-[var(--text-primary)]">
        
        {saveSuccess && (
          <div className="absolute top-4 right-6 rounded-[4px] border-2 border-[var(--border-main)] bg-[#19B56B] text-white px-3.5 py-1.5 text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-paper-sm z-50">
            <Check className="h-4 w-4" />
            <span>SETTINGS SAVED SUCCESSFULLY</span>
          </div>
        )}

        {/* Tab: Theme & Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 text-left">
            <div>
              <h3 className="font-heading font-extrabold text-lg uppercase text-[var(--text-primary)] flex items-center gap-2">
                <Sun className="h-5 w-5 text-[#FFC400]" />
                Theme & Visual Appearance
              </h3>
              <p className="text-xs font-mono font-bold text-[var(--text-secondary)] mt-1">
                Customize the color palette and interface format for NoteIT. Choose between our Dark Navy Blue Bauhaus theme and Classic Light Bauhaus theme.
              </p>
            </div>

            {/* Theme Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* Option 1: Dark Navy Blue Theme */}
              <div 
                onClick={() => {
                  if (setTheme) setTheme('dark');
                  onUpdateSettings({
                    ...settings,
                    profile: { ...settings.profile, theme: 'dark' }
                  });
                  triggerSaveNotification();
                }}
                className={`rounded-[8px] border-2 p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 shadow-paper-md ${
                  theme === 'dark'
                    ? 'border-[#FFC400] bg-[#0A1124] ring-2 ring-[#FFC400]'
                    : 'border-[var(--border-main)] bg-[#0A1124] opacity-85 hover:opacity-100 hover:-translate-y-1'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                      <Moon className="h-4 w-4 text-[#FFC400]" />
                      Dark Navy Blue (Bauhaus)
                    </span>
                    {theme === 'dark' && (
                      <span className="rounded-[4px] bg-[#FFC400] text-[#0A1124] px-2 py-0.5 text-[10px] font-extrabold font-mono border border-[#FFC400]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[#94A3B8] leading-relaxed">
                    Deep slate navy blue palette (`#0A1124`) engineered for night research sessions and zero eye fatigue. Crisp high-contrast slate-white typography with yellow & electric blue Bauhaus accents.
                  </p>

                  {/* Color Swatch Preview */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-6 w-6 rounded border border-[#2A3B5C] bg-[#0A1124]" title="Base Navy (#0A1124)" />
                    <div className="h-6 w-6 rounded border border-[#2A3B5C] bg-[#152238]" title="Card Panel (#152238)" />
                    <div className="h-6 w-6 rounded border border-[#2A3B5C] bg-[#FFC400]" title="Bauhaus Yellow (#FFC400)" />
                    <div className="h-6 w-6 rounded border border-[#2A3B5C] bg-[#38BDF8]" title="Electric Blue (#38BDF8)" />
                    <div className="h-6 w-6 rounded border border-[#2A3B5C] bg-[#FF5353]" title="Coral Red (#FF5353)" />
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full py-2 text-xs font-mono font-extrabold uppercase rounded-[4px] border-2 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#FFC400] text-[#0A1124] border-[#FFC400]'
                      : 'bg-transparent text-[#F1F5F9] border-[#2A3B5C] hover:bg-[#152238]'
                  }`}
                >
                  {theme === 'dark' ? 'Theme Selected' : 'Apply Dark Blue Theme'}
                </button>
              </div>

              {/* Option 2: Classic Light Theme */}
              <div 
                onClick={() => {
                  if (setTheme) setTheme('light');
                  onUpdateSettings({
                    ...settings,
                    profile: { ...settings.profile, theme: 'light' }
                  });
                  triggerSaveNotification();
                }}
                className={`rounded-[8px] border-2 p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 shadow-paper-md ${
                  theme === 'light'
                    ? 'border-[#FFC400] bg-[#F6F2EA] ring-2 ring-[#FFC400]'
                    : 'border-[var(--border-main)] bg-[#F6F2EA] opacity-85 hover:opacity-100 hover:-translate-y-1'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                      <Sun className="h-4 w-4 text-[#111111]" />
                      Classic Light (Bauhaus)
                    </span>
                    {theme === 'light' && (
                      <span className="rounded-[4px] bg-[#FFC400] text-[#111111] px-2 py-0.5 text-[10px] font-extrabold font-mono border border-[#111111]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[#666666] leading-relaxed">
                    Classic cream paper canvas (`#F6F2EA`) inspired by physical academic notebooks and industrial print typography. Stark black geometric outlines and rich yellow callout blocks.
                  </p>

                  {/* Color Swatch Preview */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-6 w-6 rounded border border-[#111111] bg-[#F6F2EA]" title="Paper Cream (#F6F2EA)" />
                    <div className="h-6 w-6 rounded border border-[#111111] bg-[#FFFFFF]" title="White Surface (#FFFFFF)" />
                    <div className="h-6 w-6 rounded border border-[#111111] bg-[#111111]" title="Industrial Black (#111111)" />
                    <div className="h-6 w-6 rounded border border-[#111111] bg-[#FFC400]" title="Bauhaus Yellow (#FFC400)" />
                    <div className="h-6 w-6 rounded border border-[#111111] bg-[#FF4D4D]" title="Bauhaus Red (#FF4D4D)" />
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full py-2 text-xs font-mono font-extrabold uppercase rounded-[4px] border-2 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#FFC400] text-[#111111] border-[#111111]'
                      : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFF8D6]'
                  }`}
                >
                  {theme === 'light' ? 'Theme Selected' : 'Apply Light Theme'}
                </button>
              </div>
            </div>

            {/* Guided Tour Reset Callout Banner */}
            <div className="mt-6 p-4 rounded-[6px] border-2 border-[var(--border-main)] bg-[var(--panel-bg)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-heading font-extrabold text-sm uppercase text-[var(--text-primary)] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#2F6BFF]" />
                  Interactive Feature Tour
                </h4>
                <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  Re-play the step-by-step anchored popover tour to walk through Capture Live, Subject Maps, Library, and Quiz Mode.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('noteit_guided_tour_completed');
                  window.dispatchEvent(new CustomEvent('noteit_start_guided_tour'));
                }}
                className="px-4 py-2 bg-[#2F6BFF] text-white hover:bg-[#255CD9] font-mono text-xs font-bold uppercase rounded-[4px] border-2 border-[var(--border-main)] shadow-paper-sm shrink-0 transition-all cursor-pointer"
              >
                Re-take Guided Tour
              </button>
            </div>
          </div>
        )}

        {/* Tab: Rewards & XP */}
        {activeTab === 'rewards' && (
          <div className="space-y-6 text-left">
            <div>
              <h3 className="font-heading font-extrabold text-lg uppercase text-[var(--text-primary)] flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#FFC400]" />
                Rewards & XP System
              </h3>
              <p className="text-xs font-mono font-bold text-[var(--text-secondary)] mt-1">
                Access the full-page NoteIT Rewards Store to redeem gift cards, pro subscription passes, and AI perks with your earned XP.
              </p>
            </div>

            <div className="rounded-[8px] border-2 border-[var(--border-main)] bg-[var(--panel-bg)] p-6 shadow-paper-md space-y-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#FFC400] text-[#111111] text-[10px] font-mono font-extrabold border border-[var(--border-main)] uppercase shadow-paper-sm">
                    <Zap className="h-3.5 w-3.5" />
                    GAMIFIED ACADEMIC MASTERY
                  </span>
                  <h4 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] uppercase tracking-tight mt-1">
                    REWARDS & XP STORE
                  </h4>
                  <p className="text-xs font-mono text-[var(--text-secondary)] max-w-xl leading-relaxed">
                    Every lecture captured, summary created, and quiz completed earns you Experience Points (XP). Level up your rank from Knowledge Seeker to Apex Knowledge Titan and claim real rewards!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage('rewards')}
                  className="px-6 py-4 rounded-[6px] border-2 border-[var(--border-main)] bg-[#FFC400] text-[#111111] font-mono text-sm font-extrabold uppercase hover:bg-[#ffe066] hover:-translate-y-0.5 transition-all shadow-paper-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Trophy className="h-5 w-5" />
                  <span>OPEN REWARDS PAGE</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              {/* Status Overview Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono">
                <div className="p-4 bg-[var(--card-bg)] rounded-[6px] border-2 border-[var(--border-main)] shadow-paper-sm">
                  <div className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">XP BALANCE</div>
                  <div className="text-xl font-extrabold text-[#FFC400] mt-1 flex items-center gap-1">
                    <Zap className="h-5 w-5 fill-[#FFC400]" />
                    <span>0 XP</span>
                  </div>
                </div>

                <div className="p-4 bg-[var(--card-bg)] rounded-[6px] border-2 border-[var(--border-main)] shadow-paper-sm">
                  <div className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">CURRENT RANK</div>
                  <div className="text-sm font-extrabold text-[var(--text-primary)] mt-1">LEVEL 01</div>
                  <div className="text-[11px] font-bold text-[#38BDF8]">KNOWLEDGE SEEKER</div>
                </div>

                <div className="p-4 bg-[var(--card-bg)] rounded-[6px] border-2 border-[var(--border-main)] shadow-paper-sm">
                  <div className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">DAILY STREAK</div>
                  <div className="text-xl font-extrabold text-[#FF5353] mt-1 flex items-center gap-1">
                    <span>🔥 0 DAYS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Push Notifications */}
        {activeTab === 'notifications' && (
          <NotificationSettingsSection onTriggerSave={triggerSaveNotification} />
        )}

        {/* Tab 1: User Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-5 text-left">
            <div>
              <h3 className="font-heading font-extrabold text-lg uppercase text-[var(--text-primary)]">User Profile</h3>
              <p className="text-xs font-mono font-bold text-[var(--text-secondary)] mt-1">Configure your primary academic researcher identification and institutional information.</p>
            </div>

            {/* Dedicated REWARDS & XP Card (Requirement 3) */}
            <div className="p-5 rounded-[6px] border-2 border-[var(--border-main)] bg-[var(--panel-bg)] space-y-4 shadow-paper-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-[#19B56B] uppercase tracking-[2px] block">
                    GAMIFIED ACADEMIC MASTERY
                  </span>
                  <h4 className="font-heading font-extrabold text-lg text-[var(--text-primary)] uppercase tracking-tight mt-0.5">
                    REWARDS & XP
                  </h4>
                  <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                    Turn your learning activity into XP and unlock useful rewards.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage('rewards')}
                  className="px-4 py-2.5 rounded-[4px] border-2 border-[var(--border-main)] bg-[#FFC400] text-[#111111] font-mono text-xs font-extrabold uppercase hover:bg-[#ffe066] transition-all shadow-paper-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>OPEN REWARDS PAGE</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Stats Overview Pill */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs text-[var(--text-primary)]">
                <div className="p-3 bg-[var(--card-bg)] rounded-[4px] border border-[var(--border-main)] shadow-paper-sm">
                  <div className="text-[9px] uppercase text-[var(--text-secondary)] font-bold">Current XP Balance</div>
                  <div className="text-lg font-extrabold text-[#FFC400] mt-0.5">0 XP</div>
                </div>

                <div className="p-3 bg-[var(--card-bg)] rounded-[4px] border border-[var(--border-main)] shadow-paper-sm">
                  <div className="text-[9px] uppercase text-[var(--text-secondary)] font-bold">Current Level</div>
                  <div className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">LEVEL 01 — KNOWLEDGE SEEKER</div>
                </div>

                <div className="p-3 bg-[var(--card-bg)] rounded-[4px] border border-[var(--border-main)] shadow-paper-sm">
                  <div className="text-[9px] uppercase text-[var(--text-secondary)] font-bold">Next Level Target</div>
                  <div className="text-xs font-extrabold text-[#38BDF8] mt-1">0 / 500 XP (500 XP to Lvl 2)</div>
                </div>
              </div>
            </div>

            {/* Official Mascot Avatar Picker */}
            <MascotAvatarPicker
              currentAvatarUrl={avatarUrl}
              onSelectAvatar={(url) => setAvatarUrl(url)}
              userInitial={firstName ? firstName.charAt(0) : 'U'}
            />

            {error && (
              <div className="rounded-[6px] border-2 border-[#111111] bg-[#FF4D4D]/15 p-3 flex items-start gap-2 text-[#111111]">
                <span className="text-xs font-mono font-bold text-[#FF4D4D]">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-extrabold text-[#111111] uppercase mb-1">FIRST NAME</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] p-3 text-xs font-mono font-bold text-[#111111] outline-none shadow-paper-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-extrabold text-[#111111] uppercase mb-1">LAST NAME</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] p-3 text-xs font-mono font-bold text-[#111111] outline-none shadow-paper-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-extrabold text-[#111111] uppercase mb-1">UNIVERSITY / SCHOOL NAME</label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] p-3 text-xs font-mono font-bold text-[#111111] outline-none shadow-paper-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-extrabold text-[#111111] uppercase mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] p-3 text-xs font-mono font-bold text-[#111111] outline-none shadow-paper-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[10px] font-mono font-extrabold text-[#111111] uppercase mb-1">CODE</label>
                <select
                  required
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] p-3 text-xs font-mono font-bold text-[#111111] outline-none cursor-pointer shadow-paper-sm"
                >
                  <option value="" disabled>Select</option>
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-mono font-extrabold text-[#111111] uppercase mb-1">PHONE NUMBER</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] p-3 text-xs font-mono font-bold text-[#111111] outline-none shadow-paper-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#111111] flex justify-end">
              <button
                type="submit"
                className="rounded-[6px] border-2 border-[#111111] bg-[#FFC400] text-[#111111] font-mono text-xs font-extrabold uppercase px-5 py-2.5 shadow-paper-sm hover:bg-[#ffe066] transition-all cursor-pointer"
              >
                Save Profile Outlines
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: AI Provider Keys */}
        {activeTab === 'ai' && (
          <div className="space-y-5 text-left">
            <div>
              <h3 className="font-heading font-extrabold text-lg uppercase text-[#111111]">AI Generator & Provider Keys</h3>
              <p className="text-xs font-mono font-bold text-[#666666] mt-1">Calibrate model parameters according to your reading and cognitive retention speed.</p>
            </div>

            {validationError && (
              <div className="rounded-[6px] border-2 border-[#111111] bg-[#FF4D4D]/15 p-3 flex items-start gap-2">
                <div className="text-xs font-mono font-bold text-[#FF4D4D]">{validationError}</div>
              </div>
            )}

            {isLoadingConfig ? (
              <div className="p-8 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-6 w-6 text-[#2F6BFF] animate-spin" />
                <span className="text-xs font-mono font-bold text-[#666666]">Fetching API Key telemetry...</span>
              </div>
            ) : (
              <div className="space-y-5">
                {/* AI Connection Telemetry Card */}
                <div className="p-5 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
                    <div>
                      <h4 className="text-xs font-heading font-extrabold uppercase text-[#111111]">AI Connection Telemetry</h4>
                      <p className="text-[10px] font-mono font-bold text-[#666666] mt-0.5">Real-time status of your secure Bring Your Own Key configuration.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-[4px] border border-[#111111] bg-[#FFC400] text-[#111111] text-[9px] font-mono font-extrabold uppercase">
                        {configStatus?.lastHealthCheck?.status || 'HEALTHY'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-[4px] border border-[#111111] bg-[#19B56B] text-white text-[9px] font-mono font-extrabold uppercase">
                        {configStatus?.configured ? 'CONNECTED' : 'NOT CONFIG'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono font-bold text-[#111111]">
                    <div>
                      <div className="text-[9px] uppercase text-[#666666]">AI Provider</div>
                      <div className="mt-1 font-extrabold">
                        {PROVIDER_METADATA[configStatus?.provider || '']?.name || configStatus?.provider || 'Google Gemini'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-[#666666]">Active Model</div>
                      <div className="mt-1 font-extrabold text-[#2F6BFF]">
                        {configStatus?.selectedModel || 'gemini-2.0-flash'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-[#666666]">Security Cipher</div>
                      <div className="mt-1 font-extrabold flex items-center gap-1">
                        <Lock className="h-3 w-3 text-[#2F6BFF]" />
                        <span>AES-256-GCM</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-[#666666]">Key Source</div>
                      <div className="mt-1 font-extrabold text-[#19B56B]">
                        {configStatus?.keySource === 'user-byok' ? 'Your API key (BYOK)' : 'No key configured'}
                      </div>
                    </div>
                  </div>

                  {configStatus?.platformQuotaAvailable && (
                    <p className="text-[10px] font-mono font-bold text-[#666666] border-t-2 border-[#111111] pt-3">
                      Platform quota is available only when explicitly enabled for a request; normal generation uses your configured BYOK key.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2.5 pt-3 border-t-2 border-[#111111]">
                    <button
                      onClick={handleRevalidateKey}
                      disabled={revalidating || !configStatus?.configured}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border-2 border-[#111111] bg-white text-[#111111] text-xs font-mono font-extrabold uppercase hover:bg-[#FFC400] transition-all shadow-paper-sm cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${revalidating ? 'animate-spin' : ''}`} />
                      <span>Validate Key</span>
                    </button>

                    <button
                      onClick={() => setShowReplaceForm(!showReplaceForm)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border-2 border-[#111111] bg-[#2F6BFF] text-white text-xs font-mono font-extrabold uppercase hover:bg-[#255cd9] transition-all shadow-paper-sm cursor-pointer"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>{showReplaceForm ? 'Hide Form' : 'Change Provider'}</span>
                    </button>

                    <button
                      onClick={handleDeleteKey}
                      disabled={deletingKey || !configStatus?.configured}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border-2 border-[#111111] bg-[#FF4D4D] text-white text-xs font-mono font-extrabold uppercase hover:bg-red-700 transition-all shadow-paper-sm cursor-pointer ml-auto disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Active Key</span>
                    </button>
                  </div>
                </div>

                {/* SAVED KEYS & BACKUP PRESETS ENCRYPTED VAULT CARD */}
                <div className="p-5 rounded-[6px] border-2 border-[#111111] bg-white space-y-4 shadow-paper-sm text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
                    <div>
                      <span className="text-[10px] font-mono font-extrabold text-[#19B56B] uppercase tracking-[2px] block flex items-center gap-1">
                        <Lock className="h-3 w-3 text-[#19B56B]" />
                        AES-256 ENCRYPTED KEY VAULT
                      </span>
                      <h4 className="text-sm font-heading font-extrabold uppercase text-[#111111] mt-0.5">
                        Saved API Key Presets & Backup Keys
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-[#666666] mt-0.5">
                        Store multiple API keys & models for 1-click switching and automatic failover if rate limits (429/quota) occur.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReplaceForm(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border-2 border-[#111111] bg-[#FFC400] text-[#111111] text-xs font-mono font-extrabold uppercase hover:bg-[#ffe066] transition-all shadow-paper-sm shrink-0 cursor-pointer"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>+ Add Key Preset</span>
                    </button>
                  </div>

                  {loadingSavedKeys ? (
                    <div className="py-4 text-center text-xs font-mono text-[#666666] animate-pulse">Loading saved key vault...</div>
                  ) : savedKeys.length === 0 ? (
                    <div className="p-4 rounded-[6px] border-2 border-dashed border-[#111111] bg-[#F6F2EA] text-center space-y-1">
                      <p className="text-xs font-mono font-bold text-[#111111]">No saved backup API key presets in vault yet.</p>
                      <p className="text-[10px] font-mono text-[#666666]">Add backup keys from OpenAI, Gemini, Groq, or OpenRouter so your workspace automatically switches if quota limits are reached.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {savedKeys.map((preset) => (
                        <div
                          key={preset.id}
                          className={`p-3.5 rounded-[6px] border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            preset.isActive
                              ? 'border-[#10B981] bg-[#F0FDF4] shadow-paper-xs'
                              : 'border-[#111111] bg-[#F6F2EA]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded border-2 ${preset.isActive ? 'bg-[#10B981] text-white border-[#065F46]' : 'bg-white text-[#111111] border-[#111111]'}`}>
                              <Key className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-extrabold uppercase text-[#111111]">{preset.label}</span>
                                {preset.isActive && (
                                  <span className="px-2 py-0.5 rounded-[4px] bg-[#10B981] text-white text-[9px] font-mono font-extrabold border border-[#065F46] uppercase">
                                    ACTIVE KEY
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono font-bold text-[#666666] flex items-center gap-2 mt-0.5">
                                <span>Key: <code className="bg-white px-1.5 py-0.5 rounded border border-[#111111] text-[#111111]">{preset.maskedKey}</code></span>
                                <span>Model: <span className="text-[#2F6BFF] font-extrabold">{preset.model}</span></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!preset.isActive && (
                              <button
                                type="button"
                                disabled={switchingKeyId === preset.id}
                                onClick={() => handleSwitchSavedKey(preset.id)}
                                className="px-3 py-1.5 rounded-[4px] border-2 border-[#111111] bg-[#2F6BFF] text-white text-[11px] font-mono font-extrabold uppercase hover:bg-[#255cd9] transition-all cursor-pointer shadow-paper-xs disabled:opacity-50"
                              >
                                {switchingKeyId === preset.id ? 'Switching...' : 'Use as Active Key'}
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={deletingPresetId === preset.id}
                              onClick={() => handleDeleteSavedKey(preset.id)}
                              className="p-1.5 rounded-[4px] border-2 border-[#111111] bg-white text-[#FF4D4D] hover:bg-red-50 transition-all cursor-pointer"
                              title="Remove preset"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Replace Key Form */}
                {showReplaceForm && (
                  <form onSubmit={handleSaveNewKey} className="p-5 rounded-[6px] border-2 border-[#111111] bg-white space-y-4 shadow-paper-md text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
                      <div>
                        <h4 className="text-xs font-heading font-extrabold uppercase text-[#111111]">Configure AI Provider Connection</h4>
                        <p className="text-[10px] font-mono font-bold text-[#666666] mt-0.5">Your key is decrypted only during model requests and is encrypted server-side.</p>
                      </div>

                      {/* DIRECT BUTTON TO GOOGLE AI STUDIO / PROVIDER API KEY PORTAL */}
                      {PROVIDER_METADATA[aiProvider]?.getKeyLink && (
                        <a
                          href={PROVIDER_METADATA[aiProvider].getKeyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border-2 border-[#111111] bg-[#2563EB] text-white text-xs font-mono font-extrabold uppercase hover:bg-blue-700 transition-all shadow-paper-sm shrink-0 cursor-pointer"
                        >
                          <Key className="h-3.5 w-3.5" />
                          <span>Get {PROVIDER_METADATA[aiProvider].name} API Key</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    {/* DIRECT HELP BANNER FOR GETTING API KEY */}
                    <div className="p-3.5 rounded-[6px] border-2 border-[#111111] bg-[#EFF6FF] dark:bg-[#1E293B] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-md bg-[#2563EB] text-white shrink-0">
                          <Key className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-mono font-extrabold uppercase text-[#111111] dark:text-white">
                            Need an API Key for {PROVIDER_METADATA[aiProvider]?.name || 'Google Gemini'}?
                          </h5>
                          <p className="text-[10px] font-mono font-bold text-[#475569] dark:text-slate-300">
                            Click to open {PROVIDER_METADATA[aiProvider]?.name || 'Google AI Studio'} directly in a new tab and create your free key.
                          </p>
                        </div>
                      </div>
                      {PROVIDER_METADATA[aiProvider]?.getKeyLink && (
                        <a
                          href={PROVIDER_METADATA[aiProvider].getKeyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] border-2 border-[#111111] bg-[#FFC400] text-[#111111] text-[11px] font-mono font-extrabold uppercase hover:bg-[#ffe066] transition-all shadow-paper-xs shrink-0 cursor-pointer"
                        >
                          <span>Open Site ↗</span>
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Searchable Dropdown Selector */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[9px] font-mono font-extrabold uppercase text-[#111111] block">AI Provider</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen((prev) => !prev);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center justify-between rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] p-2.5 text-xs font-mono font-bold text-[#111111] outline-none shadow-paper-sm cursor-pointer"
                          >
                            <span>{PROVIDER_METADATA[aiProvider]?.name || 'Select...'}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-[#111111]" />
                          </button>

                          {isDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                              />
                              <div className="absolute z-50 mt-1.5 w-full rounded-[6px] border-2 border-[#111111] bg-white shadow-paper-lg p-2.5 space-y-2 text-[#111111]">
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#111111]" />
                                  <input
                                    type="text"
                                    name="search_ai_provider_settings_no_autofill"
                                    id="search_ai_provider_settings_no_autofill"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    aria-autocomplete="none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search providers..."
                                    className="w-full rounded-[4px] border-2 border-[#111111] bg-[#F6F2EA] pl-8 pr-7 py-1 text-[11px] font-mono font-bold outline-none"
                                  />
                                  {searchQuery && (
                                    <button
                                      type="button"
                                      onClick={() => setSearchQuery('')}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black font-bold text-xs p-0.5"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-0.5">
                                  {Object.entries(PROVIDER_METADATA)
                                    .filter(([_, meta]) => meta.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
                                    .map(([key, meta]) => (
                                      <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                          setAiProvider(key);
                                          setSelectedModel(meta.defaultModel);
                                          setIsDropdownOpen(false);
                                          setSearchQuery('');
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono font-bold flex items-center justify-between cursor-pointer hover:bg-[#FFC400] transition-colors ${
                                          aiProvider === key ? 'bg-[#FFC400]' : ''
                                        }`}
                                      >
                                        <span>{meta.name}</span>
                                        {aiProvider === key && <Check className="h-3 w-3" />}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Model Select */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-extrabold uppercase text-[#111111] block">Active Model</label>
                        <select
                          value={PROVIDER_METADATA[aiProvider]?.models.includes(selectedModel) ? selectedModel : 'custom'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setSelectedModel('');
                            } else {
                              setSelectedModel(val);
                              localStorage.setItem('noteit_active_ai_model', val);
                              localStorage.setItem('noteit_selected_model', val);
                            }
                          }}
                          className="w-full rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] p-2.5 text-xs font-mono font-bold text-[#111111] outline-none shadow-paper-sm cursor-pointer"
                        >
                          {PROVIDER_METADATA[aiProvider]?.models.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                          <option value="custom">Custom (Type below)</option>
                        </select>
                        
                        {!PROVIDER_METADATA[aiProvider]?.models.includes(selectedModel) && (
                          <input
                            type="text"
                            placeholder={`Enter custom ${PROVIDER_METADATA[aiProvider]?.name} model ID (e.g. gemini-2.0-flash)`}
                            value={selectedModel === 'custom' ? '' : selectedModel}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedModel(val);
                              if (val.trim()) {
                                localStorage.setItem('noteit_active_ai_model', val.trim());
                                localStorage.setItem('noteit_selected_model', val.trim());
                              }
                            }}
                            className="w-full mt-2 rounded-[6px] border-2 border-[#111111] bg-white p-2.5 text-xs font-mono font-bold text-[#111111] outline-none shadow-paper-sm"
                          />
                        )}
                      </div>

                      {/* API Key */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-mono font-extrabold uppercase text-[#111111] dark:text-slate-300 block">New API Key *</label>
                          {PROVIDER_METADATA[aiProvider]?.getKeyLink && (
                            <a
                              href={PROVIDER_METADATA[aiProvider].getKeyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono font-extrabold text-[#2563EB] hover:text-blue-700 hover:underline flex items-center gap-1"
                            >
                              <span>Get Key ↗</span>
                            </a>
                          )}
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type={showNewKeyPassword ? "text" : "password"}
                            required
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder={`Secret key for ${PROVIDER_METADATA[aiProvider]?.name}`}
                            className={`w-full rounded-[6px] border-2 px-3 py-2.5 pr-10 text-xs font-mono font-extrabold outline-none shadow-paper-sm transition-all ${
                              newKey.trim()
                                ? 'border-[#10B981] bg-[#F0FDF4] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#A7F3D0]'
                                : 'border-[#111111] bg-white dark:bg-[#0D1117] text-[#0F172A] dark:text-white placeholder-[#777777]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewKeyPassword(!showNewKeyPassword)}
                            className="absolute right-2.5 p-1 text-[#475569] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white cursor-pointer bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700"
                            title={showNewKeyPassword ? "Hide API key" : "Show API key"}
                          >
                            {showNewKeyPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowReplaceForm(false);
                          setNewKey('');
                          setValidationError(null);
                        }}
                        className="px-3.5 py-2 rounded-[6px] border-2 border-[#111111] bg-white text-[#111111] text-xs font-mono font-extrabold uppercase hover:bg-gray-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingKey}
                        className="flex items-center gap-1.5 px-4.5 py-2 rounded-[6px] border-2 border-[#111111] bg-[#FFC400] text-[#111111] text-xs font-mono font-extrabold uppercase hover:bg-[#ffe066] cursor-pointer shadow-paper-sm"
                      >
                        {savingKey ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Validating...</span>
                          </>
                        ) : (
                          <span>Save & Connect</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Checkbox Parameters */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start justify-between gap-4 p-4 border-2 border-[#111111] rounded-[6px] bg-[#F6F2EA]">
                <div className="flex-1">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-[#111111]">Proactive Concept Suggestion</h4>
                  <p className="text-[11px] font-mono text-[#666666] font-bold mt-0.5">
                    Automatically recommend linked articles and weak-topics material in your dashboard based on note contexts.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={proactive}
                  onChange={(e) => setProactive(e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-[#111111] accent-[#2F6BFF] cursor-pointer mt-0.5"
                />
              </div>

              <div className="flex items-start justify-between gap-4 p-4 border-2 border-[#111111] rounded-[6px] bg-[#F6F2EA]">
                <div className="flex-1">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-[#111111]">Automated Bibliography Generation</h4>
                  <p className="text-[11px] font-mono text-[#666666] font-bold mt-0.5">
                    Precompile standard LaTeX style citations references for uploaded PDFs or external research paper URLs.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={bibliography}
                  onChange={(e) => setBibliography(e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-[#111111] accent-[#2F6BFF] cursor-pointer mt-0.5"
                />
              </div>

              <div className="flex items-start justify-between gap-4 p-4 border-2 border-[#111111] rounded-[6px] bg-[#F6F2EA]">
                <div className="flex-1">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-[#111111]">High-Intensity Synthesis Engine</h4>
                  <p className="text-[11px] font-mono text-[#666666] font-bold mt-0.5">
                    Apply deeper token-scanning parameters for massive 100+ page textbook outlines.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={synthesis}
                  disabled={settings.subscription.planName === 'BYOK'}
                  onChange={(e) => setSynthesis(e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-[#111111] accent-[#2F6BFF] cursor-pointer mt-0.5 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#111111] flex justify-end">
              <button
                onClick={handleSaveAISettings}
                className="rounded-[6px] border-2 border-[#111111] bg-[#FFC400] text-[#111111] font-mono text-xs font-extrabold uppercase px-5 py-2.5 shadow-paper-sm hover:bg-[#ffe066] transition-all cursor-pointer"
              >
                Save Parameters
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Usage & Costs */}
        {activeTab === 'usage' && (() => {
          const metrics = getDynamicUsageMetrics();
          return (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading font-extrabold text-lg uppercase text-[#111111]">Usage Telemetry & Dynamic Cost Calculations</h3>
                  <p className="text-xs font-mono font-bold text-[#666666] mt-1">Real-time tracking of API calls, token bandwidth, provider cost estimation, and daily reset cycles.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetTelemetryNow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border-2 border-[#111111] bg-white text-[#111111] text-[10px] font-mono font-extrabold uppercase hover:bg-[#FFC400] transition-colors cursor-pointer shadow-paper-xs shrink-0 self-start sm:self-auto"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset Today's Telemetry</span>
                </button>
              </div>

              {/* DAILY RESET COUNTDOWN BANNER (SPECIALLY DESIGNED FOR GEMINI API DAILY RESET AT 00:00 UTC) */}
              <div className="p-4 rounded-[6px] border-2 border-[#111111] bg-[#152238] text-white shadow-paper-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
                    </span>
                    <span className="text-xs font-extrabold uppercase text-[#FFC400] tracking-wide">
                      {metrics.provName} DAILY QUOTA RESET CYCLE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Daily API call limits ({metrics.dailyRequestLimit.toLocaleString()} Requests/Day) automatically reset every 24 hours at <strong>00:00 UTC (Midnight)</strong>.
                  </p>
                </div>

                <div className="bg-[#0A1124] border border-[#2A3B5C] rounded-[6px] px-3.5 py-2 text-center shrink-0">
                  <div className="text-[9px] uppercase font-bold text-[#94A3B8]">Next Reset In</div>
                  <div className="text-sm font-black text-[#38BDF8] tracking-wider mt-0.5">{resetCountdown || 'Calculating...'}</div>
                </div>
              </div>

              {/* 4 DYNAMIC TELEMETRY STAT CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div className="p-4 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] shadow-paper-sm">
                  <div className="text-[9px] font-bold uppercase text-[#666666]">Today's API Calls</div>
                  <div className="mt-1.5 text-2xl font-black text-[#111111]">{telemetry.todayRequests}</div>
                  <div className="text-[9px] font-bold text-[#666666] mt-1">Limit: {metrics.dailyRequestLimit.toLocaleString()} RPD</div>
                </div>

                <div className="p-4 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] shadow-paper-sm">
                  <div className="text-[9px] font-bold uppercase text-[#666666]">Active Token Usage</div>
                  <div className="mt-1.5 text-2xl font-black text-[#2F6BFF]">
                    {metrics.totalMonthlyTokens >= 1000000 
                      ? `${(metrics.totalMonthlyTokens / 1000000).toFixed(2)}M`
                      : `${(metrics.totalMonthlyTokens / 1000).toFixed(1)}K`
                    }
                  </div>
                  <div className="text-[9px] font-bold text-[#666666] mt-1">Today: {(telemetry.todayTokens / 1000).toFixed(1)}K</div>
                </div>

                <div className="p-4 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] shadow-paper-sm">
                  <div className="text-[9px] font-bold uppercase text-[#666666]">Estimated Cost</div>
                  <div className="mt-1.5 text-2xl font-black text-[#19B56B]">
                    {metrics.isFreeTier ? '₹0.00' : `₹${metrics.estimatedCostINR}`}
                  </div>
                  <div className="text-[9px] font-bold text-[#666666] mt-1">
                    {metrics.isFreeTier ? 'Free Tier API Key' : 'Pay-As-You-Go Rate'}
                  </div>
                </div>

                <div className="p-4 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] shadow-paper-sm">
                  <div className="text-[9px] font-bold uppercase text-[#666666]">Avg Response Speed</div>
                  <div className="mt-1.5 text-2xl font-black text-[#111111]">
                    {telemetry.avgResponseSpeedSec}s
                  </div>
                  <div className="text-[9px] font-bold text-[#666666] mt-1">Latency Index</div>
                </div>
              </div>

              {/* DYNAMIC TOKEN UTILIZATION BAR */}
              <div className="p-4 rounded-[6px] border-2 border-[#111111] bg-white shadow-paper-sm space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono font-extrabold uppercase text-[#111111]">
                  <span>MONTHLY TOKEN BANDWIDTH UTILIZATION</span>
                  <span className="text-[#2F6BFF]">
                    {metrics.bandwidthPercentage}% ({ (metrics.totalMonthlyTokens / 1000).toFixed(1) }K / { (metrics.maxMonthlyQuota / 1000000).toFixed(1) }M Tokens)
                  </span>
                </div>
                <div className="w-full bg-[#F6F2EA] border border-[#111111] rounded-full h-3.5 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metrics.bandwidthPercentage > 80 ? 'bg-[#FF4D4D]' : metrics.bandwidthPercentage > 50 ? 'bg-[#FFC400]' : 'bg-[#2F6BFF]'
                    }`}
                    style={{ width: `${Math.max(1, metrics.bandwidthPercentage)}%` }}
                  />
                </div>
              </div>

              {/* DYNAMIC DIAGNOSTICS GRID */}
              <div className="grid grid-cols-3 gap-3 text-xs font-mono font-bold">
                <div className="p-3 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA]">
                  <span className="text-[9px] uppercase text-[#666666] block">Failed Requests</span>
                  <span className="text-sm font-extrabold text-[#111111]">{telemetry.failedRequests} Errors</span>
                </div>
                <div className="p-3 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA]">
                  <span className="text-[9px] uppercase text-[#666666] block">Rate Limits (429)</span>
                  <span className="text-sm font-extrabold text-[#111111]">{telemetry.rateLimits429} Throttled</span>
                </div>
                <div className="p-3 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA]">
                  <span className="text-[9px] uppercase text-[#666666] block">Server Faults (503)</span>
                  <span className="text-sm font-extrabold text-[#111111]">{telemetry.serverFaults503} Failures</span>
                </div>
              </div>

              {/* PROVIDER QUOTAS & LIMITS TABLE */}
              <div className="p-4 rounded-[6px] border-2 border-[#111111] bg-white space-y-3 font-mono shadow-paper-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-extrabold uppercase text-[#111111]">
                    Active Provider Limits ({metrics.provName})
                  </span>
                  <span className="text-[10px] font-bold text-[#666666]">Reset: Daily at 00:00 UTC</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-bold pt-1 border-t border-[#111111]">
                  <div className="p-2.5 rounded border border-[#111111] bg-[#F6F2EA]">
                    <div className="text-[9px] text-[#666666] uppercase">Requests / Day</div>
                    <div className="text-xs font-extrabold text-[#111111] mt-0.5">{metrics.dailyRequestLimit.toLocaleString()} RPD</div>
                  </div>
                  <div className="p-2.5 rounded border border-[#111111] bg-[#F6F2EA]">
                    <div className="text-[9px] text-[#666666] uppercase">Requests / Min</div>
                    <div className="text-xs font-extrabold text-[#111111] mt-0.5">15 RPM</div>
                  </div>
                  <div className="p-2.5 rounded border border-[#111111] bg-[#F6F2EA]">
                    <div className="text-[9px] text-[#666666] uppercase">Tokens / Min</div>
                    <div className="text-xs font-extrabold text-[#111111] mt-0.5">1,000,000 TPM</div>
                  </div>
                  <div className="p-2.5 rounded border border-[#111111] bg-[#F6F2EA]">
                    <div className="text-[9px] text-[#666666] uppercase">Pricing Tier</div>
                    <div className="text-xs font-extrabold text-[#19B56B] mt-0.5">{metrics.isFreeTier ? 'FREE (0.00)' : 'BYOK Metered'}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab 4: Security & Auth */}
        {activeTab === 'security' && (
          <div className="space-y-6 text-left">
            <div>
              <h3 className="font-heading font-extrabold text-lg uppercase text-[#111111]">Security, Auth & Session Lifecycle</h3>
              <p className="text-xs font-mono font-bold text-[#666666] mt-1">Review active token ciphering, Firebase Auth state, and clear cached workspace data.</p>
            </div>

            <div className="p-5 rounded-[6px] border-2 border-[#111111] bg-[#F6F2EA] space-y-4">
              <h4 className="text-xs font-heading font-extrabold uppercase text-[#111111]">Security Standards</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono font-bold text-[#111111]">
                <div className="p-3 rounded-[6px] border-2 border-[#111111] bg-white">
                  <div className="text-[9px] uppercase text-[#666666]">Key Storage Cipher</div>
                  <div className="mt-1 text-sm font-black text-[#2F6BFF]">AES-256-GCM</div>
                </div>

                <div className="p-3 rounded-[6px] border-2 border-[#111111] bg-white">
                  <div className="text-[9px] uppercase text-[#666666]">Identity Provider</div>
                  <div className="mt-1 text-sm font-black text-[#19B56B]">Firebase Bearer JWT</div>
                </div>
              </div>
            </div>

            {/* MIGRATION ZONE */}
            <div className="pt-6 border-t-2 border-[#111111] space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#2F6BFF]" />
                <h3 className="font-heading font-extrabold text-sm uppercase text-[#111111]">
                  STORAGE OPTIMIZATION
                </h3>
              </div>
              <p className="text-xs font-mono font-bold text-[#666666]">
                Migrate legacy AI heavy assets (Notes, Quizzes, Flashcards) to the new high-performance subcollection architecture. This is a one-time operation that fixes slow loading times.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleMigrateStorage}
                  disabled={isMigrating}
                  className="px-5 py-3 rounded-[6px] bg-[#FFC400] text-[#111111] border-2 border-[#111111] font-mono text-xs font-extrabold uppercase shadow-paper-md hover:bg-[#ffe066] transition-colors cursor-pointer flex items-center gap-2 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${isMigrating ? 'animate-spin' : ''}`} />
                  <span>{isMigrating ? 'MIGRATING...' : 'MIGRATE LEGACY STORAGE'}</span>
                </button>
                {migrationStatus && (
                  <span className="text-[10px] font-mono font-bold text-[#2F6BFF] mt-1">{migrationStatus}</span>
                )}
              </div>
            </div>

            {/* DANGER ZONE: DATA PURGE AND LOGOUT */}
            <div className="pt-6 border-t-2 border-[#111111] space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#FF4D4D]" />
                <h3 className="font-heading font-extrabold text-sm uppercase text-[#111111]">
                  DANGER ZONE: PURGE DATA & LOGOUT
                </h3>
              </div>
              <p className="text-xs font-mono font-bold text-[#666666]">
                Instantly wipe all local cached data, clear session tokens, and sign out of all user accounts across Firebase Auth.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to purge all stored data and log out of all accounts? This action cannot be undone.")) {
                      if (onLogOut) onLogOut();
                    }
                  }}
                  className="px-5 py-3 rounded-[6px] bg-[#FF4D4D] text-white border-2 border-[#111111] font-mono text-xs font-extrabold uppercase shadow-paper-md hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>PURGE ALL DATA & LOGOUT ALL ACCOUNTS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Billing & Plan */}
        {activeTab === 'billing' && (
          <div className="space-y-5 text-left">
            <div>
              <h3 className="font-heading font-extrabold text-lg uppercase text-[#111111]">Plan & Subscription Overview</h3>
              <p className="text-xs font-mono font-bold text-[#666666] mt-1">Review active tiers, billing cycles, and feature capacities.</p>
            </div>

            <div className="border-2 border-[#111111] rounded-[6px] p-5 space-y-4 bg-[#F6F2EA] shadow-paper-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-[#111111] bg-[#FFC400] border border-[#111111] px-2.5 py-0.5 rounded-[4px] uppercase tracking-wide">
                    ACTIVE TIER
                  </span>
                  <h4 className="font-heading font-extrabold text-xl mt-2 text-[#111111]">Note-IT {settings.subscription.planName} Plan</h4>
                  <p className="text-xs font-mono font-bold text-[#666666] mt-0.5">Renews automatically on <strong className="text-[#111111]">{settings.subscription.nextBillDate}</strong></p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-2xl font-black text-[var(--text-primary)]">
                    {settings.subscription.planName === 'BYOK' ? '₹0' : (settings.subscription.price || '₹399 / mo')}
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-secondary)] mt-0.5">billed monthly</div>
                </div>
              </div>

              <div className="border-t-2 border-[#111111] pt-3.5 space-y-2">
                <span className="text-[10px] font-mono font-extrabold text-[#111111] uppercase tracking-widest block">INCLUDED FEATURES:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono font-bold">
                  {settings.subscription.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="rounded-full h-4 w-4 bg-[#19B56B] text-white flex items-center justify-center p-0.5 flex-shrink-0 border border-[#111111]">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span className="text-[#111111]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold text-[#666666]">Want to unlock institution features & custom models?</span>
              <button
                onClick={() => setActivePage('pricing')}
                className="flex items-center justify-center gap-1 rounded-[6px] border-2 border-[#111111] bg-[#FFC400] text-[#111111] px-5 py-2.5 text-xs font-mono font-extrabold uppercase shadow-paper-sm hover:bg-[#ffe066] transition-all cursor-pointer"
              >
                <span>Compare All SaaS Plans</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
  );
}
