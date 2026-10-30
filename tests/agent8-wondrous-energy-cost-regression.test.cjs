'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {effectivePublicAttackCost,publicSpecialAttackPayable}=
  require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');

const types={Lightning:4,Fairy:9};
const catalog={
  basicEnergyTypes:types,colorlessEnergyType:10,
  specialEnergies:new Set(['Double Colorless Energy SUM'])
};

function fixture(){
  const attack={name:'Volt Cyclone',cost:[4,10,10],gxAttack:false};
  const active={
    name:'Iron Thorns ex',printing:'Iron Thorns ex TWM',
    printed:{types:[types.Lightning],stage:1},
    energies:['Lightning Energy SVE','Double Colorless Energy SUM'],
    attacks:[attack]
  };
  const view={decisionKind:'owner-root',
    ownPublic:{active,stadium:[]},
    opponentPublic:{stadium:[]}};
  return {view,active,attack};
}

test('Wondrous Labyrinth adds Colorless to printed non-Fairy cost',()=>{
  const {view,active,attack}=fixture();
  assert.deepEqual(effectivePublicAttackCost(view,catalog,active,attack),
    ['L','C','C']);
  view.ownPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  assert.deepEqual(effectivePublicAttackCost(view,catalog,active,attack),
    ['L','C','C','C']);
  assert.deepEqual(attack.cost,[4,10,10]);
  assert.equal(publicSpecialAttackPayable(view,catalog,active,attack),false);
});

test('Fairy public type exempts a printed attack from Wondrous tax',()=>{
  const {view,active,attack}=fixture();
  view.ownPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  active.printed.types=[types.Fairy];
  assert.deepEqual(effectivePublicAttackCost(view,catalog,active,attack),
    ['L','C','C']);
  delete active.printed.types;
  assert.equal(effectivePublicAttackCost(view,catalog,active,attack),null);
});
