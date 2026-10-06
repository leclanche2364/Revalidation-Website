-- Readout for exp_qr_desktop_2026-10-06. Read-only. Run weekly, and at week 4.
-- Start date is when the QR code went live; change it if the push happened later.

WITH win AS (
  SELECT timestamptz '2026-10-06 00:00+01' AS start_at, now() AS end_at
),
desktop_views AS (
  -- Desktop blog page views: the population that can see a QR code.
  SELECT count(*) AS n
  FROM website_events, win
  WHERE event_type = 'pageview'
    AND path LIKE '/blog/%'
    AND user_agent !~* '(iphone|ipad|android|mobile)'
    AND created_at >= start_at AND created_at < end_at
),
per_placement AS (
  SELECT medium,
         count(*) FILTER (WHERE event_type = 'qr_impression')  AS impressions,
         count(*) FILTER (WHERE event_type = 'download_click') AS scans
  FROM website_events, win
  WHERE medium IN ('qr_blog_cta', 'qr_blog_sidebar', 'qr_download', 'qr_webapp_soon')
    AND created_at >= start_at AND created_at < end_at
  GROUP BY medium
)
SELECT p.medium AS placement,
       p.impressions,
       p.scans,
       round(100.0 * p.scans / nullif(p.impressions, 0), 1) AS scan_rate_pct,
       (SELECT n FROM desktop_views) AS desktop_blog_views
FROM per_placement p
UNION ALL
SELECT 'TOTAL', sum(impressions), sum(scans),
       round(100.0 * sum(scans) / nullif(sum(impressions), 0), 1),
       (SELECT n FROM desktop_views)
FROM per_placement
ORDER BY placement;

-- Desktop readers who clicked a download link and got the "web app coming soon" pop-up:
-- SELECT count(*) FROM website_events
-- WHERE event_type = 'download_click' AND medium = 'webapp_soon_popup'
--   AND created_at >= '2026-10-06';
