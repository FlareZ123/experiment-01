'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {
  run:runNativeV2,writeLocked
}=require('./agent5-v7-postvolt-teamflare-prompt-aba-v2.cjs');
const {withNativeTeamFlareOwnerChoices,VERSION:GENERIC}=
  require('../twinleaf/agent5-owner-teamflare-prompt-generic-v1.cjs');
const reg=require('../../results/aichi-2026/registrations/agent5-v7-generic-owner-teamflare-aba-v3-20261106.json');

const VERSION='agent5-v7-source-generic-teamflare-ownerprompt-aba-v3';

function run(deps={}){
  assert.equal(reg.schema,'agent5-v7-generic-teamflare-owner-prompt-aba-v3');
  const original=runNativeV2({
    ...deps,promptLayer:deps.promptLayer??withNativeTeamFlareOwnerChoices
  });
  const target=original.byId.find(row=>row.id===reg.singleTarget.id);
  assert.ok(target?.target);
  assert.equal(original.original24NativeAttempts,24);
  assert.equal(original.original8UniqueRegisteredTrials,8);
  assert.equal(original.allSourceAndEntirePhysicalDealsIdentical,true);
  assert.equal(original.repeatedControlsIdentical,true);
  assert.equal(original.sevenNontargetPublicRootTapesIdentical,true);
  assert.equal(original.targetRootPrefixMatched,true);
  assert.equal(original.targetTreatmentPhysicalSameAsControl,true);
  assert.equal(target.rootSha.A,reg.expectedV2Frozen.targetRootA);
  assert.equal(target.rootSha.ARepeat,reg.expectedV2Frozen.targetRootA);
  assert.equal(target.rootSha.B,reg.expectedV2Frozen.targetRootB);
  assert.equal(original.targetPhysicalStoreWitness?.native,'returned');
  const physical=original.targetPhysicalStoreWitness.physical;
  const generic=original.targetPhysicalStoreWitness.prompt;
  assert.equal(generic.version,GENERIC);
  assert.equal(generic.acceptedFlareRoots,1);
  assert.equal(generic.authenticOwnerPromptOffers,1);
  assert.equal(generic.proposedOwnerResponses,1);
  assert.equal(generic.settledRealEnergyChoices,1);
  assert.equal(generic.physicalReceipts.length,1);
  assert.equal(generic.physicalReceipts[0].originalEnergyIdentity,true);
  assert.equal(physical.trueActorFlareAttempts,1);
  assert.equal(physical.acceptedStoreFlareRoots,1);
  assert.equal(physical.physicalOriginalFlareReachedOwnerDiscard??physical.physicalFlareReachedOwnerDiscard,true);
  assert.deepEqual(physical.exactOpponentEnergyMovedToDiscard,
    reg.expectedV2Frozen.physicalEnergyMoved);
  assert.deepEqual(target.originalSourcePrizes.A,
    reg.expectedV2Frozen.finalPrizeVector);
  assert.deepEqual(target.originalSourcePrizes.B,
    reg.expectedV2Frozen.finalPrizeVector);
  const a=original.phases.A.rows.find(row=>row.id===reg.singleTarget.id);
  const b=original.phases.B.rows.find(row=>row.id===reg.singleTarget.id);
  function firstPrize(row){
    return row.originalPublicRoots.find(x=>
      x.pendingPrompt==='ChoosePrizePrompt'&&x.playerSlot===1)?.turnBefore;
  }
  assert.equal(firstPrize(a),reg.expectedV2Frozen.firstOpponentPrizeTurnA);
  assert.equal(firstPrize(b),reg.expectedV2Frozen.firstOpponentPrizeTurnB);
  for(const phase of ['A','B','ARepeat']){
    const rows=original.phases[phase].rows;
    assert.equal(rows.filter(x=>x.status==='action-limit').length,
      reg.expectedV2Frozen.capsPerPhase);
    assert.equal(rows.filter(x=>x.status==='engine-error').length,
      reg.expectedV2Frozen.errorsPerPhase);
    assert.equal(rows.filter(x=>x.status==='native-terminal-unqualified').length,
      reg.expectedV2Frozen.terminalPerPhase);
  }
  return {...original,schema:VERSION,genericRegistration:reg,
    generalHandlerMatchesV2TargetPublicRoot:true,
    physicallySettledTeamFlareCount:generic.settledRealEnergyChoices,
    ownerSidePromptProvenance:true,
    verifiedSourceOriginalPromptSameDeal:true,
    competitiveQualifiedGames:0,winRateEstimate:null};
}

module.exports={VERSION,run};
if(require.main===module){
  const dir=process.env.AGENT5_V7_GENERIC_FLARE_DIR;
  assert.ok(dir,'Set AGENT5_V7_GENERIC_FLARE_DIR');
  const result=run();
  writeLocked(path.join(dir,'agent5-v7-teamflare-generic-v3.json'),result);
  process.stdout.write(JSON.stringify({schema:VERSION,
    original24NativeAttempts:result.original24NativeAttempts,
    controlParity:result.repeatedControlsIdentical,
    physicalParity:result.allSourceAndEntirePhysicalDealsIdentical,
    targetRootMatchesV2:result.generalHandlerMatchesV2TargetPublicRoot,
    exactOwnerEnergySettlements:result.physicallySettledTeamFlareCount,
    competitiveQualifiedGames:0})+'\n');
}
