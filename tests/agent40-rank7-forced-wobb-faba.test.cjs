'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  choose, countVisibleResources, ORIGINAL_RANK7, ORIGINAL_RANK10
} = require('../simulation/evaluation/agent40-rank7-forced-wobb-faba-window.cjs');

test('exact original rank7 forced Wobbuffet and naturally seen Faba resource counts', () => {
  const r = countVisibleResources(ORIGINAL_RANK7);
  assert.equal(r.legal, 430732274544n);
  assert.equal(r.forced, 58077226584n);
  assert.equal(r.forcedFabaOpening, 13463230872n);
  assert.equal(r.forcedFabaSeen, 16797948984n);
  assert.equal(r.available, 167869453752n);
  assert.equal(r.availableFabaSeen, 43242840927n);
  assert.equal(r.optionalNonWobbActiveFabaSeen, 26444891943n);
  assert.equal(r.availableFabaSeen,
    r.forcedFabaSeen + r.optionalNonWobbActiveFabaSeen);
});

test('original rank10 Wobbuffet one-copy Faba one-copy field counterpart', () => {
  const r = countVisibleResources(ORIGINAL_RANK10);
  assert.equal(r.legal, 469660019400n);
  assert.equal(r.forcedFabaSeen, 1863589728n);
  assert.equal(r.availableFabaSeen, 8418874464n);
  assert.equal(r.availableFabaSeen,
    r.forcedFabaSeen + r.optionalNonWobbActiveFabaSeen);
});

test('generalized exact count agrees with exhaustive physical-deal toy enumeration', () => {
  const toy = ['W', 'B', 'F', 'X', 'X', 'X'];
  const raw = {
    legal: 0n, forced: 0n, forcedFabaOpening: 0n,
    forcedFabaSeen: 0n, available: 0n, availableFabaSeen: 0n,
    optionalNonWobbActiveFabaSeen: 0n
  };
  for (let a = 0; a < toy.length; a++) {
    for (let b = a + 1; b < toy.length; b++) {
      for (let d = 0; d < toy.length; d++) {
        if (d === a || d === b) continue;
        const hand = [toy[a], toy[b]];
        const seen = [...hand, toy[d]];
        const legal = hand.includes('W') || hand.includes('B');
        const forced = hand.includes('W') && !hand.includes('B');
        const available = hand.includes('W');
        const fabaOpening = hand.includes('F');
        const fabaSeen = seen.includes('F');
        if (legal) raw.legal++;
        if (forced) raw.forced++;
        if (forced && fabaOpening) raw.forcedFabaOpening++;
        if (forced && fabaSeen) raw.forcedFabaSeen++;
        if (available) raw.available++;
        if (available && fabaSeen) raw.availableFabaSeen++;
        if (available && !forced && fabaSeen) {
          raw.optionalNonWobbActiveFabaSeen++;
        }
      }
    }
  }
  const exact = countVisibleResources({
    total: toy.length, wobbuffet: 1,
    otherBasics: 1, faba: 1, opening: 2, draws: 1
  });
  assert.deepEqual(exact, raw);
});

test('binomial coefficient base cases, symmetry and out-of-range selectors', () => {
  assert.equal(choose(60, 0), 1n);
  assert.equal(choose(5, 2), 10n);
  assert.equal(choose(5, 3), 10n);
  assert.equal(choose(5, 6), 0n);
  assert.equal(choose(5, -1), 0n);
});
