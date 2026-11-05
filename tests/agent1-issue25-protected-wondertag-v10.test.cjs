'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  withPrintedWonderTagAndAttacks,compareProtectedWonderTagV10,VERSION
}=require('../simulation/evaluation/agent1-issue25-protected-wondertag-v10.cjs');

const ids=[
  '6:100:A:champion-reference',
  '6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference',
  '11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference',
  '11:103:B:new-moon-lockbreaker-v1'
];

/** @param {string} label @returns {object} */
function fixture(label){
  const events=ids.flatMap((id,index)=>[0,1].map(seat=>({
    registeredNativeTrialId:id,
    nativeStoreOrdinal:index+1,
    physicalOwnerSeat:seat,
    opaquePhysicalPrechoiceInputHmacSha256:
      createHash('sha256').update(String(index)+':'+seat+':input').digest('hex'),
    opaquePreRunRequestHmacSha256:
      createHash('sha256').update(String(index)+':request').digest('hex'),
    nativeFirstPlayerSeat:index%2,
    firstBeforeAnyOwnerSetupChoice:true,globalTurnAtCapture:0,
    noPolicyChoiceOrHiddenNamesPublished:true,
    ownerHandCount:7,ownerDeckCount:47,ownerPrizeCount:6,
    physicalSixtyCardCount:60,
    exactPhysicalSixtyPrintedCountMatched:true
  })));
  return {
    manifest:{
      prechoiceMode:'protected',observedTwinleafGitCommit:'vendor-pin',
      observedRepositoryGitCommit:'research-pin'
    },
    diagnostic:{
      registered:ids,
      actualNativePrechoicePhysicalInputs:{
        exactNativeStoreRootsRecorded:8,firstOwnerSetupInputsObserved:16,
        exactPhysicalSixtyPrintedCountMatches:16,
        registeredNativeTrialLabelWitnessSelected:true,
        privateFingerprintSessionId:'shared-private-session',
        events
      },
      attemptedRows:ids.map(id=>({
        id,status:'root-capped',nativeRootActionCount:48,
        sourceDealFingerprint:id+'-post'
      })),
      audit:{firstBlockedPromptEnvelope:label==='treatment'?{
        sourceIndependentOwnerWonderTag:{
          version:'v4',confirmOffers:2,searchOffers:2,
          confirmed:2,selectedSupporters:2,emptySearches:0,
          nativeAccepted:4,nativeRejected:0,nativeUnsettled:0,
          nativeCustodyFailures:0,settledSupporterTransfers:2,
          nativeMissingSearchFollowup:0,bySeat:{0:4,1:0}
        },
        ownerWonderTagMandatoryZeroShuffle:{
          version:'v1',printedEntrances:2,
          interceptedSupporterSearches:2,zeroSelections:0,
          nonzeroNativeSelections:2,repairedShuffles:0
        },
        registeredWonderTagActorWitness:{
          version:'witness-v1',observedSearchDecisionCount:2,
          decisions:[
            {id:ids[6],actorSeat:0,globalTurn:2,answerCardinality:1,
              ownerDeckPrintingsOmitted:true},
            {id:ids[7],actorSeat:0,globalTurn:2,answerCardinality:1,
              ownerDeckPrintingsOmitted:true}
          ]
        }
      }:{}}
    }
  };
}

test('owner Wonder Tag and printed attack wrapper preserve execution result, full actor nesting and read-only audits',()=>{
  const sequence=[];
  const wrap=(name,data)=>next=>{
    sequence.push(name+'-start');
    const result=next();
    sequence.push(name+'-end');
    return {result,audit:data};
  };
  const done=withPrintedWonderTagAndAttacks(
    ()=>{sequence.push('live-work');return {trueResult:true};},{
      attack:wrap('attack',{printedAttacks:3}),
      wonder:wrap('wonder',{confirmed:1}),
      shuffle:wrap('shuffle',{zeroSelections:0}),
      witnessFactory:()=>({
        run:work=>work(),
        selectSupporterIndex:()=>0,
        audit:{version:'fixture',observedSearchDecisionCount:0,decisions:[]}
      })
    });
  assert.deepEqual(sequence,[
    'shuffle-start','wonder-start','attack-start','live-work',
    'attack-end','wonder-end','shuffle-end'
  ]);
  assert.deepEqual(done.result,{trueResult:true});
  assert.equal(done.audit.printedAttacks,3);
  assert.equal(done.audit.sourceIndependentOwnerWonderTag.confirmed,1);
  assert.equal(done.audit.ownerWonderTagMandatoryZeroShuffle.zeroSelections,0);
  assert.equal(done.audit.competitiveGamesQualified,0);
});

test('same exact 8 IDs and both owner prechoice physical 60 match without inferring game outcomes',()=>{
  const report=compareProtectedWonderTagV10(fixture('control'),fixture('treatment'));
  assert.equal(report.schema,VERSION);
  assert.equal(report.ids.length,8);
  assert.equal(report.observedOriginalActualNativePrechoiceOwnerRecords,16);
  assert.equal(report.matchingGenuineOwnerPrechoiceAndRequestPairs,16);
  assert.equal(report.samePrivateHmacSession,true);
  assert.equal(report.sameVendorPin,true);
  assert.equal(report.sameRepositoryPin,true);
  assert.equal(report.comparisonEligibleForPolicyStudy,true);
  assert.equal(report.actualOwnerWonderTagAudit.settledSupporterTransfers,2);
  assert.equal(report.registeredWonderTagActorWitness.authenticatedTrialAndActorSeat,true);
  assert.equal(report.registeredWonderTagActorWitness.nativeSettlementOfEveryChoiceAttested,true);
  assert.equal(report.registeredWonderTagActorWitness.settledRoleCensus.originalSourceSearches,2);
  assert.equal(report.registeredWonderTagActorWitness.settledRoleCensus.originalSourceSupporterTransfers,2);
  assert.equal(report.registeredWonderTagActorWitness.settledRoleCensus.contenderSearches,0);
  assert.equal(report.registeredWonderTagActorWitness.originalSourceEffectCertified,false);
  assert.equal(report.registeredWonderTagActorWitness.nativeShufflePromptCompletionIndependentlyCertified,false);
  assert.equal(report.registeredWonderTagActorWitness.decisions[0].id,ids[6]);
  assert.equal(report.actualZeroSearchShuffleAudit.nonzeroNativeSelections,2);
  assert.equal(report.claimSingleExecutingChangeCertified,false);
  assert.equal(report.competitiveGamesQualified,0);
  assert.equal(report.winRateClaim,null);
  assert.equal(JSON.stringify(report).includes('shared-private-session'),false);
  assert.equal(JSON.stringify(report).includes('private'),false);
});

test('changed post-setup source cards do not corrupt identical prechoice physical facts',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.diagnostic.attemptedRows[0].sourceDealFingerprint='post-choice-affected';
  const result=compareProtectedWonderTagV10(a,b);
  assert.equal(result.comparisonEligibleForPolicyStudy,true);
  assert.equal(result.rows[0].samePostSetupSourceDeal,false);
  assert.equal(result.competitiveGamesQualified,0);
});

test('fail closed on altered hidden opening HMAC even when physical game statuses match',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.diagnostic.actualNativePrechoicePhysicalInputs.events[1]
    .opaquePhysicalPrechoiceInputHmacSha256=
      createHash('sha256').update('altered-hidden-input').digest('hex');
  const result=compareProtectedWonderTagV10(a,b);
  assert.equal(result.matchingGenuineOwnerPrechoiceAndRequestPairs,15);
  assert.equal(result.comparisonEligibleForPolicyStudy,false);
});

test('fail closed on duplicate same-trial physical owner setup record',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.diagnostic.actualNativePrechoicePhysicalInputs.events[1]
    .physicalOwnerSeat=0;
  assert.throws(()=>compareProtectedWonderTagV10(a,b),
    /Duplicate native owner setup input/);
});

test('reject a missing source printed 60, changed engine or misregistered trial',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.manifest.observedTwinleafGitCommit='wrong-engine';
  b.diagnostic.actualNativePrechoicePhysicalInputs
    .exactPhysicalSixtyPrintedCountMatches=15;
  assert.throws(()=>compareProtectedWonderTagV10(a,b));
  b.diagnostic.actualNativePrechoicePhysicalInputs
    .exactPhysicalSixtyPrintedCountMatches=16;
  const result=compareProtectedWonderTagV10(a,b);
  assert.equal(result.comparisonEligibleForPolicyStudy,false);
  b.diagnostic.registered=[...ids].reverse();
  assert.throws(()=>compareProtectedWonderTagV10(a,b));
});

test('reject an extra duplicated original native attempt even if all eight IDs appear',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.diagnostic.attemptedRows[0]=b.diagnostic.attemptedRows[1];
  assert.throws(()=>compareProtectedWonderTagV10(a,b),
    /Duplicate registered native attempt/);
});

test('reject a native HMAC replaced by unproven bare text or an after-choice observer',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.diagnostic.actualNativePrechoicePhysicalInputs.events[0]
    .opaquePreRunRequestHmacSha256='hidden string';
  assert.throws(()=>compareProtectedWonderTagV10(a,b));
  b.diagnostic.actualNativePrechoicePhysicalInputs.events[0]
    .opaquePreRunRequestHmacSha256=
      a.diagnostic.actualNativePrechoicePhysicalInputs.events[0]
        .opaquePreRunRequestHmacSha256;
  b.diagnostic.actualNativePrechoicePhysicalInputs.events[0]
    .firstBeforeAnyOwnerSetupChoice=false;
  assert.throws(()=>compareProtectedWonderTagV10(a,b));
});

test('trial owner witness declines attribution on unregistered native search',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.diagnostic.audit.firstBlockedPromptEnvelope
    .registeredWonderTagActorWitness.decisions[1].id='other-trial';
  const report=compareProtectedWonderTagV10(a,b);
  assert.equal(report.registeredWonderTagActorWitness
    .authenticatedTrialAndActorSeat,false);
  assert.equal(report.registeredWonderTagActorWitness
    .nativeSettlementOfEveryChoiceAttested,false);
});

test('trial owner witness refuses native settlement assertion after missing physical transfer',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.diagnostic.audit.firstBlockedPromptEnvelope
    .sourceIndependentOwnerWonderTag.nativeCustodyFailures=1;
  const report=compareProtectedWonderTagV10(a,b);
  assert.equal(report.registeredWonderTagActorWitness.authenticatedTrialAndActorSeat,true);
  assert.equal(report.registeredWonderTagActorWitness.nativeSettlementOfEveryChoiceAttested,false);
});

test('register genuine contender and original-source searches separately',()=>{
  const a=fixture('control'),b=fixture('treatment');
  const evidence=b.diagnostic.audit.firstBlockedPromptEnvelope;
  evidence.registeredWonderTagActorWitness.decisions[1].actorSeat=1;
  evidence.sourceIndependentOwnerWonderTag.bySeat={0:2,1:2};
  const w=compareProtectedWonderTagV10(a,b).registeredWonderTagActorWitness;
  assert.equal(w.nativeSettlementOfEveryChoiceAttested,true);
  assert.equal(w.settledRoleCensus.originalSourceSearches,1);
  assert.equal(w.settledRoleCensus.contenderSearches,1);
  assert.equal(w.settledRoleCensus.contenderSupporterTransfers,1);
});

test('fail closed when native accepted counts or seat receipts contradict registered decisions',()=>{
  const a=fixture('control'),b=fixture('treatment');
  const e=b.diagnostic.audit.firstBlockedPromptEnvelope;
  e.sourceIndependentOwnerWonderTag.nativeAccepted=3;
  let w=compareProtectedWonderTagV10(a,b).registeredWonderTagActorWitness;
  assert.equal(w.nativeSettlementOfEveryChoiceAttested,false);
  assert.equal(w.settledRoleCensus,null);
  e.sourceIndependentOwnerWonderTag.nativeAccepted=4;
  e.sourceIndependentOwnerWonderTag.bySeat={0:2,1:2};
  w=compareProtectedWonderTagV10(a,b).registeredWonderTagActorWitness;
  assert.equal(w.nativeSettlementOfEveryChoiceAttested,false);
  assert.equal(w.settledRoleCensus,null);
});

test('missing source-local Wonder Tag shuffle custody vetoes settled role census',()=>{
  const a=fixture('control'),b=fixture('treatment');
  b.diagnostic.audit.firstBlockedPromptEnvelope
    .ownerWonderTagMandatoryZeroShuffle.interceptedSupporterSearches=1;
  const w=compareProtectedWonderTagV10(a,b).registeredWonderTagActorWitness;
  assert.equal(w.nativeSettlementOfEveryChoiceAttested,false);
  assert.equal(w.settledRoleCensus,null);
});
