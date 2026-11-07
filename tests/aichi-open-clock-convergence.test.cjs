'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { adjudicateAichiOpenAfterLastTurn } = require('../simulation/evaluation/aichi-open-adjudication.cjs');
const { adjudicateMay2026AichiTime } = require('../simulation/evaluation/agent26-aichi-may2026-paper-clock-adjudicator.cjs');
const {
  adjudicateAtPrescribedEnd,
  classifyTiebreaker
} = require('../simulation/evaluation/agent27-aichi-open-time-adjudication.cjs');

test('All three Aichi Open cutoff models agree on all 36 positive Top32 Prize pairs', () => {
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      const winner = Math.min(a, b) <= 2 && a !== b ? (a < b ? 0 : 1) : null;
      const agent3 = adjudicateAichiOpenAfterLastTurn({
        stage: 'top32',
        normal: 'in-progress',
        prizesNeeded: [a, b]
      });
      const agent26 = adjudicateMay2026AichiTime({
        stage: 'top32',
        phase: 'cutoff',
        firstPlayerSeat: 0,
        lastCompletedTurnSeat: 1,
        prizeRemaining: [a, b]
      });
      const agent27 = adjudicateAtPrescribedEnd({
        stage: 'open-top32',
        prizesRemaining: [a, b],
        secondPlayerTurnFinished: true
      });

      if (winner === null) {
        assert.equal(agent3.status, 'overtime', `Agent3 [${a},${b}]`);
        assert.equal(agent26.status, 'KNOCKOUT_EXTENSION_REQUIRED', `Agent26 [${a},${b}]`);
        assert.equal(
          agent27.status,
          Math.min(a, b) <= 2 ? 'EXTENSION_REQUIRED_TIED_LOW' : 'EXTENSION_REQUIRED_BOTH_HIGH',
          `Agent27 [${a},${b}]`
        );
      } else {
        assert.equal(agent3.status, winner === 0 ? 'player-0-win' : 'player-1-win', `Agent3 [${a},${b}]`);
        assert.equal(agent26.status, 'KNOCKOUT_PAPER_TIME_WIN', `Agent26 [${a},${b}]`);
        assert.equal(agent26.winner, winner, `Agent26 winner [${a},${b}]`);
        assert.equal(agent27.status, 'ELIMINATION_PRIZE_LEAD', `Agent27 [${a},${b}]`);
        assert.equal(agent27.conditionalWinnerSeat, winner, `Agent27 winner [${a},${b}]`);
      }
      assert.equal(agent27.competitiveAdmission, false);
    }
  }
});

test('Agent26 and Agent27 agree on all 36 positive knockout tiebreaker Prize pairs', () => {
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      const winner = a === b ? null : (a < b ? 0 : 1);
      const agent26 = adjudicateMay2026AichiTime({
        stage: 'top32',
        phase: 'tiebreak',
        firstPlayerSeat: 0,
        lastCompletedTurnSeat: 1,
        prizeRemaining: [a, b]
      });
      const agent27 = classifyTiebreaker([a, b]);

      if (winner === null) {
        assert.equal(agent26.status, 'PAPER_TIEBREAKER_CONTINUE', `Agent26 [${a},${b}]`);
        assert.equal(agent27.status, 'TIEBREAKER_CONTINUES', `Agent27 [${a},${b}]`);
      } else {
        assert.equal(agent26.status, 'PAPER_TIEBREAKER_PRIZE_LEAD_WIN', `Agent26 [${a},${b}]`);
        assert.equal(agent26.winner, winner, `Agent26 winner [${a},${b}]`);
        assert.equal(agent27.status, 'TIEBREAKER_PRIZE_LEAD', `Agent27 [${a},${b}]`);
        assert.equal(agent27.conditionalWinnerSeat, winner, `Agent27 winner [${a},${b}]`);
      }
      assert.equal(agent27.competitiveAdmission, false);
    }
  }
});

test('All 13 zero-containing Top32 Prize pairs fail closed in all three models', () => {
  for (let a = 0; a <= 6; a++) {
    for (let b = 0; b <= 6; b++) {
      if (a !== 0 && b !== 0) continue;
      assert.throws(() => adjudicateAichiOpenAfterLastTurn({
        stage: 'top32',
        normal: 'in-progress',
        prizesNeeded: [a, b]
      }), `Agent3 [${a},${b}]`);
      const agent26 = adjudicateMay2026AichiTime({
        stage: 'top32',
        phase: 'cutoff',
        firstPlayerSeat: 0,
        lastCompletedTurnSeat: 1,
        prizeRemaining: [a, b]
      });
      const agent27 = adjudicateAtPrescribedEnd({
        stage: 'open-top32',
        prizesRemaining: [a, b],
        secondPlayerTurnFinished: true
      });
      assert.equal(agent26.status, 'NATURAL_PAPER_TERMINAL_UNVERIFIED', `Agent26 [${a},${b}]`);
      assert.equal(agent27.status, 'PAPER_OUTCOME_CONFLICT_ZERO_PRIZE', `Agent27 [${a},${b}]`);
      assert.equal(agent27.competitiveAdmission, false);
    }
  }
});

test('Swiss timeout and end-call tie are both-loss; Agent26 leaves tie timing unspecified', () => {
  const agent3Timeout = adjudicateAichiOpenAfterLastTurn({ stage: 'swiss', normal: 'in-progress' });
  const agent26Timeout = adjudicateMay2026AichiTime({
    stage: 'swiss',
    phase: 'cutoff',
    firstPlayerSeat: 0,
    lastCompletedTurnSeat: 1,
    prizeRemaining: [3, 3]
  });
  const agent27Timeout = adjudicateAtPrescribedEnd({
    stage: 'open-swiss',
    prizesRemaining: [3, 3],
    secondPlayerTurnFinished: true
  });
  assert.equal(agent3Timeout.status, 'double-loss');
  assert.equal(agent26Timeout.status, 'SWISS_BOTH_LOSS');
  assert.equal(agent27Timeout.status, 'SWISS_BOTH_LOSE');

  const agent3TieAtCheckpoint = adjudicateAichiOpenAfterLastTurn({ stage: 'swiss', normal: 'tie' });
  const agent26TieWithoutTiming = adjudicateMay2026AichiTime({
    stage: 'swiss',
    phase: 'cutoff',
    firstPlayerSeat: 0,
    lastCompletedTurnSeat: 1,
    prizeRemaining: [0, 0],
    naturalOutcome: 'tie'
  });
  const agent27TieAtEndCall = adjudicateAtPrescribedEnd({
    stage: 'open-swiss',
    prizesRemaining: [0, 0],
    secondPlayerTurnFinished: false,
    paperGameTie: true
  });
  assert.equal(agent3TieAtCheckpoint.status, 'double-loss');
  assert.equal(agent26TieWithoutTiming.status, 'SWISS_NATURAL_TIE_UNSPECIFIED');
  assert.equal(agent27TieAtEndCall.status, 'SWISS_BOTH_LOSE');
});

test('A tied Open knockout game starts a fresh six-Prize tiebreaker in all models', () => {
  const agent3 = adjudicateAichiOpenAfterLastTurn({ stage: 'top32', normal: 'tie', prizesNeeded: [3, 3] });
  const agent26 = adjudicateMay2026AichiTime({
    stage: 'top32',
    phase: 'cutoff',
    firstPlayerSeat: 0,
    lastCompletedTurnSeat: 1,
    prizeRemaining: [3, 3],
    naturalOutcome: 'tie'
  });
  const agent27 = adjudicateAtPrescribedEnd({
    stage: 'open-top32',
    prizesRemaining: [3, 3],
    secondPlayerTurnFinished: false,
    paperGameTie: true
  });
  assert.equal(agent3.status, 'tiebreaker');
  assert.equal(agent26.status, 'PAPER_TIEBREAKER_NEW_SIX_PRIZE_GAME');
  assert.equal(agent27.status, 'TIEBREAKER_REQUIRED_SIX_PRIZE');
});

test('A tied knockout tiebreaker restarts; an unexplained both-zero state stays unresolved', () => {
  const agent26 = adjudicateMay2026AichiTime({
    stage: 'top32',
    phase: 'tiebreak',
    firstPlayerSeat: 0,
    lastCompletedTurnSeat: 1,
    prizeRemaining: [0, 0],
    naturalOutcome: 'tie'
  });
  const agent27Tie = classifyTiebreaker([0, 0], { paperGameTie: true });
  const agent27Unknown = classifyTiebreaker([0, 0]);
  assert.equal(agent26.status, 'PAPER_TIEBREAKER_NEW_SIX_PRIZE_GAME');
  assert.equal(agent27Tie.status, 'TIEBREAKER_RESTART_REQUIRED_SIX_PRIZE');
  assert.equal(agent27Unknown.status, 'TIEBREAKER_PAPER_OUTCOME_REVIEW_REQUIRED');
  assert.equal(agent27Tie.competitiveAdmission, false);
  assert.equal(agent27Unknown.competitiveAdmission, false);
});

test('Both-zero tiebreaker states fail closed with model-specific review labels', () => {
  const agent26 = adjudicateMay2026AichiTime({
    stage: 'top32',
    phase: 'tiebreak',
    firstPlayerSeat: 0,
    lastCompletedTurnSeat: 1,
    prizeRemaining: [0, 0]
  });
  const agent27 = classifyTiebreaker([0, 0]);
  assert.equal(agent26.status, 'NATURAL_PAPER_TERMINAL_UNVERIFIED');
  assert.equal(agent27.status, 'TIEBREAKER_PAPER_OUTCOME_REVIEW_REQUIRED');
  assert.ok(agent26.competitiveAdmission !== true);
  assert.equal(agent27.competitiveAdmission, false);
});
