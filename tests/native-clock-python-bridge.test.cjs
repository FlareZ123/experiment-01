'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {
  attachNativeClockToTrace, ROOT_PROTOCOL, RESET_PROTOCOL
} = require('../simulation/evaluation/native-clock-trace-adapter.cjs');

const PYTHON_VERIFY = [
  'import json, sys',
  'from scripts.action_trace_integrity import verify_action_trace',
  'from scripts.aichi_raw_global_gate import _verify_single_native_epoch',
  'g = json.load(sys.stdin)',
  'verify_action_trace(g["action_trace"], g["trace_sha256"])',
  '_verify_single_native_epoch(g)',
  'print("VERIFIED")'
].join('; ');

/** @param {object} game @returns {object} */
function pythonVerification(game) {
  return spawnSync('python', ['-c', PYTHON_VERIFY], {
    cwd: process.cwd(),
    input: JSON.stringify(game),
    encoding: 'utf8'
  });
}

/** @param {boolean} replay @returns {object} */
function native(replay) {
  const roots = [
    {actionOrdinal: 0, turnBefore: 0, turnAfter: 2,
      playerSlot: 0, action: 'PlayCardAction'},
    {actionOrdinal: 1, turnBefore: 2, turnAfter: replay ? 0 : 3,
      playerSlot: 1, action: 'ResolvePromptAction'}
  ];
  return {
    rootActionLedgerProtocol: ROOT_PROTOCOL,
    suddenDeathClockResetProtocol: RESET_PROTOCOL,
    actions: 2,
    rootActionLedger: roots,
    suddenDeathClockResets: replay ? [{
      actionOrdinal: 1, actingSeat: 1, action: 'ResolvePromptAction',
      pendingPrompt: 'SelectOptionPrompt',
      fromTurn: 2, toTurn: 0, fromPhase: 2, toPhase: 0,
      beforeSuddenDeath: false, afterSuddenDeath: true, enteredSetup: true
    }] : []
  };
}

/** @param {boolean} replay @returns {object} */
function rawGame(replay) {
  return {
    game_id: 'diagnostic-trial',
    ...attachNativeClockToTrace('diagnostic-trial',
      [{step: 0, action: 'recorded-store-root'}], native(replay))
  };
}

test('Python validates exact Node-produced raw trace and native clock capsule', () => {
  const result = pythonVerification(rawGame(false));
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /VERIFIED/);
});

test('Python rejects a genuine-shape Node native sudden-death replay capsule', () => {
  const result = pythonVerification(rawGame(true));
  assert.equal(result.error, undefined);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Sudden-death clock reset/);
});

test('Python rejects a substituted detached native clock even with valid SHA', () => {
  const game = rawGame(false);
  game.native_clock_evidence.rootActionLedger[1].turnAfter = 0;
  const result = pythonVerification(game);
  assert.equal(result.error, undefined);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not anchored/);
});
