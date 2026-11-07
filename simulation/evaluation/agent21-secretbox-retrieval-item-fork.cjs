'use strict';

const assert = require('node:assert/strict');
const {choose, twoTargetSearchAvailability} =
  require('./agent21-root93-k0-two-target-availability.cjs');

const VERSION = 'agent21-source-locked-secretbox-item-recovery-fork-v1';

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * @param {bigint} num
 * @param {bigint} den
 * @returns {{numerator:string,denominator:string,decimal:number}}
 */
function fraction(num, den) {
  assert.ok(den > 0n && num >= 0n && num <= den);
  const factor = gcd(num, den);
  return Object.freeze({
    numerator:String(num / factor),
    denominator:String(den / factor),
    decimal:Number(num) / Number(den)
  });
}

/**
 * Conditional search-channel probability under uniform unresolved placement.
 * This is not a probability measured from real draws or a policy success rate.
 *
 * Secret Box may fetch either an in-deck Energy Retrieval (recovery channel)
 * when a Basic Energy already exists in owner discard, or an in-deck Fog
 * Crystal (deck channel) when a Basic Psychic remains in owner deck.
 *
 * Copies in these categories are physical distinct cards and are positioned
 * uniformly across the unresolved OWNER deck and face-down Prize slots.
 * There must be no copy of a target already in the owner's known hand.
 * No inspection of concealed cards occurs.
 *
 * @param {{deckCount:number,prizeCount:number,basicUnresolved:number,
 *   fogUnresolved:number,retrievalUnresolved:number,basicInDiscard:number}} input
 * @returns {object}
 */
function recoveryOrFogAvailability(input) {
  const {deckCount,prizeCount,basicUnresolved,fogUnresolved,
    retrievalUnresolved,basicInDiscard} = input;
  const values=[deckCount,prizeCount,basicUnresolved,fogUnresolved,
    retrievalUnresolved,basicInDiscard];
  assert.ok(values.every(n=>Number.isSafeInteger(n)&&n>=0));
  const hidden=deckCount+prizeCount;
  assert.ok(prizeCount<=6&&hidden<=60);
  assert.ok(basicUnresolved>0&&fogUnresolved>0&&
    retrievalUnresolved>0&&
    basicUnresolved+fogUnresolved+retrievalUnresolved<=hidden);
  // If discard has no Basic target, the recovery Item is dead even when
  // searchable; the only modeled route is Fog plus an in-deck Basic.
  if(basicInDiscard===0) {
    const existing=twoTargetSearchAvailability({
      deckCount,prizeCount,
      firstTargetRemaining:basicUnresolved,
      secondTargetRemaining:fogUnresolved
    });
    return Object.freeze({
      schema:VERSION,
      recoveredBasicInDiscard:false,
      bothRoutesAccessible:existing.bothAvailable,
      residualFailure:fraction(
        BigInt(existing.bothAvailable.denominator)-
          BigInt(existing.bothAvailable.numerator),
        BigInt(existing.bothAvailable.denominator)),
      noRecoveryOnlyFogAccess:existing.bothAvailable,
      empiricalNativeGameProbability:false
    });
  }
  const missingBasicAndRecovery=choose(prizeCount,
    retrievalUnresolved+basicUnresolved);
  const missingFogAndRecovery=choose(prizeCount,
    retrievalUnresolved+fogUnresolved);
  const missingAll=choose(prizeCount,
    retrievalUnresolved+basicUnresolved+fogUnresolved);
  const allRecoveryFirst=choose(hidden,
    retrievalUnresolved+basicUnresolved);
  const allRecoverySecond=choose(hidden,
    retrievalUnresolved+fogUnresolved);
  const allThree=choose(hidden,
    retrievalUnresolved+basicUnresolved+fogUnresolved);
  const denominator=allRecoveryFirst*allRecoverySecond*allThree;
  const failure=missingBasicAndRecovery*allRecoverySecond*allThree+
    missingFogAndRecovery*allRecoveryFirst*allThree-
    missingAll*allRecoveryFirst*allRecoverySecond;
  assert.ok(failure>=0n&&failure<=denominator);
  return Object.freeze({
    schema:VERSION,
    hypothesis:'UNIFORM_OWNER_DECK_PLUS_PRIZE_CONDITIONAL',
    recoveredBasicInDiscard:true,
    targetCount:{basicUnresolved,fogUnresolved,retrievalUnresolved,
      basicInDiscard},
    ownerDeckCount:deckCount,ownerPrizeCount:prizeCount,
    bothRoutesAccessible:fraction(denominator-failure,denominator),
    residualFailure:fraction(failure,denominator),
    empiricalNativeGameProbability:false,
    gameWinRateEstimate:null,
    caveat:'Fixed-state hypothetical card-slot substitution only. Changing a real 60 modifies actual draws, physical deals, prior actions, K1 and search opportunity costs.'
  });
}

/**
 * Initial seven-card incidence of at least one out of `copies` specified
 * physical cards, unconditioned on having a Basic opener or Prize setup.
 * @param {number} copies Number of named target copies in a 60.
 */
function initialSevenAtLeastOne(copies) {
  assert.ok(Number.isSafeInteger(copies)&&copies>=0&&copies<=60);
  const total=choose(60,7);
  return fraction(total-choose(60-copies,7),total);
}

module.exports={VERSION,recoveryOrFogAvailability,initialSevenAtLeastOne};
