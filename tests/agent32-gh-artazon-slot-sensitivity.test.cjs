'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,oneSlotScenario,main}=
  require('../simulation/evaluation/agent32-gh-artazon-slot-sensitivity.cjs');
const {sourceArtazonCounts}=
  require('../simulation/evaluation/agent32-gh-artazon-prize-window.cjs');

test('source-exact 60 contains eight other Basics and 25 other nonbasics',()=>{
  const {counts,totalBasics}=sourceArtazonCounts();
  assert.equal(VERSION,'agent32-exeggutor-gh-artazon-exact-slot-sensitivity-v1');
  assert.equal(counts.reduce((a,b)=>a+b,0),60);
  assert.equal(totalBasics,14);
  assert.equal(totalBasics-counts[0]-counts[1]-counts[2],8);
  assert.equal(counts[11]-8,25);
});

test('all exact conditional single-copy sensitivities are source repeatable',()=>{
  const data=main(),rows=new Map(data.variants.map(row=>[row.name,row]));
  assert.equal(data.variants.length,11);
  assert.equal(data.baseline.numerator,'89772393489231');
  assert.equal(data.baseline.denominator,'3739215166086400');
  for(const row of rows.values()){
    assert.ok(row.probability.percent>=0);
    assert.ok(row.probability.percent<=100);
    assert.ok(Math.abs(row.probability.percent-
      data.baseline.percent-row.deltaPercentagePoints)<1e-10);
  }
  assert.ok(Math.abs(rows.get('Jet 3 to 4, one unrelated nonbasic removed')
    .probability.percent-3.133374246474403)<1e-10);
  assert.ok(Math.abs(rows.get('Artazon 2 to 3, one unrelated nonbasic removed')
    .probability.percent-2.422112984297526)<1e-10);
  assert.ok(Math.abs(rows.get('Jet 3 to 2, one unrelated nonbasic added')
    .probability.percent-1.4402307778106513)<1e-10);
});

test('Basic-status of removed anonymous card changes conditional opener denominator',()=>{
  const {counts,totalBasics}=sourceArtazonCounts();
  const otherBasic=oneSlotScenario({
    name:'other Basic to Bunnelby',target:'Bunnelby',
    delta:1,otherRemovedIsBasic:true
  },counts,totalBasics);
  const otherNonbasic=oneSlotScenario({
    name:'other nonbasic to Bunnelby',target:'Bunnelby',
    delta:1,otherRemovedIsBasic:false
  },counts,totalBasics);
  assert.equal(otherBasic.basicCount,14);
  assert.equal(otherNonbasic.basicCount,15);
  assert.ok(Math.abs(otherBasic.probability.percent-
    3.068825070673013)<1e-10);
  assert.ok(Math.abs(otherNonbasic.probability.percent-
    2.9954865665973833)<1e-10);
});

test('all three symmetric target Basic groups have identical swap exposure',()=>{
  const data=main(),s=data.variants.filter(row=>
    row.otherRemovedIsBasic&&row.delta===1);
  assert.deepEqual(s.map(row=>row.target),['Bunnelby','Exeggcute','Oddish']);
  assert.equal(new Set(s.map(row=>row.probability.numerator)).size,1);
  assert.equal(new Set(s.map(row=>row.probability.denominator)).size,1);
});

test('five copies of a nonbasic four-copy restricted card are rejected',()=>{
  const {counts,totalBasics}=sourceArtazonCounts();
  assert.throws(()=>oneSlotScenario({
    name:'invalid five Tag Call',target:'Tag Call',delta:1,
    otherRemovedIsBasic:false
  },counts,totalBasics),/four-copy/);
});
