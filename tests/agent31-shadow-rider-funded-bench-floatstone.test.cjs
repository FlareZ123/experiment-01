'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseFundedShadowRiderFloatStone:choose}=
  require('../simulation/twinleaf/agent31-shadow-rider-funded-bench-floatstone.cjs');
const psychic='Psychic Energy MEE';
const vmax='Shadow Rider Calyrex VMAX CRE';
const cost=[0,0,0];
const catalog={basicEnergies:new Set([psychic]),
  basicEnergyTypes:{Psychic:8},colorlessEnergyType:0,
  specialConditions:{ASLEEP:5,PARALYZED:6}};
const pokemon=n=>({printing:vmax,damage:0,
  printed:{retreatCost:[0,0],types:[8]},
  energies:Array(n).fill(psychic),tools:[],
  attacks:[{name:'Max Geist',cost}],publicRestrictions:{},
  specialConditions:[]});
const sample=()=>({decisionKind:'owner-root',globalTurn:11,
  ownHand:['Float Stone BKT'],ownTurnResources:{retreatedTurn:0},
  ownPublic:{active:pokemon(1),bench:[pokemon(6)],
    stadium:[],publicTurnRestrictions:{}},
  opponentPublic:{active:{tools:[]},stadium:[]}});
test('offers paper-screened Float Stone and then retreat',()=>{
  const v=sample(),a=choose(v,catalog);
  assert.equal(a.kind,'attach-emergency-floatstone');
  assert.equal(a.benchIndex,0);
  v.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(choose(v,catalog).kind,'retreat-emergency-floatstone');
});
test('requires a funded Bench and a currently unfunded Active',()=>{
  const v=sample();v.ownPublic.bench=[pokemon(2)];
  assert.equal(choose(v,catalog),null);
  v.ownPublic.bench=[pokemon(3)];v.ownPublic.active=pokemon(3);
  assert.equal(choose(v,catalog),null);
});
test('refuses Tool suppression and repeat retreat',()=>{
  const v=sample();
  v.opponentPublic.active.tools=['Tool Jammer BST'];
  assert.equal(choose(v,catalog),null);
  v.opponentPublic.active.tools=[];v.ownPublic.stadium=['Jamming Tower TWM'];
  assert.equal(choose(v,catalog),null);
  v.ownPublic.stadium=[];v.ownTurnResources.retreatedTurn=11;
  assert.equal(choose(v,catalog),null);
});
