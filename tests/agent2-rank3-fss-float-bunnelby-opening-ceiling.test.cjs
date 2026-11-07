'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  SCALE,sourceCategories,scaledOrderedCount,analyzeRank3Opening
}=require('../simulation/evaluation/agent2-rank3-fss-float-bunnelby-opening-ceiling.cjs');

test('rank3 original source categories and valid-start denominator stay exact',()=>{
  const {counts,basicCount}=sourceCategories();
  assert.deepEqual(counts,[1,1,1,1,3,1,3,1,6,42]);
  assert.equal(basicCount,11);
  const result=analyzeRank3Opening();
  assert.equal(result.openingSevenAll,'386206920');
  assert.equal(result.openingSevenValid,'300306336');
  assert.equal(SCALE,420n);
  assert.equal(result.qualifiedGames,0);
});

test('exact FSS-first early Tool and Bunnelby opening numerators',()=>{
  const {counts}=sourceCategories();
  assert.equal(scaledOrderedCount(counts,{anyBasic:true}),608135220n);
  assert.equal(scaledOrderedCount(counts,{anyBasic:true,
    excludeRotomV:true}),529011945n);
  assert.equal(scaledOrderedCount(counts),15943795n);
  assert.equal(scaledOrderedCount(counts,{capture:true}),2540475n);
  assert.equal(scaledOrderedCount(counts,{
    capture:true,excludeRotomV:true
  }),2443455n);
  assert.equal(scaledOrderedCount(counts,{allCapture:true}),630n);
});

test('opening occurrence ceilings shrink with stronger requirements',()=>{
  const rows=analyzeRank3Opening().cases;
  const p=rows.map(row=>row.chanceGivenValidOpening);
  for(let i=1;i<p.length;i++)assert.ok(p[i]<=p[i-1]);
  assert.ok(Math.abs(p[0]-0.0048215466223130235)<1e-14);
  assert.ok(Math.abs(p[1]-0.004194224693281197)<1e-14);
  assert.ok(Math.abs(p[2]-0.00012640897682114394)<1e-14);
  assert.ok(Math.abs(p[3]-0.000020141932669712304)<1e-14);
  assert.ok(Math.abs(p[4]-0.00001937271813006303)<1e-14);
  assert.ok(Math.abs(p[5]-0.000000004994899608112165)<1e-14);
  assert.equal(rows[5].validOpeningsPerOccurrence,200204224);
});

test('all-three-Capture event is exactly three Snorlax choices times half Tool order',()=>{
  const row=analyzeRank3Opening().cases[5];
  // Seven occupied slots: FSS, Float, Bunnelby, Snorlax, and 3 Capture.
  // Only three Snorlax identities can fill the remaining Pokémon slot.
  assert.equal(row.scaledNumerator,String(3n*SCALE/2n));
});
