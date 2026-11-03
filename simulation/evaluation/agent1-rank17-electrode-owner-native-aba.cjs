'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withElectroRainDamageHook}=
  require('../twinleaf/electro-rain-damage-hook.cjs');
const {installElectrodeGXEnergyHook}=
  require('../twinleaf/electrode-gx-energy-hook.cjs');
const {saveResult}=
  require('../twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');
const REGISTRATION=require('../../results/aichi-2026/registrations/agent1-rank17-electrode-owner-census-native-20261103.json');
const ADMISSION=require('../../results/aichi-2026/original-printed60-admission-v1.json');

const VERSION='agent1-rank17-original-electrode-owner-aba-native-v1';
const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
/** @param {unknown} obj @returns {string} */
const hash=obj=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');

/** Verify immutable input contract before compiled native outcomes. */
function preflight(){
  assert.equal(REGISTRATION.schema,
    'agent1-rank17-electrode-bomb-real-owner-census-registration-v1');
  assert.equal(REGISTRATION.sourceOriginalRank,17);
  assert.equal(REGISTRATION.opponentOriginalRank,1);
  assert.equal(REGISTRATION.enginePinnedCommit,PIN.split('/')[1]);
  assert.deepEqual(REGISTRATION.arms,[
    'canonical-control','canonical-readonly-observer','canonical-control-repeat'
  ]);
  assert.deepEqual(REGISTRATION.nativeRootOptions,
    {naturalEvolutionRoot:true,specialEnergyRoot:true});
  assert.deepEqual(REGISTRATION.sourceSeatByGroup,[0,1,0,1]);
  assert.deepEqual(REGISTRATION.nativeSeedsByGroup,[
    3536421031,728459147,1920663973,2066611947
  ]);
  assert.equal(REGISTRATION.nativeMaxActionsPerArm,140);
  assert.equal(new Set(REGISTRATION.nativeSeedsByGroup).size,4);
  for(const rank of [1,17]){
    const row=ADMISSION.rows.find(r=>r.rank===rank);
    const key=rank===17?'sourcePrinted60Sha256':'opponentPrinted60Sha256';
    assert.ok(row);
    assert.equal(REGISTRATION[key],row.printed60Sha256);
    assert.equal(row.physicalCards,60);
  }
  return REGISTRATION;
}

/** Only gameplay and physical evidence fields, excluding observer audit. */
function gameplayWitness(result){
  return {
    deckHashes:result.deckHashes,
    firstTurnSlot:result.firstTurnSlot,
    fullPhysicalDeal:result.initialFullPhysicalDealFingerprint,
    decisionTrace:result.decisionTrace,
    rootActionLedger:result.rootActionLedger,
    finished:result.finished,
    winner:result.winner??null,
    actionCount:result.actionCount??null
  };
}

/**
 * Execute the exact same source/native policy in all arms. The observer is
 * a default-off pure callback on genuine owner roots, never an action picker.
 * @param {object} request Pinned native headless match request.
 * @param {boolean} observe Whether to observe owner roots, no policy change.
 * @returns {object} Full successful result or an archived native error.
 */
function runArm(request,observe){
  try{
    return withElectroRainDamageHook(()=>{
      const restoreElectrode=installElectrodeGXEnergyHook();
      try{
        const root=work=>withActorOnlyRootPolicy(work,{
          naturalEvolutionRoot:true,
          specialEnergyRoot:true,
          ...(observe?{rank17ElectrodeBombCensus:true}:{})
        });
        const wrapped=withCanonicalActorOnlyPolicy(
          ()=>runMatch(request),{root},{
            ...(observe?{ownerElectrodeBombCensus:true}:{})
          });
        const audit=observe?wrapped.audit.ownerElectrodeBombCensusAudit:null;
        if(observe)assert.ok(audit&&audit.ownerRootDecisions>0,
          'No genuine native owner root observed by enabled census');
        return {
          error:null,
          witness:gameplayWitness(wrapped.result),
          nativeSummary:{
            finished:wrapped.result.finished,
            winner:wrapped.result.winner??null,
            firstTurnSlot:wrapped.result.firstTurnSlot,
            actionCount:wrapped.result.actionCount??null
          },
          rootAudit:observe?wrapped.audit.detailedComponentAudits?.root??null:null,
          sourceObserverAudit:audit
        };
      }finally{restoreElectrode();}
    });
  }catch(error){
    return {error:String(error?.stack??error),
      witness:null,nativeSummary:null,rootAudit:null,
      sourceObserverAudit:null};
  }
}

/** Run all preregistered A/B/A arms without discarding failed cases. */
function run(){
  preflight();
  initializeCards();
  const plan=planAichi(17,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.candidate.cards;
  const opponent=plan.opponents.find(r=>r.rank===1)?.cards;
  assert.ok(Array.isArray(source)&&source.length===60);
  assert.ok(Array.isArray(opponent)&&opponent.length===60);
  const groups=[];
  for(let g=0;g<REGISTRATION.nativeSeedsByGroup.length;g++){
    const seed=REGISTRATION.nativeSeedsByGroup[g];
    const sourceSeat=REGISTRATION.sourceSeatByGroup[g];
    const request={
      deckA:sourceSeat===0?source:opponent,
      deckB:sourceSeat===1?source:opponent,
      seed,maxActions:REGISTRATION.nativeMaxActionsPerArm,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
      label:VERSION+':registered-group-'+g
    };
    const arms=REGISTRATION.arms.map((name,i)=>({
      name,...runArm(request,i===1)
    }));
    const allNativeSucceeded=arms.every(a=>a.error===null);
    const witnesses=arms.map(a=>a.witness===null?null:hash(a.witness));
    const fullPhysicalFingerprints=arms.map(a=>
      a.witness?.fullPhysicalDeal?.digestSha256??null);
    const allPhysicalMatched=allNativeSucceeded&&
      fullPhysicalFingerprints[0]!==null&&
      fullPhysicalFingerprints.every(s=>s===fullPhysicalFingerprints[0]);
    const allTraceMatched=allNativeSucceeded&&
      witnesses.every(s=>s===witnesses[0]);
    groups.push({
      groupOrdinal:g,sourceSeat,seed,
      sourcePrinted60Sha256:REGISTRATION.sourcePrinted60Sha256,
      opponentPrinted60Sha256:REGISTRATION.opponentPrinted60Sha256,
      controlObservedRepeatedTraceDigests:witnesses,
      fullPhysicalFingerprints,
      allPhysicalMatched,allTraceMatched,allNativeSucceeded,
      arms
    });
  }
  const observed=groups.map(g=>g.arms[1].sourceObserverAudit).filter(Boolean);
  const sum=key=>observed.reduce((n,r)=>n+(r[key]??0),0);
  return {
    version:VERSION,enginePin:PIN,
    registration:REGISTRATION,
    registeredManifestHash:hash(REGISTRATION),
    originalDeckHashes:{source:hash(source),opponent:hash(opponent)},
    importSubstitutions:{
      source:plan.candidate.substitutions,
      opponent:plan.opponents.find(r=>r.rank===1)?.substitutions??[]
    },
    groups,
    summary:{
      independentSourcePhysicalDealGroups:groups.length,
      nativeArmsAttempted:groups.length*3,
      nativeArmsWithErrors:groups.flatMap(g=>g.arms)
        .filter(arm=>arm.error!==null).length,
      samePhysicalDealGroups:groups.filter(g=>g.allPhysicalMatched).length,
      sameFullTraceABAGroups:groups.filter(g=>g.allTraceMatched).length,
      observedAuthenticOwnerRoots:sum('ownerRootDecisions'),
      observedElectrodeRoots:sum('electrodeInPlayRoots'),
      observedRaichuRoots:sum('raichuRecipientInPlayRoots'),
      observedBothLineRoots:sum('lineCoPresentRoots'),
      observedZeroDiscardLineRoots:sum('lineWithZeroDiscardEnergyRoots'),
      observedPartialOneToFourLineRoots:sum('lineWithOneToFourDiscardEnergyRoots'),
      observedFullFivePlusLineRoots:sum('lineWithFivePlusDiscardEnergyRoots'),
      observedPhysicalPrerequisiteRoots:sum('physicalNecessaryRoots'),
      selectedNativeAbilityRoots:sum('sourceAbilityRootsActuallySelected'),
      competitiveQualifiedGames:0,
      performanceInference:'NONE: read-only repeated roots and native-unqualified play'
    }
  };
}

if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent1-rank17-electrode-owner-aba-native.json'),result);
  process.stdout.write('AGENT1_ELECTRODE_NATIVE_ABA '+
    JSON.stringify(result.summary)+'\n');
  if(result.summary.sameFullTraceABAGroups!==result.groups.length||
     result.summary.nativeArmsWithErrors>0)
    process.exitCode=1;
}

module.exports={VERSION,PIN,REGISTRATION,preflight,gameplayWitness,runArm,run};
