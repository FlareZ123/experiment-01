'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {criticalPrizeCollapse} =
  require('../scripts/aichi-champion-critical-prize-collapse.cjs');

/** @param {number} n @param {number} k @returns {number[][]} */
function subsets(n, k) {
  /** @type {number[][]} */
  const output = [];
  /** @param {number} start @param {number[]} chosen */
  function search(start, chosen) {
    if (chosen.length === k) {
      output.push(chosen.slice());
      return;
    }
    for (let i = start; i <= n - (k - chosen.length); i++) {
      chosen.push(i);
      search(i + 1, chosen);
      chosen.pop();
    }
  }
  search(0, []);
  return output;
}

/**
 * Fully physical-slot exhaustive oracle independent of prize hypergeometric
 * aggregation. Choose the opening hand, then the six/other Prize positions.
 *
 * @param {number} recoveries
 * @returns {number}
 */
function bruteSmallDeck(recoveries) {
  const deck = [
    'M', 'D', ...Array(recoveries).fill('H'),
    'B', 'B', ...Array(4 - recoveries).fill('N')
  ];
  let bad = 0;
  let valid = 0;
  for (const hand of subsets(deck.length, 2)) {
    if (!hand.some(i => ['M', 'D', 'B'].includes(deck[i]))) continue;
    const remaining = deck.map((_, i) => i).filter(i => !hand.includes(i));
    for (const prizeOffsets of subsets(remaining.length, 2)) {
      const prizes = prizeOffsets.map(i => deck[remaining[i]]);
      const targets = prizes.filter(c => c === 'M' || c === 'D').length;
      const balls = prizes.filter(c => c === 'H').length;
      bad += Number(targets > recoveries - balls);
      valid += 1;
    }
  }
  return bad / valid;
}

test('matches independently enumerated physical-slot deals in tiny decks', () => {
  for (let recoveries = 0; recoveries <= 2; recoveries++) {
    const exact = criticalPrizeCollapse({
      deckSize: 8, openingSize: 2, prizeSize: 2,
      otherBasics: 2, recoveryCopies: recoveries
    });
    assert.ok(Math.abs(exact.probability - bruteSmallDeck(recoveries)) < 1e-14);
  }
});

test('Aichi 60-card conditional results use exact integer fractions', () => {
  const expected = [
    '162938799/868250240',
    '139744719/5904101632',
    '18690899/8515531200',
    '897366297/6119828422400'
  ];
  for (let copies = 0; copies < expected.length; copies++) {
    const result = criticalPrizeCollapse({
      deckSize: 60, openingSize: 7, prizeSize: 6,
      otherBasics: 12, recoveryCopies: copies
    });
    assert.equal(String(result.reducedNumerator) + '/' +
      String(result.reducedDenominator), expected[copies]);
  }
});

test('rejects impossible source configurations', () => {
  assert.throws(() => criticalPrizeCollapse({
    deckSize: 8, openingSize: 5, prizeSize: 4,
    otherBasics: 2, recoveryCopies: 1
  }), /Invalid/);
});
