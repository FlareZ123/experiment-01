'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION:SOURCE_VERSION}=
  require('../simulation/evaluation/agent9-rank6-palace-book-native-aba.cjs');
const {
  VERSION,extractDeferredHandoff
}=require('../simulation/evaluation/agent26-original-palace-postwait-handoff.cjs');

/** @param {object[]} after Voluntary native actions following the Book */
function fixture(after){
  const book={actionOrdinal:40,playerSlot:0,turnBefore:4,
    action:'PlayCardAction',card:'Palace Book'};
  return {
    version:SOURCE_VERSION,actualOriginalAttempts:24,
    physicalDealsAndUnchangedV9ControlMatched:true,
    repeatedV10AcceptedRootTapesIdentical:true,
    sevenNonTargetTreatmentTapesUnchanged:true,
    originalRootBeforeItemSame:true,
    treatmentItemRoot:book,
    originalPassTurnRoot:{...book,action:'PassTurnAction',card:null},
    targetPostDivergenceTreatment:[book,...after],
    selectedBookAudit:{
      physicalBookSettlement:{deckBefore:41,deckAfter:38,
        handBefore:5,handAfter:7},
      sourceTurn6NativeDecisions:[]
    },
    targetStatuses:{control:'returned-unqualified',
      treatment:'returned-unqualified',repeat:'returned-unqualified'}
  };
}

test('actual same-root native next opponent turn supports deferred item handoff',()=>{
  const root=[
    {actionOrdinal:41,playerSlot:1,turnBefore:5,
      action:'PlayCardAction',card:'Psychic Energy'},
    {actionOrdinal:42,playerSlot:0,turnBefore:6,
      action:'PlayCardAction',card:'Spiky Energy'}
  ];
  const result=extractDeferredHandoff(fixture(root));
  assert.equal(result.version,VERSION);
  assert.equal(result.nativeRootSupportsItemEndedSourceTurn,true);
  assert.deepEqual(result.sourceOwnerVoluntaryRootsAfterBookOnTurn4,[]);
  assert.deepEqual(result.nextVoluntaryRoot,root[0]);
  assert.deepEqual(result.firstSourceTurn6Root,root[1]);
  assert.equal(result.competitiveQualifiedGames,0);
});

test('an extra source same-turn Pass after Item refutes direct handoff',()=>{
  const after=[
    {actionOrdinal:41,playerSlot:0,turnBefore:4,action:'PassTurnAction'},
    {actionOrdinal:42,playerSlot:1,turnBefore:5,
      action:'PlayCardAction',card:'Psychic Energy'}
  ];
  const got=extractDeferredHandoff(fixture(after));
  assert.equal(got.nativeRootSupportsItemEndedSourceTurn,false);
  assert.equal(got.sourceOwnerVoluntaryRootsAfterBookOnTurn4.length,1);
  assert.equal(got.firstOpponentTurn5Root.action,'PlayCardAction');
});

test('no evidence of next root cannot pass deferred handoff positive screen',()=>{
  const after=[
    {actionOrdinal:41,playerSlot:0,turnBefore:4,
      action:'PlayCardAction',card:'Spiky Energy'}
  ];
  const got=extractDeferredHandoff(fixture(after));
  assert.equal(got.nativeRootSupportsItemEndedSourceTurn,false);
  assert.equal(got.firstOpponentTurn5Root,null);
});

test('invalid original control parity cannot be labeled a handoff',()=>{
  const data=fixture([{actionOrdinal:41,playerSlot:1,
    turnBefore:5,action:'PassTurnAction'}]);
  data.sevenNonTargetTreatmentTapesUnchanged=false;
  assert.throws(()=>extractDeferredHandoff(data));
});
