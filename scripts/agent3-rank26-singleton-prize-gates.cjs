'use strict';

/**
 * Source rank26 paper-first-turn singleton Prize survival. Six of sixty
 * distinct physical cards are Prized uniformly. The Meloetta ex's TM
 * Crisis Punch route in the original source consumes its only DCE; against
 * a sole Active Mimikyu Safeguard or Iron Thorns Initialization, its only
 * Canceling Cologne is a corresponding Ability-bypass Item.
 *
 * We count joint locations without independence approximations. Additional
 * necessary cards are listed only for the SPECIFIC 21-step paper witness,
 * not a hard upper bound on other opponent attacks or actual win rates.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let z=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    z=z*BigInt(n-i+1)/BigInt(i);
  return z;
}

/**
 * @param {number} requiredDistinctCards
 * @returns {{successNumerator:bigint,denominator:bigint,
 * probabilityAllUnprized:number,probabilityAtLeastOnePrized:number}}
 */
function jointUnprized(requiredDistinctCards){
  if(!Number.isInteger(requiredDistinctCards)||
    requiredDistinctCards<0||requiredDistinctCards>60)
    throw new RangeError('Distinct card count must be 0..60');
  const denominator=choose(60,6);
  const successNumerator=choose(60-requiredDistinctCards,6);
  return {
    successNumerator,denominator,
    probabilityAllUnprized:Number(successNumerator)/Number(denominator),
    probabilityAtLeastOnePrized:
      1-Number(successNumerator)/Number(denominator)
  };
}

/** @returns {{
 * doubleColorless:ReturnType<typeof jointUnprized>,
 * cologneAndDce:ReturnType<typeof jointUnprized>,
 * donorWitnessEnergy:ReturnType<typeof jointUnprized>,
 * donorWitnessEnergyPlusCologne:ReturnType<typeof jointUnprized>
 * }} */
function rank26PrizeGates(){
  return {
    doubleColorless:jointUnprized(1),
    cologneAndDce:jointUnprized(2),
    donorWitnessEnergy:jointUnprized(3),
    donorWitnessEnergyPlusCologne:jointUnprized(4)
  };
}

module.exports={choose,jointUnprized,rank26PrizeGates};
