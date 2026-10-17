'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {selectTrajectory}=require('./detached-simulator-game-contrast.cjs');
const {installDecisionBoundaryCardObserver}=require('./bot-decision-card-boundary-observer.cjs');
const {installPostSuperAliasRepairHook}=require('./post-super-alias-repair-hook.cjs');

/** @returns {object} One-seed, read-only source-ranked policy diagnostic. */
function measureDecisionBoundaries() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const ranks=new Map(field.decks.map(d=>[d.rank,d]));
  const a=ranks.get(1),b=ranks.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine);
  const request={
    deckA:a.cardIds,deckB:b.cardIds,seed:20261049,maxActions:350,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true
  };
  const control=selectTrajectory(runMatch(request));
  const observer=installDecisionBoundaryCardObserver();
  let original;
  try {original=selectTrajectory(runMatch(request));}
  finally {observer.restore();}
  assert.deepEqual(original,control,'Observer changed the decision trace');
  const restore=installPostSuperAliasRepairHook();
  let repaired,report;
  try {
    const monitor=installDecisionBoundaryCardObserver();
    try {repaired=selectTrajectory(runMatch(request));report=monitor.report;}
    finally {monitor.restore();}
  } finally {restore();}
  assert.deepEqual(original.deckHashes,repaired.deckHashes);
  assert.equal(original.actualFirstTurn,repaired.actualFirstTurn);
  return {
    protocol:'natural-bot-decision-boundary-card-observation-v1',
    sourceRanks:[1,10],seed:20261049,
    controlTraceSha256:control.recordFingerprint,
    observerNoninterference:true,
    original:{winner:original.winner,finished:original.finished,
      actions:original.actions,cardChanges:observer.report},
    repaired:{winner:repaired.winner,finished:repaired.finished,
      actions:repaired.actions,cardChanges:report},
    qualification:'unqualified-weak-bot-diagnostic'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(measureDecisionBoundaries(),null,2)+'\n');
}
module.exports={measureDecisionBoundaries};
