'use strict';

const { createHash } = require('node:crypto');

/**
 * Derive one unsigned 32-bit seed for the pinned xorshift engine.
 * Hash-domain labels isolate this new v3 protocol from historical v1/v2.
 * @param {number} seedBase
 * @param {'pilot'|'published-field'} phase
 * @param {number} rank
 * @param {number} repeat
 * @param {'A'|'B'} slot
 * @param {number} nonce
 * @returns {number}
 */
function hashSlotSeed(seedBase, phase, rank, repeat, slot, nonce) {
  const label = JSON.stringify([
    'aichi-decorrelated-slots-v3', seedBase, phase, rank, repeat, slot, nonce
  ]);
  return createHash('sha256').update(label).digest().readUInt32LE(0);
}

/**
 * Return reproducible, candidate-matched physical-slot seeds that avoid the
 * known adjacent-integer xorshift coupling in v2. These are pseudorandom
 * streams, not a proof of statistical independence or competitive validity.
 * @param {number} seedBase
 * @param {'pilot'|'published-field'} phase
 * @param {number} rank
 * @param {number} repeat
 * @returns {{A:number,B:number}}
 */
function deriveSlotSeeds(seedBase, phase, rank, repeat) {
  if (!Number.isSafeInteger(seedBase) || seedBase < 0 || seedBase > 0xffffffff ||
      !['pilot', 'published-field'].includes(phase) ||
      !Number.isInteger(rank) || rank < 1 || rank > 32 ||
      !Number.isInteger(repeat) || repeat < 0 || repeat > 99) {
    throw new RangeError('Invalid v3 seed identity');
  }
  /** @type {{A:number,B:number}} */
  const seeds = { A: 0, B: 0 };
  for (const slot of /** @type {const} */ (['A', 'B'])) {
    let nonce = 0;
    let value = 0;
    do {
      value = hashSlotSeed(seedBase, phase, rank, repeat, slot, nonce);
      nonce += 1;
    } while (value === 0 || (slot === 'B' && value === seeds.A));
    seeds[slot] = value;
  }
  return seeds;
}

module.exports = { deriveSlotSeeds };
