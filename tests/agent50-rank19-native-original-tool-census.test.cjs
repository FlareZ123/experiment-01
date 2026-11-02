'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {publicOwnerBoard}=require(
  '../simulation/twinleaf/agent28-rank19-native-source-root-readonly.cjs');

/**
 * Native PokemonCardList.tools is an array of Tool objects, while its
 * energies are under .energies.cards. The old observer incorrectly used
 * .tools.cards, silently manufacturing zero attached-Tool observations.
 */
test('rank19 original source census observes actual native Tool array',()=>{
  const card=fullName=>({fullName});
  const slot=(name,energies=[],tools=[])=>({
    getPokemonCard:()=>name?card(name):null,
    energies:{cards:energies.map(card)},
    tools:tools.map(card)
  });
  const owner={
    active:slot('Ho-Oh EX DRX',[],['Float Stone BKT']),
    bench:[slot('Raging Bolt ex TEF',['Double Dragon Energy ROS'])]
  };
  const view=publicOwnerBoard(owner);
  assert.equal(view.activePrinting,'Ho-Oh EX DRX');
  assert.deepEqual(view.activeTools,['Float Stone BKT']);
  assert.deepEqual(view.activeEnergy,[]);
  assert.deepEqual(view.bench[0].attachedEnergy,
    ['Double Dragon Energy ROS']);
});
test('empty tool array is represented as empty list',()=>{
  const owner={
    active:{getPokemonCard:()=>({fullName:'Ho-Oh EX DRX'}),
      energies:{cards:[]},tools:[]},
    bench:[]
  };
  assert.deepEqual(publicOwnerBoard(owner).activeTools,[]);
});
