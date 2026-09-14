import { BaseProvider } from './AIProvider';
import { GeminiAdapter } from './ValidationAdapters';

// A provider-side cap prevents an unexpectedly verbose response from spending
// an unbounded amount of a server-funded Gemini quota. It is configurable for
// longer academic resource generation when needed.
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 8192);

function sanitizeGeminiModel(model?: string): string {
  const m = model || 'gemini-3.6-flash';
  if (m === 'gemini-3.6-flash' || m === 'gemini-2.5-flash' || m.includes('3.6') || m.includes('2.5')) {
    return 'gemini-1.5-flash';
  }
  return m;
}

export async function fetchGeminiApi(apiKey: string, requestedModel: string, bodyObj: any): Promise<Response> {
  const model = sanitizeGeminiModel(requestedModel);

  const executeFetchWithRetry = async (url: string): Promise<Response> => {
    let attempts = 0;
    const maxAttempts = 3;
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
          const backoffMs = attempts * 1500;
          console.warn(`[Gemini API] Status ${status} encountered. Retrying attempt ${attempts + 1}/${maxAttempts} in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }

        const errText = await response.text().catch(() => '');
        const errObj: any = new Error(`Gemini API error: ${status} - ${errText}`);
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
    throw new Error(`Gemini API error: Max retries reached for ${model}`);
  };

  for (const ver of ['v1beta', 'v1']) {
    const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${apiKey}`;
    try {
      return await executeFetchWithRetry(url);
    } catch (err: any) {
      if (err.status && err.status !== 404) {
        throw err;
      }
    }
  }

  const finalUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  return await executeFetchWithRetry(finalUrl);
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
