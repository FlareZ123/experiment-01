'use strict';

const { createHash } = require('node:crypto');

const VERSION = 'agent48-nightwatch-entropy-coupling-v1';
const HISTORICAL_ADJACENT_SEEDS = Object.freeze([20261106, 20261107, 20261108, 20261109]);

/**
 * Independent first-draw oracle for the pinned headless.seededRandom xorshift32.
 * This mirrors only its first uniform variate, not a replacement match RNG.
 * @param {number} seed Unsigned integer state.
 * @returns {number}
 */
function firstUniform(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 0x100000000;
}

/**
 * @param {number} seed
 * @param {number} handSize
 * @returns {number} First physical hand position selected uniformly by index.
 */
function firstIndex(seed, handSize) {
  if (!Number.isInteger(handSize) || handSize < 1 || handSize > 60) {
    throw new RangeError('Expected legal hand size between 1 and 60');
  }
  return Math.floor(firstUniform(seed) * handSize);
}

/**
 * Produce reproducible, SHA-256 domain-separated diagnostic xorshift seeds.
 * This fixes predictable adjacent-seed coupling; it does not prove stochastic
 * independence, paper correctness, or sample representativeness.
 * @param {number} sourceSeed Frozen physical deal seed.
 * @param {0|1} sourceSeat Source physical seat.
 * @param {number} count Distinct diagnostic arms.
 * @returns {number[]}
 */
function deriveSeparatedEntropySeeds(sourceSeed, sourceSeat, count = 4) {
  if (!Number.isInteger(sourceSeed) || sourceSeed < 0 ||
      sourceSeed > 0xffffffff || (sourceSeat !== 0 && sourceSeat !== 1) ||
      !Number.isInteger(count) || count < 1 || count > 64) {
    throw new RangeError('Invalid registered entropy seed identity');
  }
  const result = [];
  const seen = new Set();
  for (let arm = 0; arm < count; arm++) {
    let nonce = 0;
    let value;
    do {
      const domain = JSON.stringify([
        'agent48-nightwatch-entropy-v1', sourceSeed, sourceSeat, arm, nonce++
      ]);
      value = createHash('sha256').update(domain).digest().readUInt32LE(0);
    } while (value === 0 || seen.has(value));
    seen.add(value);
    result.push(value);
  }
  return result;
}

/**
 * Inspect physical-position collision across every possible 1..60-card hand.
 * @param {number[]} seeds
 * @returns {object}
 */
function auditFirstPositions(seeds) {
  const rows = [];
  for (let handSize = 1; handSize <= 60; handSize++) {
    const indices = seeds.map(seed => firstIndex(seed, handSize));
    rows.push({ handSize, indices, allEqual: new Set(indices).size === 1 });
  }
  return {
    arms: seeds.length,
    commonFirstPositionHandSizes: rows.filter(row => row.allEqual).length,
    allCommonHandSizes: rows.filter(row => row.allEqual).map(row => row.handSize),
    hand29FirstPositions: rows[28].indices,
    firstUniforms: seeds.map(firstUniform),
    hypothesisOnly: true
  };
}

if (require.main === module) {
  const proposed = deriveSeparatedEntropySeeds(3792360798, 0, 4);
  process.stdout.write(JSON.stringify({
    version: VERSION,
    original: { seeds: HISTORICAL_ADJACENT_SEEDS,
      audit: auditFirstPositions(HISTORICAL_ADJACENT_SEEDS) },
    proposed: { seeds: proposed, audit: auditFirstPositions(proposed) },
    testedNativeGames: 0,
    competitivelyQualifiedGames: 0
  }, null, 2) + '\n');
}

module.exports = {
  VERSION, HISTORICAL_ADJACENT_SEEDS, firstUniform, firstIndex,
  deriveSeparatedEntropySeeds, auditFirstPositions
};
