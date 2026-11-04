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
  assert.equal(ids.length,8);
  assert.deepEqual(protectedRun.diagnostic.registered,ids);
  const observed=(execution)=>{
    const witness=execution.diagnostic.actualNativePrechoicePhysicalInputs;
    assert.ok(witness,'No actual source-owner setup input provenance');
    const map=new Map();
    for(const row of witness.events){
      const key=row.nativeStoreOrdinal+':'+row.physicalOwnerSeat;
      assert.ok(!map.has(key),'duplicate physical owner prechoice input');
      assert.ok(row.physicalOwnerSeat===0||row.physicalOwnerSeat===1);
      assert.ok(Number.isSafeInteger(row.nativeStoreOrdinal)&&
        row.nativeStoreOrdinal>=1&&row.nativeStoreOrdinal<=8);
      assert.match(row.opaquePhysicalPrechoiceInputSha256,/^[0-9a-f]{64}$/);
      map.set(key,row);
    }
    return {witness,map};
  };
  const a=observed(baseline),b=observed(protectedRun);
  const rows=ids.map((id,index)=>{
    const seats=[0,1].map(seat=>{
      const key=(index+1)+':'+seat;
      const first=a.map.get(key),second=b.map.get(key);
      return {
        physicalOwnerSeat:seat,
        baselineCaptured:first!==undefined,
        protectedCaptured:second!==undefined,
        beforeChoicePhysicalInputMatched:
          first&&second?
          first.opaquePhysicalPrechoiceInputSha256===
          second.opaquePhysicalPrechoiceInputSha256:null,
        baselineOpaquePrechoiceSha256:
          first?.opaquePhysicalPrechoiceInputSha256??null,
        protectedOpaquePrechoiceSha256:
          second?.opaquePhysicalPrechoiceInputSha256??null,
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
    return {
      id,sourceRank:Number(id.split(':')[0]),
      baselineStatus:rawA.status,protectedStatus:rawB.status,
      baselineRootCount:rawA.nativeRootActionCount,
      protectedRootCount:rawB.nativeRootActionCount,
      postTreatmentSourcePhysicalDigestEqual:
        rawA.sourceDealFingerprint&&rawB.sourceDealFingerprint?
          rawA.sourceDealFingerprint===rawB.sourceDealFingerprint:null,
      ownerSeats:seats
    };
  });
  const seats=rows.flatMap(row=>row.ownerSeats);
  const allBeforeTreatmentInputsObserved=seats.length===16&&
    seats.every(s=>s.baselineCaptured&&s.protectedCaptured);
  const beforeTreatmentMatches=seats.filter(s=>
    s.beforeChoicePhysicalInputMatched===true).length;
  const beforeTreatmentMismatches=seats.filter(s=>
    s.beforeChoicePhysicalInputMatched===false).length;
  const postTreatmentSourceDigestMismatches=rows.filter(row=>
    row.postTreatmentSourcePhysicalDigestEqual===false).length;
  return {
    schema:VERSION+'-paired-observations-v1',
    admission:'RETROSPECTIVE-DEVELOPMENT-ONLY',
    sameEightPreregisteredIDs:ids,
    baselineRevision:baseline.manifest.observedRepositoryGitCommit??null,
    protectedRevision:protectedRun.manifest.observedRepositoryGitCommit??null,
    prechoiceInputObservers:{
      baselineStores:a.witness.exactNativeStoreRootsRecorded,
      protectedStores:b.witness.exactNativeStoreRootsRecorded,
      baselineOwnerInputs:a.witness.firstOwnerSetupInputsObserved,
      protectedOwnerInputs:b.witness.firstOwnerSetupInputsObserved,
      hiddenCardNamesPublished:false
    },
    pairedRows:rows,
    constraints:{
      allBeforeTreatmentInputsObserved,
      beforeTreatmentMatches,
      beforeTreatmentMismatches,
      postTreatmentSourceDigestMismatches,
      canAttributePostTreatmentDifferenceToOpeningSelection:
        allBeforeTreatmentInputsObserved&&beforeTreatmentMismatches===0,
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
