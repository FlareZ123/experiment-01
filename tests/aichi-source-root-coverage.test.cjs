'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {
  BASIC_ENERGIES,auditSourceRootCoverage
}=require('../scripts/aichi-source-root-coverage.cjs');

const source=require('../results/aichi-2026/full-decklists.json');
const result=auditSourceRootCoverage(source);

test('all 29 exact original source printings retain legal total',()=>{
  assert.equal(result.exactPrintedSources,29);
  assert.deepEqual(result.missingFullPrintedRanks,[23,25,28]);
  assert.equal(result.decks.length,29);
});
test('strict disjoint Basic/Special counts for all authentic 60s',()=>{
  for(const deck of result.decks){
    const sourceDeck=source.decks.find(x=>x.rank===deck.rank);
    assert.equal(deck.basicEnergy+deck.specialEnergy,
      sourceDeck.cards.filter(c=>c.category==='Energy')
        .reduce((s,c)=>s+c.count,0));
  }
  assert.equal(BASIC_ENERGIES.has('Speed Lightning Energy'),false);
  assert.equal(BASIC_ENERGIES.has('Darkness Energy'),true);
});
test('seven exact source 60s contain only Special Energy',()=>{
  assert.deepEqual(result.twoSourceGates.zeroBasicEnergySpecialOnly,
    [4,5,6,7,17,24,29]);
  for(const rank of result.twoSourceGates.zeroBasicEnergySpecialOnly){
    const d=result.decks.find(x=>x.rank===rank);
    assert.equal(d.basicEnergy,0);
    assert.ok(d.specialEnergy>0);
  }
});
test('first-turn search card omission affects multiple exact sources',()=>{
  assert.equal(result.twoSourceGates.vipPresent.length,15);
  assert.equal(result.featureCopyTotals['Battle VIP Pass'],42);
  assert.equal(result.twoSourceGates.quickBallPresent.length,21);
  assert.equal(result.featureCopyTotals['Quick Ball'],72);
  assert.equal(result.twoSourceGates.vipAndQuickBall.length,13);
});
test('every exact printed opponent 60 exposes at least one high-use Trainer family outside default actor roots',()=>{
  const names=['Guzma','VS Seeker','Battle VIP Pass',
    'Battle Compressor',"Lillie's Determination"];
  const expected={Guzma:[25,48],'VS Seeker':[23,59],
    'Battle VIP Pass':[15,42],'Battle Compressor':[17,33],
    "Lillie's Determination":[16,19]};
  for(const name of names){
    assert.equal(result.featurePresent[name].length,expected[name][0]);
    assert.equal(result.featureCopyTotals[name],expected[name][1]);
  }
  assert.equal(result.decks.filter(d=>
    names.some(name=>d.featureCopies[name]>0)).length,29);
});
test('pinned rank6/rank11 source opportunity counts are unchanged',()=>{
  const six=result.decks.find(d=>d.rank===6);
  const eleven=result.decks.find(d=>d.rank===11);
  assert.equal(six.basicEnergy,0);
  assert.equal(six.featureCopies['Speed Lightning Energy'],4);
  assert.equal(eleven.featureCopies['Battle VIP Pass'],4);
  assert.equal(eleven.featureCopies['Quick Ball'],4);
  assert.equal(eleven.featureCopies.Carmine,3);
  assert.equal(eleven.featureCopies['Boost Shake'],2);
});
test('reject an invented 59-card or duplicate-rank source',()=>{
  const shortened={decks:[{
    rank:1,cards:[{category:'Pokémon',name:'X',count:59}]
  }]};
  assert.throws(()=>auditSourceRootCoverage(shortened));
  const duplicated={decks:[source.decks[0],source.decks[0]]};
  assert.throws(()=>auditSourceRootCoverage(duplicated));
});
