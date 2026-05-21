import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = 'Revalidation Copilot <noreply@mail.revalidationaicopilot.co.uk>'

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { email, first_name, display_name } = await req.json()

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const name = first_name || display_name || 'there'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,#1a73e8,#0aa37f);padding:40px 32px 36px;text-align:center;">
<img src="https://www.revalidationaicopilot.co.uk/logo.png" width="72" height="72" style="border-radius:16px;margin-bottom:16px;" />
<h1 style="color:#fff;font-size:24px;margin:0 0 8px;">Welcome to Revalidation Copilot 🎉</h1>
<p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0;">You're on the <strong>Pro</strong> plan</p>
</td></tr>
<tr><td style="padding:36px 32px 28px;">
<p style="font-size:17px;color:#1a2a3a;margin:0 0 20px;">Hi ${name},</p>
<p style="font-size:15px;color:#4a5a6a;line-height:1.6;margin:0 0 20px;">Thanks for subscribing to Revalidation Copilot Pro. Your NMC revalidation just got a whole lot easier.</p>
<h2 style="font-size:16px;color:#1a2a3a;margin:24px 0 12px;">What you get with Pro:</h2>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
<tr><td style="padding:8px 0;color:#4a5a6a;font-size:14px;">✅ <strong>Unlimited AI reflective accounts</strong> — speak, review, export</td></tr>
<tr><td style="padding:8px 0;color:#4a5a6a;font-size:14px;">✅ <strong>Save & export</strong> your portfolio when you need it</td></tr>
<tr><td style="padding:8px 0;color:#4a5a6a;font-size:14px;">✅ <strong>CPD & practice hour tracker</strong> — always know where you stand</td></tr>
<tr><td style="padding:8px 0;color:#4a5a6a;font-size:14px;">✅ <strong>Priority support</strong> — we reply within hours, not days</td></tr>
</table>
<p style="font-size:15px;color:#4a5a6a;line-height:1.6;margin:0 0 20px;">Ready to start? Open the app and create your first reflective account — it takes 10 minutes.</p>
<p style="font-size:14px;color:#6b7b8b;line-height:1.5;margin:0 0 20px;">If you run into any issues, email us at <a href="mailto:support@revalidationaicopilot.co.uk" style="color:#1a73e8;font-weight:600;">support@revalidationaicopilot.co.uk</a> and we'll get back to you quickly.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td align="center">
<a href="https://www.revalidationaicopilot.co.uk/blog/nmc-revalidation-checklist-2026.html" style="display:inline-block;padding:14px 32px;background:#0aa37f;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;">Get started with the checklist →</a>
</td></tr>
</table>
<p style="font-size:14px;color:#8a9aaa;line-height:1.5;margin:20px 0 0;border-top:1px solid #e8edf2;padding-top:20px;">Questions? Reply to this email or visit <a href="https://www.revalidationaicopilot.co.uk/support.html" style="color:#1a73e8;">support page</a>.</p>
</td></tr>
<tr><td style="padding:0 32px 24px;text-align:center;">
<p style="font-size:12px;color:#9aabba;margin:0;">Beemal Innovation Ltd</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Revalidation Copilot Pro 🎉',
      html,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Resend error:', res.status, errText)
    return new Response(JSON.stringify({ error: `Send failed: ${res.status}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = await res.json()
  console.log('Welcome email sent:', data.id)
  return new Response(JSON.stringify({ sent: true, id: data.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
