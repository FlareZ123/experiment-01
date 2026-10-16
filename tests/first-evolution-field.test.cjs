'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {weightedNaturalEvolutionChance} = require('../scripts/first-evolution-field.cjs');
const {naturalEvolutionChance} = require('../scripts/first-evolution-natural.cjs');

const baseline={basicCount:14,targetBasicCount:3,stageOneCount:4};
const hood={basicCount:15,targetBasicCount:4,stageOneCount:4};
const temple={basicCount:15,targetBasicCount:4,stageOneCount:3};

test('opponent with no mulligans reduces to the no-bonus marginal',()=>{
  for(const counts of [baseline,hood,temple]) {
    const conditional=naturalEvolutionChance({deckSize:60,openingSize:7,prizeCount:6,...counts}).conditional;
    assert.ok(Math.abs(weightedNaturalEvolutionChance(60,counts)-conditional)<1e-12);
  }
});

test('four-Basic opponent yields Python-verified all-bonus probabilities',()=>{
  for(const [counts,expected] of [[baseline,0.23206898886770383],
    [hood,0.28342548382895993],[temple,0.22983897562646063]]) {
    assert.ok(Math.abs(weightedNaturalEvolutionChance(4,counts)-expected)<1e-11);
  }
});

test('access improves against opponents with fewer Basics',()=>{
  for(const counts of [baseline,hood,temple]) {
    const v=[4,10,11,12,13,14,15,16].map(x=>weightedNaturalEvolutionChance(x,counts));
    for(let i=1;i<v.length;i++) assert.ok(v[i-1]>v[i]);
  }
});

test('rejects impossible opponent composition',()=>{
  assert.throws(()=>weightedNaturalEvolutionChance(0,baseline),RangeError);
});
