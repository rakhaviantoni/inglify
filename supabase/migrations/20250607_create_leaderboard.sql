-- Inglify tables — shared Supabase instance with bayipintar
-- Convention: `app` column to scope data per project, `device_id` for device-based premium

-- Leaderboard
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

-- Translation history (cloud sync)
CREATE TABLE IF NOT EXISTS public.translation_history (
  id TEXT PRIMARY KEY,
  app TEXT NOT NULL DEFAULT 'inglify',
  user_id UUID NOT NULL,
  original_text TEXT NOT NULL,
  target_language TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_user ON public.translation_history(user_id, app, created_at DESC);

-- RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;

-- Leaderboard: public read/write
CREATE POLICY "leaderboard_read" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "leaderboard_insert" ON public.leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "leaderboard_update" ON public.leaderboard FOR UPDATE USING (true);

-- Translation history: user can manage own
CREATE POLICY "history_read_own" ON public.translation_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "history_insert_own" ON public.translation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "history_update_own" ON public.translation_history
  FOR UPDATE USING (auth.uid() = user_id);

-- NOTE: `purchases` table already exists from bayipintar.
-- Schema: id, app, device_id, transaction_id, provider, plan, amount, status, meta, created_at
-- Index: (app, device_id, status)
-- Inglify checks: app='inglify', device_id=X, status='active'
