'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,sourceControlDeck,peoniaPrizeEnvelope,runCensus}=
  require('../scripts/agent39-original-control-mill-census.cjs');

test('source fixture sums real physical copies, not duplicate name rows',()=>{
  const source={rank:99,archetype:'test',cards:[
    {count:1,name:'Lusamine'},{count:1,name:'Lusamine'},
    {count:1,name:"Team Rocket's Handiwork"},
    {count:1,name:'Bellelba & Brycen-Man'},
    {count:3,name:'VS Seeker'},{count:1,name:'Peonia'}
  ]};
  const d=sourceControlDeck(source);
  assert.equal(d.copies.Lusamine,2);
  assert.equal(d.copies["Team Rocket's Handiwork"],1);
  assert.equal(d.copies.Peonia,1);
  assert.deepEqual(d.mills,["Team Rocket's Handiwork",
    'Bellelba & Brycen-Man']);
  assert.equal(d.handworkEngine,true);
  assert.equal(d.symmetricMillEngine,true);
});

test('the exact 29 original Aichi sixties contain five two-L recurring mill sources',()=>{
  const result=runCensus();
  assert.equal(result.sourceDeckCount,29);
  assert.equal(result.exactOriginals,29);
  assert.deepEqual(result.millingRanks,[2,3,6,7,24,29]);
  assert.deepEqual(result.twoLusamineMillRanks,[3,6,7,24,29]);
  assert.deepEqual(result.handworkRanks,[3,6,7,29]);
  assert.deepEqual(result.symmetricRanks,[7,24]);
  const r29=result.millSources.find(x=>x.rank===29);
  assert.deepEqual(r29.mills,["Team Rocket's Handiwork"]);
  assert.equal(r29.copies.Peonia,1);
  assert.equal(r29.copies.Gladion,0);
  const r24=result.millSources.find(x=>x.rank===24);
  assert.deepEqual(r24.mills,['Bellelba & Brycen-Man']);
  assert.equal(r24.copies["Team Rocket's Handiwork"],0);
});

test('exact 60-card blind one Peonia and two-visit structural frontier',()=>{
  const r=peoniaPrizeEnvelope();
  assert.equal(r.total,50063860n);
  assert.equal(r.blindSelectionPaths,1001277200n);
  assert.equal(r.directNoCorePrized,36288252n);
  assert.equal(r.blindOneSelectionSuccessPaths,844794720n);
  assert.equal(r.peoniaPrizedWithCore,1186570n);
  assert.equal(r.twoNonshuffledSelectionPotentialDeals,48877290n);
  assert.equal(r.blindOneSelectionProbability,7218/8555);
  assert.equal(r.twoSelectionPotentialFraction,63477/65018);
});

test('Pascal and six-Prize partition verify all exact path counts',()=>{
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(56,6)+4n*choose(56,5)+
    6n*choose(56,4)+4n*choose(56,3)+choose(56,2),
    choose(60,6));
  const r=peoniaPrizeEnvelope();
  assert.equal(r.total-r.peoniaPrizedWithCore,
    r.twoNonshuffledSelectionPotentialDeals);
  assert.ok(r.blindOneSelectionSuccessPaths<
    r.twoNonshuffledSelectionPotentialDeals*20n);
  assert.equal(choose(7,3),35n);
  assert.equal(choose(7,-1),0n);
});
