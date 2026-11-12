'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { VERSION, createOwnerTurnTracker } =
  require('../../simulation/twinleaf/2026-11/agent27-owner-turn-tracker.cjs');

test('start binds the first physical seat and reports zero completed turns', () => {
  const tracker = createOwnerTurnTracker();
  const state = tracker.start({ turn: 1, activePlayer: 1 });
  assert.equal(state.version, VERSION);
  assert.equal(state.valid, true);
  assert.equal(state.firstPlayerSeat, 1);
  assert.equal(tracker.countFor(0), 0);
  assert.equal(tracker.countFor(1), 0);
  assert.equal(tracker.wentSecond(0), true);
  assert.equal(tracker.wentSecond(1), false);
  assert.equal(tracker.isFirstTurn(0), true);
  assert.equal(tracker.isSecondPlayerFirstTurn(0), true);
});

test('normal alternation credits the seat whose turn just ended', () => {
  const tracker = createOwnerTurnTracker();
  tracker.start({ turn: 1, activePlayer: 0 });
  tracker.observe({ turn: 2, activePlayer: 1 });
  assert.equal(tracker.countFor(0), 1);
  assert.equal(tracker.countFor(1), 0);
  tracker.observe({ turn: 3, activePlayer: 0 });
  assert.equal(tracker.countFor(0), 1);
  assert.equal(tracker.countFor(1), 1);
});

test('same-seat extra turns count as completed turns for that seat', () => {
  const tracker = createOwnerTurnTracker();
  tracker.start({ turn: 1, activePlayer: 0 });
  tracker.observe({ turn: 2, activePlayer: 0 });
  assert.equal(tracker.countFor(0), 1);
  assert.equal(tracker.countFor(1), 0);
  tracker.observe({ turn: 3, activePlayer: 0 });
  assert.equal(tracker.countFor(0), 2);
  assert.equal(tracker.countFor(1), 0);
});

test('second player retains a go-second first-turn window after first player extra turns', () => {
  const tracker = createOwnerTurnTracker();
  tracker.start({ turn: 1, activePlayer: 0 });
  tracker.observe({ turn: 2, activePlayer: 0 });
  tracker.observe({ turn: 3, activePlayer: 1 });
  assert.equal(tracker.countFor(0), 2);
  assert.equal(tracker.countFor(1), 0);
  assert.equal(tracker.wentSecond(1), true);
  assert.equal(tracker.isSecondPlayerFirstTurn(1), true);
  tracker.observe({ turn: 4, activePlayer: 0 });
  assert.equal(tracker.countFor(1), 1);
  assert.equal(tracker.isSecondPlayerFirstTurn(1), false);
});

test('repeated identical snapshots are idempotent', () => {
  const tracker = createOwnerTurnTracker();
  const start = { turn: 1, activePlayer: 0 };
  tracker.start(start);
  tracker.observe(start);
  tracker.observe(start);
  assert.equal(tracker.countFor(0), 0);
  assert.equal(tracker.snapshot().transitions, 0);
});

test('observation before start is unavailable but explicit start can initialize', () => {
  const tracker = createOwnerTurnTracker();
  assert.equal(tracker.observe({ turn: 1, activePlayer: 0 }).valid, false);
  assert.equal(tracker.countFor(0), null);
  assert.equal(tracker.start({ turn: 1, activePlayer: 0 }).valid, true);
  assert.equal(tracker.countFor(0), 0);
});

test('invalid start snapshot fails closed', () => {
  const tracker = createOwnerTurnTracker();
  const result = tracker.start({ turn: 1, activePlayer: 2 });
  assert.equal(result.valid, false);
  assert.equal(result.invalidReason, 'invalid-start-snapshot');
  assert.equal(tracker.countFor(0), null);
});

test('second start invalidates the tracker', () => {
  const tracker = createOwnerTurnTracker();
  tracker.start({ turn: 1, activePlayer: 0 });
  const result = tracker.start({ turn: 1, activePlayer: 1 });
  assert.equal(result.valid, false);
  assert.equal(result.invalidReason, 'already-started');
  assert.equal(tracker.countFor(0), null);
});

test('seat change without turn increment invalidates the tracker', () => {
  const tracker = createOwnerTurnTracker();
  tracker.start({ turn: 1, activePlayer: 0 });
  const result = tracker.observe({ turn: 1, activePlayer: 1 });
  assert.equal(result.valid, false);
  assert.equal(result.invalidReason, 'seat-changed-without-turn-increment');
  assert.equal(tracker.countFor(0), null);
});

test('turn jumps and decreases invalidate the tracker', () => {
  for (const [current, reason] of [
    [{ turn: 3, activePlayer: 1 }, 'non-unit-turn-increment'],
    [{ turn: 0, activePlayer: 0 }, 'turn-decreased']
  ]) {
    const tracker = createOwnerTurnTracker();
    tracker.start({ turn: 1, activePlayer: 0 });
    const result = tracker.observe(current);
    assert.equal(result.valid, false);
    assert.equal(result.invalidReason, reason);
    assert.equal(tracker.countFor(0), null);
  }
});

test('invalid observation invalidates all derived first-turn facts', () => {
  const tracker = createOwnerTurnTracker();
  tracker.start({ turn: 1, activePlayer: 0 });
  const result = tracker.observe({ turn: 2, activePlayer: 3 });
  assert.equal(result.valid, false);
  assert.equal(result.invalidReason, 'invalid-observation');
  assert.equal(tracker.wentSecond(1), null);
  assert.equal(tracker.isFirstTurn(0), null);
  assert.equal(tracker.isSecondPlayerFirstTurn(1), null);
});
