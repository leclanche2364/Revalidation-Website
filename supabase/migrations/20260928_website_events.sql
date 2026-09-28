-- website_events: raw tracking rows from the Cloudflare tracking worker
-- (pageviews + download clicks). Written by worker with service_role key,
-- read by the growth agent with service_role key. Notion stays primary.
CREATE TABLE IF NOT EXISTS public.website_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('pageview', 'download_click')),
  page TEXT DEFAULT '',
  path TEXT DEFAULT '',
  store TEXT DEFAULT '',
  source TEXT NOT NULL DEFAULT 'Direct',
  medium TEXT NOT NULL DEFAULT 'direct',
  campaign TEXT DEFAULT '',
  first_source TEXT DEFAULT '',
  referrer TEXT DEFAULT '',
  url TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.website_events ENABLE ROW LEVEL SECURITY;

-- Insert: only the worker (service_role). No anon insert — this is server-side data.
-- Select: service_role only (growth agent uses the service key).
-- (No policies = default deny for anon/authenticated; service_role bypasses RLS.)

CREATE INDEX IF NOT EXISTS idx_website_events_created_at
  ON public.website_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_events_type_created
  ON public.website_events (event_type, created_at DESC);

NOTIFY pgrst, 'reload schema';
