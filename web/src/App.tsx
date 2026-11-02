import { useEffect, useMemo, useState } from 'react';
import {
  ageInMonths, answerLabels, domains, MAX_MONTHS, MIN_MONTHS, questionsForAge, score,
  type Answer, type Lang, type Result,
} from './scoring.ts';
import { LANG_NAMES, t } from './i18n.ts';
import { fetchReport, saveScreening, type ReportKind } from './api.ts';

type Step = 'home' | 'consent' | 'age' | 'quiz' | 'result';

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl === 'en' || fromUrl === 'es' || fromUrl === 'ar') return fromUrl;
  const nav = navigator.language.slice(0, 2);
  return nav === 'es' || nav === 'ar' ? nav : 'en';
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [step, setStep] = useState<Step>('home');
  const now = useMemo(() => new Date(), []);
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [birthMonth, setBirthMonth] = useState<number | ''>('');
  const [preterm, setPreterm] = useState(false);
  const [months, setMonths] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = t[lang];
  const qs = useMemo(() => questionsForAge(months), [months]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = `${s.brand} · ${s.tagline}`;
  }, [lang, s]);

  useEffect(() => { window.scrollTo(0, 0); }, [step, index]);

  const ageMonths = birthYear !== '' && birthMonth !== ''
    ? ageInMonths(new Date(birthYear, birthMonth - 1, 15), now, preterm ? 34 : 40) : null;
  const ageMsg = ageMonths === null ? null
    : ageMonths < MIN_MONTHS ? s.ageTooYoung : ageMonths > MAX_MONTHS ? s.ageTooOld : null;
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const restart = () => {
    setStep('age'); setIndex(0); setAnswers({}); setResult(null);
    setScreeningId(null); setReport(null); setError(null);
  };

  const answer = (a: Answer) => {
    const next = { ...answers, [qs[index].id]: a };
    setAnswers(next);
    if (index + 1 < qs.length) { setIndex(index + 1); return; }
    const r = score(months, next);
    setResult(r); setStep('result');
    saveScreening({ year: Number(birthYear), month: Number(birthMonth), preterm }, months, next, r)
      .then(setScreeningId).catch(() => setError(s.saveFailed));
  };

  const getReport = async (kind: ReportKind) => {
    if (!screeningId) return;
    setBusy(true); setError(null);
    const res = await fetchReport(screeningId, kind, lang);
    setBusy(false);
    if ('content' in res) setReport(res.content);
    else setError(res.error === 'busy' ? s.reportBusy : s.reportFailed);
  };

  const progress = step === 'quiz' && qs.length ? ((index) / qs.length) * 100 : 0;

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
      {step === 'quiz' && <div className="bar no-print"><div style={{ width: `${progress}%` }} /></div>}

      <main className="card">
        {step === 'home' && (
          <section>
            <p className="eyebrow">{s.tagline}</p>
            <h1>{s.heroTitle}</h1>
            <p className="lead">{s.heroText}</p>
            <ol className="how">
              <li>{s.how1}</li><li>{s.how2}</li><li>{s.how3}</li>
            </ol>
            <button className="primary" onClick={() => setStep('consent')}>{s.start}</button>
            <p className="muted center">{s.minutes}</p>
          </section>
        )}

        {step === 'consent' && (
          <section>
            <h2>{s.consentTitle}</h2>
            <p className="note">{s.disclaimer}</p>
            <p>{s.consent}</p>
            <button className="primary" onClick={() => setStep('age')}>{s.agree}</button>
            <button className="link" onClick={() => setStep('home')}>{s.back}</button>
          </section>
        )}

        {step === 'age' && (
          <section>
            <h2>{s.ageTitle}</h2>
            <p className="muted">{s.ageHelp}</p>
            <div className="row">
              <label>{s.month}
                <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">—</option>
                  {s.months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </label>
              <label>{s.year}
                <select value={birthYear} onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">—</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
            </div>
            <label className="check">
              <input type="checkbox" checked={preterm} onChange={(e) => setPreterm(e.target.checked)} /> {s.preterm}
            </label>
            {ageMsg && <p className="note">{ageMsg}</p>}
            <button className="primary" disabled={ageMonths === null || !!ageMsg}
              onClick={() => { setMonths(ageMonths!); setIndex(0); setAnswers({}); setStep('quiz'); }}>
              {s.next}
            </button>
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
            <button className="link" onClick={() => (index > 0 ? setIndex(index - 1) : setStep('age'))}>{s.back}</button>
          </section>
        )}

        {step === 'result' && result && (
          <section>
            <h2 className="no-print">{s.resultTitle}</h2>
            <div className={`badge ${result.risk}`}>{s.risk[result.risk]}</div>
            <p className="lead">{s.nextStep[result.risk]}</p>
            {result.limitedAge && <p className="note">{s.limitedAge}</p>}
            {result.topDomains.length > 0 && (
              <>
                <h3>{s.focus}</h3>
                <ul>{result.topDomains.slice(0, 3).map((d) => <li key={d.domain}>{domains[d.domain][lang]}</li>)}</ul>
              </>
            )}

            {report ? (
              <article className="report">
                <Markdownish text={report} />
                <button className="secondary no-print" onClick={() => window.print()}>{s.print}</button>
              </article>
            ) : (
              <div className="offers no-print">
                <h3>{s.reportTitle}</h3>
                <p className="muted">{s.reportPitch}</p>
                <button className="offer" disabled={busy || !screeningId} onClick={() => getReport('short')}>
                  <strong>{s.shortReport}</strong><span>{s.shortDesc}</span>
                </button>
                <button className="offer featured" disabled={busy || !screeningId} onClick={() => getReport('detailed')}>
                  <strong>{s.detailedReport}</strong><span>{s.detailedDesc}</span>
                </button>
                {busy && <p className="muted center">{s.reportLoading}</p>}
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
