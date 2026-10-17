'use strict';
const {createHash}=require('node:crypto');

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
 * @returns {{result:T,draws:number,drawDigest:string}}
 */
function countPolicyRandomDraws(work) {
  const source = Math.random;
  let draws = 0;
  const hash=createHash('sha256');
  const bytes=Buffer.allocUnsafe(8);
  Math.random = function countedPolicyDraw() {
    const value=source();
    draws += 1;
    bytes.writeDoubleBE(value,0);
    hash.update(bytes);
    return value;
  };
  try {
    const result=work();
    return {result,draws,drawDigest:hash.digest('hex')};
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

/**
 * Consume a predetermined number of draws with an independently recorded
 * SHA-256 of their ordered IEEE-754 binary64 values. Calls the existing
 * bounded consumption helper unchanged; no draws are replaced or invented.
 *
 * @param {number} draws
 * @returns {{draws:number,drawDigest:string}}
 */
function consumePolicyRandomDrawsWithDigest(draws) {
  const observed=countPolicyRandomDraws(()=>consumePolicyRandomDraws(draws));
  if(observed.result!==draws || observed.draws!==draws) {
    throw new Error('Policy random consumption count mismatch');
  }
  return {draws,drawDigest:observed.drawDigest};
}

module.exports = {countPolicyRandomDraws,consumePolicyRandomDraws,
  consumePolicyRandomDrawsWithDigest};
