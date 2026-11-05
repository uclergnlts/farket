// Starts a Creem checkout for the $4.99 detailed report of one screening.
// POST { screening_id: string, email?: string, lang?: string } -> { url }
// Answers 503 { error: "not_configured" } until the Creem secrets are set; the website then
// falls back to the Lemon Squeezy checkout link.
// Secrets: CREEM_API_KEY, CREEM_PRODUCT_ID, SITE_URL; CREEM_TEST_MODE=true uses the test API.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/generate.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID = /^[0-9a-f-]{36}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const apiKey = Deno.env.get("CREEM_API_KEY");
  const productId = Deno.env.get("CREEM_PRODUCT_ID");
  if (!apiKey || !productId) return json({ error: "not_configured" }, 503);

  let body: { screening_id?: string; email?: string; lang?: string };
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  if (!body.screening_id || !UUID.test(body.screening_id)) return json({ error: "bad_request" }, 400);

  const { data: s } = await admin.from("screenings").select("id, email, detailed_sent_at")
    .eq("id", body.screening_id).maybeSingle();
  if (!s) return json({ error: "not_found" }, 404);
  if (s.detailed_sent_at) return json({ error: "already_sent" }, 409);

  const site = (Deno.env.get("SITE_URL") ?? "https://farket.uclergnlts.com/").replace(/\/?$/, "/");
  const lang = ["es", "ar"].includes(body.lang ?? "") ? `${body.lang}/` : "";
  const email = [body.email, s.email].find((e) => typeof e === "string" && EMAIL.test(e));
  const base = Deno.env.get("CREEM_TEST_MODE") === "true" ? "https://test-api.creem.io" : "https://api.creem.io";

  const res = await fetch(`${base}/v1/checkouts`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      request_id: s.id,
      metadata: { screening_id: s.id },
      success_url: `${site}${lang}?paid=1`,
      ...(email ? { customer: { email } } : {}),
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || typeof data?.checkout_url !== "string") {
    console.error("creem checkout failed", res.status, data);
    return json({ error: "checkout_failed" }, 502);
  }
  return json({ url: data.checkout_url });
});
