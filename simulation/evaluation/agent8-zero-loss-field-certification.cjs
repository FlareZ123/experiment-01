'use strict';

const assert=require('node:assert/strict');

const VERSION='agent8-zero-loss-predeclared-equal-field-confidence-v1';

/**
 * Exact one-sided zero-failure binomial sample bound:
 *   P(all wins | p<=target) <= target^n.
 * The plan must be fixed, games genuinely qualified and independence credible.
 * @param {number} target Prespecified win-probability threshold in (0,1).
 * @param {number} alpha Prespecified one-sided error bound in (0,1).
 * @returns {number} Smallest integer n with target**n <= alpha.
 */
function minimumZeroLossTrials(target,alpha){
  assert.ok(Number.isFinite(target)&&target>0&&target<1);
  assert.ok(Number.isFinite(alpha)&&alpha>0&&alpha<1);
  let n=Math.max(1,Math.ceil(Math.log(alpha)/Math.log(target)));
  while(target**n>alpha)n++;
  while(n>1&&target**(n-1)<=alpha)n--;
  assert.ok(Number.isSafeInteger(n));
  return n;
}

/**
 * Fixed equal-replicate 32-field design: each opponent has n games.
 * If the true field-average success probability is <= target, AM-GM gives
 * P(all m*n games wins) = prod(p_i**n) <= (mean_i p_i)**(m*n)
 *                        <= target**(m*n).
 * A balanced fixed schedule supports an aggregate field-mean inference,
 * but never simultaneously establishes the target for each opponent.
 * @param {object} options Input design only, not observed match evidence.
 * @param {number} options.opponentCount Number of fixed authentic source decks.
 * @param {number} options.target Expected field-average success threshold.
 * @param {number} options.alpha One-sided test size.
 * @returns {{perOpponent:number,total:number,allWinNullProbabilityBound:number}}
 */
function minimumBalancedFieldZeroLossDesign({opponentCount,target,alpha}){
  assert.ok(Number.isSafeInteger(opponentCount)&&opponentCount>=1);
  const minTotal=minimumZeroLossTrials(target,alpha);
  const perOpponent=Math.ceil(minTotal/opponentCount);
  const total=perOpponent*opponentCount;
  assert.ok(Number.isSafeInteger(total));
  return Object.freeze({
    opponentCount,target,alpha,perOpponent,total,
    allWinNullProbabilityBound:target**total,
    interpretation:'equal-field-average-only',
    requiresPredeclaredSchedule:true,
    requiresIndependentFullyQualifiedGames:true,
    enablesChosenPostHocDeckSelection:false
  });
}

/**
 * Bonferroni one-sided familywise design: independently reject per-opponent
 * null p_i <= target at alpha/m with zero failures, all opponents included.
 * This is MUCH stronger than demonstrating a field-average win probability.
 * @param {object} options Prespecified evaluation design.
 * @param {number} options.opponentCount Number of original source opponents.
 * @param {number} options.target Desired minimum success in each individual matchup.
 * @param {number} options.alpha Simultaneous familywise error budget.
 * @returns {{perOpponent:number,total:number,perOpponentAlpha:number}}
 */
function minimumSimultaneousEveryMatchupZeroLossDesign({
  opponentCount,target,alpha}){
  assert.ok(Number.isSafeInteger(opponentCount)&&opponentCount>=1);
  const perOpponentAlpha=alpha/opponentCount;
  const perOpponent=minimumZeroLossTrials(target,perOpponentAlpha);
  const total=perOpponent*opponentCount;
  assert.ok(Number.isSafeInteger(total));
  return Object.freeze({
    opponentCount,target,alpha,perOpponent,total,perOpponentAlpha,
    oneOpponentAllWinNullBound:target**perOpponent,
    familywiseNullBound:opponentCount*(target**perOpponent),
    interpretation:'simultaneous-every-matchup',
    requiresPredeclaredSchedule:true,
    requiresIndependentFullyQualifiedGames:true,
    enablesChosenPostHocDeckSelection:false
  });
}

module.exports={VERSION,minimumZeroLossTrials,
  minimumBalancedFieldZeroLossDesign,
  minimumSimultaneousEveryMatchupZeroLossDesign};
