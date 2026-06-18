import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { generatePrompt } from '../../utils/generatePrompt';
import { PREMIUM_TONES } from '../../types/translation';
import { createAzekhaAIConfig } from '../../lib/azekha-ai';

const MODELS = [
  'deepseek-v4-flash',
  'kimi-k2.6'
];

const PREMIUM_TONE_NAMES = PREMIUM_TONES.map(t => t.name);

function truncatePreview(text: string): string {
  const words = text.split(' ');
  if (words.length <= 4) return words.slice(0, 2).join(' ') + '...';
  return words.slice(0, 4).join(' ') + '...';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text, targetLanguage, premium = false } = await request.json();

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Text and target language are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.AI_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const aiConfig = createAzekhaAIConfig('inglify', 'https://ai.sumopod.com/v1', apiKey);
    const openai = new OpenAI({
      apiKey: aiConfig.apiKey,
      baseURL: aiConfig.baseURL,
      defaultHeaders: aiConfig.defaultHeaders,
    });

    // Always generate all tones (including premium) for preview
    const prompt = generatePrompt(text, targetLanguage, true);
    let generatedText: string | null = null;

    for (const model of MODELS) {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: `You are an expert Indonesian-to-${targetLanguage === 'en' ? 'English' : 'other languages'} translator. You understand Indonesian slang, idioms, expressions, and colloquialisms deeply. Translate the MEANING and intent, not word-for-word when the phrase is idiomatic, but DO preserve the literal meaning when the text is a straightforward descriptive statement (e.g., someone's physical appearance, an action, a fact). Do NOT over-interpret short informal phrases as idioms. For example: "pala didit botak" means "Didit is bald" (literal), NOT an expression of astonishment. "astaga naga" means "holy moly/oh my god" (idiom of shock), NOT something about dragons. Respond with valid JSON only. No markdown, no backticks.`,
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 3000,
          temperature: 0.7,
        });

        generatedText = response.choices[0]?.message?.content || null;
        if (generatedText) break;
      } catch (err) {
        console.warn(`Model ${model} failed:`, err instanceof Error ? err.message : '');
        continue;
      }
    }

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: 'Semua model AI sedang tidak tersedia. Coba lagi nanti.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Gagal parse hasil terjemahan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const translationResult = JSON.parse(jsonMatch[0]);

    // For free users: truncate premium tones to preview only
    if (!premium && translationResult.results) {
      translationResult.results = translationResult.results.map((r: { tone: string; translation: string }) => {
        if (PREMIUM_TONE_NAMES.includes(r.tone)) {
          return { ...r, translation: truncatePreview(r.translation), preview: true };
        }
        return r;
      });
    }

    return new Response(
      JSON.stringify({
        ...translationResult,
        originalText: text,
        targetLanguage,
        timestamp: Date.now(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Translate API error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
