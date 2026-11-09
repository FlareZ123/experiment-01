'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {
  visibleRecoveryValues, bestRecoveryCapacityPayment,
  planSecretBoxRecoveryCapacityPayment,
  chooseSecretBoxRecoveryCapacityPayment
}=require('../../simulation/twinleaf/agent16-secret-box-recovery-capacity.cjs');

const BOX='Secret Box TWM';
const CARRIER='Rescue Carrier EVS';
const LILLIE="Lillie's Determination M1L";
const VIP='Battle VIP Pass FST';
const physical = (fullName,id) => ({fullName,id});
const policy=(premium=5)=>({maxTotalCost:100,defaultCost:0,
  recoveryTargetPremium:premium,duplicateDiscount:0,costs:{}});
function fixture(targetCount=1){
  const cards=[physical(BOX,0),physical(CARRIER,1),physical('A',2),
    physical(CARRIER,3),physical('B',4)];
  return {owner:{id:411,supporterTurn:0,hand:{cards},
    discard:{cards:Array.from({length:targetCount},(_,i)=>
      ({fullName:'Unown '+i,hp:60}))}},state:{turn:14},cards};
}
test('second Carrier costs no current recovery capacity with one target',()=>{
  const {owner,state,cards}=fixture(1);
  const outcome=bestRecoveryCapacityPayment([cards[1],cards[2],cards[4]],
    owner,state,policy());
  assert.equal(outcome.recoveryValueLost,0);
  assert.equal(outcome.carrierCopiesBefore,2);
  assert.equal(outcome.carrierCopiesAfter,1);
});
test('marginal recovery loss is one at three targets and two at four',()=>{
  for(const [n,expected] of [[3,1],[4,2]]){
    const {owner,state,cards}=fixture(n);
    const outcome=bestRecoveryCapacityPayment([cards[1],cards[2],cards[4]],
      owner,state,policy());
    assert.equal(outcome.recoveryValueLost,expected);
    assert.equal(outcome.recoveryCapacityCost,expected*5);
  }
});
test('weighted rare targets preserve highest-valued recovery opportunity',()=>{
  const {owner,state,cards}=fixture(3);
  owner.discard.cards=[{fullName:'rare',hp:70},
    {fullName:'ordinary',hp:70},{fullName:'ordinary',hp:70}];
  const outcome=bestRecoveryCapacityPayment([cards[1],cards[2],cards[4]],
    owner,state,policy(2),{targetValuesByPrinting:{rare:10,ordinary:1}});
  assert.equal(outcome.recoveryValueBefore,12);
  assert.equal(outcome.recoveryValueAfter,11);
  assert.equal(outcome.recoveryValueLost,1);
  assert.deepEqual(visibleRecoveryValues(owner.discard.cards,
    {rare:10,ordinary:1}),[10,1,1]);
});
test('strict coverage gate abstains when all legal triples lose capacity',()=>{
  const {owner,state,cards}=fixture(3);
  const offered=[cards[1],cards[2],cards[3],cards[4]];
  const result=bestRecoveryCapacityPayment(offered,owner,state,policy());
  assert.deepEqual(result.cards,[cards[1],cards[2],cards[4]]);
  assert.equal(result.recoveryValueLost,1);
  assert.equal(bestRecoveryCapacityPayment(offered,owner,state,policy(),
    {preserveRecoveryValue:true}),null);
});
test('post-play prompt chooses physical cards and rejects invalid prompts',()=>{
  const {owner,state,cards}=fixture(1);
  const prompt={sourceCard:{fullName:BOX},message:'CHOOSE_CARD_TO_DISCARD',
    playerId:owner.id,options:{min:3,max:3},
    cards:{cards:cards.slice(1)},validate:selected=>selected.length===3};
  const found=chooseSecretBoxRecoveryCapacityPayment(prompt,owner,state,policy());
  assert.ok(found);
  assert.equal(new Set(found.cards).size,3);
  assert.equal(found.recoveryValueLost,0);
  assert.equal(chooseSecretBoxRecoveryCapacityPayment(
    {...prompt,message:'CHOOSE_CARD_TO_HAND'},owner,state,policy()),null);
  assert.equal(planSecretBoxRecoveryCapacityPayment(owner,state,policy())?.cards.length,3);
  assert.equal(chooseSecretBoxRecoveryCapacityPayment(
    {...prompt,validate:()=>false},owner,state,policy()),null);
});
test('empty recovery discard and payment shortfall',()=>{
  const {owner,state,cards}=fixture(0);
  assert.equal(bestRecoveryCapacityPayment(cards.slice(1,4),owner,state,
    policy()).recoveryCapacityCost,0);
  assert.equal(bestRecoveryCapacityPayment(cards.slice(1,3),owner,state,
    policy()),null);
  owner.hand.cards=[cards[1],cards[2]];
  assert.equal(planSecretBoxRecoveryCapacityPayment(owner,state,policy()),null);
});
test('one fixed hand selects Carrier with one recovery target, Lillie with four',()=>{
  const {owner,state}=fixture(1);
  const vipA=physical(VIP,20),vipB=physical(VIP,21);
  const lillie=physical(LILLIE,22);
  owner.hand.cards=[physical(BOX,0),vipA,vipB,
    physical(CARRIER,23),physical(CARRIER,24),lillie];
  const offered=owner.hand.cards.slice(1);
  const p={maxTotalCost:100,defaultCost:20,
    spentVipCost:0,duplicateDiscount:0,
    recoveryTargetPremium:3,costs:{[VIP]:0,[CARRIER]:3,[LILLIE]:5}};
  const before=bestRecoveryCapacityPayment(offered,owner,state,p);
  assert.deepEqual(before.cards.map(c=>c.fullName),[VIP,VIP,CARRIER]);
  assert.equal(before.recoveryValueLost,0);
  owner.discard.cards=Array.from({length:4},(_,i)=>
    ({fullName:'Unown '+i,hp:60}));
  const after=bestRecoveryCapacityPayment(offered,owner,state,p);
  assert.deepEqual(after.cards.map(c=>c.fullName),[VIP,VIP,LILLIE]);
  assert.equal(after.recoveryValueLost,0);
  assert.equal(after.carrierCopiesAfter,2);
});

test('one held Carrier changes paid triple when one versus two targets need recovery',()=>{
  const {owner,state}=fixture(1);
  const vipA=physical(VIP,30),vipB=physical(VIP,31);
  const carrier=physical(CARRIER,32),lillie=physical(LILLIE,33);
  owner.hand.cards=[physical(BOX,0),vipA,vipB,carrier,lillie];
  const p={maxTotalCost:100,defaultCost:20,
    spentVipCost:0,duplicateDiscount:0,recoveryTargetPremium:3,
    costs:{[VIP]:0,[CARRIER]:3,[LILLIE]:7}};
  const one=planSecretBoxRecoveryCapacityPayment(owner,state,p);
  assert.deepEqual(one.cards.map(c=>c.fullName),[VIP,VIP,CARRIER]);
  assert.equal(one.recoveryValueLost,1);
  assert.equal(one.carrierCopiesAfter,0);
  owner.discard.cards=[{fullName:'Unown AOR',hp:60},
    {fullName:'Unown AOR',hp:60}];
  const two=planSecretBoxRecoveryCapacityPayment(owner,state,p);
  assert.deepEqual(two.cards.map(c=>c.fullName),[VIP,VIP,LILLIE]);
  assert.equal(two.recoveryValueLost,0);
  assert.equal(two.carrierCopiesAfter,1);
});
