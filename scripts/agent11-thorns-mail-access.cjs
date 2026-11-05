'use strict';

const assert = require('node:assert/strict');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  const minimum = Math.min(k, n - k);
  for (let i = 1; i <= minimum; i++) {
    v = v * BigInt(n - minimum + i) / BigInt(i);
  }
  return v;
}

/** @param {number[]} counts @param {number} draw @returns {Generator<number[]>} */
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
 * Strict first-second-player-turn Thunder Mountain+DCE search route.
 *
 * Categories: Basic (all four Thorns); Guzma & Hala; Tag Call;
 * Thunder Mountain; Double Colorless; Trainers' Mail; all others.
 * Simulate a uniformly shuffled starting seven, six Prizes, one turn draw.
 * In successful direct states, search both deck-held resources with the
 * held TAG TEAM connector. In new states, play held Trainers' Mail copies
 * sequentially until the first G&H or Tag Call appears in its top four.
 * If none appears, decline selection, shuffle all four back, try next Mail.
 * This is a bounded, source-named search policy, not all legal lines.
 *
 * No mulligan compensation, opponent effects, other draw/search effects,
 * strategic cost of discards, or game-result estimation.
 * @param {number[]} counts Exactly seven disjoint category counts.
 * @param {number} [handSize=7]
 * @param {number} [prizeSize=6]
 */
function countStrictMailRoute(counts, handSize = 7, prizeSize = 6) {
  assert.equal(counts.length, 7);
  assert.ok(counts.every(n => Number.isSafeInteger(n) && n >= 0));
  const total = counts.reduce((a, b) => a + b, 0);
  assert.ok(total > handSize + prizeSize && handSize > 0 && prizeSize >= 0);
  const initialDrawPool = total - handSize - prizeSize;
  const remainingDeck = initialDrawPool - 1;
  const sampleSize = Math.min(4, remainingDeck);
  const sampleComb = choose(remainingDeck, sampleSize);
  const scale = sampleComb ** BigInt(counts[5]);
  const legalHands = choose(total, handSize) - choose(total - counts[0], handSize);
  const denominator = legalHands * choose(total - handSize, prizeSize) *
    BigInt(initialDrawPool);
  let direct = 0n;
  let broader = 0n;
  let extraScaled = 0n;
  for (const hand7 of allocations(counts, handSize)) {
    if (hand7[0] === 0) continue;
    const handWays = hand7.reduce((v, n, j) => v * choose(counts[j], n), 1n);
    const beforePrizes = counts.map((n, j) => n - hand7[j]);
    for (const prizes of allocations(beforePrizes, prizeSize)) {
      const postPrizes = beforePrizes.map((n, j) => n - prizes[j]);
      const prizeWays = prizes.reduce((v, n, j) =>
        v * choose(beforePrizes[j], n), 1n);
      const pairWays = handWays * prizeWays;
      for (let drawn = 0; drawn < 7; drawn++) {
        if (!postPrizes[drawn]) continue;
        const hand8 = hand7.map((n, j) => n + Number(j === drawn));
        const deck = postPrizes.map((n, j) => n - Number(j === drawn));
        const ways = pairWays * BigInt(postPrizes[drawn]);
        const hasConnector = hand8[1] > 0 ||
          (hand8[2] > 0 && deck[1] > 0);
        if ((hand8[3] > 0 || (hasConnector && deck[3] > 0)) &&
            (hand8[4] > 0 || (hasConnector && deck[4] > 0)))
          broader += ways;
        if (deck[3] === 0 || deck[4] === 0) continue;
        if (hasConnector) {
          direct += ways;
          continue;
        }
        const mailHeld = hand8[5];
        if (mailHeld === 0 || deck[1] === 0) continue;
        const eligible = deck[1] + deck[2];
        const miss = choose(remainingDeck - eligible, sampleSize);
        const successes = sampleComb ** BigInt(mailHeld) -
          miss ** BigInt(mailHeld);
        extraScaled += ways * successes *
          sampleComb ** BigInt(counts[5] - mailHeld);
      }
    }
  }
  const scaledDenominator = denominator * scale;
  const favorableScaled = direct * scale + extraScaled;
  return {
    direct,
    broader,
    denominator,
    extraScaled,
    favorableScaled,
    scaledDenominator,
    directProbability: Number(direct) / Number(denominator),
    broaderProbability: Number(broader) / Number(denominator),
    mailIncrementProbability: Number(extraScaled) / Number(scaledDenominator),
    totalProbability: Number(favorableScaled) / Number(scaledDenominator),
    broaderWithMailProbability:
      Number(broader * scale + extraScaled) / Number(scaledDenominator)
  };
}

/** @param {object} deck */
function sourceCounts(deck) {
  assert.equal(deck.cards.reduce((n, c) => n + c.count, 0), 60);
  const specifications = [
    ['Iron Thorns ex', 'TWM', '77'],
    ['Guzma & Hala', 'CEC', '193'],
    ['Tag Call', 'CEC', '206'],
    ['Thunder Mountain ♢', 'LOT', '191'],
    ['Double Colorless Energy', 'SUM', '136'],
    ["Trainers' Mail", 'ROS', '92']
  ];
  const counts = specifications.map(([name, set, number]) =>
    deck.cards.filter(c => c.name === name && c.printing.set === set &&
      c.printing.number === number).reduce((s, c) => s + c.count, 0));
  assert.deepEqual(counts.slice(0, 4), [4, 2, 2, 1]);
  assert.ok([1, 3].includes(counts[4]));
  assert.ok([2, 3, 4].includes(counts[5]));
  assert.equal(deck.cards.filter(c => c.category === 'Pokémon')
    .reduce((s, c) => s + c.count, 0), 4);
  return [...counts, 60 - counts.reduce((a, b) => a + b, 0)];
}

module.exports = { choose, allocations, countStrictMailRoute, sourceCounts };
