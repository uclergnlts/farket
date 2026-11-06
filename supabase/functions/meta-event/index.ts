// Sends the "Lead" for one screening to Meta's Conversions API, so ad results are counted
// even when the browser blocks the Pixel. The website calls it only for visitors who
// accepted cookies. Sent: the hashed email, Meta's own cookies (_fbp/_fbc), page address,
// IP and browser. Never the answers, the result or the child's age or sex.
// POST { screening_id, fbp?, fbc?, url? }   (user's Supabase JWT required)
// Secrets: META_CAPI_TOKEN (Events Manager > Pixel > Settings > Conversions API > access token).
// Without the token it does nothing.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/generate.ts";

const PIXEL_ID = "956917537156142";

async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const token = Deno.env.get("META_CAPI_TOKEN");
  if (!token) return json({ skipped: "not_configured" });
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "unauthorized" }, 401);

  let body: { screening_id?: string; fbp?: string; fbc?: string; url?: string };
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  if (!body.screening_id) return json({ error: "bad_request" }, 400);

  const asUser = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  // Row level security: a visitor can only send the Lead for their own screening.
  const { data: s } = await asUser.from("screenings").select("id, email, created_at")
    .eq("id", body.screening_id).maybeSingle();
  if (!s?.email) return json({ error: "not_found" }, 404);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userData: Record<string, unknown> = {
    em: [await sha256(s.email.trim().toLowerCase())],
    client_user_agent: req.headers.get("user-agent") ?? undefined,
    client_ip_address: ip || undefined,
  };
  if (typeof body.fbp === "string" && body.fbp.startsWith("fb.")) userData.fbp = body.fbp;
  if (typeof body.fbc === "string" && body.fbc.startsWith("fb.")) userData.fbc = body.fbc;
  const pageUrl = typeof body.url === "string" && body.url.startsWith("https://") ? body.url.split("?")[0] : undefined;

  const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        event_name: "Lead",
        event_time: Math.floor(new Date(s.created_at).getTime() / 1000),
        event_id: s.id, // the browser Pixel sends the same id, so Meta counts it once
        action_source: "website",
        event_source_url: pageUrl,
        user_data: userData,
      }],
    }),
  });
  if (!res.ok) {
    console.error("meta capi failed", res.status, await res.text().catch(() => ""));
    return json({ error: "meta_failed" }, 502);
  }
  return json({ sent: true });
});
