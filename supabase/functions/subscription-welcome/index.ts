import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Json = Record<string, unknown>;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRODUCT_ID = "revalidation_pro_yearly";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = "Revalidation Copilot <noreply@mail.revalidationaicopilot.co.uk>";

function json(status: number, body: Json) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log("No RESEND_API_KEY set — skipping welcome email");
    return;
  }

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

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to Revalidation Copilot Pro 🎉",
      html,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("Resend error:", res.status, errText)
  } else {
    const data = await res.json()
    console.log("Welcome email sent:", data.id)
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, {
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST is allowed.",
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return json(500, {
        ok: false,
        code: "MISSING_ENV",
        message: "Supabase environment variables are missing.",
      });
    }

    if (!authHeader) {
      return json(401, {
        ok: false,
        code: "NOT_AUTHENTICATED",
        message: "Missing Authorization header.",
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (userError || !userId) {
      return json(401, {
        ok: false,
        code: "NOT_AUTHENTICATED",
        message: "Please sign in to continue.",
        detail: userError?.message ?? null,
      });
    }

    const body = await req.json().catch(() => ({}));
    const productId = asString(body?.productId);
    const platform = asString(body?.platform).toLowerCase();
    const purchaseId = asString(body?.purchaseId);
    const purchaseToken = asString(body?.purchaseToken);

    if (productId !== PRODUCT_ID) {
      return json(400, {
        ok: false,
        code: "INVALID_PRODUCT",
        message: "Unknown productId.",
      });
    }

    if (platform !== "android" && platform !== "ios") {
      return json(400, {
        ok: false,
        code: "INVALID_PLATFORM",
        message: "Platform must be ios or android.",
      });
    }

    if (!purchaseToken) {
      return json(400, {
        ok: false,
        code: "MISSING_PURCHASE_TOKEN",
        message: "Missing purchase token.",
      });
    }

    const expiresAt = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Optional billing log. Ignore failure if table does not exist yet.
    try {
      await supabase.from("billing_transactions").insert({
        user_id: userId,
        product_id: productId,
        platform,
        purchase_id: purchaseId || null,
        purchase_token: purchaseToken,
        status: "activated_v1",
        expires_at: expiresAt,
      });
    } catch (_) {
      // ignore logging failure
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          is_paid: true,
          paid_expires_at: expiresAt,
        },
        { onConflict: "id" },
      )
      .select("id, is_paid, paid_expires_at, email, first_name, display_name")
      .single();

    if (profileError || !profile) {
      return json(500, {
        ok: false,
        code: "PROFILE_UPDATE_FAILED",
        message: "Could not activate subscription.",
        detail: profileError?.message ?? "No profile row returned.",
      });
    }

    // Send welcome email in the background (don't block the response)
    if (profile.email) {
      const name = profile.first_name || profile.display_name || "there";
      sendWelcomeEmail(profile.email, name);
    }

    return json(200, {
      ok: true,
      code: "OK",
      message: "Subscription activated.",
      profile,
      meta: {
        productId,
        platform,
        purchaseId: purchaseId || null,
        expiresAt,
      },
    });
  } catch (error) {
    return json(500, {
      ok: false,
      code: "UNEXPECTED",
      message: "Unexpected error occurred.",
      detail: String(error),
    });
  }
});
