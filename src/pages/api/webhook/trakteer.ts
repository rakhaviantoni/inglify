import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const APP = 'inglify';

/**
 * Trakteer webhook receiver.
 * Logs tips to the shared `purchases` table and optionally grants premium.
 *
 * Set webhook URL in Trakteer: https://inglify.rakhaviantoni.com/api/webhook/trakteer
 * Set TRAKTEER_WEBHOOK_TOKEN from Trakteer > Integrasi > Webhook
 */
export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Webhook-Token');
  const expectedToken = import.meta.env.TRAKTEER_WEBHOOK_TOKEN;

  if (expectedToken && token !== expectedToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload = await request.json();
    const {
      transaction_id,
      type,
      supporter_name,
      supporter_message,
      quantity,
      price,
      net_amount,
    } = payload;

    if (type !== 'tip') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = import.meta.env.PUBLIC_SUPABASE_URL;
    const key = import.meta.env.SUPABASE_SERVICE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      const supabase = createClient(url, key);

      // Write to shared purchases table
      await supabase.from('purchases').upsert(
        {
          app: APP,
          transaction_id,
          supporter_name: supporter_name || 'Anonim',
          supporter_message: supporter_message || null,
          quantity: quantity || 1,
          price: price || 0,
          net_amount: net_amount || 0,
          status: 'completed',
        },
        { onConflict: 'app,transaction_id' }
      );
    }

    console.log(`[trakteer] ${supporter_name} x${quantity} (Rp${net_amount})`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[trakteer] webhook error:', err);
    return new Response(JSON.stringify({ error: 'error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
