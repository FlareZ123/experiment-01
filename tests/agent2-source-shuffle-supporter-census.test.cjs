'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {sourceShuffleSupporterCoverage,FAMILIES}=
  require('../scripts/agent2-source-shuffle-supporter-census.cjs');

const published=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));
test('all 29 authentic source 60s and 3 missing ranks are retained',()=>{
  const d=sourceShuffleSupporterCoverage(published);
  assert.equal(d.exactPhysical60s,29);
  assert.equal(d.unresolvedOriginal60s,3);
  assert.deepEqual(d.missing.map(x=>x.rank),[23,25,28]);
  assert.equal(d.rows.length,29);
  assert.equal(d.rows.every(x=>x.knownExact60&&
    x.totalShuffleCards===Object.values(x.familyCounts).reduce((a,b)=>a+b,0)),
    true);
});
test('three distinct printed shuffle Supporter families, no false ID claim',()=>{
  const d=sourceShuffleSupporterCoverage(published);
  assert.deepEqual(FAMILIES,["Lillie's Determination",'Marnie','Iono']);
  assert.equal(d.knownOriginalsWithAnyShuffleFamily,25);
  assert.equal(d.knownOriginalsWithoutShuffleFamily,4);
  assert.deepEqual(d.withoutFamilyRanks,[2,15,17,31]);
  assert.equal(d.qualification.startsWith('Inventory only.'),true);
  const source6=d.rows.find(x=>x.rank===6);
  assert.equal(source6.familyCounts["Lillie's Determination"],1);
  assert.equal(source6.totalShuffleCards,1);
  const source11=d.rows.find(x=>x.rank===11);
  assert.equal(source11.familyCounts.Marnie,3);
  assert.equal(source11.totalShuffleCards,3);
});
test('rejects malformed physical 60 and duplicate published rank',()=>{
  const duplicate=structuredClone(published);
  duplicate.decks[1].rank=1;
  assert.throws(()=>sourceShuffleSupporterCoverage(duplicate),/Duplicate/);
  const broken=structuredClone(published);
  broken.decks[0].cards[0].count++;
  assert.throws(()=>sourceShuffleSupporterCoverage(broken),/60-card/);
});
