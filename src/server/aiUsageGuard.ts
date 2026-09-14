import type { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT_PER_USER || 20);
const MINUTE_LIMIT = Number(process.env.AI_REQUESTS_PER_MINUTE || 4);
const MAX_REQUEST_BYTES = Number(process.env.AI_MAX_REQUEST_BYTES || 25 * 1024 * 1024);
const MAX_PROMPT_CHARS = Number(process.env.AI_MAX_PROMPT_CHARS || 250_000);
const MAX_AUDIO_BASE64_CHARS = Number(process.env.AI_MAX_AUDIO_BASE64_CHARS || 24 * 1024 * 1024);

type Usage = { day: string; dayCount: number; minute: string; minuteCount: number };
const memoryUsage = new Map<string, Usage>();

const today = () => new Date().toISOString().slice(0, 10);
const minute = () => new Date().toISOString().slice(0, 16);

function validatePayload(req: Request, res: Response): boolean {
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    res.status(413).json({ error: `AI request is too large. Maximum request size is ${Math.floor(MAX_REQUEST_BYTES / 1024 / 1024)} MB.` });
    return false;
  }

  const body = req.body || {};
  const textInputs = [body.prompt, body.transcript, body.cleanTranscript, body.text]
    .filter((value): value is string => typeof value === 'string');
  if (textInputs.some((value) => value.length > MAX_PROMPT_CHARS)) {
    res.status(413).json({ error: `AI text input is too large. Maximum is ${MAX_PROMPT_CHARS.toLocaleString()} characters.` });
    return false;
  }

  const audio = body.base64Audio || body.inlineData?.data;
  if (typeof audio === 'string' && audio.length > MAX_AUDIO_BASE64_CHARS) {
    res.status(413).json({ error: `Audio input is too large. Maximum encoded audio size is ${Math.floor(MAX_AUDIO_BASE64_CHARS / 1024 / 1024)} MB.` });
    return false;
  }
  return true;
}

async function consumeInMemory(uid: string): Promise<{ allowed: boolean; usage: Usage }> {
  const day = today();
  const currentMinute = minute();
  const current = memoryUsage.get(uid) || { day, dayCount: 0, minute: currentMinute, minuteCount: 0 };
  const usage: Usage = {
    day,
    dayCount: current.day === day ? current.dayCount : 0,
    minute: currentMinute,
    minuteCount: current.minute === currentMinute ? current.minuteCount : 0
  };
  if (usage.dayCount >= DAILY_LIMIT || usage.minuteCount >= MINUTE_LIMIT) return { allowed: false, usage };
  usage.dayCount += 1;
  usage.minuteCount += 1;
  memoryUsage.set(uid, usage);
  return { allowed: true, usage };
}

async function consumeUsage(uid: string): Promise<{ allowed: boolean; usage: Usage }> {
  try {
    const db = getFirestore();
    const ref = db.collection('ai_rate_limits').doc(uid);
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const old = (snapshot.exists ? snapshot.data() : {}) as Partial<Usage>;
      const day = today();
      const currentMinute = minute();
      const usage: Usage = {
        day,
        dayCount: old.day === day ? Number(old.dayCount || 0) : 0,
        minute: currentMinute,
        minuteCount: old.minute === currentMinute ? Number(old.minuteCount || 0) : 0
      };
      if (usage.dayCount >= DAILY_LIMIT || usage.minuteCount >= MINUTE_LIMIT) return { allowed: false, usage };
      usage.dayCount += 1;
      usage.minuteCount += 1;
      transaction.set(ref, { ...usage, updatedAt: new Date() });
      return { allowed: true, usage };
    });
  } catch (error) {
    // Local development may not have Firebase Admin credentials. Keep a
    // process-local guard active rather than silently leaving routes unlimited.
    console.warn('[AI_USAGE_GUARD] Firestore limiter unavailable; using local limiter.', error);
    return consumeInMemory(uid);
  }
}

export async function enforceAiUsage(req: Request, res: Response, next: NextFunction) {
  const uid = (req as any).user?.uid || req.body?.user?.uid;
  if (!uid) return res.status(401).json({ error: 'Authenticated user identity is missing.' });
  if (!validatePayload(req, res)) return;

  const result = await consumeUsage(uid);
  if (!result.allowed) {
    const reason = result.usage.dayCount >= DAILY_LIMIT
      ? `Daily AI limit reached (${DAILY_LIMIT} operations). Try again tomorrow or use your own configured provider.`
      : `Too many AI requests. Limit is ${MINUTE_LIMIT} operations per minute.`;
    return res.status(429).json({ error: reason, quota: { dailyLimit: DAILY_LIMIT, usedToday: result.usage.dayCount } });
  }
  res.setHeader('X-NoteIT-AI-Daily-Limit', String(DAILY_LIMIT));
  res.setHeader('X-NoteIT-AI-Daily-Used', String(result.usage.dayCount));
  next();
}

export const canUseServerFallback = (requested: unknown) =>
  process.env.ALLOW_SERVER_AI_FALLBACK === 'true' && requested === true;
