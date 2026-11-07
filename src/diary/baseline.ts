// The starting questionnaire: the website's questions and scoring, in the diary's 6 languages.
import { MAX_MONTHS, MIN_MONTHS, questionsForAge, score, type Answer } from '../scoring';
import data from './data/baseline.json';
import type { Baseline, DLang } from './model';

const textById = new Map(data.questions.map((q) => [q.id, q.text as Record<DLang, string>]));

export const ANSWERS: Answer[] = ['yes', 'sometimes', 'no'];
export const answerText = (a: Answer, l: DLang) => (data.answers[a] as Record<DLang, string>)[l];

export const canTakeBaseline = (months: number) => months >= MIN_MONTHS && months <= MAX_MONTHS;

export const baselineQuestions = (months: number, l: DLang) =>
  questionsForAge(months).map((q) => ({ id: q.id, text: textById.get(q.id)?.[l] ?? q.en }));

export function baselineResult(months: number, answers: Record<string, Answer>, today: string): Baseline {
  const r = score(months, answers);
  return { date: today, risk: r.risk, regression: r.regression };
}
