import bank from './data/questions.json';

export type Lang = 'en' | 'es' | 'ar';
export type Answer = 'yes' | 'sometimes' | 'no';
export type Risk = 'low' | 'medium' | 'high';
export type Domain = keyof typeof bank.domains;

export interface Question {
  id: string;
  domain: Domain;
  minMonths: number;
  maxMonths: number;
  reverse: boolean;
  critical: boolean;
  redFlag?: boolean;
  en: string;
  es: string;
  ar: string;
}

export const questions = bank.questions as Question[];
export const domains = bank.domains;
export const answerLabels = bank.answers;

export const MIN_MONTHS = 6;
export const MAX_MONTHS = 48;

/** Age in whole months; uses corrected age for preterm babies under 24 months. */
export function ageInMonths(birth: Date, now: Date, gestationWeeks = 40): number {
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (gestationWeeks < 37 && months < 24) {
    months -= Math.round((40 - gestationWeeks) / 4.345);
  }
  return Math.max(0, months);
}

export function questionsForAge(months: number): Question[] {
  return questions.filter((q) => q.minMonths <= months && months <= q.maxMonths);
}

export function points(q: Question, a: Answer): number {
  const table = q.reverse ? bank.scoring.reverse_item : bank.scoring.positive_item;
  return table[a];
}

export interface Result {
  risk: Risk;
  ratio: number;
  criticalConcerns: string[];
  regression: boolean;
  /** Domains ordered from most to least concerning, only those with any points. */
  topDomains: { domain: Domain; ratio: number }[];
  limitedAge: boolean;
}

export function score(months: number, answers: Record<string, Answer>): Result {
  const qs = questionsForAge(months);
  let total = 0;
  const criticalConcerns: string[] = [];
  let regression = false;
  const perDomain: Partial<Record<Domain, { pts: number; max: number }>> = {};

  for (const q of qs) {
    const a = answers[q.id];
    if (!a) throw new Error(`Missing answer for ${q.id}`);
    const p = points(q, a);
    total += p;
    const d = (perDomain[q.domain] ??= { pts: 0, max: 0 });
    d.pts += p;
    d.max += 2;
    if (q.critical && p === 2) criticalConcerns.push(q.id);
    if (q.redFlag && p === 2) regression = true;
  }

  const ratio = qs.length ? total / (qs.length * 2) : 0;
  let risk: Risk = 'low';
  if (regression || criticalConcerns.length >= 2 || ratio >= 0.4) risk = 'high';
  else if (criticalConcerns.length === 1 || ratio >= 0.2) risk = 'medium';

  const topDomains = (Object.entries(perDomain) as [Domain, { pts: number; max: number }][])
    .map(([domain, v]) => ({ domain, ratio: v.pts / v.max }))
    .filter((d) => d.ratio > 0)
    .sort((a, b) => b.ratio - a.ratio);

  return { risk, ratio, criticalConcerns, regression, topDomains, limitedAge: months < 12 };
}
