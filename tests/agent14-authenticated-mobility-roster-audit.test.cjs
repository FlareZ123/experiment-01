'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {census,auditPinnedRoster,FAMILIES}=
  require('../simulation/evaluation/agent14-authenticated-mobility-roster-audit.cjs');

test('all 29 original printed sixties have a potential basic reposition resource',()=>{
  const r=auditPinnedRoster();
  assert.equal(r.originalCompleteSixties,29);
  assert.equal(r.anyCoreMobility,29);
  assert.deepEqual(r.zeroCoreMobilityRanks,[]);
  assert.deepEqual(r.missingOriginalSixties,[23,25,28]);
  assert.equal(r.paperGameQualified,false);
  const rank11=r.rows.find(x=>x.rank===11);
  assert.deepEqual(rank11.printedMobilityCopies,{
    Guzma:2,'Float Stone':3,'Escape Rope':1});
});
test('exact family inventory: 25 Guzma, 12 Float Stone, 7 Escape Rope source lists',()=>{
  const r=auditPinnedRoster();
  assert.deepEqual(r.byFamily.map(x=>
    [x.name,x.originalListsContaining,x.aggregatePrintedCopies]),[
    ['Guzma',25,48],['Float Stone',12,24],['Escape Rope',7,11]
  ]);
  assert.equal(FAMILIES.length,3);
});
test('exact-name matching does not interpret Guzma & Hala as a mobility Guzma',()=>{
  const r=census({decks:[
    {rank:99,archetype:'synthetic',cards:[
      {name:'Guzma & Hala',count:4},{name:'Other',count:56}]}]});
  assert.equal(r.anyCoreMobility,0);
  assert.deepEqual(r.zeroCoreMobilityRanks,[99]);
  assert.deepEqual(r.rows[0].printedMobilityCopies,{
    Guzma:0,'Float Stone':0,'Escape Rope':0});
});
test('duplicate printing counts aggregate without double-counting source decks',()=>{
  const r=census({decks:[
    {rank:14,cards:[
      {name:'Float Stone',count:1},{name:'Float Stone',count:2},
      {name:'Other',count:57}]}]});
  assert.equal(r.byFamily[1].originalListsContaining,1);
  assert.equal(r.byFamily[1].aggregatePrintedCopies,3);
});
test('malformed 59 cards or duplicate source rank fails closed',()=>{
  assert.throws(()=>census({decks:[{rank:1,cards:[
    {name:'Other',count:59}]}]}),/60/);
  assert.throws(()=>census({decks:[
    {rank:1,cards:[{name:'Other',count:60}]},
    {rank:1,cards:[{name:'Other',count:60}]}
  ]}));
});
