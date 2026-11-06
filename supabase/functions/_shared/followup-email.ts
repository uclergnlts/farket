// The one tip email after the check (see the "followup" function). Kept apart from
// email.ts so the function deploys with only the files it needs.
// Secrets: RESEND_API_KEY, EMAIL_FROM, SITE_URL.

const BUTTON: Record<string, string> = {
  en: "Get the detailed report · $4.99",
  es: "Obtener el informe detallado · 4,99 $",
  ar: "احصل على التقرير المفصّل · 4.99 $",
};
const DISCLAIMER: Record<string, string> = {
  en: "This is a screening tool, not a diagnosis. If you are worried about your child's development, talk to your pediatrician whatever the result.",
  es: "Esta es una herramienta de detección, no un diagnóstico. Si le preocupa el desarrollo de su hijo, hable con su pediatra sea cual sea el resultado.",
  ar: "هذه أداة فحص أولي وليست تشخيصًا. إذا كنت قلقًا بشأن نمو طفلك، فتحدث إلى طبيب الأطفال مهما كانت النتيجة.",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

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
  const f = FOLLOWUP[lang];
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
<a href="${esc(offerUrl)}" style="display:inline-block;background:#5b3cc4;color:#fff;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:10px">${esc(BUTTON[lang])}</a>
</div>
<p style="font-size:12px;color:#6b6780">${esc(DISCLAIMER[lang])}</p>
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
