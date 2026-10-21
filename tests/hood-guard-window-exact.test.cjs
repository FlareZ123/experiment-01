'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {choose, directSight, analyzeHoodGuard} =
  require('../scripts/hood-guard-window-exact.cjs');

test('combinations and impossibility edge cases', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(60, 8), 2558620845n);
  assert.equal(choose(5, 0), 1n);
  assert.equal(choose(5, 6), 0n);
});

test('exhaustive tiny-deck enumeration agrees with exact inclusion-exclusion', () => {
  for (const basics of [1, 2]) {
    for (const guards of [1, 2]) {
      const deckSize = 8;
      const labels = [
        ...Array(basics).fill('basic'),
        ...Array(guards).fill('guard'),
        'hood',
        'stadium',
        ...Array(deckSize - basics - guards - 2).fill('other')
      ];
      let legal = 0;
      let both = 0;
      let all = 0;
      for (let a = 0; a < deckSize; a += 1) {
        for (let b = 0; b < deckSize; b += 1) {
          if (a === b) continue;
          for (let c = 0; c < deckSize; c += 1) {
            if (a === c || b === c) continue;
            const first = [labels[a], labels[b]];
            const seen = [...first, labels[c]];
            if (!first.includes('basic')) continue;
            legal += 1;
            if (seen.includes('guard')) both += 1;
            if (seen.includes('guard') && seen.includes('hood') &&
                seen.includes('stadium')) all += 1;
          }
        }
      }
      const single = directSight({
        deckSize, basics, firstHand: 2, draws: 1, resourceCounts: [guards]
      });
      const triple = directSight({
        deckSize, basics, firstHand: 2, draws: 1, resourceCounts: [guards, 1, 1]
      });
      assert.ok(Math.abs(single.conditional - both / legal) < 1e-12);
      assert.ok(Math.abs(triple.conditional - all / legal) < 1e-12);
    }
  }
});

test('actual fixed-60 count model matches independent rational reference', () => {
  const [one, two] = analyzeHoodGuard();
  assert.ok(Math.abs(one.guardInEight.conditional - 0.12772841963164905) < 1e-12);
  assert.ok(Math.abs(two.guardInEight.conditional - 0.241157606820817) < 1e-12);
  assert.ok(Math.abs(one.guardAndHood.conditional -
    0.02723344064815678) < 1e-12);
  assert.ok(Math.abs(two.guardAndHood.conditional -
    0.051843578685752664) < 1e-12);
  assert.ok(Math.abs(one.guardHoodAndCounterStadium.conditional -
    0.005039529045255781) < 1e-12);
  assert.ok(Math.abs(two.guardHoodAndCounterStadium.conditional -
    0.009677473230005043) < 1e-12);
});

test('zero-opportunity when all resources cannot fit in seen cards', () => {
  const result = directSight({
    deckSize: 8, basics: 1, firstHand: 2, draws: 1,
    resourceCounts: [1, 1, 1]
  });
  assert.equal(result.favorable, 0n);
});
