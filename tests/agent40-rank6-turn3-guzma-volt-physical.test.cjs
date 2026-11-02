'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {COUNTS,LABELS,exactOriginalRank6PoweredGuzma}=
  require('../simulation/evaluation/agent40-rank6-turn3-guzma-volt-physical.cjs');

test('only published original rank6 60 distinct physical categories',()=>{
  assert.deepEqual(COUNTS,[4,4,1,3,48]);
  assert.equal(COUNTS.reduce((a,b)=>a+b,0),60);
  assert.equal(LABELS.length,5);
});

test('exhaustive BigInt valid-seven plus ordered two-source-draw count is exact',()=>{
  const event=exactOriginalRank6PoweredGuzma();
  assert.equal(event.reducedNumerator,'14277253');
  assert.equal(event.reducedDenominator,'6644092455');
  assert.ok(Math.abs(event.conditionalOriginalSevenLegal-
    14277253/6644092455)<1e-14);
  assert.ok(event.conditionalOriginalSevenLegal>0.0021);
  assert.ok(event.conditionalOriginalSevenLegal<0.0022);
});

test('exact source event never describes a native full-game winner',()=>{
  const event=exactOriginalRank6PoweredGuzma();
  assert.equal(event.originalRank,6);
  assert.equal(event.competitiveQualifiedGames,0);
  assert.match(event.omits,/Store plays/);
});
