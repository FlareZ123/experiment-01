'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,conditionalSpecialExposure,auditSpecialOnlySourceOpenings}=
  require('../scripts/agent17-special-only-opening-exposure.cjs');
const corpus=require('../results/aichi-2026/full-decklists.json');

test('integer combinations and exact disjoint toy opening fractions',()=>{
  assert.equal(choose(10,3),120n);
  assert.equal(choose(4,5),0n);
  assert.deepEqual(conditionalSpecialExposure(2,3,0,10,3),{
    numerator:'39',denominator:'64',probability:39/64
  });
  assert.deepEqual(conditionalSpecialExposure(2,3,1,10,3),{
    numerator:'87',denominator:'112',probability:87/112
  });
  assert.deepEqual(conditionalSpecialExposure(2,0,1,10,3),{
    numerator:'0',denominator:'1',probability:0
  });
});

test('independent brute-force ordered eighth draw agrees with exact formula',()=>{
  const n=10,h=3,b=2,s=3;
  let eligible=0,seen=0;
  for(let a=0;a<n;a++)for(let c=a+1;c<n;c++)for(let d=c+1;d<n;d++){
    const first=[a,c,d];
    if(!first.some(i=>i<b))continue;
    for(let next=0;next<n;next++){
      if(first.includes(next))continue;
      eligible++;
      if([...first,next].some(i=>i>=b&&i<b+s))seen++;
    }
  }
  const got=conditionalSpecialExposure(b,s,1,n,h);
  assert.equal(Number(got.numerator)*eligible,
    Number(got.denominator)*seen);
});

test('seven original printed Special-only source lists have consistent Basic rosters',()=>{
  const out=auditSpecialOnlySourceOpenings(corpus);
  assert.equal(out.sourceCount,29);
  assert.deepEqual(out.missingRanks,[23,25,28]);
  assert.deepEqual(out.rows.map(r=>r.rank),[4,5,6,7,17,24,29]);
  assert.deepEqual(out.rows.map(r=>[r.basicCopies,r.specialCopies]),[
    [13,12],[11,4],[4,8],[12,4],[13,12],[4,8],[4,8]
  ]);
  assert.equal(out.qualification.gameWinnerEvidence,false);
  for(const row of out.rows){
    assert.ok(row.firstSeven.probability>0);
    assert.ok(row.afterOneOrdinaryDraw.probability>row.firstSeven.probability);
  }
});

test('the three four-Basic Iron Thorns originals share exact natural hold rate',()=>{
  const rows=auditSpecialOnlySourceOpenings(corpus).rows;
  for(const rank of [6,24,29]){
    const r=rows.find(row=>row.rank===rank);
    assert.ok(Math.abs(r.firstSeven.probability-
      0.6101129357327705)<1e-13);
    assert.ok(Math.abs(r.afterOneOrdinaryDraw.probability-
      0.6689638133580127)<1e-13);
  }
});

test('unsupported rosters, source tampering and impossible inputs fail closed',()=>{
  const bad=structuredClone(corpus);
  bad.decks.find(d=>d.rank===6).cards
    .find(c=>c.name==='Iron Thorns ex').name='Unknown Basic';
  assert.throws(()=>auditSpecialOnlySourceOpenings(bad),
    /Unclassified source Pokémon/);
  assert.throws(()=>conditionalSpecialExposure(0,4));
  assert.throws(()=>conditionalSpecialExposure(59,4));
  assert.throws(()=>conditionalSpecialExposure(4,8,54));
});
