// Suggests a development area for one diary note. The suggestion only fills a chip the
// parent can change; the attention level itself is always rule-based (see src/diary/model.ts).
// POST { text: string, age_months: number } with the user's Supabase JWT.
// Returns { category: string | null, urgent: boolean }, 429 { error: "limit" } when today's
// allowance is used (3 free, 30 Premium). The note text is never stored or logged here.
// Secrets: OPENAI_API_KEY (falls back to ANTHROPIC_API_KEY), optional OPENAI_MODEL.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/http.ts";

const CATEGORIES = ["social", "name", "joint", "speech", "play", "repetitive", "sensory", "routine"];
const FREE_PER_DAY = 3;
const PREMIUM_PER_DAY = 30;
const MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1";

const SYSTEM = `You sort one note a parent wrote about their young child (0-4 years) into a
development area. The note can be in any language. Reply with JSON only:
{"category": <one of the ids below, or null>, "urgent": <true or false>}

Areas:
- social: eye contact, smiling back, interest in people, showing feelings to others
- name: turning or reacting when their name is called
- joint: pointing, showing things, following where someone looks or points
- speech: babbling, words, sentences, understanding words, losing words
- play: pretend play, imitating others, playing with toys in the usual way
- repetitive: flapping, spinning, rocking, lining things up, repeating the same words or actions
- sensory: strong reactions to sounds, textures, lights, smells, pain; unusual looking or sniffing
- routine: distress at small changes, rigid routines, very narrow interests

Rules:
- Choose the single best area. Use null when the note fits none of them (for example sleep,
  food, illness or a general mood) or is too vague to tell.
- urgent is true only when the note describes something that needs a doctor or emergency help
  now: a seizure, fainting, trouble breathing, a serious injury, possible harm or abuse, or a
  sudden loss of many skills at once. Otherwise false.
- Never diagnose and never add any other text or fields.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "unauthorized" }, 401);

  let body: { text?: unknown; age_months?: unknown };
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const age = Number(body.age_months);
  if (!text || text.length > 1000 || !Number.isFinite(age) || age < 0 || age > 72) {
    return json({ error: "bad_request" }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const { data: sub } = await admin.from("diary_subscriptions").select("status, expires_at")
    .eq("user_id", user.id).maybeSingle();
  const premium = !!sub && sub.status !== "expired" && (!sub.expires_at || new Date(sub.expires_at) > new Date());
  const { data: taken, error: takeErr } = await admin.rpc("diary_ai_take", {
    p_user: user.id, p_limit: premium ? PREMIUM_PER_DAY : FREE_PER_DAY,
  });
  if (takeErr) { console.error("usage error", takeErr.message); return json({ error: "failed" }, 502); }
  if (!taken) return json({ error: "limit", premium }, 429);

  const key = Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) { console.error("no OpenAI key"); return json({ error: "failed" }, 502); }
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_completion_tokens: 60,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          // Only the note and the age in months: never the child's name.
          { role: "user", content: JSON.stringify({ child_age_months: Math.round(age), note: text }) },
        ],
      }),
    });
    if (!r.ok) {
      console.error("openai error", r.status);
      return json({ error: r.status === 429 ? "busy" : "failed" }, r.status === 429 ? 503 : 502);
    }
    const out = JSON.parse((await r.json())?.choices?.[0]?.message?.content ?? "{}");
    const category = CATEGORIES.includes(out.category) ? out.category : null;
    return json({ category, urgent: out.urgent === true });
  } catch (e) {
    console.error("categorize failed", String(e).slice(0, 200));
    return json({ error: "failed" }, 502);
  }
});
