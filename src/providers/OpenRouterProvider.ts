import { BaseProvider, extractJsonObject, safeJsonParse } from './AIProvider';
import { OpenRouterAdapter } from './ValidationAdapters';

/**
 * Executes an OpenRouter API request with adaptive max_tokens credit fallback.
 * If OpenRouter returns HTTP 402 ("can only afford X tokens"), automatically
 * resends the request using the affordable token budget or omits max_tokens.
 */
export async function postOpenRouterWithCreditFallback(
  apiKey: string,
  payload: any,
  requestedMaxTokens: number = 2048
): Promise<any> {
  const attemptRequest = async (modelName: string, tokens?: number): Promise<Response> => {
    const body: any = { ...payload, model: modelName };
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

  const initialModel = payload.model || 'google/gemini-3.6-flash';

  // 1. Initial Attempt
  let response = await attemptRequest(initialModel, requestedMaxTokens);

  // 2. Handle HTTP 402 (Insufficient Credits / max_tokens credit reservation failure)
  if (!response.ok && (response.status === 402 || response.status === 403)) {
    let errText = await response.text().catch(() => '');
    console.warn(`[OpenRouter] Received status ${response.status} with model=${initialModel}, max_tokens=${requestedMaxTokens}. Executing credit-adaptive fallback...`, errText);

    // Try parsing affordable tokens limit from OpenRouter's 402 response
    const match = errText.match(/can only afford (\d+)/i);
    if (match && match[1]) {
      const affordableTokens = Math.max(300, Math.floor(parseInt(match[1], 10) * 0.9));
      console.log(`[OpenRouter] Retrying request with affordable max_tokens: ${affordableTokens}`);
      response = await attemptRequest(initialModel, affordableTokens);
    } else {
      console.log(`[OpenRouter] Retrying request with reduced max_tokens: 1000`);
      response = await attemptRequest(initialModel, 1000);
    }

    // 3. If still 402/403, AUTOMATIC FAILOVER TO OPENROUTER FREE TIER MODELS ($0 credit reservation)
    if (!response.ok && (response.status === 402 || response.status === 403)) {
      console.warn('[OpenRouter] Paid model credit reservation failed (402). Attempting automatic switch to OpenRouter Free tier models...');
      const freeModels = [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'qwen/qwen-2.5-72b-instruct:free',
        'deepseek/deepseek-r1:free'
      ];

      for (const freeModel of freeModels) {
        console.log(`[OpenRouter] Trying free tier model: ${freeModel}`);
        const freeResponse = await attemptRequest(freeModel, undefined);
        if (freeResponse.ok) {
          console.log(`[OpenRouter] Successfully generated response using free model: ${freeModel}`);
          return await freeResponse.json();
        }
      }

      throw new Error(`OpenRouter API error: 402 - Insufficient OpenRouter credits for model '${initialModel}'. Please add credits at openrouter.ai/settings/credits or switch to Google Gemini API Key in Settings.`);
    }

    if (!response.ok) {
      const retryErrText = await response.text().catch(() => errText);
      throw new Error(`OpenRouter API error: ${response.status} - ${retryErrText}`);
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
    return safeJsonParse(text);
  }

  async transcribeAudio(base64Audio: string, mimeType: string, model?: string): Promise<string> {
    throw new Error('OpenRouter does not support audio transcription natively. Please switch your AI Provider to Google Gemini, Groq, or OpenAI to transcribe audio.');
  }
}
