'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {scanOriginalField}=
  require('../simulation/evaluation/agent8-public-ability-use-source-census.cjs');

test('source-resolved public once-use wording incidence',()=>{
  const r=scanOriginalField();
  assert.equal(r.sourceDecks,29);
  assert.equal(r.pokemonRows,309);
  assert.equal(r.pokemonCopies,467);
  assert.equal(r.uniquePokemonPrintings,102);
  assert.equal(r.onceUseTextPrintings,33);
  assert.equal(r.onceUseTextCopies,179);
  assert.equal(r.onceUseTextRanks,25);
  for(const rank of [6,7,24,29])assert.equal(r.perRank[rank],0);
  const pidgeot=r.sourceCards.find(c=>c.name==='Pidgeot ex');
  assert.ok(pidgeot);
  assert.deepEqual(pidgeot.ranks,[2,15]);
  assert.equal(pidgeot.sourceCopies,4);
  console.log('AGENT8_ABILITY_TEXT_SOURCE_CENSUS',
    JSON.stringify({sourceDecks:r.sourceDecks,
      printings:r.onceUseTextPrintings,
      copies:r.onceUseTextCopies,
      exposedRanks:r.onceUseTextRanks,
      competitiveQualifiedGames:0}));
});
