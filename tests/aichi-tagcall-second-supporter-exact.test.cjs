'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  TARGETS,countTwoTargetLocations,sourceParameters,census
}=require('../scripts/aichi-tagcall-second-supporter-exact.cjs');
const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));
const stats=census(manifest);
const close=(x,y)=>assert.ok(Math.abs(x-y)<1e-8,
  'Expected '+y+', got '+x);

test('all five source sixties are exact original-printing categories',()=>{
  assert.deepEqual([...TARGETS.keys()],[2,6,15,24,29]);
  assert.deepEqual(stats.rows.map(r=>r.categoryCounts),[
    [14,4,4,1,0,37],
    [4,2,2,1,1,50],
    [14,4,3,0,0,39],
    [4,2,2,2,1,49],
    [4,2,2,1,1,50]
  ]);
  for(const r of stats.rows)assert.equal(r.categoryCounts
    .reduce((a,b)=>a+b,0),60);
});

// These exact values condition on the actual first draw: a secondary TAG
// TEAM Supporter drawn into the hand is no longer searchable in the deck.
// The prior expectations wrongly tested its pre-draw deck placement.
test('physical opening denominator and exact subsets retain rank6 prior',()=>{
  const row=stats.rows.find(r=>r.rank===6);
  assert.equal(row.exactCounts.valid,'166478632771651200');
  close(row.percentages.tagHeld,22.930361051094074);
  close(row.percentages.tagNoHala,18.26681946736998);
  close(row.percentages.ghDeckThunderUnprized,16.199896487593353);
  close(row.percentages.fullExtraSearchable,12.717114783047034);
  close(row.conditionalBothTargetAndThunderGivenTagNoHalaPercent,
    69.61865915280774);
});

test('rank2 extra singleton, rank24 two extras, rank15 zero',()=>{
  const r=rank=>stats.rows.find(x=>x.rank===rank);
  close(r(2).percentages.fullExtraSearchable,20.168832142366508);
  close(r(24).percentages.fullExtraSearchable,15.5008038118127);
  close(r(29).percentages.fullExtraSearchable,12.717114783047034);
  assert.equal(r(15).exactCounts.fullExtraSearchable,'0');
  close(r(15).percentages.tagNoHala,29.633510025481442);
});

test('all physical events partition by provable subset relationship',()=>{
  for(const r of stats.rows){
    const values=r.exactCounts;
    for(const [small,large] of [
      ['fullExtraSearchable','ghDeckThunderUnprized'],
      ['ghDeckThunderUnprized','ghDeck'],
      ['ghDeck','tagNoHala'],
      ['tagNoHala','tagHeld'],
      ['tagHeld','valid']
    ])assert.ok(BigInt(values[small])<=BigInt(values[large]),
      r.rank+': '+small+' must be subset of '+large);
  }
  assert.equal(stats.qualifiedCompetitiveGames,0);
});

test('no secondary and no Tag Call have zero joint event',()=>{
  const noExtra=countTwoTargetLocations([4,2,2,0,1,51]);
  const noTag=countTwoTargetLocations([4,0,2,1,1,52]);
  assert.equal(noExtra.fullExtraSearchable,0n);
  assert.equal(noTag.tagHeld,0n);
  assert.equal(noTag.fullExtraSearchable,0n);
});
