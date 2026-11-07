'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent21-owner-k0-two-target-search-availability-v1';

/**
 * Exact binomial coefficient for a bounded physical Pokémon deck.
 * @param {number} n Population size from 0 to 60.
 * @param {number} k Selected copies.
 * @returns {bigint}
 */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0 && n <= 60);
  assert.ok(Number.isSafeInteger(k) && k >= 0);
  if (k > n) return 0n;
  const count = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= count; i++) {
    value = value * BigInt(n - i + 1) / BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

/**
 * An exact reduced rational, with decimal for presentation only.
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {{numerator:string,denominator:string,decimal:number}}
 */
function fraction(numerator, denominator) {
  assert.ok(denominator > 0n);
  assert.ok(numerator >= 0n && numerator <= denominator);
  const divisor = gcd(numerator, denominator);
  return Object.freeze({
    numerator: String(numerator / divisor),
    denominator: String(denominator / divisor),
    decimal: Number(numerator) / Number(denominator)
  });
}

/**
 * Evaluate access to two distinct deck-search targets under an EXPLICIT
 * uniform-exchangeability hypothesis over remaining owner Deck + Prize slots.
 *
 * The targets are different printings/categories, e.g., Basic Psychic Energy
 * and Fog Crystal, so their copy positions cannot overlap. This is NOT a
 * posterior inferred from actual searches, chosen draws or future evidence.
 * No hidden deck or Prize identities are inspected.
 *
 * @param {{deckCount:number,prizeCount:number,
 *   firstTargetRemaining:number,secondTargetRemaining:number}} input
 * @returns {object} Exact K0-only conditional access evidence.
 */
function twoTargetSearchAvailability(input) {
  const {deckCount, prizeCount, firstTargetRemaining,
    secondTargetRemaining} = input;
  const counts = [deckCount, prizeCount, firstTargetRemaining,
    secondTargetRemaining];
  assert.ok(counts.every(n => Number.isSafeInteger(n) && n >= 0));
  const hiddenCount = deckCount + prizeCount;
  assert.ok(hiddenCount <= 60 && prizeCount <= 6);
  assert.ok(firstTargetRemaining > 0 && secondTargetRemaining > 0);
  assert.ok(firstTargetRemaining + secondTargetRemaining <= hiddenCount);

  const hA = choose(hiddenCount, firstTargetRemaining);
  const hB = choose(hiddenCount, secondTargetRemaining);
  const hBoth = choose(hiddenCount,
    firstTargetRemaining + secondTargetRemaining);
  const pA = choose(prizeCount, firstTargetRemaining);
  const pB = choose(prizeCount, secondTargetRemaining);
  const pBoth = choose(prizeCount,
    firstTargetRemaining + secondTargetRemaining);

  const denominator = hA * hB * hBoth;
  const noFirst = pA * hB * hBoth;
  const noSecond = pB * hA * hBoth;
  const neither = pBoth * hA * hB;
  const success = denominator - noFirst - noSecond + neither;
  return Object.freeze({
    schema: VERSION,
    exactConditionalModel: 'UNIFORM_UNRESOLVED_OWNER_DECK_AND_PRIZE_SLOTS',
    empiricalNativeGameProbability: false,
    targetWhiffIsPaperLegalSearchOutcome: true,
    hiddenCount,
    deckCount,
    prizeCount,
    firstTargetRemaining,
    secondTargetRemaining,
    firstTargetUnavailable: fraction(noFirst, denominator),
    secondTargetUnavailable: fraction(noSecond, denominator),
    bothUnavailable: fraction(neither, denominator),
    bothAvailable: fraction(success, denominator),
    caveat: 'Only conditional uniform placement of unresolved copies. A previous owner-authorized K1 search or selective draws may invalidate exchangeability. Printed Store payment, search acceptance and game payoff require separate evidence.'
  });
}

module.exports = {VERSION, choose, twoTargetSearchAvailability};
