'use strict';

const assert=require('node:assert/strict');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {loadMirroredRegistration}=
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
    const actual=observe(next,{
      expectedTrialIds:loadMirroredRegistration().trials.map(t=>t.id)
    });
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
 * Replay the original eight rank-seat/contender60/seed registration twice.
 * The expected intervention is an opening chooser. The actual executing
 * non-treatment policy closure remains independently unverified.
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
    nativeRunLabelBoundToStoreObserved:true,
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
 * Join each genuine native Store to an authenticated registered run label
 * and its owner-seat prechoice input. Store ordinals do not determine trials.
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
   * Observe a genuine native Store with its registered runMatch trial label.
   * @param {object} execution
   */
  const observed=execution=>{
    const witness=execution.diagnostic.actualNativePrechoicePhysicalInputs;
    assert.ok(witness,'No actual source-owner setup input provenance');
    assert.ok(Array.isArray(witness.events));
    const map=new Map(),unknown=[],trialOrdinals=new Map();
    for(const event of witness.events){
      assert.ok(event.physicalOwnerSeat===0||event.physicalOwnerSeat===1);
      assert.ok(Number.isSafeInteger(event.nativeStoreOrdinal)&&
        event.nativeStoreOrdinal>=1&&event.nativeStoreOrdinal<=8);
      assert.match(event.opaquePhysicalPrechoiceInputHmacSha256,/^[0-9a-f]{64}$/);
      assert.match(event.opaquePreRunRequestHmacSha256,/^[0-9a-f]{64}$/);
      assert.equal(typeof event.exactPhysicalSixtyPrintedCountMatched,'boolean');
      assert.ok(Number.isSafeInteger(event.physicalSixtyCardCount));
      assert.ok(event.nativeFirstPlayerSeat===0||
        event.nativeFirstPlayerSeat===1);
      const id=event.registeredNativeTrialId;
      if(typeof id!=='string'||!ids.includes(id)){
        unknown.push({ordinal:event.nativeStoreOrdinal,seat:event.physicalOwnerSeat});
        continue;
      }
      const key=id+':'+event.physicalOwnerSeat;
      assert.ok(!map.has(key),'duplicate registered native trial owner prechoice input');
      map.set(key,event);
      const old=trialOrdinals.get(id);
      if(old!==undefined)assert.equal(old,event.nativeStoreOrdinal,
        'One registered trial must have one physical Store ordinal');
      else trialOrdinals.set(id,event.nativeStoreOrdinal);
    }
    return {witness,map,unknown,
      exactTrialStoreJoin:witness.registeredNativeTrialLabelWitnessSelected===true&&
        unknown.length===0&&map.size===16&&trialOrdinals.size===8&&
        new Set(trialOrdinals.values()).size===8};
  };
  const a=observed(baseline),b=observed(protectedRun);
  const samePrivateHashSession=!!a.witness.privateFingerprintSessionId&&
    a.witness.privateFingerprintSessionId===
      b.witness.privateFingerprintSessionId;
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
      const key=id+':'+seat;
      const first=a.map.get(key),second=b.map.get(key);
      return {
        physicalOwnerSeat:seat,
        baselineCaptured:first!==undefined,
        protectedCaptured:second!==undefined,
        // The registered trial label follows the genuine runMatch entry.
        trialPairedPrechoiceInputEqual:
          first&&second?
          first.opaquePhysicalPrechoiceInputHmacSha256===
          second.opaquePhysicalPrechoiceInputHmacSha256:null,
        identicalNativePreRunRequest:
          first&&second?
          first.opaquePreRunRequestHmacSha256===
          second.opaquePreRunRequestHmacSha256:null,
        baselineActualSixtyMatchedConfigured:
          first?.exactPhysicalSixtyPrintedCountMatched??null,
        protectedActualSixtyMatchedConfigured:
          second?.exactPhysicalSixtyPrintedCountMatched??null,
        baselinePhysicalSixtyCardCount:first?.physicalSixtyCardCount??null,
        protectedPhysicalSixtyCardCount:second?.physicalSixtyCardCount??null,
        samePhysicalHandCounts:
          first&&second?first.ownerHandCount===second.ownerHandCount:null,
        samePhysicalDeckCounts:
          first&&second?first.ownerDeckCount===second.ownerDeckCount:null
      };
    });
    const firstAtBaseline=a.map.get(id+':0')?.nativeFirstPlayerSeat;
    const otherAtBaseline=a.map.get(id+':1')?.nativeFirstPlayerSeat;
    const firstAtProtected=b.map.get(id+':0')?.nativeFirstPlayerSeat;
    const otherAtProtected=b.map.get(id+':1')?.nativeFirstPlayerSeat;
    const actualNativeInitialStarterVerified=
      (firstAtBaseline===0||firstAtBaseline===1)&&
      firstAtBaseline===otherAtBaseline&&
      firstAtBaseline===firstAtProtected&&
      firstAtProtected===otherAtProtected;
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
    // A native engine abort may omit returned-row printing fingerprints while
    // retaining both authenticated sixty-card inventories in genuine Stores.
    // A contradictory complete returned digest remains a hard veto.
    const returnedPrintingDigestsComplete=!!recordA&&!!recordB&&
      [recordA.sourceDeckFingerprint,recordB.sourceDeckFingerprint,
        recordA.candidateDeckFingerprint,recordB.candidateDeckFingerprint]
        .every(hex);
    const conflictingDigest=(key)=>hex(recordA?.[key])&&
      hex(recordB?.[key])&&recordA[key]!==recordB[key];
    const contradictoryReturnedPrintingDigests=
      conflictingDigest('sourceDeckFingerprint')||
      conflictingDigest('candidateDeckFingerprint');
    const sourceSeat=physicalSeat(trialA??{candidateSlot:'Z'});
    const contradictoryReturnedSeatOrStarter=[recordA,recordB].some(
      (record,index)=>!!record&&(
        ((record.sourceSeat===0||record.sourceSeat===1)&&
          record.sourceSeat!==sourceSeat)||
        ((record.candidateSeat===0||record.candidateSeat===1)&&
          record.candidateSeat!==1-sourceSeat)||
        ((record.actualStarterSeat===0||record.actualStarterSeat===1)&&
          record.actualStarterSeat!==firstAtBaseline)
      ));
    const nativeStoreRegisteredPrintingParity=
      trialIdentityMatched&&samePrivateHashSession&&
      actualNativeInitialStarterVerified&&
      !contradictoryReturnedPrintingDigests&&
      !contradictoryReturnedSeatOrStarter&&
      ownerSeats.every(seat=>
        seat.trialPairedPrechoiceInputEqual===true&&
        seat.identicalNativePreRunRequest===true&&
        seat.baselineActualSixtyMatchedConfigured===true&&
        seat.protectedActualSixtyMatchedConfigured===true);
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
      returnedPrintingDigestsComplete,
      contradictoryReturnedPrintingDigests,
      contradictoryReturnedSeatOrStarter,
      nativeStoreRegisteredPrintingParity,
      physicalSeatsAndFirstPlayerMatched:seatAndStarterMatched,
      nativeFirstPlayerSeatBeforeSetup:actualNativeInitialStarterVerified?
        firstAtBaseline:null,
      actualNativeInitialStarterVerified,
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
    s.trialPairedPrechoiceInputEqual===true).length;
  const beforeTreatmentMismatches=seats.filter(s=>
    s.trialPairedPrechoiceInputEqual===false).length;
  const matchingNativeRequests=seats.filter(s=>
    s.identicalNativePreRunRequest===true).length;
  const physicalSixtyPrintingsMatched=seats.reduce((sum,seat)=>sum+
    Number(seat.baselineActualSixtyMatchedConfigured===true)+
    Number(seat.protectedActualSixtyMatchedConfigured===true),0);
  const allPhysicalSixtyPrintingsMatched=allBeforeTreatmentInputsObserved&&
    physicalSixtyPrintingsMatched===32&&
    a.witness.exactPhysicalSixtyPrintedCountComparisons===16&&
    b.witness.exactPhysicalSixtyPrintedCountComparisons===16&&
    a.witness.exactPhysicalSixtyPrintedCountMatches===16&&
    b.witness.exactPhysicalSixtyPrintedCountMatches===16;
  const nativeStoreTrialLinkVerified=a.exactTrialStoreJoin&&b.exactTrialStoreJoin&&
    allBeforeTreatmentInputsObserved;
  const prechoiceInputParityObserved=nativeStoreTrialLinkVerified&&
    samePrivateHashSession?(beforeTreatmentMismatches===0):'UNRESOLVED';
  const nativeRegisteredRequestParityObserved=nativeStoreTrialLinkVerified&&
    samePrivateHashSession?(matchingNativeRequests===16):'UNRESOLVED';
  const firstTurnBoardEvents=execution=>{
    const witness=execution.diagnostic.actualNativePrechoicePhysicalInputs;
    const map=new Map();
    for(const event of witness.firstTurnBoardEvents??[]){
      assert.ok(ids.includes(event.registeredNativeTrialId));
      assert.ok(!map.has(event.registeredNativeTrialId),
        'duplicate genuine native first-turn board');
      assert.equal(event.beforeFirstNativeTurnAction,true);
      assert.equal(event.boards.length,2);
      for(const [seat,board] of event.boards.entries()){
        assert.equal(board.physicalOwnerSeat,seat);
        assert.match(board.publicBoardHmacSha256,/^[0-9a-f]{64}$/);
        assert.ok(Number.isSafeInteger(board.benchOccupied)&&
          board.benchOccupied>=0);
      }
      map.set(event.registeredNativeTrialId,event);
    }
    return map;
  };
  const beforeFirstA=firstTurnBoardEvents(baseline);
  const beforeFirstB=firstTurnBoardEvents(protectedRun);
  const firstTurnBoardRows=ids.map(id=>{
    const first=beforeFirstA.get(id),second=beforeFirstB.get(id);
    const individual=[0,1].map(seat=>{
      const aBoard=first?.boards[seat],bBoard=second?.boards[seat];
      return {
        physicalOwnerSeat:seat,
        baselineBenchOccupied:aBoard?.benchOccupied??null,
        protectedBenchOccupied:bBoard?.benchOccupied??null,
        sameBenchCount:aBoard&&bBoard?
          aBoard.benchOccupied===bBoard.benchOccupied:null,
        samePublicPokemonBoard:aBoard&&bBoard?
          aBoard.publicBoardHmacSha256===bBoard.publicBoardHmacSha256:null
      };
    });
    const candidateSeat=id.split(':')[2]==='A'?0:1;
    const sourceSeat=1-candidateSeat;
    return {id,bothCaptured:!!first&&!!second,
      sourceSeat,candidateSeat,physicalSeats:individual};
  });
  const publicBoardSeatPairs=firstTurnBoardRows.flatMap(row=>row.physicalSeats);
  const firstTurnBoardDifferences=publicBoardSeatPairs.filter(row=>
    row.samePublicPokemonBoard===false).length;
  const firstTurnBenchCountDifferences=publicBoardSeatPairs.filter(row=>
    row.sameBenchCount===false).length;
  const byRole={
    source:{
      changedPokemonBoards:firstTurnBoardRows.filter(row=>
        row.physicalSeats[row.sourceSeat].samePublicPokemonBoard===false).length,
      changedBenchCounts:firstTurnBoardRows.filter(row=>
        row.physicalSeats[row.sourceSeat].sameBenchCount===false).length
    },
    contender:{
      changedPokemonBoards:firstTurnBoardRows.filter(row=>
        row.physicalSeats[row.candidateSeat].samePublicPokemonBoard===false).length,
      changedBenchCounts:firstTurnBoardRows.filter(row=>
        row.physicalSeats[row.candidateSeat].sameBenchCount===false).length
    }
  };
  const actualInitialStarterMatches=rows.filter(row=>
    row.actualNativeInitialStarterVerified).length;
  const allActualInitialStartersMatch=actualInitialStarterMatches===8;
  const postTreatmentSourceDigestMismatches=rows.filter(row=>
    row.postTreatmentSourcePhysicalDigestEqual===false).length;
  const registeredTrialsAndPrintingsMatched=ar.complete&&br.complete&&
    rows.every(row=>row.registeredTrialIdentityMatched&&
      row.originalAndContenderPrintingDigestsMatched&&
      row.physicalSeatsAndFirstPlayerMatched);
  const nativeStoreRegisteredPrintingParity=ar.complete&&br.complete&&
    nativeStoreTrialLinkVerified&&
    rows.every(row=>row.nativeStoreRegisteredPrintingParity);
  const completeReturnedPrintingDigestRows=rows.filter(row=>
    row.returnedPrintingDigestsComplete).length;
  const contradictoryReturnedPrintingDigestRows=rows.filter(row=>
    row.contradictoryReturnedPrintingDigests).length;
  const contradictoryReturnedSeatOrStarterRows=rows.filter(row=>
    row.contradictoryReturnedSeatOrStarter).length;
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
      nativeStoreToTrialIdentityJoin:nativeStoreTrialLinkVerified?
        'VERIFIED-runMatch-label-to-AddPlayerAction-to-owner-prompt':
        'UNRESOLVED',
      samePrivateHashSession,
      privateFingerprintSessionIdPublished:false,
      actualOwnerPrintedSixtiesObserved:32,
      actualOwnerPrintedSixtiesMatched:physicalSixtyPrintingsMatched
    },
    pairedRows:rows,
    firstTurnPublicBoardObservations:{
      baselineNativeBoardsBeforeFirstAction:beforeFirstA.size,
      protectedNativeBoardsBeforeFirstAction:beforeFirstB.size,
      changedPhysicalOwnerPokemonBoards:firstTurnBoardDifferences,
      changedPhysicalOwnerBenchCounts:firstTurnBenchCountDifferences,
      byRole,
      rawBoardNamesOrFingerprintsPublished:false,
      trials:firstTurnBoardRows
    },
    protectedOpeningObservations:(()=>{
      const audit=protectedRun.diagnostic.protectedOpeningAudit??null;
      const initial=Array.isArray(audit?.events)?audit.events.filter(
        e=>e.kind==='initial-active-and-ordinary-bench'):null;
      return {
        actualNativeStores:audit?.stores??null,
        initialNativeAccepted:audit?.initialAccepted??null,
        optionalBonusDeclines:audit?.bonusDeclines??null,
        missingPhysicalPlacements:audit?.missingPhysicalPlacements??null,
        initialEventsWithHeldTurnEntrySupport:initial?initial.filter(
          e=>Array.isArray(e.preservedEntryPrintings)&&
            e.preservedEntryPrintings.length>0).length:null,
        hiddenHandNamesOrPositionsPublished:false,
        gameplayPayoffInferred:false
      };
    })(),
    constraints:{
      allBeforeTreatmentInputsObserved,
      trialPairedInputMatches:beforeTreatmentMatches,
      trialPairedInputMismatches:beforeTreatmentMismatches,
      matchedNativePreRunRequests:matchingNativeRequests,
      allActualPrechoicePhysicalSixtyPrintingsMatchConfigured:
        allPhysicalSixtyPrintingsMatched,
      actualNativeInitialStartersMatched:actualInitialStarterMatches,
      allActualNativeInitialStartersMatch:allActualInitialStartersMatch,
      nativeRegisteredRequestParityObserved,
      postTreatmentSourceDigestMismatches,
      // Raw game-row custody is weaker on aborts; never silently substitute
      // Store prechoice observations for the separate returned-row criterion.
      sameRegisteredTrialIdentityAndDeckPrintings:
        registeredTrialsAndPrintingsMatched,
      completeReturnedPrintingDigestRows,
      contradictoryReturnedPrintingDigestRows,
      contradictoryReturnedSeatOrStarterRows,
      nativeStoreRegisteredPrintingParity,
      sameObservedPinnedEngine:matchingEnginePin,
      declaredSingleOpeningWrapperContrast:declaredWrapperContrastOnly,
      // Exact before-treatment inputs still cannot exclude policy RNG
      // deviations or otherwise unobserved runtime actor mutations.
      nativeStoreTrialLinkVerified,
      actualNonTreatmentExecutingClosureVerified:false,
      prechoiceInputParityObserved,
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
