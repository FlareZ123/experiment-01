"use strict";

const assert = require("node:assert/strict");
const {test} = require("node:test");
const {
  FIELD_RANKS, FIELD_TARGET, REQUIRED_RANK_WIN_RATE,
  PAIR_NONWIN_BUDGET, E_THRESHOLD, BETS,
  assessPairedSeatRejection
} = require("../simulation/evaluation/agent37-aichi-995-paired-seat-rejection.cjs");

const candidateId = "synthetic-fixed-60-only";
const makePair = (id, rank, outcomes = ["win", "win"]) => ({
  pairId: id, candidateId, originalRank: rank,
  pairingDesign: "SOURCE_SEAT_AND_ACTUAL_START_BALANCED",
  orientationAssignment: "INDEPENDENT_FAIR_COIN_PER_COMPLETE_PAIR",
  orientationCoin: 0,
  games: outcomes.map((outcome, sourceSeat) => ({
    id: id + ":source-seat-" + sourceSeat, sourceSeat,
    candidateActualStart: sourceSeat === 0 ? "first" : "second",
    qualification: "QUALIFIED", outcome
  }))
});

test("necessary 32-field equal-seat loss budget and nonnegative stakes", () => {
  assert.equal(FIELD_RANKS, 32);
  assert.equal(FIELD_TARGET, 0.995);
  assert.ok(Math.abs(REQUIRED_RANK_WIN_RATE - 0.84) < 1e-12);
  assert.ok(Math.abs(PAIR_NONWIN_BUDGET - 0.32) < 1e-12);
  assert.equal(E_THRESHOLD, 640);
  assert.ok(BETS.every(bet => bet > 0 && 1 - bet * PAIR_NONWIN_BUDGET >= 0));
  const empty = assessPairedSeatRejection([], candidateId);
  assert.equal(empty.ranks[0].logEValue, 0);
  assert.equal(empty.rejectionFlag, false);
});

test("four synthetic double-nonwin pairs do not cross; five do", () => {
  const blocks = Array.from({length: 5}, (_, i) =>
    makePair("double-loss-" + i, 6, ["loss", "tie"]));
  const four = assessPairedSeatRejection(blocks.slice(0, 4), candidateId);
  const five = assessPairedSeatRejection(blocks, candidateId);
  assert.equal(four.rejectionFlag, false);
  assert.equal(five.rejectionFlag, true);
  assert.equal(five.firstCrossing.pairOrdinal, 5);
  assert.equal(five.firstCrossing.originalRank, 6);
  assert.equal(five.ranks[5].nonwins, 10);
  assert.ok(Math.exp(five.ranks[5].logEValue) > E_THRESHOLD);
  console.log("PAIRED_SYNTHETIC", JSON.stringify({
    fourPairE: Math.exp(four.ranks[5].logEValue),
    fivePairE: Math.exp(five.ranks[5].logEValue), threshold: E_THRESHOLD,
    qualificationIndependent: false
  }));
});

test("seven single-nonwin pairs cross after six do not", () => {
  const blocks = Array.from({length: 7}, (_, i) =>
    makePair("one-loss-" + i, 11, ["loss", "win"]));
  assert.equal(assessPairedSeatRejection(blocks.slice(0, 6), candidateId).rejectionFlag, false);
  const result = assessPairedSeatRejection(blocks, candidateId);
  assert.equal(result.firstCrossing.pairOrdinal, 7);
  assert.equal(result.ranks[10].wins, 7);
  assert.equal(result.ranks[10].nonwins, 7);
});

test("two unequal marginal seats at null yield mean factor one", () => {
  // p0=.68, p1=1: L=1 with probability .32 and L=0 otherwise.
  for (const bet of BETS) {
    const expected = 0.68 * (1 - bet * PAIR_NONWIN_BUDGET) +
      0.32 * (1 + bet * (1 - PAIR_NONWIN_BUDGET));
    assert.ok(Math.abs(expected - 1) < 1e-12);
  }
});

test("perfectly correlated two-seat losses also preserve exact null expectation", () => {
  // Both lose together with probability .16; no within-pair independence.
  for (const bet of BETS) {
    const expected = 0.84 * (1 - bet * PAIR_NONWIN_BUDGET) +
      0.16 * (1 + bet * (2 - PAIR_NONWIN_BUDGET));
    assert.ok(Math.abs(expected - 1) < 1e-12);
  }
});

test("interleaved ranks and reversed physical seat ordering retain paired evidence", () => {
  const blocks = [
    makePair("six-a", 6, ["loss", "loss"]),
    makePair("eleven-a", 11, ["win", "win"]),
    makePair("six-b", 6, ["loss", "tie"]),
    makePair("six-c", 6, ["loss", "loss"]),
    makePair("six-d", 6, ["loss", "loss"]),
    makePair("six-e", 6, ["loss", "loss"])
  ];
  blocks[2].games.reverse();
  const result = assessPairedSeatRejection(blocks, candidateId);
  assert.equal(result.rejectionFlag, true);
  assert.equal(result.firstCrossing.pairOrdinal, 6);
  assert.equal(result.ranks[10].wins, 2);
  assert.equal(result.ranks[5].nonwins, 10);
});

test("duplicate, partial, one-seat, changed-deck, unqualified, bad outcomes fail closed", () => {
  const pair = makePair("immutable-id", 6);
  assert.throws(() => assessPairedSeatRejection([pair, pair], candidateId), /Duplicate physical pair/);
  assert.throws(() => assessPairedSeatRejection([{...pair, candidateId:"other"}], candidateId), /Different candidate/);
  assert.throws(() => assessPairedSeatRejection([{...pair, pairingDesign:"ALTERNATING"}], candidateId), /prospectively complete/);
  assert.throws(() => assessPairedSeatRejection([{...pair, games:[pair.games[0]]}], candidateId), /exactly two/);
  assert.throws(() => assessPairedSeatRejection([{...pair, games:[pair.games[0], {...pair.games[1], sourceSeat:0}]}], candidateId), /Duplicate seat/);
  assert.throws(() => assessPairedSeatRejection([{...pair, games:[pair.games[0], {...pair.games[1], qualification:"NATIVE_CENSORED"}]}], candidateId), /not qualified/);
  assert.throws(() => assessPairedSeatRejection([{...pair, games:[pair.games[0], {...pair.games[1], outcome:"capped"}]}], candidateId));
  assert.throws(() => assessPairedSeatRejection([{...pair, games:[pair.games[0], {...pair.games[1], id:pair.games[0].id}]}], candidateId), /Duplicate game/);
  assert.throws(() => assessPairedSeatRejection([{...pair, originalRank:33}], candidateId));
});

test("mirrored physical seats alone cannot replace balanced actual first-turn status", () => {
  const a = makePair("same-actual-start", 6);
  a.games[1].candidateActualStart = "first";
  assert.throws(() => assessPairedSeatRejection([a], candidateId),
    /same actual start/);
  const b = makePair("unknown-actual-start", 6);
  delete b.games[1].candidateActualStart;
  assert.throws(() => assessPairedSeatRejection([b], candidateId),
    /verified actual first\/second turn/);
  const c = makePair("seats-swapped-actual-balanced", 6);
  c.games[0].candidateActualStart = "second";
  c.games[1].candidateActualStart = "first";
  c.orientationCoin = 1;
  const report = assessPairedSeatRejection([c], candidateId);
  assert.equal(report.observedCompletePairClaims, 1);
  assert.equal(report.actualFirstTurnVerifiedExternally, false);
  assert.equal(report.independentFairPairOrientationVerifiedExternally, false);
});

test("pair orientation must be a precommitted fair coin and match actual starts", () => {
  const pair = makePair("fair-orientation", 6);
  assert.throws(() => assessPairedSeatRejection([{
    ...pair, orientationAssignment: "DETERMINISTIC_DIAGONAL"
  }], candidateId), /fair orientation randomization/);
  assert.throws(() => assessPairedSeatRejection([{
    ...pair, orientationCoin: undefined
  }], candidateId), /recorded fair coin result/);
  assert.throws(() => assessPairedSeatRejection([{
    ...pair, orientationCoin: 1
  }], candidateId), /orientation coin does not match/);
  const swapped = makePair("opposite-pair", 11);
  swapped.games[0].candidateActualStart = "second";
  swapped.games[1].candidateActualStart = "first";
  swapped.orientationCoin = 1;
  const result = assessPairedSeatRejection([swapped], candidateId);
  assert.equal(result.observedCompletePairClaims, 1);
  assert.equal(result.independentFairPairOrientationVerifiedExternally, false);
});

test("fair orientation averages all four physical-seat and actual-start cells", () => {
  // Under one uniform orientation coin, two selected games span the four
  // seat/start possibilities marginally. Within-pair game dependence is free.
  const failureProbabilities = [0.32, 0, 0.16, 0.16];
  const fullFourCellMean = failureProbabilities.reduce((a, b) => a + b, 0) / 4;
  const diagonalSum = failureProbabilities[0] + failureProbabilities[3];
  const offDiagonalSum = failureProbabilities[1] + failureProbabilities[2];
  assert.ok(Math.abs(fullFourCellMean - 0.16) < 1e-12);
  assert.ok(Math.abs((diagonalSum + offDiagonalSum) / 2 - 0.32) < 1e-12);
});

test("all thirty-two ranks with one perfect synthetic pair never prove 99.5%", () => {
  const blocks = Array.from({length: 32}, (_, i) =>
    makePair("all-rank-" + (i + 1), i+1));
  const result = assessPairedSeatRejection(blocks, candidateId);
  assert.equal(result.rejectionFlag, false);
  assert.equal(result.observedQualifiedGameClaims, 64);
  assert.equal(result.paperQualificationVerifiedExternally, false);
  assert.equal(result.pretreatmentPairingVerifiedExternally, false);
  assert.match(result.interpretation, /no positive win-rate certification/);
});

test("large synthetic loss counts stay finite in logarithmic evidence", () => {
  const blocks = Array.from({length: 10000}, (_, i) =>
    makePair("many-" + i, 24, ["loss", "loss"]));
  const result = assessPairedSeatRejection(blocks, candidateId);
  assert.equal(result.firstCrossing.pairOrdinal, 5);
  assert.ok(Number.isFinite(result.ranks[23].logEValue));
  assert.ok(result.ranks[23].logEValue > 10000);
});

test("exhaustive ten-block null paths never exceed rank Bonferroni allowance", () => {
  for (const mode of ["all-on-seat0", "perfect-correlation"]) {
    let crossingProbability = 0;
    for (let mask = 0; mask < 1024; mask++) {
      let probability = 1;
      const blocks = [];
      for (let i = 0; i < 10; i++) {
        const isBad = !!(mask & (1 << i));
        const rate = mode === "all-on-seat0" ? 0.32 : 0.16;
        probability *= isBad ? rate : 1 - rate;
        blocks.push(makePair("mask-" + i, 6, isBad ?
          mode === "all-on-seat0" ? ["loss", "win"] : ["loss", "loss"] :
          ["win", "win"]));
      }
      if (assessPairedSeatRejection(blocks, candidateId).rejectionFlag)
        crossingProbability += probability;
    }
    assert.ok(crossingProbability <= 0.05 / FIELD_RANKS);
    console.log("NULL_TEN_PAIR", JSON.stringify({mode, crossingProbability}));
  }
});
