'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {observedRootDigest,decisionOpportunityReceipt}=
  require('../simulation/evaluation/agent48-decision-opportunity-receipt.cjs');
const owner=(hand=['Psychic Energy SVE'])=>({
  actorSeat:0,globalTurn:2,decisionKind:'owner-root',
  ownHand:hand,ownPublic:{active:{name:'Pikachu'},bench:[null]},
  opponentPublic:{active:{name:'Eevee'},bench:[]},
  ownTurnResources:{supporterPlayedTurn:0},
  publicEventReceipt:null
});
const row=(trialId,rootOrdinal,view=owner(),offers=[])=>({
  trialId,sourceDealFingerprint:'deal-'+trialId[0],seat:0,
  rootOrdinal,view,offers
});
const positive={kind:'play-carmine-first',printing:'Carmine TWM',
  ownerHeld:true,structurallyOffered:true,nativeCanPlay:true,
  chosen:true,storeAccepted:true,effectSettled:true,
  changedFromBaseline:true,opponentReplied:true};

test('identical owner-hand multisets cluster; distinct public history does not',()=>{
  assert.equal(observedRootDigest(owner(['A','B','A'])),
    observedRootDigest(owner(['B','A','A'])));
  assert.notEqual(observedRootDigest(owner(['A','B'])),
    observedRootDigest(owner(['A','B','A'])));
  const v=owner(['A','B','A']);v.publicEventReceipt={priorKO:true};
  assert.notEqual(observedRootDigest(v),observedRootDigest(owner(['A','B','A'])));
  const alt=owner(['A','B','A']);alt.actorSeat=1;
  assert.equal(observedRootDigest(alt),observedRootDigest(owner(['A','B','A'])));
});

test('physical attempts, matched source deals and repeated configurations remain distinct',()=>{
  const a=row('a1',1),b=row('a2',1),c=row('b1',1);
  b.sourceDealFingerprint='deal-a';
  a.pairedComparisonId=b.pairedComparisonId='pair-a';
  const s=decisionOpportunityReceipt([a,b,c]);
  assert.equal(s.physicalTrials,3);
  assert.equal(s.independentSourceDeals,2);
  assert.equal(s.pairedComparisons,1);
  assert.equal(s.unpairedComparisonRegistrations,0);
  assert.equal(s.ownerRoots,3);
  assert.equal(s.uniqueObservedConfigurations,1);
  assert.equal(s.qualification.competitiveQualifiedGames,0);
});

test('earliest native-positive actual witness survives zero sample budget',()=>{
  const s=decisionOpportunityReceipt([
    row('a1',1),row('a1',2,owner(['Carmine TWM']),[positive]),
    row('a1',3,owner(['Carmine TWM']),[positive])
  ],{sampleLimit:0});
  const arm=s.arms[0];
  assert.equal(s.nativePlayableWindows,2);
  assert.equal(s.acceptedChangedChoices,2);
  assert.equal(s.opponentReplyWindows,2);
  assert.equal(arm.earliestNativePositiveWitness.rootOrdinal,2);
  assert.equal(arm.sourceExamples.length,0);
  assert.equal(arm.nativePositiveExamples.length,0);
  assert.equal(arm.sourceExamplesMayBeTruncated,true);
  assert.equal(arm.positiveExamplesMayBeTruncated,true);
  assert.equal(arm.positiveWitnessCoverage,'EARLIEST_NATIVE_POSITIVE_PRESERVED');
  assert.equal(arm.uniqueObservedConfigurations,2);
  assert.equal(arm.repeatedObservedConfigurations,1);
});

test('input order never changes earliest actual native-positive root',()=>{
  const s=decisionOpportunityReceipt([
    row('a1',7,owner(),[positive]),row('a1',2,owner(),[positive]),
    row('a1',5)
  ],{sampleLimit:1});
  assert.equal(s.arms[0].earliestNativePositiveWitness.rootOrdinal,2);
  assert.equal(s.arms[0].sourceExamples[0].rootOrdinal,2);
});

test('per-arm positive counts cannot be hidden by another arm sample cap',()=>{
  const s=decisionOpportunityReceipt([
    row('a1',1,owner(),[positive]),row('a1',2),
    row('b1',1),row('b1',2,owner(),[positive])
  ],{sampleLimit:1});
  assert.equal(s.arms[0].earliestNativePositiveWitness.rootOrdinal,1);
  assert.equal(s.arms[1].earliestNativePositiveWitness.rootOrdinal,2);
  assert.equal(s.arms[1].sourceExamples[0].nativePlayable,false);
  assert.equal(s.arms[1].positiveExamplesMayBeTruncated,false);
});

test('registered one-arm pairs remain unpaired, inconsistent pair source fails',()=>{
  const one=row('a1',1);one.pairedComparisonId='orphan';
  const s=decisionOpportunityReceipt([one]);
  assert.equal(s.pairedComparisons,0);
  assert.equal(s.unpairedComparisonRegistrations,1);
  const two=row('b1',1);two.pairedComparisonId='orphan';
  assert.throws(()=>decisionOpportunityReceipt([one,two]),/cannot span different/);
});

test('invalid ledger causality and duplicate roots fail closed',()=>{
  assert.throws(()=>decisionOpportunityReceipt([row('a1',1),row('a1',1)]),
    /Repeated physical decision root/);
  assert.throws(()=>decisionOpportunityReceipt([
    row('a1',1,owner(),[{kind:'attack',nativeCanPlay:true}])
  ]),/Native canPlay positive/);
  assert.throws(()=>decisionOpportunityReceipt([
    row('a1',1,owner(),[{kind:'attack',effectSettled:true}])
  ]),/Settled effect/);
  assert.throws(()=>decisionOpportunityReceipt([
    row('a1',1,owner(),[{kind:'attack',storeAccepted:true}])
  ]),/Accepted choice/);
});
