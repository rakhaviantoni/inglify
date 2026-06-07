import { getSupabaseClient } from './supabase';
import type { User } from '@supabase/supabase-js';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function signInWithEmail(email: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  return { error: error?.message || null };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Check premium by looking at shared `purchases` table.
 * A user is premium if there's an active purchase for their device_id + app=inglify.
 * 
 * Since we use device-based auth (like bayipintar), we check by device_id.
 * Device ID is stored in localStorage.
 */
export function getDeviceId(): string {
  let id = localStorage.getItem('inglify-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('inglify-device-id', id);
  }
  return id;
}

export async function checkPremiumStatus(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const deviceId = getDeviceId();

  const { data } = await supabase
    .from('purchases')
    .select('status')
    .eq('app', 'inglify')
    .eq('device_id', deviceId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  return !!data;
}
