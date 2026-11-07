'use strict';

const assert = require('node:assert/strict');
const {runSeat} = require('./agent46-mimikyu-apex-consecutive-native.cjs');
const {installDeclaredCopyHistoryHook} =
  require('./copycat-declared-history-hook.cjs');
const {installMimikyuNonGxCopycatHook} =
  require('./copycat-compat.cjs');

/**
 * Same-stage native attack comparison: Regidrago genuinely announces Apex
 * Dragon, then resolves its own Dragon Dialga-GX UPR Overclock copy prompt.
 * Raw native history overwrites that declared attack with Overclock. The
 * existing opt-in history and non-GX Copycat hooks restore the original
 * declaration and allow the subsequent printed Mimikyu/Apex/Timeless line.
 *
 * No original shuffled 60 or competent complete opposing game is supplied.
 *
 * @returns {object} Both physical source-seat counterexamples and outcomes.
 */
function run() {
  const rows = [];
  for (const seat of [0, 1]) {
    const control = runSeat(seat);
    assert.equal(control.error, null);
    assert.equal(control.originalSourceLastAttackAfterResolvedApex?.attack,
      'Overclock', 'Pinned Store records copied payload as last attack');
    assert.equal(control.sourceHandImmediatelyAfterApex, 6);
    assert.equal(control.sourceDeckImmediatelyAfterApex, 2);
    assert.equal(control.mimikyuOpponentDamage, 0);

    const restoreHistory = installDeclaredCopyHistoryHook({
      mimikyu: true, regidrago: true
    });
    const restoreCopycat = installMimikyuNonGxCopycatHook();
    let treatment;
    try {
      treatment = runSeat(seat, {chooseMimikyuTimeless: true});
    } finally {
      restoreCopycat();
      restoreHistory();
    }
    const row = {
      sourceSeat: seat,
      control: {
        sourceDeclaredAttack: 'Apex Dragon',
        recordedLastAttack:
          control.originalSourceLastAttackAfterResolvedApex,
        copiedOverclockHand: control.sourceHandImmediatelyAfterApex,
        copiedOverclockDeck: control.sourceDeckImmediatelyAfterApex,
        opponentDamage: control.mimikyuOpponentDamage
      },
      treatment: {
        sourceLastAttack:
          treatment.originalSourceLastAttackAfterResolvedApex,
        copiedOverclockHand: treatment.sourceHandImmediatelyAfterApex,
        copiedOverclockDeck: treatment.sourceDeckImmediatelyAfterApex,
        opponentDamage: treatment.mimikyuOpponentDamage,
        gxUsed: treatment.mimikyuOwnerGXUsed,
        extraTurn: treatment.mimikyuOwnerTurnSkip,
        extraTurnClearArmed: treatment.mimikyuOwnerTurnSkipClearArmed,
        pending: treatment.nativePending,
        error: treatment.error,
        promptTrace: treatment.history
      }
    };
    rows.push(row);
    console.log('AGENT46_APEX_HISTORY_SEAT ' + JSON.stringify(row));
    assert.equal(treatment.error, null,
      'Corrected consecutive native attack should settle');
    assert.equal(treatment.originalSourceLastAttackAfterResolvedApex?.attack,
      'Apex Dragon', 'Opt-in history must retain declared printed attack');
    assert.equal(treatment.sourceHandImmediatelyAfterApex, 6);
    assert.equal(treatment.sourceDeckImmediatelyAfterApex, 2);
    assert.ok(treatment.history.some(e =>
      e.during === 'mimikyu-copycat' &&
      e.resolved === 'ChooseAttackPrompt' &&
      e.chosen === 'Timeless-GX'),
    'Mimikyu source must select real owner-discarded Dragon attack');
    assert.equal(treatment.mimikyuOwnerGXUsed, true);
    assert.equal(treatment.mimikyuOwnerTurnSkip, true);
    assert.ok(treatment.mimikyuOpponentDamage >= 150);
    assert.deepEqual(treatment.nativePending, []);
  }
  const out = {
    schema: 'agent46-genuine-prior-apex-copycat-history-both-seats-v1',
    nativeEnginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    realPriorSourceApexAttack: true,
    priorAttackerBoardStaged: true,
    originalPrinted60Game: false,
    ownerSourceHooksOptInAndRestored: true,
    vendorSourceEdited: false,
    competitivelyQualifiedGames: 0,
    rows
  };
  console.log('AGENT46_APEX_HISTORY_COMPARISON ' + JSON.stringify(out));
  return out;
}

if (require.main === module) run();
module.exports = {run};
