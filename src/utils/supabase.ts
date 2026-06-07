import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (for use in React components)
const supabaseUrl = typeof import.meta !== 'undefined' 
  ? (import.meta.env?.PUBLIC_SUPABASE_URL || '')
  : '';
const supabaseAnonKey = typeof import.meta !== 'undefined'
  ? (import.meta.env?.PUBLIC_SUPABASE_ANON_KEY || '')
  : '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to create client with explicit URL/key (for server-side)
export function createSupabaseClient(url?: string, key?: string) {
  return createClient(
    url || supabaseUrl,
    key || supabaseAnonKey
  );
}
