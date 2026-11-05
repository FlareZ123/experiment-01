'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent15-aichi-995-complete-paired-seat-eprocess-v1';
const FIELD_RANKS = 32;
const FIELD_TARGET = 0.995;
const NECESSARY_RANK_WIN_RATE = 0.84;
const MAX_EXPECTED_PAIR_NONWINS = 2 * (1 - NECESSARY_RANK_WIN_RATE);
const FAMILYWISE_ALPHA = 0.05;
const E_THRESHOLD = FIELD_RANKS / FAMILYWISE_ALPHA;
const COMPONENTS = Object.freeze([
  Object.freeze({base: 2, weight: 0.2}),
  Object.freeze({base: 4, weight: 0.2}),
  Object.freeze({base: 16, weight: 0.1}),
  Object.freeze({base: 1024, weight: 0.5})
]);

/**
 * Under the per-rank null, each complete 0/1-seat block has expected
 * nonwins <= 0.32 before observing either game. The bound holds for any
 * within-block dependence, including shared seeds. For L in {0,1,2},
 * exp(t L) <= 1 + L * (exp(2t) - 1)/2, t>0.
 * Thus the conditional expectation of exp(t L) is at most
 * 0.84 + 0.16 exp(2t). The fixed convex mixture of products of these
 * normalized factors is a nonnegative supermartingale across blocks.
 * It is never updated after an individual game inside a block.
 *
 * @param {number} nonwins Number of nonwinning results in complete pairs.
 * @param {number} blocks Number of completed two-seat blocks.
 * @returns {number} Natural logarithm of e-value, stable for large samples.
 */
function pairedRankLogEValue(nonwins, blocks) {
  assert.ok(Number.isSafeInteger(blocks) && blocks >= 0);
  assert.ok(Number.isSafeInteger(nonwins) && nonwins >= 0 &&
    nonwins <= 2 * blocks);
  const terms = COMPONENTS.map(({base, weight}) => {
    const t = Math.log(base);
    const denominator = 1 - MAX_EXPECTED_PAIR_NONWINS / 2 +
      MAX_EXPECTED_PAIR_NONWINS / 2 * base * base;
    return Math.log(weight) + t * nonwins - blocks * Math.log(denominator);
  });
  const maxTerm = Math.max(...terms);
  return maxTerm + Math.log(terms.reduce((sum, term) =>
    sum + Math.exp(term - maxTerm), 0));
}

/**
 * Predeclared 2-game block: actual original source occupies seat 0 once,
 * then seat 1 once (either order). Seat-specific outcomes may be correlated.
 * Blocks MUST be fresh and independent of past outcomes conditional on the
 * declared rank, with no between-block selection of physical openings.
 * Every attempted block and game must be externally accounted for; this
 * fail-closed analyzer accepts only a complete, paper-QUALIFIED pair.
 *
 * @typedef {{id:string,sourceSeat:0|1,outcome:'win'|'loss'|'tie',
 *   qualification:'QUALIFIED'}} PairedGame
 * @typedef {{id:string,originalRank:number,candidateId:string,
 *   seatAssignment:'COMPLETE_0_1_PAIR',
 *   blockSampling:'FRESH_PREDECLARED_PAIR',games:[PairedGame,PairedGame]}}
 *   PairedBlock
 *
 * @param {PairedBlock[]} pairedBlocks Complete blocks in observation order.
 * @param {string} fixedCandidateId Immutable exact-60 identifier.
 * @returns {object} Conditional statistical diagnostic, never game admission.
 */
function assessPairedFieldRejection(pairedBlocks, fixedCandidateId) {
  assert.ok(Array.isArray(pairedBlocks));
  assert.ok(typeof fixedCandidateId === 'string' && fixedCandidateId.length > 0);
  const ids = new Set();
  const states = Array.from({length: FIELD_RANKS}, () => ({
    completeBlocks: 0, wins: 0, nonwins: 0, seatWins: [0, 0],
    seatNonwins: [0, 0]
  }));
  let firstCrossing = null;
  const thresholdLog = Math.log(E_THRESHOLD);
  for (const [index, block] of pairedBlocks.entries()) {
    assert.ok(block && typeof block === 'object');
    assert.ok(typeof block.id === 'string' && block.id.length > 0);
    assert.ok(!ids.has(block.id), 'Pair and match IDs must be globally unique');
    ids.add(block.id);
    assert.equal(block.candidateId, fixedCandidateId,
      'A test cannot mix fixed candidate 60-card identities');
    assert.ok(Number.isSafeInteger(block.originalRank) &&
      block.originalRank >= 1 && block.originalRank <= FIELD_RANKS);
    assert.equal(block.seatAssignment, 'COMPLETE_0_1_PAIR');
    assert.equal(block.blockSampling, 'FRESH_PREDECLARED_PAIR');
    assert.ok(Array.isArray(block.games) && block.games.length === 2,
      'Only complete two-game blocks can be tested');
    const seats = new Set();
    let losses = 0;
    const state = states[block.originalRank - 1];
    for (const game of block.games) {
      assert.ok(game && typeof game === 'object');
      assert.ok(typeof game.id === 'string' && game.id.length > 0);
      assert.ok(!ids.has(game.id), 'Pair and match IDs must be globally unique');
      ids.add(game.id);
      assert.ok(game.sourceSeat === 0 || game.sourceSeat === 1);
      assert.ok(!seats.has(game.sourceSeat), 'Each physical seat must occur exactly once');
      seats.add(game.sourceSeat);
      assert.equal(game.qualification, 'QUALIFIED',
        'Capped, native-only or paper-invalid games cannot enter evidence');
      assert.ok(['win', 'loss', 'tie'].includes(game.outcome));
      if (game.outcome === 'win') state.seatWins[game.sourceSeat]++;
      else {
        losses++;
        state.seatNonwins[game.sourceSeat]++;
      }
    }
    assert.equal(seats.size, 2);
    state.completeBlocks++;
    state.wins += 2 - losses;
    state.nonwins += losses;
    if (firstCrossing === null) {
      const logE = pairedRankLogEValue(state.nonwins, state.completeBlocks);
      if (logE >= thresholdLog) firstCrossing = {
        pairOrdinal: index + 1, pairId: block.id,
        originalRank: block.originalRank,
        rankCompleteBlocks: state.completeBlocks,
        rankWins: state.wins, rankNonwins: state.nonwins,
        rankLogEValue: logE
      };
    }
  }
  const ranks = states.map((state, index) => ({
    originalRank: index + 1, ...state,
    logEValue: pairedRankLogEValue(state.nonwins, state.completeBlocks)
  }));
  return {
    version: VERSION, fixedCandidateId,
    completeBlockClaims: pairedBlocks.length,
    qualifiedGameClaims: 2 * pairedBlocks.length,
    fieldTarget: FIELD_TARGET,
    necessaryRankWinRate: NECESSARY_RANK_WIN_RATE,
    familywiseAlpha: FAMILYWISE_ALPHA,
    rankEValueThreshold: E_THRESHOLD,
    eComponents: COMPONENTS.map(x => ({...x})),
    firstCrossing, rejectionFlag: firstCrossing !== null, ranks,
    qualificationVerifiedExternally: false,
    samplingIndependenceVerifiedExternally: false,
    interpretation: firstCrossing ?
      'CONDITIONAL-STATISTICAL-REJECTION; verify all block/game admissions' :
      'NO-EARLY-REJECTION; not evidence of 99.5-percent field win rate',
    provenanceCaveat: 'QUALIFIED, 0/1 seat presence and fresh block sampling are self-asserted. Requires external original-60, clock, policy, independent-block, no-selection/censoring, actual-seat, paper-rule and opponent competence audits. Correlated games within each complete predeclared block are allowed; dependence between blocks is not automatically allowed.'
  };
}

module.exports = {
  VERSION, FIELD_RANKS, FIELD_TARGET, NECESSARY_RANK_WIN_RATE,
  MAX_EXPECTED_PAIR_NONWINS, FAMILYWISE_ALPHA, E_THRESHOLD,
  COMPONENTS, pairedRankLogEValue, assessPairedFieldRejection
};
