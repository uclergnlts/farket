import { strict as assert } from 'node:assert';
import { dt } from './i18n';
import {
  addDays, ageMonths, correctedAgeMonths, daysBetween, gaugeProgress, LANGS, newId, pickLang,
  sortEntries, weekStrip, type Child, type Entry,
} from './model';
import { TEMPLATES, templatesForAge } from './templates';

const child: Child = { id: 'c', nickname: 'Elif', birthYear: 2024, birthMonth: 11, sex: 'girl', weeksEarly: 0 };
let n = 0;
const entry = (date: string, extra: Partial<Entry> = {}): Entry => ({
  id: `e${n++}`, childId: 'c', date, text: 'x', frequency: 'once', kind: 'concern', category: null,
  regression: false, createdAt: `${date}T10:00:00.000Z`, updatedAt: `${date}T10:00:00.000Z`, deletedAt: null, ...extra,
});

// dates: local, month and year boundaries
assert.equal(addDays('2026-11-01', -1), '2026-10-31');
assert.equal(addDays('2026-12-31', 1), '2027-01-01');
assert.equal(daysBetween('2026-11-01', '2026-11-15'), 14);

// age and corrected age (only below 24 months)
assert.equal(ageMonths(child, '2026-11-07'), 24);
assert.equal(ageMonths(child, '2025-05-20'), 6);
const preterm = { ...child, birthYear: 2026, birthMonth: 5, weeksEarly: 8 };
assert.equal(ageMonths(preterm, '2026-11-07'), 6);
assert.equal(correctedAgeMonths(preterm, '2026-11-07'), 4);
assert.equal(correctedAgeMonths({ ...child, weeksEarly: 8 }, '2026-11-07'), 24);

// gauge opens only after 10 notes AND 14 days
assert.deepEqual(gaugeProgress([], '2026-11-07'), { ready: false, notesLeft: 10, daysLeft: 14 });
const tenToday = Array.from({ length: 10 }, () => entry('2026-11-07'));
assert.deepEqual(gaugeProgress(tenToday, '2026-11-07'), { ready: false, notesLeft: 0, daysLeft: 13 });
const spread = Array.from({ length: 10 }, (_, i) => entry(addDays('2026-10-25', i)));
assert.equal(gaugeProgress(spread, '2026-11-07').ready, true);
// deleted notes don't count
const withDeleted = [...spread.slice(0, 9), entry('2026-10-25', { deletedAt: '2026-11-01T00:00:00Z' })];
assert.equal(gaugeProgress(withDeleted, '2026-11-07').notesLeft, 1);

// week strip ends today and counts live notes
const week = weekStrip([entry('2026-11-07'), entry('2026-11-07'), entry('2026-11-01')], '2026-11-07');
assert.equal(week.length, 7);
assert.equal(week[6].date, '2026-11-07');
assert.equal(week[6].count, 2);
assert.equal(week[0].date, '2026-11-01');
assert.equal(week[0].count, 1);

// newest first
const sorted = sortEntries([entry('2026-11-01'), entry('2026-11-05'), entry('2026-11-03')]);
assert.deepEqual(sorted.map((e) => e.date), ['2026-11-05', '2026-11-03', '2026-11-01']);

// ids look like uuids (the server column is uuid)
assert.match(newId(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

// language from the device, English fallback
assert.equal(pickLang(['pt-BR']), 'pt');
assert.equal(pickLang(['de', 'fr']), 'fr');
assert.equal(pickLang(['de', null]), 'en');

// every language has every string and every quick note
for (const l of LANGS) {
  for (const [k, v] of Object.entries(dt.en)) {
    assert.equal(typeof (dt[l] as unknown as Record<string, unknown>)[k], typeof v, `${l}.${k}`);
  }
  assert.equal(dt[l].months.length, 12, `${l}.months`);
  assert.equal(dt[l].welcomePoints.length, 3, `${l}.welcomePoints`);
  for (const tp of TEMPLATES) assert.ok(tp.text[l]?.trim(), `${tp.id}.${l}`);
}
// quick notes by age: none of the 12m+ ones for a 6 month old, and both kinds offered
assert.ok(templatesForAge(6).every((t) => t.minMonths <= 6));
assert.ok(!templatesForAge(6).some((t) => t.id === 't-spin'));
assert.ok(templatesForAge(24).some((t) => t.kind === 'positive') && templatesForAge(24).some((t) => t.kind === 'concern'));
// no diagnosis words in any parent-facing text
const banned = /autis|otizm|autism|diagnos(is|ed) with|تشخيص بالتوحد|توحد/i;
for (const l of LANGS) {
  const all = JSON.stringify(dt[l]) + TEMPLATES.map((t) => t.text[l]).join(' ');
  assert.ok(!banned.test(all), `banned word in ${l}`);
}
console.log('diary model tests passed');

// ---- gauge rule ----
import { computeGauge } from './model';
const T = '2026-11-30';
const worry = (date: string, category: Entry['category'], extra: Partial<Entry> = {}) => entry(date, { category, ...extra });
const good = (date: string, category: Entry['category']) => entry(date, { category, kind: 'positive' });

// one note never changes anything
assert.equal(computeGauge([worry(T, 'repetitive')], T).level, 'low');
// same category on 3 different days -> mid
const spin3 = [worry('2026-11-10', 'repetitive'), worry('2026-11-15', 'repetitive'), worry('2026-11-20', 'repetitive')];
assert.equal(computeGauge(spin3, T).level, 'mid');
assert.deepEqual(computeGauge(spin3, T).repeating, ['repetitive']);
// 3 notes on the same day are not a pattern
assert.equal(computeGauge([worry(T, 'repetitive'), worry(T, 'repetitive'), worry(T, 'repetitive')], T).level, 'low');
// good signs in the same area cancel it out
assert.equal(computeGauge([...spin3, good('2026-11-11', 'repetitive'), good('2026-11-12', 'repetitive'), good('2026-11-13', 'repetitive')], T).level, 'low');
// older than 30 days doesn't count
assert.equal(computeGauge([worry('2026-10-01', 'name'), worry('2026-10-02', 'name'), worry('2026-10-03', 'name')], T).level, 'low');
// two of the core three -> high
const name3 = ['2026-11-05', '2026-11-06', '2026-11-07'].map((d) => worry(d, 'name'));
const joint3 = ['2026-11-05', '2026-11-08', '2026-11-09'].map((d) => worry(d, 'joint'));
assert.equal(computeGauge([...name3, ...joint3], T).level, 'high');
// three non-core categories -> high
const sens3 = ['2026-11-05', '2026-11-06', '2026-11-07'].map((d) => worry(d, 'sensory'));
const rout3 = ['2026-11-05', '2026-11-06', '2026-11-07'].map((d) => worry(d, 'routine'));
assert.equal(computeGauge([...spin3, ...sens3, ...rout3], T).level, 'high');
// a worrying starting test keeps it at mid for 30 days, then lets go
assert.equal(computeGauge([], T, { date: '2026-11-20', risk: 'high' }).level, 'mid');
assert.equal(computeGauge([], T, { date: '2026-10-01', risk: 'high' }).level, 'low');
// uncategorised worries are counted separately, lost skills flagged
const g = computeGauge([worry(T, null), worry(T, 'speech', { regression: true })], T);
assert.equal(g.uncategorized, 1);
assert.equal(g.regression, true);
assert.equal(computeGauge([], T, { date: '2026-11-20', risk: 'high' }).baselineHeld, true);
// weekly trend: 4 weeks, oldest first, today counts in the last one
const w = computeGauge([worry(T, 'name'), good(addDays(T, -7), 'play'), worry(addDays(T, -27), 'name')], T).weeks;
assert.deepEqual(w, [{ concerns: 1, positives: 0 }, { concerns: 0, positives: 0 }, { concerns: 0, positives: 1 }, { concerns: 1, positives: 0 }]);
console.log('gauge tests passed');

// ---- starting questionnaire ----
import { ANSWERS, answerText, baselineQuestions, baselineResult, canTakeBaseline } from './baseline';
import baselineData from './data/baseline.json';
assert.equal(baselineData.questions.length, 23);
for (const l of LANGS) {
  for (const q of baselineData.questions) {
    const text = (q.text as Record<string, string>)[l];
    assert.ok(text?.trim() && !banned.test(text), `${q.id}.${l}`);
  }
  for (const a of ANSWERS) assert.ok(answerText(a, l)?.trim(), `answer ${a}.${l}`);
  assert.ok(!banned.test(JSON.stringify(dt[l].baselineResult)), `baseline result ${l}`);
}
assert.ok(!canTakeBaseline(4) && canTakeBaseline(6) && !canTakeBaseline(49));
// "yes" is the good answer except for reverse items; a lost skill makes it high
const rev = new Set(['q17', 'q18', 'q19', 'q20', 'q21', 'q22', 'q23']);
const typical = Object.fromEntries(baselineQuestions(24, 'en').map((q) => [q.id, rev.has(q.id) ? 'no' as const : 'yes' as const]));
assert.equal(baselineResult(24, typical, T).risk, 'low');
assert.equal(baselineResult(24, { ...typical, q23: 'yes' }, T).risk, 'high');
assert.equal(baselineResult(24, { ...typical, q23: 'yes' }, T).regression, true);
console.log('baseline tests passed');

// ---- doctor summary ----
import { buildReportHtml, reportEntries } from './report';
{
  const kid = { id: 'c', nickname: 'Ali <b>', birthYear: 2024, birthMonth: 12, sex: 'boy' as const, weeksEarly: 0 };
  const notes = [worry(T, 'name'), worry(addDays(T, -40), 'speech', { regression: true }), worry(addDays(T, -100), 'social')];
  assert.equal(reportEntries(notes, T, 30).length, 1);
  assert.equal(reportEntries(notes, T, 60).length, 2);
  const html = buildReportHtml({ s: dt.ar, lang: 'ar', child: kid, entries: notes, baseline: null, today: T, days: 60 });
  assert.ok(html.includes('dir="rtl"') && html.includes('Ali &lt;b&gt;') && !html.includes('<b>'));
  assert.ok(html.includes(dt.ar.pdf.lost) && html.includes(dt.ar.pdf.footer));
  for (const l of LANGS) assert.ok(!banned.test(JSON.stringify(dt[l].pdf)), `pdf ${l}`);
}
console.log('report tests passed');
