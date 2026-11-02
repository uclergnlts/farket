// Writes the free short report for a screening and emails it to the address saved on it,
// with the offer for the detailed report. Sends at most once per screening.
// POST { screening_id: string }   (user's Supabase JWT required)
// Secrets: ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_FROM (e.g. "Farket <report@mail.example.com>"),
//          SITE_URL (e.g. "https://farket.example.com/").
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateReport, json, preflight } from "../_shared/generate.ts";
import { EMAIL_LANGS, sendReportEmail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "unauthorized" }, 401);

  let body: { screening_id?: string };
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  if (!body.screening_id) return json({ error: "bad_request" }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const { data: s } = await asUser.from("screenings").select("*").eq("id", body.screening_id).single();
  if (!s) return json({ error: "not_found" }, 404);
  if (!s.email) return json({ error: "no_email" }, 400);
  const { data: child } = await asUser.from("children").select("sex").eq("id", s.child_id).single();

  const lang = EMAIL_LANGS.includes(s.language) ? s.language : "en";
  const res = await generateReport(admin, user.id, s, child?.sex ?? null, "short", lang);
  if ("error" in res) return json({ error: res.error }, res.error === "busy" ? 503 : 502);
  if (s.email_sent_at) return json({ sent: true, already: true });

  const out = await sendReportEmail(s, lang, res.content, "short");
  if (!out.sent) return json(out, out.reason === "email_failed" ? 502 : 200);
  await admin.from("screenings").update({ email_sent_at: new Date().toISOString() }).eq("id", s.id);
  return json({ sent: true });
});
