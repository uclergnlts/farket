// Shared AI report generation (OpenAI): used by "report", "email-report" and the webhook.
// Secrets: OPENAI_API_KEY (falls back to ANTHROPIC_API_KEY, where the key was first saved),
// optional OPENAI_MODEL.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export const MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1";
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
- Never make a clinical judgement of your own: never say that no further evaluation,
  assessment or follow-up is needed, that the child is fine or developing normally,
  or that the signs are nothing to worry about. Only a professional can say that.
- Never change the risk level you were given, and never make it sound more or less
  worrying than it is.
- Warm, calm, non-alarming, plain language, no medical jargon. Address the parent directly.
  Always call the child "your child" (never "your boy" or "your girl"); you may use
  he/she or him/her later only if the sex is given.
- An answer is a strength only when it is the opposite of concerning_when (for
  example "yes" when concerning_when is "no"). A "sometimes" answer is always a mild
  sign worth watching, never a strength: do not list it among positive signs.
- Short report: at most 170 words (count them; never more), plain paragraphs, no headings.
- Detailed report: at most 1000 words, with short headings: what the results mean,
  each concerning area explained with the parent's own answers, age-appropriate
  activities to try at home, when to screen again, what to tell the doctor.
- The recommended next step for the risk level is:
  low = repeat the screening in 3-6 months; medium = share the results with the
  pediatrician at the next visit; high = book an appointment with a developmental
  specialist or child psychiatrist soon.
  Give only the step for the given risk level, never the step of another level
  (for medium or high, do not tell the parent to just repeat the screening or wait),
  and make it the last sentence of the report.
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

  const key = Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) { console.error("no OpenAI key"); return { error: "generation_failed" }; }
  let content = "";
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_completion_tokens: kind === "short" ? 1500 : 6000,
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
    });
    if (!r.ok) {
      console.error("openai error", r.status, (await r.text()).slice(0, 500));
      return { error: r.status === 429 ? "busy" : "generation_failed" };
    }
    const data = await r.json();
    content = data?.choices?.[0]?.message?.content ?? "";
  } catch (e) {
    console.error("openai request failed", String(e));
    return { error: "generation_failed" };
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
