'use strict';

const { deriveSlotSeeds } = require('./aichi-decorrelated-seeds.cjs');
const { auditAlignment, alignToReference } =
  require('./aichi-position-coupling.cjs');

/**
 * Exact translation of the seeded xorshift32/Fisher-Yates index shuffle in
 * simulation/twinleaf/headless.cjs. This omits game setup and mulligan calls.
 * @param {number} seed
 * @returns {number[]}
 */
function shuffledIndices(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  const order = Array.from({length: 60}, (_, i) => i);
  for (let i = 59; i > 0; i -= 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = Math.floor((state >>> 0) / 0x100000000 * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Check printed-index matching for same-permutation hypothetical card deals.
 * The frozen same-seed schedule intentionally reuses each physical-slot seed
 * across every candidate variant. None of these are actual engine matches.
 *
 * @param {string[][]} variants Three source-ordered 60-card print arrays.
 * @param {{seedBase?:number,rankCount?:number,repeats?:number}} [options]
 * @returns {object}
 */
function sweepPositionalCoupling(variants, options = {}) {
  if (!Array.isArray(variants) || variants.length !== 3) {
    throw new TypeError('Expected exactly three printing arrays');
  }
  for (let i = 1; i < 3; i += 1) auditAlignment(variants[0], variants[i]);
  const {seedBase = 20261016, rankCount = 32, repeats = 100} = options;
  if (!Number.isInteger(rankCount) || rankCount < 1 || rankCount > 32 ||
      !Number.isInteger(repeats) || repeats < 1 || repeats > 100) {
    throw new RangeError('Invalid sweep dimensions');
  }
  const aligned = [variants[0],
    alignToReference(variants[0], variants[1])];
  aligned.push(alignToReference(variants[0], variants[2], aligned[1]));
  const pairs = [[0, 1], [0, 2], [1, 2]];
  const expected = pairs.map(([a, b]) => ({
    source: auditAlignment(variants[a], variants[b]),
    aligned: auditAlignment(aligned[a], aligned[b])
  }));
  const rawCounts = [0, 0, 0];
  const alignedCounts = [0, 0, 0];
  let seedsExamined = 0;
  for (const phase of ['pilot', 'published-field']) {
    for (let rank = 1; rank <= rankCount; rank += 1) {
      for (let repeat = 0; repeat < repeats; repeat += 1) {
        const seeds = deriveSlotSeeds(seedBase, phase, rank, repeat);
        for (const slot of ['A', 'B']) {
          const chosen = shuffledIndices(seeds[slot]).slice(0, 7);
          for (let i = 0; i < 3; i += 1) {
            const [a, b] = pairs[i];
            if (chosen.every(index =>
              variants[a][index] === variants[b][index])) rawCounts[i] += 1;
            if (chosen.every(index =>
              aligned[a][index] === aligned[b][index])) alignedCounts[i] += 1;
          }
          seedsExamined += 1;
        }
      }
    }
  }
  return {
    model: 'hypothetical-equal-index-permutation-only',
    seedProtocol: 'decorrelated-slots-v3',
    seedBase, rankCount, repeats, seedsExamined,
    pairs: pairs.map(([a, b], i) => ({
      variants: [a, b], ...expected[i],
      sourceAllSevenCount: rawCounts[i],
      alignedAllSevenCount: alignedCounts[i]
    })),
    actualGamesMeasured: 0,
    competitiveWinRateEvidence: false
  };
}

module.exports = {shuffledIndices, sweepPositionalCoupling};
