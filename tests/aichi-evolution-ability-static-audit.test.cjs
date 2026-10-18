'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {inspectSource, publishedPokemon} =
  require('../scripts/aichi-evolution-ability-static-audit.cjs');

test('Herdier-style unguarded source is an evolution Ability research lead',()=>{
  const source = [
    "export class Herdier extends PokemonCard {",
    "public set = 'SUM';",
    "public setNumber = '104';",
    "public fullName = 'Herdier SUM';",
    "public evolvesFrom = 'Lillipup';",
    "public powers = [{ powerType: PowerType.ABILITY }];",
    "reduceEffect(store, state, effect) {",
    "if (effect instanceof EvolveEffect && effect.pokemonCard === this) {",
    " return store.prompt(state, new ChooseCardsPrompt());",
    "}",
    "}"
  ].join('\n');
  const row = inspectSource(source,'sets/herdier.ts');
  assert.equal(row.printing,'SUM/104');
  assert.equal(row.fullName,'Herdier SUM');
  assert.equal(row.evolvesFrom,'Lillipup');
  assert.equal(row.hasAbility,true);
  assert.equal(row.handlesEvolveEffect,true);
  assert.equal(row.directBlockCheck,false);
  const corrected = inspectSource(
    source.replace('return store.prompt',
      'if (IS_ABILITY_BLOCKED(store,state,player,this,this.powers[0])) return state;\nreturn store.prompt'),
    'sets/herdier.ts');
  assert.equal(corrected.directBlockCheck,true);
  assert.equal(corrected.sourceHash===row.sourceHash,false);
});

test('Text-only import does not qualify as an EvolveEffect branch',()=>{
  const source = [
    "public set = 'TEST';",
    "public setNumber = '77';",
    "public powers = [{powerType: PowerType.ABILITY}];",
    "import {EvolveEffect} from './effects';",
    "if (effect instanceof PlayPokemonEffect) {}"
  ].join('\n');
  const row = inspectSource(source,'card.ts');
  assert.equal(row.hasAbility,true);
  assert.equal(row.handlesEvolveEffect,false);
});

test('Field census preserves ranks, multiple copies and printing ID',()=>{
  const field = {
    decks:[
      {rank:2,cards:[{category:'Pokémon',name:'Herdier',count:1,
        printing:{set:'SUM',number:'104'}}]},
      {rank:15,cards:[{category:'Pokémon',name:'Herdier',count:2,
        printing:{set:'SUM',number:'104'}},
        {category:'Trainer',name:'Switch',count:3,
          printing:{set:'SVI',number:'194'}}]}
    ]
  };
  const census = publishedPokemon(field);
  assert.equal(census.size,1);
  assert.deepEqual(census.get('SUM/104').ranks,[2,15]);
  assert.equal(census.get('SUM/104').totalCopies,3);
});
