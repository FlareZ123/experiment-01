'use strict';

const assert=require('node:assert/strict');

const FIELD_SIZE=32;
const DEFAULT_TARGET=0.995;
const VERSION='agent33-aichi-original-source-bounded-loss-budget-v1';

/**
 * Mathematical source-coverage and probability interval accounting.
 * Any missing exact original 60 stays [0,1], even if an archetype proxy has
 * been tried. The returned bounds are deterministic sensitivity analysis,
 * never a statistical confidence interval or competitive match approval.
 *
 * @param {Array<{rank:number,exactOriginal60:boolean,lower?:number,upper?:number}>} rows
 * Source rows with externally justified true win-probability intervals.
 * A missing original source can be omitted or supplied with exactOriginal60
 * false, but must never carry an attempted performance interval.
 * @param {{target?:number}} [options]
 * @returns {object}
 */
function originalFieldLossBudget(rows,options={}){
  assert.ok(Array.isArray(rows));
  const target=options.target??DEFAULT_TARGET;
  assert.ok(Number.isFinite(target)&&target>0&&target<=1);
  const seen=new Set(),known=[],missing=[];
  for(const row of rows){
    assert.ok(row&&Number.isSafeInteger(row.rank)&&
      row.rank>=1&&row.rank<=FIELD_SIZE);
    assert.ok(!seen.has(row.rank),'Duplicate original-source rank '+row.rank);
    seen.add(row.rank);
    assert.equal(typeof row.exactOriginal60,'boolean');
    if(!row.exactOriginal60){
      assert.equal(row.lower,undefined,'Proxy cannot certify source lower bound');
      assert.equal(row.upper,undefined,'Proxy cannot certify source upper bound');
      continue;
    }
    assert.ok(Number.isFinite(row.lower)&&Number.isFinite(row.upper)&&
      row.lower>=0&&row.upper<=1&&row.lower<=row.upper,
      'Provide a valid independently justified true-probability interval');
    known.push({rank:row.rank,lower:row.lower,upper:row.upper});
  }
  for(let rank=1;rank<=FIELD_SIZE;rank++){
    if(!known.some(x=>x.rank===rank))missing.push(rank);
  }
  known.sort((a,b)=>a.rank-b.rank);
  const sumLower=known.reduce((s,x)=>s+x.lower,0);
  const sumUpper=known.reduce((s,x)=>s+x.upper,0);
  const lossBudget=FIELD_SIZE*(1-target);
  const maximumFieldMean=(sumUpper+missing.length)/FIELD_SIZE;
  const minimumFieldMean=sumLower/FIELD_SIZE;
  const optimisticKnownLoss=known.reduce((s,x)=>s+1-x.upper,0);
  const remainingLossBudget=lossBudget-optimisticKnownLoss;
  const neededMissingMean=missing.length?
    (FIELD_SIZE*target-sumUpper)/missing.length:null;
  return {
    version:VERSION,target,fieldSize:FIELD_SIZE,
    exactOriginalSourceCount:known.length,unknownOriginalRanks:missing,
    totalLossBudget:lossBudget,
    minimumFieldMean,maximumFieldMean,
    uncertaintyWidth:maximumFieldMean-minimumFieldMean,
    optimisticKnownLoss,optimisticRemainingLossBudget:remainingLossBudget,
    minimumMissingMeanRequiredOptimistically:neededMissingMean,
    mathematicallyImpossibleEvenAtOptimisticBounds:
      maximumFieldMean<target-1e-12,
    mathematicallyGuaranteedByAssumedLowerBounds:
      minimumFieldMean>=target-1e-12,
    qualifiedCompetitiveGames:0,
    source:
      'conditional equal-weight original rank probabilities only',
    caveat:
      'Input probability ranges must be independently justified. This routine does not estimate them or establish any paper game legality, policy competence, clock compliance, or statistical confidence.'
  };
}

module.exports={FIELD_SIZE,DEFAULT_TARGET,VERSION,originalFieldLossBudget};
