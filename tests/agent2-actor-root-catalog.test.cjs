'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildActorCardCatalog}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

test('native printed class catalog uses numeric CardType and SpecialCondition',()=>{
  class PokemonCard{
    constructor(fullName,stage,powers=[]){
      this.fullName=fullName;this.stage=stage;this.powers=powers;
    }
  }
  class EnergyCard{
    constructor(fullName,energyType){
      this.fullName=fullName;this.energyType=energyType;
    }
  }
  const types={
    PokemonCard,EnergyCard,Stage:{BASIC:2},EnergyType:{BASIC:0},
    PowerType:{ABILITY:2},CardType:{PSYCHIC:5,COLORLESS:9},
    SpecialCondition:{ASLEEP:2,PARALYZED:0}
  };
  const cards=[
    new PokemonCard('A',2,[{powerType:2}]),
    new PokemonCard('B',2),
    new PokemonCard('Evolution C',3),
    new EnergyCard('Psychic Energy SVE',0),
    new EnergyCard('Double Colorless Energy SUM',1)
  ];
  const catalog=buildActorCardCatalog(cards,types);
  assert.deepEqual([...catalog.basics],['A','B']);
  assert.deepEqual([...catalog.abilityBasics],['A']);
  assert.deepEqual([...catalog.basicEnergies],['Psychic Energy SVE']);
  assert.equal(catalog.basicEnergyTypes.Psychic,5);
  assert.equal(catalog.colorlessEnergyType,9);
  assert.deepEqual(catalog.specialConditions,{ASLEEP:2,PARALYZED:0});
});
