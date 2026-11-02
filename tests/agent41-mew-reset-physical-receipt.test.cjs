'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
const {MEW,GENESECT,DCE}=
  require('../simulation/twinleaf/agent41-mew-techno-reset-frontier.cjs');

function slot(name,id,energies=[]){
  return {
    cards:name?[{fullName:name,id}]:[],
    getPokemonCard(){return this.cards[0]??null;},
    energies:{cards:energies.map((fullName,i)=>({fullName,id:2000+i}))},
    tools:[],specialConditions:[]
  };
}
function state(active,bench,{
  supporterTurn=1,retreatedTurn=0,guzmaHeld=false,
  guzmaSpent=false
}={}){
  const owner={
    id:101,active,bench,
    hand:{cards:guzmaHeld?[{fullName:'Guzma BUS 115',id:3}]:[]},
    deck:{cards:[]},discard:{cards:[]},
    stadium:{cards:[]},supporter:{cards:
      guzmaSpent?[{fullName:'Guzma BUS 115',id:3}]:[]},
    supporterTurn,retreatedTurn,
    stadiumUsedTurn:0,prizes:[]
  };
  const opponent={
    id:202,stadium:{cards:[]},
    hand:{get cards(){throw new Error('Forbidden hidden opponent hand');}}
  };
  return {
    players:[owner,opponent],activePlayer:0,
    turn:21,phase:2
  };
}
const newMew=(energies=[])=>slot(MEW,1002,energies);
const oldMew=(energies=[])=>slot(MEW,1001,energies);
const donor=()=>slot(GENESECT,1050);
const retreat={kind:'free-retreat',benchIndex:1,printing:MEW};
const gamePhase={FINISHED:7};

test('identical printed Mew copies preserve distinct physical identity in a real witness',()=>{
  const before=rootPhysicalSnapshot(state(newMew(),
    [donor(),oldMew([DCE])],{retreatedTurn:0}),0,retreat);
  const after=rootPhysicalSnapshot(state(oldMew([DCE]),
    [donor(),newMew()],{retreatedTurn:21}),0,retreat);
  assert.equal(before.activePokemonPrinting,MEW);
  assert.equal(before.targetPokemonPrinting,MEW);
  assert.equal(before.activePokemonPhysicalId,1002);
  assert.equal(before.targetPokemonPhysicalId,1001);
  assert.deepEqual(before.targetEnergies,[DCE]);
  assert.deepEqual(after.activeEnergies,[DCE]);
  assert.equal(rootPhysicalWitness(retreat,before,after,gamePhase),
    'confirmed-public-effect');
});

test('same printing and Retreat turn without real ID swap cannot certify motion',()=>{
  const before=rootPhysicalSnapshot(state(newMew(),
    [donor(),oldMew([DCE])],{retreatedTurn:0}),0,retreat);
  const after=rootPhysicalSnapshot(state(newMew([DCE]),
    [donor(),oldMew()],{retreatedTurn:21}),0,retreat);
  assert.equal(rootPhysicalWitness(retreat,before,after,gamePhase),
    'no-confirmed-public-effect');
});

test('correct physical swap but vanished DCE or absent Retreat turn fails closed',()=>{
  const before=rootPhysicalSnapshot(state(newMew(),
    [donor(),oldMew([DCE])],{retreatedTurn:0}),0,retreat);
  for(const [energy,turn] of [[[],21],[[DCE],0]]){
    const after=rootPhysicalSnapshot(state(oldMew(energy),
      [donor(),newMew()],{retreatedTurn:turn}),0,retreat);
    assert.equal(rootPhysicalWitness(retreat,before,after,gamePhase),
      'no-confirmed-public-effect');
  }
});

test('Guzma public Supporter spend is a root witness before prompts settle',()=>{
  const intent={kind:'play-guzma-mew-cooldown-reset',
    printing:'Guzma BUS 115',handIndex:0};
  const before=rootPhysicalSnapshot(state(oldMew([DCE]),
    [donor(),newMew()],{
      supporterTurn:0,guzmaHeld:true,guzmaSpent:false
    }),0,intent);
  const after=rootPhysicalSnapshot(state(oldMew([DCE]),
    [donor(),newMew()],{
      supporterTurn:1,guzmaHeld:false,guzmaSpent:true
    }),0,intent);
  assert.equal(rootPhysicalWitness(intent,before,after,gamePhase),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,before,gamePhase),
    'no-confirmed-public-effect');
});
