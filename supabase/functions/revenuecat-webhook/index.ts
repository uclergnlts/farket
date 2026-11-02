// RevenueCat webhook: records verified store purchases as report credits.
// Configure in RevenueCat > Integrations > Webhooks with
//   URL: https://<project>.supabase.co/functions/v1/revenuecat-webhook
//   Authorization header: Bearer <REVENUECAT_WEBHOOK_SECRET>
// Deployed with verify_jwt = false; the shared secret authenticates the call.
import { createClient } from "npm:@supabase/supabase-js@2";

const PRODUCTS: Record<string, "short_report" | "detailed_report"> = {
  farket_short_report: "short_report",
  farket_detailed_report: "detailed_report",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ok = (msg: string, status = 200) => new Response(msg, { status });

Deno.serve(async (req) => {
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) return ok("unauthorized", 401);

  let body: { event?: Record<string, unknown> };
  try { body = await req.json(); } catch { return ok("bad json", 400); }
  const e = body.event ?? {};
  const type = String(e.type ?? "");
  const userId = String(e.app_user_id ?? "");
  const product = PRODUCTS[String(e.product_id ?? "")];
  const transactionId = String(e.transaction_id ?? "");

  // Acknowledge events we don't act on so RevenueCat stops retrying them.
  if (!product || !UUID.test(userId) || !transactionId) return ok("ignored");

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (type === "NON_RENEWING_PURCHASE" || type === "TEST") {
    const store = String(e.store ?? "");
    const platform = store === "APP_STORE" ? "ios" : store === "PLAY_STORE" ? "android" : "test";
    const { error } = await admin.from("purchases").upsert({
      user_id: userId,
      product,
      platform,
      transaction_id: transactionId,
      environment: String(e.environment ?? "PRODUCTION"),
      price_usd: typeof e.price === "number" ? e.price : null,
      verified: true,
    }, { onConflict: "transaction_id", ignoreDuplicates: true });
    if (error) return ok("db error", 500); // RevenueCat retries on non-2xx
    return ok("recorded");
  }

  if (type === "CANCELLATION") { // refund
    const { error } = await admin.from("purchases").update({ refunded: true })
      .eq("transaction_id", transactionId);
    if (error) return ok("db error", 500);
    return ok("refunded");
  }

  return ok("ignored");
});
