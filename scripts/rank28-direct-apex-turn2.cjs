'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

/** @typedef {{name: string, count: number}} NamedCard */
/** @typedef {[number, number, number, number, number, number]} GroupCounts */

const OTHER_BASICS = new Set([
  'Budew', 'Dialga-GX', 'Koraidon ex', 'Kyurem', 'Dedenne-GX',
  'Squawkabilly ex', 'Tapu Lele-GX', 'Latias ex', 'Marshadow', 'Wobbuffet',
]);

/** @param {readonly NamedCard[]} cards @returns {GroupCounts} */
function classify(cards) {
  /** @type {GroupCounts} */
  const counts = [0, 0, 0, 0, 0, 0];
  for (const card of cards) {
    const index = card.name === 'Regidrago V' ? 0
      : card.name === 'Regidrago VSTAR' ? 1
        : OTHER_BASICS.has(card.name) ? 2
          : card.name === 'Double Dragon Energy' ? 3
            : card.name === 'Grass Energy' || card.name === 'Fire Energy' ? 4 : 5;
    counts[index] += card.count;
  }
  assert.equal(counts.reduce((a, b) => a + b, 0), 60);
  return counts;
}

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return result;
}

/**
 * Enumerate multivariate-hypergeometric opening sevens exactly.
 * Order: Regidrago V, Regidrago VSTAR, other Basic, Double Dragon,
 * Grass/Fire, everything else.
 * @param {GroupCounts} groups
 * @param {(hand: GroupCounts, weight: bigint) => void} visit
 */
function openingHands(groups, visit) {
  /** @type {GroupCounts} */
  const hand = [0, 0, 0, 0, 0, 0];
  /** @param {number} index @param {number} remaining @param {bigint} weight */
  function enumerate(index, remaining, weight) {
    if (index === 6) {
      if (remaining === 0) visit(hand, weight);
      return;
    }
    for (let count = 0; count <= Math.min(groups[index], remaining); count++) {
      hand[index] = count;
      enumerate(index + 1, remaining - count, weight * choose(groups[index], count));
    }
  }
  enumerate(0, 7, 1n);
}

/**
 * Exact direct-resource event on own second turn, conditional on a Basic-valid
 * opening seven. A Regidrago V and any Energy card must be held by turn one;
 * VSTAR, Double Dragon and a second Energy card must be held by turn two.
 * Both manual Energy attachments are assumed; no searches/draw Abilities.
 * @param {GroupCounts} groups
 */
function analyze(groups) {
  assert.equal(groups.reduce((a, b) => a + b, 0), 60);
  let validSevens = 0n;
  let favorableOrdered = 0n;
  openingHands(groups, (hand, weight) => {
    if (hand[0] + hand[2] === 0) return;
    validSevens += weight;
    for (let first = 0; first < 6; first++) {
      const firstDrawWays = groups[first] - hand[first];
      if (firstDrawWays <= 0) continue;
      const t1 = [...hand];
      t1[first]++;
      if (t1[0] === 0 || t1[3] + t1[4] === 0) continue;
      for (let second = 0; second < 6; second++) {
        const secondDrawWays = groups[second] - t1[second];
        if (secondDrawWays <= 0) continue;
        const t2 = [...t1];
        t2[second]++;
        if (t2[1] === 0 || t2[3] === 0 || t2[3] + t2[4] < 2) continue;
        favorableOrdered += weight * BigInt(firstDrawWays * secondDrawWays);
      }
    }
  });
  const denominator = validSevens * 53n * 52n;
  return {
    groups,
    validSevens: validSevens.toString(),
    favorableOrdered: favorableOrdered.toString(),
    denominator: denominator.toString(),
    conditionalProbability: Number(favorableOrdered) / Number(denominator),
    unconditionalProbability: Number(favorableOrdered) / (Number(choose(60, 7)) * 53 * 52),
    allDoubleDragonPrized: Number(choose(60 - groups[3], 6 - groups[3])) / Number(choose(60, 6)),
  };
}

/** @returns {{publishedRank10: ReturnType<typeof analyze>, photographedCandidate: ReturnType<typeof analyze>}} */
function fromRepository() {
  const field = require(path.resolve(__dirname, '../results/aichi-2026/full-decklists.json'));
  const photo = require(path.resolve(__dirname, '../results/aichi-2026/rank28-replica-visual-60-candidate.json'));
  const rank10 = field.decks.find((deck) => deck.rank === 10);
  const published = classify(rank10.cards.map((card) => ({ name: card.name, count: card.count })));
  const candidate = classify(photo.cards.map((card) => ({ name: card.name, count: card.quantity })));
  assert.deepEqual(published, [4, 3, 11, 4, 6, 32]);
  assert.deepEqual(candidate, [4, 3, 10, 3, 7, 33]);
  return { publishedRank10: analyze(published), photographedCandidate: analyze(candidate) };
}

if (require.main === module) console.log(JSON.stringify(fromRepository(), null, 2));
module.exports = { choose, classify, analyze, fromRepository };
