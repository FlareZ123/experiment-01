'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    v = v * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return v;
}

/**
 * All bounded category allocations of an unordered draw.
 * @param {number[]} counts
 * @param {number} draw
 * @returns {Generator<number[]>}
 */
function* allocations(counts, draw) {
  if (counts.length === 1) {
    if (draw >= 0 && draw <= counts[0]) yield [draw];
    return;
  }
  for (let i = 0; i <= Math.min(counts[0], draw); i++) {
    for (const suffix of allocations(counts.slice(1), draw - i)) {
      yield [i, ...suffix];
    }
  }
}

/**
 * Exact no-bonus physical line count. Six disjoint categories, in order:
 * Iron Thorns ex Basic; Guzma & Hala; Tag Call; Thunder Mountain Prism Star;
 * Double Colorless Energy; all remaining cards.
 * Setup: 7 opening cards, then 6 Prizes, then first ordinary draw.
 * Successful subset deliberately requires Mountain AND DCE remain in deck,
 * plus held Guzma & Hala or held Tag Call with a deck-resident Guzma & Hala.
 * Also count the broader same-connector event when Mountain/DCE may be held.
 * Neither is a demonstrated attack or competitive game win.
 * @param {number[]} counts Six exact nonnegative category counts
 * @param {number} handSize Opening hand size
 * @param {number} prizeSize Face-down Prize cards
 * @returns {{favorable: bigint, broader: bigint, denominator: bigint, probability: number, broaderProbability: number}}
 */
function countSourceAttackLine(counts, handSize = 7, prizeSize = 6) {
  assert.equal(counts.length, 6);
  assert.ok(counts.every(n => Number.isSafeInteger(n) && n >= 0));
  const total = counts.reduce((a, b) => a + b, 0);
  assert.ok(handSize >= 1 && prizeSize >= 0 && total > handSize + prizeSize);
  const drawPool = total - handSize - prizeSize;
  let favorable = 0n;
  let broader = 0n;
  const legalHands = choose(total, handSize) - choose(total - counts[0], handSize);
  const denominator = legalHands * choose(total - handSize, prizeSize) * BigInt(drawPool);
  for (const hand7 of allocations(counts, handSize)) {
    if (hand7[0] === 0) continue;
    const handWays = hand7.reduce((ways, n, i) => ways * choose(counts[i], n), 1n);
    const beforePrizes = counts.map((n, i) => n - hand7[i]);
    for (const prizes of allocations(beforePrizes, prizeSize)) {
      const afterPrizes = beforePrizes.map((n, i) => n - prizes[i]);
      const prizeWays = prizes.reduce((ways, n, i) => ways * choose(beforePrizes[i], n), 1n);
      for (let draw = 0; draw < counts.length; draw++) {
        if (!afterPrizes[draw]) continue;
        const hand8 = hand7.map((n, i) => n + Number(i === draw));
        const inDeck = afterPrizes.map((n, i) => n - Number(i === draw));
        const canSearch = hand8[1] > 0 || (hand8[2] > 0 && inDeck[1] > 0);
        const ways = handWays * prizeWays * BigInt(afterPrizes[draw]);
        if (canSearch && inDeck[3] > 0 && inDeck[4] > 0) favorable += ways;
        if ((hand8[3] > 0 || (canSearch && inDeck[3] > 0)) &&
          (hand8[4] > 0 || (canSearch && inDeck[4] > 0))) broader += ways;
      }
    }
  }
  return { favorable, broader, denominator,
    probability: Number(favorable) / Number(denominator),
    broaderProbability: Number(broader) / Number(denominator) };
}

/** @param {object} deck @returns {number[]} */
function countsForOriginal(deck) {
  assert.equal(deck.cards.reduce((n, c) => n + c.count, 0), 60);
  const categories = [
    ['Iron Thorns ex', 'TWM', '77'],
    ['Guzma & Hala', 'CEC', '193'],
    ['Tag Call', 'CEC', '206'],
    ['Thunder Mountain ♢', 'LOT', '191'],
    ['Double Colorless Energy', 'SUM', '136']
  ];
  const counts = categories.map(([name, set, number]) =>
    deck.cards.filter(c => c.name === name && c.printing.set === set &&
      c.printing.number === number).reduce((n, c) => n + c.count, 0));
  assert.deepEqual(counts.slice(0, 4), [4, 2, 2, 1]);
  assert.ok(counts[4] === 1 || counts[4] === 3);
  assert.equal(deck.cards.filter(c => c.category === 'Pokémon')
    .reduce((n, c) => n + c.count, 0), 4);
  return [...counts, 60 - counts.reduce((a, b) => a + b, 0)];
}

function main() {
  const file = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const field = JSON.parse(fs.readFileSync(file, 'utf8'));
  const results = [6, 24, 29].map(rank => {
    const deck = field.decks.find(d => d.rank === rank);
    assert.ok(deck, 'Missing original rank ' + rank);
    const counts = countsForOriginal(deck);
    const output = countSourceAttackLine(counts);
    return {
      rank, player: deck.player, counts,
      favorable: output.favorable.toString(),
      denominator: output.denominator.toString(),
      conditionalProbability: output.probability,
      conditionalPercent: 100 * output.probability,
      broader: output.broader.toString(),
      broaderProbability: output.broaderProbability,
      broaderPercent: 100 * output.broaderProbability
    };
  });
  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { choose, allocations, countSourceAttackLine, countsForOriginal };
