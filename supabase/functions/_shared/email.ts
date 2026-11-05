// Builds and sends report emails through Resend. Used by "email-report" (free short
// report with the offer) and "lemonsqueezy-webhook" (paid detailed report).
// Secrets: RESEND_API_KEY, EMAIL_FROM, SITE_URL.
const COPY: Record<string, {
  subject: string; intro: string; detailedSubject: string; detailedIntro: string; offerTitle: string; offerText: string; offerButton: string;
  disclaimer: string; risk: Record<string, string>;
}> = {
  en: {
    subject: "Your child's development check report",
    intro: "Thank you for completing the check. Here is your personal report.",
    detailedSubject: "Your detailed development report",
    detailedIntro: "Thank you for your purchase. Here is your detailed development report. You can print this email or forward it to your doctor.",
    offerTitle: "Want the full picture?",
    offerText: "The detailed development report explains every area with your own answers, gives you activities to try at home, and includes a summary page to bring to your doctor.",
    offerButton: "Get the detailed report · $4.99",
    disclaimer: "This is a screening tool, not a diagnosis. The report is written by AI from your answers and does not replace a professional evaluation. If you are worried about your child's development, talk to your pediatrician whatever the result.",
    risk: { low: "Low likelihood", medium: "Medium likelihood", high: "High likelihood" },
  },
  es: {
    subject: "El informe de la revisión del desarrollo de su hijo",
    intro: "Gracias por completar la revisión. Aquí tiene su informe personal.",
    detailedSubject: "Su informe detallado del desarrollo",
    detailedIntro: "Gracias por su compra. Aquí tiene su informe detallado del desarrollo. Puede imprimir este correo o reenviarlo a su médico.",
    offerTitle: "¿Quiere ver el panorama completo?",
    offerText: "El informe detallado del desarrollo explica cada área con sus propias respuestas, le da actividades para hacer en casa e incluye una hoja resumen para llevar a su médico.",
    offerButton: "Obtener el informe detallado · 4,99 $",
    disclaimer: "Esta es una herramienta de detección, no un diagnóstico. El informe lo escribe una IA a partir de sus respuestas y no sustituye una evaluación profesional. Si le preocupa el desarrollo de su hijo, hable con su pediatra sea cual sea el resultado.",
    risk: { low: "Probabilidad baja", medium: "Probabilidad media", high: "Probabilidad alta" },
  },
  ar: {
    subject: "تقرير فحص نمو طفلك",
    intro: "شكرًا لإكمال الفحص. إليك تقريرك الشخصي.",
    detailedSubject: "تقرير النمو المفصّل الخاص بك",
    detailedIntro: "شكرًا لشرائك. إليك تقرير النمو المفصّل. يمكنك طباعة هذه الرسالة أو إرسالها إلى طبيبك.",
    offerTitle: "هل تريد الصورة الكاملة؟",
    offerText: "يشرح تقرير النمو المفصّل كل مجال بناءً على إجاباتك، ويقدّم أنشطة يمكن تجربتها في المنزل، ويتضمن صفحة ملخص لأخذها إلى طبيبك.",
    offerButton: "احصل على التقرير المفصّل · 4.99 $",
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

export const EMAIL_LANGS = Object.keys(COPY);

// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

/** Emails a report for screening `s` to its saved address. The short report carries the offer. */
export async function sendReportEmail(
  s: Row, lang: string, content: string, kind: "short" | "detailed", to: string = s.email,
): Promise<{ sent: boolean; reason?: string }> {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!key || !from) return { sent: false, reason: "email_not_configured" };

  const c = COPY[lang] ?? COPY.en;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const site = Deno.env.get("SITE_URL") ?? "";
  const offerUrl = `${site}?lang=${lang}&offer=detailed&s=${s.id}`;
  const offer = kind === "short" ? `<div style="background:#f1ecff;border-radius:12px;padding:16px 18px;margin:24px 0">
<p style="margin:0 0 6px;font-weight:bold;font-size:16px">${esc(c.offerTitle)}</p>
<p style="margin:0 0 14px">${esc(c.offerText)}</p>
<a href="${esc(offerUrl)}" style="display:inline-block;background:#5b3cc4;color:#fff;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:10px">${esc(c.offerButton)}</a>
</div>` : "";
  const html = `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;background:#fbf8f3">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#24203a;line-height:1.55;font-size:15px">
<p>${esc(kind === "short" ? c.intro : c.detailedIntro)}</p>
<div style="background:${RISK_COLOR[s.risk]};color:#fff;font-weight:bold;font-size:18px;text-align:center;padding:14px;border-radius:12px;margin:16px 0">${esc(c.risk[s.risk])}</div>
${reportHtml(content)}
${offer}
<p style="font-size:12px;color:#6b6780">${esc(c.disclaimer)}</p>
</div></body></html>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [to], subject: kind === "short" ? c.subject : c.detailedSubject, html,
    }),
  });
  return r.ok ? { sent: true } : { sent: false, reason: "email_failed" };
}
