'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runSeat} = require('./agent46-mimikyu-apex-consecutive-native.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');

const PINNED = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const {clearCopyAttackSessionsForTests} =
  require(path.join(PINNED, 'game/store/prefabs/copy-attack-delegation'));

/**
 * Test the one-GX-attack-per-game boundary for a true earlier Regidrago
 * Apex Dragon, subsequent Mimikyu GRI Copycat, and nested discarded
 * Dragon Dialga-GX UPR Timeless-GX. Both existing paper-compatibility
 * hooks are installed only around each controlled real Store trial.
 *
 * @param {0|1} ownerSeat Actual Mimikyu physical seat.
 * @param {boolean} gxAlreadySpent Whether Mimikyu owner already used a GX.
 * @returns {object} Engine effect and prompt outcome.
 */
function trial(ownerSeat, gxAlreadySpent) {
  clearCopyAttackSessionsForTests();
  const restoreCopycat = installMimikyuNonGxCopycatHook();
  const restoreHistory = installDeclaredCopyHistoryHook({
    mimikyu: true, regidrago: true
  });
  let result;
  try {
    result = runSeat(ownerSeat, {
      chooseMimikyuTimeless: true,
      beforeMimikyu({x}) {
        assert.equal(x.state.playerLastAttack[x.opponent.id].attack.name,
          'Apex Dragon', 'Paper history remains the originally declared attack');
        assert.equal(x.owner.usedGX, false,
          'No other GX attack has been used in source-stage baseline');
        x.owner.usedGX = gxAlreadySpent;
      }
    });
  } finally {
    restoreHistory();
    restoreCopycat();
    clearCopyAttackSessionsForTests();
  }
  assert.equal(result.sourceChooseAttackPromptSeen, true);
  assert.equal(result.originalSourceLastAttackAfterResolvedApex?.attack,
    'Apex Dragon');
  assert.equal(result.sourceHandImmediatelyAfterApex, 6);
  assert.equal(result.sourceDeckImmediatelyAfterApex, 2);
  const offeredCopyPrompt = result.history.some(e =>
    e.during === 'mimikyu-copycat' && e.pending === 'ChooseAttackPrompt');
  const resolvedGXChoice = result.history.some(e =>
    e.during === 'mimikyu-copycat' && e.resolved === 'ChooseAttackPrompt' &&
    e.chosen === 'Timeless-GX');
  return {
    ownerSeat,
    gxAlreadySpent,
    sourceAttackTrulyOccurred: true,
    existingHooksRestored: true,
    offeredCopyPrompt,
    resolvedGXChoice,
    damage: result.mimikyuOpponentDamage,
    gxFlagAfter: result.mimikyuOwnerGXUsed,
    extraTurn: result.mimikyuOwnerTurnSkip,
    extraTurnClearArmed: result.mimikyuOwnerTurnSkipClearArmed,
    error: result.error,
    pending: result.nativePending,
    acceptedHistory: result.history
  };
}

/** @returns {object} Both-seat paired GX-spent controls. */
function run() {
  const rows = [];
  for (const seat of [0, 1]) {
    const fresh = trial(seat, false);
    const spent = trial(seat, true);
    assert.equal(fresh.error, null);
    assert.equal(fresh.resolvedGXChoice, true);
    assert.equal(fresh.damage, 150);
    assert.equal(fresh.gxFlagAfter, true);
    assert.equal(fresh.extraTurn, true);
    rows.push({
      ownerSeat: seat,
      fresh,
      spent,
      nativeSpentGXProvidesDamage: spent.damage > 0,
      nativeSpentGXProvidesExtraTurn: spent.extraTurn,
      paperOneGXRuleBreached: spent.damage > 0 || spent.extraTurn
    });
    console.log('AGENT46_GX_SPENT_SEAT ' + JSON.stringify(rows[rows.length - 1]));
  }
  const out = {
    schema: 'agent46-real-previous-apex-mimikyu-second-gx-two-seat-v1',
    pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    previousAttackMetadataInjected: false,
    earlierGXFlagIsControlledCounterfactual: true,
    stagedBoardsOnly: true,
    paperQualifiedGames: 0,
    rows
  };
  console.log('AGENT46_GX_SPENT_COMPARISON ' + JSON.stringify(out));
  return out;
}

if (require.main === module) run();
module.exports = {trial, run};
