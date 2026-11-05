'use strict';

const assert = require('node:assert/strict');
const {
  RANKS, FIELD_TARGET, NECESSARY_RANK_WIN_RATE,
  ALPHA, GLOBAL_E_THRESHOLD, assessBalancedPairRejection
} = require('./agent10-995-balanced-pair-early-rejection.cjs');

const VERSION = 'agent10-995-arbitrary-within-pair-dependence-anytime-v1';
const MAX_NULL_EXPECTED_NONWINS_PER_PAIR = 2 * (1 - NECESSARY_RANK_WIN_RATE);
const BETS = Object.freeze([
  Object.freeze({eta: 0.25, weight: 0.1}),
  Object.freeze({eta: 0.75, weight: 0.2}),
  Object.freeze({eta: 1.5, weight: 0.3}),
  Object.freeze({eta: 3.125, weight: 0.4})
]);
assert.equal(BETS.reduce((sum, bet) => sum + bet.weight, 0), 1);
assert.ok(BETS.every(bet =>
  bet.eta > 0 && bet.eta <= 1 / MAX_NULL_EXPECTED_NONWINS_PER_PAIR));

/**
 * @param {number[]} logTerms Logarithms of nonnegative components.
 * @returns {number} Stable logarithm of the sum.
 */
function logSumExp(logTerms) {
  const maximum = Math.max(...logTerms);
  if (maximum === -Infinity) return -Infinity;
  return maximum + Math.log(logTerms.reduce((sum, x) =>
    sum + Math.exp(x - maximum), 0));
}

/**
 * Nonnegative two-seat block e-factor valid with arbitrary within-pair
 * dependence. Under the rank null, the conditional mean count of nonwins
 * within a complete precommitted block is at most 0.32. No assumption about
 * independence between the two seat-game outcomes is used here.
 *
 * @param {0|1|2} nonwins Number of losses or counted ties in a full pair.
 * @param {number} eta Fixed nonnegative betting rate, at most 1/0.32.
 * @returns {number} One block's nonnegative e-factor.
 */
function dependenceRobustBlockFactor(nonwins, eta) {
  assert.ok(Number.isInteger(nonwins) && nonwins >= 0 && nonwins <= 2);
  assert.ok(Number.isFinite(eta) && eta >= 0 &&
    eta <= 1 / MAX_NULL_EXPECTED_NONWINS_PER_PAIR);
  return Math.max(0, 1 + eta *
    (nonwins - MAX_NULL_EXPECTED_NONWINS_PER_PAIR));
}

/**
 * An anytime-valid, field-wide hypothesis rejection test for one frozen deck
 * using complete prospective blocks of two actual-source physical seats.
 *
 * The same structural shape validator is reused from the independent-seat
 * test, solely for admission/IDs/qualification/count custody. Its statistical
 * values and independence assumptions are not used or returned.
 *
 * The only within-pair stochastic assumption is that for every completed
 * block, conditional on all PREVIOUS completed blocks, the sum of the two
 * nonwin probabilities is <=0.32 under the field target. Outcomes within a
 * block may share seeds, source decks, common randomness, or other latent
 * factors. Blocks need not be mutually independent, but conditional means
 * must be valid. Which rank to test next may depend on earlier full blocks.
 *
 * This procedure does not authenticate a conditional distribution, card
 * rules, independent deal sampling, printings, complete games or clock.
 *
 * @param {Array<object>} blocks Precommitted full pairs, structurally validated.
 * @param {string} fixedCandidateId Immutable 60, policy and event identities.
 * @returns {object} Explicitly conditional evidence for rejecting 99.5%.
 */
function assessDependenceRobustPairedRejection(blocks, fixedCandidateId) {
  const structure = assessBalancedPairRejection(blocks, fixedCandidateId);
  const rankLogs = Array.from({length: RANKS}, () =>
    BETS.map(bet => Math.log(bet.weight)));
  const rankCounts = structure.ranks.map(row => ({
    originalRank: row.originalRank,
    pairedBlocks: row.pairedBlocks,
    wins: row.wins,
    nonwins: row.nonwins,
    sourceSeatCounts: [...row.sourceSeatCounts]
  }));
  let firstCrossing = null;
  for (const [index, block] of blocks.entries()) {
    const row = rankLogs[block.originalRank - 1];
    const nonwins = block.games.filter(game =>
      game.outcome !== 'win').length;
    for (let betIndex = 0; betIndex < BETS.length; betIndex++) {
      const factor = dependenceRobustBlockFactor(nonwins, BETS[betIndex].eta);
      row[betIndex] += factor === 0 ? -Infinity : Math.log(factor);
    }
    const rankLogEValues = rankLogs.map(logSumExp);
    const globalLogEValue = logSumExp(rankLogEValues) - Math.log(RANKS);
    if (firstCrossing === null &&
        globalLogEValue >= Math.log(GLOBAL_E_THRESHOLD)) {
      firstCrossing = {
        blockOrdinal: index + 1, blockId: block.id,
        originalRank: block.originalRank,
        globalLogEValue,
        rankLogEValue: rankLogEValues[block.originalRank - 1]
      };
    }
  }
  const ranks = rankCounts.map((row, index) => ({
    ...row, logEValue: logSumExp(rankLogs[index])
  }));
  const globalLogEValue =
    logSumExp(ranks.map(row => row.logEValue)) - Math.log(RANKS);
  return {
    version: VERSION, fixedCandidateId,
    hypothesis: 'FIELD_WIN_RATE_AT_LEAST_0_995',
    fieldTarget: FIELD_TARGET, originalRanks: RANKS,
    necessaryEqualSeatRankWinRate: NECESSARY_RANK_WIN_RATE,
    maximumNullExpectedNonwinsPerPair:
      MAX_NULL_EXPECTED_NONWINS_PER_PAIR,
    bets: BETS.map(bet => ({...bet})),
    alpha: ALPHA, globalEThreshold: GLOBAL_E_THRESHOLD,
    completedBlockClaims: blocks.length,
    qualifiedGameClaims: structure.observedQualifiedGameClaims,
    firstCrossing, rejectionFlag: firstCrossing !== null,
    globalLogEValue, ranks,
    withinPairIndependenceRequired: false,
    interBlockIndependenceRequired: false,
    externallyVerifiedConditionalNullMean: false,
    externallyVerifiedCompetitiveGameQualification: false,
    verdict: firstCrossing ?
      'CONDITIONAL-REJECTION-WITHIN-PAIR-DEPENDENCE-ROBUST' :
      'NO-REJECTION-NEVER-A-POSITIVE-995-CERTIFICATE',
    caveat: 'Game qualification, original ranks, frozen policies, prospective block completion and conditional nonwin count mean <=0.32 are externally unverified. Shared seed is allowed within a pair only when it does not violate the conditional mean requirement across blocks. A block cannot be stopped or discarded based on its first result.'
  };
}

module.exports = {
  VERSION, MAX_NULL_EXPECTED_NONWINS_PER_PAIR, BETS,
  dependenceRobustBlockFactor, assessDependenceRobustPairedRejection
};
