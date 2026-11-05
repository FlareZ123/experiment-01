"use strict";

const assert = require("node:assert/strict");

const VERSION = "agent37-aichi-995-paired-seat-and-actual-start-eprocess-v2";
const FIELD_RANKS = 32;
const FIELD_TARGET = 0.995;
const REQUIRED_RANK_WIN_RATE = 1 - FIELD_RANKS * (1 - FIELD_TARGET);
const PAIR_NONWIN_BUDGET = 2 * (1 - REQUIRED_RANK_WIN_RATE);
const FAMILYWISE_ALPHA = 0.05;
const E_THRESHOLD = FIELD_RANKS / FAMILYWISE_ALPHA;
const BETS = Object.freeze([0.5, 1, 2, 3]);

/**
 * Fixed convex mixture of linear paired-seat e-processes. Under the per-rank
 * 84% equal-actual-start null, nonwins in a complete two-start
 * block have expectation <= 0.32. Thus E[1 + b*(L-0.32) | prior completed blocks] <= 1.
 * For each precommitted b in BETS, the factor is nonnegative for L=0,1,2.
 * Neither independent seat assignment nor within-block independence is used.
 *
 * @param {number[]} logComponentWealth Log evidence for fixed bets.
 * @returns {number} Natural log of the equal-weight e-process mixture.
 */
function mixtureLogEvidence(logComponentWealth) {
  const high = Math.max(...logComponentWealth);
  return high + Math.log(logComponentWealth.reduce((sum, x) =>
    sum + Math.exp(x - high), 0) / BETS.length);
}

/**
 * Analyze only complete, prospectively designed two-start blocks for one
 * frozen candidate. A tie is a nonwin. Input qualification labels and pairing
 * assertions MUST be independently audited; this pure module cannot prove
 * legitimate paper games, opponent competence, random deals or a match clock.
 *
 * @param {Array<{pairId:string,candidateId:string,originalRank:number,
 * pairingDesign:"SOURCE_SEAT_AND_ACTUAL_START_BALANCED",games:Array<{
 * id:string,sourceSeat:0|1,candidateActualStart:"first"|"second",\n * qualification:"QUALIFIED",
 * outcome:"win"|"loss"|"tie"}>}>} blocks
 * @param {string} fixedCandidateId Exact frozen deck identity.
 * @returns {object} Conditional, falsification-only evidence report.
 */
function assessPairedSeatRejection(blocks, fixedCandidateId) {
  assert.ok(Array.isArray(blocks));
  assert.ok(typeof fixedCandidateId === "string" && fixedCandidateId.length > 0);
  const pairIds = new Set();
  const gameIds = new Set();
  const ranks = Array.from({length: FIELD_RANKS}, () => ({
    completedPairs: 0, wins: 0, nonwins: 0,
    logComponentWealth: BETS.map(() => 0)
  }));
  let firstCrossing = null;
  for (const [index, block] of blocks.entries()) {
    assert.ok(block && typeof block === "object");
    assert.ok(typeof block.pairId === "string" && block.pairId.length > 0);
    assert.ok(!pairIds.has(block.pairId), "Duplicate physical pair identifier");
    pairIds.add(block.pairId);
    assert.equal(block.candidateId, fixedCandidateId,
      "Different candidate 60s require separate validation");
    assert.ok(Number.isSafeInteger(block.originalRank) &&
      block.originalRank >= 1 && block.originalRank <= FIELD_RANKS);
    assert.equal(block.pairingDesign, "SOURCE_SEAT_AND_ACTUAL_START_BALANCED",
      "Actual-start-balanced evidence requires prospectively complete pairs");
    assert.ok(Array.isArray(block.games) && block.games.length === 2,
      "A block must contain exactly two qualified games");
    const seats = new Set();\n    const actualStarts = new Set();
    let lossCount = 0;
    for (const game of block.games) {
      assert.ok(game && typeof game === "object");
      assert.ok(typeof game.id === "string" && game.id.length > 0);
      assert.ok(!gameIds.has(game.id), "Duplicate game identifier");
      gameIds.add(game.id);
      assert.ok(game.sourceSeat === 0 || game.sourceSeat === 1);
      assert.ok(!seats.has(game.sourceSeat), "Duplicate seat within pair");
      seats.add(game.sourceSeat);\n      assert.ok(game.candidateActualStart === "first" ||\n        game.candidateActualStart === "second",\n        "Game needs verified actual first/second turn, not a physical seat proxy");\n      assert.ok(!actualStarts.has(game.candidateActualStart),\n        "Two physical seats with the same actual start are not a balanced pair");\n      actualStarts.add(game.candidateActualStart);
      assert.equal(game.qualification, "QUALIFIED",
        "Censored or engine-only games are not qualified");
      assert.ok(["win", "loss", "tie"].includes(game.outcome));
      if (game.outcome !== "win") lossCount++;
    }
    const state = ranks[block.originalRank - 1];
    state.completedPairs++;
    state.nonwins += lossCount;
    state.wins += 2 - lossCount;
    for (const [j, bet] of BETS.entries()) {
      const factor = 1 + bet * (lossCount - PAIR_NONWIN_BUDGET);
      assert.ok(factor > 0);
      state.logComponentWealth[j] += Math.log(factor);
    }
    const logEValue = mixtureLogEvidence(state.logComponentWealth);
    if (firstCrossing === null && logEValue >= Math.log(E_THRESHOLD)) {
      firstCrossing = {
        pairOrdinal: index + 1,
        pairId: block.pairId,
        originalRank: block.originalRank,
        completedRankPairs: state.completedPairs,
        rankNonwins: state.nonwins,
        rankLogEValue: logEValue
      };
    }
  }
  return {
    version: VERSION,
    fixedCandidateId,
    fieldTarget: FIELD_TARGET,
    necessaryRankWinRate: REQUIRED_RANK_WIN_RATE,
    pairNonwinBudget: PAIR_NONWIN_BUDGET,
    familywiseAlpha: FAMILYWISE_ALPHA,
    rankThreshold: E_THRESHOLD,
    fixedBets: [...BETS],
    observedCompletePairClaims: blocks.length,
    observedQualifiedGameClaims: blocks.length * 2,
    ranks: ranks.map((state, index) => ({
      originalRank: index + 1,
      completedPairs: state.completedPairs,
      wins: state.wins,
      nonwins: state.nonwins,
      logEValue: mixtureLogEvidence(state.logComponentWealth)
    })),
    firstCrossing,
    rejectionFlag: firstCrossing !== null,
    paperQualificationVerifiedExternally: false,
    pretreatmentPairingVerifiedExternally: false,\n    actualFirstTurnVerifiedExternally: false,
    fixedCandidateAndPoliciesVerifiedExternally: false,
    interpretation: firstCrossing ?
      "CONDITIONAL-EARLY-REJECTION; audit each game and pair independently" :
      "NO-EARLY-REJECTION; no positive win-rate certification",
    caveat: "Self-asserted QUALIFIED, actual-start and paired-design labels provide no independent proof. A physical source seat does not establish actual first turn. Require one genuinely qualified candidate-first and candidate-second game in every completed pair, fresh conditional deals, and unchanged frozen policies; never omit the second game after the first result."
  };
}

module.exports = {
  VERSION, FIELD_RANKS, FIELD_TARGET, REQUIRED_RANK_WIN_RATE,
  PAIR_NONWIN_BUDGET, FAMILYWISE_ALPHA, E_THRESHOLD, BETS,
  mixtureLogEvidence, assessPairedSeatRejection
};
