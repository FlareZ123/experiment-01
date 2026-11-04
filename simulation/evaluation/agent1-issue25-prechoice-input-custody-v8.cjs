'use strict';

const assert=require('node:assert/strict');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {runProtectedOpeningMirroredV7}=
  require('./agent1-issue25-protected-opening-v7.cjs');
const {withThreePrintedOwnerAttackFrontiers}=
  require('./agent1-issue25-joined-three-attacks-v5.cjs');
const {withSetupPrechoicePrivateFingerprint}=
  require('../twinleaf/agent1-setup-prechoice-private-fingerprint.cjs');

const VERSION='agent1-issue25-retrospective-opaque-prechoice-input-custody-v8';
const ENTRY='simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs';
const REGISTRATION=
  'results/aichi-2026/registrations/agent1-issue25-prechoice-input-custody-retro-v8-20261104.json';
const EXTRA_HASH_PATHS=[
  ENTRY,
  REGISTRATION,
  'simulation/twinleaf/agent1-setup-prechoice-private-fingerprint.cjs',
  'tests/agent1-setup-prechoice-private-fingerprint.test.cjs',
  'tests/agent1-issue25-prechoice-input-custody-v8.test.cjs',
  'tests/agent1-issue25-prechoice-input-custody-v8.native.test.cjs'
];

/**
 * Install source-authenticated printed attacks and a deeper, read-only
 * genuine-Store prechoice witness. Does not alter either source-neutral
 * resource actor or the owner setup choice under comparison.
 *
 * @template T
 * @param {()=>T} next
 * @param {{attackLayer?:Function,prechoiceLayer?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPrechoiceWitnessAndPrintedAttacks(next,deps={}){
  assert.equal(typeof next,'function');
  const attack=deps.attackLayer??withThreePrintedOwnerAttackFrontiers;
  const observe=deps.prechoiceLayer??withSetupPrechoicePrivateFingerprint;
  assert.equal(typeof attack,'function');
  assert.equal(typeof observe,'function');
  let prechoice=null;
  const selected=attack(()=>{
    const actual=observe(next);
    prechoice=actual.audit;
    return actual.result;
  });
  return {result:selected.result,audit:{
    ...selected.audit,
    actualNativePrechoicePhysicalInputs:prechoice,
    observerIssuesGameplayActions:0,
    sourceHiddenCardNamesPublished:false,
    competitiveGamesQualified:0
  }};
}

/**
 * Replay the original same eight rank×seat/contender60/seed registration
 * twice. The only gameplay difference is the separately registered protected
 * setup policy; this witness captures each player's randomized physical input
 * before the setup action that might change post-treatment zones.
 *
 * @param {'baseline'|'protected'} mode
 * @param {{runner?:Function,layers?:object,
 *    attackLayer?:Function,prechoiceLayer?:Function,openingLayer?:Function}} [deps]
 */
function runPrechoiceCustodyV8(mode,deps={}){
  assert.ok(mode==='baseline'||mode==='protected');
  const wrapper=next=>withPrechoiceWitnessAndPrintedAttacks(next,{
    attackLayer:deps.attackLayer,prechoiceLayer:deps.prechoiceLayer
  });
  const selected=(mode==='baseline'?
    runMirroredIssue25V6:runProtectedOpeningMirroredV7)({
      runner:deps.runner,layers:deps.layers,attackLayer:wrapper,
      openingLayer:deps.openingLayer
    });
  const prechoice=selected.diagnostic.audit
    ?.firstBlockedPromptEnvelope?.actualNativePrechoicePhysicalInputs??null;
  const manifest={
    ...selected.manifest,
    version:VERSION,
    policyEntryPoint:ENTRY,
    profile:'retrospective-real-Store-prechoice-physical-input-8-arm-'+mode,
    prechoiceMode:mode,
    sourceAndCandidateOriginalSixtiesFrozen:true,
    priorOriginalRankSeatRegistrationUnmodified:true,
    physicalInputRegistration:REGISTRATION,
    selectedOuterToInner:[
      ...selected.manifest.selectedOuterToInner.slice(0,-1),
      'agent1ActualNativePrechoiceOpaqueInputObserver',
      'canonicalActorCommonRunner'
    ],
    prechoiceAuditReadOnly:true,
    prechoiceCaptureDoesNotCertifySetupEffectParity:true,
    prechoiceCaptureDoesNotCertifyGameResults:true,
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    competitiveGamesQualified:0,
    releaseQualified:false
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    actualNativePrechoicePhysicalInputs:prechoice,
    prechoiceInputCount:prechoice?.firstOwnerSetupInputsObserved??null,
    physicalStoreCount:prechoice?.exactNativeStoreRootsRecorded??null,
    verdict:'FAIL-retrospective-prechoice-input-custody-development-only',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}

/**
 * Treat each Store ordinal as a preregistered trial ID and each physical
 * owner seat as an independent before-treatment observation. Equal source
 * seeds and different post-treatment boards alone do not decide parity.
 *
 * @param {object} baseline First actual native v8 baseline execution
 * @param {object} protectedRun Actual native v8 protected execution
 */
function comparePrechoiceCustodyV8(baseline,protectedRun){
  assert.equal(baseline.manifest.prechoiceMode,'baseline');
  assert.equal(protectedRun.manifest.prechoiceMode,'protected');
  const ids=baseline.diagnostic.registered;
  assert.ok(Array.isArray(ids));
  assert.equal(ids.length,8);
  assert.deepEqual(protectedRun.diagnostic.registered,ids);

  /**
   * Private randomized input is observed at Store time, but this observer
   * currently has only a Store creation ordinal. No authentic trial ID is
   * attached to that Store. An index-based pairing is diagnostic only.
   * @param {object} execution
   */
  const observed=execution=>{
    const witness=execution.diagnostic.actualNativePrechoicePhysicalInputs;
    assert.ok(witness,'No actual source-owner setup input provenance');
    assert.ok(Array.isArray(witness.events));
    const map=new Map();
    for(const event of witness.events){
      const key=event.nativeStoreOrdinal+':'+event.physicalOwnerSeat;
      assert.ok(!map.has(key),'duplicate physical owner prechoice input');
      assert.ok(event.physicalOwnerSeat===0||event.physicalOwnerSeat===1);
      assert.ok(Number.isSafeInteger(event.nativeStoreOrdinal)&&
        event.nativeStoreOrdinal>=1&&event.nativeStoreOrdinal<=8);
      assert.match(event.opaquePhysicalPrechoiceInputHmacSha256,/^[0-9a-f]{64}$/);
      map.set(key,event);
    }
    return {witness,map};
  };
  const a=observed(baseline),b=observed(protectedRun);
  const hex=value=>typeof value==='string'&&/^[0-9a-f]{64}$/.test(value);
  const physicalSeat=trial=>trial.candidateSlot==='A'?1:0;
  const inputTrialIds=new Set(ids);
  const rawById=execution=>{
    const records=execution.rawDevelopment?.rows;
    if(!Array.isArray(records))return {records:new Map(),complete:false};
    const map=new Map(),duplicates=new Set();
    for(const row of records){
      const id=row?.trial?.id??null;
      if(!inputTrialIds.has(id))continue;
      if(map.has(id))duplicates.add(id);
      map.set(id,row);
    }
    return {
      records:map,
      complete:map.size===8&&duplicates.size===0&&records.length===8
    };
  };
  const ar=rawById(baseline),br=rawById(protectedRun);
  const rows=ids.map((id,index)=>{
    const ownerSeats=[0,1].map(seat=>{
      const key=(index+1)+':'+seat;
      const first=a.map.get(key),second=b.map.get(key);
      return {
        physicalOwnerSeat:seat,
        baselineCaptured:first!==undefined,
        protectedCaptured:second!==undefined,
        // This is only ordinal-index parity. The observer does not yet know
        // the executing trial ID or a native Store's authenticated trial join.
        indexPairedPrechoiceInputEqual:
          first&&second?
          first.opaquePhysicalPrechoiceInputHmacSha256===
          second.opaquePhysicalPrechoiceInputHmacSha256:null,
        samePhysicalHandCounts:
          first&&second?first.ownerHandCount===second.ownerHandCount:null,
        samePhysicalDeckCounts:
          first&&second?first.ownerDeckCount===second.ownerDeckCount:null
      };
    });
    const rawA=baseline.diagnostic.attemptedRows[index];
    const rawB=protectedRun.diagnostic.attemptedRows[index];
    assert.equal(rawA?.id,id);
    assert.equal(rawB?.id,id);
    const recordA=ar.records.get(id);
    const recordB=br.records.get(id);
    const trialA=recordA?.trial,trialB=recordB?.trial;
    const trialIdentityMatched=!!trialA&&!!trialB&&
      trialA.id===id&&trialB.id===id&&
      trialA.rank===trialB.rank&&
      trialA.repeat===trialB.repeat&&
      trialA.seed===trialB.seed&&
      trialA.candidateSlot===trialB.candidateSlot&&
      trialA.candidateId===trialB.candidateId;
    const deckPrintingIdentitiesMatched=!!recordA&&!!recordB&&
      hex(recordA.sourceDeckFingerprint)&&
      hex(recordB.sourceDeckFingerprint)&&
      hex(recordA.candidateDeckFingerprint)&&
      hex(recordB.candidateDeckFingerprint)&&
      recordA.sourceDeckFingerprint===recordB.sourceDeckFingerprint&&
      recordA.candidateDeckFingerprint===recordB.candidateDeckFingerprint;
    const sourceSeat=physicalSeat(trialA??{candidateSlot:'Z'});
    const seatAndStarterMatched=trialIdentityMatched&&
      recordA.sourceSeat===sourceSeat&&recordB.sourceSeat===sourceSeat&&
      recordA.candidateSeat===1-sourceSeat&&
      recordB.candidateSeat===1-sourceSeat&&
      (recordA.actualStarterSeat===0||recordA.actualStarterSeat===1)&&
      recordA.actualStarterSeat===recordB.actualStarterSeat;
    return {
      id,sourceRank:Number(id.split(':')[0]),
      baselineStatus:rawA.status,protectedStatus:rawB.status,
      baselineRootCount:rawA.nativeRootActionCount,
      protectedRootCount:rawB.nativeRootActionCount,
      registeredTrialIdentityMatched:trialIdentityMatched,
      originalAndContenderPrintingDigestsMatched:deckPrintingIdentitiesMatched,
      physicalSeatsAndFirstPlayerMatched:seatAndStarterMatched,
      postTreatmentSourcePhysicalDigestEqual:
        rawA.sourceDealFingerprint&&rawB.sourceDealFingerprint?
          rawA.sourceDealFingerprint===rawB.sourceDealFingerprint:null,
      ownerSeats
    };
  });
  const seats=rows.flatMap(row=>row.ownerSeats);
  const allBeforeTreatmentInputsObserved=seats.length===16&&
    a.witness.events.length===16&&b.witness.events.length===16&&
    a.witness.exactNativeStoreRootsRecorded===8&&
    b.witness.exactNativeStoreRootsRecorded===8&&
    seats.every(s=>s.baselineCaptured&&s.protectedCaptured);
  const beforeTreatmentMatches=seats.filter(s=>
    s.indexPairedPrechoiceInputEqual===true).length;
  const beforeTreatmentMismatches=seats.filter(s=>
    s.indexPairedPrechoiceInputEqual===false).length;
  const postTreatmentSourceDigestMismatches=rows.filter(row=>
    row.postTreatmentSourcePhysicalDigestEqual===false).length;
  const registeredTrialsAndPrintingsMatched=ar.complete&&br.complete&&
    rows.every(row=>row.registeredTrialIdentityMatched&&
      row.originalAndContenderPrintingDigestsMatched&&
      row.physicalSeatsAndFirstPlayerMatched);
  const matchingEnginePin=!!baseline.manifest.observedTwinleafGitCommit&&
    baseline.manifest.observedTwinleafGitCommit===
      protectedRun.manifest.observedTwinleafGitCommit&&
    baseline.manifest.runtimeGitAttestationStatus==='VERIFIED'&&
    protectedRun.manifest.runtimeGitAttestationStatus==='VERIFIED';
  const controlStack=entry=>entry.manifest.selectedOuterToInner?.map(x=>
    x==='agent50OwnerProtectedMultiBasicStore'?
      'agent50AllEligibleInitialBasics':x);
  const declaredWrapperContrastOnly=JSON.stringify(controlStack(baseline))===
    JSON.stringify(controlStack(protectedRun))&&
    baseline.manifest.selectedOuterToInner?.includes(
      'agent50AllEligibleInitialBasics')&&
    protectedRun.manifest.selectedOuterToInner?.includes(
      'agent50OwnerProtectedMultiBasicStore');

  return {
    schema:VERSION+'-paired-observations-v2',
    admission:'RETROSPECTIVE-DEVELOPMENT-ONLY',
    sameEightPreregisteredIDs:ids,
    baselineRevision:baseline.manifest.observedRepositoryGitCommit??null,
    protectedRevision:protectedRun.manifest.observedRepositoryGitCommit??null,
    prechoiceInputObservers:{
      baselineStores:a.witness.exactNativeStoreRootsRecorded,
      protectedStores:b.witness.exactNativeStoreRootsRecorded,
      baselineOwnerInputs:a.witness.firstOwnerSetupInputsObserved,
      protectedOwnerInputs:b.witness.firstOwnerSetupInputsObserved,
      hiddenCardNamesPublished:false,
      privateFingerprintScheme:'process-keyed HMAC-SHA256',
      fingerprintKeyPublished:false,
      nativeStoreToTrialIdentityJoin:'UNRESOLVED-ordinal-only'
    },
    pairedRows:rows,
    constraints:{
      allBeforeTreatmentInputsObserved,
      ordinalIndexedInputMatches:beforeTreatmentMatches,
      ordinalIndexedInputMismatches:beforeTreatmentMismatches,
      postTreatmentSourceDigestMismatches,
      sameRegisteredTrialIdentityAndDeckPrintings:
        registeredTrialsAndPrintingsMatched,
      sameObservedPinnedEngine:matchingEnginePin,
      declaredSingleOpeningWrapperContrast:declaredWrapperContrastOnly,
      // Even perfect same-index HMAC equality does not prove native Store
      // ordinal -> trial ID joins or exclude unobserved actor toggles, RNG
      // deviations, and other changes to execution provenance.
      nativeStoreTrialLinkVerified:false,
      actualNonTreatmentExecutingClosureVerified:false,
      prechoiceInputParityObserved:'UNRESOLVED-ordinal-trial-join',
      canAttributePostTreatmentDifferenceToOpeningSelection:'UNRESOLVED',
      noFullGameWinRateInferred:true,
      all32OpponentsAdmitted:false,
      allPaperRulesCertified:false,
      competitiveGamesQualified:0,
      releaseQualified:false
    }
  };
}

module.exports={VERSION,ENTRY,REGISTRATION,EXTRA_HASH_PATHS,
  withPrechoiceWitnessAndPrintedAttacks,
  runPrechoiceCustodyV8,comparePrechoiceCustodyV8};
