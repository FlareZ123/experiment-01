'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseActorRootIntent, VERSION} =
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog = {
  basics:new Set(), abilityBasics:new Set(),
  basicEnergies:new Set(['Darkness Energy MEE','Psychic Energy MEE']),
  basicEnergyTypes:{Darkness:7,Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
function view() {
  return {decisionKind:'owner-root',globalTurn:2,
    ownHand:['Darkness Energy MEE','Psychic Energy MEE'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      pokemonPlayLocked:false},
    ownPublic:{active:{
      energies:['Psychic Energy MEE'],
      attacks:[{name:'Two Psychic',cost:[5,5],gxAttack:false}],
      specialConditions:[],publicRestrictions:{}
    },bench:[null,null,null,null,null],
    publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false}}};
}

test('default actor root is unchanged by optional frontier installation', () => {
  assert.match(VERSION,/optional-energy-frontier/);
  const a=chooseActorRootIntent(view(),catalog);
  assert.deepEqual(a,{kind:'attach-basic-energy',
    handIndex:0,printing:'Darkness Energy MEE'});
});

test('opt-in actor root chooses Psychic on a repeated Psychic requirement', () => {
  const a=chooseActorRootIntent(view(),catalog,{energyFrontier:true});
  assert.deepEqual(a,{kind:'attach-basic-energy',
    handIndex:1,printing:'Psychic Energy MEE'});
});

test('unavailable attack leaves first Basic fallback deterministic', () => {
  const v=view();
  v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  const a=chooseActorRootIntent(v,catalog,{energyFrontier:true});
  assert.equal(a.handIndex,0);
});

test('opponent hidden-card changes never affect selected owner hand index', () => {
  const first=view(),second=view();
  first.opponentSecret=['Prize 1','Hand 1'];
  second.opponentSecret=['Prize 2','Hand 2'];
  assert.deepEqual(chooseActorRootIntent(first,catalog,{energyFrontier:true}),
    chooseActorRootIntent(second,catalog,{energyFrontier:true}));
});
