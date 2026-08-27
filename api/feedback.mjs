// api/feedback.js — Vercel Edge Function
//
// Serves /feedback with OpenGraph tags containing the SENDER'S NAME, resolved
// server-side. The static page can't do this: the name only exists after a token
// lookup, and by then the crawler that built the WhatsApp preview has gone.
//
// That card is the real first impression. "Sarah O. has asked you for feedback"
// versus "Practice feedback request" is the difference between a link an NHS
// employee taps and one their annual phishing training tells them not to.
//
// Wired by vercel.json: /feedback and /feedback/:slug rewrite here.
// The page itself lives at /feedback-form.html and is fetched as a template.

export const config = { runtime: 'edge' };

const FN_BASE = 'https://hehrgxshzfrirlnoffgh.supabase.co/functions/v1';
const TEMPLATE_PATH = '/feedback-form.html';
const ORIGIN = 'https://www.revalidationaicopilot.co.uk';

const FALLBACK_TITLE = 'Practice feedback request';
const FALLBACK_DESC =
  'Someone has asked you for a short piece of feedback for their NMC revalidation. It takes about two minutes.';

// The name is user-controlled data going into markup.
function attr(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function resolveName(token) {
  if (!token || token.length < 20 || token.length > 64) return null;
  try {
    const res = await fetch(
      FN_BASE + '/feedback-request-info?t=' + encodeURIComponent(token),
      // No key: the function is deployed with --no-verify-jwt and validates the
      // feedback token itself.
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return null;
    const out = await res.json();
    if (!out || !out.ok) return null;
    const name = typeof out.firstName === 'string' ? out.firstName.trim() : '';
    return name || null;
  } catch (_) {
    return null;
  }
}

export default async function handler(req) {
  const url = new URL(req.url);
  const token = url.searchParams.get('t') || '';

  const [name, template] = await Promise.all([
    resolveName(token),
    fetch(new URL(TEMPLATE_PATH, url.origin).toString()).then((r) => r.text()),
  ]);

  const title = name ? name + ' has asked you for feedback' : FALLBACK_TITLE;
  const desc = name
    ? name + " is collecting feedback for their NMC revalidation. It takes about two minutes, and there's nothing to sign up for."
    : FALLBACK_DESC;

  const ogBlock = [
    '<title>' + attr(title) + ' | Revalidation Copilot</title>',
    '<meta property="og:title" content="' + attr(title) + '">',
    '<meta property="og:description" content="' + attr(desc) + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Revalidation Copilot">',
    '<meta property="og:image" content="' + ORIGIN + '/og-image.png">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + attr(title) + '">',
    '<meta name="twitter:description" content="' + attr(desc) + '">',
    '<meta name="twitter:image" content="' + ORIGIN + '/og-image.png">',
    '<meta name="robots" content="noindex,nofollow">',
  ].join('\n  ');

  const html = template.replace(
    /<!--OG_BLOCK_START-->[\s\S]*?<!--OG_BLOCK_END-->/,
    '<!--OG_BLOCK_START-->\n  ' + ogBlock + '\n  <!--OG_BLOCK_END-->'
  );

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Keyed to a token and carries a person's name. A shared cache copy is a
      // leak waiting to happen — do not add CDN caching here.
      'Cache-Control': 'private, no-store, max-age=0',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
