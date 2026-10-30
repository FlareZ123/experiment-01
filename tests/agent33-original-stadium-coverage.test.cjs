'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {census,load,STADIUM_NAMES,FIRST29}=
  require('../simulation/evaluation/agent33-original-stadium-coverage.cjs');
test('29 authentic source sixties all contain a Stadium, with 81 copies',()=>{
  const c=load();
  assert.equal(c.originalRankCount,29);
  assert.equal(c.ranksWithAnyStadium,29);
  assert.equal(c.totalStadiumCopies,81);
  assert.equal(c.stadiumNames,16);
  assert.equal(STADIUM_NAMES.length,16);
  assert.equal(c.competitiveGameQualified,false);
});
test('conditional owner-root placement covers at most seven of 81 copies',()=>{
  const c=load();
  assert.equal(c.explicitOptInPlacementCopies,7);
  assert.equal(c.noExplicitPlacementCopies,74);
  assert.deepEqual(FIRST29.filter(rank=>
    !c.ranksWithoutExplicitPlacement.includes(rank)),[3,6,24,29]);
});
test('actual originals never silently substitute a missing rank 23, 25 or 28',()=>{
  const c=load();
  for(const rank of [23,25,28]){
    assert.equal(c.originalRanks.includes(rank),false);
    assert.equal(c.rows.some(row=>row.rank===rank),false);
  }
});
test('Temple Path Parallel Sky are all outside current two explicit branches',()=>{
  const c=load();
  for(const [name,copies] of [['Sky Field',17],['Temple of Sinnoh',9],
    ['Path to the Peak',8],['Parallel City',7]]){
    const row=c.byName.find(x=>x.name===name);
    assert.equal(row.copies,copies);
    assert.equal(row.explicitRoot,null);
  }
});
test('census refuses to impute a 60 from malformed original source',()=>{
  const raw=require('../results/aichi-2026/full-decklists.json');
  const bad=raw.decks.map(d=>({...d,cards:d.cards.map(c=>({...c}))}));
  bad.find(d=>d.rank===6).cards[0].count++;
  assert.throws(()=>census(bad),/exactly 60/);
});
