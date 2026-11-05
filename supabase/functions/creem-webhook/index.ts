// Creem webhook: records the $4.99 detailed report purchase and emails the report.
// Events: checkout.completed, refund.created. The checkout is created by creem-checkout with
// request_id = screening id (also in metadata.screening_id).
// Deployed with verify_jwt=false; requests are checked with the creem-signature header
// (hex HMAC-SHA256 of the raw body with the webhook secret).
// Secrets: CREEM_WEBHOOK_SECRET (+ ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_FROM).
import { json } from "../_shared/generate.ts";
import { deliverDetailed, markRefunded, recordPurchase, validHmac } from "../_shared/purchase.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

// deno-lint-ignore no-explicit-any
const idOf = (v: any): string | undefined => typeof v === "string" ? v : v?.id;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("CREEM_WEBHOOK_SECRET");
  if (!secret) return json({ error: "not_configured" }, 500);

  const raw = await req.text();
  if (!(await validHmac(raw, req.headers.get("creem-signature"), secret))) {
    return json({ error: "bad_signature" }, 401);
  }
  // deno-lint-ignore no-explicit-any
  let event: any;
  try { event = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400); }
  const obj = event?.object;

  if (event?.eventType === "refund.created") {
    const orderId = idOf(obj?.order);
    if (orderId) await markRefunded(`creem_${orderId}`);
    return json({ ok: true });
  }
  if (event?.eventType !== "checkout.completed") return json({ ignored: true });
  const order = obj?.order;
  if (!order?.id || order.status !== "paid") return json({ ignored: "not_paid" });

  const out = await recordPurchase({
    screeningId: obj.metadata?.screening_id ?? obj.request_id,
    transactionId: `creem_${order.id}`,
    sandbox: obj.mode !== "prod",
    priceUsd: order.currency === "USD" && typeof order.amount === "number" ? order.amount / 100 : null,
  });
  if ("error" in out) return json(out, 500);
  if ("ignored" in out) return json(out);

  // The report takes a while to write; answer Creem now and finish in the background.
  const email = typeof obj.customer === "object" ? obj.customer?.email : undefined;
  EdgeRuntime.waitUntil(deliverDetailed(out.screeningId, email));
  return json({ ok: true });
});
