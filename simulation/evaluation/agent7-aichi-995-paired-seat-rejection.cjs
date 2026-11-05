'use strict';

const assert = require('node:assert/strict');
const {
  FIELD_RANKS, FIELD_TARGET, NECESSARY_RANK_WIN_RATE,
  FAMILYWISE_ALPHA, E_THRESHOLD
} = require('./agent7-aichi-995-early-rejection.cjs');

const VERSION = 'agent7-aichi-995-completed-seat-pair-anytime-falsification-v1';
const PAIR_NULL_MAX_MEAN_NONWIN = 0.16;
assert.ok(Math.abs(PAIR_NULL_MAX_MEAN_NONWIN - (1 - NECESSARY_RANK_WIN_RATE)) < 1e-12);
const BETS = Object.freeze([
  {lambda: 6.25, weight: 0.5},
  {lambda: 4, weight: 0.2},
  {lambda: 2, weight: 0.2},
  {lambda: 1, weight: 0.1}
]);
assert.ok(Math.abs(BETS.reduce((sum, row) => sum + row.weight, 0) - 1) < 1e-12);
assert.ok(BETS.every(row => row.lambda > 0 &&
  row.lambda <= 1 / PAIR_NULL_MAX_MEAN_NONWIN && row.weight > 0));

/**
 * Fixed-mixture e-value from completed original-opponent two-seat pairs.
 * Each count bin represents 0, 1 or 2 nonwins across one actual game per
 * physical source seat. Z=nonwins/2 lies in [0,1]. Under the 99.5% field
 * target, every rank has E[Z | prior completed pairs] <= 0.16, even if the
 * two games inside a pair are correlated. For each fixed lambda in (0,6.25],
 * e=1+lambda*(Z-0.16) is nonnegative with conditional expectation <=1.
 * Products of these factors are supermartingales; fixed mixtures remain so.
 *
 * @param {[number,number,number]} bins Completed pairs with 0,1,2 nonwins.
 * @returns {number} Natural log of the exact mixture e-value.
 */
function completedPairLogEValue(bins) {
  assert.ok(Array.isArray(bins) && bins.length === 3 &&
    bins.every(value => Number.isSafeInteger(value) && value >= 0));
  const terms = BETS.map(({lambda, weight}) => {
    let logE = Math.log(weight);
    for (const [nonwins, count] of bins.entries()) {
      if (count === 0) continue;
      const factor = 1 + lambda * (nonwins / 2 - PAIR_NULL_MAX_MEAN_NONWIN);
      if (factor <= 0) return -Infinity;
      logE += count * Math.log(factor);
    }
    return logE;
  });
  const maximum = Math.max(...terms);
  return maximum + Math.log(terms.reduce((sum, term) =>
    sum + Math.exp(term - maximum), 0));
}

/**
 * Pure diagnostic for completed balanced physical-seat pairs. Every pair
 * needs one genuinely qualified game with source seat 0 and one with source
 * seat 1. Pairs may have correlated within-pair outcomes, including common
 * shuffle seeds, but their conditional expected average nonwin rate across
 * completed pairs must remain <=0.16 under the null. The pair-selection and
 * qualification labels cannot be authenticated by this pure calculator.
 * Do not stop or select a pair based on its first game's outcome.
 *
 * @param {Array<{id:string,candidateId:string,originalRank:number,
 *   pairSampling:'FRESH_UNBIASED_COMPLETE_PAIR',seat0:object,seat1:object}>} pairs
 * @param {string} fixedCandidateId Exact immutable 60 and playing-policy ID.
 * @returns {object} Conditional familywise-5% statistical rejection monitor.
 */
function assessCompletedSeatPairRejection(pairs, fixedCandidateId) {
  assert.ok(Array.isArray(pairs));
  assert.ok(typeof fixedCandidateId === 'string' && fixedCandidateId.length > 0);
  const idSet = new Set();
  const usedGameIds = new Set();
  const bins = Array.from({length: FIELD_RANKS}, () => [0, 0, 0]);
  let firstCrossing = null;
  for (const [index, pair] of pairs.entries()) {
    assert.ok(pair && typeof pair.id === 'string' && pair.id.length > 0);
    assert.ok(!idSet.has(pair.id), 'Duplicate completed pair');
    idSet.add(pair.id);
    assert.equal(pair.candidateId, fixedCandidateId,
      'Do not mix changed frozen 60s or policy versions');
    assert.ok(Number.isSafeInteger(pair.originalRank) &&
      pair.originalRank >= 1 && pair.originalRank <= FIELD_RANKS);
    assert.equal(pair.pairSampling, 'FRESH_UNBIASED_COMPLETE_PAIR',
      'A selected, incomplete or reused pair cannot enter anytime inference');
    let nonwins = 0;
    for (const seat of [0, 1]) {
      const game = seat === 0 ? pair.seat0 : pair.seat1;
      assert.ok(game && typeof game.id === 'string' && game.id.length > 0);
      assert.ok(!usedGameIds.has(game.id), 'Physical game reused across pairs');
      usedGameIds.add(game.id);
      assert.equal(game.sourceSeat, seat,
        'Each completed pair must contain exactly one game in each source physical seat');
      assert.equal(game.qualification, 'QUALIFIED',
        'Aborted, capped or native-only games do not form a completed pair');
      assert.ok(['win', 'loss', 'tie'].includes(game.outcome));
      if (game.outcome !== 'win') nonwins++;
    }
    const byRank = bins[pair.originalRank - 1];
    byRank[nonwins]++;
    if (firstCrossing === null) {
      const logE = completedPairLogEValue(byRank);
      if (logE >= Math.log(E_THRESHOLD)) firstCrossing = {
        ordinal: index + 1,
        pairId: pair.id,
        originalRank: pair.originalRank,
        rankCompletedPairs: byRank.reduce((sum, count) => sum + count, 0),
        rankLogEValue: logE
      };
    }
  }
  return {
    version: VERSION,
    fixedCandidateId,
    targetGameWinRate: FIELD_TARGET,
    necessaryRankGameWinRate: NECESSARY_RANK_WIN_RATE,
    pairNullMaxMeanNonwin: PAIR_NULL_MAX_MEAN_NONWIN,
    familywiseAlpha: FAMILYWISE_ALPHA,
    rankEValueThreshold: E_THRESHOLD,
    observedClaimedCompletePairs: pairs.length,
    observedClaimedQualifiedGames: 2 * pairs.length,
    firstCrossing,
    rejectionFlag: firstCrossing !== null,
    ranks: bins.map((counts, index) => ({
      originalRank: index + 1,
      pairNonwinBins: counts.slice(),
      completedPairs: counts.reduce((sum, count) => sum + count, 0),
      logEValue: completedPairLogEValue(counts)
    })),
    withinPairIndependenceRequired: false,
    completePairsAndConditionalExpectationsVerifiedExternally: false,
    qualificationVerifiedExternally: false,
    interpretation: firstCrossing ?
      'CONDITIONAL-EARLY-REJECTION; externally verify all complete paired games' :
      'NO-EARLY-REJECTION; no positive 99.5-percent field evidence',
    admissionCaveat: 'Requires one fully qualified match per physical seat in each prospectively completed unbiased pair, correct original 60, fixed policies, conditional expected pair nonwin<=0.16 under the null, and independently verified game outcomes; tags cannot certify this.'
  };
}

module.exports = {VERSION, BETS, PAIR_NULL_MAX_MEAN_NONWIN,
  completedPairLogEValue, assessCompletedSeatPairRejection};
