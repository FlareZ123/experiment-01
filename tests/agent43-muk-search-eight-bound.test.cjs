'use strict';

const assert = require('node:assert/strict');
const { openingEightAccess, choose } = require('../simulation/evaluation/agent43-muk-search-eight-bound.cjs');

/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, 'Expected ' + expected + ' but received ' + actual);
}

assert.equal(choose(60, 7), 386206920);
assert.equal(choose(60, 8), 2558620845);
assert.equal(choose(52, 6), 20358520);

const base = openingEightAccess();
near(base.basicValidInitialSeven, 0.8093533072892635);
near(base.directUnconditional, 0.07759162886050825);
near(base.directAmongBasicValid, 0.0926277443382764);
near(base.directWithOtherBasicStarterAmongBasicValid, 0.06296981420960828);
near(base.searchAssistedUnconditional, 0.24007559091372999);
near(base.searchAssistedAmongBasicValid, 0.23089801437797755);
near(base.searchAssistedWithOtherBasicStarterAmongBasicValid, 0.20124008424930906);
near(base.directAmongBasicValid-base.directWithOtherBasicStarterAmongBasicValid, 0.029657930128668096);
near(base.searchAssistedAmongBasicValid-base.searchAssistedWithOtherBasicStarterAmongBasicValid, 0.029657930128668096);
assert.ok(base.searchAssistedUnconditional > base.directUnconditional);
assert.ok(base.directAmongBasicValid < base.directUnconditional / base.basicValidInitialSeven);

const cases = [
  [1, 0.0287951029, 0.0896133429],
  [2, 0.0545694106, 0.1693285705],
  [3, 0.0775916289, 0.2400755909],
  [4, 0.0981110017, 0.3027129427]
];
for (const [shake, direct, permissive] of cases) {
  const got = openingEightAccess({ shake });
  assert.ok(Math.abs(got.directUnconditional - direct) < 6e-11);
  assert.ok(Math.abs(got.searchAssistedUnconditional - permissive) < 6e-11);
  near(got.basicValidInitialSeven, base.basicValidInitialSeven);
}
near(openingEightAccess({ shake: 0 }).directUnconditional, 0);
near(openingEightAccess({ grimer: 0 }).searchAssistedUnconditional, 0);
near(openingEightAccess({ muk: 0 }).directUnconditional, 0);
assert.throws(() => openingEightAccess({ shake: 61 }), RangeError);
assert.throws(() => openingEightAccess({ otherBasic: -1 }), RangeError);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'exact first-eight hypergeometric enumeration, no gameplay claims',
  basicValid: base.basicValidInitialSeven,
  direct: base.directUnconditional,
  directBasicValid: base.directAmongBasicValid,
  permissiveSearch: base.searchAssistedUnconditional,
  permissiveSearchBasicValid: base.searchAssistedAmongBasicValid,
  directWithOtherBasicStarterBasicValid: base.directWithOtherBasicStarterAmongBasicValid,
  permissiveWithOtherBasicStarterBasicValid: base.searchAssistedWithOtherBasicStarterAmongBasicValid,
  shakeCounterfactuals: cases.length
}, null, 2));
