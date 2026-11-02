// Returns the AI report for a screening (generating and storing it the first time).
// POST { screening_id: string, kind: "short" | "detailed", language: "en" | "es" | "ar" }
// Requires the user's Supabase JWT. Secrets: ANTHROPIC_API_KEY.
// The short report is free. With REQUIRE_PURCHASE=true the detailed report needs a
// verified purchase, which is attached to the screening the first time it is used.
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateReport, json, LANGUAGES, preflight } from "../_shared/generate.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "unauthorized" }, 401);

  let body: { screening_id?: string; kind?: string; language?: string };
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const { screening_id, kind, language } = body;
  if (!screening_id || (kind !== "short" && kind !== "detailed") || !language || !LANGUAGES[language]) {
    return json({ error: "bad_request" }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const { data: s } = await asUser.from("screenings").select("*").eq("id", screening_id).single();
  if (!s) return json({ error: "not_found" }, 404);
  const { data: child } = await asUser.from("children").select("sex").eq("id", s.child_id).single();

  if (kind === "detailed" && Deno.env.get("REQUIRE_PURCHASE") === "true") {
    const valid = () => admin.from("purchases").select("id")
      .eq("user_id", user.id).eq("product", "detailed_report").eq("verified", true).eq("refunded", false);
    const { data: attached } = await valid().eq("screening_id", screening_id).limit(1);
    if (!attached?.length) {
      const { data: unused } = await valid().is("screening_id", null).order("created_at").limit(10);
      let claimed = false;
      for (const p of unused ?? []) {
        const { data } = await admin.from("purchases").update({ screening_id })
          .eq("id", p.id).is("screening_id", null).select("id");
        if (data?.length) { claimed = true; break; }
      }
      if (!claimed) return json({ error: "payment_required" }, 402);
    }
  }

  const res = await generateReport(admin, user.id, s, child?.sex ?? null, kind, language);
  if ("error" in res) return json({ error: res.error }, res.error === "busy" ? 503 : 502);
  return json({ content: res.content });
});
