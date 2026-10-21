'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  attachNativeClockToTrace, ROOT_PROTOCOL, RESET_PROTOCOL
} = require('../simulation/evaluation/native-clock-trace-adapter.cjs');
const {actionTraceSha256} = require('../simulation/evaluation/canonical-action-trace.cjs');

/** @returns {object} */
function native(reset = []) {
  return {
    rootActionLedgerProtocol: ROOT_PROTOCOL,
    suddenDeathClockResetProtocol: RESET_PROTOCOL,
    actions: 2,
    rootActionLedger: [
      {actionOrdinal: 0, turnBefore: 1, turnAfter: 2,
        playerSlot: 0, action: 'PassTurnAction',
        hiddenOpponentHand: 'SECRET OPPONENT CARD'},
      {actionOrdinal: 1, turnBefore: 2, turnAfter: 3,
        playerSlot: 1, action: 'ResolvePromptAction'}
    ],
    suddenDeathClockResets: reset,
    hiddenPrizes: ['SECRET PRIZE']
  };
}

test('attaches authentic-shape public clock ledger into the original first action', () => {
  const original = [{step: 0, action: 'actual-store-root'}];
  const input = native();
  const bound = attachNativeClockToTrace('rank6-outer-trial', original, input);
  assert.equal(bound.action_trace.length, original.length);
  assert.equal(bound.action_trace[0].step, 0);
  assert.equal(bound.action_trace[0].action, original[0].action);
  assert.equal(bound.trace_sha256, actionTraceSha256(bound.action_trace));
  assert.equal(bound.native_clock_evidence.game_id, 'rank6-outer-trial');
  assert.deepEqual(bound.action_trace[0].native_clock_evidence,
    bound.native_clock_evidence);
  assert.deepEqual(bound.native_clock_evidence.suddenDeathClockResets, []);
  assert.equal(bound.native_clock_evidence.rootActionLedger.length, 2);
  assert.ok(!JSON.stringify(bound).includes('SECRET'));
  assert.deepEqual(original, [{step: 0, action: 'actual-store-root'}]);
  assert.equal(input.rootActionLedger[0].hiddenOpponentHand,
    'SECRET OPPONENT CARD');
  input.rootActionLedger[0].turnAfter = 44;
  assert.equal(bound.native_clock_evidence.rootActionLedger[0].turnAfter, 2);
});

test('preserves original native sudden death evidence within hash', () => {
  const reset = [{
    actionOrdinal: 1, actingSeat: 1, action: 'ResolvePromptAction',
    pendingPrompt: 'SelectOptionPrompt',
    fromTurn: 4, toTurn: 0, fromPhase: 2, toPhase: 0,
    beforeSuddenDeath: false, afterSuddenDeath: true, enteredSetup: true
  }];
  const trace = [{step: 0, action: 'actual-store-root'}];
  const clean = attachNativeClockToTrace('rank6-outer-trial', trace, native());
  const replay = attachNativeClockToTrace('rank6-outer-trial', trace, native(reset));
  assert.deepEqual(replay.native_clock_evidence.suddenDeathClockResets, reset);
  assert.notEqual(replay.trace_sha256, clean.trace_sha256);
});

test('rejects uninstrumented native ledgers and duplicate clock capsules', () => {
  const trace = [{step: 0, action: 'draw'}];
  const bad = native();
  bad.suddenDeathClockResetProtocol = null;
  assert.throws(() => attachNativeClockToTrace('outer', trace, bad));
  const first = attachNativeClockToTrace('outer', trace, native());
  assert.throws(() => attachNativeClockToTrace('outer', first.action_trace, native()),
    /capsule/);
  const malformed = [{step: 1, action: 'draw'}];
  assert.throws(() => attachNativeClockToTrace('outer', malformed, native()));
});

test('retains trace digest sensitivity to clock and turn mutations', () => {
  const a = attachNativeClockToTrace('first', [{step: 0, action: 'draw'}], native());
  const b = attachNativeClockToTrace('second', [{step: 0, action: 'draw'}], native());
  assert.notEqual(a.trace_sha256, b.trace_sha256);
  a.action_trace[0].native_clock_evidence.rootActionLedger[1].turnAfter = 0;
  assert.notEqual(actionTraceSha256(a.action_trace), a.trace_sha256);
  assert.equal(a.native_clock_evidence.rootActionLedger[1].turnAfter, 3);
});
