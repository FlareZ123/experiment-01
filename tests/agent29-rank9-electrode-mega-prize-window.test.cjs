'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ROLES, prizeWindow, rank9FromSource } =
  require('../scripts/agent29-rank9-electrode-mega-prize-window.cjs');

test('original rank9 printed role counts and Basic count source-bound', () => {
  const r = rank9FromSource();
  assert.equal(r.sourceRank, 9);
  assert.equal(r.sourceArchetype, 'Absol Electrode');
  assert.equal(r.printedBasicCount, 11);
  assert.deepEqual(r.printedRoleCounts, ROLES);
  assert.equal(r.countsAnyNativeOrCompetitiveGame, false);
});

test('exact conditional 6-Prize resource window matches independent rational enumeration', () => {
  const r = prizeWindow();
  assert.equal(r.legalFirstSeven.numerator, '1137524');
  assert.equal(r.legalFirstSeven.denominator, '1462905');
  assert.equal(r.prerequisiteAvailabilityGivenLegalFirstSeven.numerator,
    '55714362486839');
  assert.equal(r.prerequisiteAvailabilityGivenLegalFirstSeven.denominator,
    '70349762271360');
  assert.ok(r.prerequisiteAvailabilityGivenLegalFirstSeven.probability > 0.79);
  assert.ok(r.prerequisiteAvailabilityGivenLegalFirstSeven.probability < 0.80);
  assert.equal(r.countsPrizeRecovery, false);
  assert.equal(r.countsEvolutionOrTiming, false);
});

test('disjoint conditional/unconditional exact weighted probabilities conserve', () => {
  const r = prizeWindow();
  const multiply = p => BigInt(p.numerator);
  const denom = p => BigInt(p.denominator);
  const a = r.prerequisiteAvailabilityGivenLegalFirstSeven;
  const b = r.prerequisiteAvailabilityUnconditionalFirstSeven;
  const c = r.legalFirstSeven;
  assert.equal(multiply(a) * multiply(c) * denom(b),
    multiply(b) * denom(a) * denom(c));
});
