import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { SUPPORTED_LANGUAGES } from '../../types/translation';
import { createAzekhaAIConfig } from '../../lib/azekha-ai';

const MODELS = ['deepseek-v4-flash', 'mimo-v2.5'];

/**
 * Regenerate a single tone translation.
 * Cheaper than re-doing all 6-10 tones.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { text, targetLanguage, tone, currentTranslation } = await request.json();

    if (!text || !targetLanguage || !tone) {
      return new Response(
        JSON.stringify({ error: 'Missing fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.AI_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const aiConfig = createAzekhaAIConfig('inglify', 'https://ai.sumopod.com/v1', apiKey);
    const openai = new OpenAI({ apiKey: aiConfig.apiKey, baseURL: aiConfig.baseURL, defaultHeaders: aiConfig.defaultHeaders });
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);
    const langName = lang?.name || 'English';

    const prompt = currentTranslation
      ? `The user wants a different "${tone}" translation of "${text}" from Indonesian to ${langName}. The previous translation was: "${currentTranslation}". Please provide a notably different alternative that still matches the "${tone}" style. Return ONLY the translation text, nothing else.`
      : `Translate "${text}" from Indonesian to ${langName} in a "${tone}" style. Return ONLY the translation text, nothing else.`;

    let result: string | null = null;

    for (const model of MODELS) {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are a translator. Return only the translated text. No quotes, no explanation.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 300,
          temperature: 0.9,
        });
        result = response.choices[0]?.message?.content?.trim() || null;
        if (result) break;
      } catch {
        continue;
      }
    }

    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Gagal regenerate' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clean up any quotes the model might wrap it in
    result = result.replace(/^["']|["']$/g, '');

    return new Response(
      JSON.stringify({ tone, translation: result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Regenerate error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
