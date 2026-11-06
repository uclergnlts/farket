import { createClient } from '@supabase/supabase-js';
import bank from './data/questions.json';
import { questions, type Answer, type Lang, type Result } from './scoring.ts';

// Publishable key: safe in the browser; row level security protects the data.
const SUPABASE_URL = 'https://ljvgqhszuepcestwmmet.supabase.co';
const SUPABASE_KEY = 'sb_publishable_erPo2b5bteRFOXl-2j8Gpw_kAnNa1oB';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/** Anonymous session: no name or email needed. */
async function ensureSession(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
}

export type Sex = 'boy' | 'girl' | 'unspecified';

export async function saveScreening(input: {
  ageRange: [number, number]; months: number; sex: Sex; email: string; marketing: boolean;
  language: Lang; answers: Record<string, Answer>; result: Result;
}): Promise<string> {
  await ensureSession();
  const { data: child, error: childErr } = await supabase.from('children')
    .insert({ nickname: 'child', sex: input.sex }).select('id').single();
  if (childErr) throw childErr;

  const { answers, result } = input;
  const { data, error } = await supabase.from('screenings').insert({
    child_id: child.id,
    age_months: input.months,
    age_range: `${input.ageRange[0]}-${input.ageRange[1]}`,
    question_version: bank.version,
    // Question text travels with the answer so the AI report can explain each one.
    answers: questions.filter((q) => answers[q.id]).map((q) => ({
      id: q.id, domain: q.domain, question: q.en, answer: answers[q.id],
      concerning_when: q.reverse ? 'yes' : 'no',
    })),
    risk: result.risk,
    ratio: result.ratio,
    regression: result.regression,
    top_domains: result.topDomains,
    email: input.email,
    marketing_consent: input.marketing,
    language: input.language,
  }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

/** Writes the free report and emails it. Resolves to whether the email went out. */
export async function emailReport(screeningId: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('email-report', { body: { screening_id: screeningId } });
  return !error && data?.sent === true;
}

export type ReportKind = 'short' | 'detailed';
export type ReportError = 'payment_required' | 'busy' | 'failed';

export async function fetchReport(
  screeningId: string, kind: ReportKind, language: Lang,
): Promise<{ content: string } | { error: ReportError }> {
  const { data, error } = await supabase.functions.invoke('report', {
    body: { screening_id: screeningId, kind, language },
  });
  if (!error && typeof data?.content === 'string') return { content: data.content };
  const status = (error as { context?: { status?: number } } | null)?.context?.status;
  if (status === 402) return { error: 'payment_required' };
  if (status === 503) return { error: 'busy' };
  return { error: 'failed' };
}

/** A Creem checkout page for the detailed report, or null when Creem is not set up (yet). */
export async function creemCheckoutUrl(screeningId: string, language: Lang, email?: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('creem-checkout', {
      body: { screening_id: screeningId, lang: language, email },
    });
    return !error && typeof data?.url === 'string' ? data.url : null;
  } catch {
    return null;
  }
}

/** A random id for this browser tab, so funnel steps can be grouped into one visit. */
function visitId(): string {
  try {
    let v = sessionStorage.getItem('visit');
    if (!v) { v = crypto.randomUUID(); sessionStorage.setItem('visit', v); }
    return v;
  } catch {
    return (window as { __visit?: string }).__visit ??= Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

/** Records that the visitor reached a step (and which question). Never answers or contact details. */
export function logStep(step: 'age' | 'sex' | 'quiz' | 'email' | 'done' | 'offer', lang: Lang, question?: number) {
  supabase.from('funnel_events').insert({ visit: visitId(), lang, step, question: question ?? null })
    .then(() => {}, () => {});
}

/** Sends the Lead to Meta from the server too (only for visitors who accepted cookies). */
export function sendMetaLead(screeningId: string) {
  const cookie = (n: string) => document.cookie.split('; ').find((c) => c.startsWith(n + '='))?.slice(n.length + 1);
  supabase.functions.invoke('meta-event', {
    body: { screening_id: screeningId, fbp: cookie('_fbp'), fbc: cookie('_fbc'), url: location.href },
  }).then(() => {}, () => {});
}
