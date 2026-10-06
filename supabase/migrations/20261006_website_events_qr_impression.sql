-- Experiment exp_qr_desktop_2026-10-06: allow QR impression rows in website_events.
-- The worker's new track_qr_impression route writes event_type = 'qr_impression';
-- without this the CHECK constraint rejects every one of them.
-- Run in the Supabase SQL editor BEFORE deploying the worker.

ALTER TABLE public.website_events
  DROP CONSTRAINT IF EXISTS website_events_event_type_check;

ALTER TABLE public.website_events
  ADD CONSTRAINT website_events_event_type_check
  CHECK (event_type IN ('pageview', 'download_click', 'qr_impression'));

NOTIFY pgrst, 'reload schema';
