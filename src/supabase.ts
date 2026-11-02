import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import bank from './data/sorular.json';
import { questions, type Answer, type Lang, type Result } from './scoring';

// Publishable key: safe to ship in the app; RLS protects the data.
const SUPABASE_URL = 'https://ljvgqhszuepcestwmmet.supabase.co';
const SUPABASE_KEY = 'sb_publishable_erPo2b5bteRFOXl-2j8Gpw_kAnNa1oB';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

/** Anonymous account: no name or email needed. */
export async function ensureSession(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
}

/** Saves the child (once per device) and the screening; returns the screening id. */
export async function saveScreening(
  months: number, answers: Record<string, Answer>, result: Result,
): Promise<string> {
  await ensureSession();
  const now = new Date();
  const birth = new Date(now.getFullYear(), now.getMonth() - months, 1);

  let childId = await AsyncStorage.getItem('child_id');
  if (!childId) {
    const { data, error } = await supabase.from('children').insert({
      nickname: 'child', birth_year: birth.getFullYear(), birth_month: birth.getMonth() + 1,
    }).select('id').single();
    if (error) throw error;
    childId = data.id as string;
    await AsyncStorage.setItem('child_id', childId);
  }

  const { data, error } = await supabase.from('screenings').insert({
    child_id: childId,
    age_months: months,
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
  }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export type ReportError = 'payment_required' | 'busy' | 'failed';

export async function fetchReport(
  screeningId: string, kind: 'short' | 'detailed', language: Lang,
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
