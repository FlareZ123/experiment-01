'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VIP,MEWTWO,GENGAR,SQUAWKABILLY,
  ownFirstVipOpportunity,chooseOwnedVipTargets
}=require('../simulation/twinleaf/newmoon-first-own-vip.cjs');

function slot(name=null){
  return {getPokemonCard:()=>name?{fullName:name}:null};
}
function own(active=null,benchSize=3){
  return {
    active:slot(active),
    bench:Array.from({length:benchSize},()=>slot()),
    hand:{cards:[{fullName:VIP}]},
    discard:{cards:[]}
  };
}
function state(turn=1,seat=0){
  return {turn,activePlayer:seat,phase:7,prompts:[]};
}
function prompt(cards,valid=()=>true){
  return {cards:{cards:cards.map(name=>({fullName:name}))},
    validate:valid};
}

test('owner-first-turn gate respects actual source first/second and own hand',()=>{
  for(const [turn,seat] of [[1,0],[2,1]]){
    assert.equal(ownFirstVipOpportunity(state(turn,seat),own(),seat,7),true);
  }
  assert.equal(ownFirstVipOpportunity(state(2,1),own(),0,7),false);
  assert.equal(ownFirstVipOpportunity(state(3,0),own(),0,7),false);
  assert.equal(ownFirstVipOpportunity(state(1,0),own(),0,8),false);
  const locked=state(1,0);
  locked.prompts=[{result:undefined}];
  assert.equal(ownFirstVipOpportunity(locked,own(),0,7),false);
  const noVip=own();
  noVip.hand.cards=[];
  assert.equal(ownFirstVipOpportunity(state(),noVip,0,7),false);
  const full=own();
  full.bench=Array.from({length:5},()=>slot(MEWTWO));
  assert.equal(ownFirstVipOpportunity(state(),full,0,7),false);
});

test('owner search takes two real printed targets and limits to Bench capacity',()=>{
  const o=own();
  const p=prompt([MEWTWO,GENGAR,SQUAWKABILLY]);
  assert.deepEqual(chooseOwnedVipTargets(o,p,state()).map(c=>c.fullName),
    [GENGAR,MEWTWO]);
  o.bench=[slot(),slot(MEWTWO),slot(GENGAR),slot(MEWTWO),slot(MEWTWO)];
  assert.deepEqual(chooseOwnedVipTargets(o,p,state()).map(c=>c.fullName),
    [SQUAWKABILLY]);
});

test('existing active or discard payload changes K0-neutral prompt priorities',()=>{
  const o=own(MEWTWO);
  const p=prompt([MEWTWO,GENGAR,SQUAWKABILLY]);
  assert.deepEqual(chooseOwnedVipTargets(o,p,state()).map(c=>c.fullName),
    [GENGAR,SQUAWKABILLY]);
  o.discard.cards=[{fullName:GENGAR}];
  assert.deepEqual(chooseOwnedVipTargets(o,p,state()).map(c=>c.fullName),
    [SQUAWKABILLY,MEWTWO]);
});

test('actual prompt validation controls selection and never invents absent cards',()=>{
  const o=own();
  const p=prompt([GENGAR,MEWTWO],cards=>cards.length===1);
  assert.deepEqual(chooseOwnedVipTargets(o,p,state()).map(c=>c.fullName),
    [GENGAR]);
  const none=prompt([GENGAR],()=>false);
  assert.deepEqual(chooseOwnedVipTargets(o,none,state()),[]);
  assert.deepEqual(chooseOwnedVipTargets(o,prompt([],()=>true),state()),[]);
  o.bench=[];
  assert.deepEqual(chooseOwnedVipTargets(o,prompt([GENGAR]),state()),[]);
});
