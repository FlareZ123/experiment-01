'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {
  BOX,VIP,CARRIER,LILLIE,POWERGLASS,NEW_MOON_DCI_POLICY,
  planSecretBoxPayment,chooseSecretBoxPaymentByDci,secretBoxDiscardCost
}=require('../simulation/twinleaf/agent21-secret-box-dci-payment.cjs');

function card(fullName,extra={}){
  return {fullName,...extra};
}
function fixture(){
  const hand=[
    card(VIP),card(BOX),card(CARRIER),card(VIP),card(CARRIER),
    card(LILLIE),card(LILLIE),card(POWERGLASS),
    card('Forest Seal Stone SIT'),card('Mysterious Treasure FLI')
  ];
  const owner={id:'candidate-seat1',hand:{cards:hand},
    discard:{cards:[card('Psychic Energy MEE'),card('Psychic Energy MEE')]},
    active:{energies:{cards:[]}},bench:[],supporterTurn:0};
  const state={turn:14};
  const prompt={sourceCard:{fullName:BOX},message:'CHOOSE_CARD_TO_DISCARD',
    playerId:owner.id,options:{min:3,max:3},
    cards:{cards:hand.filter(x=>x!==hand[1])},
    validate(selection,currentState){
      return currentState===state&&selection.length===3&&
        new Set(selection).size===3&&selection.every(x=>
          this.cards.cards.includes(x)&&owner.hand.cards.includes(x));
    }};
  return {hand,owner,state,prompt};
}

test('root93 owner hand prefers two spent VIPs plus duplicate Lillie over Carrier',()=>{
  const f=fixture();
  assert.equal(f.owner.hand.cards.length,10);
  const plan=planSecretBoxPayment(f.owner,f.state);
  assert.ok(plan);
  assert.deepEqual(plan.cards.map(x=>x.fullName),[VIP,VIP,LILLIE]);
  assert.equal(plan.totalCost,4);
  assert.equal(f.owner.hand.cards.filter(x=>x.fullName===CARRIER).length,2);
  assert.equal(f.owner.hand.cards.filter(x=>x.fullName===LILLIE).length,2);
  const remaining=f.owner.hand.cards.filter(x=>!plan.cards.includes(x));
  assert.equal(remaining.filter(x=>x.fullName===LILLIE).length,1);
  assert.equal(remaining.filter(x=>x.fullName===CARRIER).length,2);
  assert.ok(remaining.some(x=>x.fullName===BOX));
  assert.ok(remaining.some(x=>x.fullName===POWERGLASS));
});

test('native payment prompt returns those same three physical objects',()=>{
  const f=fixture();
  const plan=chooseSecretBoxPaymentByDci(f.prompt,f.owner,f.state);
  assert.ok(plan);
  assert.deepEqual(plan.cards.map(x=>x.fullName),[VIP,VIP,LILLIE]);
  assert.equal(new Set(plan.cards).size,3);
  assert.ok(plan.cards.every(x=>f.prompt.cards.cards.includes(x)));
});

test('duplicate Carrier is preferred when only one Lillie remains',()=>{
  const f=fixture();
  f.owner.hand.cards=f.owner.hand.cards.filter((x,i)=>
    x.fullName!==LILLIE||i===5);
  f.owner.discard.cards=[];
  f.prompt.cards.cards=f.owner.hand.cards.filter(x=>x.fullName!==BOX);
  const plan=planSecretBoxPayment(f.owner,f.state);
  assert.ok(plan);
  assert.deepEqual(plan.cards.map(x=>x.fullName).sort(),[VIP,VIP,CARRIER].sort());
});

test('a live Rescue Carrier target raises its discard cost',()=>{
  const f=fixture();
  f.owner.discard.cards=[card('Unown AOR',{hp:50})];
  const carrier=secretBoxDiscardCost(f.hand.find(x=>x.fullName===CARRIER),
    f.owner,f.state);
  assert.equal(carrier.cost,9);
  assert.ok(carrier.reasons.some(x=>x.includes('eligible for Rescue Carrier')));
});

test('Powerglass and Lillie costs reflect live owner-visible utility',()=>{
  const f=fixture();
  f.owner.discard.cards=[card('Psychic Energy SVE')];
  const powerglass=secretBoxDiscardCost(
    f.hand.find(x=>x.fullName===POWERGLASS),f.owner,f.state);
  assert.equal(powerglass.cost,12);
  assert.ok(powerglass.reasons.some(x=>x.includes('Powerglass can recover')));
  const lillie=secretBoxDiscardCost(
    f.hand.find(x=>x.fullName===LILLIE),f.owner,f.state);
  assert.equal(lillie.cost,4);
  f.owner.supporterTurn=1;
  assert.equal(secretBoxDiscardCost(
    f.hand.find(x=>x.fullName===LILLIE),f.owner,f.state).cost,3);
});

test('VIP Pass is kept through the second global turn and spent after it',()=>{
  const f=fixture();
  f.state.turn=2;
  const vip=f.hand.find(x=>x.fullName===VIP);
  assert.equal(secretBoxDiscardCost(vip,f.owner,f.state).cost,10);
  f.state.turn=3;
  assert.equal(secretBoxDiscardCost(vip,f.owner,f.state).cost,0);
});

test('fails closed for wrong source, owner, prompt stage, or invalid payment',()=>{
  const f=fixture();
  f.prompt.sourceCard={fullName:'Fog Crystal CRE'};
  assert.equal(chooseSecretBoxPaymentByDci(f.prompt,f.owner,f.state),null);
  f.prompt.sourceCard={fullName:BOX};
  f.prompt.playerId='source-seat0';
  assert.equal(chooseSecretBoxPaymentByDci(f.prompt,f.owner,f.state),null);
  f.prompt.playerId=f.owner.id;
  f.prompt.message='CHOOSE_CARD_TO_HAND';
  assert.equal(chooseSecretBoxPaymentByDci(f.prompt,f.owner,f.state),null);
  f.prompt.message='CHOOSE_CARD_TO_DISCARD';
  f.prompt.options.max=4;
  assert.equal(chooseSecretBoxPaymentByDci(f.prompt,f.owner,f.state),null);
  f.prompt.options.max=3;
  f.prompt.validate=()=>false;
  assert.equal(chooseSecretBoxPaymentByDci(f.prompt,f.owner,f.state),null);
});

test('does not inspect hidden deck, Prize cards, or opponent state',()=>{
  const f=fixture();
  Object.defineProperty(f.owner,'deck',{get(){throw Error('own deck read');}});
  Object.defineProperty(f.owner,'prizes',{get(){throw Error('prizes read');}});
  Object.defineProperty(f.state,'players',{get(){throw Error('opponent state read');}});
  const plan=planSecretBoxPayment(f.owner,f.state);
  assert.ok(plan);
  assert.deepEqual(plan.cards.map(x=>x.fullName),[VIP,VIP,LILLIE]);
});
