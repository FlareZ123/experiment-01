'use strict';

const assert=require('node:assert/strict');

/**
 * Exact integer binomial coefficient. 60-card paper Expanded finite pool.
 * @param {number} n Nonnegative pool size.
 * @param {number} k Chosen subset size.
 * @returns {bigint}
 */
function chooseBigInt(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0&&n<=60);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  const size=Math.min(k,n-k);
  let value=1n;
  for(let i=1;i<=size;i++){
    value=value*BigInt(n-i+1)/BigInt(i);
  }
  return value;
}

/**
 * Compute the complete uniform-without-replacement distribution of the
 * opponent's unidentified Trainers in a concealed hand. Parameters must be
 * derived from legitimate publicly observed card-count information and a
 * separately justified roster prior. No actual concealed hand card, physical
 * deck order, or simulator Store can enter this interface.
 *
 * WARNING: A strategy-selected hand is not generally an independent uniform
 * subset of the unknown 60. This is a conditional mathematical baseline, not
 * a posterior validated against opening choice, public play history, mulligans
 * or action likelihood.
 *
 * @param {{unknownCards:number,unknownTrainers:number,unknownHand:number,
 *   damagePerTrainer?:number}} args
 * @returns {object} Full per-count probability distribution and moments.
 */
function unseenTrainerHypergeometric({
  unknownCards,unknownTrainers,unknownHand,damagePerTrainer=50
}){
  for(const value of [unknownCards,unknownTrainers,unknownHand,
    damagePerTrainer])assert.ok(Number.isSafeInteger(value)&&value>=0);
  assert.ok(unknownCards<=60);
  assert.ok(unknownTrainers<=unknownCards);
  assert.ok(unknownHand<=unknownCards);
  const denominator=chooseBigInt(unknownCards,unknownHand);
  const outcomes=[];
  let mean=0,secondMoment=0,total=0;
  for(let count=Math.max(0,unknownHand-(unknownCards-unknownTrainers));
    count<=Math.min(unknownTrainers,unknownHand);count++){
    const numerator=chooseBigInt(unknownTrainers,count)*
      chooseBigInt(unknownCards-unknownTrainers,unknownHand-count);
    const probability=Number(numerator)/Number(denominator);
    outcomes.push({
      trainers:count,probability,
      printedDamage:damagePerTrainer*count
    });
    total+=probability;
    mean+=count*probability;
    secondMoment+=count*count*probability;
  }
  assert.ok(outcomes.length>0);
  assert.ok(Math.abs(total-1)<1e-12);
  return {
    schema:'agent23-roster-conditional-uniform-unseen-trainers-v1',
    unknownCards,unknownTrainers,unknownHand,damagePerTrainer,
    outcomes,
    expectedTrainers:mean,
    trainerVariance:Math.max(0,secondMoment-mean*mean),
    expectedPrintedDamage:damagePerTrainer*mean,
    posteriorFromRecordedPlay:false,
    conditionedOnUnknownOpponentActionLikelihood:false,
    exactOpposingRosterPubliclyVerified:false,
    competitiveGameQualified:false
  };
}

/**
 * Probability of printed base attack damage meeting a nominal HP threshold.
 * Use no Weakness/Resistance, immunity, attack restrictions, protection, Tool,
 * Prize and other tactical or board effects. This method does not call a game.
 * @param {ReturnType<typeof unseenTrainerHypergeometric>} model
 * @param {number} hitPoints Positive HP threshold for a hypothetical target.
 * @returns {number}
 */
function nominalPrintedDamageAtLeast(model,hitPoints){
  assert.ok(Number.isSafeInteger(hitPoints)&&hitPoints>0);
  return model.outcomes.reduce((sum,row)=>
    sum+(row.printedDamage>=hitPoints?row.probability:0),0);
}

module.exports={chooseBigInt,unseenTrainerHypergeometric,
  nominalPrintedDamageAtLeast};
