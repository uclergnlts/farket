// Pure diary logic: types, dates, ages and the "chart is forming" progress.
// No React Native imports here so it runs under `npm test`.

export type DLang = 'en' | 'es' | 'ar' | 'pt' | 'fr' | 'tr';
export const LANGS: DLang[] = ['en', 'es', 'ar', 'pt', 'fr', 'tr'];
export const LANG_NAMES: Record<DLang, string> = {
  en: 'English', es: 'Español', ar: 'العربية', pt: 'Português', fr: 'Français', tr: 'Türkçe',
};
export const isRtl = (l: DLang) => l === 'ar';

export type Frequency = 'once' | 'few' | 'daily';
export type Kind = 'concern' | 'positive';
export type Sex = 'boy' | 'girl' | 'unspecified';
export type Category =
  | 'social' | 'name' | 'joint' | 'speech' | 'play' | 'repetitive' | 'sensory' | 'routine';
export const CATEGORIES: Category[] = [
  'social', 'name', 'joint', 'speech', 'play', 'repetitive', 'sensory', 'routine',
];

export interface Child {
  id: string;
  nickname: string;
  birthYear: number;
  birthMonth: number; // 1-12
  sex: Sex;
  weeksEarly: number; // 0 when born at term
}

export interface Entry {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD, the day it was seen (may be in the past)
  text: string;
  frequency: Frequency;
  kind: Kind;
  category: Category | null;
  regression: boolean; // "could do this before"
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt: string | null;
}

/** The chart opens after this many notes spread over this many days (see plan). */
export const GAUGE_MIN_NOTES = 10;
export const GAUGE_MIN_DAYS = 14;

export const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Parses YYYY-MM-DD as a local date (never UTC, so the day doesn't shift). */
export const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (s: string, n: number) => {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
};
export const daysBetween = (a: string, b: string) =>
  Math.round((parseYmd(b).getTime() - parseYmd(a).getTime()) / 86_400_000);

/** Age in whole months on a given day. */
export function ageMonths(child: Pick<Child, 'birthYear' | 'birthMonth'>, today: string): number {
  const t = parseYmd(today);
  return Math.max(0, (t.getFullYear() - child.birthYear) * 12 + (t.getMonth() + 1 - child.birthMonth));
}

/** Corrected age for babies born early, used until 24 months (standard practice). */
export function correctedAgeMonths(child: Child, today: string): number {
  const age = ageMonths(child, today);
  if (child.weeksEarly <= 0 || age >= 24) return age;
  return Math.max(0, age - Math.round(child.weeksEarly / 4.345));
}

export const liveEntries = (entries: Entry[]) => entries.filter((e) => !e.deletedAt);

/** Newest day first; within a day, newest note first. */
export const sortEntries = (entries: Entry[]) =>
  [...entries].sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));

export interface GaugeProgress {
  ready: boolean;
  notesLeft: number;
  daysLeft: number;
}

/** How far the parent is from the chart opening: 10 notes and 14 days since the first note. */
export function gaugeProgress(entries: Entry[], today: string): GaugeProgress {
  const live = liveEntries(entries);
  const notesLeft = Math.max(0, GAUGE_MIN_NOTES - live.length);
  const first = live.reduce<string | null>((m, e) => (m === null || e.date < m ? e.date : m), null);
  const span = first ? daysBetween(first, today) + 1 : 0;
  const daysLeft = Math.max(0, GAUGE_MIN_DAYS - span);
  return { ready: notesLeft === 0 && daysLeft === 0, notesLeft, daysLeft };
}

/** The 7 days ending today, oldest first, with whether each has a note. */
export function weekStrip(entries: Entry[], today: string): { date: string; count: number }[] {
  const live = liveEntries(entries);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, count: live.filter((e) => e.date === date).length };
  });
}

/** Random v4 id. Not for security; ids only need to be unique per user. */
export function newId(): string {
  const h = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) s += '-';
    else if (i === 14) s += '4';
    else if (i === 19) s += h[(Math.random() * 4) | 8];
    else s += h[(Math.random() * 16) | 0];
  }
  return s;
}

export function pickLang(deviceCodes: (string | null | undefined)[]): DLang {
  for (const c of deviceCodes) {
    const code = (c ?? '').slice(0, 2).toLowerCase();
    if ((LANGS as string[]).includes(code)) return code as DLang;
  }
  return 'en';
}
