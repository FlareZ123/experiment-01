'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {busRetreatBenchIndex}=
  require('../simulation/twinleaf/rank15-bus-native-retreat-policy.cjs');

const slot=name=>({getPokemonCard:()=>name?{fullName:name}:null});
function fixture(){
  const actor={retreatedTurn:0,active:slot('Bunnelby PRC'),
    bench:[slot('Budew ASC'),slot('Eldegoss V RCL'),
      slot('Vileplume BUS'),slot('Vileplume AOR'),slot('Budew ASC')]};
  const state={turn:18,activePlayer:1,phase:2,prompts:[]};
  Object.defineProperties(actor,{deck:{get(){throw Error('Hidden deck read');}},
    prizes:{get(){throw Error('Hidden Prize read');}},
    hand:{get(){throw Error('Unneeded owner hand read');}}});
  return {actor,state};
}
test('real subsequent own turn selects BUS from visible Bench',()=>{
  const {actor,state}=fixture();
  assert.equal(busRetreatBenchIndex(state,actor,1,2),2);
});
test('rejects premature, non-owner and non-main-phase action',()=>{
  const {actor,state}=fixture();
  state.turn=16;
  assert.equal(busRetreatBenchIndex(state,actor,1,2),-1);
  state.turn=18;state.activePlayer=0;
  assert.equal(busRetreatBenchIndex(state,actor,1,2),-1);
  state.activePlayer=1;state.phase=3;
  assert.equal(busRetreatBenchIndex(state,actor,1,2),-1);
  state.phase=2;actor.bench[3]=slot('Gloom UNB');
  assert.equal(busRetreatBenchIndex(state,actor,1,2),-1);
});
test('rejects unresolved prompts, spent retreat or wrong Active',()=>{
  const {actor,state}=fixture();
  state.prompts=[{result:undefined}];
  assert.equal(busRetreatBenchIndex(state,actor,1,2),-1);
  state.prompts=[];actor.retreatedTurn=18;
  assert.equal(busRetreatBenchIndex(state,actor,1,2),-1);
  actor.retreatedTurn=0;actor.active=slot('Vileplume BUS');
  assert.equal(busRetreatBenchIndex(state,actor,1,2),-1);
});
