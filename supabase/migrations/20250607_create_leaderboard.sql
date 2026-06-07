-- Inglify tables — shared Supabase instance with bayipintar and others
-- Convention: `app` column to distinguish data per project

-- Leaderboard (app-scoped)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id BIGSERIAL PRIMARY KEY,
  app TEXT NOT NULL DEFAULT 'inglify',
  display_name TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  total_translations INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(app, display_name)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_app_xp ON public.leaderboard(app, xp DESC);

-- RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaderboard_read" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "leaderboard_insert" ON public.leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "leaderboard_update" ON public.leaderboard FOR UPDATE USING (true);

-- NOTE: `purchases` table already exists (shared with bayipintar).
-- Inglify uses it with app = 'inglify' for trakteer donations.
-- If `purchases` doesn't exist yet, uncomment below:

-- CREATE TABLE IF NOT EXISTS public.purchases (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   app TEXT NOT NULL DEFAULT 'inglify',
--   device_id TEXT,
--   transaction_id TEXT,
--   supporter_name TEXT,
--   supporter_message TEXT,
--   quantity INTEGER DEFAULT 1,
--   price NUMERIC DEFAULT 0,
--   net_amount NUMERIC DEFAULT 0,
--   status TEXT DEFAULT 'completed',
--   created_at TIMESTAMPTZ DEFAULT now(),
--   UNIQUE(app, transaction_id)
-- );
--
-- CREATE INDEX IF NOT EXISTS idx_purchases_app_device ON public.purchases(app, device_id, status);
--
-- ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "purchases_read_own" ON public.purchases FOR SELECT USING (true);
-- CREATE POLICY "purchases_insert" ON public.purchases FOR INSERT WITH CHECK (true);
