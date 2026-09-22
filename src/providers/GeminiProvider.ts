import { BaseProvider } from './AIProvider';
import { GeminiAdapter } from './ValidationAdapters';

// A provider-side cap prevents an unexpectedly verbose response from spending
// an unbounded amount of a server-funded Gemini quota. It is configurable for
// longer academic resource generation when needed.
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 8192);

function sanitizeGeminiModel(model?: string): string {
  return model || 'gemini-3.6-flash';
}

export async function fetchGeminiApi(apiKey: string, requestedModel: string, bodyObj: any): Promise<Response> {
  const initialModel = sanitizeGeminiModel(requestedModel);
  const candidateModels = Array.from(new Set([initialModel, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']));

  const executeFetchWithRetry = async (url: string): Promise<Response> => {
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout per request

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        const status = response.status;
        if ((status === 429 || status === 503) && attempts < maxAttempts) {
          const backoffMs = attempts * 1000;
          console.warn(`[Gemini API] Status ${status} encountered on ${url}. Retrying attempt ${attempts + 1}/${maxAttempts} in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }

        const errText = await response.text().catch(() => '');
        const errObj: any = new Error(`Gemini API error (${status}): ${errText}`);
        errObj.status = status;
        throw errObj;
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        if (fetchErr.name === 'AbortError') {
          const errObj: any = new Error('Gemini API call timed out after 90 seconds. Please try again.');
          errObj.status = 504;
          throw errObj;
        }
        throw fetchErr;
      }
    }
    throw new Error(`Gemini API error: Max retries reached for ${url}`);
  };

  let lastError: any = null;
  for (const currentModel of candidateModels) {
    for (const ver of ['v1beta', 'v1']) {
      const url = `https://generativelanguage.googleapis.com/${ver}/models/${currentModel}:generateContent?key=${apiKey}`;
      try {
        const res = await executeFetchWithRetry(url);
        return res;
      } catch (err: any) {
        lastError = err;
        const status = err.status;
        if (status === 503 || status === 429 || status === 404) {
          console.warn(`[Gemini Provider] Model ${currentModel} on ${ver} returned ${status}. Trying next candidate model...`);
          break; // Move to next candidate model
        }
        throw err;
      }
    }
  }

  throw lastError || new Error(`Gemini API error: All fallback candidate models failed.`);
}

export class GeminiProvider extends BaseProvider {
  constructor(apiKey: string) {
    super(apiKey, 'gemini-3.6-flash');
  }

  getAvailableModels(): string[] {
    return ['gemini-3.6-flash'];
  }

  async validateKey(): Promise<boolean> {
    try {
      const adapter = new GeminiAdapter();
      await adapter.validate(this.apiKey, this.defaultModel);
      return true;
    } catch (err) {
      console.error('[GeminiProvider] Key validation failed:', err);
      return false;
    }
  }

  async generateText(prompt: string, model?: string): Promise<string> {
    const activeModel = sanitizeGeminiModel(model || this.defaultModel);
    const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS } };
    const response = await fetchGeminiApi(this.apiKey, activeModel, body);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async generateStructuredOutput(prompt: string, schema: any, model?: string): Promise<any> {
    const activeModel = sanitizeGeminiModel(model || this.defaultModel);
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        maxOutputTokens: MAX_OUTPUT_TOKENS
      }
    };
    const response = await fetchGeminiApi(this.apiKey, activeModel, body);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(text);
  }

  async transcribeAudio(base64Audio: string, mimeType: string, model?: string): Promise<string> {
    const activeModel = sanitizeGeminiModel(model || this.defaultModel);
    const body = {
      contents: [{
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: 'You are an expert transcriber. Transcribe the provided audio lecture word-for-word. Format the transcript text by prepending bracketed timestamps (e.g. [00:00], [01:15]) at the beginning of each major statement or logical paragraph based on the audio timeline.' }
        ]
      }],
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS }
    };
    const response = await fetchGeminiApi(this.apiKey, activeModel, body);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}
