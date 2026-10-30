'use strict';
const assert=require('node:assert/strict');
const {choose,openingProbabilities}=require('./aichi-opening-basics.cjs');

/**
 * Public information disclosed by repeatedly invalid Basic-free opening
 * hands before the first legal opening seven. The opening player reveals
 * every failed seven and reshuffles all cards for an independent attempt.
 * An opponent's mulligan status does not change these marginal exposures.
 *
 * "Revealed card appearances" counts repeated exposures, not unique
 * physical card identities. It is not a quantified information advantage.
 *
 * @param {{deckSize?:number,openingSize?:number,basics:number,
 *           namedNonBasics:number}} input
 * @returns {object} Exact setup probabilities (floating representation).
 */
function revealedMulliganSignature(input){
  const {deckSize=60,openingSize=7,basics,namedNonBasics}=input;
  assert.ok(Number.isSafeInteger(deckSize)&&deckSize>0);
  assert.ok(Number.isSafeInteger(openingSize)&&openingSize>=1&&
    openingSize<=deckSize);
  assert.ok(Number.isSafeInteger(basics)&&basics>=1&&basics<=deckSize);
  assert.ok(Number.isSafeInteger(namedNonBasics)&&namedNonBasics>=0&&
    namedNonBasics<=deckSize-basics);

  const nonBasics=deckSize-basics;
  const invalid=openingProbabilities(basics,deckSize,openingSize)
    .initialMulliganProbability;
  const valid=1-invalid;
  const nonBasicHands=choose(nonBasics,openingSize);
  const noNamedGivenFailed=nonBasicHands>0n?
    Number(choose(nonBasics-namedNonBasics,openingSize))/
    Number(nonBasicHands):1;
  const namedGivenFailed=1-noNamedGivenFailed;
  const anyNamedBeforeValid=1-valid/
    (1-invalid*noNamedGivenFailed);
  const expectedFailedHands=invalid/valid;
  return {
    schema:'public-invalid-seven-reveal-before-valid-v1',
    deckSize,openingSize,basics,namedNonBasics,
    firstAttemptInvalidProbability:invalid,
    namedGivenInvalidHand:namedGivenFailed,
    anyNamedRevealedBeforeValid:anyNamedBeforeValid,
    expectedFailedHands,
    expectedPublicCardAppearances:openingSize*expectedFailedHands,
    expectedNamedCardAppearances:nonBasics>0?
      expectedFailedHands*openingSize*namedNonBasics/nonBasics:0,
    opponentDeckBasicCountIrrelevantToMarginal:true,
    cardIdentityInferenceUnmodeled:true,
    combatStrengthNotMeasured:true
  };
}

module.exports={revealedMulliganSignature};
