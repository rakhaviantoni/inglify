import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

/**
 * Shared Trakteer Webhook - handles payments for ALL apps.
 * 
 * Message format from client:
 *   "app:inglify device:xxxx-xxxx"
 *   "app:bayipintar device:yyyy-yyyy"
 * 
 * Writes to shared `purchases` table in Supabase.
 */

const DEFAULT_APP = 'inglify';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, supporter_name, supporter_message, amount, status } = body;

    // Also handle Trakteer's native payload format (type: 'tip')
    const txId = id || body.transaction_id;
    const txStatus = status || (body.type === 'tip' ? 'paid' : null);
    const txAmount = amount || body.net_amount || 0;
    const txName = supporter_name || 'Anonim';
    const txMessage = supporter_message || '';

    if (txStatus !== 'paid' && txStatus !== 'success' && body.type !== 'tip') {
      return new Response(JSON.stringify({ ok: true, msg: 'skipped' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify webhook token if set
    const token = request.headers.get('X-Webhook-Token');
    const expectedToken = import.meta.env.TRAKTEER_WEBHOOK_TOKEN;
    if (expectedToken && token !== expectedToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = import.meta.env.PUBLIC_SUPABASE_URL;
    const key = import.meta.env.SUPABASE_SERVICE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.log('[trakteer] No supabase config');
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(url, key);

    // Parse message: "app:inglify device:xxxx-xxxx"
    const appMatch = txMessage.match(/app:(\w+)/);
    const deviceMatch = txMessage.match(/device:([\w-]+)/);

    const app = appMatch ? appMatch[1] : DEFAULT_APP;
    const deviceId = deviceMatch ? deviceMatch[1] : null;

    const { error } = await supabase.from('purchases').insert({
      app,
      device_id: deviceId,
      transaction_id: txId,
      provider: 'trakteer',
      plan: 'lifetime',
      amount: txAmount,
      status: 'active',
      meta: { supporter_name: txName, raw_message: txMessage },
    });

    if (error) {
      console.error('[trakteer] DB error:', error);
      return new Response(JSON.stringify({ ok: false }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[trakteer] ${txName} -> ${app} device:${deviceId} (Rp${txAmount})`);

    return new Response(JSON.stringify({ ok: true, app, device_id: deviceId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[trakteer] webhook error:', err);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'ok', endpoint: 'trakteer-webhook-shared' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
