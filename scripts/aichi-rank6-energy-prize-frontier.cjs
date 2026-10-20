'use strict';

const assert = require('node:assert/strict');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= k; i++) {
    value = value * BigInt(n - k + i) / BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator @returns {{numerator:string,denominator:string,probability:number}} */
function fraction(numerator, denominator) {
  assert.ok(denominator > 0n);
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor, d = denominator / divisor;
  return {numerator: String(n), denominator: String(d), probability: Number(n) / Number(d)};
}

/**
 * Exact rank-6 Aichi paper Expanded Prize-only energy cost feasibility.
 * Deliberately excludes attachment timing, search access, opponent effects,
 * Stadium replacement and future discard/Prize recovery.
 * @param {object} sourceRank6 Original published 60-card source row.
 * @returns {object} Exact conditional and unconditional fractions.
 */
function rank6PrizeEnergyFeasibility(sourceRank6) {
  assert.equal(sourceRank6.rank, 6);
  assert.equal(sourceRank6.cards.reduce((n, card) => n + card.count, 0), 60);
  const count = name => sourceRank6.cards
    .filter(card => card.name === name)
    .reduce((total, card) => total + card.count, 0);
  assert.equal(count('Iron Thorns ex'), 4);
  assert.equal(sourceRank6.cards.filter(card => card.category === 'Pokémon')
    .reduce((total, card) => total + card.count, 0), 4);
  assert.equal(count('Thunder Mountain ♢'), 1);
  assert.equal(count('Double Colorless Energy'), 1);
  assert.equal(count('Speed Lightning Energy'), 4);
  assert.equal(count('Capture Energy'), 2);
  assert.equal(count('Spiky Energy'), 1);
  assert.equal(sourceRank6.cards.filter(card => card.category === 'Energy')
    .reduce((total, card) => total + card.count, 0), 8);

  // Categories: Thunder 1, DCE 1, Lightning singles 4,
  // Colorless singles 3, sole Basic 4, other cards 47.
  let totalPrizeSets = 0n, validOpenerPairs = 0n;
  let failedPrizeSets = 0n, failedValidPairs = 0n, dcePrizedValidPairs = 0n;
  const totalHandsAfterPrize = choose(54, 7);
  for (let thunder = 0; thunder <= 1; thunder++) {
    for (let dce = 0; dce <= 1; dce++) {
      for (let lightning = 0; lightning <= 4; lightning++) {
        for (let colorless = 0; colorless <= 3; colorless++) {
          for (let basics = 0; basics <= 4; basics++) {
            const filler = 6 - thunder - dce - lightning - colorless - basics;
            const ways = choose(1, thunder) * choose(1, dce) *
              choose(4, lightning) * choose(3, colorless) *
              choose(4, basics) * choose(47, filler);
            if (ways === 0n) continue;
            const validHands = totalHandsAfterPrize - choose(50 + basics, 7);
            const weighted = ways * validHands;
            totalPrizeSets += ways;
            validOpenerPairs += weighted;
            if (dce === 1) dcePrizedValidPairs += weighted;

            const singles = 7 - lightning - colorless;
            const hasDce = dce === 0;
            const feasible = thunder === 0 ?
              (hasDce || singles >= 2) :
              (lightning < 4 && (hasDce || singles >= 3));
            if (!feasible) {
              failedPrizeSets += ways;
              failedValidPairs += weighted;
              assert.equal(thunder, 1);
              assert.equal(lightning, 4);
            }
          }
        }
      }
    }
  }
  assert.equal(totalPrizeSets, choose(60, 6));
  assert.equal(validOpenerPairs,
    (choose(60, 7) - choose(56, 7)) * choose(53, 6));
  assert.equal(failedPrizeSets, 55n);
  return {
    model: 'rank6-prize-only-multi-turn-energy-potential-v1',
    totalPrizeSets: String(totalPrizeSets),
    nonrecoverableEnergyCostUnconditional:
      fraction(failedPrizeSets, totalPrizeSets),
    nonrecoverableEnergyCostGivenValidOpening:
      fraction(failedValidPairs, validOpenerPairs),
    dcePrizedGivenValidOpening:
      fraction(dcePrizedValidPairs, validOpenerPairs),
    excluded: 'Does not certify actual draw/search, attachment timing, Stadium access, discard and Prize recovery, damage or competitive outcomes.'
  };
}

module.exports = {choose, fraction, rank6PrizeEnergyFeasibility};
if (require.main === module) {
  const {decks} = require('../results/aichi-2026/full-decklists.json');
  const rank6 = decks.find(row => row.rank === 6);
  process.stdout.write(JSON.stringify(rank6PrizeEnergyFeasibility(rank6), null, 2) + '\n');
}
