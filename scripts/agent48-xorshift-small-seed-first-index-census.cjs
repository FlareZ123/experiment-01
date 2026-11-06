'use strict';

const {
  firstUniform, firstIndex
} = require('./agent48-nightwatch-entropy-coupling.cjs');

const VERSION = 'agent48-xorshift-small-seed-first-index-v1';

/**
 * Measure the first xorshift32 random position for a sequential seed family.
 * This is the INITIAL random draw only, before consuming any shuffle or
 * speculative samples, and makes no claim about entire native game streams.
 * @param {number} low Inclusive starting seed.
 * @param {number} high Inclusive ending seed.
 * @param {number} largestHandSize Inclusive maximum hand size.
 * @returns {object}
 */
function censusFirstIndices(low = 1, high = 256, largestHandSize = 60) {
  if (!Number.isInteger(low) || low < 1 ||
      !Number.isInteger(high) || high < low || high > 0xffffffff ||
      high - low >= 4096 ||
      !Number.isInteger(largestHandSize) ||
      largestHandSize < 1 || largestHandSize > 60) {
    throw new RangeError('Invalid sequential seed or hand-size range');
  }
  const seeds = Array.from({ length: high - low + 1 }, (_, i) => low + i);
  const observations = seeds.map(seed => ({
    seed,
    firstUniform: firstUniform(seed),
    positionAtMaxHand: firstIndex(seed, largestHandSize)
  }));
  const positions = new Set(observations.map(row => row.positionAtMaxHand));
  const firstAtLeastOne = observations.find(row => row.positionAtMaxHand !== 0);
  const zeroAcrossEveryHand = observations.every(row =>
    Array.from({ length: largestHandSize }, (_, i) =>
      firstIndex(row.seed, i + 1)).every(position => position === 0));
  return {
    version: VERSION, low, high, largestHandSize,
    seedCount: observations.length,
    minFirstUniform: Math.min(...observations.map(x => x.firstUniform)),
    maxFirstUniform: Math.max(...observations.map(x => x.firstUniform)),
    distinctFirstIndicesAtLargestHand: positions.size,
    firstIndices: [...positions].sort((a, b) => a - b),
    allFirstPositionsZero: zeroAcrossEveryHand,
    firstNonZeroAtLargestHandSeed: firstAtLeastOne?.seed ?? null,
    samples: observations,
    initialSampleOnly: true,
    originalGameRandomStreamsReplayed: false,
    competitivelyQualifiedGames: 0
  };
}

if (require.main === module) {
  const a = censusFirstIndices();
  const b = censusFirstIndices(257, 512);
  process.stdout.write(JSON.stringify({
    version: VERSION,
    first256: {
      seeds: [a.low, a.high],
      firstUniformRange: [a.minFirstUniform, a.maxFirstUniform],
      allFirstPositionsZero: a.allFirstPositionsZero,
      firstIndicesAt60: a.firstIndices
    },
    next256: {
      seeds: [b.low, b.high],
      firstIndicesAt60: b.firstIndices,
      firstNonZeroAt60Seed: b.firstNonZeroAtLargestHandSeed
    },
    note: 'These are first-sample index audits, not match outcomes.',
    qualifiedGames: 0
  }) + '\n');
}

module.exports = { VERSION, censusFirstIndices };
