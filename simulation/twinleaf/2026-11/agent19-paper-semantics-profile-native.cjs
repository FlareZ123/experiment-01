'use strict';
const assert=require('node:assert/strict');
const {trial}=require('../agent19-mew-energy-mix-native.cjs');
const {withPaperSemanticsProfileV1:withProfile,VERSION,PINNED_TWINLEAF}=
  require('./agent19-paper-semantics-profile-v1.cjs');
const {registered,runArm}=
  require('../../evaluation/agent3/portable-champion-all29-20261109.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../underworld-door-psychic-recipient-hook.cjs');

const ENABLED=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});
const ORIGINAL_IDS=Object.freeze([
  '12:6122:A:champion-reference',
  '12:6123:B:champion-reference'
]);

/** @returns {object} Narrow full-pinned-Store integration matrix. */
function run(){
  const constructedMew=[];
  for(const seat of [0,1]){
    const baseline=withProfile(()=>trial(seat,0,true),{});
    assert.equal(baseline.result.nativeShufflePromptSeen,false,
      'Raw pinned Mew source does not include its printed final shuffle');
    const legal=withProfile(()=>trial(seat,0,true),ENABLED);
    assert.equal(legal.result.attachedExactDeckDceToRecipient,true);
    assert.equal(legal.result.nativePrintedShuffleSettled,true);
    assert.equal(legal.audit.energyMixShuffle.shufflePromptsSettled,1);
    assert.equal(legal.audit.attachEnergyTarget.inspected,1);
    assert.equal(legal.audit.attachEnergyTarget.rejected,0);
    let blocked=null;
    try{withProfile(()=>trial(seat,2,true),ENABLED);}
    catch(error){blocked=error;}
    assert.equal(blocked?.code,'PAPER_ATTACH_ENERGY_BLOCKED_TO');
    assert.equal(blocked.paperAttachBlockedToAudit.rejected,1);
    const after=withProfile(()=>trial(seat,0,true),{});
    assert.equal(after.result.nativeShufflePromptSeen,false,
      'Profile must restore original Mew reducer after successful and rejected roots');
    constructedMew.push({
      seat,sourceDealt:false,
      baselineMissingPrintedShuffle:true,
      integratedRealShuffleSettled:legal.audit.energyMixShuffle.shufflePromptsSettled,
      integratedNativeEnergyTargetInspected:legal.audit.attachEnergyTarget.inspected,
      sourceDeckEnergyActuallyAttached:true,
      forbiddenRecipientRejectedBeforeTransfer:true,
      originalReducerRestoredAfterBothOutcomes:true,
      qualifiedPaperGames:0
    });
  }

  const groups=registered().filter(g=>ORIGINAL_IDS.includes(g.id));
  assert.deepEqual(groups.map(g=>g.id),ORIGINAL_IDS);
  const before=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let pair;
  try{
    pair=withProfile(()=>runArm(false,groups),ENABLED);
  }finally{
    restoreDoor();
    if(before===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=before;
  }
  assert.equal(pair.result.rows.length,2);
  const originalSourceRegidrago=pair.result.rows.map(row=>{
    const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
    const physical=row.physicalZoneQualification??null;
    return {
      id:row.trial.id,rank:row.trial.rank,
      candidateSeat:row.trial.candidateSlot==='A'?0:1,
      originalSeat:row.trial.candidateSlot==='A'?1:0,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      finished:row.finished===true,winner:row.winner??null,
      actionCount:roots.length,
      sourceCelestialAttackActuallyUsed:roots.some(root=>
        root.action==='AttackAction'&&root.attack==='Celestial Roar'),
      originalPhysicalStatus:physical?.status??null,
      engineError:row.error?String(row.error).split('\n')[0]:null,
      qualifiedPaperGames:0
    };
  });
  for(const row of originalSourceRegidrago){
    assert.equal(row.engineError,null,
      'Combined profile must not introduce native engine errors');
    assert.equal(row.originalPhysicalStatus,
      'SETTLED_PHYSICAL_INTEGRITY_PASSED',
      'Original Regidrago must retain its full physical 60 after Celestial Roar');
    assert.equal(row.sourceCelestialAttackActuallyUsed,true,
      'The original source must actually exercise the corrected card');
  }
  return {
    schema:'agent19-composed-paper-semantics-native-matrix-v1',
    pinnedTwinleaf:PINNED_TWINLEAF,profile:VERSION,
    profileEnabled:ENABLED,
    originalRegidragoPrintedSixtiesUnchanged:true,
    originalRegidragoRegisteredDealsRetrospective:true,
    sourceOriginalRanks:[12],
    originalNativeGroups:ORIGINAL_IDS,
    constructedMew,originalSourceRegidrago,
    samePolicyBothSeats:true,
    ownerPolicyCompetenceUnverified:true,
    officialClockUnverified:true,
    competitivePaperQualifiedGames:0,
    notAnOpponentMatchupWinRate:true
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write('AGENT19_COMPOSED_PAPER_NATIVE '+JSON.stringify(result)+'\n');
}
module.exports={run,ENABLED,ORIGINAL_IDS};
