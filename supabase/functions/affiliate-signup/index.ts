// Revalidation Copilot - Affiliate Signup Edge Function
// Paste this into: Supabase Dashboard > Edge Functions > Create Function > "affiliate-signup"

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { full_name, email, social_handle, platform, follower_count, audience_niche, why_you } = await req.json()

    if (!full_name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase
      .from('affiliate_signups')
      .insert({
        full_name,
        email,
        social_handle: social_handle || '',
        platform: platform || '',
        follower_count: follower_count || '',
        audience_niche: audience_niche || '',
        why_you: why_you || '',
      })

    if (error) {
      if (error.code === '23505') {
        return new Response(JSON.stringify({ error: 'You have already applied with this email.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      throw error
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('affiliate-signup error:', err.message)
    return new Response(JSON.stringify({ error: 'Submission failed. Please email support@revalidationaicopilot.co.uk' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
