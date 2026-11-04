'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {originalFieldToolAnswerVisibility}=
  require('../scripts/agent38-original-field-tool-visibility.cjs');
const original=require('../results/aichi-2026/full-decklists.json');

test('29 originals accounted for without guessing unresolved Pokémon stages',()=>{
  const result=originalFieldToolAnswerVisibility(original);
  assert.equal(result.originalSources,29);
  assert.equal(result.rows.length,29);
  assert.equal(result.printedCounterOriginals,20);
  assert.equal(result.resolvedOriginals+result.unresolvedOriginals,29);
  assert.equal(new Set(result.rows.map(x=>x.rank)).size,29);
  for(const row of result.rows){
    if(row.status==='resolved-corpus-basic-stage'){
      assert.ok(row.basicCount>=1);
      assert.ok(row.probabilitySeenInNine>=0);
      assert.ok(row.probabilitySeenInNine<=1);
    }else{
      assert.equal(row.status,'unknown-pokemon-stage');
      assert.ok(row.unresolvedPrintedPokemon.length>0);
      assert.ok(!Object.hasOwn(row,'probabilitySeenInNine'));
    }
  }
});

test('original rank11 source resolves exactly eleven starting Basics',()=>{
  const result=originalFieldToolAnswerVisibility({
    ...original,decks:original.decks.filter(deck=>deck.rank===11)
  });
  assert.equal(result.originalSources,1);
  const row=result.rows[0];
  assert.equal(row.status,'resolved-corpus-basic-stage');
  assert.equal(row.basicCount,11);
  assert.equal(row.directAnswerCount,0);
  assert.equal(row.probabilitySeenInNine,0);
});

test('rank1 original SMP217 promo absence correctly blocks corpus-stage resolution',()=>{
  const result=originalFieldToolAnswerVisibility({
    ...original,decks:original.decks.filter(deck=>deck.rank===1)
  });
  const row=result.rows[0];
  assert.equal(row.status,'unknown-pokemon-stage');
  assert.equal(row.directAnswerCount,1);
  assert.ok(row.unresolvedPrintedPokemon.some(entry=>
    entry.name==='Trevenant & Dusknoir-GX'&&entry.printing.set==='SMP'&&
    String(entry.printing.number)==='217'&&
    entry.lookupState==='set-absent-from-bundled-corpus'));
  assert.equal(Object.hasOwn(row,'basicCount'),false);
});

test('unknown Pokémon printing remains fail-closed instead of being guessed',()=>{
  const deck=JSON.parse(JSON.stringify(original.decks.find(x=>x.rank===11)));
  const trubbish=deck.cards.find(x=>x.name==='Trubbish');
  trubbish.printing.set='INVALID-AGENT38';
  const result=originalFieldToolAnswerVisibility({
    source:original.source,decks:[deck]
  });
  assert.equal(result.resolvedOriginals,0);
  assert.equal(result.unresolvedOriginals,1);
  assert.equal(result.rows[0].status,'unknown-pokemon-stage');
  assert.equal(result.rows[0].unresolvedPrintedPokemon[0].name,'Trubbish');
  assert.equal(result.rows[0].unresolvedPrintedPokemon[0].lookupState,
    'set-absent-from-bundled-corpus');
});
