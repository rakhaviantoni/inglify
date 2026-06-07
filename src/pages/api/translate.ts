import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { generatePrompt } from '../../utils/generatePrompt';

// Ordered by preference - falls through if one fails
const MODELS = [
  'kimi-k2.6',
  'MiniMax-M2.7-highspeed',
  'gpt-5-nano',
];

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

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://ai.sumopod.com/v1',
    });

    const prompt = generatePrompt(text, targetLanguage, premium);
    let generatedText: string | null = null;
    let lastError: unknown = null;

    // Try each model in order
    for (const model of MODELS) {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Respond with valid JSON only. No markdown, no backticks, no extra text.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 3000,
          temperature: 0.7,
        });

        generatedText = response.choices[0]?.message?.content || null;
        if (generatedText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next...`, err instanceof Error ? err.message : err);
        continue;
      }
    }

    if (!generatedText) {
      console.error('All models failed. Last error:', lastError);
      return new Response(
        JSON.stringify({ error: 'Semua model AI sedang tidak tersedia. Coba lagi nanti.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in response:', generatedText.slice(0, 200));
      return new Response(
        JSON.stringify({ error: 'Gagal parse hasil terjemahan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const translationResult = JSON.parse(jsonMatch[0]);

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
