'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {guzmaRecipientGeometry}=
  require('../simulation/evaluation/agent43-guzma-held-root-retrospective.cjs');

const sample=(own,opponent)=>({
  publicGuzmaGeometry:{
    ownActiveOccupied:true,opponentActiveOccupied:true,
    ownBenchCount:own,opponentBenchCount:opponent
  }
});

test('Guzma recipient categories distinguish both visible Bench constraints',()=>{
  assert.equal(guzmaRecipientGeometry(sample(0,0)),
    'opponent-bench-empty');
  assert.equal(guzmaRecipientGeometry(sample(2,0)),
    'opponent-bench-empty');
  assert.equal(guzmaRecipientGeometry(sample(0,1)),
    'opponent-target-own-bench-empty');
  assert.equal(guzmaRecipientGeometry(sample(1,1)),
    'both-benches-occupied');
  assert.equal(guzmaRecipientGeometry(sample(4,5)),
    'both-benches-occupied');
});
test('missing board data is unverified rather than assumed playable',()=>{
  assert.equal(guzmaRecipientGeometry({}),'geometry-unobserved');
  assert.equal(guzmaRecipientGeometry({publicGuzmaGeometry:{
    ownBenchCount:1,opponentBenchCount:1,
    ownActiveOccupied:false,opponentActiveOccupied:true
  }}),'geometry-unobserved');
  assert.equal(guzmaRecipientGeometry(sample(-1,1)),
    'geometry-unobserved');
});
