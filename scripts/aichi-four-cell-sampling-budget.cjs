'use strict';
const assert=require('node:assert/strict');

/**
 * Model exact probability that an independently sampled pair stream fills
 * both genuine first-player quotas. Each setup pair is aligned with chance q,
 * then has candidate-first chance p and source-first chance 1-p.
 * This is a sensitivity analysis, not a property proven for Twinleaf.
 * @param {number} n Number of preregistered paired setup attempts.
 * @param {number} k Aligned attempts required per true starter.
 * @param {number} q Probability that a source setup pair matches exactly.
 * @param {number} [p=0.5] Candidate-first probability conditional on alignment.
 * @returns {number} Model chance of meeting both quotas.
 */
function balancedChance(n,k,q,p=0.5){
  assert.ok(Number.isSafeInteger(n)&&n>=0&&n<=10000);
  assert.ok(Number.isSafeInteger(k)&&k>=1&&k<=10);
  assert.ok(typeof q==='number'&&Number.isFinite(q)&&q>0&&q<=1);
  assert.ok(typeof p==='number'&&Number.isFinite(p)&&p>=0&&p<=1);
  let counts=Array.from({length:k+1},()=>new Array(k+1).fill(0));
  counts[0][0]=1;
  for(let t=0;t<n;t++){
    const next=Array.from({length:k+1},()=>new Array(k+1).fill(0));
    for(let i=0;i<=k;i++)for(let j=0;j<=k;j++){
      const mass=counts[i][j];
      next[i][j]+=mass*(1-q);
      next[Math.min(k,i+1)][j]+=mass*q*p;
      next[i][Math.min(k,j+1)]+=mass*q*(1-p);
    }
    counts=next;
  }
  return counts[k][k];
}

/**
 * Find the smallest fixed per-rank-per-physical-seat queue whose independent
 * model jointly fills every rank/seat stratum with target confidence.
 * @param {{groups:number,k:number,q:number,confidence:number,p?:number}} options
 * @returns {{pairsPerGroup:number,totalPairs:number,setupArms:number,modelProbability:number,conditionalIndependenceOnly:true}}
 */
function smallestFixedQueue({groups,k,q,confidence,p=0.5}){
  assert.ok(Number.isSafeInteger(groups)&&groups>=1&&groups<=128);
  assert.ok(typeof confidence==='number'&&confidence>0&&confidence<1);
  assert.ok(typeof p==='number'&&Number.isFinite(p)&&p>=0&&p<=1);
  if(p===0||p===1)throw new RangeError('Both starting orders impossible');
  for(let n=2*k;n<=10000;n++){
    const success=balancedChance(n,k,q,p)**groups;
    if(success>=confidence){
      return {pairsPerGroup:n,totalPairs:n*groups,setupArms:2*n*groups,
        modelProbability:success,conditionalIndependenceOnly:true};
    }
  }
  throw new RangeError('Model requires over 10,000 pairs per group');
}
module.exports={balancedChance,smallestFixedQueue};
