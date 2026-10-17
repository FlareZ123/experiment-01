'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {selectTrajectory}=require('./detached-simulator-game-contrast.cjs');
const {installDecisionDamageHistoryRollback}=
  require('./decision-damage-history-rollback.cjs');

/** @param {Array<object>} original @param {Array<object>} repaired */
function firstDifferentDecision(original,repaired) {
  const length=Math.max(original.length,repaired.length);
  for(let i=0;i<length;i++){
    if(JSON.stringify(original[i])!==JSON.stringify(repaired[i])) {
      return {
        index:i+1,
        baseline:original[i]||null,
        corrected:repaired[i]||null,
        precedingBaseline:original.slice(Math.max(0,i-3),i),
        precedingCorrected:repaired.slice(Math.max(0,i-3),i)
      };
    }
  }
  return null;
}

/** @param {Array<object>} actions */
function actionsDigest(actions) {
  return createHash('sha256').update(JSON.stringify(actions)).digest('hex');
}

/** @returns {object} Controlled source-rank policy sensitivity report. */
function runDamageHistoryRollbackExperiment() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const ranks=new Map(field.decks.map(d=>[d.rank,d]));
  const a=ranks.get(1),b=ranks.get(10);
  assert.ok(a?.playableUnderEngine&&b?.playableUnderEngine);
  const request={
    deckA:a.cardIds,deckB:b.cardIds,seed:20261049,maxActions:350,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true
  };
  const unobserved=selectTrajectory(runMatch(request));
  const controlObserver=installDecisionDamageHistoryRollback();
  let control;
  try {control=selectTrajectory(runMatch(request));}
  finally {controlObserver.restore();}
  assert.deepEqual(control,unobserved,
    'Read-only damage history observer changed the source result');

  const repairObserver=installDecisionDamageHistoryRollback({
    restoreDamageHistory:true
  });
  let rollback;
  try {rollback=selectTrajectory(runMatch(request));}
  finally {repairObserver.restore();}
  assert.deepEqual(control.deckHashes,rollback.deckHashes);
  assert.equal(control.actualFirstTurn,rollback.actualFirstTurn);
  return {
    protocol:'source-ranked-single-field-decision-history-repair-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    ranks:[1,10],seed:20261049,maxActions:350,
    deckHashes:control.deckHashes,
    controlSummaryUnchangedByObserver:true,
    original:{
      winner:control.winner,finished:control.finished,actions:control.actions,
      trajectoryDigest:control.recordFingerprint,
      monitoredDecisions:controlObserver.report.decisions,
      sourceDamageWrites:controlObserver.report.changedCardFields,
      firstWriteDecision:controlObserver.report.firstWriteDecision,
      sampleWrites:controlObserver.report.sampleWrites.slice(0,12),
      policyActionDigest:actionsDigest(controlObserver.report.decisionActions)
    },
    rollback:{
      winner:rollback.winner,finished:rollback.finished,actions:rollback.actions,
      trajectoryDigest:rollback.recordFingerprint,
      monitoredDecisions:repairObserver.report.decisions,
      writesUndone:repairObserver.report.changedCardFields,
      firstWriteDecision:repairObserver.report.firstWriteDecision,
      sampleWrites:repairObserver.report.sampleWrites.slice(0,12),
      policyActionDigest:actionsDigest(repairObserver.report.decisionActions)
    },
    firstDifferentPolicyDecision:firstDifferentDecision(
      controlObserver.report.decisionActions,
      repairObserver.report.decisionActions
    ),
    caveat:'One fixed source-ranked seed, weak bots, source attack-history rollback only. Alternative game random events may diverge after the first changed action. No qualified wins or 99.5% inference.'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(runDamageHistoryRollbackExperiment(),null,2)+'\n');
}
module.exports={
  actionsDigest,firstDifferentDecision,runDamageHistoryRollbackExperiment
};
