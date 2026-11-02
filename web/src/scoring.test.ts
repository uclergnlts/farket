import { strict as assert } from 'node:assert';
import { ageInMonths, questionsForAge, score, type Answer } from './scoring.ts';

const all = (months: number, a: Answer) =>
  Object.fromEntries(questionsForAge(months).map((q) => [q.id, q.reverse ? (a === 'yes' ? 'no' : a === 'no' ? 'yes' : a) : a])) as Record<string, Answer>;

// typical development -> low
assert.equal(score(24, all(24, 'yes')).risk, 'low');
// everything concerning -> high
assert.equal(score(24, all(24, 'no')).risk, 'high');
// only regression reported -> high
const reg = all(24, 'yes');
reg.q23 = 'yes';
assert.equal(score(24, reg).risk, 'high');
assert.equal(score(24, reg).regression, true);
// one critical concern -> medium
const one = all(24, 'yes');
one.q06 = 'no';
assert.equal(score(24, one).risk, 'medium');
// under 12 months flagged as limited
assert.equal(score(8, all(8, 'yes')).limitedAge, true);
// age
assert.equal(ageInMonths(new Date(2024, 10, 1), new Date(2026, 10, 1)), 24);
assert.equal(ageInMonths(new Date(2026, 0, 15), new Date(2026, 10, 1), 32), 7);
console.log('scoring tests passed');
