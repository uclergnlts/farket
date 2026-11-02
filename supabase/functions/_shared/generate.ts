// Shared AI report generation: used by the "report" and "email-report" functions.
import Anthropic from "npm:@anthropic-ai/sdk@1.3.0";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export const MODEL = "claude-opus-5-5";
export const LANGUAGES: Record<string, string> = {
  en: "English", es: "Spanish", ar: "Arabic", tr: "Turkish", ru: "Russian",
};
export type Kind = "short" | "detailed";

const SYSTEM = `You write a parent-facing report for an early autism screening website.
You receive the child's age range in months, the child's sex, a risk level (low/medium/high)
already computed by the site, the most concerning developmental areas, the report type,
the output language and the answers: each has the question (in English), the parent's
answer (yes / sometimes / no) and concerning_when, the answer that is a sign worth watching
("sometimes" is a milder sign).

Rules:
- Never diagnose. Never say the child has or does not have autism. Talk about
  "signs worth discussing with a professional".
- Never change the risk level you were given, and never make it sound more or less
  worrying than it is.
- Warm, calm, non-alarming, plain language, no medical jargon. Address the parent directly.
  Refer to the child as "your child" (use he/she only if the sex is given).
- Short report: at most 200 words, plain paragraphs, no headings.
- Detailed report: at most 1000 words, with short headings: what the results mean,
  each concerning area explained with the parent's own answers, age-appropriate
  activities to try at home, when to screen again, what to tell the doctor.
- Always end with the recommended next step for the risk level:
  low = repeat the screening in 3-6 months; medium = share the results with the
  pediatrician at the next visit; high = book an appointment with a developmental
  specialist or child psychiatrist soon.
- If a loss of previously gained skills was reported, clearly say this should be
  discussed with a doctor soon, whatever the risk level.
- No medication, diet, supplement or treatment advice. Never claim the report was
  written or reviewed by a doctor or specialist.
- Write only in the requested language.`;

export type GenResult = { content: string } | { error: "generation_failed" | "busy" };

// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

/** Returns the stored report, or writes and stores a new one. */
export async function generateReport(
  admin: SupabaseClient, userId: string, s: Row, sex: string | null, kind: Kind, language: string,
): Promise<GenResult> {
  const cached = await admin.from("reports").select("content")
    .eq("screening_id", s.id).eq("kind", kind).eq("language", language).maybeSingle();
  if (cached.data) return { content: cached.data.content };

  const input = {
    report_type: kind,
    output_language: LANGUAGES[language] ?? "English",
    child_age_range_months: s.age_range ?? String(s.age_months),
    child_sex: sex && sex !== "unspecified" ? sex : "not given",
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
    if (response.stop_reason === "refusal") return { error: "generation_failed" };
    for (const block of response.content) if (block.type === "text") content += block.text;
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { error: "busy" };
    if (e instanceof Anthropic.APIError) return { error: "generation_failed" };
    throw e;
  }
  if (!content.trim()) return { error: "generation_failed" };

  await admin.from("reports").upsert(
    { user_id: userId, screening_id: s.id, kind, language, content, model: MODEL },
    { onConflict: "screening_id,kind,language", ignoreDuplicates: true },
  );
  return { content };
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });

export const preflight = () => json({ ok: true });
