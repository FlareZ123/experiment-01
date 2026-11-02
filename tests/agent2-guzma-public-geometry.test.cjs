'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {guzmaRecipientGeometry,guzmaBenchInvestment}=
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

test('Invested Bench evidence is not equated with payable attacks',()=>{
  const e=sample(2,3);
  assert.equal(guzmaBenchInvestment(e),'investment-unobserved');
  const p=e.publicGuzmaGeometry;
  p.ownActiveEnergyCards=2;
  p.ownBenchedEnergyCards=0;
  p.ownBenchedPokemonWithEnergy=0;
  assert.equal(guzmaBenchInvestment(e),'both-no-benched-energy');
  p.ownBenchedPokemonWithEnergy=1;
  p.ownBenchedEnergyCards=1;
  assert.equal(guzmaBenchInvestment(e),
    'both-bench-cards-fewer-than-active');
  p.ownBenchedEnergyCards=2;
  assert.equal(guzmaBenchInvestment(e),
    'both-bench-cards-at-least-active');
  p.ownActiveEnergyCards=1;
  assert.equal(guzmaBenchInvestment(e),
    'both-bench-cards-at-least-active');
  p.opponentBenchCount=0;
  assert.equal(guzmaBenchInvestment(e),'not-both-benches');
  p.ownBenchedEnergyCards=-1;
  assert.equal(guzmaBenchInvestment(e),'investment-unobserved');
});
