'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  census,abilityWindow,normalizedDisplayName
} = require('../simulation/evaluation/agent2-muk-field-basic-abilities.cjs');

test('source field remains exact 29 original complete sixties', () => {
  const observed = census();
  assert.equal(observed.sourceDeckCount,29);
  assert.deepEqual(observed.sourceRanksMissing,[23,25,28]);
  assert.equal(observed.rows.length,29);
  assert.equal(new Set(observed.rows.map(x=>x.rank)).size,29);
  assert.deepEqual(observed.unresolvedPokemonPrintings,[]);
  assert.equal(observed.decksWithRecognizedBasicAbility,29);
  assert.deepEqual(observed.decksWithoutRecognizedBasicAbility,[]);
  assert.equal(observed.totalRecognizedBasicAbilityPhysicalCopies,208);
  assert.equal(observed.abilities.length,43);
  assert.equal(observed.authenticFieldQualifiedGames,0);
});

test('known source exact Basic Abilities and cross-zone suppression class', () => {
  const observed = census();
  const rank26 = observed.rows.find(x=>x.rank===26);
  const exeggcute = rank26.basicAbilityCards.find(x=>
    x.name==='Exeggcute' && x.id==='bw9-4');
  assert.ok(exeggcute,'Original rank26 discard Exeggcute must be resolved');
  assert.equal(exeggcute.physicalCopies,2);
  const rank19HoOh=observed.rows.find(x=>x.rank===19).basicAbilityCards.find(x=>
    x.name==='Ho-Oh-EX' && x.id==='bw6-22');
  assert.ok(rank19HoOh);
  assert.ok(rank19HoOh.abilities.some(a=>a.name==='Rebirth' &&
    a.window==='discard-self'));
  assert.ok(exeggcute.abilities.some(a=>
    a.name==='Propagation' && a.window==='discard-self'));
  assert.ok(observed.rows.find(x=>x.rank===9).basicAbilityCards.some(x=>
    x.name==='Unown' && x.id==='xy7-30'));
  assert.ok(observed.rows.find(x=>x.rank===1).basicAbilityCards.some(x=>
    x.name==='Tapu Lele-GX' && x.id==='sm2-60'));
  assert.ok(observed.rows.find(x=>x.rank===10).basicAbilityCards.some(x=>
    x.name==='Latias ex' && x.id==='sv8-76'));
  assert.equal(abilityWindow({
    text:'Once during your turn, if this Pokémon is in your discard pile, put it into your hand.'
  }), 'discard-self');
  assert.equal(normalizedDisplayName('Ditto ♢'),'Ditto');
});

const observed=census();
console.log('ORIGINAL29_MUK_BASIC_ABILITY_CENSUS '+JSON.stringify({
  sourceDeckCount:observed.sourceDeckCount,
  unresolvedPokemonPrintings:observed.unresolvedPokemonPrintings,
  decksWithRecognizedBasicAbility:observed.decksWithRecognizedBasicAbility,
  decksWithoutRecognizedBasicAbility:observed.decksWithoutRecognizedBasicAbility,
  totalRecognizedBasicAbilityPhysicalCopies:
    observed.totalRecognizedBasicAbilityPhysicalCopies,
  distinctAbilityPrintings:observed.abilities.length,
  discardWindow:observed.abilities.filter(x=>x.window==='discard-self'),
  topAbilities:observed.abilities.slice(0,30).map(a=>({
    name:a.name,ability:a.ability,count:a.physicalCopies,ranks:a.ranks,
    window:a.window
  })),
  rankSummaries:observed.rows.map(x=>({
    rank:x.rank,archetype:x.archetype,basicAbilityCopies:x.basicAbilityCopies,
    nameCopies:x.basicAbilityCards.map(c=>c.name+' x'+c.physicalCopies)
  })),
  caveat:'inventory only; no actual lock or matchup game certified'
}));
