'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { auditSourceImpact, VERSION } =
  require('../simulation/evaluation/agent7-stadium-source-impact-receipt.cjs');

const fixture = {
  id:'source-rank6',sourceSeat:0,sourceTurn:10,
  sourceOriginal:'Wondrous Labyrinth Prism Star TEU',
  ownerHeldReplacement:'Thunder Mountain Prism Star LOT',
  heldPhysicalHandIndex:7
};
const root = (ordinal,turn,seat,action,card=null) => ({
  actionOrdinal: ordinal, turnBefore:turn,
  playerSlot:seat, action, pendingPrompt:null,
  ...(card?{card}:{})
});
const control = {
  rootActionLedger:[
    root(0,9,1,'PassTurnAction'),
    root(1,10,0,'PassTurnAction'),
    root(2,11,1,'PlayCardAction','Unown')
  ],
  decisionTrace:[
    {turnBefore:10,playerSlot:0,action:'PassTurnAction',
      prizesAfter:[6,6]},
    {turnBefore:11,playerSlot:1,action:'PlayCardAction',
      prizesAfter:[6,6]}
  ]
};
const treatment = {
  rootActionLedger:[
    root(0,9,1,'PassTurnAction'),
    root(1,10,0,'PlayCardAction','Thunder Mountain Prism Star'),
    root(2,10,0,'AttackAction'),
    root(3,11,1,'PlayCardAction','Rescue Carrier')
  ],
  decisionTrace:[
    {turnBefore:10,playerSlot:0,action:'AttackAction',attack:'Volt Cyclone',
      actionOrdinal:2,prizesAfter:[6,6]},
    {turnBefore:11,playerSlot:1,action:'PlayCardAction',
      prizesAfter:[5,6]}
  ]
};
const audit = {selectedNativeStore:'accepted',dispatches:[{
  globalTurn:10,originalStadium:fixture.sourceOriginal,
  replacement:fixture.ownerHeldReplacement,
  handIndex:7,replacementOnOwnStadium:true,
  originalInOwnLostZone:true,originalInOwnDiscard:false
}]};

test('same-root first divergence, original printed Stadium and reply are joined',()=>{
  assert.equal(typeof VERSION,'string');
  const x=auditSourceImpact(fixture,control,treatment,audit);
  assert.equal(x.firstDifferenceIndex,1);
  assert.equal(x.firstActualSourceDivergence,true);
  assert.equal(x.sourceNativeStore,'accepted');
  assert.equal(x.originalStadiumMovedCorrectly,true);
  assert.deepEqual(x.selectedSourceAttackActionsAfterDivergence.map(x=>x.name),
    ['Volt Cyclone']);
  assert.deepEqual(x.actualOpponentFollowup[0].card,'Rescue Carrier');
  assert.deepEqual(x.selectedFinalPrizeCountsWithinCap,[5,6]);
});

test('native-accepted source action in wrong turn cannot be attributed',()=>{
  const bad=structuredClone(treatment);
  bad.rootActionLedger[1].turnBefore=8;
  assert.equal(auditSourceImpact(fixture,control,bad,audit)
    .firstActualSourceDivergence,false);
});

test('without native dispatch acceptance there is no proven selected root',()=>{
  const b={...audit,selectedNativeStore:'rejected'};
  assert.equal(auditSourceImpact(fixture,control,treatment,b)
    .firstActualSourceDivergence,false);
});

test('single false post-root attack effect cannot retroactively change prefix',()=>{
  const b=structuredClone(treatment);
  b.rootActionLedger[0].action='AttackAction';
  assert.equal(auditSourceImpact(fixture,control,b,audit)
    .firstActualSourceDivergence,false);
});

test('public source auditor does not inspect arbitrary hidden game payloads',()=>{
  const a=structuredClone(control),b=structuredClone(treatment);
  Object.defineProperty(a,'opponentHiddenDeck',{get(){
    throw new Error('Hidden opponent deck accessed');
  }});
  Object.defineProperty(b,'opponentHiddenHand',{get(){
    throw new Error('Hidden opponent hand accessed');
  }});
  assert.equal(auditSourceImpact(fixture,a,b,audit)
    .firstActualSourceDivergence,true);
});
