// Shared by the payment webhooks (Lemon Squeezy, Creem): records a verified web purchase of
// the detailed report and emails the report once per screening.
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateReport } from "./generate.ts";
import { EMAIL_LANGS, sendReportEmail } from "./email.ts";

export const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

/** Constant-time comparison of a hex HMAC-SHA256 of `raw` against `signature`. */
export async function validHmac(raw: string, signature: string | null, secret: string) {
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

/** Records the purchase for a screening. Returns the screening id, or why it was skipped. */
export async function recordPurchase(p: {
  screeningId: unknown; transactionId: string; sandbox: boolean; priceUsd: number | null;
}): Promise<{ screeningId: string } | { ignored: string } | { error: string }> {
  if (typeof p.screeningId !== "string") return { ignored: "no_screening" };
  const { data: s } = await admin.from("screenings").select("id, user_id").eq("id", p.screeningId).maybeSingle();
  if (!s) return { ignored: "unknown_screening" };
  const { error } = await admin.from("purchases").upsert({
    user_id: s.user_id,
    screening_id: s.id,
    product: "detailed_report",
    platform: "web",
    transaction_id: p.transactionId,
    verified: true,
    environment: p.sandbox ? "SANDBOX" : "PRODUCTION",
    price_usd: p.priceUsd,
  }, { onConflict: "transaction_id", ignoreDuplicates: true });
  if (error) { console.error("purchase insert failed", error); return { error: "db" }; }
  return { screeningId: s.id };
}

export async function markRefunded(transactionId: string) {
  await admin.from("purchases").update({ refunded: true }).eq("transaction_id", transactionId);
}

/** Writes the detailed report and emails it, once per screening. */
export async function deliverDetailed(screeningId: string, buyerEmail: string | undefined) {
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
