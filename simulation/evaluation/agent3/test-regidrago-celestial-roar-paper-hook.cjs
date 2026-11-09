'use strict';

const assert=require('node:assert/strict');
const {registered,runArm}=require('./portable-champion-all29-20261109.cjs');
const {TARGETS}=require('./diagnose-original-card-loss-20261109.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook}=
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-six-regidrago-celestial-roar-original-native-aba-v1';

/** @param {object} row @returns {object} Postdecision physical-root receipt. */
function compact(row){
  const p=row.physicalZoneQualification??null;
  return {
    id:row.trial?.id,seed:row.trial?.seed,
    finished:row.finished===true,winner:row.winner??null,
    errorCategory:row.error?String(row.error).split('\n')[0]:null,
    physicalStatus:p?.status??null,
    failingRoot:p?.firstFailingRoot??null,
    ownership:p?.witness?.ownership?.canonicalCounts??null,
    lastRootBeforeFailure:p?.witness?.
      lastAcceptedPublicRootsBeforeFailure?.slice(-3)??null,
    rootCount:row.rootActionLedger?.length??
      row.nativeAbortEvidence?.rootActionCount??
      row.actionCount??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    completedCelestialRoar:(row.rootActionLedger??[]).some(action=>
      action.action==='AttackAction'&&action.attack==='Celestial Roar'),
    paperQualified:false
  };
}

/**
 * Reproduce the six historical original-card disappearance errors unchanged,
 * then reexecute the exact same six seeds with only the reversible
 * Regidrago V Celestial Roar paper-custody hook enabled.
 */
function run(){
  const groups=registered().filter(g=>TARGETS.has(g.id));
  assert.equal(groups.length,6);
  const before=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let baseline,treatment;
  try{
    baseline=runArm(false,groups);
    const restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    try{
      treatment=runArm(false,groups);
    }finally{restoreRoar();}
  }finally{
    restoreDoor();
    if(before===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=before;
  }
  const pairs=groups.map((group,i)=>{
    const a=compact(baseline.rows[i]),b=compact(treatment.rows[i]);
    assert.equal(a.id,group.id);
    assert.equal(b.id,group.id);
    return {
      id:group.id,rank:group.rank,oldFailureRoot:TARGETS.get(group.id),
      unchangedSourceSeat:group.candidateSlot==='A'?1:0,
      baseline:a,treatment:b,
      baselineLostOriginalPhysicalCard:
        a.physicalStatus==='ENGINE_PHYSICAL_INVALID',
      treatmentPreservedOriginalPhysicalCard:
        b.physicalStatus==='SETTLED_PHYSICAL_INTEGRITY_PASSED',
      treatmentStillLostOriginalPhysicalCard:
        b.physicalStatus==='ENGINE_PHYSICAL_INVALID',
      treatmentNativeProgressedBeyondOldLoss:
        Number.isSafeInteger(b.rootCount)&&
        b.rootCount>=TARGETS.get(group.id)
    };
  });
  return {
    schema:VERSION,
    originalProspectiveRunId:42552656722,
    originalRegisteredSeedsAndFixedSixtiesUnchanged:true,
    onlyRegidragoCelestialRoarHookDiffers:true,
    paperGameQualified:false,
    actualNativeAttempts:12,
    summary:{
      baselineOriginalPhysicalFailures:pairs.filter(p=>
        p.baselineLostOriginalPhysicalCard).length,
      treatmentOriginalPhysicalFailures:pairs.filter(p=>
        p.treatmentStillLostOriginalPhysicalCard).length,
      treatmentIntegrityPassed:pairs.filter(p=>
        p.treatmentPreservedOriginalPhysicalCard).length,
      treatmentAdvancedBeyondOriginalBug:pairs.filter(p=>
        p.treatmentNativeProgressedBeyondOldLoss).length,
      treatmentNativeTerminals:pairs.filter(p=>
        p.treatment.finished).length,
      treatmentOtherErrors:pairs.filter(p=>
        p.treatment.errorCategory&&
        !p.treatmentStillLostOriginalPhysicalCard).length
    },
    pairs,
    limitation:'Technical root-custody experiment, not competitive fixed-deck win-rate evidence.'
  };
}

if(require.main===module){
  const r=run();
  if(process.env.AGENT3_REGIDRAGO_HOOK_OUTPUT)
    save(process.env.AGENT3_REGIDRAGO_HOOK_OUTPUT,r);
  process.stdout.write('AGENT3_REGIDRAGO_CELESTIAL_PAPER_HOOK '+
    JSON.stringify(r)+'\n');
  if(r.summary.baselineOriginalPhysicalFailures!==6 ||
      r.summary.treatmentOriginalPhysicalFailures>0)
    process.exitCode=1;
}
module.exports={VERSION,compact,run};
