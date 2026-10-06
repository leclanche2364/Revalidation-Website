// Download Source Tracker — Cloudflare Worker
// Routes incoming pageview and download-click data to Notion
// NOTION_TOKEN must be set as a Worker secret via Cloudflare dashboard

const DB_DATA_SOURCE_ID = '153c1b78-456f-418a-a16e-c49645be88fd';

// Best-effort mirror to Supabase (website_events table). Notion stays primary;
// a Supabase failure is logged but never breaks the response.
async function supabaseInsert(env, row) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return { skipped: 'missing env' };
  try {
    const res = await fetch(env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/website_events', {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Supabase error:', res.status, errText);
      return { error: res.status, detail: errText.substring(0, 200) };
    }
    return { ok: true };
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    return { exception: err.message };
  }
}

async function notionRequest(endpoint, env, body) {
  const NOTION_TOKEN = env.NOTION_TOKEN;
  const res = await fetch('https://api.notion.com/v1/' + endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + NOTION_TOKEN,
      'Notion-Version': '2025-09-03',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Notion error:', err);
    throw new Error('Notion request failed: ' + res.status);
  }
  return res.json();
}

export default {
  async fetch(request, env) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') return new Response(null, { headers })

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST only' }), {
        status: 405, headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }

    try {
      const body = await request.json()

      // Route: pageview tracking
      if (body.type === 'track_pageview') {
        const now = new Date().toISOString();
        const sourceLabel = body.source || 'Direct';
        const mediumLabel = body.medium && body.medium !== 'none' ? body.medium : 'direct';
        const eventName = (body.page || 'Other') + ' — ' + sourceLabel + ' — ' + now.substring(0, 10);

        const props = {
          'Name': { title: [{ text: { content: eventName.substring(0, 200) } }] },
          'Event Type': { select: { name: 'Page View' } },
          'Source': { select: { name: sourceLabel } },
          'Medium': { select: { name: mediumLabel } },
          'Campaign': { rich_text: [{ text: { content: (body.campaign || '').substring(0, 200) } }] },
          'Full URL': { url: (body.url || '').substring(0, 2000) },
          'Loaded At': { date: { start: now } },
        };
        if (body.referrer) {
          props['Referrer URL'] = { url: body.referrer.substring(0, 2000) };
        }

        const supa = await supabaseInsert(env, {
          event_type: 'pageview',
          page: body.page || 'Other',
          path: body.path || '',
          source: sourceLabel,
          medium: mediumLabel,
          campaign: body.campaign || '',
          referrer: body.referrer || '',
          url: body.url || '',
          user_agent: body.userAgent || '',
        });

        await notionRequest('pages', env, {
          parent: { type: 'data_source_id', data_source_id: DB_DATA_SOURCE_ID },
          properties: props,
        });

        return new Response(JSON.stringify({ ok: true, supa }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Route: QR impression (experiment exp_qr_desktop_2026-10-06).
      // Supabase only: a desktop visit can log up to four impressions, which would
      // flood the Notion database. Only known placements are accepted, so junk posted
      // to this public endpoint cannot pollute the experiment.
      if (body.type === 'track_qr_impression') {
        const QR_MEDIUMS = ['qr_blog_cta', 'qr_blog_sidebar', 'qr_download', 'qr_webapp_soon'];
        if (!QR_MEDIUMS.includes(body.medium)) {
          return new Response(JSON.stringify({ error: 'Unknown placement' }), {
            status: 400, headers: { ...headers, 'Content-Type': 'application/json' }
          });
        }
        const supa = await supabaseInsert(env, {
          event_type: 'qr_impression',
          page: 'QR',
          path: String(body.path || '').substring(0, 500),
          source: 'website',
          medium: body.medium,
          campaign: String(body.campaign || '').substring(0, 200),
          url: String(body.url || '').substring(0, 2000),
          user_agent: (request.headers.get('user-agent') || '').substring(0, 500),
        });
        return new Response(JSON.stringify({ ok: !!supa.ok }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Route: download click tracking
      if (body.type === 'track_download_click') {
        const now = new Date().toISOString();
        const storeLabel = body.store === 'ios' ? 'iOS (App Store)' : body.store === 'android' ? 'Android (Google Play)' : 'web';
        const sourceLabel = body.source || 'Direct';
        const eventName = storeLabel + ' Download — ' + sourceLabel + ' — ' + now.substring(0, 10);

        const supa = await supabaseInsert(env, {
          event_type: 'download_click',
          page: 'Download',
          store: storeLabel,
          source: sourceLabel,
          medium: body.medium && body.medium !== 'none' ? body.medium : 'direct',
          campaign: body.campaign || '',
          first_source: body.first_source || '',
          url: body.url || '',
        });

        await notionRequest('pages', env, {
          parent: { type: 'data_source_id', data_source_id: DB_DATA_SOURCE_ID },
          properties: {
            'Name': { title: [{ text: { content: eventName.substring(0, 200) } }] },
            'Event Type': { select: { name: 'Download Click' } },
            'Source': { select: { name: sourceLabel } },
            'Medium': { select: { name: body.medium && body.medium !== 'none' ? body.medium : 'direct' } },
            'Campaign': { rich_text: [{ text: { content: (body.campaign || '').substring(0, 200) } }] },
            'Store': { select: { name: storeLabel } },
            'Full URL': { url: (body.url || '').substring(0, 2000) },
            'Loaded At': { date: { start: now } },
          }
        });

        return new Response(JSON.stringify({ ok: true, supa }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Route: consultation reminder signup (legacy)
      if (body.type === 'consultation_reminder') {
        if (!body.email || !body.email.includes('@')) {
          return new Response(JSON.stringify({ error: 'Valid email required' }), {
            status: 400, headers: { ...headers, 'Content-Type': 'application/json' }
          });
        }

        await notionRequest('pages', env, {
          parent: { database_id: '28ff3834-c0fd-48e5-aae5-901a98969a91' },
          properties: {
            'Name': { title: [{ text: { content: 'Consultation Reminder: ' + body.email } }] },
            'Email': { email: body.email },
            'Status': { select: { name: 'Consultation' } },
            'Created At': { date: { start: new Date().toISOString().split('T')[0] } },
          }
        });

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Original route: affiliate signup (legacy)
      const props = {
        'Name': { title: [{ text: { content: body.full_name || '' } }] },
        'Email': { email: body.email || '' },
        'Status': { select: { name: 'New' } },
        'Created At': { date: { start: new Date().toISOString().split('T')[0] } },
      }
      if (body.social_handle) props['Social Handle'] = { rich_text: [{ text: { content: body.social_handle } }] }
      if (body.platform) props['Platform'] = { select: { name: body.platform } }
      if (body.follower_count) props['Followers'] = { rich_text: [{ text: { content: body.follower_count } }] }
      if (body.audience_niche) props['Niche'] = { rich_text: [{ text: { content: body.audience_niche } }] }
      if (body.why_you) props['Why You'] = { rich_text: [{ text: { content: body.why_you } }] }

      await notionRequest('pages', env, {
        parent: { database_id: '28ff3834-c0fd-48e5-aae5-901a98969a91' },
        properties: props,
      })

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      })
    } catch (err) {
      console.error('Worker error:', err.message)
      return new Response(JSON.stringify({ error: 'Server error' }), {
        status: 500, headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }
  }
}
