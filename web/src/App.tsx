import { useEffect, useMemo, useState } from 'react';
import {
  answerLabels, domains, questionsForAge, score, type Answer, type Lang, type Result,
} from './scoring.ts';
import { LANG_NAMES, t } from './i18n.ts';

const LANG_SHORT: Record<Lang, string> = { en: 'EN', es: 'ES', ar: 'عربي' };
import { emailReport, saveScreening, type Sex } from './api.ts';
import { SEO, langPath } from './seo.ts';
import { HERO, HomeSections } from './home.tsx';
import { FooterLinks, InfoPage, PAGE_LABELS, pageFromHash, type PageId } from './pages.tsx';
import { loadPixel, needsConsent, setConsent, track } from './pixel.ts';

const COOKIE_TEXT: Record<Lang, { text: string; yes: string; no: string }> = {
  en: { text: 'We use a Meta (Facebook) cookie to measure our ads. Your answers and results are never shared.', yes: 'Accept', no: 'Decline' },
  es: { text: 'Usamos una cookie de Meta (Facebook) para medir nuestros anuncios. Sus respuestas y resultados nunca se comparten.', yes: 'Aceptar', no: 'Rechazar' },
  ar: { text: 'نستخدم ملف تعريف ارتباط من Meta (فيسبوك) لقياس إعلاناتنا. لا تتم مشاركة إجاباتك أو نتائجك أبدًا.', yes: 'موافق', no: 'رفض' },
};

const HERO_ALT: Record<Lang, string> = {
  en: 'A Farket question on a phone screen',
  es: 'Una pregunta de Farket en la pantalla de un teléfono',
  ar: 'سؤال من Farket على شاشة هاتف',
};

type Step = 'home' | 'age' | 'sex' | 'quiz' | 'email' | 'done' | 'offer';

/** Lemon Squeezy hosted checkout for the $9.99 detailed report. */
const CHECKOUT_URL = 'https://ucler.lemonsqueezy.com/checkout/buy/664f6fb7-1692-44c0-9019-57e71ff46a69';

/** Sends the parent to checkout; the webhook emails the detailed report after payment. */
function goToCheckout(screeningId: string, lang: Lang, email?: string) {
  const u = new URL(CHECKOUT_URL);
  u.searchParams.set('checkout[custom][screening_id]', screeningId);
  if (email) u.searchParams.set('checkout[email]', email);
  u.searchParams.set('locale', lang);
  location.href = u.toString();
}

/** A link from the report email: ?offer=detailed&s=<screening id>. */
function offerFromUrl(): string | null {
  const p = new URLSearchParams(location.search);
  const id = p.get('s');
  return p.get('offer') === 'detailed' && id && /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}

/** Age ranges offered to parents; questions are picked for the range's typical age. */
const AGE_RANGES: { range: [number, number]; months: number }[] = [
  { range: [6, 11], months: 9 },
  { range: [12, 17], months: 15 },
  { range: [18, 23], months: 20 },
  { range: [24, 35], months: 30 },
  { range: [36, 48], months: 42 },
];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function initialLang(): Lang {
  const fromPath = location.pathname.split('/')[1];
  if (fromPath === 'es' || fromPath === 'ar') return fromPath;
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl === 'en' || fromUrl === 'es' || fromUrl === 'ar') return fromUrl;
  if (fromUrl) return 'en';
  // A language the parent picked before wins (set by the language menu, read by middleware.ts too).
  const saved = document.cookie.match(/(?:^|; )lang=(en|es|ar)/)?.[1];
  if (saved) return saved as Lang;
  // Otherwise the bare home page follows the browser language (middleware.ts already
  // redirects by country before the page loads).
  const nav = navigator.language.slice(0, 2);
  return nav === 'es' || nav === 'ar' ? nav : 'en';
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [step, setStep] = useState<Step>(() => (offerFromUrl() ? 'offer' : 'home'));
  const [age, setAge] = useState<(typeof AGE_RANGES)[number] | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [email, setEmail] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<boolean | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(offerFromUrl);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState<PageId | null>(pageFromHash);
  const [askCookies, setAskCookies] = useState(needsConsent);
  const s = t[lang];
  const months = age?.months ?? 0;
  const qs = useMemo(() => questionsForAge(months), [months]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = SEO[lang].title;
    // Keep the address on the language's own page (/, /es/, /ar/) so it can be shared and indexed.
    const q = new URLSearchParams(location.search);
    q.delete('lang');
    const search = q.toString() ? `?${q}` : '';
    const want = langPath(lang) + search + location.hash;
    if (location.pathname + location.search + location.hash !== want) history.replaceState(null, '', want);
  }, [lang, s]);

  useEffect(() => { window.scrollTo(0, 0); }, [step, index, page]);

  // Ad measurement: only for visitors who accepted cookies (see pixel.ts).
  useEffect(() => { loadPixel(); }, []);
  const decideCookies = (v: 'yes' | 'no') => { setConsent(v); setAskCookies(false); };
  const startCheck = () => { track('StartCheck'); setStep('age'); };

  // Policy and sample pages live at #privacy, #terms, #refund and #sample.
  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const closePage = () => {
    history.pushState(null, '', location.pathname + location.search);
    setPage(null);
  };

  // Coming back from checkout with the browser's back button re-enables the offer button.
  useEffect(() => {
    const reset = () => setBusy(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const restart = () => {
    setStep('age'); setAge(null); setSex(null); setIndex(0); setAnswers({}); setResult(null);
    setSent(null); setScreeningId(null); setBusy(false);
  };

  const answer = (a: Answer) => {
    const next = { ...answers, [qs[index].id]: a };
    setAnswers(next);
    if (index + 1 < qs.length) { setIndex(index + 1); return; }
    setResult(score(months, next));
    setStep('email');
  };

  const send = async () => {
    if (!age || !sex || !result || !EMAIL.test(email.trim())) return;
    setSending(true);
    try {
      const id = await saveScreening({
        ageRange: age.range, months, sex, email: email.trim(), marketing, language: lang, answers, result,
      });
      setScreeningId(id);
      track('Lead');
      setSent(await emailReport(id));
    } catch {
      setSent(false);
    }
    setSending(false);
    setStep('done');
  };

  const getDetailed = () => {
    if (!screeningId) return;
    setBusy(true);
    track('InitiateCheckout');
    goToCheckout(screeningId, lang, EMAIL.test(email.trim()) ? email.trim() : undefined);
  };

  const offerCard = (
    <div className="offers no-print">
      <h3>{s.offerTitle}</h3>
      <p>{s.offerText}</p>
      <button className="primary" disabled={busy || !screeningId} onClick={getDetailed}>
        {busy ? s.reportLoading : s.offerButton}
      </button>
      <p className="muted center">{s.offerNote}</p>
      <p className="center"><a href="#sample">{PAGE_LABELS[lang].sample}</a></p>
    </div>
  );

  const flow: Step[] = ['age', 'sex', 'quiz', 'email'];
  const progress = step === 'quiz' && qs.length ? 20 + (index / qs.length) * 70
    : step === 'age' ? 5 : step === 'sex' ? 12 : step === 'email' ? 95 : 0;

  return (
    <div className="page">
      <header className="top no-print">
        <button className="brand" onClick={() => { if (page) closePage(); setStep('home'); }}>
          <span className="logo" aria-hidden>●</span> {s.brand}
        </button>
        <nav className="langs" aria-label="Language">
          {(Object.keys(LANG_NAMES) as Lang[]).map((l) => (
            <button key={l} lang={l} title={LANG_NAMES[l]} aria-pressed={lang === l}
              className={lang === l ? 'on' : undefined}
              onClick={() => {
                document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
                setLang(l);
              }}>{LANG_SHORT[l]}</button>
          ))}
        </nav>
      </header>
      {!page && flow.includes(step) && <div className="bar no-print"><div style={{ width: `${progress}%` }} /></div>}

      <main className={!page && step === 'home' ? 'home-main' : 'card'}>
        {page && <InfoPage id={page} lang={lang} onBack={closePage} />}
        {!page && <>
        {step === 'home' && (
          <section className="hero">
            <ul className="chips">{HERO[lang].chips.map((c) => <li key={c}>{c}</li>)}</ul>
            <h1>{HERO[lang].title}</h1>
            <p className="lead">{HERO[lang].text}</p>
            <button className="primary big" onClick={startCheck}>{s.start}</button>
            <p className="stat">{HERO[lang].stat}</p>
            <img className="hero-phone" src={`/hero-phone-${lang}.webp`} width={260} height={357}
              alt={HERO_ALT[lang]} />
            <ol className="steps">{HERO[lang].steps.map((x) => <li key={x}>{x}</li>)}</ol>
          </section>
        )}

        {step === 'age' && (
          <section>
            <h2>{s.ageRangeTitle}</h2>
            <p className="muted">{s.ageRangeHelp}</p>
            <div className="answers">
              {AGE_RANGES.map((a) => (
                <button key={a.months} className={age === a ? 'answer picked' : 'answer'}
                  onClick={() => { setAge(a); setIndex(0); setAnswers({}); setStep('sex'); }}>
                  {s.monthsLabel(a.range[0], a.range[1])}
                </button>
              ))}
            </div>
            <p className="muted">{s.ageTooYoung}</p>
          </section>
        )}

        {step === 'sex' && (
          <section>
            <h2>{s.sexTitle}</h2>
            <div className="answers">
              {(['boy', 'girl', 'unspecified'] as Sex[]).map((x) => (
                <button key={x} className={sex === x ? 'answer picked' : 'answer'}
                  onClick={() => { setSex(x); setStep('quiz'); }}>{s[x]}</button>
              ))}
            </div>
            <button className="link" onClick={() => setStep('age')}>{s.back}</button>
          </section>
        )}

        {step === 'quiz' && qs[index] && (
          <section>
            <p className="eyebrow">{s.questionOf(index + 1, qs.length)} · {domains[qs[index].domain][lang]}</p>
            <h2 className="question">{qs[index][lang]}</h2>
            <div className="answers">
              {(['yes', 'sometimes', 'no'] as Answer[]).map((a) => (
                <button key={a} className={answers[qs[index].id] === a ? 'answer picked' : 'answer'}
                  onClick={() => answer(a)}>{answerLabels[a][lang]}</button>
              ))}
            </div>
            <button className="link" onClick={() => (index > 0 ? setIndex(index - 1) : setStep('sex'))}>{s.back}</button>
          </section>
        )}

        {step === 'email' && (
          <section>
            <h2>{s.emailTitle}</h2>
            <p>{s.emailText}</p>
            <form onSubmit={(e) => { e.preventDefault(); send(); }}>
              <input className="input" type="email" inputMode="email" autoComplete="email" required
                placeholder={s.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
              {email && !EMAIL.test(email.trim()) && <p className="error">{s.emailInvalid}</p>}
              <label className="check">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> {s.marketing}
              </label>
              <button className="primary" type="submit" disabled={sending || !EMAIL.test(email.trim())}>
                {sending ? s.sending : s.sendReport}
              </button>
            </form>
            <p className="muted">{s.emailPrivacy}</p>
            <p className="note">{s.disclaimer}</p>
            <button className="link" onClick={() => { setIndex(qs.length - 1); setStep('quiz'); }}>{s.back}</button>
          </section>
        )}

        {step === 'done' && result && (
          <section>
            {sent ? (
              <>
                <h2>{s.sentTitle}</h2>
                <p>{s.sentText(email.trim())}</p>
              </>
            ) : <p className="note">{s.notSent}</p>}

            <h3>{s.quickResult}</h3>
            <div className={`badge ${result.risk}`}>{s.risk[result.risk]}</div>
            <p className="lead">{s.nextStep[result.risk]}</p>
            {result.limitedAge && <p className="note">{s.limitedAge}</p>}

            {offerCard}
            <p className="note">{s.disclaimer}</p>
            <button className="link no-print" onClick={restart}>{s.again}</button>
          </section>
        )}
        {step === 'offer' && (
          <section>
            {offerCard}
            <p className="note">{s.disclaimer}</p>
            <button className="link no-print" onClick={() => setStep('home')}>{s.again}</button>
          </section>
        )}
        </>}
      </main>
      {!page && step === 'home' && <HomeSections lang={lang} start={startCheck} startLabel={s.start} />}
      <footer className="muted center no-print">
        {(page || !['email', 'done', 'offer'].includes(step)) && <p>{s.disclaimer}</p>}
        <FooterLinks lang={lang} />
      </footer>
      {askCookies && (
        <div className="cookie no-print" role="dialog" aria-live="polite">
          <p>{COOKIE_TEXT[lang].text} <a href="#privacy">{PAGE_LABELS[lang].privacy}</a></p>
          <div>
            <button className="secondary" onClick={() => decideCookies('no')}>{COOKIE_TEXT[lang].no}</button>
            <button className="secondary accept" onClick={() => decideCookies('yes')}>{COOKIE_TEXT[lang].yes}</button>
          </div>
        </div>
      )}
    </div>
  );
}
