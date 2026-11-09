'use strict';

const assert=require('node:assert/strict');
const registration=require('../../../results/aichi-2026/registrations/agent3-prospective-all29-celestial-paper-v2-20261109.json');
const {runArm}=require('./portable-champion-all29-20261109.cjs');
const {withPlayabilityOrphanPromptCustody,VERSION:hookVersion}=
  require('../../twinleaf/agent3-playability-prompt-custody-hook.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook}=
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-rank7-guzma-playability-orphan-custody-native-ab-v1';
const targetId='7:6213:B:champion-reference';
const sourceGroups=()=>{
  const target=registration.groups.find(g=>g.id===targetId);
  const companion=registration.groups.find(g=>
    g.rank===7&&g.candidateSlot==='A');
  assert.ok(target&&companion);
  return [target,companion];
};

/**
 * Two already-registered rank7 historical deals in both arms. Exactly one
 * difference: the research-owned Store.calculatePlayability prompt cleanup
 * applies in treatment B. No cards, owner policies or root ceilings change.
 */
function run(){
  const groups=sourceGroups();
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreRoar=null,control,treatment,audit=null;
  try{
    restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    control=runArm(false,groups);
    const treated=withPlayabilityOrphanPromptCustody(
      ()=>runArm(false,groups));
    treatment=treated.result;
    audit=treated.audit;
  }finally{
    if(restoreRoar)restoreRoar();
    restoreDoor();
    if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
  }
  function compact(row){
    const error=row.error?String(row.error).split('\n')[0]:null;
    return {id:row.trial.id,finished:row.finished===true,
      winner:row.winner??null,error,
      rootCount:row.rootActionLedger?.length??row.actionCount??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      physicalStatus:row.physicalZoneQualification?.status??null,
      finalPrizes:row.finalPrizes??null};
  }
  const rows=groups.map((g,i)=>{
    const a=compact(control.rows[i]);
    const b=compact(treatment.rows[i]);
    const physicallyMatched=Boolean(a.fullPhysicalDealFingerprint&&
      a.sourceDealFingerprint&&
      a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint);
    return {rank:g.rank,seed:g.seed,id:g.id,physicalSeat:g.candidateSlot,
      physicallyMatched,control:a,treatment:b};
  });
  const target=rows.find(r=>r.id===targetId);
  const summary={
    historicalError:target?.control.error??null,
    treatmentError:target?.treatment.error??null,
    historicalFinished:target?.control.finished??false,
    treatmentFinished:target?.treatment.finished??false,
    matchedFullPhysicalDeals:rows.filter(x=>x.physicallyMatched).length,
    nativeErrorControl:rows.filter(x=>x.control.error).length,
    nativeErrorTreatment:rows.filter(x=>x.treatment.error).length,
    newlyNaturalTerminals:rows.filter(x=>
      !x.control.finished&&x.treatment.finished).length,
    removedFakePrompts:audit.removedOrphanedUnresolved,
    createdDuringPlayability:audit.created
  };
  return {
    schema:VERSION,
    frozenHistoricalSourceRun:42556056635,
    previousSourceActionFailureAtRoot:97,
    fixedContender60:'champion-reference',
    exactOriginalRank:7,registeredHistoricalPhysicalDeals:2,
    nativeAttempts:4,nativePin:registration.pinnedTwinleafCommit,
    controlAndTreatmentSameOwnerDecisionPolicy:true,
    treatmentOnlyPaperCompatibleFakePromptCleanup:hookVersion,
    paperQualifiedGames:0,
    summary,rows,correctionAudit:audit,
    actualNativeControl:control,actualNativeTreatment:treatment
  };
}
if(require.main===module){
  const report=run();
  if(process.env.AGENT3_GUZMA_PROMPT_CUSTODY_AB_OUTPUT)
    save(process.env.AGENT3_GUZMA_PROMPT_CUSTODY_AB_OUTPUT,report);
  process.stdout.write('AGENT3_RANK7_GUZMA_CUSTODY_AB '+JSON.stringify({
    summary:report.summary,rows:report.rows,
    correctionAudit:report.correctionAudit})+'\n');
  if(report.summary.matchedFullPhysicalDeals!==2)process.exitCode=1;
}
module.exports={VERSION,sourceGroups,run};
