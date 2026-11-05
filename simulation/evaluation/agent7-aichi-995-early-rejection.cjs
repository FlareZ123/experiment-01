'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent7-aichi-995-anytime-rank-falsification-v1';
const FIELD_RANKS = 32;
const FIELD_TARGET = 0.995;
const NECESSARY_RANK_WIN_RATE = 0.84;
const FAMILYWISE_ALPHA = 0.05;
const E_THRESHOLD = FIELD_RANKS / FAMILYWISE_ALPHA;
const ALTERNATIVES = Object.freeze([
  {winRate: 0, weight: 0.5},
  {winRate: 0.25, weight: 0.2},
  {winRate: 0.5, weight: 0.2},
  {winRate: 0.7, weight: 0.1}
]);

assert.ok(Math.abs((FIELD_RANKS - 1 + NECESSARY_RANK_WIN_RATE) /
  FIELD_RANKS - FIELD_TARGET) < 1e-12);

/**
 * Exact likelihood-ratio-mixture log e-value for one original opponent rank.
 * The alternatives are fixed before observation and all lie below p=0.84.
 * Under the null p>=0.84, each component is a nonnegative supermartingale;
 * their fixed convex mixture is also one. No simulation is performed.
 *
 * @param {number} wins Independently qualified actual game wins.
 * @param {number} nonwins Independently qualified losses and counted ties.
 * @returns {number} Natural logarithm of the rank-specific e-value.
 */
function rankLogEValue(wins, nonwins) {
  assert.ok(Number.isSafeInteger(wins) && wins >= 0);
  assert.ok(Number.isSafeInteger(nonwins) && nonwins >= 0);
  const logTerms = ALTERNATIVES.map(({winRate, weight}) => {
    if (winRate === 0 && wins > 0) return -Infinity;
    return Math.log(weight) +
      (wins === 0 ? 0 : wins * Math.log(winRate / NECESSARY_RANK_WIN_RATE)) +
      nonwins * Math.log((1 - winRate) / (1 - NECESSARY_RANK_WIN_RATE));
  });
  const maximum = Math.max(...logTerms);
  return maximum + Math.log(logTerms.reduce((sum, term) =>
    sum + Math.exp(term - maximum), 0));
}

/**
 * Monitor the necessary per-rank 84% floor for an equally weighted 32-rank,
 * fixed-deck 99.5% field objective. Each input row MUST already be separately
 * adjudicated as an independent, paper-qualified real game. This pure module
 * can check the declared status but cannot independently certify admission,
 * opponent competence, seed independence, correct 60s or the event clock.
 *
 * At any stopping time, a rank e-value >= 32/0.05 provides a conservative
 * familywise-5% early rejection of the 99.5% field target, assuming the
 * fixed-deck conditional Bernoulli model and truthful input admission.
 * Other ranks may be scheduled adaptively. Censored trials never count.
 *
 * @param {Array<{id:string,candidateId:string,originalRank:number,
 *   outcome:'win'|'loss'|'tie',qualification:'QUALIFIED'}>} games
 * @param {string} fixedCandidateId Frozen 60-card identity/provenance key.
 * @returns {object} Conditional mathematical diagnostic, not a certification.
 */
function assessEarlyFieldRejection(games, fixedCandidateId) {
  assert.ok(Array.isArray(games));
  assert.ok(typeof fixedCandidateId === 'string' && fixedCandidateId.length > 0);
  const seenIds = new Set();
  const counts = Array.from({length: FIELD_RANKS}, () => ({wins: 0, nonwins: 0}));
  let firstCrossing = null;
  const logThreshold = Math.log(E_THRESHOLD);
  for (const [index, game] of games.entries()) {
    assert.ok(game && typeof game === 'object');
    assert.ok(typeof game.id === 'string' && game.id.length > 0);
    assert.ok(!seenIds.has(game.id), 'One qualified match must have one unique ID');
    seenIds.add(game.id);
    assert.equal(game.candidateId, fixedCandidateId,
      'A confidence sequence cannot mix different fixed decklists');
    assert.ok(Number.isSafeInteger(game.originalRank) &&
      game.originalRank >= 1 && game.originalRank <= FIELD_RANKS);
    assert.equal(game.qualification, 'QUALIFIED',
      'Unverified, aborted, capped and engine-only trials cannot enter evidence');
    assert.ok(['win', 'loss', 'tie'].includes(game.outcome));
    const state = counts[game.originalRank - 1];
    if (game.outcome === 'win') state.wins++;
    else state.nonwins++;
    if (firstCrossing === null) {
      const logE = rankLogEValue(state.wins, state.nonwins);
      if (logE >= logThreshold) firstCrossing = {
        ordinal: index + 1,
        matchId: game.id,
        originalRank: game.originalRank,
        rankWins: state.wins,
        rankNonwins: state.nonwins,
        rankLogEValue: logE
      };
    }
  }
  const ranks = counts.map((state, index) => ({
    originalRank: index + 1,
    ...state,
    logEValue: rankLogEValue(state.wins, state.nonwins)
  }));
  return {
    version: VERSION,
    fixedCandidateId,
    observedQualifiedClaims: games.length,
    opponentRanksObserved: ranks.filter(row => row.wins + row.nonwins > 0).length,
    fieldTarget: FIELD_TARGET,
    necessaryRankWinRate: NECESSARY_RANK_WIN_RATE,
    familywiseAlpha: FAMILYWISE_ALPHA,
    rankEValueThreshold: E_THRESHOLD,
    alternatives: ALTERNATIVES.map(row => ({...row})),
    firstCrossing,
    rejectionFlag: firstCrossing !== null,
    ranks,
    qualificationVerifiedExternally: false,
    interpretation: firstCrossing ?
      'CONDITIONAL-STATISTICAL-REJECTION; inputs require independent admission review' :
      'NO-EARLY-REJECTION; not evidence of the 99.5-percent win rate',
    provenanceCaveat: 'Input QUALIFIED flags are claims, not independently validated by this analyzer; external physical-deal, paper-rule, policy, opponent, all-rank, and clock custody remains necessary.'
  };
}

module.exports = {
  VERSION, FIELD_RANKS, FIELD_TARGET, NECESSARY_RANK_WIN_RATE,
  FAMILYWISE_ALPHA, E_THRESHOLD, ALTERNATIVES,
  rankLogEValue, assessEarlyFieldRejection
};
