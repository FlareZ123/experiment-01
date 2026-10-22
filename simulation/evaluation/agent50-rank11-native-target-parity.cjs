'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('./aichi-pilot.cjs');
const {sourceFirstPressureTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');
const {firstPhysicalTargetDifference}=
  require('../twinleaf/native-accepted-target-sidecar.cjs');
const {publicNativeAbortError}=
  require('../twinleaf/native-dispatch-abort-evidence.cjs');

const SEED=482443328;
const HISTORIC_SOURCE_DEAL=
  '60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31';
const ENV={
  AGENT50_STRANDED_MARNIE_DEV:'true',
  AGENT50_STRANDED_MARNIE_OWNER_SEAT:'0',
  AGENT50_STRANDED_GUZMA_DEV:'true',
  AGENT50_STRANDED_GUZMA_OWNER_SEAT:'0',
  AGENT50_GUZMA_ENERGY_STAGING_OWNER_SEAT:'0'
};

/**
 * Find an equality prefix for the legacy, lossy accepted-root projection.
 * @param {object[]} left
 * @param {object[]} right
 * @returns {number}
 */
function equalRootPrefix(left,right){
  let i=0;
  while(i<left.length&&i<right.length&&
      JSON.stringify(left[i])===JSON.stringify(right[i]))i++;
  return i;
}

/**
 * Compare only authenticated accepted Store targets, retaining abstentions.
 * @param {object} control
 * @param {object} treatment
 * @returns {object}
 */
function auditPair(control,treatment){
  const a=control.fullOriginalNativeRootActionLedger??[];
  const b=treatment.fullOriginalNativeRootActionLedger??[];
  const labelPrefix=equalRootPrefix(a,b);
  const left=control.nativeAcceptedTargetSidecar;
  const right=treatment.nativeAcceptedTargetSidecar;
  const physical=firstPhysicalTargetDifference(left,right);
  const rootBeforeLabel=a[labelPrefix]??null;
  const sourceDealEqual=typeof control.sourceDealFingerprint==='string'&&
    control.sourceDealFingerprint===treatment.sourceDealFingerprint;
  const authenticReceipt=left?.rootOrdinalLinked===true&&
    right?.rootOrdinalLinked===true;
  const firstPhysicalOrdinal=physical.status==='different'?
    physical.firstOrdinal:null;
  return {
    sourceDealEqual,
    historicSourceDealReproduced:
      control.sourceDealFingerprint===HISTORIC_SOURCE_DEAL,
    controlRootCount:a.length,treatmentRootCount:b.length,
    sameLabelPrefixCount:labelPrefix,
    firstDifferentLabelRoot:rootBeforeLabel,
    firstPhysicalTargetDifference:physical,
    firstPhysicalOrdinal,
    firstPhysicalPrecedesLabelDifference:
      sourceDealEqual&&authenticReceipt&&
      Number.isSafeInteger(firstPhysicalOrdinal)&&
      (rootBeforeLabel===null||
        firstPhysicalOrdinal<rootBeforeLabel.actionOrdinal),
    physicalParityCertified:sourceDealEqual&&authenticReceipt&&
      physical.status==='same-observed-targets'&&
      labelPrefix===a.length&&labelPrefix===b.length,
    limitedToAcceptedPlayCardAndRetreat:true,
    competitiveQualifiedGames:0
  };
}

/**
 * One historical selected physical deal, identical source/candidate 60s
 * and source-only controls; the Store target observer never guides decisions.
 * @returns {object}
 */
function run(){
  const deck=loadNewMoonCandidate();
  const plan=planAichi({label:deck.id,cards:deck.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const original=sourceFirstPressureTrials().find(row=>
    row.rank===11&&row.candidateId==='new-moon-lockbreaker-v1');
  assert.ok(original);
  const trial={...original,seed:SEED,id:'agent50-sidecar-original-'+SEED};
  assert.equal(trial.candidateSlot,'B');
  const decks=new Map([['new-moon-lockbreaker-v1',{plan}]]);
  const saved=Object.fromEntries(Object.keys({...ENV,
    AGENT50_GUZMA_ENERGY_STAGING_DEV:''}).map(key=>
    [key,process.env[key]]));
  const arms=[];
  try{
    Object.assign(process.env,ENV);
    for(const enabled of [false,true]){
      process.env.AGENT50_GUZMA_ENERGY_STAGING_DEV=String(enabled);
      try{
        const observed=withCanonicalActorOnlyPolicy(()=>
          executeDevelopment(trial,decks,{
            mandatoryOptionFallback:true,paperSupporterQuota:true,
            garbotoxinWindow:true,nativeAcceptedTargets:true
          }),{},{
            ownerSingleSearch:true,genericFallbackAttribution:true,
            actorHandDiscard:true,actorChoosePokemon:true
          });
        const result=observed.result;
        arms.push({
          treatmentEnabled:enabled,status:result.status??'completed',
          sourceDealFingerprint:result.sourceDealFingerprint??null,
          actualStarterSeat:result.actualStarterSeat??null,
          winner:result.winner??null,finished:result.finished??false,
          finalPrizes:result.finalPrizes??null,
          endReason:result.endReason??null,
          rootActionLedgerSha256:result.rootActionLedgerSha256??null,
          fullOriginalNativeRootActionLedger:result.rootActionLedger??[],
          nativeAcceptedTargetSidecar:result.nativeAcceptedTargetSidecar??null,
          physicalRootReceipts:
            observed.audit?.detailedComponentAudits?.root?.
              nativeRootAcceptances??[],
          nativeAbortEvidence:null
        });
      }catch(error){
        const diagnostic=publicNativeAbortError(error);
        const originalNative=
          require('../twinleaf/native-accepted-target-store-observer.cjs')
            .acceptedTargetAbortEvidence(error);
        arms.push({
          treatmentEnabled:enabled,status:'engine-error',
          error:diagnostic.error,
          nativeAbortEvidence:diagnostic.nativeAbortEvidence??null,
          nativeAcceptedTargetSidecar:originalNative,
          sourceDealFingerprint:
            diagnostic.nativeAbortEvidence?.sourceDealFingerprint??null,
          actualStarterSeat:null,
          fullOriginalNativeRootActionLedger:
            diagnostic.nativeAbortEvidence?.acceptedRootActionLedger??[]
        });
      }
    }
  }finally{
    for(const [name,value] of Object.entries(saved)){
      if(value===undefined)delete process.env[name];
      else process.env[name]=value;
    }
  }
  const [control,treatment]=arms;
  const comparison=control.status!=='engine-error'&&
    treatment.status!=='engine-error'?
    auditPair(control,treatment):
    {status:'unresolved-aborted-arm',competitiveQualifiedGames:0};
  return {
    schema:'agent50-rank11-original-store-physical-target-replay-v1',
    provenance:'retrospective rank11 seed 482443328; latest main branch policies',
    sourceRank:11,sourceSeat:0,candidateSeat:1,seed:SEED,
    historicalSourceDeal:HISTORIC_SOURCE_DEAL,
    unchangedCandidate:'new-moon-lockbreaker-v1',
    changes:'source-seat0-only Darkness Energy recipient preference; post-decision native target observer enabled in both arms',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    options:{mandatoryOptionFallback:true,paperSupporterQuota:true,
      garbotoxinWindow:true,nativeAcceptedTargets:true,
      sourceMarnie:true,sourceGuzma:true},
    attemptedArms:2,control,treatment,comparison,
    competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'Retrospective, untimed, potentially weak both-seat policies; a target receipt only authenticates accepted PlayCard/Retreat targets'
  };
}
if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(report.attemptedArms,2);
}
module.exports={SEED,HISTORIC_SOURCE_DEAL,equalRootPrefix,auditPair,run};
