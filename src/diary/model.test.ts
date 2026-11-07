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
