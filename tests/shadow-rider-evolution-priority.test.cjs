'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  preferShadowRiderEvolution,withShadowRiderEvolutionPriority
}=require('../simulation/twinleaf/shadow-rider-evolution-priority.cjs');

const v={name:'Shadow Rider Calyrex V'};
const vmax={name:'Shadow Rider Calyrex VMAX',evolvesFrom:'Shadow Rider Calyrex V'};
/** @param {string|null} name @param {number} psychic @param {number} playedTurn @param {number} special */
function slot(name,psychic,playedTurn=1,special=0) {
  return {
    getPokemonCard(){return name ? {name} : undefined;},
    pokemonPlayedTurn:playedTurn,
    energies:{cards:[
      ...Array.from({length:psychic},()=>({name:'Psychic Energy'})),
      ...Array.from({length:special},()=>({name:'Double Colorless Energy'}))
    ]}
  };
}
/** @param {object} active @param {object[]} bench @param {object[]} hand */
function player(active,bench,hand=[vmax]){
  return {id:101,active,bench,hand:{cards:hand}};
}

test('select energized Bench V over older unequipped Active when only one VMAX exists',()=>{
  const p=player(slot('Shadow Rider Calyrex V',0),[
    slot('Shadow Rider Calyrex V',2),slot('Latias ex',3)
  ]);
  assert.deepEqual(preferShadowRiderEvolution(p,{turn:4}),
    {handIndex:0,zone:'bench',index:0,psychic:2});
});

test('preserve original active-first behavior on tied energy counts',()=>{
  const p=player(slot('Shadow Rider Calyrex V',2),[
    slot('Shadow Rider Calyrex V',2)
  ]);
  assert.equal(preferShadowRiderEvolution(p,{turn:4}),null);
});

test('exclude ineligible just-played V and never try first-turn evolution',()=>{
  const p=player(slot('Shadow Rider Calyrex V',0),[
    slot('Shadow Rider Calyrex V',3,4)
  ]);
  assert.equal(preferShadowRiderEvolution(p,{turn:4}),null);
  const q=player(slot('Shadow Rider Calyrex V',0,1),[
    slot('Shadow Rider Calyrex V',2,1)
  ]);
  assert.equal(preferShadowRiderEvolution(q,{turn:1}),null);
});

test('do not take over when two VMAX in hand, no V, or only one eligible V',()=>{
  const p=player(slot('Shadow Rider Calyrex V',0),[
    slot('Shadow Rider Calyrex V',3)
  ],[vmax,vmax]);
  assert.equal(preferShadowRiderEvolution(p,{turn:3}),null);
  assert.equal(preferShadowRiderEvolution(player(slot('Latias ex',0),[
    slot('Shadow Rider Calyrex V',3)]),{turn:3}),null);
});

test('count only actual basic Psychic Energy and retain first-highest tie',()=>{
  const p=player(slot('Shadow Rider Calyrex V',0,1,3),[
    slot('Shadow Rider Calyrex V',1),slot('Shadow Rider Calyrex V',1)
  ]);
  assert.deepEqual(preferShadowRiderEvolution(p,{turn:5}),
    {handIndex:0,zone:'bench',index:0,psychic:1});
});

test('opt-in splice inserts just before original EvolveTactic and preserves input',()=>{
  class EvolveTactic {}
  class PlayBasicTactic {}
  class PriorityTactic {}
  const opts={tactics:[EvolveTactic,PlayBasicTactic],scores:{unchanged:true}};
  const next=withShadowRiderEvolutionPriority(opts,PriorityTactic);
  assert.deepEqual(next.tactics,[PriorityTactic,EvolveTactic,PlayBasicTactic]);
  assert.deepEqual(opts.tactics,[EvolveTactic,PlayBasicTactic]);
  assert.equal(next.scores,opts.scores);
  assert.throws(()=>withShadowRiderEvolutionPriority({tactics:[PlayBasicTactic]},PriorityTactic),
    /EvolveTactic/);
});
