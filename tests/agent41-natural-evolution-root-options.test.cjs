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
    naturalEvolutionRoot:true,garbodorResponseOwnerSeat:null
  });
});

test('physical source seat zero is forwarded exactly',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(true,0),{
    naturalEvolutionRoot:true,garbodorResponseOwnerSeat:0
  });
});

test('physical source seat one is forwarded exactly',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(true,1),{
    naturalEvolutionRoot:true,garbodorResponseOwnerSeat:1
  });
});

test('Garbodor Tool root shares the natural-evolution owner-seat scope',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(true,0,true),{
    naturalEvolutionRoot:true,garbodorResponseOwnerSeat:0,
    garbotoxinToolRoot:true,
    garbotoxinToolRootDeferForStarAlchemy:false
  });
  assert.deepEqual(actorGarbodorResponseRootOptions(true,1,true),{
    naturalEvolutionRoot:true,garbodorResponseOwnerSeat:1,
    garbotoxinToolRoot:true,
    garbotoxinToolRootDeferForStarAlchemy:false
  });
  assert.deepEqual(actorGarbodorResponseRootOptions(true,null,true),{
    naturalEvolutionRoot:true,garbodorResponseOwnerSeat:null,
    garbotoxinToolRoot:true,
    garbotoxinToolRootDeferForStarAlchemy:false
  });
});

test('deferral counterfactual enables Star Alchemy deferral',()=>{
  assert.deepEqual(actorGarbodorResponseRootOptions(true,0,true,true),{
    naturalEvolutionRoot:true,garbodorResponseOwnerSeat:0,
    garbotoxinToolRoot:true,
    garbotoxinToolRootDeferForStarAlchemy:true
  });
});

test('Star Alchemy deferral option must be boolean',()=>{
  assert.throws(()=>actorGarbodorResponseRootOptions(true,0,true,'false'));
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
