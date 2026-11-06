'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {summarizeSpecialEnergyCoverage}=require(
  '../scripts/agent33-aichi-special-energy-model-coverage.cjs'
);

test('authenticated Aichi Energy inventory and exact Special Energy denominator',()=>{
  const result=summarizeSpecialEnergyCoverage();
  assert.deepEqual({
    decks:result.totalSummary.originalDecks,
    energyCopies:result.totalSummary.totalEnergyCopies,
    energyPrintings:result.totalSummary.distinctEnergyPrintings,
    specialCopies:result.specialSummary.copies,
    specialPrintings:result.specialSummary.distinctPrintings
  },{decks:29,energyCopies:238,energyPrintings:21,
    specialCopies:118,specialPrintings:14});
  assert.deepEqual(result.missingOriginalRanks,[23,25,28]);
});

test('narrow exact model misses the original Counter/Reversal/Unit and other families',()=>{
  const x=summarizeSpecialEnergyCoverage();
  assert.equal(x.specialSummary.narrowExactCopies,38);
  assert.equal(x.specialSummary.narrowAliasCopies,44);
  assert.equal(x.specialSummary.copies-x.specialSummary.narrowExactCopies,80);
  assert.equal(x.specialSummary.copies-x.specialSummary.narrowAliasCopies,74);
  const unsupported=x.printings.filter(row=>
    row.count>0&&!row.basic&&row.narrowExactCopies===0);
  assert.deepEqual(unsupported.map(row=>row.printing),[
    'Counter Energy CIN','Double Dragon Energy ROS','Jet Energy PAL',
    'Memory Energy LOT','Powerful Colorless Energy DAA',
    'Prism Energy ASC','Recycle Energy UNM','Reversal Energy PAL',
    'Telepathic Psychic Energy POR','Unit Energy LPM UPR'
  ]);
});

test('general model represents all 118 source Special Energy copies in favorable context',()=>{
  const x=summarizeSpecialEnergyCoverage();
  assert.equal(x.specialSummary.genericFavorableCopies,118);
  assert.equal(x.specialSummary.genericConservativeCopies,72);
  assert.equal(x.specialSummary.copies-x.specialSummary.genericConservativeCopies,46);
});

test('all-Special zero-Basic sources expose the largest narrow-policy gap',()=>{
  const x=summarizeSpecialEnergyCoverage();
  assert.deepEqual(x.totalSummary.specialOnlyRanks,[4,5,6,7,17,24,29]);
  assert.equal(x.totalSummary.specialOnlyEnergyCopies,56);
  assert.equal(x.totalSummary.specialOnlyNarrowExactCopies,30);
  assert.equal(x.totalSummary.specialOnlyNarrowAliasCopies,30);
  assert.equal(x.totalSummary.specialOnlyGenericFavorableCopies,56);
  for(const rank of [4,17]){
    const row=x.rankRows.find(r=>r.rank===rank);
    assert.equal(row.energyCopies,12);
    assert.equal(row.narrowExactCopies,0);
    assert.equal(row.genericFavorableCopies,12);
  }
  const rank7=x.rankRows.find(r=>r.rank===7);
  assert.equal(rank7.narrowExactCopies,2);
  assert.equal(rank7.genericFavorableCopies,4);
});

test('conditional families fail closed when public recipient or Prize facts are unknown',()=>{
  const x=summarizeSpecialEnergyCoverage();
  const byName=new Map(x.printings.map(row=>[row.printing,row]));
  assert.equal(byName.get('Counter Energy CIN').genericConservativeCopies,0);
  assert.equal(byName.get('Double Dragon Energy ROS').genericConservativeCopies,0);
  assert.equal(byName.get('Reversal Energy PAL').genericConservativeCopies,8);
  assert.equal(byName.get('Unit Energy LPM UPR').genericConservativeCopies,8);
});

test('all 21 original Energy printings are recognized by the general model in favorable context',()=>{
  const x=summarizeSpecialEnergyCoverage();
  assert.equal(x.printings.length,21);
  assert.ok(x.printings.every(row=>
    row.genericFavorableCopies===row.count));
});
