'use strict';

/**
 * Ideal fixed-design, all-win lower confidence bound for an equal-weight
 * field of opponent/seat/starting-order strata. Each stratum receives the
 * same number of independent competitively qualified games, with one
 * prospectively frozen candidate deck and decision policy.
 *
 * For stratum win probabilities p_i and equal sample counts n,
 * P(all win) = product(p_i^n) <= (average(p_i))^(n * strata)
 * by AM-GM. Hence alpha^(1/(n*strata)) is a one-sided lower
 * confidence bound on the arithmetic field mean if all games win.
 *
 * @param {number} strata
 * @param {number} perStratum
 * @param {number} alpha
 * @returns {number}
 */
function allWinLowerBound(strata, perStratum, alpha = 0.05) {
  if (!Number.isInteger(strata) || strata < 1 ||
      !Number.isInteger(perStratum) || perStratum < 1 ||
      !(alpha > 0 && alpha < 1)) throw new RangeError('Invalid design');
  return Math.exp(Math.log(alpha)/(strata*perStratum));
}

/**
 * Ideal all-win trial requirements. The mean threshold controls the
 * equal-weight arithmetic field average. The Bonferroni worst-stratum
 * threshold is a stronger simultaneous guarantee in every cell.
 *
 * @param {number} target
 * @param {number} alpha
 * @param {number} strata
 * @returns {{minimumPooled:number,balancedPerStratum:number,balancedTotal:number,lowerBound:number,worstPerStratum:number,worstTotal:number}}
 */
function zeroLossRequirements(target=0.995, alpha=0.05, strata=128) {
  if (!(target > 0 && target < 1) || !(alpha > 0 && alpha < 1) ||
      !Number.isInteger(strata) || strata < 1)
    throw new RangeError('Invalid confidence design');
  const minimumPooled = Math.ceil(Math.log(alpha)/Math.log(target));
  const balancedPerStratum = Math.ceil(minimumPooled/strata);
  const balancedTotal = strata * balancedPerStratum;
  const worstPerStratum = Math.ceil(Math.log(alpha/strata)/Math.log(target));
  return {
    minimumPooled, balancedPerStratum, balancedTotal,
    lowerBound:allWinLowerBound(strata,balancedPerStratum,alpha),
    worstPerStratum, worstTotal:strata*worstPerStratum
  };
}

/**
 * With unequal counts, retaining only the smallest per-stratum count
 * produces a conservative valid all-win bound. All original-source
 * cells must exist and all qualified outcomes must be wins.
 *
 * @param {number[]} gamesPerStratum
 * @param {number} alpha
 * @returns {{eligibleMinimum:number,retainedGames:number,allWinMeanLower:number}}
 */
function conservativeUnbalancedAllWinBound(gamesPerStratum,alpha=0.05) {
  if (gamesPerStratum.length===0 ||
      !gamesPerStratum.every(n=>Number.isInteger(n) && n>=1))
    throw new RangeError('Every stratum requires qualified games');
  const eligibleMinimum=Math.min(...gamesPerStratum);
  return {
    eligibleMinimum,
    retainedGames:eligibleMinimum*gamesPerStratum.length,
    allWinMeanLower:allWinLowerBound(gamesPerStratum.length,eligibleMinimum,alpha)
  };
}

/**
 * Binary KL divergence used in a non-identically distributed Bernoulli
 * Chernoff bound. The p=0 and p=1 cases are handled by the caller.
 *
 * @param {number} q Observed win fraction
 * @param {number} p Proposed null mean
 * @returns {number}
 */
function binaryKL(q,p) {
  if (!(q>=0&&q<=1&&p>0&&p<1))
    throw new RangeError('Invalid Bernoulli arguments');
  return (q===0?0:q*Math.log(q/p))+
    (q===1?0:(1-q)*Math.log((1-q)/(1-p)));
}

/**
 * One-sided Chernoff lower confidence bound on the equal-stratum field
 * arithmetic mean after a fixed independent schedule. Handles observed
 * losses and heterogeneous true cell probabilities. Valid when each
 * of the stratum probabilities was sampled exactly the same n times.
 * Does not tolerate repeated seeds, changing policy or optional stopping.
 *
 * @param {number} wins
 * @param {number} trials
 * @param {number} alpha
 * @returns {number}
 */
function heterogeneousFieldLowerBound(wins,trials,alpha=0.05) {
  if (!Number.isInteger(wins) || !Number.isInteger(trials) ||
      trials<=0 || wins<0 || wins>trials || !(alpha>0&&alpha<1))
    throw new RangeError('Invalid result');
  if(wins===0)return 0;
  if(wins===trials)return Math.exp(Math.log(alpha)/trials);
  const q=wins/trials, threshold=Math.log(1/alpha)/trials;
  let low=0,high=q;
  for(let i=0;i<80;i++) {
    const mid=(low+high)/2;
    if(mid===0 || binaryKL(q,mid)>threshold)low=mid;
    else high=mid;
  }
  return high;
}

/**
 * A conservative valid design for a prespecified maximum total loss count.
 * This uses the Bernoulli-KL Chernoff tail, exact on the all-win event.
 *
 * @param {number} losses
 * @param {number} strata
 * @param {number} target
 * @param {number} alpha
 * @returns {{perStratum:number,totalTrials:number,losses:number,lowerBound:number}}
 */
function balancedGamesForLossBudget(losses,strata=128,target=0.995,alpha=0.05) {
  if (!Number.isInteger(losses)||losses<0 ||
      !Number.isInteger(strata)||strata<1 ||
      !(target>0&&target<1)||!(alpha>0&&alpha<1))
    throw new RangeError('Invalid prespecified design');
  for(let perStratum=1;perStratum<=100000;perStratum++) {
    const totalTrials=perStratum*strata;
    if(totalTrials<=losses)continue;
    const lowerBound=heterogeneousFieldLowerBound(totalTrials-losses,totalTrials,alpha);
    if(lowerBound>=target)return {perStratum,totalTrials,losses,lowerBound};
  }
  throw new RangeError('Required design exceeds supported search');
}

module.exports={
  allWinLowerBound,zeroLossRequirements,conservativeUnbalancedAllWinBound,
  binaryKL,heterogeneousFieldLowerBound,balancedGamesForLossBudget
};
