// Lemon Squeezy webhook: records the $9.99 detailed report purchase and emails the report.
// Events: order_created, order_refunded. The checkout link carries
// checkout[custom][screening_id], which arrives here as meta.custom_data.screening_id.
// Deployed with verify_jwt=false; requests are checked with the X-Signature HMAC instead.
// Secrets: LEMONSQUEEZY_WEBHOOK_SECRET (+ ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_FROM).
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateReport, json } from "../_shared/generate.ts";
import { EMAIL_LANGS, sendReportEmail } from "../_shared/email.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

async function validSignature(raw: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

/** Writes the detailed report and emails it, once per screening. */
async function deliver(screeningId: string, buyerEmail: string | undefined) {
  const { data: s } = await admin.from("screenings").select("*").eq("id", screeningId).single();
  if (!s || s.detailed_sent_at) return;
  const { data: child } = await admin.from("children").select("sex").eq("id", s.child_id).single();
  const lang = EMAIL_LANGS.includes(s.language) ? s.language : "en";
  const res = await generateReport(admin, s.user_id, s, child?.sex ?? null, "detailed", lang);
  if ("error" in res) { console.error("detailed report failed", screeningId, res.error); return; }
  const to = s.email ?? buyerEmail;
  if (!to) return;
  const out = await sendReportEmail(s, lang, res.content, "detailed", to);
  if (!out.sent) { console.error("detailed email failed", screeningId, out.reason); return; }
  await admin.from("screenings").update({ detailed_sent_at: new Date().toISOString() }).eq("id", s.id);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET");
  if (!secret) return json({ error: "not_configured" }, 500);

  const raw = await req.text();
  if (!(await validSignature(raw, req.headers.get("X-Signature"), secret))) {
    return json({ error: "bad_signature" }, 401);
  }
  // deno-lint-ignore no-explicit-any
  let event: any;
  try { event = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400); }

  const name = event?.meta?.event_name;
  const order = event?.data;
  const transactionId = `ls_${order?.id}`;

  if (name === "order_refunded") {
    await admin.from("purchases").update({ refunded: true }).eq("transaction_id", transactionId);
    return json({ ok: true });
  }
  if (name !== "order_created" || order?.attributes?.status !== "paid") return json({ ignored: true });

  const screeningId = event?.meta?.custom_data?.screening_id;
  if (typeof screeningId !== "string") return json({ ignored: "no_screening" });
  const { data: s } = await admin.from("screenings").select("id, user_id").eq("id", screeningId).maybeSingle();
  if (!s) return json({ ignored: "unknown_screening" });

  const { error } = await admin.from("purchases").upsert({
    user_id: s.user_id,
    screening_id: s.id,
    product: "detailed_report",
    platform: "web",
    transaction_id: transactionId,
    verified: true,
    environment: event.meta.test_mode ? "SANDBOX" : "PRODUCTION",
    price_usd: typeof order.attributes.total_usd === "number" ? order.attributes.total_usd / 100 : null,
  }, { onConflict: "transaction_id", ignoreDuplicates: true });
  if (error) { console.error("purchase insert failed", error); return json({ error: "db" }, 500); }

  // The report takes a while to write; answer Lemon Squeezy now and finish in the background.
  EdgeRuntime.waitUntil(deliver(s.id, order.attributes.user_email));
  return json({ ok: true });
});
