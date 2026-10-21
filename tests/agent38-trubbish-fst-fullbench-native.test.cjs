'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {withPaperFullBenchTrubbishHook} =
  require('../simulation/twinleaf/agent38-paper-fullbench-callforfamily-hook.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {AttackEffect} = require(path.join(output,'game/store/effects/game-effects'));
const {GameMessage} = require(path.join(output,'game/game-message'));

/**
 * Exercise the exact pinned Trubbish printed reducer and native AttackEffect.
 * The Store's game loop and next-turn semantics require a later full-match CI;
 * this test instead isolates the previously crashing card reducer boundary.
 */
test('pinned Trubbish FST full-Bench Call for Family follows paper C-11',()=>{
  const card=initializeCards().getCardByName('Trubbish FST');
  assert.equal(card?.fullName,'Trubbish FST');
  assert.equal(card.attacks[0].name,'Call for Family');
  const player={
    id:0,
    deck:{cards:[{fullName:'Darkness Energy SVE'}]},
    bench:Array.from({length:5},()=>({cards:[{fullName:'Trubbish FST'}]})),
    active:{cards:[card]}
  };
  const effect=new AttackEffect(player,{id:1},card.attacks[0]);
  const state={turn:48};
  const store={prompt(){throw new Error('Full Bench must not search');}};
  let nativeThrown=null;
  try{card.reduceEffect(store,state,effect);}catch(error){nativeThrown=error;}
  assert.equal(nativeThrown?.message,GameMessage.NO_BENCH_SLOTS_AVAILABLE,
    'The pinned native reducer must reproduce the reported pre-hook defect');

  const hooked=withPaperFullBenchTrubbishHook(()=>
    card.reduceEffect(store,state,effect));
  assert.equal(hooked.result,state);
  assert.equal(hooked.audit.skippedSearches,1);
  let restoredThrown=null;
  try{card.reduceEffect(store,state,effect);}catch(error){restoredThrown=error;}
  assert.equal(restoredThrown?.message,GameMessage.NO_BENCH_SLOTS_AVAILABLE);
});
