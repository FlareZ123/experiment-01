'use strict';

const assert = require('node:assert/strict');

/**
 * Count k-element subsets exactly.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    value = value * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return value;
}

/**
 * Exactly count legal 7-card starters that see one of every selected
 * resource category within the first eight cards, using inclusion-exclusion.
 *
 * A "legal starter" means only >= 1 Basic Pokémon in the initial 7. This
 * is a pure direct-sighting model: one turn draw, no search, extra draws,
 * prizes accessed, mulligan rewards, decision policy, or actual card plays.
 *
 * @param {{deckSize:number,basics:number,firstHand:number,draws:number,resourceCounts:number[]}} p
 * @returns {{favorable:bigint,denominator:bigint,conditional:number,unconditional:number}}
 */
function directSight(p) {
  const {deckSize, basics, firstHand, draws, resourceCounts} = p;
  assert.equal(draws, 1, 'Only exactly one subsequent draw is modelled');
  assert.ok(resourceCounts.every(c => Number.isInteger(c) && c > 0));
  assert.ok(resourceCounts.reduce((sum, c) => sum + c, basics) <= deckSize);
  const seen = firstHand + draws;
  const full = choose(deckSize, firstHand) * BigInt(deckSize - firstHand);
  let favorable = 0n;
  for (let mask = 0; mask < (1 << resourceCounts.length); mask += 1) {
    let excluded = 0;
    let parity = 1n;
    for (let i = 0; i < resourceCounts.length; i += 1) {
      if (mask & (1 << i)) {
        excluded += resourceCounts[i];
        parity = -parity;
      }
    }
    // C(deck-excluded, seen) / C(deck, seen) rewritten over the
    // first-7-plus-one-draw common denominator.
    const noneResources = BigInt(seen) * choose(deckSize - excluded, seen);
    const noBasicAndNoneResources =
      BigInt(deckSize - firstHand - excluded) *
      choose(deckSize - basics - excluded, firstHand);
    favorable += parity * (noneResources - noBasicAndNoneResources);
  }
  const validSeven = choose(deckSize, firstHand) - choose(deckSize - basics, firstHand);
  const denominator = validSeven * BigInt(deckSize - firstHand);
  assert.ok(favorable >= 0n && favorable <= denominator);
  return {
    favorable,
    denominator,
    conditional: Number(favorable) / Number(denominator),
    unconditional: Number(favorable) / Number(full)
  };
}

/**
 * Analyze the frozen Hood Shield v1 inventory with one or two
 * Weakness Guard Energy hypothetically replacing Basic Psychic.
 * @returns {object[]}
 */
function analyzeHoodGuard() {
  return [1, 2].map(guardCount => ({
    guardCount,
    guardInEight: directSight({
      deckSize: 60, basics: 14, firstHand: 7, draws: 1,
      resourceCounts: [guardCount]
    }),
    guardAndHood: directSight({
      deckSize: 60, basics: 14, firstHand: 7, draws: 1,
      resourceCounts: [guardCount, 2]
    }),
    guardHoodAndCounterStadium: directSight({
      deckSize: 60, basics: 14, firstHand: 7, draws: 1,
      resourceCounts: [guardCount, 2, 2]
    })
  }));
}

if (require.main === module) {
  console.log(JSON.stringify(analyzeHoodGuard(), (_, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
}
module.exports = {choose, directSight, analyzeHoodGuard};
