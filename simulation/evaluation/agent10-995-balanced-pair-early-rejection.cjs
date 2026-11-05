'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent10-995-balanced-pair-anytime-field-rejection-v1';
const RANKS = 32;
const FIELD_TARGET = 0.995;
const NECESSARY_RANK_WIN_RATE = 0.84;
const NULL_SEAT_NONWIN_MEAN = 1 - NECESSARY_RANK_WIN_RATE;
const ALPHA = 0.05;
const GLOBAL_E_THRESHOLD = 1 / ALPHA;
const ALTERNATIVES = Object.freeze([
  Object.freeze({nonwinRate: 0.25, weight: 0.1}),
  Object.freeze({nonwinRate: 0.5, weight: 0.2}),
  Object.freeze({nonwinRate: 0.75, weight: 0.2}),
  Object.freeze({nonwinRate: 1, weight: 0.5})
]);

assert.ok(Math.abs((RANKS - 1 + NECESSARY_RANK_WIN_RATE) /
  RANKS - FIELD_TARGET) < 1e-12);
assert.ok(Math.abs(ALTERNATIVES.reduce((sum, x) => sum + x.weight, 0) - 1) < 1e-12);

/**
 * Numerically stable logarithm of a sum of nonnegative exponentials.
 * @param {number[]} terms Logarithms, including optional -Infinity.
 * @returns {number} Logarithm of the sum.
 */
function logSumExp(terms) {
  const highest = Math.max(...terms);
  if (highest === -Infinity) return -Infinity;
  return highest + Math.log(terms.reduce((sum, term) =>
    sum + Math.exp(term - highest), 0));
}

/**
 * E-value log mixture for completed, independently sampled two-seat blocks.
 *
 * Every block contains one original-source physical seat 0 and one seat 1.
 * If their independent nonwin probabilities are r0,r1 with (r0+r1)/2<=0.16,
 * then for lambda>=0:
 * E[exp(lambda*(L0+L1))] =
 * (1+r0*(exp(lambda)-1))*(1+r1*(exp(lambda)-1))
 * <= (1+0.16*(exp(lambda)-1))**2, by AM-GM.
 *
 * Thus the paired likelihood ratio using any fixed alternative nonwin rate
 * q>0.16 has conditional expectation at most one under that null. A fixed
 * convex mixture remains an e-process at completed block boundaries.
 *
 * @param {number} wins Nonnegative even-block-total qualified wins.
 * @param {number} nonwins Nonnegative qualified losses or counted ties.
 * @returns {number} Log e-value; no outcome is generated here.
 */
function pairedRankLogEValue(wins, nonwins) {
  assert.ok(Number.isSafeInteger(wins) && wins >= 0);
  assert.ok(Number.isSafeInteger(nonwins) && nonwins >= 0);
  assert.equal((wins + nonwins) % 2, 0,
    'Evidence must contain complete two-seat blocks only');
  const logTerms = ALTERNATIVES.map(({nonwinRate: q, weight}) => {
    if (q === 1 && wins > 0) return -Infinity;
    return Math.log(weight) +
      nonwins * Math.log(q / NULL_SEAT_NONWIN_MEAN) +
      (wins === 0 ? 0 :
        wins * Math.log((1 - q) / NECESSARY_RANK_WIN_RATE));
  });
  return logSumExp(logTerms);
}

/**
 * Conditional anytime test of the necessary rank-level 84% win-rate floor.
 *
 * Each block must have been precommitted BEFORE either independent match
 * outcome is observed, with two genuinely independent physical game deals,
 * exactly one source seat 0 and one source seat 1, and no outcome-dependent
 * cancellation. Interleave ranks adaptively only BETWEEN completed blocks.
 * A changing deck/policy, dependent deal, or censoring invalidates inference.
 *
 * Under the 99.5% equally weighted 32-opponent field null, every rank's
 * equal-seat win rate must be at least 84%. Each rank-specific block
 * e-process is then a nonnegative supermartingale; their fixed uniform
 * mixture is also one, even if which rank to sample next is adapted to
 * completed blocks. Ville's inequality gives a 5% anytime rejection
 * boundary at GLOBAL_E_THRESHOLD=20 for this fixed candidate.
 *
 * Text labels are only declared claims. This module cannot independently
 * verify qualification, precommitment, independence, original 60-card
 * fidelity, paper rules, source competence, or an official event clock.
 *
 * @param {Array<{id:string,design:'PRECOMMITTED_ONE_PER_SEAT',
 *   originalRank:number,candidateId:string,games:Array<{
 *   id:string,sourceSeat:0|1,outcome:'win'|'loss'|'tie',
 *   qualification:'QUALIFIED'}>}>} blocks Complete preregistered pairs.
 * @param {string} fixedCandidateId Immutable 60-card and policy identity.
 * @returns {object} Qualified-input-conditional rejection diagnostic.
 */
function assessBalancedPairRejection(blocks, fixedCandidateId) {
  assert.ok(Array.isArray(blocks));
  assert.ok(typeof fixedCandidateId === 'string' && fixedCandidateId.length > 0);
  const seenBlocks = new Set();
  const seenGames = new Set();
  const ranks = Array.from({length: RANKS}, (_, index) => ({
    originalRank: index + 1, pairedBlocks: 0, wins: 0, nonwins: 0,
    sourceSeatCounts: [0, 0]
  }));
  let firstCrossing = null;
  for (const [index, block] of blocks.entries()) {
    assert.ok(block && typeof block === 'object');
    assert.ok(typeof block.id === 'string' && block.id.length > 0);
    assert.ok(!seenBlocks.has(block.id), 'Duplicate preregistered block');
    seenBlocks.add(block.id);
    assert.equal(block.design, 'PRECOMMITTED_ONE_PER_SEAT');
    assert.equal(block.candidateId, fixedCandidateId,
      'A fixed-candidate test cannot mix decks or playing policies');
    assert.ok(Number.isSafeInteger(block.originalRank) &&
      block.originalRank >= 1 && block.originalRank <= RANKS);
    assert.ok(Array.isArray(block.games) && block.games.length === 2,
      'Only fully completed two-seat blocks can be used');
    const seatSet = new Set();
    const row = ranks[block.originalRank - 1];
    for (const game of block.games) {
      assert.ok(game && typeof game === 'object');
      assert.ok(typeof game.id === 'string' && game.id.length > 0);
      assert.ok(!seenGames.has(game.id), 'Duplicate game identity');
      seenGames.add(game.id);
      assert.ok(game.sourceSeat === 0 || game.sourceSeat === 1);
      assert.ok(!seatSet.has(game.sourceSeat),
        'The block must have exactly one game per physical seat');
      seatSet.add(game.sourceSeat);
      assert.equal(game.qualification, 'QUALIFIED',
        'Capped, aborted, engine-only and unqualified games are excluded');
      assert.ok(['win', 'loss', 'tie'].includes(game.outcome));
      row.sourceSeatCounts[game.sourceSeat]++;
      if (game.outcome === 'win') row.wins++;
      else row.nonwins++;
    }
    row.pairedBlocks++;
    const rankLogValues = ranks.map(r =>
      pairedRankLogEValue(r.wins, r.nonwins));
    const globalLogEValue = logSumExp(rankLogValues) - Math.log(RANKS);
    if (firstCrossing === null &&
        globalLogEValue >= Math.log(GLOBAL_E_THRESHOLD)) {
      firstCrossing = {
        completedBlockOrdinal: index + 1,
        blockId: block.id,
        originalRank: block.originalRank,
        globalLogEValue,
        rankLogEValue: rankLogValues[block.originalRank - 1]
      };
    }
  }
  const outputRanks = ranks.map(row => ({
    ...row, logEValue: pairedRankLogEValue(row.wins, row.nonwins)
  }));
  const globalLogEValue = logSumExp(outputRanks.map(row => row.logEValue)) -
    Math.log(RANKS);
  return {
    version: VERSION, fixedCandidateId,
    fieldTarget: FIELD_TARGET,
    necessaryEqualSeatRankWinRate: NECESSARY_RANK_WIN_RATE,
    originalRanks: RANKS,
    alpha: ALPHA,
    globalEThreshold: GLOBAL_E_THRESHOLD,
    alternatives: ALTERNATIVES.map(row => ({...row})),
    completedBlockClaims: blocks.length,
    observedQualifiedGameClaims: seenGames.size,
    firstCrossing, rejectionFlag: firstCrossing !== null,
    globalLogEValue, ranks: outputRanks,
    independentBlockPrecommitmentVerifiedExternally: false,
    qualifiedGamesVerifiedExternally: false,
    interpretation: firstCrossing ?
      'CONDITIONAL-STATISTICAL-REJECTION; external admission remains mandatory' :
      'NO-EARLY-REJECTION; never evidence of attaining 99.5%',
    provenanceCaveat: 'One-per-seat labels and QUALIFIED labels are self-asserted. All game independence, prospective block completion, unchanged policies, paper rules, original physical deals and 25-minute adjudication must be audited outside this module.'
  };
}

module.exports = {
  VERSION, RANKS, FIELD_TARGET, NECESSARY_RANK_WIN_RATE,
  NULL_SEAT_NONWIN_MEAN, ALPHA, GLOBAL_E_THRESHOLD, ALTERNATIVES,
  pairedRankLogEValue, assessBalancedPairRejection
};
