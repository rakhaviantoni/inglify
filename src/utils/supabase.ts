import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;

  const url = typeof window !== 'undefined'
    ? (import.meta.env?.PUBLIC_SUPABASE_URL || '')
    : '';
  const key = typeof window !== 'undefined'
    ? (import.meta.env?.PUBLIC_SUPABASE_ANON_KEY || '')
    : '';

  if (!url || !key) return null;

  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return _client;
}

// Server-side client (for API routes)
export function getServerSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
