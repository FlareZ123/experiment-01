'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { mulliganProbability } = require('../scripts/aichi_opening_audit.cjs');
const { bilateralBonus, publishedFieldBilateral } =
  require('../scripts/aichi_bilateral_bonus.cjs');

const audit = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../results/aichi-2026/opening-hand-audit.json'), 'utf8'));
const FIELD = audit.decks;

test('three mutually exclusive outcomes normalize and equal-count decks are symmetric', () => {
  for (let a = 1; a <= 60; a += 1) {
    for (const b of [1, 4, 14, 15, 30, 60]) {
      const r = bilateralBonus(a, b);
      assert.ok(Math.abs(r.candidateAtLeastOne + r.opponentAtLeastOne + r.neither - 1) < 1e-12);
      assert.ok(r.candidateExpected >= 0 && r.opponentExpected >= 0);
    }
  }
  const mirror = bilateralBonus(14, 14);
  assert.equal(mirror.candidateAtLeastOne, mirror.opponentAtLeastOne);
  assert.equal(mirror.expectedNet, 0);
});

test('bilateral marginal agrees with independent one-sided geometric distribution', () => {
  for (const a of [4, 10, 14, 16]) {
    const pA = mulliganProbability(a);
    const pB = mulliganProbability(14);
    const r = bilateralBonus(a, 14);
    assert.ok(Math.abs(r.candidateAtLeastOne - pA * (1 - pB) / (1 - pA * pB)) < 1e-14);
    assert.ok(Math.abs(r.opponentAtLeastOne - pB * (1 - pA) / (1 - pA * pB)) < 1e-14);
    assert.ok(Math.abs((r.candidateAtLeastOne - r.opponentAtLeastOne) -
      (pA - pB) / (1 - pA * pB)) < 1e-14);
  }
});

test('source-frequency field averages preserve unobserved 23/25/28', () => {
  assert.equal(FIELD.length, 29);
  for (const [basics, expectedNet] of [[14, 0.17335652346055197], [15, 0.20109932709151312]]) {
    const r = publishedFieldBilateral(FIELD, basics);
    assert.equal(r.coveredRanks, 29);
    assert.deepEqual(r.missingRanks, [23, 25, 28]);
    assert.ok(Math.abs(r.expectedNet - expectedNet) < 1e-12);
  }
  const rank6 = bilateralBonus(4, 14);
  assert.ok(Math.abs(rank6.candidateAtLeastOne - 0.5642343175423022) < 1e-12);
  assert.ok(Math.abs(rank6.opponentAtLeastOne - 0.060393062632150364) < 1e-12);
});

test('one added candidate Basic changes both direction-specific bonus offers', () => {
  const oldProfile = publishedFieldBilateral(FIELD, 14);
  const newProfile = publishedFieldBilateral(FIELD, 15);
  assert.ok(newProfile.candidateAtLeastOne > oldProfile.candidateAtLeastOne);
  assert.ok(newProfile.opponentAtLeastOne < oldProfile.opponentAtLeastOne);
  assert.ok(newProfile.expectedNet > oldProfile.expectedNet);
});

test('independent physical seven-card redraw simulation reproduces bilateral rates', () => {
  let seed = 0x6a09e667;
  const random = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0x100000000;
  };
  const validSeven = basics => {
    let remainingBasics = basics;
    let hasBasic = false;
    for (let i = 0; i < 7; i += 1) {
      const eligible = random() * (60 - i) < remainingBasics;
      if (eligible) {
        remainingBasics -= 1;
        hasBasic = true;
      }
    }
    return hasBasic;
  };
  const count = 120000;
  let candidateOffered = 0;
  let opponentOffered = 0;
  let bothOffered = 0;
  for (let game = 0; game < count; game += 1) {
    let opponentValid = false;
    let candidateValid = false;
    let candidateBonus = false;
    let opponentBonus = false;
    while (!opponentValid || !candidateValid) {
      if (!opponentValid) opponentValid = validSeven(4);
      if (!candidateValid) candidateValid = validSeven(14);
      if (opponentValid && !candidateValid) opponentBonus = true;
      if (candidateValid && !opponentValid) candidateBonus = true;
    }
    if (candidateBonus) candidateOffered += 1;
    if (opponentBonus) opponentOffered += 1;
    if (candidateBonus && opponentBonus) bothOffered += 1;
  }
  const exact = bilateralBonus(4, 14);
  assert.equal(bothOffered, 0);
  assert.ok(Math.abs(candidateOffered / count - exact.candidateAtLeastOne) < 0.008);
  assert.ok(Math.abs(opponentOffered / count - exact.opponentAtLeastOne) < 0.008);
});

test('bad source rows cannot silently enter the published-field average', () => {
  assert.throws(() => publishedFieldBilateral([], 14), RangeError);
  assert.throws(() => publishedFieldBilateral([{rank: 1, basic_count_known: 4},
    {rank: 1, basic_count_known: 4}], 14), RangeError);
  assert.throws(() => publishedFieldBilateral([{rank: 1, basic_count_known: 0}], 14), RangeError);
  assert.throws(() => bilateralBonus(14, 0), RangeError);
});
