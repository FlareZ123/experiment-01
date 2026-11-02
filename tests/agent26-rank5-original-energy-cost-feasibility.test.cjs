'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rank5PrintedEnergyFeasibility:analyze}=
  require('../scripts/agent26-rank5-original-energy-cost-feasibility.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

test('exact original rank5 60 contains four DCE as its only Energy',()=>{
  const r=analyze(field);
  assert.equal(r.sourceRank,5);
  assert.equal(r.originalSixtySize,60);
  assert.equal(r.registeredEnergyCopies,4);
  assert.deepEqual(r.registeredEnergyNames,['Double Colorless Energy']);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('only directly payable printed attack is two-Colorless Cross Fusion Strike',()=>{
  const r=analyze(field);
  assert.equal(r.originalPokemonPrintings,6);
  assert.equal(r.printedAttackCount,9);
  assert.equal(r.directlyColorlessPayableAttackCount,1);
  const viable=r.attacks.filter(x=>x.payableByPrintedEnergyAlone);
  assert.deepEqual(viable.map(x=>[x.pokemon,x.attack,x.immediateDceCardsRequired]),
    [['Mew VMAX','Cross Fusion Strike',1]]);
});

test('Clefairy, Genesect, Crobat, Dedenne and Mew V attacks require absent colors',()=>{
  const r=analyze(field);
  const others=r.attacks.filter(x=>x.attack!=='Cross Fusion Strike');
  assert.equal(others.length,8);
  for(const attack of others){
    assert.ok(attack.coloredEnergyUnfunded.length>0,attack.attack);
    assert.equal(attack.payableByPrintedEnergyAlone,false);
    assert.equal(attack.immediateDceCardsRequired,null);
  }
  assert.deepEqual(r.attacks.find(x=>x.attack==='Full Moon Rondo').cost,
    ['Psychic','Colorless']);
  assert.deepEqual(r.attacks.find(x=>x.attack==='Techno Blast').cost,
    ['Metal','Metal','Colorless']);
});

test('a different source Energy print invalidates fixed-original attack certificate',()=>{
  const mutated=structuredClone(field);
  const source=mutated.decks.find(x=>x.rank===5);
  source.cards.find(x=>x.name==='Double Colorless Energy').name='Psychic Energy';
  assert.throws(()=>analyze(mutated),assert.AssertionError);
});

test('a different rank5 printing invalidates printed-attack certificate',()=>{
  const mutated=structuredClone(field);
  const source=mutated.decks.find(x=>x.rank===5);
  source.cards.find(x=>x.name==='Mew VMAX').printing.number='268';
  assert.throws(()=>analyze(mutated),assert.AssertionError);
});

test('printed attack cost and donor copy-cost remain explicitly distinct',()=>{
  const r=analyze(field);
  const donor=r.attacks.find(x=>x.attack==='Techno Blast');
  const copy=r.attacks.find(x=>x.attack==='Cross Fusion Strike');
  assert.equal(donor.payableByPrintedEnergyAlone,false);
  assert.equal(copy.payableByPrintedEnergyAlone,true);
  assert.match(r.attackCopyCostCaveat,/copy/);
  assert.equal(r.claimsNaturalGames,0);
});
