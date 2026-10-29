'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const TELEPATH='Telepath [P] Energy M3';
const SPEED='Speed Lightning Energy RCL';
const card=fullName=>({fullName});
const slot=(pokemon,energy=[])=>({
  getPokemonCard:()=>pokemon?card(pokemon):null,
  getPokemons:()=>pokemon?[card(pokemon)]:[],
  energies:{cards:energy.map(card)},tools:[]
});
const makeState=()=>({
  turn:4,phase:2,
  players:[{
    active:slot('Mewtwo & Mew-GX UNM'),
    bench:[slot('Unown LOT'),slot('Gengar & Mimikyu-GX TEU')],
    hand:{cards:[card(TELEPATH),card(SPEED)]},
    stadium:{cards:[]},discard:{cards:[]},supporter:{cards:[]},
    retreatedTurn:0
  }]
});
const intent=(printing,index=1)=>({
  kind:'attach-special-energy',printing,handIndex:0,
  slot:'bench',index
});
const witness=(chosen,before,after)=>
  rootPhysicalWitness(chosen,before,after,{FINISHED:7});

test('snapshot reads intended Bench Energy for printed Special attachment',()=>{
  const state=makeState();
  const chosen=intent(TELEPATH);
  const before=rootPhysicalSnapshot(state,0,chosen);
  state.players[0].bench[1].energies.cards.push(card(TELEPATH));
  state.players[0].hand.cards.shift();
  const after=rootPhysicalSnapshot(state,0,chosen);
  assert.deepEqual(before.targetEnergies,[]);
  assert.deepEqual(after.targetEnergies,[TELEPATH]);
  assert.deepEqual(after.activeEnergies,[]);
  assert.equal(witness(chosen,before,after),'confirmed-public-effect');
});

test('attaching the same printing to a different Bench target is not confirmed',()=>{
  const state=makeState();
  const chosen=intent(TELEPATH);
  const before=rootPhysicalSnapshot(state,0,chosen);
  state.players[0].bench[0].energies.cards.push(card(TELEPATH));
  state.players[0].hand.cards.shift();
  const after=rootPhysicalSnapshot(state,0,chosen);
  assert.equal(witness(chosen,before,after),'no-confirmed-public-effect');
});

test('unchanged intended Bench is not falsely certified by Active attachment',()=>{
  const state=makeState();
  const chosen=intent(TELEPATH);
  const before=rootPhysicalSnapshot(state,0,chosen);
  state.players[0].active.energies.cards.push(card(TELEPATH));
  const after=rootPhysicalSnapshot(state,0,chosen);
  assert.equal(witness(chosen,before,after),'no-confirmed-public-effect');
});

test('Active Special attachment remains witnessed despite attachment draw',()=>{
  const state=makeState();
  const chosen={kind:'attach-special-energy',printing:SPEED,
    handIndex:1,slot:'active',index:0};
  const before=rootPhysicalSnapshot(state,0,chosen);
  state.players[0].active.energies.cards.push(card(SPEED));
  state.players[0].hand.cards.push(card('Drawn A'),card('Drawn B'));
  const after=rootPhysicalSnapshot(state,0,chosen);
  assert.equal(witness(chosen,before,after),'confirmed-public-effect');
});

test('missing Bench target cannot produce positive witness',()=>{
  const state=makeState();
  const chosen=intent(TELEPATH,4);
  const before=rootPhysicalSnapshot(state,0,chosen);
  state.players[0].active.energies.cards.push(card(TELEPATH));
  const after=rootPhysicalSnapshot(state,0,chosen);
  assert.equal(witness(chosen,before,after),'no-confirmed-public-effect');
});
