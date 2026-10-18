'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {selectTrajectory}=require('./detached-simulator-game-contrast.cjs');
const {installDecisionDamageHistoryRollback}=
  require('./decision-damage-history-rollback.cjs');
const {installPostSuperAliasRepairHook}=
  require('./post-super-alias-repair-hook.cjs');
const {firstDifference}=
  require('./single-decision-clone-source-contrast.cjs');

/**
 * One exact physical Aichi source deal with one explicitly selected DDE tactic
 * version and one independently selected Simulator clone profile.
 * @param {object} request
 * @param {boolean} archiveV3
 * @param {boolean} detached
 * @returns {object}
 */
function runArm(request,archiveV3,detached) {
  const monitor=installDecisionDamageHistoryRollback();
  let undo=null;
  try {
    if(detached)undo=installPostSuperAliasRepairHook();
    const result=runMatch({...request,doubleDragonArchiveV3:archiveV3});
    return {
      policy:result.policy,
      archiveV3,detached,
      game:selectTrajectory(result),
      choices:monitor.report.decisionActions,
      sourceDamageHistoryWrites:monitor.report.changedCardFields
    };
  } finally {
    if(undo)undo();
    monitor.restore();
  }
}

/** @returns {object} Same-current-head policy × clone profile causality test. */
function compareDdeCloneFactorial() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const ranks=new Map(field.decks.map(d=>[d.rank,d]));
  const a=ranks.get(1),b=ranks.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine);
  const request={
    deckA:a.cardIds,deckB:b.cardIds,seed:20261049,
    maxActions:350,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    doubleDragonRecovery:true,isolatePolicyRandomness:true
  };
  const v3Stock=runArm(request,true,false);
  const v3Detached=runArm(request,true,true);
  const v4Stock=runArm(request,false,false);
  const v4Detached=runArm(request,false,true);
  const arms=[v3Stock,v3Detached,v4Stock,v4Detached];
  for(const arm of arms){
    assert.deepEqual(arm.game.deckHashes,v3Stock.game.deckHashes);
    assert.equal(arm.game.actualFirstTurn,v3Stock.game.actualFirstTurn);
    assert.equal(arm.game.seed,v3Stock.game.seed);
    assert.equal(arm.archiveV3,arm.policy.includes('v3-archive'));
    if(!arm.archiveV3)assert.ok(arm.policy.includes('v4'));
  }
  /** @param {object} original @param {object} alternate */
  function pair(original,alternate){
    const first=firstDifference(original.choices,alternate.choices);
    return {
      firstDifferentDecisionOrdinal:first,
      atOrdinal110:{
        stock:original.choices[109]??null,
        detached:alternate.choices[109]??null
      },
      sourceChoices:original.choices.length,
      detachedChoices:alternate.choices.length,
      trajectoryEqual:original.game.recordFingerprint===
        alternate.game.recordFingerprint,
      originalWinner:original.game.winner,
      alternateWinner:alternate.game.winner,
      originalRootActions:original.game.actions,
      alternateRootActions:alternate.game.actions
    };
  }
  return {
    experiment:'historical-v3-v4-double-dragon-vs-simulator-clone-factorial-v1',
    sourceRanks:[1,10],sourceSeed:request.seed,
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceDeckHashes:v3Stock.game.deckHashes,
    actualFirstTurn:v3Stock.game.actualFirstTurn,
    v3StockVsDetached:pair(v3Stock,v3Detached),
    v4StockVsDetached:pair(v4Stock,v4Detached),
    v3StockVsV4Stock:pair(v3Stock,v4Stock),
    v3DetachedVsV4Detached:pair(v3Detached,v4Detached),
    arms:arms.map(x=>({
      archiveV3:x.archiveV3,detached:x.detached,policy:x.policy,
      selectedActions:x.choices.length,
      sourceDamageHistoryWrites:x.sourceDamageHistoryWrites,
      winner:x.game.winner,finished:x.game.finished,
      rootActions:x.game.actions,
      digest:x.game.recordFingerprint
    })),
    qualifiedCompetitiveGames:0,
    limitations:[
      'Four deliberately paired executions of one fixed seed do not produce four independent matches',
      'The archiveV3 flag is for retrospective causal diagnosis, not an endorsed competitive policy',
      'Selected-action fingerprint covers bounded headless telemetry, not full game-State replay or competent play'
    ]
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(compareDdeCloneFactorial(),null,2)+'\n');
module.exports={runArm,compareDdeCloneFactorial};
