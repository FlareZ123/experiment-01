'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rank26RecoveryChoice}=
  require('../simulation/twinleaf/rank26-propagation-loop.cjs');

/** @param {string|null} name @param {number} damage */
function slot(name,damage=0){
  return {damage,getPokemonCard(){return name?{name}:null;}};
}

/** @returns {object} Source-visible staged context. */
function fixture(){
  const p={
    bench:[slot('Unown',20),slot('Squawkabilly ex',20),
      slot('Bunnelby',20),slot(null),slot(null)],
    stadium:{cards:[{name:'Risky Ruins'}]},
    hand:{cards:[{name:'Damage Pump'}]},
    discard:{cards:[{name:'Exeggcute'},{name:'Exeggcute'}]}
  };
  Object.defineProperty(p,'deck',{get(){
    throw new Error('K0 deck/Prize access forbidden');
  }});
  Object.defineProperty(p,'prizes',{get(){
    throw new Error('K0 deck/Prize access forbidden');
  }});
  return p;
}

test('retrieve first Egg from own discard after two self-KOs',()=>{
  const f=fixture();
  assert.deepEqual(rank26RecoveryChoice(f,4),
    {kind:'propagate',discardIndex:0});
});

test('rebench a propagated Egg before returning the next one',()=>{
  const f=fixture();
  f.discard.cards.shift();
  f.hand.cards.push({name:'Exeggcute'});
  assert.deepEqual(rank26RecoveryChoice(f,4),
    {kind:'bench',handIndex:1,benchIndex:3});
  f.hand.cards.pop();
  f.bench[3]=slot('Exeggcute',20);
  assert.deepEqual(rank26RecoveryChoice(f,4),
    {kind:'propagate',discardIndex:0});
});

test('once two damaged Eggs are ready the Pump tactic gets priority',()=>{
  const f=fixture();
  f.bench[3]=slot('Exeggcute',20);
  f.bench[4]=slot('Exeggcute',20);
  assert.equal(rank26RecoveryChoice(f,4),null);
});

test('fifth self-KO only returns one Egg, then stops at one Prize',()=>{
  const f=fixture();
  assert.deepEqual(rank26RecoveryChoice(f,2),
    {kind:'propagate',discardIndex:0});
  assert.equal(rank26RecoveryChoice(f,1),null);
});

test('no dead rebench without a Pump, Risky Ruins or donor counters',()=>{
  const f=fixture();
  f.hand.cards=[];
  assert.equal(rank26RecoveryChoice(f,4),null);
  f.hand.cards=[{name:'Damage Pump'}];
  f.stadium.cards=[];
  assert.equal(rank26RecoveryChoice(f,4),null);
  f.stadium.cards=[{name:'Risky Ruins'}];
  f.bench[0].damage=0;f.bench[1].damage=0;f.bench[2].damage=0;
  assert.equal(rank26RecoveryChoice(f,4),null);
});

test('one exposed counter recovers a single Egg without assuming two donors combine',()=>{
  const f=fixture();
  f.bench[0].damage=10;f.bench[1].damage=0;f.bench[2].damage=0;
  assert.deepEqual(rank26RecoveryChoice(f,4),
    {kind:'propagate',discardIndex:0});
  f.bench[3]=slot('Exeggcute',20);
  assert.equal(rank26RecoveryChoice(f,4),null);
});

test('a full Bench disallows newly Benched Eggs',()=>{
  const f=fixture();
  f.bench[3]=slot('Tapu Koko',0);
  f.bench[4]=slot('Crobat V',0);
  assert.equal(rank26RecoveryChoice(f,4),null);
});
