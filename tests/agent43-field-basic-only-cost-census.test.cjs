'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditPublicField}=require(
  '../scripts/agent43-field-basic-only-cost-census.cjs');

const census=auditPublicField();
console.log('AG43_FIELD_CENSUS',JSON.stringify({
  deckCount:census.deckCount,basicOnlyCount:census.basicOnlyCount,
  shortfallRanks:census.observedShortfallRanks,
  resolvedShortfalls:census.rows.filter(row=>row.shortfalls.length)
    .map(row=>({rank:row.rank,archetype:row.archetype,
      pokemonAttacks:row.shortfalls.map(x=>x.pokemon+':'+x.attack)}))
}));

test('source-input census keeps exact 29 published original sixties',()=>{
  assert.equal(census.deckCount,29);
  assert.equal(census.rows.length,29);
  assert.ok(census.rows.every(x=>x.source60Count===60));
  assert.equal(census.competitiveGameQualified,false);
  assert.equal(new Set(census.rows.map(x=>x.rank)).size,29);
});

test('rank 11 independently resolves its actual Garbodor printed Psychic shortfall',()=>{
  const row=census.rows.find(x=>x.rank===11);
  assert.equal(row.player,'Wataru Yano');
  assert.equal(row.basicOnlyEnergyModel,true);
  assert.deepEqual(row.basicEnergySupply,[{
    name:'Darkness Energy',type:'Darkness',count:8
  }]);
  assert.deepEqual(row.otherEnergies,[]);
  const garbodor=row.shortfalls.find(x=>
    x.pokemon==='Garbodor'&&x.attack==='Offensive Bomb'&&
    x.printing.set==='BKP'&&x.printing.number==='57');
  assert.ok(garbodor,
    'The exact source must resolve original BKP 57 printed attack cost');
  assert.deepEqual(garbodor.cost,
    ['Psychic','Colorless','Colorless','Colorless']);
  assert.deepEqual(garbodor.missing,[{
    type:'Psychic',printedRequired:1,registeredBasicCount:0
  }]);
  assert.equal(row.shortfalls.some(x=>x.pokemon==='Oranguru V'&&
    x.attack==='Psychic'),false,
  'Oranguru V attack has printed three Colorless, despite its name');
});

test('Special Energy decks retain explicit exclusion from basic-only conclusions',()=>{
  assert.equal(census.omittedFromZeroSpecialModel+
    census.basicOnlyCount,29);
  assert.ok(census.rows.filter(x=>!x.basicOnlyEnergyModel)
    .every(x=>x.shortfalls.length===0));
});
