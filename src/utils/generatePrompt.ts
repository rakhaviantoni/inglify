import { TRANSLATION_TONES, SUPPORTED_LANGUAGES } from '../types/translation';
import type { TranslationTone } from '../types/translation';

export function generatePrompt(text: string, targetLanguage: string, includePremium: boolean = true): string {
  const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);
  const targetLangName = targetLang?.name || 'English';
  
  const tones: TranslationTone[] = includePremium 
    ? TRANSLATION_TONES 
    : TRANSLATION_TONES.filter(t => !t.premium);
  
  const toneDescriptions = tones.map(tone => 
    `${tone.name}: ${tone.description}`
  ).join('\n');

  const toneExamples = tones.map(tone => 
    `    { "tone": "${tone.name}", "translation": "your ${tone.name} translation here" }`
  ).join(',\n');

  return `You are a professional translator specializing in Indonesian. The input text may contain slang, idioms, colloquial expressions, or informal language. Translate the MEANING and communicative intent. For idiomatic expressions, translate the figurative meaning. For literal/descriptive statements (about people, objects, actions, facts), translate the actual literal meaning — do NOT reinterpret straightforward descriptions as idioms or exclamations.

Translate the following Indonesian text to ${targetLangName} in ${tones.length} different tones/styles.

Original Indonesian text: "${text}"

Provide translations in these tones:
${toneDescriptions}

IMPORTANT: Return ONLY a valid JSON object (no markdown, no backticks, no explanation) with this exact structure:
{
  "results": [
${toneExamples}
  ]
}

Each translation must accurately reflect the specified tone while preserving the original meaning and intent.`;
}
