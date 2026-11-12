'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DECK_AUDIT,CAPACITY,exactSentinelWhismurAccess
} = require('../../simulation/evaluation/agent27-sentinel-whismur-access.cjs');

test('Sentinel v2 exact deck audit recognizes 13 Basics, not 15',()=>{
  assert.deepEqual(CAPACITY,[1,1,3,2,1,11,4,4,33]);
  assert.equal(DECK_AUDIT.totalCards,60);
  assert.equal(DECK_AUDIT.pokemon,26);
  assert.equal(DECK_AUDIT.energy,6);
  assert.equal(DECK_AUDIT.trainers,28);
  assert.equal(DECK_AUDIT.basicCount,13);
  assert.equal(DECK_AUDIT.capacity.reduce((a,b)=>a+b,0),60);
});

test('exact unimpeded access reproduces independent rational calculation',()=>{
  const r=exactSentinelWhismurAccess();
  assert.deepEqual(r.total,{numerator:'70691703870063',
    denominator:'309271137970795',probability:0.22857517301449107});
  assert.deepEqual(r.withoutGuzmaHala,{numerator:'53656546981',
    denominator:'445528650138',probability:0.12043343781456073});
  assert.deepEqual(r.mulliganOpening,{numerator:'1905803',
    denominator:'11703240',probability:0.1628440500237541});
  assert.equal(r.assumptions.mustGoSecond,true);
  assert.equal(r.assumptions.guzmaHalaDiscardAssumption,
    'two-discardable-cards-always-available');
});

test('Ability lock removes Fan Call but leaves direct/Guzma-Hala access',()=>{
  const r=exactSentinelWhismurAccess({fanCallEnabled:false});
  assert.deepEqual(r.total,{numerator:'247250866056419',
    denominator:'1855626827824770',probability:0.13324385180734588});
  assert.equal(r.fanCallOnly.probability,0);
});

test('Supporter lock removes Guzma-Hala assistance but leaves the no-supporter route subset',()=>{
  const r=exactSentinelWhismurAccess({supporterEnabled:false});
  assert.deepEqual(r.total,{numerator:'53656546981',
    denominator:'445528650138',probability:0.12043343781456073});
  assert.equal(r.guzmaHalaAssisted.probability,0);
});

test('combined Ability, Item and Supporter locks leave only direct/Jet access',()=>{
  const r=exactSentinelWhismurAccess({
    fanCallEnabled:false,tagCallEnabled:false,supporterEnabled:false
  });
  assert.deepEqual(r.total,{numerator:'35736043',
    denominator:'439377367',probability:0.08133337236735728});
});

test('Item lock disables Tag Call but preserves direct Guzma-Hala and Fan Call routes',()=>{
  const r=exactSentinelWhismurAccess({tagCallEnabled:false});
  assert.deepEqual(r.total,{numerator:'116180181345499',
    denominator:'618542275941590',probability:0.18782900678638512});
});
