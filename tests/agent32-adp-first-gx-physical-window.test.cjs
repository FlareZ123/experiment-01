'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const { choose } = require('../simulation/evaluation/agent5-adp-thorton-prize-availability.cjs');
const {
  VERSION, gcd, prizeSurvival, evaluate
} = require('../simulation/evaluation/agent32-adp-first-gx-physical-window.cjs');

test('source-exact printed v2 inventory and legal Basic opening denominator', () => {
  const x = evaluate();
  assert.equal(x.version, VERSION);
  assert.equal(x.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  assert.deepEqual(Object.values(x.physicalCategories), [2,5,4,3,4,42]);
  assert.equal(x.basicCount, 7);
  assert.equal(BigInt(x.validSevenCount), choose(60,7) - choose(53,7));
  assert.equal(BigInt(x.denominator),
    (choose(60,7) - choose(53,7)) * 53n * choose(52,6));
});

test('three physical source-branch masses and disjoint union are exact BigInt', () => {
  const x = evaluate();
  assert.equal(x.directHeldDDE.numerator, '4356639');
  assert.equal(x.directHeldDDE.denominator, '29007980');
  assert.equal(x.guzmaHalaHeldSearchDDE.numerator, '374175362');
  assert.equal(x.guzmaHalaHeldSearchDDE.denominator, '4996624555');
  assert.equal(x.tagOnlySearchDDE.numerator, '47467826673');
  assert.equal(x.tagOnlySearchDDE.denominator, '731813319440');
  assert.equal(x.combined.numerator, '2758332388993');
  assert.equal(x.combined.denominator, '9513573152720');
  const sum = x.directHeldDDE.fraction +
    x.guzmaHalaHeldSearchDDE.fraction +
    x.tagOnlySearchDDE.fraction;
  assert.ok(Math.abs(sum - x.combined.fraction) < 1e-14);
  assert.ok(Math.abs(x.combined.percent - 28.9936530125316) < 1e-11);
  assert.ok(x.combined.fraction < x.adpStarter.fraction);
});

test('independent direct seven-plus-eighth closed form agrees exactly', () => {
  const x = evaluate();
  const countedADP = choose(60,7) - choose(58,7);
  const noDDESeven = choose(56,7) - choose(54,7);
  const favorable = 53n * countedADP - 49n * noDDESeven;
  const denominator = 53n * (choose(60,7) - choose(53,7));
  const reduced = gcd(favorable, denominator);
  assert.equal((favorable / reduced).toString(), x.directHeldDDE.numerator);
  assert.equal((denominator / reduced).toString(), x.directHeldDDE.denominator);
});

test('prize inclusion-exclusion handles two independent must-survive identities', () => {
  assert.equal(prizeSurvival([1]), choose(51,6));
  assert.equal(prizeSurvival([1,1]), choose(50,6));
  assert.equal(prizeSurvival([0]), 0n);
  assert.equal(prizeSurvival([4]), choose(52,6) - choose(48,2));
});

test('Tag Call deletion removes only the tag-only search opportunity', () => {
  const rows = source.cards.map(c => ({...c}));
  rows.find(c => c.id === 'sm12-206').count = 0;
  for (const id of ['swsh1-179','sv1-186','sm2-125','sv1-194'])
    rows.find(c => c.id === id).count++;
  assert.equal(rows.reduce((s,c) => s+c.count, 0), 60);
  const result = evaluate(rows), baseline = evaluate();
  assert.equal(result.tagOnlySearchDDE.numerator, '0');
  assert.equal(result.directHeldDDE.fraction, baseline.directHeldDDE.fraction);
  assert.equal(result.guzmaHalaHeldSearchDDE.fraction,
    baseline.guzmaHalaHeldSearchDDE.fraction);
  assert.ok(result.combined.fraction < baseline.combined.fraction);
});

test('without Double Dragon Energy no enhanced first-GX route qualifies', () => {
  const rows = source.cards.map(c => ({...c}));
  rows.find(c => c.id === 'xy6-97').count = 0;
  for (const id of ['swsh1-179','sv1-186','sm2-125','sv1-194'])
    rows.find(c => c.id === id).count++;
  assert.equal(rows.reduce((s,c) => s+c.count, 0), 60);
  assert.equal(evaluate(rows).combined.numerator, '0');
});
