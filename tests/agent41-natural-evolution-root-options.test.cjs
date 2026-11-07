'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {actorGarbodorResponseRootOptions}=require(
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs');

test('disabled natural-evolution root emits no actor option',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(false,null),{});
});

test('null owner seat preserves bilateral natural-evolution behavior',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(true,null),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:null
  });
});

test('physical source seat zero is forwarded exactly',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(true,0),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:0
  });
});

test('physical source seat one is forwarded exactly',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(true,1),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:1
  });
});

test('Garbodor Tool root shares the natural-evolution owner-seat scope',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(true,0,true),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:0,
    garbotoxinToolRoot:true
  });
  assert.deepEqual(actorGarbodorResponseRootOptions(true,1,true),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:1,
    garbotoxinToolRoot:true
  });
  assert.deepEqual(actorGarbodorResponseRootOptions(true,null,true),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:null,
    garbotoxinToolRoot:true
  });
});

test('Garbodor Tool root requires the natural-evolution package root',()=>{
  assert.throws(()=>actorGarbodorResponseRootOptions(false,null,true),
    /requires the natural-evolution root to be enabled/);
});

test('invalid physical owner seats are rejected',()=>{
  for(const seat of [-1,2,0.5,'0',false]){
    assert.throws(()=>actorGarbodorResponseRootOptions(true,seat),
      /owner seat must be null, 0, or 1/);
  }
});

test('a physical owner seat cannot be configured while the root is disabled',()=>{
  assert.throws(()=>actorGarbodorResponseRootOptions(false,0),
    /requires the root to be enabled/);
  assert.throws(()=>actorGarbodorResponseRootOptions(false,1),
    /requires the root to be enabled/);
});
