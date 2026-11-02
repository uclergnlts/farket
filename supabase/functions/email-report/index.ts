// Writes the free short report for a screening and emails it to the address saved on it,
// with the offer for the detailed report. Sends at most once per screening.
// POST { screening_id: string }   (user's Supabase JWT required)
// Secrets: ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_FROM (e.g. "Farket <report@mail.example.com>"),
//          SITE_URL (e.g. "https://farket.example.com/").
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateReport, json, preflight } from "../_shared/generate.ts";

const COPY: Record<string, {
  subject: string; intro: string; offerTitle: string; offerText: string; offerButton: string;
  disclaimer: string; risk: Record<string, string>;
}> = {
  en: {
    subject: "Your child's development check report",
    intro: "Thank you for completing the check. Here is your personal report.",
    offerTitle: "Want the full picture?",
    offerText: "The detailed development report explains every area with your own answers, gives you activities to try at home, and includes a summary page to bring to your doctor.",
    offerButton: "Get the detailed report · $9.99",
    disclaimer: "This is a screening tool, not a diagnosis. The report is written by AI from your answers and does not replace a professional evaluation. If you are worried about your child's development, talk to your pediatrician whatever the result.",
    risk: { low: "Low likelihood", medium: "Medium likelihood", high: "High likelihood" },
  },
  es: {
    subject: "El informe de la revisión del desarrollo de su hijo",
    intro: "Gracias por completar la revisión. Aquí tiene su informe personal.",
    offerTitle: "¿Quiere ver el panorama completo?",
    offerText: "El informe detallado del desarrollo explica cada área con sus propias respuestas, le da actividades para hacer en casa e incluye una hoja resumen para llevar a su médico.",
    offerButton: "Obtener el informe detallado · 9,99 $",
    disclaimer: "Esta es una herramienta de detección, no un diagnóstico. El informe lo escribe una IA a partir de sus respuestas y no sustituye una evaluación profesional. Si le preocupa el desarrollo de su hijo, hable con su pediatra sea cual sea el resultado.",
    risk: { low: "Probabilidad baja", medium: "Probabilidad media", high: "Probabilidad alta" },
  },
  ar: {
    subject: "تقرير فحص نمو طفلك",
    intro: "شكرًا لإكمال الفحص. إليك تقريرك الشخصي.",
    offerTitle: "هل تريد الصورة الكاملة؟",
    offerText: "يشرح تقرير النمو المفصّل كل مجال بناءً على إجاباتك، ويقدّم أنشطة يمكن تجربتها في المنزل، ويتضمن صفحة ملخص لأخذها إلى طبيبك.",
    offerButton: "احصل على التقرير المفصّل · 9.99 $",
    disclaimer: "هذه أداة فحص أولي وليست تشخيصًا. يكتب التقرير الذكاءُ الاصطناعي بناءً على إجاباتك ولا يغني عن تقييم متخصص. إذا كنت قلقًا بشأن نمو طفلك، فتحدث إلى طبيب الأطفال مهما كانت النتيجة.",
    risk: { low: "احتمال منخفض", medium: "احتمال متوسط", high: "احتمال مرتفع" },
  },
};
const RISK_COLOR: Record<string, string> = { low: "#2e7d32", medium: "#b86e00", high: "#c62828" };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function reportHtml(text: string): string {
  return text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const inner = esc(l.replace(/^#+\s*/, "").replace(/^[-*•]\s/, "• "))
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return l.startsWith("#")
      ? `<h3 style="margin:20px 0 6px;font-size:17px">${inner}</h3>`
      : `<p style="margin:0 0 12px">${inner}</p>`;
  }).join("");
}

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

  const lang = COPY[s.language] ? s.language : "en";
  const res = await generateReport(admin, user.id, s, child?.sex ?? null, "short", lang);
  if ("error" in res) return json({ error: res.error }, res.error === "busy" ? 503 : 502);
  if (s.email_sent_at) return json({ sent: true, already: true });

  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!key || !from) return json({ sent: false, reason: "email_not_configured" });

  const c = COPY[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const site = Deno.env.get("SITE_URL") ?? "";
  const offerUrl = `${site}?lang=${lang}&offer=detailed&s=${s.id}`;
  const html = `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;background:#fbf8f3">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#24203a;line-height:1.55;font-size:15px">
<p>${esc(c.intro)}</p>
<div style="background:${RISK_COLOR[s.risk]};color:#fff;font-weight:bold;font-size:18px;text-align:center;padding:14px;border-radius:12px;margin:16px 0">${esc(c.risk[s.risk])}</div>
${reportHtml(res.content)}
<div style="background:#f1ecff;border-radius:12px;padding:16px 18px;margin:24px 0">
<p style="margin:0 0 6px;font-weight:bold;font-size:16px">${esc(c.offerTitle)}</p>
<p style="margin:0 0 14px">${esc(c.offerText)}</p>
<a href="${esc(offerUrl)}" style="display:inline-block;background:#5b3cc4;color:#fff;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:10px">${esc(c.offerButton)}</a>
</div>
<p style="font-size:12px;color:#6b6780">${esc(c.disclaimer)}</p>
</div></body></html>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [s.email], subject: c.subject, html }),
  });
  if (!r.ok) return json({ sent: false, reason: "email_failed" }, 502);

  await admin.from("screenings").update({ email_sent_at: new Date().toISOString() }).eq("id", s.id);
  return json({ sent: true });
});
