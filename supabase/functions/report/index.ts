// Generates the parent-facing AI report for a screening and stores it.
// POST { screening_id: string, kind: "short" | "detailed", language: "tr" | "en" }
// Requires the user's Supabase JWT. Secrets: ANTHROPIC_API_KEY.
// REQUIRE_PURCHASE=true makes the function refuse unpaid reports (turn on with step 3).
import Anthropic from "npm:@anthropic-ai/sdk@1.3.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "claude-opus-5-5";
const LANGUAGES: Record<string, string> = {
  tr: "Turkish", en: "English", es: "Spanish", ru: "Russian", ar: "Arabic",
};

const SYSTEM = `You write a parent-facing report for an early autism screening app.
You receive the child's age in months, a risk level (low/medium/high) already computed
by the app, the most concerning developmental areas, the questions with the parent's
answers, the report type and the output language.

Rules:
- Never diagnose. Never say the child has or does not have autism. Talk about
  "signs worth discussing with a professional".
- Never change the risk level you were given.
- Warm, calm, non-alarming, plain language, no medical jargon. Address the parent directly.
- Short report: at most 150 words, plain paragraphs, no headings.
- Detailed report: at most 900 words, with short headings: what the results mean,
  each concerning area explained with the parent's own answers, age-appropriate
  activities to try at home, when to screen again, what to tell the doctor.
- Always end with the recommended next step for the risk level:
  low = repeat the screening in 3-6 months; medium = share the results with the
  pediatrician at the next visit; high = book an appointment with a developmental
  specialist or child psychiatrist soon.
- If a loss of previously gained skills was reported, clearly say this should be
  discussed with a doctor soon, whatever the risk level.
- No medication, diet, supplement or treatment advice.
- Write only in the requested language.`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
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
  // Reads as the user (RLS), writes with the service role.
  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const { data: s } = await asUser.from("screenings").select("*").eq("id", screening_id).single();
  if (!s) return json({ error: "not_found" }, 404);

  const cached = await admin.from("reports").select("content")
    .eq("screening_id", screening_id).eq("kind", kind).eq("language", language).maybeSingle();
  if (cached.data) return json({ content: cached.data.content, cached: true });

  if (Deno.env.get("REQUIRE_PURCHASE") === "true") {
    const product = kind === "short" ? "short_report" : "detailed_report";
    const products = kind === "short" ? [product, "detailed_report"] : [product];
    const { data: paid } = await admin.from("purchases").select("id")
      .eq("user_id", user.id).eq("screening_id", screening_id)
      .in("product", products).eq("verified", true).limit(1);
    if (!paid?.length) return json({ error: "payment_required" }, 402);
  }

  const input = {
    report_type: kind,
    output_language: LANGUAGES[language],
    child_age_months: s.age_months,
    risk_level: s.risk,
    loss_of_skills_reported: s.regression,
    most_concerning_areas: s.top_domains,
    answers: s.answers,
  };

  const client = new Anthropic();
  let content = "";
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: kind === "short" ? 4000 : 16000,
      output_config: { effort: kind === "short" ? "low" : "medium" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify(input) }],
    });
    if (response.stop_reason === "refusal") return json({ error: "generation_failed" }, 502);
    for (const block of response.content) if (block.type === "text") content += block.text;
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 503);
    if (e instanceof Anthropic.APIError) return json({ error: "generation_failed", status: e.status }, 502);
    throw e;
  }
  if (!content.trim()) return json({ error: "generation_failed" }, 502);

  await admin.from("reports").insert({
    user_id: user.id, screening_id, kind, language, content, model: MODEL,
  });
  return json({ content, cached: false });
});
