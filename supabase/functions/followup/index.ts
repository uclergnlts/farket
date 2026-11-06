// One reminder email, 24 to 72 hours after the check, to parents who ticked "send me tips"
// and have not bought the detailed report. Each screening gets it at most once.
// Called every hour by pg_cron. Safe to call any time: it only picks rows that are due.
// Deploy with verify_jwt = false. Secrets: RESEND_API_KEY, EMAIL_FROM, SITE_URL.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json } from "../_shared/http.ts";
import { sendFollowupEmail } from "../_shared/followup-email.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async () => {
  const now = Date.now();
  const { data: due, error } = await admin.from("screenings")
    .select("id, email, risk, language")
    .eq("marketing_consent", true)
    .not("email", "is", null)
    .is("followup_sent_at", null)
    .is("detailed_sent_at", null)
    .lte("created_at", new Date(now - 24 * 3600e3).toISOString())
    .gte("created_at", new Date(now - 72 * 3600e3).toISOString())
    .limit(50);
  if (error) return json({ error: error.message }, 500);

  let sent = 0;
  for (const s of due ?? []) {
    // Claim the row first so two runs never send the same reminder twice.
    const { data: claimed } = await admin.from("screenings")
      .update({ followup_sent_at: new Date().toISOString() })
      .eq("id", s.id).is("followup_sent_at", null).select("id");
    if (!claimed?.length) continue;
    const out = await sendFollowupEmail(s);
    if (out.sent) sent++;
    else console.error("followup failed", s.id, out.reason);
  }
  return json({ due: due?.length ?? 0, sent });
});
