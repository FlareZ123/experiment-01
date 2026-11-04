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

/**
 * A wider sufficient direct route: source must open with any one of its six
 * other Basics (excluding Unown and Exeggcute) as an available Active, and
 * see all six combination categories among its seven initial and first draw.
 *
 * One required starter in a uniform eight-card seen subset appears in the
 * opening seven with probability 7/8; two starters guarantee it. All sums
 * are exact BigInt integers, including the eighth-position weighting.
 * @returns {object}
 */
function analyzeAlternativeBasicStarter(){
  const starterCount=SOURCE.sourceBasicCount-
    SOURCE.required.unown-SOURCE.required.exeggcute;
  const required=Object.values(SOURCE.required);
  const counts=[starterCount,...required];
  const otherCount=SOURCE.deckSize-counts.reduce((a,b)=>a+b,0);
  const oneEach=counts.reduce((p,n)=>p*BigInt(n),1n);
  const oneStarterNeutral=oneEach*BigInt(otherCount);
  const oneStarterDoubled=required.reduce((acc,n)=>
    acc+choose(n,2)*(oneEach/BigInt(n)),0n);
  const twoStarters=choose(starterCount,2)*
    required.reduce((p,n)=>p*BigInt(n),1n);
  const numerator=7n*(oneStarterNeutral+oneStarterDoubled)+
    8n*twoStarters;
  const denominator=8n*choose(SOURCE.deckSize,8);
  const probability=Number(numerator)/Number(denominator);
  const basicValid=Number(choose(60,7)-choose(48,7))/
    Number(choose(60,7));
  return Object.freeze({
    version:'agent2-rank26-alternative-basic-starter-first-eight-v1',
    starterGroupCopies:starterCount,neutralCopies:otherCount,
    allSevenCategoryEightSubsets:
      (oneStarterNeutral+oneStarterDoubled+twoStarters).toString(),
    weightedSuccessfulEightSubsets:(Number(numerator)/8).toString(),
    exactNumerator:numerator.toString(),
    exactDenominator:denominator.toString(),
    unconditionalProbability:probability,
    conditionalBasicValidProbability:probability/basicValid,
    noSearchOrBonusDraws:true,
    opponentBoardConditionNotModeled:true,
    competitiveGamesQualified:0
  });
}

module.exports={SOURCE,choose,countRequiredInSeven,analyze,
  analyzeAlternativeBasicStarter};
if(require.main===module)console.log(JSON.stringify(analyze(),null,2));
