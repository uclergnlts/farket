// Search engine and link preview text, shared by the app and the build (vite.config.ts).
// Each language gets its own crawlable page: / (English), /es/, /ar/.
export type SeoLang = 'en' | 'es' | 'ar';
export const SITE = 'https://farket.uclergnlts.com';
export const SEO_LANGS: SeoLang[] = ['en', 'es', 'ar'];

export const langPath = (l: SeoLang) => (l === 'en' ? '/' : `/${l}/`);

interface Seo {
  title: string; description: string; ogLocale: string;
  /** Plain text shown before the app loads and read by crawlers that don't run scripts. */
  h1: string; intro: string; points: string[]; note: string;
}

export const SEO: Record<SeoLang, Seo> = {
  en: {
    title: 'Free autism screening for toddlers (6–48 months) · Farket',
    description: 'A free 5-minute early development check for babies and toddlers aged 6 to 48 months. Answer simple questions about play and communication, get your result by email and clear next steps. Screening, not a diagnosis.',
    ogLocale: 'en_US',
    h1: 'Free early autism screening for babies and toddlers',
    intro: 'Is your child developing as expected? Answer a few short questions about how your child plays, communicates and connects with you, and get a free personal report with clear next steps.',
    points: [
      'For children aged 6 to 48 months, about 5 minutes',
      'Questions picked for your child’s age, covering common early signs: eye contact, pointing, responding to name, first words and pretend play',
      'Free result and personal report by email; optional detailed report to take to your doctor',
    ],
    note: 'This is a screening tool, not a diagnosis. If you are worried about your child’s development, talk to your pediatrician.',
  },
  es: {
    title: 'Test gratuito de detección de autismo para niños pequeños (6–48 meses) · Farket',
    description: 'Una revisión gratuita de 5 minutos del desarrollo temprano para bebés y niños de 6 a 48 meses. Responda preguntas sencillas sobre el juego y la comunicación, reciba su resultado por correo y pasos claros. Es una detección, no un diagnóstico.',
    ogLocale: 'es_ES',
    h1: 'Detección temprana de autismo gratuita para bebés y niños pequeños',
    intro: '¿Se está desarrollando su hijo como se espera? Responda unas preguntas breves sobre cómo juega, se comunica y se relaciona con usted, y reciba un informe personal gratuito con pasos claros.',
    points: [
      'Para niños de 6 a 48 meses, unos 5 minutos',
      'Preguntas elegidas para la edad de su hijo, que cubren señales tempranas comunes: contacto visual, señalar, responder a su nombre, primeras palabras y juego simbólico',
      'Resultado e informe personal gratuitos por correo; informe detallado opcional para llevar a su médico',
    ],
    note: 'Esta es una herramienta de detección, no un diagnóstico. Si le preocupa el desarrollo de su hijo, hable con su pediatra.',
  },
  ar: {
    title: 'فحص مجاني للكشف المبكر عن التوحد لدى الأطفال (6–48 شهرًا) · Farket',
    description: 'فحص مجاني للنمو المبكر خلال 5 دقائق للرضّع والأطفال من عمر 6 إلى 48 شهرًا. أجب عن أسئلة بسيطة حول اللعب والتواصل، واحصل على نتيجتك عبر البريد الإلكتروني وخطوات واضحة. هذا فحص أولي وليس تشخيصًا.',
    ogLocale: 'ar_AR',
    h1: 'فحص مجاني للكشف المبكر عن التوحد لدى الرضّع والأطفال الصغار',
    intro: 'هل ينمو طفلك كما هو متوقع؟ أجب عن بعض الأسئلة القصيرة حول طريقة لعب طفلك وتواصله وتفاعله معك، واحصل على تقرير شخصي مجاني وخطوات واضحة.',
    points: [
      'للأطفال من عمر 6 إلى 48 شهرًا، حوالي 5 دقائق',
      'أسئلة مختارة حسب عمر طفلك، تغطي العلامات المبكرة الشائعة: التواصل البصري، والإشارة، والاستجابة للاسم، والكلمات الأولى، واللعب التخيّلي',
      'نتيجة وتقرير شخصي مجانيان عبر البريد الإلكتروني؛ وتقرير مفصّل اختياري لأخذه إلى طبيبك',
    ],
    note: 'هذه أداة فحص أولي وليست تشخيصًا. إذا كنت قلقًا بشأن نمو طفلك، فتحدث إلى طبيب الأطفال.',
  },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Head tags for one language page. */
export function seoHead(l: SeoLang): string {
  const s = SEO[l];
  const url = SITE + langPath(l);
  const alternates = SEO_LANGS.map((x) => `<link rel="alternate" hreflang="${x}" href="${SITE}${langPath(x)}" />`).join('\n    ');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Farket',
    url,
    inLanguage: l,
    description: s.description,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any (web browser)',
    offers: [
      { '@type': 'Offer', name: 'Screening and personal report', price: '0', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Detailed development report', price: '9.99', priceCurrency: 'USD' },
    ],
  };
  return `<title>${esc(s.title)}</title>
    <meta name="description" content="${esc(s.description)}" />
    <link rel="canonical" href="${url}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${SITE}/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Farket" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(s.title)}" />
    <meta property="og:description" content="${esc(s.description)}" />
    <meta property="og:locale" content="${s.ogLocale}" />
    <meta property="og:image" content="${SITE}/og-${l}.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(s.title)}" />
    <meta name="twitter:description" content="${esc(s.description)}" />
    <meta name="twitter:image" content="${SITE}/og-${l}.png" />
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

/** Static content inside #root; React replaces it once the app starts. */
export function seoBody(l: SeoLang): string {
  const s = SEO[l];
  return `<main class="card prerender"><h1>${esc(s.h1)}</h1><p class="lead">${esc(s.intro)}</p><ul>${
    s.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul><p class="note">${esc(s.note)}</p></main>`;
}
