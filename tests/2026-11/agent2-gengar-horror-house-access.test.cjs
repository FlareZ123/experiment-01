'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  analyzeGengarHorrorHouseAccess,
  gengarInOpeningGivenLegalSeven,
} = require('../../scripts/agent2-gengar-horror-house-access.cjs');

test('Gengar opening-hand probability is conditioned on a legal seven', () => {
  assert.deepEqual(gengarInOpeningGivenLegalSeven(), {
    numerator: '1185723',
    denominator: '9315337',
  });
});

test('first-turn attack access under Ability lock allows Fog Crystal search', () => {
  const r = analyzeGengarHorrorHouseAccess({ draws: 1, allowFogCrystal: true });
  assert.deepEqual(r.probability, {
    numerator: '18625942657',
    denominator: '195575500315',
  });
  assert.ok(Math.abs(r.percent - 9.523658447505172) < 1e-12);
});

test('first-turn attack access under Item lock requires Psychic Energy in hand', () => {
  const r = analyzeGengarHorrorHouseAccess({ draws: 1, allowFogCrystal: false });
  assert.deepEqual(r.probability, {
    numerator: '12349477',
    denominator: '176991403',
  });
  assert.ok(Math.abs(r.percent - 6.977444548535502) < 1e-12);
});

test('second-turn access counts two ordered draws without replacement', () => {
  const abilityLock = analyzeGengarHorrorHouseAccess({ draws: 2, allowFogCrystal: true });
  const itemLock = analyzeGengarHorrorHouseAccess({ draws: 2, allowFogCrystal: false });
  assert.deepEqual(abilityLock.probability, {
    numerator: '80851039904',
    denominator: '797346270515',
  });
  assert.deepEqual(itemLock.probability, {
    numerator: '13524007',
    denominator: '176991403',
  });
});

test('Fog Crystal access increases the modeled access rate when Items remain playable', () => {
  const abilityLock = analyzeGengarHorrorHouseAccess({ draws: 1, allowFogCrystal: true });
  const itemLock = analyzeGengarHorrorHouseAccess({ draws: 1, allowFogCrystal: false });
  assert.ok(abilityLock.percent > itemLock.percent);
});

test('unsupported draw counts are rejected', () => {
  assert.throws(() => analyzeGengarHorrorHouseAccess({ draws: 3 }), /draws must be 1 or 2/);
});
