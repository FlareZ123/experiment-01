'use strict';

const assert = require('node:assert/strict');
const {actionTraceSha256} = require('./canonical-action-trace.cjs');

const ROOT_PROTOCOL = 'actual-store-root-action-ledger-v1';
const RESET_PROTOCOL = 'actual-native-sudden-death-clock-transition-v1';
const TRACE_PROTOCOL = 'native-clock-capsule-v1';

/**
 * Bind native public clock observations to a canonical hash-checked action
 * trace without introducing a synthetic action. Requires an independently
 * retained native Store artifact. This adapter certifies no game outcome.
 *
 * @param {string} gameId Registered outer trial ID.
 * @param {object[]} recordedActions Existing trace of real or diagnostic actions.
 * @param {object} headless Original headless game result from the pinned engine.
 * @returns {{action_trace:object[],trace_sha256:string,native_clock_evidence:object}}
 */
function attachNativeClockToTrace(gameId, recordedActions, headless) {
  assert.equal(typeof gameId, 'string');
  assert.ok(gameId.length > 0);
  assert.ok(Array.isArray(recordedActions) && recordedActions.length > 0);
  assert.equal(headless.rootActionLedgerProtocol, ROOT_PROTOCOL);
  assert.equal(headless.suddenDeathClockResetProtocol, RESET_PROTOCOL);
  assert.ok(Array.isArray(headless.rootActionLedger));
  assert.ok(Array.isArray(headless.suddenDeathClockResets));
  assert.ok(Number.isSafeInteger(headless.actions));

  const nativeClock = {
    game_id: gameId,
    rootActionLedgerProtocol: ROOT_PROTOCOL,
    suddenDeathClockResetProtocol: RESET_PROTOCOL,
    suddenDeathClockResets: headless.suddenDeathClockResets.map(reset => ({
      actionOrdinal: reset.actionOrdinal,
      actingSeat: reset.actingSeat,
      action: reset.action,
      pendingPrompt: reset.pendingPrompt ?? null,
      fromTurn: reset.fromTurn,
      toTurn: reset.toTurn,
      fromPhase: reset.fromPhase,
      toPhase: reset.toPhase,
      beforeSuddenDeath: reset.beforeSuddenDeath,
      afterSuddenDeath: reset.afterSuddenDeath,
      enteredSetup: reset.enteredSetup
    })),
    actions: headless.actions,
    rootActionLedger: headless.rootActionLedger.map(event => ({
      actionOrdinal: event.actionOrdinal,
      turnBefore: event.turnBefore,
      turnAfter: event.turnAfter,
      playerSlot: event.playerSlot,
      action: event.action
    }))
  };
  const trace = structuredClone(recordedActions);
  assert.ok(!trace.some(event => event.protocol === TRACE_PROTOCOL),
    'A native clock capsule may only be anchored once');
  assert.ok(!Object.hasOwn(trace[0], 'protocol'),
    'First trace action already owns a protocol field');
  assert.ok(!Object.hasOwn(trace[0], 'native_clock_evidence'),
    'First trace action already holds native clock evidence');
  trace[0].protocol = TRACE_PROTOCOL;
  trace[0].native_clock_evidence = structuredClone(nativeClock);
  return {
    action_trace: trace,
    trace_sha256: actionTraceSha256(trace),
    native_clock_evidence: nativeClock
  };
}

module.exports = {
  attachNativeClockToTrace,
  ROOT_PROTOCOL, RESET_PROTOCOL, TRACE_PROTOCOL
};
