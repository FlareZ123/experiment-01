'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifySourceEvent,buildEvidence}=
  require('../simulation/evaluation/agent20-ghala-natural-custody-replay.cjs');

const rows=[
  {trial:{id:'6:0:A:champion-reference',rank:6,candidateSlot:'A'},
    status:'completed',sourceDealFingerprint:'source-a'},
  {trial:{id:'6:1:B:new-moon-lockbreaker-v1',rank:6,candidateSlot:'B'},
    status:'action-cap',sourceDealFingerprint:'source-b'}
];
const receipt=(overrides={})=>({
  gameOrdinal:0,ownerSeat:1,requestedCount:2,distinctSelected:2,
  validPhysicalSelectionBefore:true,nativeDispatchCompleted:true,
  actualSelectedCardMovementToDiscard:true,paperTwoCardZoneWitness:true,
  selectedPrintings:['Crushing Hammer POR','Team Flare Grunt XY'],
  ...overrides
});
const frozen={
  releaseProfile:'agent20-frozen-bilateral-rank6-canary-v1',
  rawNativeResult:{rows}
};

test('source A-owned real two-card movement is an attributed narrow witness',()=>{
  const got=classifySourceEvent(receipt(),rows);
  assert.equal(got.linkageStatus,'SOURCE_OWNER_MATCH');
  assert.equal(got.linkedTrialId,'6:0:A:champion-reference');
  assert.equal(got.sourcePhysicalSeat,1);
  assert.equal(got.paperSourcePaymentZoneWitness,true);
  assert.equal(got.competitiveGameQualified,false);
});

test('source B is identified through the opposite candidate seat',()=>{
  const got=classifySourceEvent(receipt({gameOrdinal:1,ownerSeat:0}),rows);
  assert.equal(got.linkageStatus,'SOURCE_OWNER_MATCH');
  assert.equal(got.sourcePhysicalSeat,0);
  assert.equal(got.sourceDealFingerprint,'source-b');
  assert.equal(got.paperSourcePaymentZoneWitness,true);
});

test('identical payment on the candidate actor cannot certify source',()=>{
  const got=classifySourceEvent(receipt({ownerSeat:0}),rows);
  assert.equal(got.linkageStatus,'OTHER_ACTOR');
  assert.equal(got.paperSourcePaymentZoneWitness,false);
});

test('native accepted one-card payment cannot certify a two-card printed cost',()=>{
  const got=classifySourceEvent(receipt({
    requestedCount:1,distinctSelected:1,
    actualSelectedCardMovementToDiscard:true,paperTwoCardZoneWitness:false
  }),rows);
  assert.equal(got.linkageStatus,'SOURCE_OWNER_MATCH');
  assert.equal(got.paperSourcePaymentZoneWitness,false);
});

test('invalid game ordinal never silently maps to a different trial',()=>{
  for (const gameOrdinal of [-1,2,null,1.5]) {
    const got=classifySourceEvent(receipt({gameOrdinal}),rows);
    assert.equal(got.linkageStatus,'GAME_UNMATCHED');
    assert.equal(got.paperSourcePaymentZoneWitness,false);
  }
});

test('postgame report retains invalid and successful prompts separately',()=>{
  const got=buildEvidence(frozen,{
    schema:'agent7-ghala-native-owner-zone-lineage-v1',
    observedPaymentPrompts:3,
    events:[
      receipt(),receipt({requestedCount:1,distinctSelected:1,
        paperTwoCardZoneWitness:false}),
      receipt({gameOrdinal:1,ownerSeat:1})
    ]
  });
  assert.equal(got.sourcePaymentPrompts,2);
  assert.equal(got.witnessedNaturalSourceTwoCardZoneMovements,1);
  assert.equal(got.rejectedOrUnverifiedSourcePaymentPrompts,1);
  assert.equal(got.otherActorPaymentPrompts,1);
  assert.equal(got.allObservedSourcePaymentsPaperTwoCardZoneValid,false);
  assert.equal(got.sourceTrials.length,2);
  assert.equal(got.limits.competitivelyQualifiedGames,0);
});

test('absence of observed source prompts is explicit no-opportunity',()=>{
  const got=buildEvidence(frozen,{observedPaymentPrompts:0,events:[]});
  assert.equal(got.anyNaturalSourcePaymentCustodyWitness,false);
  assert.equal(got.allObservedSourcePaymentsPaperTwoCardZoneValid,false);
  assert.ok(got.sourceTrials.every(r=>r.noSourcePaymentPromptObserved));
  assert.ok(got.sourceTrials.every(r=>r.competitiveGameQualified===false));
});

test('wrong frozen profile is rejected rather than being silently joined',()=>{
  assert.throws(()=>buildEvidence({...frozen,releaseProfile:'changed'},
    {events:[]}),/agent20-frozen-bilateral-rank6-canary-v1/);
});
