import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ConsultationDraft {
  email: string
  answers: Record<string, unknown>
  currentTheme: number
  currentItem: number
  createdAt: string
}

Deno.serve(async (req: Request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body: ConsultationDraft = await req.json()

    if (!body.email || !body.email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase
      .from('consultation_drafts')
      .insert({
        email: body.email.toLowerCase().trim(),
        answers: body.answers || {},
        current_theme: body.currentTheme || 0,
        current_item: body.currentItem || 0,
        created_at: body.createdAt || new Date().toISOString(),
        notified: false,
      })

    if (error) {
      console.error('Supabase insert error:', error)
      return new Response(JSON.stringify({ error: 'Failed to save draft' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Handler error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
})
