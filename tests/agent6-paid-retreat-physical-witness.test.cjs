'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const printing=name=>name?{fullName:name}:null;
function slot(name,energies=[]){
  return {getPokemonCard:()=>printing(name),
    energies:{cards:energies.map(printing)}};
}
function state(active,bench,retreatedTurn){
  const owner={
    active,bench,retreatedTurn,
    hand:{cards:[]},stadium:{cards:[]},discard:{cards:[]},
    supporter:{cards:[]}
  };
  Object.defineProperties(owner,{
    deck:{get(){throw Error('Hidden own deck cannot be read');}},
    prizes:{get(){throw Error('Hidden own Prizes cannot be read');}}
  });
  return {turn:9,phase:2,players:[owner,{}]};
}
const intent={kind:'paid-retreat',benchIndex:1,
  printing:"Lillie's Clefairy ex JTG",attackName:'Full Moon Rondo'};

test('public paid-retreat witness requires swapped Pokémon and discarded one Energy',()=>{
  const before=rootPhysicalSnapshot(state(
    slot('Girafarig LOT',['Psychic Energy MEE']),
    [slot('Shadow Rider Calyrex V CRE'),
     slot("Lillie's Clefairy ex JTG",['Psychic Energy MEE','Psychic Energy MEE'])],
    0),0,intent);
  const after=rootPhysicalSnapshot(state(
    slot("Lillie's Clefairy ex JTG",['Psychic Energy MEE','Psychic Energy MEE']),
    [slot('Shadow Rider Calyrex V CRE'),slot('Girafarig LOT')],
    9),0,intent);
  const GamePhase={FINISHED:4};
  assert.equal(rootPhysicalWitness(intent,before,after,GamePhase),
    'confirmed-public-effect');

  const noPayment={...after,targetEnergies:['Psychic Energy MEE']};
  assert.equal(rootPhysicalWitness(intent,before,noPayment,GamePhase),
    'no-confirmed-public-effect');
  const wrongTarget={...after,activePokemonPrinting:'Shadow Rider Calyrex V CRE'};
  assert.equal(rootPhysicalWitness(intent,before,wrongTarget,GamePhase),
    'no-confirmed-public-effect');
  const notRetreated={...after,retreatedTurn:0};
  assert.equal(rootPhysicalWitness(intent,before,notRetreated,GamePhase),
    'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,before,GamePhase),
    'no-confirmed-public-effect');
});

test('witness fails closed when identical printed Active and target have no distinguishable identity',()=>{
  const before=rootPhysicalSnapshot(state(
    slot('Girafarig LOT',['Psychic Energy MEE']),
    [slot(null),slot('Girafarig LOT',['Psychic Energy MEE'])],0),0,
    {...intent,printing:'Girafarig LOT'});
  const after=rootPhysicalSnapshot(state(
    slot('Girafarig LOT',['Psychic Energy MEE']),
    [slot(null),slot('Girafarig LOT')],9),0,
    {...intent,printing:'Girafarig LOT'});
  assert.equal(rootPhysicalWitness({...intent,printing:'Girafarig LOT'},
    before,after,{FINISHED:4}),'no-confirmed-public-effect');
});
