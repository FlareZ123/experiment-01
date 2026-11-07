'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {actorNaturalEvolutionRootOptions}=require(
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs');

test('disabled natural-evolution root emits no actor option',()=>{
  assert.deepEqual(actorNaturalEvolutionRootOptions(false,null),{});
});

test('null owner seat preserves bilateral natural-evolution behavior',()=>{
  assert.deepEqual(actorNaturalEvolutionRootOptions(true,null),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:null
  });
});

test('physical source seat zero is forwarded exactly',()=>{
  assert.deepEqual(actorNaturalEvolutionRootOptions(true,0),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:0
  });
});

test('physical source seat one is forwarded exactly',()=>{
  assert.deepEqual(actorNaturalEvolutionRootOptions(true,1),{
    naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:1
  });
});

test('invalid physical owner seats are rejected',()=>{
  for(const seat of [-1,2,0.5,'0',false]){
    assert.throws(()=>actorNaturalEvolutionRootOptions(true,seat),
      /owner seat must be null, 0, or 1/);
  }
});

test('a physical owner seat cannot be configured while the root is disabled',()=>{
  assert.throws(()=>actorNaturalEvolutionRootOptions(false,0),
    /requires the root to be enabled/);
  assert.throws(()=>actorNaturalEvolutionRootOptions(false,1),
    /requires the root to be enabled/);
});
