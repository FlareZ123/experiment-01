'use strict';

/**
 * Observe the number of actual Math.random draws made during one synchronous
 * policy proposal without changing the chosen values or final global function.
 *
 * The caller must invoke this while headless has temporarily installed the
 * seat-specific speculative RNG. The helper does not authenticate policy
 * competence or claim a snapshot of opaque RNG closure state.
 *
 * @template T
 * @param {() => T} work
 * @returns {{result:T,draws:number}}
 */
function countPolicyRandomDraws(work) {
  const source = Math.random;
  let draws = 0;
  Math.random = function countedPolicyDraw() {
    draws += 1;
    return source();
  };
  try {
    return {result:work(),draws};
  } finally {
    Math.random = source;
  }
}

/**
 * Advance exactly the recorded number of draws from the currently installed
 * seat-specific speculative RNG. This aligns xorshift stream position after
 * a skipped proposal, assuming an identical prefork stream and no stored
 * references to a different random function.
 *
 * @param {number} draws Number measured in the unchanged proposal.
 * @returns {number} Number of draws consumed.
 */
function consumePolicyRandomDraws(draws) {
  if (!Number.isSafeInteger(draws) || draws < 0 || draws > 10000000) {
    throw new RangeError('Invalid bounded policy random draw count');
  }
  for (let i = 0; i < draws; i += 1) Math.random();
  return draws;
}

module.exports = {countPolicyRandomDraws,consumePolicyRandomDraws};
