'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {census,loadTypes}=
  require('../scripts/agent18-source29-supporter-wally-oldex-census.cjs');

test('current printed 29/32 source inventories and exact trainer subtype taxonomy',()=>{
  const r=census();
  assert.equal(r.sample,29);
  assert.deepEqual(r.missingRanks,[23,25,28]);
  assert.deepEqual(r.supporterSummary,{
    min:2,median:9,max:24,
    atMostTwo:[26],
    atLeastTwenty:[3,6,7,24,29]
  });
  assert.equal(r.qualifiedMatches,0);
  assert.equal(r.rows.length,29);
  assert.equal(r.rows.find(v=>v.rank===6).supporterCopies,21);
  assert.equal(r.rows.find(v=>v.rank===26).supporterCopies,2);
  assert.equal(r.rows.find(v=>v.rank===24).supporterCopies,24);
});

test('actual Wally original prints are disjoint from old uppercase Pokémon-EX originals',()=>{
  const r=census();
  assert.deepEqual(r.wallyOriginalRanks,[5,8,22]);
  assert.deepEqual(r.oldUppercasePokemonExOriginalRanks,[19]);
  assert.deepEqual(r.wallyAndOldEXOriginalRanks,[]);
  assert.ok(r.rows.filter(v=>v.wallyCopies>0).every(v=>v.oldUppercasePokemonExCopies===0));
});

test('printed archive resolves Wally as Supporter and legacy Tool as Tool',()=>{
  const types=loadTypes();
  assert.deepEqual([...types.get('Wally')],['Supporter']);
  assert.deepEqual([...types.get('Guzma & Hala')],['Supporter']);
  assert.deepEqual([...types.get('Technical Machine: Evolution')],['Pokémon Tool']);
  assert.deepEqual([...types.get('Float Stone')],['Pokémon Tool']);
});

test('seven explicitly sourced missing card types are strictly non-Supporters',()=>{
  const types=loadTypes();
  const expected={
    'Battle Compressor':'Item',
    'Palace Belt':'Pokémon Tool',
    'Palace Book':'Item',
    'Robo Substitute':'Item',
    'Target Whistle':'Item',
    'Thunder Mountain ♢':'Stadium',
    'Wondrous Labyrinth ♢':'Stadium'
  };
  for(const [name,type] of Object.entries(expected))
    assert.deepEqual([...types.get(name)],[type]);
});
