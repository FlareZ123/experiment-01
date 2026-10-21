'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {withPaperFullBenchTrubbishHook,installPaperFullBenchTrubbishHook} =
  require('../simulation/twinleaf/agent38-paper-fullbench-callforfamily-hook.cjs');

/** @returns {{exemplar:object,original:Function,deps:object,seen:object[]}} */
function fixture() {
  const seen = [];
  class Trubbish {
    constructor() {
      this.fullName = 'Trubbish FST';
      this.attacks = [{name:'Call for Family',damage:0},{name:'Super Poison Breath',damage:20}];
    }
    reduceEffect(store,state,effect) {
      seen.push({store,state,effect});
      return {native:true};
    }
  }
  const exemplar = new Trubbish();
  const original = Trubbish.prototype.reduceEffect;
  return {exemplar,original,seen,deps:{
    exemplar,
    WAS_ATTACK_USED:(effect,index,pokemon)=>effect?.attack === pokemon.attacks[index],
    GET_PLAYER_BENCH_SLOTS:player=>player.bench.filter(slot=>slot.cards.length===0)
  }};
}

const player=full=>({bench:Array.from({length:5},(_,i)=>({cards:full||i!==4?[{name:'A'}]:[]}))});

test('full Bench: Call for Family skips reducer; Store owns turn end',()=>{
  const f=fixture(),state={turn:48},effect={attack:f.exemplar.attacks[0],player:player(true)};
  const result=withPaperFullBenchTrubbishHook(()=>
    f.exemplar.reduceEffect({},state,effect),f.deps);
  assert.equal(result.result,state);
  assert.equal(result.audit.skippedSearches,1);
  assert.equal(f.seen.length,0);
  assert.equal(Object.getPrototypeOf(f.exemplar).reduceEffect,f.original);
});

test('open Bench: native search path remains unchanged',()=>{
  const f=fixture(),effect={attack:f.exemplar.attacks[0],player:player(false)};
  const result=withPaperFullBenchTrubbishHook(()=>
    f.exemplar.reduceEffect({}, {},effect),f.deps);
  assert.deepEqual(result.result,{native:true});
  assert.equal(result.audit.skippedSearches,0);
  assert.equal(f.seen.length,1);
});

test('second attack remains native on full Bench',()=>{
  const f=fixture(),effect={attack:f.exemplar.attacks[1],player:player(true)};
  const result=withPaperFullBenchTrubbishHook(()=>
    f.exemplar.reduceEffect({}, {},effect),f.deps);
  assert.deepEqual(result.result,{native:true});
  assert.equal(result.audit.skippedSearches,0);
  assert.equal(f.seen.length,1);
});

test('unrelated effect remains native',()=>{
  const f=fixture(),effect={kind:'trainer',player:player(true)};
  const result=withPaperFullBenchTrubbishHook(()=>
    f.exemplar.reduceEffect({}, {},effect),f.deps);
  assert.deepEqual(result.result,{native:true});
  assert.equal(result.audit.skippedSearches,0);
});

test('finally restores native reducer on error',()=>{
  const f=fixture();
  assert.throws(()=>withPaperFullBenchTrubbishHook(()=>{
    throw new Error('native error');
  },f.deps),/native error/);
  assert.equal(Object.getPrototypeOf(f.exemplar).reduceEffect,f.original);
});

test('different printing or attack definition fails closed',()=>{
  const f=fixture(); f.exemplar.fullName='Trubbish PLS';
  assert.throws(()=>installPaperFullBenchTrubbishHook(f.deps),/printing/);
  f.exemplar.fullName='Trubbish FST'; f.exemplar.attacks[0].damage=20;
  assert.throws(()=>installPaperFullBenchTrubbishHook(f.deps),/damage changed/);
  assert.equal(Object.getPrototypeOf(f.exemplar).reduceEffect,f.original);
});

test('double installation is rejected without uninstalling first',()=>{
  const f=fixture(),a=installPaperFullBenchTrubbishHook(f.deps);
  try{
    assert.throws(()=>installPaperFullBenchTrubbishHook(f.deps),/already installed/);
    assert.notEqual(Object.getPrototypeOf(f.exemplar).reduceEffect,f.original);
  }finally{a.restore();}
  assert.equal(Object.getPrototypeOf(f.exemplar).reduceEffect,f.original);
});
