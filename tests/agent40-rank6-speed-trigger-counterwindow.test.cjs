'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  choose, fraction, exactAccess, originalRank6Counts, originalRank6Counterwindow
} = require('../simulation/evaluation/agent40-rank6-speed-trigger-counterwindow.cjs');

test('binomial and reduction arithmetic', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(3, 4), 0n);
  assert.deepEqual(fraction(15n, 35n), { numerator: 3n, denominator: 7n });
});

test('original exact printed rank6 source and zero-bonus baseline', () => {
  assert.deepEqual(originalRank6Counts(), {
    thorns: 4, speed: 4, dce: 1, guzma: 3, other: 48
  });
  assert.deepEqual(originalRank6Counterwindow(0).conditionalValidOpening, {
    numerator: 14277253n, denominator: 6644092455n
  });
});

test('Speed Lightning draw one and two extra cards, exact rational rates', () => {
  assert.deepEqual(originalRank6Counterwindow(1).conditionalValidOpening, {
    numerator: 1316861033n, denominator: 451798286940n
  });
  const full = originalRank6Counterwindow(2);
  assert.deepEqual(full.conditionalValidOpening, {
    numerator: 85318412819n, denominator: 22589914347000n
  });
  assert.deepEqual(full.unconditional, {
    numerator: 85318412819n, denominator: 56545520674500n
  });
  assert(full.conditionalValidOpening.numerator * 6644092455n >
    14277253n * full.conditionalValidOpening.denominator);
});

test('independent ordered physical-card permutation check on tiny toy deck', () => {
  const cards = ['T', 'T', 'T', 'S', 'D', 'G', 'O', 'O'];
  let favorable = 0n;
  let valid = 0n;
  for (let a = 0; a < 8; a += 1) {
    for (let b = 0; b < 8; b += 1) {
      if (a === b) continue;
      for (let c = 0; c < 8; c += 1) {
        if ([a, b].includes(c)) continue;
        for (let d = 0; d < 8; d += 1) {
          if ([a, b, c].includes(d)) continue;
          for (let e = 0; e < 8; e += 1) {
            if ([a, b, c, d].includes(e)) continue;
            const window = [cards[a], cards[b], cards[c]];
            const late = [cards[d], cards[e]];
            const openingValid = cards[a] === 'T' || cards[b] === 'T';
            if (openingValid) valid += 1n;
            if (window.filter(x => x === 'T').length >= 2 &&
                window.includes('S') &&
                [...window, ...late].includes('D') &&
                [...window, ...late].includes('G')) favorable += 1n;
          }
        }
      }
    }
  }
  const counted = exactAccess({ thorns: 3, speed: 1, dce: 1, guzma: 1, other: 2 },
    2, 3, 2);
  assert.deepEqual(counted.conditionalValidOpening, fraction(favorable, valid));
});

test('missing singleton DCE makes window event impossible', () => {
  const p = exactAccess({ thorns: 3, speed: 1, dce: 0, guzma: 1, other: 3 }, 2, 3, 2);
  assert.equal(p.favorableWays, 0n);
  assert.deepEqual(p.unconditional, { numerator: 0n, denominator: 1n });
});
