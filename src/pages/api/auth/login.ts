import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

/**
 * Server-side login endpoint.
 * Uses Supabase Admin to generate magic link + Resend to deliver email.
 * This bypasses Supabase's built-in email which needs SMTP config.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return new Response(JSON.stringify({ error: 'Email wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceKey = import.meta.env.SUPABASE_SERVICE_KEY;
    const resendKey = import.meta.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Auth not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Generate magic link via Supabase Admin API
    const redirectTo = new URL(request.url).origin;
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.trim(),
      options: {
        redirectTo,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error('[auth] Generate link error:', error);
      return new Response(JSON.stringify({ error: 'Gagal buat link login' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const magicLink = data.properties.action_link;

    // Send via Resend
    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Inglify <noreply@rakhaviantoni.com>',
          to: email.trim(),
          subject: 'Login ke Inglify',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #111827; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #f97316; font-size: 24px; margin: 0; font-weight: 700;">Inglify</h1>
                <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0;">Terjemahan multi-gaya dengan AI</p>
              </div>
              <div style="background: #1f2937; border-radius: 8px; padding: 24px; border: 1px solid #374151;">
                <p style="color: #e5e7eb; font-size: 14px; margin: 0 0 16px; line-height: 1.5;">
                  Hai! Klik tombol di bawah untuk masuk ke akunmu:
                </p>
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ec4899); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                    Masuk ke Inglify
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0; line-height: 1.5;">
                  Link ini berlaku selama 1 jam. Kalau kamu tidak merasa meminta login, abaikan email ini.
                </p>
              </div>
              <p style="color: #4b5563; font-size: 11px; text-align: center; margin: 16px 0 0;">
                inglify.rakhaviantoni.com
              </p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error('[auth] Resend error:', errBody);
        return new Response(JSON.stringify({ error: 'Gagal kirim email' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Fallback: try Supabase's built-in OTP (if SMTP is configured there)
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email.trim(),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[auth] Login error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
