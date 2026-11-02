'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {reconcileQuickBallOwnerTransactions,VERSION} = require(
  '../simulation/evaluation/agent41-quickball-owner-transaction.cjs');

function fixture(paidPrinting='Secret Box TWM') {
  const hand=['Quick Ball FST','Double Colorless Energy SUM',
    'Double Colorless Energy SUM','Secret Box TWM','Muscle Band XY'];
  const roots=[
    {actionOrdinal:32,turnBefore:6,playerSlot:1,
      action:'PlayCardAction',card:'Quick Ball',pendingPrompt:null,
      initiatingRootActionOrdinal:32},
    {actionOrdinal:33,turnBefore:6,playerSlot:1,
      action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt',
      initiatingRootActionOrdinal:32},
    {actionOrdinal:34,turnBefore:6,playerSlot:1,
      action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt',
      initiatingRootActionOrdinal:32}
  ];
  const trace=[
    {actionOrdinal:32,turnBefore:6,playerSlot:1,
      action:'PlayCardAction',
      decisionHandBefore:{perspectiveSeat:1,ownHandPrintings:hand}},
    {actionOrdinal:33,turnBefore:6,playerSlot:1,
      action:'ResolvePromptAction',
      decisionHandBefore:{perspectiveSeat:1,ownHandPrintings:hand.slice(1)},
      cardSelection:{sourceZone:'unclassified',sourcePlayerSlot:-1,
        sourceZoneCardCountBefore:4,nativePromptMin:1,nativePromptMax:1,
        selectedCards:[paidPrinting]}},
    {actionOrdinal:34,turnBefore:6,playerSlot:1,
      action:'ResolvePromptAction',
      decisionHandBefore:{perspectiveSeat:1,ownHandPrintings:[]},
      cardSelection:{sourceZone:'deck',sourcePlayerSlot:1,
        nativePromptMin:0,nativePromptMax:1,
        selectedCards:['Dedenne GX UNB']}}
  ];
  const events=[{rootActionOrdinal:32,playerSlot:1,storeAccepted:true,
    action:'PlayCardAction',
    declared:{ownerHandPrinting:'Quick Ball FST',handIndex:0}}];
  return {decisionTrace:trace,rootActionLedger:roots,
    nativeAcceptedTargetSidecar:{events}};
}

test('accepted native prompt choice of singleton remains distinctly flagged',()=>{
  const actual=reconcileQuickBallOwnerTransactions(fixture());
  assert.equal(actual.version,VERSION);
  assert.equal(actual.competitiveQualified,false);
  assert.equal(actual.rows.length,1);
  assert.deepEqual({
    status:actual.rows[0].status,
    payment:actual.rows[0].paymentSelection,
    search:actual.rows[0].searchedPrintings,
    available:actual.rows[0].duplicateOtherAvailable,
    copiesBefore:actual.rows[0].paymentCopiesBefore
  },{
    status:'SINGLETON_PAYMENT',payment:'Secret Box TWM',
    search:['Dedenne GX UNB'],available:true,copiesBefore:1
  });
  assert.equal(actual.rows[0].publicDiscardPostconditionVerified,false);
});

test('identical root physically choosing repeated DCE satisfies only narrow duplicate claim',()=>{
  const x=reconcileQuickBallOwnerTransactions(fixture('Double Colorless Energy SUM'));
  assert.equal(x.rows[0].status,'PROTECTED_DUPLICATE_PAYMENT');
  assert.equal(x.rows[0].paymentCopiesBefore,2);
  assert.equal(x.rows[0].paymentCopiesAfter,1);
  assert.equal(x.rows[0].nativePaymentChoiceAccepted,true);
});

test('native source count conflict vetoes a claim even with singleton choice',()=>{
  const x=fixture();
  x.decisionTrace[1].cardSelection.sourceZoneCardCountBefore=6;
  assert.equal(reconcileQuickBallOwnerTransactions(x).rows[0].status,
    'PAYMENT_HAND_SIZE_CONFLICT');
});

test('native root hand index requires matching exact printing',()=>{
  const x=fixture();
  x.nativeAcceptedTargetSidecar.events[0].declared.handIndex=3;
  assert.equal(reconcileQuickBallOwnerTransactions(x).rows[0].status,
    'PRINTED_ROOT_HAND_INDEX_CONFLICT');
});

test('missing native root hand provenance cannot imply acceptable payment',()=>{
  const x=fixture();
  delete x.decisionTrace[0].decisionHandBefore;
  const v=reconcileQuickBallOwnerTransactions(x).rows[0];
  assert.equal(v.status,'ROOT_PROVENANCE_UNVERIFIED');
  assert.equal(v.duplicateOtherAvailable,null);
});

test('only actor-owned compulsory prompt in the linked root chain qualifies',()=>{
  const x=fixture();
  x.rootActionLedger[1].playerSlot=0;
  assert.equal(reconcileQuickBallOwnerTransactions(x).rows[0].status,
    'PAYMENT_PROMPT_UNVERIFIED');
});

test('unrelated actions, including another card with the same selected cards, remain excluded',()=>{
  const x=fixture();
  x.rootActionLedger[0].card='Ultra Ball';
  assert.deepEqual(reconcileQuickBallOwnerTransactions(x).rows,[]);
});
