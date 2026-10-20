'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {paidBusOwnerAttachment}=
  require('../simulation/twinleaf/rank15-bus-native-paid-retreat-policy.cjs');

const slot=name=>({getPokemonCard:()=>name?{fullName:name}:null});
function fixture(){
  const actor={
    energyPlayedTurn:0,retreatedTurn:0,
    active:{getPokemonCard:()=>({fullName:'Bunnelby PRC'}),
      energies:{cards:[{fullName:'Grass Energy MEE'}]}},
    bench:[slot('Budew ASC'),slot('Eldegoss V RCL'),
      slot('Vileplume BUS'),slot('Vileplume AOR'),slot('Budew ASC')],
    hand:{cards:[{fullName:'Buneary M2'}, {fullName:'Grass Energy MEE'}]}
  };
  const state={turn:18,activePlayer:1,phase:2,prompts:[]};
  Object.defineProperties(actor,{
    deck:{get(){throw Error('Hidden own deck illegally read');}},
    prizes:{get(){throw Error('Hidden own Prizes illegally read');}}
  });
  return {actor,state};
}
test('identified native t18 actor-owned Grass hand permits preparation',()=>{
  const {actor,state}=fixture();
  assert.deepEqual(paidBusOwnerAttachment(state,actor,1,2),
    {handIndex:1,busBenchIndex:2});
});
test('cannot attach after energy quota, lost owner turn or prompt',()=>{
  const {actor,state}=fixture();
  actor.energyPlayedTurn=18;
  assert.equal(paidBusOwnerAttachment(state,actor,1,2),null);
  actor.energyPlayedTurn=0;
  state.prompts=[{result:undefined}];
  assert.equal(paidBusOwnerAttachment(state,actor,1,2),null);
  state.prompts=[];
  state.activePlayer=0;
  assert.equal(paidBusOwnerAttachment(state,actor,1,2),null);
  state.activePlayer=1;
  state.phase=3;
  assert.equal(paidBusOwnerAttachment(state,actor,1,2),null);
});
test('paid BUS line requires genuine Bunnelby plus AOR/BUS and matching hand',()=>{
  const {actor,state}=fixture();
  actor.hand.cards[1].fullName='Jet Energy PAL';
  assert.equal(paidBusOwnerAttachment(state,actor,1,2),null);
  actor.hand.cards[1].fullName='Grass Energy MEE';
  actor.bench[3]=slot('Oddish UNB');
  assert.equal(paidBusOwnerAttachment(state,actor,1,2),null);
  actor.bench[3]=slot('Vileplume AOR');
  actor.active.energies.cards=[];
  assert.equal(paidBusOwnerAttachment(state,actor,1,2),null);
  actor.active.energies.cards=[{fullName:'Grass Energy MEE'}];
  state.turn=20;
  assert.equal(paidBusOwnerAttachment(state,actor,1,2),null);
});
