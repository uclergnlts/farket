import type { Lang } from './scoring.ts';

/** Home page: hero copy, a short FAQ and a closing call to action. */
interface HomeCopy {
  faqTitle: string; faq: [string, string][];
  ctaTitle: string; ctaText: string;
}

const COPY: Record<Lang, HomeCopy> = {
  en: {
    faqTitle: 'Questions parents ask',
    faq: [
      ['Is this an autism test?', 'No. It is a screening: it shows whether your answers include signs worth discussing with a professional. Only a doctor or specialist can diagnose autism.'],
      ['Who is it for?', 'Parents and caregivers of children aged 6 to 48 months. Under 12 months, results are more limited, so we suggest checking again a few months later.'],
      ['How is my result calculated?', 'Your answers are scored with fixed rules, so the same answers always give the same result. AI only writes the explanation in plain language; it never changes your result.'],
      ['Is it really free?', 'Yes. The check, your result, your personal report and the advice on whether to see a specialist are always free. The detailed report is optional.'],
      ['My result is high. What should I do?', 'Stay calm: it is not a diagnosis. Book an appointment with a developmental pediatrician or child psychiatrist and bring your report. Early support makes a real difference.'],
      ['What happens to my data?', 'We never ask for your child’s name. Your email is used to send your report, and you can ask us to delete your data at any time. See our Privacy Policy.'],
    ],
    ctaTitle: 'Ready when you are',
    ctaText: 'About 5 minutes. No account needed.',
  },
  es: {
    faqTitle: 'Preguntas frecuentes',
    faq: [
      ['¿Es una prueba de autismo?', 'No. Es una detección: muestra si sus respuestas incluyen señales que conviene comentar con un profesional. Solo un médico o especialista puede diagnosticar el autismo.'],
      ['¿Para quién es?', 'Para padres y cuidadores de niños de 6 a 48 meses. Antes de los 12 meses los resultados son más limitados, por eso sugerimos repetir la revisión unos meses después.'],
      ['¿Cómo se calcula mi resultado?', 'Sus respuestas se puntúan con reglas fijas, así que las mismas respuestas siempre dan el mismo resultado. La IA solo redacta la explicación en lenguaje sencillo; nunca cambia su resultado.'],
      ['¿De verdad es gratis?', 'Sí. La revisión, su resultado, su informe personal y la recomendación de ver a un especialista son siempre gratuitos. El informe detallado es opcional.'],
      ['Mi resultado es alto. ¿Qué hago?', 'Mantenga la calma: no es un diagnóstico. Pida cita con un pediatra del desarrollo o un psiquiatra infantil y lleve su informe. El apoyo temprano marca una gran diferencia.'],
      ['¿Qué pasa con mis datos?', 'Nunca pedimos el nombre de su hijo. Su correo se usa para enviarle el informe y puede pedirnos que borremos sus datos en cualquier momento. Consulte nuestra Política de privacidad.'],
    ],
    ctaTitle: 'Cuando usted quiera',
    ctaText: 'Unos 5 minutos. Sin crear una cuenta.',
  },
  ar: {
    faqTitle: 'أسئلة يطرحها الآباء',
    faq: [
      ['هل هذا اختبار للتوحد؟', 'لا. إنه فحص أولي يوضح ما إذا كانت إجاباتك تتضمن علامات تستحق مناقشتها مع مختص. وحده الطبيب أو المختص يمكنه تشخيص التوحد.'],
      ['لمن هذا الفحص؟', 'للآباء ومقدّمي الرعاية للأطفال من عمر 6 إلى 48 شهرًا. قبل عمر 12 شهرًا تكون النتائج محدودة أكثر، لذا ننصح بإعادة الفحص بعد بضعة أشهر.'],
      ['كيف تُحسب نتيجتي؟', 'تُحتسب إجاباتك وفق قواعد ثابتة، لذا تعطي الإجابات نفسها النتيجة نفسها دائمًا. يكتب الذكاء الاصطناعي الشرح بلغة بسيطة فقط، ولا يغيّر نتيجتك أبدًا.'],
      ['هل هو مجاني فعلًا؟', 'نعم. الفحص ونتيجتك وتقريرك الشخصي ونصيحة مراجعة المختص مجانية دائمًا. أما التقرير المفصّل فهو اختياري.'],
      ['نتيجتي مرتفعة، ماذا أفعل؟', 'لا تقلق: هذا ليس تشخيصًا. احجز موعدًا مع طبيب أطفال مختص في النمو أو طبيب نفسي للأطفال وخذ تقريرك معك. الدعم المبكر يصنع فرقًا حقيقيًا.'],
      ['ماذا يحدث لبياناتي؟', 'لا نطلب اسم طفلك أبدًا. نستخدم بريدك الإلكتروني لإرسال تقريرك، ويمكنك أن تطلب حذف بياناتك في أي وقت. راجع سياسة الخصوصية.'],
    ],
    ctaTitle: 'جاهز متى شئت',
    ctaText: 'حوالي 5 دقائق. دون إنشاء حساب.',
  },
};

export interface HeroCopy { title: string; text: string; stat: string; chips: string[]; steps: string[] }

export const HERO: Record<Lang, HeroCopy> = {
  en: {
    title: 'The earlier you know, the more you can help.',
    text: 'Signs of autism can show up before age 2, and support that starts early makes the biggest difference. Answer a few simple questions about your child and find out in 5 minutes whether it’s worth talking to a specialist.',
    stat: 'Pediatricians recommend autism screening at 18 and 24 months.',
    chips: ['Free', '5 minutes', '6–48 months', 'No sign-up'],
    steps: ['Answer simple questions about your child', 'See your result right away', 'Know your next step'],
  },
  es: {
    title: 'Cuanto antes lo sepa, más podrá ayudar.',
    text: 'Las señales del autismo pueden aparecer antes de los 2 años, y el apoyo que empieza pronto es el que más ayuda. Responda unas preguntas sencillas sobre su hijo y sepa en 5 minutos si conviene consultar a un especialista.',
    stat: 'Los pediatras recomiendan la detección del autismo a los 18 y 24 meses.',
    chips: ['Gratis', '5 minutos', '6–48 meses', 'Sin registro'],
    steps: ['Responda preguntas sencillas sobre su hijo', 'Vea su resultado al instante', 'Sepa cuál es el siguiente paso'],
  },
  ar: {
    title: 'كلما عرفت مبكرًا، استطعت أن تساعد أكثر.',
    text: 'قد تظهر علامات التوحد قبل عمر السنتين، والدعم الذي يبدأ مبكرًا هو الأكثر فائدة. أجب عن أسئلة بسيطة حول طفلك واعرف خلال 5 دقائق إن كان من المفيد استشارة مختص.',
    stat: 'يوصي أطباء الأطفال بفحص التوحد في عمر 18 و24 شهرًا.',
    chips: ['مجاني', '5 دقائق', '6–48 شهرًا', 'دون تسجيل'],
    steps: ['أجب عن أسئلة بسيطة حول طفلك', 'شاهد نتيجتك فورًا', 'اعرف خطوتك التالية'],
  },
};

/** Questions shown on the home page (by index into COPY.faq). */
const HOME_FAQ = [0, 3, 2, 5];

export function HomeSections({ lang, start, startLabel }: { lang: Lang; start: () => void; startLabel: string }) {
  const c = COPY[lang];
  return (
    <div className="home-more">
      <section>
        <h2>{c.faqTitle}</h2>
        {HOME_FAQ.map((i) => c.faq[i]).map(([q, a]) => (
          <details key={q} className="faq">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <button className="primary" onClick={start}>{startLabel}</button>
    </div>
  );
}
