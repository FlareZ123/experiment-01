'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {selectTrajectory}=require('./detached-simulator-game-contrast.cjs');
const {installDecisionDamageHistoryRollback}=require('./decision-damage-history-rollback.cjs');
const {installPostSuperAliasRepairHook}=require('./post-super-alias-repair-hook.cjs');
const {installPinnedOneDecisionCloneFork}=require('./one-decision-clone-fork.cjs');

/** @param {Array<object>} a @param {Array<object>} b */
function firstDifference(a,b){
  for(let i=0;i<Math.max(a.length,b.length);i++){
    if(JSON.stringify(a[i])!==JSON.stringify(b[i]))return i+1;
  }
  return null;
}

/** @param {object} req @param {boolean} v2 */
function runObserved(req,v2){
  const observer=installDecisionDamageHistoryRollback();
  let undo=null;
  try {
    if(v2)undo=installPostSuperAliasRepairHook();
    return {game:selectTrajectory(runMatch(req)),report:observer.report};
  } finally {
    if(undo)undo();
    observer.restore();
  }
}

/** @returns {object} One-seed first differing natural action and one-step profile test. */
function contrast(){
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(d=>[d.rank,d]));
  const req={
    deckA:byRank.get(1).cardIds,deckB:byRank.get(10).cardIds,
    seed:20261049,maxActions:350,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true
  };
  const base=runObserved(req,false),full=runObserved(req,true);
  assert.deepEqual(base.game.deckHashes,full.game.deckHashes);
  assert.equal(base.game.actualFirstTurn,full.game.actualFirstTurn);
  const ordinal=firstDifference(base.report.decisionActions,
    full.report.decisionActions);
  let oneShot=null;
  if(ordinal!==null){
    const observe=installDecisionDamageHistoryRollback();
    const fork=installPinnedOneDecisionCloneFork(ordinal);
    try {
      const game=selectTrajectory(runMatch(req));
      assert.deepEqual(base.report.decisionActions.slice(0,ordinal-1),
        observe.report.decisionActions.slice(0,ordinal-1));
      assert.equal(fork.report.used,1);
      oneShot={
        fork:fork.report,winner:game.winner,actions:game.actions,
        gameDigest:game.recordFingerprint,
        selected:observe.report.decisionActions[ordinal-1],
        firstDifferenceFromBaseline:firstDifference(base.report.decisionActions,
          observe.report.decisionActions)
      };
    } finally {fork.restore();observe.restore();}
  }
  const i=ordinal===null?0:ordinal-1;
  return {
    experiment:'one-source-decision-corrected-simulator-v1',
    seed:req.seed,ranks:[1,10],firstDifferentOrdinal:ordinal,
    baselineAtDifference:base.report.decisionActions[i]||null,
    repairedAtDifference:full.report.decisionActions[i]||null,
    baseline:{winner:base.game.winner,actions:base.game.actions,
      historyWrites:base.report.changedCardFields},
    repaired:{winner:full.game.winner,actions:full.game.actions,
      historyWrites:full.report.changedCardFields},
    oneShot,qualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(contrast(),null,2)+'\n');
module.exports={firstDifference,contrast};
