'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseShadowRiderTarget,matchesPsychicPriorityOpponent}=require('../simulation/twinleaf/shadow-rider-psychic-attach.cjs');

/** @param {string|null} name @param {number} psychic @param {boolean} locked */
function slot(name,psychic=0,locked=false) {
  const pokemon=name ? {name} : undefined;
  return {
    getPokemonCard:()=>pokemon,
    energies:{cards:Array.from({length:psychic},()=>({name:'Psychic Energy'}))},
    cannotAttachEnergyFromHandNextTurn:locked
  };
}

test('completes an already powered VMAX before spreading to a Basic V',()=>{
  const player={
    active:slot('Shadow Rider Calyrex V',2),
    bench:[slot('Shadow Rider Calyrex VMAX',0),
      slot('Shadow Rider Calyrex VMAX',2)]
  };
  assert.deepEqual(chooseShadowRiderTarget(player),{zone:'bench',index:1});
});

test('active VMAX wins stage and active tie breaks',()=>{
  const player={
    active:slot('Shadow Rider Calyrex VMAX',0),
    bench:[slot('Shadow Rider Calyrex VMAX',2),slot('Latias ex',0)]
  };
  assert.deepEqual(chooseShadowRiderTarget(player),{zone:'active',index:0});
});

test('fully powered and Energy-locked VMAX are ineligible for manual priority',()=>{
  const player={
    active:slot('Shadow Rider Calyrex VMAX',3),
    bench:[slot('Shadow Rider Calyrex VMAX',1,true),
      slot('Shadow Rider Calyrex V',0)]
  };
  assert.deepEqual(chooseShadowRiderTarget(player),{zone:'bench',index:1});
  player.bench=[slot('Shadow Rider Calyrex VMAX',2,true),slot('Dialga-GX',0)];
  assert.equal(chooseShadowRiderTarget(player),null);
});

test('empty or support-only board does not produce a target',()=>{
  assert.equal(chooseShadowRiderTarget({
    active:slot(null),bench:[slot('Latias ex'),slot('Tapu Lele-GX')]
  }),null);
});

test('experimental matchup gate preserves Iron Thorns-only behavior by default',()=>{
  const opponent=name=>({active:{getPokemonCard:()=>({name})}});
  assert.equal(matchesPsychicPriorityOpponent(opponent('Iron Thorns ex'),false),true);
  assert.equal(matchesPsychicPriorityOpponent(opponent('Regidrago V'),false),false);
  assert.equal(matchesPsychicPriorityOpponent(opponent('Regidrago V'),true),true);
  assert.equal(matchesPsychicPriorityOpponent(undefined,true),false);
});
