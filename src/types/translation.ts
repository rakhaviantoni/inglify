export interface TranslationTone {
  name: string;
  label: string;
  description: string;
}

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  tones: string[];
}

export interface TranslationResult {
  tone: string;
  translation: string;
}

export interface TranslationResponse {
  results: TranslationResult[];
  originalText: string;
  targetLanguage: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  originalText: string;
  targetLanguage: string;
  results: TranslationResult[];
  timestamp: number;
}

export const TRANSLATION_TONES: TranslationTone[] = [
  {
    name: 'formal',
    label: 'Formal',
    description: 'Gaya bahasa resmi dan sopan'
  },
  {
    name: 'casual',
    label: 'Casual',
    description: 'Gaya bahasa santai dan tidak kaku'
  },
  {
    name: 'friendly',
    label: 'Friendly',
    description: 'Gaya bahasa ramah dan hangat'
  },
  {
    name: 'professional',
    label: 'Professional',
    description: 'Gaya bahasa profesional untuk bisnis'
  },
  {
    name: 'simple',
    label: 'Simple',
    description: 'Gaya bahasa sederhana dan mudah dipahami'
  },
  {
    name: 'persuasive',
    label: 'Persuasive',
    description: 'Gaya bahasa yang meyakinkan dan mempengaruhi'
  }
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', label: 'Inggris' },
  { code: 'ja', name: 'Japanese', label: 'Jepang' },
  { code: 'ko', name: 'Korean', label: 'Korea' },
  { code: 'zh', name: 'Chinese', label: 'Mandarin' },
  { code: 'fr', name: 'French', label: 'Prancis' },
  { code: 'es', name: 'Spanish', label: 'Spanyol' },
  { code: 'de', name: 'German', label: 'Jerman' },
  { code: 'ar', name: 'Arabic', label: 'Arab' },
  { code: 'pt', name: 'Portuguese', label: 'Portugis' },
  { code: 'ru', name: 'Russian', label: 'Rusia' },
  { code: 'it', name: 'Italian', label: 'Italia' },
  { code: 'nl', name: 'Dutch', label: 'Belanda' },
  { code: 'sv', name: 'Swedish', label: 'Swedia' },
  { code: 'no', name: 'Norwegian', label: 'Norwegia' },
  { code: 'da', name: 'Danish', label: 'Denmark' },
  { code: 'fi', name: 'Finnish', label: 'Finlandia' },
  { code: 'pl', name: 'Polish', label: 'Polandia' },
  { code: 'cs', name: 'Czech', label: 'Ceko' },
  { code: 'sk', name: 'Slovak', label: 'Slovakia' },
  { code: 'hu', name: 'Hungarian', label: 'Hungaria' },
  { code: 'ro', name: 'Romanian', label: 'Rumania' },
  { code: 'bg', name: 'Bulgarian', label: 'Bulgaria' },
  { code: 'hr', name: 'Croatian', label: 'Kroasia' },
  { code: 'sr', name: 'Serbian', label: 'Serbia' },
  { code: 'sl', name: 'Slovenian', label: 'Slovenia' },
  { code: 'et', name: 'Estonian', label: 'Estonia' },
  { code: 'lv', name: 'Latvian', label: 'Latvia' },
  { code: 'lt', name: 'Lithuanian', label: 'Lithuania' },
  { code: 'th', name: 'Thai', label: 'Thailand' },
  { code: 'vi', name: 'Vietnamese', label: 'Vietnam' },
  { code: 'hi', name: 'Hindi', label: 'Hindi' },
  { code: 'bn', name: 'Bengali', label: 'Bengali' },
  { code: 'ur', name: 'Urdu', label: 'Urdu' },
  { code: 'ta', name: 'Tamil', label: 'Tamil' },
  { code: 'te', name: 'Telugu', label: 'Telugu' },
  { code: 'ml', name: 'Malayalam', label: 'Malayalam' },
  { code: 'kn', name: 'Kannada', label: 'Kannada' },
  { code: 'gu', name: 'Gujarati', label: 'Gujarati' },
  { code: 'pa', name: 'Punjabi', label: 'Punjabi' },
  { code: 'mr', name: 'Marathi', label: 'Marathi' },
  { code: 'ne', name: 'Nepali', label: 'Nepal' },
  { code: 'si', name: 'Sinhala', label: 'Sinhala' },
  { code: 'my', name: 'Myanmar', label: 'Myanmar' },
  { code: 'km', name: 'Khmer', label: 'Khmer' },
  { code: 'lo', name: 'Lao', label: 'Laos' },
  { code: 'ka', name: 'Georgian', label: 'Georgia' },
  { code: 'am', name: 'Amharic', label: 'Amharic' },
  { code: 'sw', name: 'Swahili', label: 'Swahili' },
  { code: 'zu', name: 'Zulu', label: 'Zulu' },
  { code: 'af', name: 'Afrikaans', label: 'Afrikaans' },
  { code: 'he', name: 'Hebrew', label: 'Ibrani' },
  { code: 'fa', name: 'Persian', label: 'Persia' },
  { code: 'tr', name: 'Turkish', label: 'Turki' },
  { code: 'az', name: 'Azerbaijani', label: 'Azerbaijan' },
  { code: 'kk', name: 'Kazakh', label: 'Kazakh' },
  { code: 'ky', name: 'Kyrgyz', label: 'Kyrgyz' },
  { code: 'uz', name: 'Uzbek', label: 'Uzbek' },
  { code: 'tg', name: 'Tajik', label: 'Tajik' },
  { code: 'mn', name: 'Mongolian', label: 'Mongolia' },
  { code: 'ms', name: 'Malay', label: 'Melayu' },
  { code: 'tl', name: 'Filipino', label: 'Filipino' },
  { code: 'ceb', name: 'Cebuano', label: 'Cebuano' },
  { code: 'haw', name: 'Hawaiian', label: 'Hawaii' },
  { code: 'mg', name: 'Malagasy', label: 'Malagasy' },
  { code: 'mt', name: 'Maltese', label: 'Malta' },
  { code: 'is', name: 'Icelandic', label: 'Islandia' },
  { code: 'ga', name: 'Irish', label: 'Irlandia' },
  { code: 'cy', name: 'Welsh', label: 'Wales' },
  { code: 'eu', name: 'Basque', label: 'Basque' },
  { code: 'ca', name: 'Catalan', label: 'Katalan' },
  { code: 'gl', name: 'Galician', label: 'Galicia' },
  { code: 'eo', name: 'Esperanto', label: 'Esperanto' },
  { code: 'la', name: 'Latin', label: 'Latin' }
];