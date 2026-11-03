'use strict';

const assert=require('node:assert/strict');
const {preflightFresh}=require('./agent34-rank1-fresh-underworld-native-pair.cjs');
const {compareSafely}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withUnderworldPhysicalSettlementWitness}=
  require('../twinleaf/agent34-underworld-physical-settlement-witness.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {auditedSourceDigest,authenticatedSourceAbilityRoots}=
  require('./agent34-fresh-underworld-abort-pair-audit.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent34-rank1-owner-typed-underworld-posthoc-development-v1';

/**
 * A retrospective replay on already OBSERVED exact original-rank1 sources.
 * All previously registered source prints, opponents, seats, and seeds stay
 * frozen, but this new prompt policy was selected AFTER the first experiment's
 * strict AttachEnergyPrompt failures. It is therefore not preregistered and
 * cannot be counted as fresh confirmatory evidence of deck superiority.
 * @returns {object}
 */
function run(){
  const {registration,original}=preflightFresh();
  const common={...original.registration.frozenCommonPolicy,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true};
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let control,treatment,physical;
  const restore=installUnderworldDoorPsychicRecipientHook();
  try{
    control=runDevelopment({...common,actorUnderworldDoorRoot:false});
    const observed=withUnderworldPhysicalSettlementWitness(() =>
      runDevelopment({...common,actorUnderworldDoorRoot:true}));
    treatment=observed.result;
    physical=observed.audit;
  }finally{
    restore();
    if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
  }
  const rawMatched=compareSafely(control.rows,treatment.rows);
  const byGame=new Map();
  for(const event of physical.events){
    const arr=byGame.get(event.game)??[];
    arr.push(event);byGame.set(event.game,arr);
  }
  const rows=registration.trials.map((trial,index)=>{
    const seat=trial.candidateSlot==='A'?1:0;
    const baseline=control.rows[index],selected=treatment.rows[index];
    assert.equal(baseline.trial.id,trial.id);
    assert.equal(selected.trial.id,trial.id);
    const a=auditedSourceDigest(baseline,seat);
    const b=auditedSourceDigest(selected,seat);
    const roots=authenticatedSourceAbilityRoots(selected,seat,b);
    const physicalEffects=(byGame.get(index+1)??[])
      .filter(event=>event.sourceSeat===seat);
    const completed=physicalEffects.filter(event=>
      event.fullPhysicalEffect===true).length;
    const sameSource=a.digest!==null&&b.digest!==null&&a.digest===b.digest;
    const good=rawMatched[index];
    return {
      trialId:trial.id,sourceSeat:seat,candidateId:trial.candidateId,
      controlStatus:baseline.status??(baseline.finished?'native-terminal':'censored'),
      treatmentStatus:selected.status??(selected.finished?'native-terminal':'censored'),
      recoveredSourceParity:sameSource,
      fullPhysicalAndStartMatched:good.sameSeed&&good.sameFullDeal&&
        good.sameSourceDeal&&good.sameStart,
      authenticatedUnderworldRoots:roots,
      physicallyCompletedUnderworldEffects:completed,
      nativeAbortSourceStage:selected.status==='engine-error'?
        selected.nativeAbortEvidence?.failureStage??null:null,
      typedOwnerPromptAudit:
        selected.actorOnlyDecisionCoverage?.ownerUnderworldPromptAudit??null,
      competitiveQualified:false
    };
  });
  const sum=key=>rows.reduce((count,row)=>count+(row[key]??0),0);
  const summary={attempted:control.rows.length+treatment.rows.length,
    sourceParity:sum('recoveredSourceParity'),
    strictBilateralPhysicalPairs:sum('fullPhysicalAndStartMatched'),
    sourceNativeUnderworldRoots:rows.every(row=>
      row.authenticatedUnderworldRoots!==null)?
      sum('authenticatedUnderworldRoots'):null,
    physicalUnderworldEffects:sum('physicallyCompletedUnderworldEffects'),
    nativeTreatmentErrors:rows.filter(row=>
      row.treatmentStatus==='engine-error').length,
    typedOwnerPromptProposals:rows.reduce((sum,row)=>
      sum+(row.typedOwnerPromptAudit?.sourcePromptProposals??0),0),
    typedOwnerPromptNativeAccepted:rows.reduce((sum,row)=>
      sum+(row.typedOwnerPromptAudit?.sourcePromptNativeAccepted??0),0),
    qualifiedPaperGames:0};
  return {schema:VERSION,retrospective:true,prospectivelyRegistered:false,
    originalRegistrationBlob:'1af4f729c0101483a2295e0df22b9070a8510417',
    reusedAlreadyObservedTrials:true,reusedRegisteredTrialCount:16,
    originalRank:1,enginePin:original.pin,originalRosterBlob:original.rosterBlob,
    originalSourceAndCandidatesUnchanged:true,
    originalPaperPsychicRecipientHookBothArms:true,
    actorTypedEnergyPromptBothArms:true,
    onlyRootDifference: 'Underworld Door own root OFF vs ON',
    ongoingSourcePowerUnqualified:true,
    retrospectiveMatching:rawMatched,
    summary,rows,physical,
    control,treatment,
    noCompetitiveWinRateEstimate:true,competitivelyQualifiedGames:0};
}

if(require.main===module){
  const result=run();
  if(process.env.AGENT34_OWNER_UNDERWORLD_POSTHOC_OUTPUT)
    save(process.env.AGENT34_OWNER_UNDERWORLD_POSTHOC_OUTPUT,result);
  process.stdout.write('AGENT34_OWNER_UNDERWORLD_POSTHOC '+JSON.stringify({
    schema:result.schema,summary:result.summary,
    aborted:result.rows.filter(row=>row.treatmentStatus==='engine-error')
      .map(row=>({trialId:row.trialId,stage:row.nativeAbortSourceStage})),
    qualifiedGames:0
  })+'\n');
}
module.exports={VERSION,run};
