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

export function getDeviceId(): string {
  let id = localStorage.getItem('inglify-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('inglify-device-id', id);
  }
  return id;
}

/**
 * Check premium status.
 * Checks by device_id OR by user_id (if logged in).
 * This way premium syncs across devices when user is logged in.
 */
export async function checkPremiumStatus(userId?: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const deviceId = getDeviceId();

  // Check by device_id
  const { data: byDevice } = await supabase
    .from('purchases')
    .select('status')
    .eq('app', 'inglify')
    .eq('device_id', deviceId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (byDevice) return true;

  // If logged in, also check by user_id
  if (userId) {
    const { data: byUser } = await supabase
      .from('purchases')
      .select('status')
      .eq('app', 'inglify')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (byUser) return true;
  }

  return false;
}

/**
 * Link device to user account.
 * Called on login — associates the device_id with the user_id on existing purchases,
 * so premium transfers when logging in on a new device.
 */
export async function linkDeviceToUser(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const deviceId = getDeviceId();

  // Update any purchases with this device_id to also have user_id
  await supabase
    .from('purchases')
    .update({ user_id: userId })
    .eq('app', 'inglify')
    .eq('device_id', deviceId)
    .is('user_id', null);

  // Also update current device's purchases with user_id if missing
  await supabase
    .from('purchases')
    .update({ device_id: deviceId })
    .eq('app', 'inglify')
    .eq('user_id', userId)
    .is('device_id', null);
}
