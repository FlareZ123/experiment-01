'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { duel } = require('../scripts/absol-gardevoir-duel.cjs');

test('Mega Absol attacks first: Guard only suffices without Muscle Band', () => {
  assert.equal(duel({ guard: false, muscleBand: false, absolFirst: true }).winner, 'Absol');
  const shielded = duel({ guard: true, muscleBand: false, absolFirst: true });
  assert.equal(shielded.winner, 'Gardevoir');
  assert.equal(shielded.trace.at(-1).gardevoirDamage, 260);
  assert.equal(duel({ guard: true, muscleBand: true, absolFirst: true }).winner, 'Absol');
});

test('Gardevoir attacks first: the second Max Cure KOs Absol', () => {
  for (const guard of [true, false]) {
    for (const muscleBand of [true, false]) {
      const outcome = duel({ guard, muscleBand, absolFirst: false });
      assert.equal(outcome.winner, 'Gardevoir');
      assert.equal(outcome.trace.length, 3);
    }
  }
});
