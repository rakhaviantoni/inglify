import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const APP = 'inglify';

function getSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export const GET: APIRoute = async () => {
  const supabase = getSupabase();
  if (!supabase) {
    return new Response(JSON.stringify({ leaderboard: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('display_name, xp, level, streak, total_translations')
      .eq('app', APP)
      .order('xp', { ascending: false })
      .limit(20);

    if (error) throw error;

    return new Response(JSON.stringify({ leaderboard: data || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return new Response(JSON.stringify({ leaderboard: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const supabase = getSupabase();
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { displayName, xp, level, streak, totalTranslations } = await request.json();

    if (!displayName?.trim()) {
      return new Response(JSON.stringify({ error: 'nama wajib' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error } = await supabase
      .from('leaderboard')
      .upsert(
        {
          app: APP,
          display_name: displayName.trim(),
          xp: xp || 0,
          level: level || 1,
          streak: streak || 0,
          total_translations: totalTranslations || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'app,display_name' }
      );

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Leaderboard update error:', err);
    return new Response(JSON.stringify({ error: 'gagal update' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
