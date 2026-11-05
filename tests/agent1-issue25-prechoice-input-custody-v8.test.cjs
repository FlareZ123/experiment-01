'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {
  comparePrechoiceCustodyV8
}=require('../simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs');
const {loadMirroredRegistration}=
  require('../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');

const digest=value=>createHash('sha256').update(value).digest('hex');

function fixture(mode){
  const trials=loadMirroredRegistration().trials.map(x=>({...x}));
  return {
    manifest:{
      prechoiceMode:mode,
      observedTwinleafGitCommit:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      observedRepositoryGitCommit:'f'.repeat(40),
      runtimeGitAttestationStatus:'VERIFIED',
      selectedOuterToInner:[
        'quarantine','declineGoFirstBothSeats',
        mode==='baseline'?'agent50AllEligibleInitialBasics':
          'agent50OwnerProtectedMultiBasicStore',
        'publicMulliganAndWaitAcks','mandatoryInTurnShowCards',
        'sourcePrintedAttackOriginObserver','canonicalActorCommonRunner'
      ]
    },
    diagnostic:{
      protectedOpeningAudit:mode==='protected'?{
        stores:8,initialAccepted:16,bonusDeclines:4,
        missingPhysicalPlacements:0,
        events:[{kind:'initial-active-and-ordinary-bench',
          preservedEntryPrintings:['SYNTHETIC-PRIVATE-HAND-SENTINEL']},
          {kind:'initial-active-and-ordinary-bench',
          preservedEntryPrintings:[]}]
      }:null,
      registered:trials.map(x=>x.id),
      attemptedRows:trials.map(x=>({
        id:x.id,status:'synthetic-incomplete',
        sourceDealFingerprint:digest('source-'+x.id),
        nativeRootActionCount:0
      })),
      actualNativePrechoicePhysicalInputs:{
        exactNativeStoreRootsRecorded:8,
        firstOwnerSetupInputsObserved:16,
        registeredNativeTrialLabelWitnessSelected:true,
        privateFingerprintSessionId:'same-private-module-session',
        exactPhysicalSixtyPrintedCountComparisons:16,
        exactPhysicalSixtyPrintedCountMatches:16,
        events:trials.flatMap((trial,i)=>[0,1].map(seat=>({
          nativeStoreOrdinal:i+1,registeredNativeTrialId:trial.id,
          physicalOwnerSeat:seat,nativeFirstPlayerSeat:0,
          ownerHandCount:7,ownerDeckCount:47,ownerPrizeCount:6,
          physicalSixtyCardCount:60,
          exactPhysicalSixtyPrintedCountMatched:true,
          opaquePhysicalPrechoiceInputHmacSha256:
            digest('synthetic-opaque-physical-'+trial.id+'-'+seat),
          opaquePreRunRequestHmacSha256:
            digest('synthetic-public-run-request-'+trial.id)
        })))
      }
    },
    rawDevelopment:{
      rows:trials.map(trial=>({
        trial,
        sourceSeat:trial.candidateSlot==='A'?1:0,
        candidateSeat:trial.candidateSlot==='A'?0:1,
        actualStarterSeat:0,
        sourceDeckFingerprint:digest('printed-source-'+trial.rank),
        candidateDeckFingerprint:digest('printed-candidate-'+trial.candidateId)
      }))
    }
  };
}

test('same exact registered native Store owner inputs still cannot certify treatment isolation',()=>{
  const baseline=fixture('baseline');
  const challenger=fixture('protected');
  const compared=comparePrechoiceCustodyV8(baseline,challenger);
  assert.equal(compared.constraints.allBeforeTreatmentInputsObserved,true);
  assert.equal(compared.constraints.trialPairedInputMatches,16);
  assert.equal(compared.constraints.trialPairedInputMismatches,0);
  assert.equal(compared.constraints.matchedNativePreRunRequests,16);
  assert.equal(compared.constraints.allActualPrechoicePhysicalSixtyPrintingsMatchConfigured,true);
  assert.equal(compared.prechoiceInputObservers.actualOwnerPrintedSixtiesMatched,32);
  assert.equal(compared.constraints.actualNativeInitialStartersMatched,8);
  assert.equal(compared.constraints.allActualNativeInitialStartersMatch,true);
  assert.equal(compared.constraints.nativeRegisteredRequestParityObserved,true);
  assert.equal(compared.protectedOpeningObservations.actualNativeStores,8);
  assert.equal(compared.protectedOpeningObservations.initialNativeAccepted,16);
  assert.equal(compared.protectedOpeningObservations.initialEventsWithHeldTurnEntrySupport,1);
  assert.equal(JSON.stringify(compared).includes('SYNTHETIC-PRIVATE-HAND-SENTINEL'),false);
  assert.equal(compared.constraints.sameRegisteredTrialIdentityAndDeckPrintings,true);
  assert.equal(compared.constraints.nativeStoreRegisteredPrintingParity,true);
  assert.equal(compared.constraints.completeReturnedPrintingDigestRows,8);
  assert.equal(compared.constraints.contradictoryReturnedPrintingDigestRows,0);
  assert.equal(compared.constraints.contradictoryReturnedSeatOrStarterRows,0);
  assert.equal(compared.constraints.sameObservedPinnedEngine,true);
  assert.equal(compared.constraints.declaredSingleOpeningWrapperContrast,true);
  assert.equal(compared.constraints.nativeStoreTrialLinkVerified,true);
  assert.equal(compared.constraints.actualNonTreatmentExecutingClosureVerified,false);
  assert.equal(compared.constraints.prechoiceInputParityObserved,true);
  assert.equal(compared.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
  assert.equal(compared.constraints.competitiveGamesQualified,0);
  assert.equal(compared.constraints.releaseQualified,false);
  // Raw, low-domain card hashes must not leak via the published comparison.
  assert.ok(!JSON.stringify(compared).includes(
    baseline.diagnostic.actualNativePrechoicePhysicalInputs.events[0]
      .opaquePhysicalPrechoiceInputHmacSha256));
});

test('same registered prechoice inputs do not rescue wrong trial seed or printing',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  b.rawDevelopment.rows[0].trial.seed++;
  b.rawDevelopment.rows[1].sourceDeckFingerprint=digest('wrong-printing');
  const comparison=comparePrechoiceCustodyV8(a,b);
  assert.equal(comparison.constraints.trialPairedInputMatches,16);
  assert.equal(comparison.constraints.sameRegisteredTrialIdentityAndDeckPrintings,false);
  assert.equal(comparison.pairedRows[0].registeredTrialIdentityMatched,false);
  assert.equal(comparison.pairedRows[1].originalAndContenderPrintingDigestsMatched,false);
  assert.equal(comparison.constraints.nativeStoreRegisteredPrintingParity,false);
  assert.equal(comparison.constraints.contradictoryReturnedPrintingDigestRows,1);
  assert.equal(comparison.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
});

test('same opaque trial pairing with different executing source/candidate seats is not admitted',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  b.rawDevelopment.rows[2].sourceSeat=1-b.rawDevelopment.rows[2].sourceSeat;
  const comparison=comparePrechoiceCustodyV8(a,b);
  assert.equal(comparison.pairedRows[2].physicalSeatsAndFirstPlayerMatched,false);
  assert.equal(comparison.constraints.sameRegisteredTrialIdentityAndDeckPrintings,false);
  assert.equal(comparison.constraints.nativeStoreRegisteredPrintingParity,false);
  assert.equal(comparison.constraints.contradictoryReturnedSeatOrStarterRows,1);
});

test('missing Store owner capture and duplicated owner capture fail closed',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  b.diagnostic.actualNativePrechoicePhysicalInputs.events.pop();
  const incomplete=comparePrechoiceCustodyV8(a,b);
  assert.equal(incomplete.constraints.allBeforeTreatmentInputsObserved,false);
  const duplicate=fixture('protected');
  duplicate.diagnostic.actualNativePrechoicePhysicalInputs.events.push({
    ...duplicate.diagnostic.actualNativePrechoicePhysicalInputs.events[0]
  });
  assert.throws(()=>comparePrechoiceCustodyV8(a,duplicate),
    /duplicate registered native trial owner prechoice input/);
});

test('missing native trial label or a different process private-HMAC session is unresolved',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  b.diagnostic.actualNativePrechoicePhysicalInputs.events[0]
    .registeredNativeTrialId=null;
  const missing=comparePrechoiceCustodyV8(a,b);
  assert.equal(missing.constraints.nativeStoreTrialLinkVerified,false);
  assert.equal(missing.constraints.prechoiceInputParityObserved,'UNRESOLVED');
  const c=fixture('protected');
  c.diagnostic.actualNativePrechoicePhysicalInputs.privateFingerprintSessionId=
    'another-process-secret';
  const different=comparePrechoiceCustodyV8(a,c);
  assert.equal(different.constraints.nativeStoreTrialLinkVerified,true);
  assert.equal(different.constraints.prechoiceInputParityObserved,'UNRESOLVED');
  assert.equal(different.prechoiceInputObservers.samePrivateHashSession,false);
});

test('registered owner equality is resilient to actual Store creation order',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  // The challenger creates Stores in reverse order; label identity remains.
  for(const event of b.diagnostic.actualNativePrechoicePhysicalInputs.events)
    event.nativeStoreOrdinal=9-event.nativeStoreOrdinal;
  const result=comparePrechoiceCustodyV8(a,b);
  assert.equal(result.constraints.nativeStoreTrialLinkVerified,true);
  assert.equal(result.constraints.trialPairedInputMatches,16);
  assert.equal(result.constraints.prechoiceInputParityObserved,true);
});

test('same registered private hand with changed native 60/seed/flags request fails request parity',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  b.diagnostic.actualNativePrechoicePhysicalInputs.events[5]
    .opaquePreRunRequestHmacSha256=digest('altered-public-decks-or-options');
  const comparison=comparePrechoiceCustodyV8(a,b);
  assert.equal(comparison.constraints.nativeStoreTrialLinkVerified,true);
  assert.equal(comparison.constraints.prechoiceInputParityObserved,true);
  assert.equal(comparison.constraints.matchedNativePreRunRequests,15);
  assert.equal(comparison.constraints.nativeRegisteredRequestParityObserved,false);
  assert.equal(comparison.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
});

test('different actual physical sixty is excluded even with identical registered run requests',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  b.diagnostic.actualNativePrechoicePhysicalInputs.events[2]
    .exactPhysicalSixtyPrintedCountMatched=false;
  b.diagnostic.actualNativePrechoicePhysicalInputs
    .exactPhysicalSixtyPrintedCountMatches=15;
  const c=comparePrechoiceCustodyV8(a,b);
  assert.equal(c.constraints.matchedNativePreRunRequests,16);
  assert.equal(c.constraints.allActualPrechoicePhysicalSixtyPrintingsMatchConfigured,false);
  assert.equal(c.constraints.nativeStoreRegisteredPrintingParity,false);
  assert.equal(c.prechoiceInputObservers.actualOwnerPrintedSixtiesMatched,31);
  assert.equal(c.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
});

test('post-opening public boards can differ without changing genuine prechoice inputs',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  const ids=a.diagnostic.registered;
  for(const run of [a,b]){
    run.diagnostic.actualNativePrechoicePhysicalInputs.firstTurnBoardEvents=
      ids.map((id,index)=>({
        registeredNativeTrialId:id,nativeStoreOrdinal:index+1,
        nativeFirstPlayerSeat:0,beforeFirstNativeTurnAction:true,
        boards:[0,1].map(seat=>({
          physicalOwnerSeat:seat,activePresent:true,benchOccupied:1,
          publicBoardHmacSha256:digest('same-public-board-'+id+'-'+seat)
        }))
      }));
  }
  const bFirst=b.diagnostic.actualNativePrechoicePhysicalInputs
    .firstTurnBoardEvents[0].boards[0];
  bFirst.benchOccupied=0;
  bFirst.publicBoardHmacSha256=digest('changed-actual-setup-board');
  const result=comparePrechoiceCustodyV8(a,b);
  assert.equal(result.constraints.trialPairedInputMatches,16);
  assert.equal(result.firstTurnPublicBoardObservations.baselineNativeBoardsBeforeFirstAction,8);
  assert.equal(result.firstTurnPublicBoardObservations.protectedNativeBoardsBeforeFirstAction,8);
  assert.equal(result.firstTurnPublicBoardObservations.changedPhysicalOwnerPokemonBoards,1);
  assert.equal(result.firstTurnPublicBoardObservations.changedPhysicalOwnerBenchCounts,1);
  assert.equal(JSON.stringify(result).includes('changed-actual-setup-board'),false);
  assert.equal(result.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
});

test('native Store registration survives an engine abort without inventing returned raw printings',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  // An error still returns an identified trial, but the per-game summary
  // lacks deck SHA/physical seat fields. The genuine prompt observer survives.
  const index=4;
  for(const run of [a,b]){
    const row=run.rawDevelopment.rows[index];
    delete row.sourceDeckFingerprint;
    delete row.candidateDeckFingerprint;
    delete row.sourceSeat;
    delete row.candidateSeat;
    delete row.actualStarterSeat;
    run.diagnostic.attemptedRows[index].status='engine-error';
  }
  const compared=comparePrechoiceCustodyV8(a,b);
  assert.equal(compared.constraints.sameRegisteredTrialIdentityAndDeckPrintings,false);
  assert.equal(compared.constraints.completeReturnedPrintingDigestRows,7);
  assert.equal(compared.constraints.nativeStoreRegisteredPrintingParity,true);
  assert.equal(compared.constraints.allActualPrechoicePhysicalSixtyPrintingsMatchConfigured,true);
  assert.equal(compared.pairedRows[index].returnedPrintingDigestsComplete,false);
  assert.equal(compared.pairedRows[index].nativeStoreRegisteredPrintingParity,true);
  assert.equal(compared.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
  assert.equal(compared.constraints.competitiveGamesQualified,0);
});

test('a partial returned digest contradiction vetoes otherwise matched Store custody',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  delete b.rawDevelopment.rows[3].candidateDeckFingerprint;
  b.rawDevelopment.rows[3].sourceDeckFingerprint=digest('wrong-native-source');
  const compared=comparePrechoiceCustodyV8(a,b);
  assert.equal(compared.constraints.completeReturnedPrintingDigestRows,7);
  assert.equal(compared.constraints.contradictoryReturnedPrintingDigestRows,1);
  assert.equal(compared.constraints.nativeStoreRegisteredPrintingParity,false);
  assert.equal(compared.pairedRows[3].contradictoryReturnedPrintingDigests,true);
});
