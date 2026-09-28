// Revalidation Copilot — source tracking
// Captures where users come from and sends to Cloudflare Worker → Notion
// Fires once per page load. Silent on failure.

(function() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;

  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname;

  // Determine page category
  let page = 'Other';
  if (path === '/' || path === '') page = 'Home';
  else if (path.includes('download')) page = 'Download';
  else if (path.includes('feature')) page = 'Features';
  else if (path.includes('blog') || path.includes('seo')) page = 'Blog';
  else if (path.includes('pricing')) page = 'Pricing';
  else if (path.includes('contact')) page = 'Contact';
  else if (path.includes('affiliate')) page = 'Affiliate';
  else if (path.includes('consultation')) page = 'Consultation';

  // Work out the source
  let source = 'Direct';
  const ref = document.referrer || '';
  const utmSource = params.get('utm_source');

  if (utmSource) {
    source = utmSource;
  } else if (ref.includes('google')) {
    source = 'Google Search';
  } else if (ref.includes('tiktok')) {
    source = 'TikTok';
  } else if (ref.includes('instagram') || ref.includes('ig.')) {
    source = 'Instagram';
  } else if (ref.includes('facebook') || ref.includes('fb.')) {
    source = 'Facebook';
  } else if (ref.includes('youtube') || ref.includes('youtu')) {
    source = 'YouTube';
  } else if (ref.includes('x.com') || ref.includes('twitter')) {
    source = 'Twitter/X';
  } else if (ref.includes('linkedin')) {
    source = 'LinkedIn';
  } else if (ref.includes('reddit')) {
    source = 'Reddit';
  } else if (ref.includes('t.co') || ref.includes('bit.ly') || ref.includes('buff.ly')) {
    source = 'Referral';
  } else if (ref) {
    source = 'Referral';
  }

  const medium = params.get('utm_medium') || (source === 'Google Search' ? 'organic' : (ref ? 'referral' : 'direct'));
  const campaign = params.get('utm_campaign') || '';

  // Persist UTM attribution so later pages (e.g. /download.html) keep the source.
  // First touch never overwritten; last touch updated on every UTM-bearing visit.
  if (utmSource) {
    try {
      const touch = { source: source.substring(0, 100), medium: medium.substring(0, 50), campaign: campaign.substring(0, 200), ts: Date.now() };
      if (!localStorage.getItem('rc_first_utm')) localStorage.setItem('rc_first_utm', JSON.stringify(touch));
      localStorage.setItem('rc_last_utm', JSON.stringify(touch));
    } catch (e) {}
  }

  // Only track meaningful views (skip bots, pings, previews)
  if (navigator.webdriver) return;
  if (document.hidden) return;

  const payload = {
    type: 'track_pageview',
    page: page,
    path: path,
    referrer: ref,
    source: source.substring(0, 100),
    medium: medium.substring(0, 50),
    campaign: campaign.substring(0, 200),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  fetch('https://affiliate-signup.odubunmi.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
// Read persisted UTM attribution (first-touch and last-touch). Returns {} if absent.
window.rcUtmFallback = function() {
  try {
    const parse = function(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
    const first = parse('rc_first_utm');
    const last = parse('rc_last_utm');
    return { first: first, last: last };
  } catch (e) { return { first: {}, last: {} }; }
};
})();
