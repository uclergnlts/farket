import type { Lang } from './scoring.ts';
import { domains } from './scoring.ts';

/** Home page sections below the hero card: what we look at, free vs detailed, FAQ. */
interface HomeCopy {
  areasTitle: string; areasText: string; areas: Record<'social' | 'communication' | 'play' | 'behavior' | 'regression', string>;
  plansTitle: string; free: string; freePrice: string; freeItems: string[];
  detailed: string; detailedPrice: string; detailedItems: string[]; seeSample: string;
  faqTitle: string; faq: [string, string][];
  ctaTitle: string; ctaText: string;
}

const COPY: Record<Lang, HomeCopy> = {
  en: {
    areasTitle: 'What the check looks at',
    areasText: 'The questions cover the early signs that pediatricians and specialists watch for, picked for your child’s age.',
    areas: {
      social: 'Eye contact, smiling back, responding to their name, showing you things',
      communication: 'Babbling, pointing, gestures, first words and following simple requests',
      play: 'Copying what you do and pretend play',
      behavior: 'Repeated movements, strong focus on one thing, reactions to sounds and changes',
      regression: 'Whether your child has stopped doing something they used to do',
    },
    plansTitle: 'What you get',
    free: 'Free check', freePrice: 'Free',
    freeItems: ['Your result: low, medium or high likelihood', 'A personal report by email', 'Clear advice on whether to talk to a doctor'],
    detailed: 'Detailed development report', detailedPrice: '$9.99 one-time',
    detailedItems: ['Every area explained with your own answers', 'Activities to try at home for your child’s age', 'When to check again', 'A summary to bring to your doctor'],
    seeSample: 'See a sample report',
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
    areasTitle: 'Qué revisa la prueba',
    areasText: 'Las preguntas cubren las señales tempranas que vigilan pediatras y especialistas, elegidas para la edad de su hijo.',
    areas: {
      social: 'Contacto visual, devolver la sonrisa, responder a su nombre, mostrarle cosas',
      communication: 'Balbuceo, señalar, gestos, primeras palabras y seguir instrucciones sencillas',
      play: 'Imitar lo que usted hace y el juego simbólico',
      behavior: 'Movimientos repetitivos, interés muy fijo en algo, reacción a sonidos y cambios',
      regression: 'Si su hijo ha dejado de hacer algo que antes hacía',
    },
    plansTitle: 'Qué recibe',
    free: 'Revisión gratuita', freePrice: 'Gratis',
    freeItems: ['Su resultado: probabilidad baja, media o alta', 'Un informe personal por correo', 'Una recomendación clara sobre si consultar a un médico'],
    detailed: 'Informe detallado del desarrollo', detailedPrice: '9,99 $ pago único',
    detailedItems: ['Cada área explicada con sus propias respuestas', 'Actividades para hacer en casa según la edad', 'Cuándo repetir la revisión', 'Un resumen para llevar a su médico'],
    seeSample: 'Ver un informe de ejemplo',
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
    areasTitle: 'ماذا يفحص الاختبار',
    areasText: 'تغطي الأسئلة العلامات المبكرة التي يتابعها أطباء الأطفال والمختصون، ويتم اختيارها حسب عمر طفلك.',
    areas: {
      social: 'التواصل البصري، وردّ الابتسامة، والاستجابة للاسم، وإظهار الأشياء لك',
      communication: 'المناغاة، والإشارة، والإيماءات، والكلمات الأولى، واتباع الطلبات البسيطة',
      play: 'تقليد ما تفعله واللعب التخيّلي',
      behavior: 'الحركات المتكررة، والتركيز الشديد على شيء واحد، والتفاعل مع الأصوات والتغييرات',
      regression: 'ما إذا كان طفلك قد توقف عن فعل شيء كان يفعله من قبل',
    },
    plansTitle: 'ماذا ستحصل عليه',
    free: 'الفحص المجاني', freePrice: 'مجانًا',
    freeItems: ['نتيجتك: احتمال منخفض أو متوسط أو مرتفع', 'تقرير شخصي عبر البريد الإلكتروني', 'نصيحة واضحة حول ما إذا كان عليك مراجعة طبيب'],
    detailed: 'تقرير النمو المفصّل', detailedPrice: '9.99 $ دفعة واحدة',
    detailedItems: ['شرح لكل مجال بناءً على إجاباتك', 'أنشطة منزلية مناسبة لعمر طفلك', 'متى تعيد الفحص', 'ملخص لأخذه إلى طبيبك'],
    seeSample: 'شاهد نموذج تقرير',
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

export const HERO_BADGES: Record<Lang, string[]> = {
  en: ['Free', 'About 5 minutes', 'No account needed', 'We never ask your child’s name'],
  es: ['Gratis', 'Unos 5 minutos', 'Sin crear una cuenta', 'Nunca pedimos el nombre de su hijo'],
  ar: ['مجاني', 'حوالي 5 دقائق', 'دون إنشاء حساب', 'لا نطلب اسم طفلك أبدًا'],
};

/** Simple illustration: a parent and child talking. Decorative only. */
export function HeroArt() {
  return (
    <svg viewBox="0 0 320 280" role="presentation" aria-hidden="true" className="hero-art">
      <circle cx="160" cy="150" r="125" fill="var(--brand-soft)" />
      <circle cx="262" cy="58" r="10" fill="#f4a259" opacity=".7" />
      <circle cx="52" cy="92" r="6" fill="var(--brand)" opacity=".35" />
      <circle cx="275" cy="210" r="7" fill="var(--brand)" opacity=".25" />
      {/* parent */}
      <rect x="70" y="150" width="96" height="110" rx="44" fill="var(--brand)" />
      <circle cx="118" cy="112" r="34" fill="#f2c9a5" />
      <path d="M84 108c0-26 18-40 36-40s34 12 32 38c-10-12-26-16-40-14-12 2-20 8-28 16z" fill="#3b2a6b" />
      {/* child */}
      <rect x="180" y="190" width="64" height="70" rx="30" fill="#f4a259" />
      <circle cx="212" cy="164" r="24" fill="#f2c9a5" />
      <path d="M190 158c2-16 14-24 24-24 12 0 22 8 22 22-8-8-20-10-30-8-6 2-12 6-16 10z" fill="#8a5a2b" />
      {/* speech bubble */}
      <rect x="196" y="70" width="78" height="46" rx="20" fill="#fff" stroke="var(--line)" strokeWidth="2" />
      <path d="M214 114l-6 16 18-14z" fill="#fff" />
      <circle cx="218" cy="93" r="5" fill="var(--brand)" />
      <circle cx="235" cy="93" r="5" fill="var(--brand)" opacity=".7" />
      <circle cx="252" cy="93" r="5" fill="var(--brand)" opacity=".4" />
    </svg>
  );
}

const ICONS: Record<keyof HomeCopy['areas'], string> = {
  social: '👀', communication: '💬', play: '🧸', behavior: '🔁', regression: '↩️',
};

export function HomeSections({ lang, start, startLabel }: { lang: Lang; start: () => void; startLabel: string }) {
  const c = COPY[lang];
  const keys = Object.keys(c.areas) as (keyof HomeCopy['areas'])[];
  return (
    <div className="home-more">
      <section className="card">
        <h2>{c.areasTitle}</h2>
        <p className="muted">{c.areasText}</p>
        <ul className="areas">
          {keys.map((k) => (
            <li key={k}>
              <span className="area-icon" aria-hidden>{ICONS[k]}</span>
              <span><strong>{domains[k][lang]}</strong><br /><span className="muted">{c.areas[k]}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>{c.plansTitle}</h2>
        <div className="plans">
          <div className="plan">
            <p className="plan-name">{c.free}</p>
            <p className="plan-price">{c.freePrice}</p>
            <ul>{c.freeItems.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="plan featured">
            <p className="plan-name">{c.detailed}</p>
            <p className="plan-price">{c.detailedPrice}</p>
            <ul>{c.detailedItems.map((x) => <li key={x}>{x}</li>)}</ul>
            <a href="#sample">{c.seeSample}</a>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>{c.faqTitle}</h2>
        {c.faq.map(([q, a]) => (
          <details key={q} className="faq">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <section className="card center">
        <h2>{c.ctaTitle}</h2>
        <p className="muted">{c.ctaText}</p>
        <button className="primary" onClick={start}>{startLabel}</button>
      </section>
    </div>
  );
}
