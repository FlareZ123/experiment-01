'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,commonConservativeSupporterRootOptions:options}=
  require('../simulation/evaluation/agent41-bilateral-conservative-supporter-option.cjs');

test('disabled profile leaves the historical actor options empty',()=>{
  assert.match(VERSION,/conservative-shuffle-supporter/);
  assert.deepEqual(options({enabled:false,actorOnlyComposition:false}),{});
  assert.deepEqual(options({enabled:false,actorOnlyComposition:true}),{});
});

test('enabled profile is symmetric and exposes only a conservative shuffle root',()=>{
  const result=options({enabled:true,actorOnlyComposition:true});
  assert.deepEqual(result,{conservativeShuffleBeforeAttack:true});
  assert.equal(Object.isFrozen(result),true);
});

test('rejects one-sided or ambiguous policy activation',()=>{
  assert.throws(()=>options({enabled:true,actorOnlyComposition:false}),
    /same actor-only policy/);
  assert.throws(()=>options({enabled:1,actorOnlyComposition:true}));
  assert.throws(()=>options({enabled:true,actorOnlyComposition:undefined}));
});
