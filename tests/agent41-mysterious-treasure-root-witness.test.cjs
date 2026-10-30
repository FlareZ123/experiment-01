'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalWitness,rootPhysicalSnapshot}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const INTENT={kind:'play-mysterious-treasure',
  printing:'Mysterious Treasure FLI',handIndex:1,
  discardPrinting:'Dragapult ex TWM'};

test('owner-visible Item spending has a typed public effect, without an attack claim',()=>{
  const before={treasureSpent:0,handCount:6};
  const after={treasureSpent:1,handCount:5};
  assert.equal(rootPhysicalWitness(INTENT,before,after,{}),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(INTENT,before,{...after,treasureSpent:0},{}),
    'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(INTENT,before,{...after,handCount:6},{}),
    'no-confirmed-public-effect');
});

test('physical witness samples own public Item discard only',()=>{
  const treasure={fullName:'Mysterious Treasure FLI'};
  const emptySlot={energies:{cards:[]},getPokemonCard:()=>null};
  const owner={
    hand:{cards:[treasure]},
    active:emptySlot,bench:Array.from({length:5},()=>emptySlot),
    stadium:{cards:[]},
    discard:{cards:[treasure]},
    supporter:{cards:[]}
  };
  const foe={hand:{cards:[]},active:emptySlot,
    bench:Array.from({length:5},()=>emptySlot)};
  const state={players:[foe,owner],turn:4,phase:3};
  const a=rootPhysicalSnapshot(state,1,INTENT);
  assert.equal(a.treasureSpent,1);
  assert.equal(a.handCount,1);
  assert.equal(rootPhysicalWitness(INTENT,{...a,treasureSpent:0,handCount:2},a,{}),
    'confirmed-public-effect');
});

test('Guzma and Team Flare Grunt are Supporter public quota receipts, never attacks',()=>{
  for(const [kind,printing] of [
    ['play-held-guzma-mobility','Guzma BUS'],
    ['play-team-flare-grunt-denial','Team Flare Grunt XY']
  ]){
    const intent={kind,printing,handIndex:0};
    const before={supporterSpent:0,supporterTurn:0};
    const after={supporterSpent:1,supporterTurn:1};
    assert.equal(rootPhysicalWitness(intent,before,after,{}),
      'confirmed-public-effect');
    assert.equal(rootPhysicalWitness(intent,before,
      {...after,supporterTurn:0},{}),'no-confirmed-public-effect');
    const base={energies:{cards:[]},getPokemonCard:()=>null};
    const player={hand:{cards:[]},active:base,bench:[],
      stadium:{cards:[]},discard:{cards:[]},
      supporter:{cards:[{fullName:printing}]},supporterTurn:1};
    const snap=rootPhysicalSnapshot({players:[player,{}],turn:3,phase:3},
      0,intent);
    assert.equal(snap.supporterSpent,1);
    assert.equal(snap.supporterTurn,1);
  }
});
