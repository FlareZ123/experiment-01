'use strict';

/**
 * Statistical boundary for a hypothetical perfect-win, fixed-allocation
 * Aichi Top-32 campaign. This is a proposed sample-design calculation, never
 * evidence that any played game has passed legal, policy or clock qualification.
 *
 * For independent, prospectively fixed rank counts n[i] and all wins,
 * the likelihood at true rank win probabilities p[i] is product(p[i]^n[i]).
 * At one-sided error alpha, discard parameter vectors with likelihood < alpha.
 * The minimum unweighted field mean in the surviving set has
 * p[i] = min(1, lambda * n[i]) for tested ranks and p[i] = 0 otherwise.
 *
 * @param {{trialsByRank:number[],alpha?:number,target?:number}} input
 * @returns {object} Hypothetical zero-loss lower bound and prerequisites.
 */
function hypotheticalZeroLossFieldBound(input) {
  const trialsByRank=input?.trialsByRank;
  const alpha=input?.alpha??0.05;
  const target=input?.target??0.995;
  if(!Array.isArray(trialsByRank) || trialsByRank.length!==32 ||
      !trialsByRank.every(n=>Number.isSafeInteger(n)&&n>=0) ||
      !Number.isFinite(alpha) || !(alpha>0 && alpha<1) ||
      !Number.isFinite(target) || !(target>0 && target<1))
    throw new TypeError('Expected 32 nonnegative rank counts, 0<alpha<1 and 0<target<1');
  const totalTrials=trialsByRank.reduce((a,n)=>a+n,0);
  if(!Number.isSafeInteger(totalTrials))
    throw new RangeError('Total number of trials exceeds safe integer precision');
  const untestedRanks=trialsByRank.flatMap((n,i)=>n===0?[i+1]:[]);
  const minimumUniformTrialsPerRank=Math.ceil(
    Math.log(alpha)/(32*Math.log(target)));
  if(totalTrials===0) return {
    status:'NO-TRIALS',hypothetical:true,
    alpha,target,fieldSize:32,totalTrials,untestedRanks,
    lowerFieldMean:0,meetsTargetIfAllWin:false,
    minimumUniformTrialsPerRank,
    boundaryRankRates:Array(32).fill(0),
    assumptions:'Only an all-win outcome under a fixed preregistered, independent, unchanged-policy, 32-rank allocation; game legality, policy, paper rules and clock must be certified separately'
  };

  const tested=trialsByRank.filter(n=>n>0);
  const minN=Math.min(...tested);
  const logAlpha=Math.log(alpha);
  const logLikelihood=lambda=>trialsByRank.reduce((sum,n)=>{
    if(n===0)return sum;
    const p=Math.min(1,lambda*n);
    return sum+n*Math.log(p);
  },0);
  let low=0,high=1/minN;
  for(let i=0;i<160;i++){
    const mid=(low+high)/2;
    if(logLikelihood(mid)<logAlpha) low=mid;
    else high=mid;
  }
  const boundaryRankRates=trialsByRank.map(n=>n===0?0:Math.min(1,high*n));
  const lowerFieldMean=boundaryRankRates.reduce((sum,p)=>sum+p,0)/32;
  return {
    status:'HYPOTHETICAL-ALL-WINS-ONLY',hypothetical:true,
    alpha,target,fieldSize:32,totalTrials,untestedRanks,
    rankTrialCounts:[...trialsByRank],
    lowerFieldMean,
    meetsTargetIfAllWin:lowerFieldMean>=target,
    minimumUniformTrialsPerRank,
    boundaryRankRates,
    logAllWinLikelihoodAtBoundary:logLikelihood(high),
    assumptions:'Requires all outcomes wins, fixed preregistered rank sample counts, independent games with stationary unchanged rank-specific win probabilities, and separately certified paper legality, both-player policy and clock'
  };
}

module.exports={hypotheticalZeroLossFieldBound};
