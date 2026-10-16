'use strict';

const { deriveSlotSeeds } = require('./aichi-decorrelated-seeds.cjs');
const { seededRandom, deckPermutation } = require('../simulation/twinleaf/headless.cjs');

/**
 * Assess matched-index RNG bits and 60-distinguishable-card shuffled orders.
 * This is an algorithmic sampler, not a game simulation.
 * @param {number} seedA
 * @param {number} seedB
 * @returns {{alignedFirstCoinSame:boolean,matchingPositions:number,openingOverlap:number}}
 */
function comparePair(seedA, seedB) {
  const alignedFirstCoinSame =
    (seededRandom(seedA)() < 0.5) === (seededRandom(seedB)() < 0.5);
  const a = deckPermutation(60, seededRandom(seedA));
  const b = deckPermutation(60, seededRandom(seedB));
  let matchingPositions = 0;
  const openingA = new Set(a.slice(0, 7));
  let openingOverlap = 0;
  for (let i = 0; i < 60; i += 1) {
    if (a[i] === b[i]) matchingPositions += 1;
    if (i < 7 && openingA.has(b[i])) openingOverlap += 1;
  }
  return { alignedFirstCoinSame, matchingPositions, openingOverlap };
}

/**
 * Evaluate two phase-separated Aichi seed protocols on the exact same
 * rank/repeat grid, excluding card identities and all game outcomes.
 *
 * @param {{seedBase?:number,highestRank?:number,repeats?:number}} [options]
 * @returns {object}
 */
function auditV3SeedDistribution(options = {}) {
  const {seedBase = 20261016, highestRank = 32, repeats = 100} = options;
  if (!Number.isSafeInteger(seedBase) || seedBase < 0 ||
      seedBase + 300000 + 32 * 1024 + 2 * repeats > 0xffffffff ||
      !Number.isInteger(highestRank) || highestRank < 1 || highestRank > 32 ||
      !Number.isInteger(repeats) || repeats < 1 || repeats > 100) {
    throw new RangeError('Invalid bounded seed audit grid');
  }
  const sums = {
    v2: {agree:0, matchingPositions:0, openingOverlap:0},
    v3: {agree:0, matchingPositions:0, openingOverlap:0}
  };
  const v3Seen = new Set();
  let pairs = 0;
  for (const phase of ['pilot', 'published-field']) {
    const offset = phase === 'pilot' ? 100000 : 200000;
    for (let rank = 1; rank <= highestRank; rank += 1) {
      for (let repeat = 0; repeat < repeats; repeat += 1) {
        const a = seedBase + offset + rank * 1024 + 2 * repeat;
        const v2 = {A:a, B:a+1};
        const v3 = deriveSlotSeeds(seedBase, phase, rank, repeat);
        if (!v3.A || !v3.B || v3.A === v3.B) {
          throw new Error('v3 produced equal or zero paired seeds');
        }
        v3Seen.add(v3.A);
        v3Seen.add(v3.B);
        for (const [protocol, seeds] of [['v2', v2], ['v3', v3]]) {
          const result = comparePair(seeds.A, seeds.B);
          sums[protocol].agree += Number(result.alignedFirstCoinSame);
          sums[protocol].matchingPositions += result.matchingPositions;
          sums[protocol].openingOverlap += result.openingOverlap;
        }
        pairs += 1;
      }
    }
  }
  /** @param {{agree:number,matchingPositions:number,openingOverlap:number}} sum */
  const average = sum => ({
    alignedFirstCoinAgreement: sum.agree / pairs,
    meanMatchingPositions: sum.matchingPositions / pairs,
    meanOpeningSevenOverlap: sum.openingOverlap / pairs
  });
  return {
    evidenceType: 'aichi-v2-v3-seed-shuffle-only-v1',
    seedBase, highestRank, repeats, pairs,
    protocolV2: average(sums.v2),
    protocolV3: average(sums.v3),
    uniqueNonzeroV3Seeds: v3Seen.size,
    independentPermutationReference: {
      alignedFirstCoinAgreement: 0.5,
      meanMatchingPositions: 1,
      meanOpeningSevenOverlap: 49 / 60
    },
    caveat: 'Only aligned RNG draws and 60-distinguishable-index permutations are compared. Real game RNG calls and repeated card names differ; this is not game outcome independence or a win-rate result.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(auditV3SeedDistribution(), null, 2) + '\n');
}
module.exports = { comparePair, auditV3SeedDistribution };
