'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {discardableLightningUnits,electroRainDiscardCapacity,
  sourceRaichuBestEnergyBudget}=require(
    '../simulation/twinleaf/agent10-raichu-electro-rain-energy-count.cjs'
  );
const CONTEXT={ownerPrizes:6,opponentPrizes:4,isEvolution:true,
  hasRuleBox:false,isPokemonGX:false,isPokemonEX:false,
  templeOfSinnoh:false};
const withFlags=flags=>({...CONTEXT,...flags});

test('official Japan FAQ: one Counter card yields two Electro Rain target selections',()=>{
  const r=electroRainDiscardCapacity(
    ['Counter Energy CIN'],CONTEXT);
  assert.deepEqual(r,{
    cardsDiscarded:1,lightningUnitsDiscarded:2,selectionCount:2,
    rawDamageCapacity:60,attackCostPayable:true
  });
  assert.equal(discardableLightningUnits('Counter Energy CIN',CONTEXT),2);
});

test('Reversal triple and Unit LPM single physical-card capacity',()=>{
  const r=electroRainDiscardCapacity(
    ['Reversal Energy PAL','Unit Energy LPM UPR','Counter Energy CIN'],
    CONTEXT);
  assert.equal(r.cardsDiscarded,3);
  assert.equal(r.selectionCount,6);
  assert.equal(r.rawDamageCapacity,180);
  const one=electroRainDiscardCapacity(
    ['Reversal Energy PAL'],CONTEXT,[0]);
  assert.equal(one.selectionCount,3);
  assert.equal(one.rawDamageCapacity,90);
  const subset=electroRainDiscardCapacity(
    ['Reversal Energy PAL','Unit Energy LPM UPR',
      'Counter Energy CIN'],CONTEXT,[0,2]);
  assert.equal(subset.selectionCount,5);
});

test('behind-on-Prizes, evolution and Temple are evaluated at attack time',()=>{
  for(const flags of [{ownerPrizes:4},{opponentPrizes:6},
    {isEvolution:false},{hasRuleBox:true}]){
    const context=withFlags(flags);
    const attached=['Reversal Energy PAL','Counter Energy CIN',
      'Unit Energy LPM UPR'];
    const r=electroRainDiscardCapacity(attached,context);
    const expectedCounter=flags.hasRuleBox?
      2:flags.isEvolution===false?2:0;
    assert.equal(r.selectionCount,1+expectedCounter);
    assert.equal(r.attackCostPayable,true);
  }
  const temple=electroRainDiscardCapacity(
    ['Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR'],
    withFlags({templeOfSinnoh:true}));
  assert.equal(temple.cardsDiscarded,0);
  assert.equal(temple.selectionCount,0);
  assert.equal(temple.attackCostPayable,false);
});

test('discard subset counts Energy units while forbidding two discards of one card',()=>{
  assert.throws(()=>electroRainDiscardCapacity(
    ['Counter Energy CIN'],CONTEXT,[0,0]),/same physical card/);
  assert.throws(()=>electroRainDiscardCapacity(
    ['Unit Energy LPM UPR'],CONTEXT,[2]));
  assert.throws(()=>electroRainDiscardCapacity(
    ['Reversal Energy PAL'],withFlags({opponentPrizes:6}),[0]),
    /Only Energy currently providing Lightning/);
  assert.equal(electroRainDiscardCapacity(
    ['Lightning Energy MEE','Counter Energy CIN'],CONTEXT,[0])
    .selectionCount,1);
});

test('full original rank4 and rank17 Energy printed copies match 4/4/4',()=>{
  const file=path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json');
  const decks=JSON.parse(fs.readFileSync(file,'utf8')).decks;
  for(const rank of [4,17]){
    const list=decks.find(deck=>deck.rank===rank);
    assert.ok(list);
    const energies=list.cards.filter(card=>card.category==='Energy');
    assert.deepEqual(energies.map(card=>[card.name,card.count]).sort(),[
      ['Counter Energy',4],['Reversal Energy',4],['Unit Energy LPM',4]
    ].sort());
    assert.equal(energies.reduce((s,c)=>s+c.count,0),12);
  }
});

test('raw upper bounds for 5, 10, and 12 physical Energy cards',()=>{
  const five=sourceRaichuBestEnergyBudget(CONTEXT,5);
  assert.equal(five.lightningUnits,14);
  assert.equal(five.rawDamageCapacity,420);
  const ten=sourceRaichuBestEnergyBudget(CONTEXT,10);
  assert.equal(ten.lightningUnits,22);
  assert.equal(ten.rawDamageCapacity,660);
  const twelve=sourceRaichuBestEnergyBudget(CONTEXT,12);
  assert.equal(twelve.lightningUnits,24);
  assert.equal(twelve.rawDamageCapacity,720);
  assert.equal(sourceRaichuBestEnergyBudget(
    withFlags({ownerPrizes:6,opponentPrizes:6}),12).rawDamageCapacity,120);
  assert.equal(sourceRaichuBestEnergyBudget(
    withFlags({templeOfSinnoh:true}),12).rawDamageCapacity,0);
});
