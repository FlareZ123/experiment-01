'use strict';

const {choose} = require('./redeal-posterior.cjs');

/**
 * Exact conditional distribution for a category in an unrevealed opponent hand.
 * The caller MUST derive the unknown pool from a legitimately known roster
 * minus genuinely observed cards, and justify exchangeability. This function
 * deliberately accepts counts only, never a live opponent State or Card.
 *
 * @param {{unseenCategoryCount:number,unseenOtherCount:number,
 *   unknownHandCount:number,knownHandCategoryCount:number,
 *   unitEffect:number,threshold:number,
 *   uniformUnknownHandAllocation:true}} input
 * @returns {{distribution:Array<{categoryCount:number,totalCategoryCount:number,
 *   effect:number,numerator:string,denominator:string,probability:number}>,
 *   expectedCategoryCount:number,expectedEffect:number,
 *   thresholdNumerator:string,thresholdDenominator:string,
 *   probabilityAtLeastThreshold:number,unknownPoolCount:number,
 *   unknownHandCount:number,assumption:string}}
 */
function unseenHandCategoryPosterior(input) {
  if (input?.uniformUnknownHandAllocation !== true) {
    throw new Error('Uniform hidden hand allocation must be justified');
  }
  const {
    unseenCategoryCount:T, unseenOtherCount:F, unknownHandCount:h,
    knownHandCategoryCount:k, unitEffect:u, threshold:threshold
  } = input;
  if (![T,F,h,k,u,threshold].every(Number.isSafeInteger) ||
      [T,F,h,k,u,threshold].some(n=>n<0) ||
      T+F+k>60 || h>T+F ||
      !Number.isSafeInteger(u*(k+Math.min(h,T)))) {
    throw new RangeError('Invalid observable counts, effect or threshold');
  }
  const N=T+F;
  const denominator=choose(N,h);
  let tail=0n;
  let weighted=0n;
  const distribution=[];
  for (let x=Math.max(0,h-F); x<=Math.min(h,T); x++) {
    const count=choose(T,x)*choose(F,h-x);
    const total=k+x;
    const effect=u*total;
    if (effect>=threshold) tail+=count;
    weighted+=count*BigInt(total);
    distribution.push({
      categoryCount:x, totalCategoryCount:total, effect,
      numerator:count.toString(), denominator:denominator.toString(),
      probability:Number(count)/Number(denominator)
    });
  }
  const expectedCategoryCount=Number(weighted)/Number(denominator);
  return {
    distribution,
    expectedCategoryCount,
    expectedEffect:u*expectedCategoryCount,
    thresholdNumerator:tail.toString(),
    thresholdDenominator:denominator.toString(),
    probabilityAtLeastThreshold:Number(tail)/Number(denominator),
    unknownPoolCount:N,
    unknownHandCount:h,
    assumption:'Exchangeable unknown hand slots given a player-observable, known opponent card multiset'
  };
}

module.exports={unseenHandCategoryPosterior};
