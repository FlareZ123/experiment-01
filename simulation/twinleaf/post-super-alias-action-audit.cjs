'use strict';

const assert = require('node:assert/strict');
const {auditSimulatorCardIsolation} =
  require('./simulator-card-isolation-audit.cjs');
const {installPostSuperAliasRepairHook} =
  require('./post-super-alias-repair-hook.cjs');

/**
 * Confirm that the opt-in post-constructor alias reconciliation retains the
 * real pinned Store's attack outcome while isolating the source Card field.
 *
 * @returns {object} Staged action-level measurements, not a match outcome.
 */
function characterizePostSuperAliasAction() {
  const pinned = auditSimulatorCardIsolation();
  const restore = installPostSuperAliasRepairHook();
  let repaired;
  try {
    repaired = auditSimulatorCardIsolation();
  } finally {
    restore();
  }

  assert.equal(pinned.simulatedBoardDamage,280);
  assert.equal(pinned.animationPromptsResolved,3);
  assert.equal(pinned.liveCardFieldChanged,true);
  assert.equal(pinned.liveBoardDamageChanged,false);
  assert.equal(repaired.simulatedBoardDamage,280);
  assert.equal(repaired.animationPromptsResolved,3);
  assert.equal(repaired.clonedReferenceIdentical,false);
  assert.equal(repaired.liveCardFieldChanged,false);
  assert.equal(repaired.liveBoardDamageChanged,false);

  return {
    evidenceClass:'source-conditioned pinned-Store action under clone profiles',
    pinnedRevision:pinned.engineRevision,
    attack:'Meloetta ex / Technical Machine: Crisis Punch',
    pinned:{
      sourceCardAliased:pinned.clonedReferenceIdentical,
      simulatedDamage:pinned.simulatedBoardDamage,
      mutatedSourceCard:pinned.liveCardFieldChanged
    },
    optInReconciled:{
      sourceCardAliased:repaired.clonedReferenceIdentical,
      simulatedDamage:repaired.simulatedBoardDamage,
      mutatedSourceCard:repaired.liveCardFieldChanged
    },
    qualifiedForCompetitiveInference:false,
    caution:'Single staged real reducer and three Wait prompts. Neither full-game clone semantic equivalence nor human-level policy skill is established.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(characterizePostSuperAliasAction(),null,2)+'\n');
}

module.exports = {characterizePostSuperAliasAction};
