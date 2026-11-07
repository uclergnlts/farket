// The doctor summary: a plain, printable HTML page that expo-print turns into a PDF.
// Pure (no React Native) so it runs under `npm test`. Facts only: what the parent wrote,
// when, how often, and the same rule-based level the app shows. No AI text.
import type { DStrings } from './i18n';
import {
  addDays, CATEGORIES, computeGauge, correctedAgeMonths, liveEntries, parseYmd, sortEntries,
  type Baseline, type Child, type DLang, type Entry,
} from './model';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "7 Nov 2026" style, with the report language's month names. */
const longDate = (d: string, s: DStrings) => {
  const x = parseYmd(d);
  return `${x.getDate()} ${s.months[x.getMonth()]} ${x.getFullYear()}`;
};

export interface ReportInput {
  s: DStrings; lang: DLang; child: Child; entries: Entry[]; baseline: Baseline | null;
  today: string; days: number;
}

export function reportEntries(entries: Entry[], today: string, days: number) {
  const from = addDays(today, -(days - 1));
  return sortEntries(liveEntries(entries).filter((e) => e.date >= from && e.date <= today)).reverse();
}

export function buildReportHtml({ s, lang, child, entries, baseline, today, days }: ReportInput): string {
  const p = s.pdf;
  const from = addDays(today, -(days - 1));
  const notes = reportEntries(entries, today, days);
  const gauge = computeGauge(entries, today, baseline);

  const rows = CATEGORIES.map((c) => {
    const inCat = notes.filter((e) => e.category === c);
    const worries = inCat.filter((e) => e.kind === 'concern');
    return { c, worries: worries.length, good: inCat.length - worries.length, days: new Set(worries.map((e) => e.date)).size };
  }).filter((r) => r.worries + r.good > 0);
  const lost = notes.filter((e) => e.regression);

  const kv = (k: string, v: string) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`;
  const childRows = [
    kv(p.child, child.nickname),
    kv(p.born, `${s.months[child.birthMonth - 1]} ${child.birthYear}`),
    kv(p.age, s.ageMonths(correctedAgeMonths(child, today))),
    child.weeksEarly > 0 ? kv(p.preterm, s.weeksEarly(child.weeksEarly)) : '',
    kv(p.period, `${longDate(from, s)} – ${longDate(today, s)}`),
  ].join('');

  const why = gauge.repeating.length
    ? gauge.stats.filter((x) => x.repeating).map((x) => `${s.category[x.category]} (${s.gaugeRepeat(x.concernDays)})`).join(', ')
    : p.none;

  return `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<style>
  body { font-family: -apple-system, Roboto, "Segoe UI", Arial, sans-serif; color: #24203A; font-size: 12px; margin: 28px; }
  h1 { font-size: 20px; margin: 0 0 4px; } h2 { font-size: 14px; margin: 20px 0 6px; color: #5B3CC4; }
  .muted { color: #6B6780; } table { width: 100%; border-collapse: collapse; }
  th, td { text-align: start; padding: 5px 6px; border-bottom: 1px solid #E8E3F3; vertical-align: top; }
  th { color: #6B6780; font-weight: 600; width: 30%; } .grid th { width: auto; }
  .level { font-size: 16px; font-weight: 700; } .lost { color: #C2410C; font-weight: 600; }
  .worry { color: #B86E00; } .good { color: #2E7D32; } .foot { margin-top: 24px; font-size: 10px; color: #6B6780; }
</style></head><body>
<h1>${esc(p.heading)}</h1>
<div class="muted">${esc(p.made)}: ${esc(longDate(today, s))}</div>
<h2>${esc(p.child)}</h2><table>${childRows}</table>
<h2>${esc(p.level)}</h2>
<div class="level">${esc(gauge.ready ? s.gaugeLevel[gauge.level] : p.notReady)}</div>
<table>${kv(p.why, why)}${baseline ? kv(p.baseline, `${s.gaugeLevel[baseline.risk === 'medium' ? 'mid' : baseline.risk]} · ${longDate(baseline.date, s)}`) : ''}</table>
${lost.length ? `<h2>${esc(p.lost)}</h2><table>${lost.map((e) => `<tr><th>${esc(longDate(e.date, s))}</th><td class="lost">${esc(e.text)}</td></tr>`).join('')}</table>` : ''}
<h2>${esc(p.areas)}</h2>
${rows.length ? `<table class="grid"><tr><th>${esc(p.area)}</th><th>${esc(p.worries)}</th><th>${esc(p.daysWithWorries)}</th><th>${esc(p.good)}</th></tr>
${rows.map((r) => `<tr><td>${esc(s.category[r.c])}</td><td>${r.worries}</td><td>${r.days}</td><td>${r.good}</td></tr>`).join('')}</table>` : `<div class="muted">${esc(p.none)}</div>`}
<h2>${esc(p.notes)} (${notes.length})</h2>
<table class="grid"><tr><th>${esc(p.date)}</th><th>${esc(p.note)}</th><th>${esc(p.how)}</th></tr>
${notes.map((e) => `<tr><td>${esc(longDate(e.date, s))}</td><td><span class="${e.kind === 'positive' ? 'good' : 'worry'}">${esc(s.kind[e.kind])}</span>${e.category ? ` · ${esc(s.category[e.category])}` : ''}${e.regression ? ` · <span class="lost">${esc(s.regressionLabel)}</span>` : ''}<br>${esc(e.text)}</td><td>${esc(s.frequency[e.frequency])}</td></tr>`).join('')}
</table>
<div class="foot">${esc(p.footer)}</div>
</body></html>`;
}

const csvCell = (v: string | number | boolean | null) => {
  const s = v === null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Every live note as CSV, oldest first: the free "download my data" copy. */
export function entriesCsv(entries: Entry[]): string {
  const head = ['date', 'type', 'how_often', 'area', 'lost_skill', 'note', 'created_at'];
  const rows = sortEntries(liveEntries(entries)).reverse()
    .map((e) => [e.date, e.kind, e.frequency, e.category, e.regression, e.text, e.createdAt].map(csvCell).join(','));
  return [head.join(','), ...rows].join('\n');
}
