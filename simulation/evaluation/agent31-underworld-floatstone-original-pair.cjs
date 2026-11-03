'use strict';
const assert=require('node:assert/strict');
const {preflightFresh}=require('./agent34-rank1-fresh-underworld-native-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {auditedSourceDigest}=require('./agent34-fresh-underworld-abort-pair-audit.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent31-underworld-floatstone-retrospective-original-rank1-B-v1';
const IDS=['1:1:B:champion-reference','1:1:B:new-moon-lockbreaker-v1'];
const actorRoot=row=>row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
/** @param {object} row @param {number} seat @param {string} kind */
const sourceRoots=(row,seat,kind)=>
  (row.rootActionLedger??[]).filter(x=>
    x.playerSlot===seat&&x.action===kind).length;
const sourceMaxGeists=(row,seat)=>
  (row.rootActionLedger??[]).filter(x=>
    x.playerSlot===seat&&x.action==='AttackAction'&&
    x.attack==='Max Geist').length;
/** Previously observed exact original rank1 source games, development only. */
function run(){
  const {registration,original}=preflightFresh();
  const trials=IDS.map(id=>{
    const t=registration.trials.find(row=>row.id===id);
    assert.ok(t,'Original trial missing: '+id);
    assert.equal(t.candidateSlot,'B');
    return t;
  });
  const common={...original.registration.frozenCommonPolicy,
    registeredTrials:trials,
    registeredFrameName:registration.schema,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true};
  const before=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const uninstall=installUnderworldDoorPsychicRecipientHook();
  let baseline,treatment;
  try{
    baseline=runDevelopment({...common,
      actorFundedShadowRiderFloatStoneRoot:false});
    treatment=runDevelopment({...common,
      actorFundedShadowRiderFloatStoneRoot:true});
  }finally{
    uninstall();
    if(before===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=before;
  }
  const parity=compareSafely(baseline.rows,treatment.rows);
  const rows=trials.map((trial,i)=>{
    const a=baseline.rows[i],b=treatment.rows[i],seat=0,match=parity[i];
    const ad=auditedSourceDigest(a,seat),bd=auditedSourceDigest(b,seat);
    return {trialId:trial.id,sourceSeat:seat,
      controlStatus:a.status??(a.finished?'native-terminal':'censored'),
      treatmentStatus:b.status??(b.finished?'native-terminal':'censored'),
      controlWinner:a.winner??null,treatmentWinner:b.winner??null,
      actualSourcePhysicalOpeningMatched:ad.digest!==null&&ad.digest===bd.digest,
      wholeBilateralOpeningAndStarterMatched:
        match.sameSeed&&match.sameFullDeal&&match.sameSourceDeal&&match.sameStart,
      controlSourceAttacks:sourceRoots(a,seat,'AttackAction'),
      treatmentSourceAttacks:sourceRoots(b,seat,'AttackAction'),
      controlSourceMaxGeist:sourceMaxGeists(a,seat),
      treatmentSourceMaxGeist:sourceMaxGeists(b,seat),
      controlSourceRetreats:sourceRoots(a,seat,'RetreatAction'),
      treatmentSourceRetreats:sourceRoots(b,seat,'RetreatAction'),
      controlSourceUnderworld:sourceRoots(a,seat,'UseAbilityAction'),
      treatmentSourceUnderworld:sourceRoots(b,seat,'UseAbilityAction'),
      allSeatRescueSelections:actorRoot(b).fundedVmaxFloatStoneRootSelected??0,
      treatmentNativePhysicalConfirmations:actorRoot(b).nativePhysicalConfirmed??null,
      controlRootSha:a.rootActionLedgerSha256??null,
      treatmentRootSha:b.rootActionLedgerSha256??null,
      competitivePaperGameQualified:false};
  });
  const sum=k=>rows.reduce((n,x)=>n+x[k],0);
  const summary={previouslyInspectedPhysicalTrials:trials.length,
    attemptedNativeGames:4,
    pairedEntireOpening:rows.filter(x=>
      x.wholeBilateralOpeningAndStarterMatched).length,
    pairedSourceOpening:rows.filter(x=>
      x.actualSourcePhysicalOpeningMatched).length,
    rescueSelectionsAllSeats:sum('allSeatRescueSelections'),
    nativeSourceControlRetreats:sum('controlSourceRetreats'),
    nativeSourceTreatmentRetreats:sum('treatmentSourceRetreats'),
    nativeSourceControlAttacks:sum('controlSourceAttacks'),
    nativeSourceTreatmentAttacks:sum('treatmentSourceAttacks'),
    nativeSourceControlMaxGeist:sum('controlSourceMaxGeist'),
    nativeSourceTreatmentMaxGeist:sum('treatmentSourceMaxGeist'),
    errors:rows.filter(x=>x.treatmentStatus==='engine-error').length,
    competitivelyQualifiedPaperGames:0};
  return {schema:VERSION,retrospective:true,registrationFrozenButSeedsObserved:true,
    originalRegistrationBlob:'1af4f729c0101483a2295e0df22b9070a8510417',
    pinnedTwinleaf:original.pin,original60Unchanged:true,
    candidate60Unchanged:true,symmetricActorOnlyPolicy:true,
    onlyPolicyChange:'default-off funded Shadow Rider Float Stone owner-root rescue',
    originalSourceAndCandidatePhysicalDealsCompared:true,
    summary,rows,baseline,treatment};
}
if(require.main===module){
  const out=run();
  if(process.env.AGENT31_FLOAT_STONE_PAIR_OUTPUT)
    save(process.env.AGENT31_FLOAT_STONE_PAIR_OUTPUT,out);
  process.stdout.write('AGENT31_SHADOW_RIDER_FLOATSTONE_PAIR '+
    JSON.stringify({schema:VERSION,summary:out.summary,rows:out.rows})+'\n');
}
module.exports={VERSION,IDS,run};
