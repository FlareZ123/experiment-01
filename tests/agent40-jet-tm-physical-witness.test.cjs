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

test('two Basic Energy paid retreat to active BUS has correct public receipt',()=>{
  const intent={kind:'paid-retreat',printing:'Vileplume BUS',
    benchIndex:0,retreatCostUnits:2};
  const before=state(slot('Bunnelby PRC',[],
    ['Grass Energy MEE','Grass Energy MEE']),
    slot('Vileplume BUS'),0);
  before.players[0].retreatedTurn=0;
  const after=state(slot('Vileplume BUS'),
    slot('Bunnelby PRC'),0);
  after.players[0].retreatedTurn=2;
  const old=rootPhysicalSnapshot(before,0,intent);
  const now=rootPhysicalSnapshot(after,0,intent);
  assert.equal(rootPhysicalWitness(intent,old,now,phase),
    'confirmed-public-effect');
  const missing=state(slot('Vileplume BUS'),
    slot('Bunnelby PRC',[],['Grass Energy MEE']),0);
  missing.players[0].retreatedTurn=2;
  assert.equal(rootPhysicalWitness(intent,old,
    rootPhysicalSnapshot(missing,0,intent),phase),
    'no-confirmed-public-effect',
    'Retreat must discard both Basic attachments before success');
  const wrongCost={...intent,retreatCostUnits:1};
  assert.equal(rootPhysicalWitness(wrongCost,old,now,phase),
    'no-confirmed-public-effect');
});
