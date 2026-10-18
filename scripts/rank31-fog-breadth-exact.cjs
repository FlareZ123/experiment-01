'use strict';

/**
 * Exact pre-interaction rank31 Fog-for-Energy resource census, using
 * the registered 60: Chimecho 1, other Basics 14, eligible Energy 5
 * (Basic Psychic 2 + Telepathic Psychic 3), Fog Crystal 4, other 36.
 *
 * The opening seven have Chimecho, the six remaining opening slots
 * and next mandatory draw contain no Energy and at least one Fog,
 * and the six Prizes do not contain both Basic Psychic Energy cards.
 * The stricter subset also has no other Basic in those observed slots.
 * This is a combinatorial resource opportunity, never an attack rate.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  let result = 1n;
  for (let i=1; i<=k; i+=1) {
    result = result*BigInt(n-k+i)/BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while(b!==0n) [a,b]=[b,a%b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function rational(numerator,denominator) {
  const common = gcd(numerator,denominator);
  return {numerator:numerator/common,denominator:denominator/common};
}

/** @returns {object} Exact probability fractions and structural gap. */
function rank31FogBreadth() {
  const prizeSurvivalNumerator=BigInt(52*51-6*5);
  const prizeSurvivalDenominator=BigInt(52*51);
  const denominator=60n*choose(59,7)*prizeSurvivalDenominator;
  const numerator = difference =>
    7n*difference*prizeSurvivalNumerator;
  const bridge = rational(numerator(choose(54,7)-choose(50,7)),denominator);
  const noOtherBasic = rational(
    numerator(choose(40,7)-choose(36,7)),denominator);
  const excluded = rational(
    bridge.numerator*noOtherBasic.denominator-
      noOtherBasic.numerator*bridge.denominator,
    bridge.denominator*noOtherBasic.denominator);
  const otherBasicShare=rational(
    excluded.numerator*bridge.denominator,
    excluded.denominator*bridge.numerator);
  return {bridge,noOtherBasic,excluded,otherBasicShare,
    assumptions:{
      deckCards:60,openingCards:7,prizes:6,firstDraws:1,
      chimecho:1,otherBasics:14,fog:4,
      eligibleEnergy:5,basicPsychicEnergy:2,
      noDiscardOrPrePromptRemoval:true
    }};
}

/** @param {{numerator:bigint,denominator:bigint}} value */
function show(value) {
  return {fraction:value.numerator.toString()+'/'+value.denominator,
    percentage:Number(value.numerator)/Number(value.denominator)*100};
}

if(require.main===module) {
  const exact=rank31FogBreadth();
  process.stdout.write(JSON.stringify({
    bridge:show(exact.bridge),
    noOtherBasic:show(exact.noOtherBasic),
    excluded:show(exact.excluded),
    otherBasicShare:show(exact.otherBasicShare),
    assumptions:exact.assumptions,
    qualification:'resources only; no policy action, attack or win rate'
  },null,2)+'\n');
}

module.exports={choose,rational,rank31FogBreadth};
