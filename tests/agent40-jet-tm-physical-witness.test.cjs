'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const TM='Technical Machine: Evolution PAR';
const JET='Jet Energy PAL';
const slot=(name,tools=[],energies=[])=>({
  getPokemonCard(){return {fullName:name};},
  getPokemons(){return [{fullName:name}];},
  tools:tools.map(fullName=>({fullName})),
  energies:{cards:energies.map(fullName=>({fullName}))}
});
const state=(active,bench,hand)=>({
  turn:2,phase:3,players:[{
    active,bench:[bench],
    hand:{cards:Array.from({length:hand},()=>({fullName:'x'}))},
    stadium:{cards:[]}
  }]
});
const phase={PLAYER_TURN:3,FINISHED:9};
test('actual Tool equip is visible on its original Bench recipient',()=>{
  const intent={kind:'equip-bunnelby-tm',printing:TM,
    slot:'bench',index:0,handIndex:0};
  const a=rootPhysicalSnapshot(state(
    slot('Dratini OBF'),slot('Bunnelby PRC'),2),0,intent);
  const b=rootPhysicalSnapshot(state(
    slot('Dratini OBF'),slot('Bunnelby PRC',[TM]),1),0,intent);
  assert.equal(rootPhysicalWitness(intent,a,b,phase),'confirmed-public-effect');
  const absent=rootPhysicalSnapshot(state(
    slot('Dratini OBF'),slot('Bunnelby PRC'),1),0,intent);
  assert.equal(rootPhysicalWitness(intent,a,absent,phase),
    'no-confirmed-public-effect');
});
test('Jet mandatory swap confirms Energy on post-switch Active',()=>{
  const intent={kind:'attach-special-energy',printing:JET,
    slot:'bench',index:0,handIndex:0};
  const a=rootPhysicalSnapshot(state(
    slot('Dratini OBF'),slot('Bunnelby PRC'),1),0,intent);
  const b=rootPhysicalSnapshot(state(
    slot('Bunnelby PRC',[],[JET]),slot('Dratini OBF'),0),0,intent);
  assert.equal(rootPhysicalWitness(intent,a,b,phase),'confirmed-public-effect',
    'Tool switch must be validated by new Active and target Energy');
  const noSwitch=rootPhysicalSnapshot(state(
    slot('Dratini OBF'),slot('Bunnelby PRC',[],[JET]),0),0,intent);
  assert.equal(rootPhysicalWitness(intent,a,noSwitch,phase),
    'no-confirmed-public-effect');
});
test('other Bench Special Energy continues to require same-slot attachment',()=>{
  const printing='Double Dragon Energy ROS';
  const intent={kind:'attach-special-energy',printing,
    slot:'bench',index:0,handIndex:0};
  const a=rootPhysicalSnapshot(state(slot('Dratini OBF'),
    slot('Regidrago V SIT'),1),0,intent);
  const b=rootPhysicalSnapshot(state(slot('Dratini OBF'),
    slot('Regidrago V SIT',[],[printing]),0),0,intent);
  assert.equal(rootPhysicalWitness(intent,a,b,phase),'confirmed-public-effect');
});
