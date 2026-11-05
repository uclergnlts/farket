// Lemon Squeezy webhook: records the $9.99 detailed report purchase and emails the report.
// Events: order_created, order_refunded. The checkout link carries
// checkout[custom][screening_id], which arrives here as meta.custom_data.screening_id.
// Deployed with verify_jwt=false; requests are checked with the X-Signature HMAC instead.
// Secrets: LEMONSQUEEZY_WEBHOOK_SECRET (+ ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_FROM).
import { json } from "../_shared/generate.ts";
import { deliverDetailed, markRefunded, recordPurchase, validHmac } from "../_shared/purchase.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET");
  if (!secret) return json({ error: "not_configured" }, 500);

  const raw = await req.text();
  if (!(await validHmac(raw, req.headers.get("X-Signature"), secret))) {
    return json({ error: "bad_signature" }, 401);
  }
  // deno-lint-ignore no-explicit-any
  let event: any;
  try { event = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400); }

  const name = event?.meta?.event_name;
  const order = event?.data;
  const transactionId = `ls_${order?.id}`;

  if (name === "order_refunded") {
    await markRefunded(transactionId);
    return json({ ok: true });
  }
  if (name !== "order_created" || order?.attributes?.status !== "paid") return json({ ignored: true });

  const out = await recordPurchase({
    screeningId: event?.meta?.custom_data?.screening_id,
    transactionId,
    sandbox: !!event.meta.test_mode,
    priceUsd: typeof order.attributes.total_usd === "number" ? order.attributes.total_usd / 100 : null,
  });
  if ("error" in out) return json(out, 500);
  if ("ignored" in out) return json(out);

  // The report takes a while to write; answer Lemon Squeezy now and finish in the background.
  EdgeRuntime.waitUntil(deliverDetailed(out.screeningId, order.attributes.user_email));
  return json({ ok: true });
});
