'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  loneBasicProbability, offeredAtLeast, noExtraBasic, soloAfterBonus, assess,
} = require('../scripts/aichi_solo_start.cjs');
const { mulliganProbability } = require('../scripts/aichi_opening_audit.cjs');

test('conditional exact-one-Basic probabilities match independent hypergeometric values', () => {
  assert.ok(Math.abs(loneBasicProbability(14) - 0.3941763347511427) < 1e-12);
  assert.ok(Math.abs(loneBasicProbability(4) - 0.8417535034135825) < 1e-12);
});

test('simultaneous mulligan tail probabilities and zero-bonus limit', () => {
  const pA = mulliganProbability(12);
  const pB = mulliganProbability(14);
  assert.ok(Math.abs(offeredAtLeast(pA, pB, 1) - (1-pB)*pA/(1-pA*pB)) < 1e-12);
  assert.equal(offeredAtLeast(0, pB, 1), 0);
});

test('without-replacement extra cards cannot introduce other Basics when deck has one', () => {
  assert.equal(noExtraBasic(1, 47), 1);
  assert.equal(noExtraBasic(14, 0), 1);
  assert.equal(noExtraBasic(14, 41), 0);
  assert.throws(() => noExtraBasic(14, 48), /outside draw capacity/);
});

test('rank-26 Meloetta bonus cards lower champion single-Basic exposure', () => {
  assert.ok(Math.abs(soloAfterBonus(14, 12) - 0.3750679602308215) < 1e-12);
  assert.ok(Math.abs(soloAfterBonus(4, 12) - 0.836735777720661) < 1e-12);
  assert.ok(soloAfterBonus(14, 12) < loneBasicProbability(14));
});

test('opponent rank is excluded from 29-placement structural table', () => {
  const rows = [
    {rank: 26, archetype: 'Meloetta Donk', basicCount: 12},
    {rank: 1, archetype: 'Shadow Rider', basicCount: 14},
  ];
  const result = assess(rows, 26);
  assert.equal(result.length, 1);
  assert.equal(result[0].rank, 1);
  assert.throws(() => assess(rows, 99), /Missing opponent rank/);
});
