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
      registered:trials.map(x=>x.id),
      attemptedRows:trials.map(x=>({
        id:x.id,status:'synthetic-incomplete',
        sourceDealFingerprint:digest('source-'+x.id),
        nativeRootActionCount:0
      })),
      actualNativePrechoicePhysicalInputs:{
        exactNativeStoreRootsRecorded:8,
        firstOwnerSetupInputsObserved:16,
        events:trials.flatMap((trial,i)=>[0,1].map(seat=>({
          nativeStoreOrdinal:i+1,physicalOwnerSeat:seat,
          ownerHandCount:7,ownerDeckCount:47,ownerPrizeCount:6,
          opaquePhysicalPrechoiceInputHmacSha256:
            digest('synthetic-opaque-physical-'+trial.id+'-'+seat)
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

test('same source deck, seed, seats, engine and index-only prechoice hash still cannot certify causal attribution',()=>{
  const baseline=fixture('baseline');
  const challenger=fixture('protected');
  const compared=comparePrechoiceCustodyV8(baseline,challenger);
  assert.equal(compared.constraints.allBeforeTreatmentInputsObserved,true);
  assert.equal(compared.constraints.ordinalIndexedInputMatches,16);
  assert.equal(compared.constraints.ordinalIndexedInputMismatches,0);
  assert.equal(compared.constraints.sameRegisteredTrialIdentityAndDeckPrintings,true);
  assert.equal(compared.constraints.sameObservedPinnedEngine,true);
  assert.equal(compared.constraints.declaredSingleOpeningWrapperContrast,true);
  assert.equal(compared.constraints.nativeStoreTrialLinkVerified,false);
  assert.equal(compared.constraints.actualNonTreatmentExecutingClosureVerified,false);
  assert.equal(compared.constraints.prechoiceInputParityObserved,
    'UNRESOLVED-ordinal-trial-join');
  assert.equal(compared.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
  assert.equal(compared.constraints.competitiveGamesQualified,0);
  assert.equal(compared.constraints.releaseQualified,false);
  // Raw, low-domain card hashes must not leak via the published comparison.
  assert.ok(!JSON.stringify(compared).includes(
    baseline.diagnostic.actualNativePrechoicePhysicalInputs.events[0]
      .opaquePhysicalPrechoiceInputHmacSha256));
});

test('same indexed prechoice inputs do not rescue wrong trial seed or source printing',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  b.rawDevelopment.rows[0].trial.seed++;
  b.rawDevelopment.rows[1].sourceDeckFingerprint=digest('wrong-printing');
  const comparison=comparePrechoiceCustodyV8(a,b);
  assert.equal(comparison.constraints.ordinalIndexedInputMatches,16);
  assert.equal(comparison.constraints.sameRegisteredTrialIdentityAndDeckPrintings,false);
  assert.equal(comparison.pairedRows[0].registeredTrialIdentityMatched,false);
  assert.equal(comparison.pairedRows[1].originalAndContenderPrintingDigestsMatched,false);
  assert.equal(comparison.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
});

test('same opaque index pairing with different executing source/candidate seats is not admitted',()=>{
  const a=fixture('baseline'),b=fixture('protected');
  b.rawDevelopment.rows[2].sourceSeat=1-b.rawDevelopment.rows[2].sourceSeat;
  const comparison=comparePrechoiceCustodyV8(a,b);
  assert.equal(comparison.pairedRows[2].physicalSeatsAndFirstPlayerMatched,false);
  assert.equal(comparison.constraints.sameRegisteredTrialIdentityAndDeckPrintings,false);
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
    /duplicate physical owner prechoice input/);
});
