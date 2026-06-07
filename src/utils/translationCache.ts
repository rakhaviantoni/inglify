import type { TranslationResponse } from '../types/translation';

const CACHE_KEY = 'inglify-translation-cache';
const MAX_CACHE_SIZE = 200;

interface CacheEntry {
  key: string;
  response: TranslationResponse;
  timestamp: number;
}

function getCacheKey(text: string, targetLanguage: string): string {
  return `${text.toLowerCase().trim()}::${targetLanguage}`;
}

function getCache(): CacheEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCache(entries: CacheEntry[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full - evict oldest entries
    const trimmed = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  }
}

export function getCachedTranslation(text: string, targetLanguage: string): TranslationResponse | null {
  const key = getCacheKey(text, targetLanguage);
  const cache = getCache();
  const entry = cache.find(e => e.key === key);
  return entry ? entry.response : null;
}

export function cacheTranslation(text: string, targetLanguage: string, response: TranslationResponse): void {
  const key = getCacheKey(text, targetLanguage);
  const cache = getCache();
  
  // Remove existing entry for this key if present
  const filtered = cache.filter(e => e.key !== key);
  
  // Add to front
  filtered.unshift({ key, response, timestamp: Date.now() });
  
  // Trim to max size
  if (filtered.length > MAX_CACHE_SIZE) {
    filtered.splice(MAX_CACHE_SIZE);
  }
  
  saveCache(filtered);
}

export function getCacheStats(): { count: number; languages: string[] } {
  const cache = getCache();
  const languages = [...new Set(cache.map(e => e.response.targetLanguage))];
  return { count: cache.length, languages };
}
