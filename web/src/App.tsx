import { useEffect, useMemo, useState } from 'react';
import {
  answerLabels, domains, questionsForAge, score, type Answer, type Lang, type Result,
} from './scoring.ts';
import { LANG_NAMES, t } from './i18n.ts';
import { emailReport, fetchReport, saveScreening, type Sex } from './api.ts';

type Step = 'home' | 'age' | 'sex' | 'quiz' | 'email' | 'done';

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
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl === 'en' || fromUrl === 'es' || fromUrl === 'ar') return fromUrl;
  const nav = navigator.language.slice(0, 2);
  return nav === 'es' || nav === 'ar' ? nav : 'en';
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [step, setStep] = useState<Step>('home');
  const [age, setAge] = useState<(typeof AGE_RANGES)[number] | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [email, setEmail] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<boolean | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = t[lang];
  const months = age?.months ?? 0;
  const qs = useMemo(() => questionsForAge(months), [months]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = `${s.brand} · ${s.tagline}`;
  }, [lang, s]);

  useEffect(() => { window.scrollTo(0, 0); }, [step, index]);

  const restart = () => {
    setStep('age'); setAge(null); setSex(null); setIndex(0); setAnswers({}); setResult(null);
    setSent(null); setScreeningId(null); setReport(null); setError(null);
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
    setSending(true); setError(null);
    try {
      const id = await saveScreening({
        ageRange: age.range, months, sex, email: email.trim(), marketing, language: lang, answers, result,
      });
      setScreeningId(id);
      setSent(await emailReport(id));
    } catch {
      setSent(false);
    }
    setSending(false);
    setStep('done');
  };

  const getDetailed = async () => {
    if (!screeningId) return;
    setBusy(true); setError(null);
    // TODO(stripe): send the parent to Stripe Checkout first; the report unlocks after payment.
    const res = await fetchReport(screeningId, 'detailed', lang);
    setBusy(false);
    if ('content' in res) setReport(res.content);
    else setError(res.error === 'busy' ? s.reportBusy : s.reportFailed);
  };

  const flow: Step[] = ['age', 'sex', 'quiz', 'email'];
  const progress = step === 'quiz' && qs.length ? 20 + (index / qs.length) * 70
    : step === 'age' ? 5 : step === 'sex' ? 12 : step === 'email' ? 95 : 0;

  return (
    <div className="page">
      <header className="top no-print">
        <button className="brand" onClick={() => setStep('home')}>
          <span className="logo" aria-hidden>●</span> {s.brand}
        </button>
        <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
          {(Object.keys(LANG_NAMES) as Lang[]).map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
        </select>
      </header>
      {flow.includes(step) && <div className="bar no-print"><div style={{ width: `${progress}%` }} /></div>}

      <main className="card">
        {step === 'home' && (
          <section>
            <p className="eyebrow">{s.tagline}</p>
            <h1>{s.heroTitle}</h1>
            <p className="lead">{s.heroText}</p>
            <ol className="how"><li>{s.how1}</li><li>{s.how2}</li><li>{s.how3}</li></ol>
            <button className="primary" onClick={() => setStep('age')}>{s.start}</button>
            <p className="muted center">{s.minutes}</p>
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

            {report ? (
              <article className="report">
                <Markdownish text={report} />
                <button className="secondary no-print" onClick={() => window.print()}>{s.print}</button>
              </article>
            ) : (
              <div className="offers no-print">
                <h3>{s.offerTitle}</h3>
                <p>{s.offerText}</p>
                <button className="primary" disabled={busy || !screeningId} onClick={getDetailed}>
                  {busy ? s.reportLoading : s.offerButton}
                </button>
                <p className="muted center">{s.offerNote}</p>
              </div>
            )}
            {error && <p className="error">{error}</p>}
            <p className="note">{s.disclaimer}</p>
            <button className="link no-print" onClick={restart}>{s.again}</button>
          </section>
        )}
      </main>
      <footer className="muted center no-print">{s.disclaimer}</footer>
    </div>
  );
}

/** Renders the AI report's light markdown (headings, bullets, bold) without HTML injection. */
function Markdownish({ text }: { text: string }) {
  const bold = (line: string) => line.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
  return (
    <>
      {text.split('\n').map((raw, i) => {
        const line = raw.trim();
        if (!line) return null;
        if (line.startsWith('#')) return <h3 key={i}>{bold(line.replace(/^#+\s*/, ''))}</h3>;
        if (/^[-*•]\s/.test(line)) return <p key={i} className="bullet">• {bold(line.slice(2))}</p>;
        return <p key={i}>{bold(line)}</p>;
      })}
    </>
  );
}
