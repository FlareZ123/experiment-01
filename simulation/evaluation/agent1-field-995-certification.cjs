'use strict';

const assert=require('node:assert/strict');

/**
 * Smallest count of independent all-win trials whose one-sided exact
 * zero-loss rejection p-value is at most alpha under win rate <= target.
 * There must be a frozen, unbiased evaluation policy and complete games.
 *
 * @param {number} target Hypothesized field-average win probability.
 * @param {number} alpha Maximum type-I error probability.
 * @returns {number}
 */
function minZeroLossGames(target=0.995,alpha=0.05) {
  assert.ok(Number.isFinite(target)&&target>0&&target<1);
  assert.ok(Number.isFinite(alpha)&&alpha>0&&alpha<1);
  return Math.ceil(Math.log(alpha)/Math.log(target));
}

/**
 * A predeclared exact balanced panel of n independent games in every
 * opponent-rank by physical-candidate-seat cell. By AM-GM, for cell win
 * rates p_i and equally many n games in each cell,
 * P(all wins) = product(p_i**n) <= (mean(p_i)) ** (cells*n).
 * This remains valid for heterogeneous matchup rates, provided each
 * cell has its own fixed game-winning probability and all games are
 * independent. The field mean is the equal-cell win probability.
 *
 * @param {number} opponents Source opponent sixties.
 * @param {number} candidateSeats Count of physical candidate seats.
 * @param {number} gamesPerCell Independent games in each balanced cell.
 * @param {number} target Win rate to reject if all games win.
 * @param {number} alpha One-sided test error allowance.
 * @returns {object}
 */
function balancedAllWinPanel(
  opponents=32,candidateSeats=2,gamesPerCell=10,
  target=0.995,alpha=0.05
) {
  for(const n of [opponents,candidateSeats,gamesPerCell])
    assert.ok(Number.isSafeInteger(n)&&n>=1);
  assert.ok(Number.isFinite(target)&&target>0&&target<1);
  assert.ok(Number.isFinite(alpha)&&alpha>0&&alpha<1);
  const cells=opponents*candidateSeats;
  const games=cells*gamesPerCell;
  const allWinNullBound=Math.exp(games*Math.log(target));
  const oneSidedLowerBound=Math.exp(Math.log(alpha)/games);
  return {
    opponents,candidateSeats,cells,gamesPerCell,games,
    target,alpha,allWinNullBound,oneSidedLowerBound,
    qualifiesIfAllWins:allWinNullBound<=alpha,
    qualifiesWithAnyUnresolvedOrLoss:false,
    requiredAllWin:true,
    assumptions:[
      'One single immutable 60 and one fixed owner-safe legal policy',
      'All originally registered 32 opponent sixties and actual playing policies',
      'Independent physical game randomization and independent outcomes',
      'Identical number of trials per opponent by physical candidate-seat cell',
      'Every trial fully adjudicated by paper rules and applicable match clock',
      'No data-dependent deck or policy selection on the evaluation trials'
    ]
  };
}

/**
 * Conservative simultaneous all-win 95% claim that each of K distinct
 * cells separately meets target, using Bonferroni alpha/K.
 * Unlike one balanced overall-mean claim, this is a per-cell familywise
 * guarantee and generally costs much more data.
 *
 * @param {number} cells
 * @param {number} target
 * @param {number} familywiseAlpha
 * @returns {{cells:number,gamesPerCell:number,totalGames:number}}
 */
function simultaneousPerCellAllWinPanel(
  cells,target=0.995,familywiseAlpha=0.05
) {
  assert.ok(Number.isSafeInteger(cells)&&cells>=1);
  const gamesPerCell=minZeroLossGames(target,familywiseAlpha/cells);
  return {cells,gamesPerCell,totalGames:cells*gamesPerCell};
}

module.exports={
  minZeroLossGames,balancedAllWinPanel,
  simultaneousPerCellAllWinPanel
};
