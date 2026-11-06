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

const FOLLOWUP: Record<string, {
  subject: string; hello: string; tipTitle: string; tip: Record<string, string>;
  offerText: Record<string, string>; why: string; unsubscribe: string;
}> = {
  en: {
    subject: "One tip after your child's development check",
    hello: "A couple of days ago you completed a development check on Farket and asked us to send you tips. Here is one that many parents find useful.",
    tipTitle: "Today's tip",
    tip: {
      low: "Turn everyday routines into small conversations. While dressing or eating, name what your child is looking at, then pause for a few seconds and let them answer with a sound, a word or a gesture.",
      medium: "Before your next pediatrician visit, write down two or three concrete examples of what you noticed, and how old your child was at the time. Specific examples help the doctor much more than a general worry.",
      high: "If you haven't booked the specialist appointment yet, this is a good week to do it. Meanwhile, write down two or three concrete examples of what you noticed and when. Specific examples help the doctor much more than a general worry.",
    },
    offerText: {
      low: "If you'd like a plan, the detailed report explains each area with your own answers and gives you activities to try at home.",
      medium: "The detailed report turns your answers into a one-page summary you can show the doctor, plus activities for each area.",
      high: "The detailed report turns your answers into a one-page summary you can show the doctor, plus activities for each area.",
    },
    why: "You're receiving this because you ticked “Send me occasional tips” on Farket.",
    unsubscribe: "Unsubscribe",
  },
  es: {
    subject: "Un consejo tras la revisión del desarrollo de su hijo",
    hello: "Hace un par de días completó una revisión del desarrollo en Farket y nos pidió que le enviáramos consejos. Aquí tiene uno que a muchas familias les resulta útil.",
    tipTitle: "El consejo de hoy",
    tip: {
      low: "Convierta las rutinas diarias en pequeñas conversaciones. Al vestirse o comer, nombre lo que su hijo está mirando y espere unos segundos para que responda con un sonido, una palabra o un gesto.",
      medium: "Antes de la próxima visita al pediatra, anote dos o tres ejemplos concretos de lo que ha notado y qué edad tenía su hijo en ese momento. Los ejemplos concretos ayudan al médico mucho más que una preocupación general.",
      high: "Si aún no ha pedido la cita con el especialista, esta es una buena semana para hacerlo. Mientras tanto, anote dos o tres ejemplos concretos de lo que ha notado y cuándo. Los ejemplos concretos ayudan al médico mucho más que una preocupación general.",
    },
    offerText: {
      low: "Si quiere un plan, el informe detallado explica cada área con sus propias respuestas y le da actividades para hacer en casa.",
      medium: "El informe detallado convierte sus respuestas en una hoja resumen para mostrar al médico, además de actividades para cada área.",
      high: "El informe detallado convierte sus respuestas en una hoja resumen para mostrar al médico, además de actividades para cada área.",
    },
    why: "Recibe este correo porque marcó «Envíenme consejos ocasionales» en Farket.",
    unsubscribe: "Darse de baja",
  },
  ar: {
    subject: "نصيحة بعد فحص نمو طفلك",
    hello: "قبل يومين أكملت فحص النمو على Farket وطلبت منا إرسال نصائح. إليك نصيحة يجدها كثير من الآباء مفيدة.",
    tipTitle: "نصيحة اليوم",
    tip: {
      low: "حوّل الروتين اليومي إلى محادثات صغيرة. أثناء اللبس أو الأكل، سمِّ ما ينظر إليه طفلك، ثم انتظر بضع ثوانٍ ليرد بصوت أو كلمة أو إشارة.",
      medium: "قبل زيارتك القادمة لطبيب الأطفال، دوّن مثالين أو ثلاثة أمثلة محددة لما لاحظته، وكم كان عمر طفلك حينها. الأمثلة المحددة تساعد الطبيب أكثر بكثير من القلق العام.",
      high: "إذا لم تحجز موعد الأخصائي بعد، فهذا أسبوع مناسب لذلك. وفي الأثناء، دوّن مثالين أو ثلاثة أمثلة محددة لما لاحظته ومتى. الأمثلة المحددة تساعد الطبيب أكثر بكثير من القلق العام.",
    },
    offerText: {
      low: "إذا أردت خطة، يشرح التقرير المفصّل كل مجال بناءً على إجاباتك ويقدّم أنشطة يمكن تجربتها في المنزل.",
      medium: "يحوّل التقرير المفصّل إجاباتك إلى صفحة ملخص يمكنك عرضها على الطبيب، إضافة إلى أنشطة لكل مجال.",
      high: "يحوّل التقرير المفصّل إجاباتك إلى صفحة ملخص يمكنك عرضها على الطبيب، إضافة إلى أنشطة لكل مجال.",
    },
    why: "تصلك هذه الرسالة لأنك اخترت «أرسلوا لي نصائح من حين لآخر» على Farket.",
    unsubscribe: "إلغاء الاشتراك",
  },
};

/** The one reminder after the check: a useful tip, the offer, and an unsubscribe link. */
export async function sendFollowupEmail(s: Row): Promise<{ sent: boolean; reason?: string }> {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!key || !from) return { sent: false, reason: "email_not_configured" };
  const lang = FOLLOWUP[s.language] ? s.language : "en";
  const f = FOLLOWUP[lang], c = COPY[lang];
  const risk = ["low", "medium", "high"].includes(s.risk) ? s.risk : "medium";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const site = Deno.env.get("SITE_URL") ?? "";
  const offerUrl = `${site}?lang=${lang}&offer=detailed&s=${s.id}`;
  const unsub = `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsubscribe?s=${s.id}&lang=${lang}`;
  const html = `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;background:#fbf8f3">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#24203a;line-height:1.55;font-size:15px">
<p>${esc(f.hello)}</p>
<h3 style="margin:20px 0 6px;font-size:17px">${esc(f.tipTitle)}</h3>
<p>${esc(f.tip[risk])}</p>
<div style="background:#f1ecff;border-radius:12px;padding:16px 18px;margin:24px 0">
<p style="margin:0 0 14px">${esc(f.offerText[risk])}</p>
<a href="${esc(offerUrl)}" style="display:inline-block;background:#5b3cc4;color:#fff;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:10px">${esc(c.offerButton)}</a>
</div>
<p style="font-size:12px;color:#6b6780">${esc(c.disclaimer)}</p>
<p style="font-size:12px;color:#6b6780">${esc(f.why)} <a href="${esc(unsub)}" style="color:#6b6780">${esc(f.unsubscribe)}</a></p>
</div></body></html>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [s.email], subject: f.subject, html,
      headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }),
  });
  return r.ok ? { sent: true } : { sent: false, reason: "email_failed" };
}
