import { getSupabaseClient } from './supabase';
import type { HistoryItem } from '../types/translation';

const APP = 'inglify';

export async function syncHistoryToCloud(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const localHistory: HistoryItem[] = JSON.parse(
    localStorage.getItem('translation-history') || '[]'
  );

  if (localHistory.length === 0) return true;

  // Upsert all local history to cloud
  const rows = localHistory.map(item => ({
    id: item.id,
    app: APP,
    user_id: userId,
    original_text: item.originalText,
    target_language: item.targetLanguage,
    results: item.results,
    created_at: new Date(item.timestamp).toISOString(),
  }));

  const { error } = await supabase
    .from('translation_history')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Sync to cloud failed:', error);
    return false;
  }

  return true;
}

export async function pullHistoryFromCloud(userId: string): Promise<HistoryItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('translation_history')
    .select('*')
    .eq('user_id', userId)
    .eq('app', APP)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map(row => ({
    id: row.id,
    originalText: row.original_text,
    targetLanguage: row.target_language,
    results: row.results,
    timestamp: new Date(row.created_at).getTime(),
  }));
}

export async function mergeCloudHistory(userId: string): Promise<void> {
  const cloudHistory = await pullHistoryFromCloud(userId);
  const localHistory: HistoryItem[] = JSON.parse(
    localStorage.getItem('translation-history') || '[]'
  );

  // Merge: cloud items not in local get added
  const localIds = new Set(localHistory.map(h => h.id));
  const newItems = cloudHistory.filter(h => !localIds.has(h.id));

  if (newItems.length > 0) {
    const merged = [...newItems, ...localHistory]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
    localStorage.setItem('translation-history', JSON.stringify(merged));
  }

  // Then push local to cloud
  await syncHistoryToCloud(userId);
}
