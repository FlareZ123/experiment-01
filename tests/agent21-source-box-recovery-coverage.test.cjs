'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const original=require('../results/aichi-2026/full-decklists.json');
const {sourcePrintedRecoveryCoverage,copies}=
  require('../simulation/evaluation/agent21-source-box-recovery-item-coverage.cjs');

test('source inventory count and missing Top32 ranks stay explicit',()=>{
  const r=sourcePrintedRecoveryCoverage(original);
  assert.equal(r.sourceRosterCount,29);
  assert.deepEqual(r.unauthenticatedRanks,[23,25,28]);
  assert.equal(r.empiricalMatchGames,0);
});

test('Secret Box + Night Stretcher original source overlap is three ranks',()=>{
  const r=sourcePrintedRecoveryCoverage(original);
  assert.deepEqual(r.withSecretBox,
    [4,5,8,9,11,16,17,19,22,30]);
  assert.deepEqual(r.withNightStretcher,[1,3,8,19,22]);
  assert.deepEqual(r.withEnergyRetrieval,[]);
  assert.deepEqual(r.boxFog,[]);
  assert.deepEqual(r.boxNight.map(x=>x.rank),[8,19,22]);
  assert.deepEqual(r.boxNight.map(x=>x.nightStretcher),[1,2,2]);
  assert.deepEqual(r.boxNight.map(x=>x.basicEnergy),[7,9,8]);
  assert.deepEqual(r.boxNight.map(x=>x.vipPass),[2,2,2]);
  assert.deepEqual(r.boxNight.map(x=>x.rescueCarrier),[0,0,0]);
});

test('original source overlap does not imply a paid, playable attack',()=>{
  const r=sourcePrintedRecoveryCoverage(original);
  for(const row of r.boxNight){
    assert.equal(row.secretBox,1);
    assert.ok(row.nightStretcher>0);
    assert.ok(row.basicEnergy>0);
    assert.equal(row.rescueCarrier,0);
  }
  assert.match(r.qualification,/NAME\/COUNT COVERAGE ONLY/);
});

test('source duplicate same-name print counts are summed',()=>{
  const fake={cards:[
    {name:'Night Stretcher',count:1},
    {name:'Night Stretcher',count:2}
  ]};
  assert.equal(copies(fake,'Night Stretcher'),3);
});

test('reject malformed duplicate rank and non-60 source candidate',()=>{
  assert.throws(()=>sourcePrintedRecoveryCoverage({decks:[
    original.decks[0],original.decks[0]
  ]}),/duplicate/);
  const bad={...original.decks[0],
    cards:[...original.decks[0].cards,{name:'Fog Crystal',count:1}]};
  assert.throws(()=>sourcePrintedRecoveryCoverage({decks:[bad]}),
    /not 60/);
});
