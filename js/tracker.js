// NursesCorner tracker — send page view with referral data
// Fires once per page load. Sends to Cloudflare Worker which writes to Notion.

(function() {
  // Don't fire on local dev or admin pages
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;

  // Get campaign params from URL
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source') || params.get('ref') || document.referrer ? 'referral' : 'direct';
  const medium = params.get('utm_medium') || 'none';
  const campaign = params.get('utm_campaign') || 'none';

  // Build payload
  const payload = {
    type: 'track_pageview',
    page: document.title || window.location.pathname,
    path: window.location.pathname,
    referrer: document.referrer || '',
    source: source,
    medium: medium,
    campaign: campaign,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Send to worker
  fetch('https://affiliate-signup.odubunmi.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // silently fail — don't break page
  });
})();
