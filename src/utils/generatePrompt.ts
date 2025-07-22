import { TRANSLATION_TONES } from '../types/translation';

export function generatePrompt(text: string, targetLanguage: string): string {
  const languageMap: { [key: string]: string } = {
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean', 
    'zh': 'Chinese',
    'fr': 'French',
    'es': 'Spanish',
    'de': 'German',
    'ar': 'Arabic'
  };

  const targetLangName = languageMap[targetLanguage] || 'English';
  
  const toneDescriptions = TRANSLATION_TONES.map(tone => 
    `${tone.name}: ${tone.description}`
  ).join('\n');

  return `You are a professional translator. Please translate the following Indonesian text to ${targetLangName} in 6 different tones/styles.

Original Indonesian text: "${text}"

Please provide translations in these 6 tones:
${toneDescriptions}

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "results": [
    {
      "tone": "formal",
      "translation": "your formal translation here"
    },
    {
      "tone": "casual", 
      "translation": "your casual translation here"
    },
    {
      "tone": "friendly",
      "translation": "your friendly translation here"
    },
    {
      "tone": "professional",
      "translation": "your professional translation here"
    },
    {
      "tone": "simple",
      "translation": "your simple translation here"
    },
    {
      "tone": "persuasive",
      "translation": "your persuasive translation here"
    }
  ]
}

Make sure each translation accurately reflects the specified tone while maintaining the original meaning. Return only the JSON object, no additional text.`;
}