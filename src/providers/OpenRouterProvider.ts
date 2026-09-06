import { BaseProvider, extractJsonObject } from './AIProvider';
import { OpenRouterAdapter } from './ValidationAdapters';

/**
 * Executes an OpenRouter API request with adaptive max_tokens credit fallback.
 * If OpenRouter returns HTTP 402 ("can only afford X tokens"), automatically
 * resends the request using the affordable token budget or omits max_tokens.
 */
export async function postOpenRouterWithCreditFallback(
  apiKey: string,
  payload: any,
  requestedMaxTokens: number = 4096
): Promise<any> {
  const attemptRequest = async (tokens?: number): Promise<Response> => {
    const body: any = { ...payload };
    if (tokens !== undefined && tokens > 0) {
      body.max_tokens = tokens;
    } else {
      delete body.max_tokens;
    }

    return await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://noteit.ai',
        'X-Title': 'NoteIT'
      },
      body: JSON.stringify(body)
    });
  };

  // 1. Initial Attempt
  let response = await attemptRequest(requestedMaxTokens);

  // 2. Handle HTTP 402 (Insufficient Credits / max_tokens reservation failure)
  if (!response.ok && response.status === 402) {
    const errText = await response.text().catch(() => '');
    console.warn(`[OpenRouter] Received status 402 with max_tokens=${requestedMaxTokens}. Attempting credit-adaptive fallback...`, errText);

    // Parse "can only afford <N> tokens" from OpenRouter's error message
    const match = errText.match(/can only afford (\d+)/i);
    if (match && match[1]) {
      const affordableTokens = Math.max(300, Math.floor(parseInt(match[1], 10) * 0.95));
      console.log(`[OpenRouter] Retrying request with affordable max_tokens: ${affordableTokens}`);
      response = await attemptRequest(affordableTokens);
    } else {
      // Omit max_tokens so OpenRouter uses dynamic balance-aware generation
      console.log(`[OpenRouter] Retrying request without explicit max_tokens constraint...`);
      response = await attemptRequest(undefined);
    }

    // 3. Final Fallback if still 402: retry with modest default limit (2000)
    if (!response.ok && response.status === 402) {
      console.log(`[OpenRouter] Secondary fallback: retrying with max_tokens: 2000`);
      response = await attemptRequest(2000);
    }

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }
  } else if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
  }

  return await response.json();
}

export class OpenRouterProvider extends BaseProvider {
  constructor(apiKey: string) {
    super(apiKey, 'google/gemini-3.6-flash');
  }

  getAvailableModels(): string[] {
    return [
      'google/gemini-3.6-flash',
      'meta-llama/llama-3.3-70b-instruct',
      'deepseek/deepseek-chat',
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o-mini'
    ];
  }

  async validateKey(): Promise<boolean> {
    try {
      const adapter = new OpenRouterAdapter();
      await adapter.validate(this.apiKey, this.defaultModel);
      return true;
    } catch (err) {
      console.error('[OpenRouterProvider] Key validation failed:', err);
      return false;
    }
  }

  async generateText(prompt: string, model?: string): Promise<string> {
    const activeModel = model || this.defaultModel;
    const payload = {
      model: activeModel,
      messages: [{ role: 'user', content: prompt }]
    };

    const data = await postOpenRouterWithCreditFallback(this.apiKey, payload, 4096);
    return data.choices?.[0]?.message?.content || '';
  }

  async generateStructuredOutput(prompt: string, schema: any, model?: string): Promise<any> {
    const activeModel = model || this.defaultModel;
    const payload = {
      model: activeModel,
      messages: [{ role: 'user', content: `${prompt}\n\nYou MUST return the response strictly matching this JSON schema: ${JSON.stringify(schema)}` }],
      response_format: { type: 'json_object' }
    };

    const data = await postOpenRouterWithCreditFallback(this.apiKey, payload, 4096);
    const text = data.choices?.[0]?.message?.content || '';
    const cleaned = extractJsonObject(text);
    return JSON.parse(cleaned);
  }

  async transcribeAudio(base64Audio: string, mimeType: string, model?: string): Promise<string> {
    throw new Error('OpenRouter does not support audio transcription natively. Please switch your AI Provider to Google Gemini, Groq, or OpenAI to transcribe audio.');
  }
}
