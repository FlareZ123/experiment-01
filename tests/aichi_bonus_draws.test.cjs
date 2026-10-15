'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {mulliganProbability} = require('../scripts/aichi_opening_audit.cjs');
const {
  bonusExactly, bonusAtLeast, targetAccess, fieldAccess,
} = require('../scripts/aichi_bonus_draws.cjs');

test('exact geometric probability normalizes and matches tail and mean', () => {
  const pA = mulliganProbability(4);
  const pB = mulliganProbability(14);
  const mass = Array.from({length: 47}, (_, k) => bonusExactly(pA, pB, k))
    .reduce((x, y) => x + y, 0) + bonusAtLeast(pA, pB, 47);
  assert.ok(Math.abs(mass - 1) < 1e-12);
  assert.ok(Math.abs(bonusAtLeast(pA, pB, 1) - 0.5642343175423022) < 1e-12);
  assert.ok(Math.abs(bonusAtLeast(pA, pB, 3) - 0.20346328957682416) < 1e-12);
  assert.ok(Math.abs(bonusAtLeast(pA, pB, 47)) < 1e-9);
  const mean = Array.from({length: 200}, (_, k) => k * bonusExactly(pA, pB, k))
    .reduce((x, y) => x + y, 0);
  assert.ok(Math.abs(mean - 1.4123525560019534) < 1e-12);
});

test('Iron Thorns bonus-draw access uses the 14 Basic, 3 target baseline', () => {
  const outcome = targetAccess(4, 14, 3);
  assert.ok(Math.abs(outcome.opening - 0.36617850114271205) < 1e-12);
  assert.ok(Math.abs(outcome.withAllBonuses - 0.4140059703851562) < 1e-12);
  assert.ok(Math.abs(outcome.improvement - 0.04782746924244419) < 1e-12);
});

test('zero mulligan probability means no additional target access', () => {
  const r = targetAccess(60, 14, 3);
  assert.equal(r.bonusOne, 0);
  assert.equal(r.improvement, 0);
});

test('target access is monotonic across opponent Basic counts', () => {
  const values = [4, 11, 13, 14, 15, 16].map(n => targetAccess(n, 14, 3));
  for (let i = 1; i < values.length; i += 1) {
    assert.ok(values[i - 1].withAllBonuses > values[i].withAllBonuses);
  }
  assert.ok(values.every(v => v.withAllBonuses >= v.opening));
});

test('invalid inputs fail loudly', () => {
  assert.throws(() => bonusExactly(1, 0, 0), /Invalid/);
  assert.throws(() => bonusAtLeast(0.5, 0.5, 0), /positive/);
  assert.throws(() => targetAccess(4, 14, 15), /Invalid/);
  assert.throws(() => targetAccess(0, 14, 3), /Invalid/);
  const broken = {decks: [{rank: 1, cards: []}]};
  assert.throws(() => fieldAccess(broken, new Map()), /verified Basic/);
});
