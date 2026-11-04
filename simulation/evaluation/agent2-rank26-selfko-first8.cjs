'use strict';

const assert=require('node:assert/strict');

const SOURCE=Object.freeze({
  deckSize:60,startingHandSize:7,prizeCards:6,sourceBasicCount:12,
  meloetta:1,
  required:Object.freeze({
    unown:4,exeggcute:2,riskyRuins:4,damagePump:4,
    counterCatcher:1,cancelingCologne:1
  })
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    result=result*BigInt(n-i+1)/BigInt(i);
  return result;
}

/**
 * Count seven-card subsets after reserving Meloetta for the initial seven.
 * Every one of six independent required categories must occur.
 * @param {readonly number[]} categoryCounts
 * @param {number} otherCopies
 * @returns {bigint}
 */
function countRequiredInSeven(categoryCounts,otherCopies){
  assert.equal(categoryCounts.length,6);
  assert.ok(categoryCounts.every(n=>Number.isSafeInteger(n)&&n>=1));
  assert.ok(Number.isSafeInteger(otherCopies)&&otherCopies>=0);
  const ways=categoryCounts.reduce((product,n)=>product*BigInt(n),1n);
  const oneNeutral=ways*BigInt(otherCopies);
  const doubled=categoryCounts.reduce((total,n)=>
    total+choose(n,2)*(ways/BigInt(n)),0n);
  return oneNeutral+doubled;
}

/**
 * Exact uniform shuffled source probability. The eighth physically seen card
 * is the first ordinary draw, after six unknown Prizes were set aside.
 * @returns {object}
 */
function analyze(){
  const counts=Object.values(SOURCE.required);
  const remaining=SOURCE.deckSize-SOURCE.meloetta-
    counts.reduce((a,b)=>a+b,0);
  const successful=countRequiredInSeven(counts,remaining);
  const otherSeven=choose(59,7);
  const numerator=7n*successful;
  const denominator=60n*otherSeven;
  const validNumerator=choose(60,7)-choose(48,7);
  const validDenominator=choose(60,7);
  const probability=Number(numerator)/Number(denominator);
  const pValid=Number(validNumerator)/Number(validDenominator);
  return Object.freeze({
    version:'agent2-rank26-six-channel-direct-first-eight-v1',
    independentExtraCategories:counts.length,
    otherCopies:remaining,
    requiredSevenSubsets:successful.toString(),
    allOtherSevenSubsets:otherSeven.toString(),
    unconditionedNumerator:numerator.toString(),
    unconditionedDenominator:denominator.toString(),
    unconditionalProbability:probability,
    basicValidOpeningProbability:pValid,
    conditionalBasicValidProbability:probability/pValid,
    noSearchOrBonusDraws:true,
    candidateMukEstablishedProbabilityNotModeled:true,
    gamesPlayed:0,competitiveGamesQualified:0
  });
}

module.exports={SOURCE,choose,countRequiredInSeven,analyze};
if(require.main===module)console.log(JSON.stringify(analyze(),null,2));
