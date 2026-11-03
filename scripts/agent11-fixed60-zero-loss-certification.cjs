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

module.exports={
  allWinLowerBound,zeroLossRequirements,conservativeUnbalancedAllWinBound
};
