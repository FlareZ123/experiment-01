'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {trigger,census}=require(
  '../simulation/evaluation/agent14-own-bench-energy-move-census.cjs');

test('exact printed Energy transfer predicate matches only own Bench obligations',()=>{
  assert.equal(trigger.test(
    'Move an Energy from this Pokémon to 1 of your Benched Pokémon.'),true);
  assert.equal(trigger.test(
    'Move an Energy from 1 of your Benched Pokémon to this Pokémon.'),false);
  assert.equal(trigger.test(
    'Move an Energy attached to the Defending Pokémon to 1 of your opponent\'s Benched Pokémon.'),false);
  assert.equal(trigger.test(
    'You may discard an Energy from this Pokémon.'),false);
});

test('published original source manifest preserves source printing in exposure census',()=>{
  const result=census();
  assert.equal(result.exactPublishedSixties,29);
  assert.ok(result.scannedPokemonPrintings>100);
  assert.equal(result.unresolved.length,0,
    'Unresolved original source Pokemon printings: '+
      JSON.stringify(result.unresolved.slice(0,40)));
  assert.deepEqual(result.matches.filter(x=>x.pokemon==='Iron Thorns ex')
    .map(x=>x.rank),[6,24,29]);
  const empoleon=result.matches.filter(x=>x.pokemon==='Empoleon V');
  assert.equal(empoleon.length,1);
  assert.equal(empoleon[0].rank,30);
  assert.equal(empoleon[0].sourcePrinting.set,'BST');
  assert.equal(empoleon[0].sourcePrinting.number,'40');
  assert.equal(empoleon[0].attack,'Swirling Slice');
  assert.deepEqual(empoleon[0].attackCost,
    ['Water','Colorless','Colorless']);
  assert.deepEqual(empoleon[0].deckEnergyInventory.map(x=>x.name),
    ['Psychic Energy','Telepathic Psychic Energy']);
  assert.equal(result.competitiveQualified,false);
  process.stdout.write('# AGENT14_OWN_BENCH_PRINT_CENSUS '+
    JSON.stringify({prints:result.scannedPokemonPrintings,
      unresolved:result.unresolved.length,matches:result.matches.map(x=>({
        rank:x.rank,pokemon:x.pokemon,attack:x.attack,
        printing:x.sourcePrinting}))})+'\n');
});
