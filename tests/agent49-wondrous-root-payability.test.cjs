'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const L=4,P=5,Y=8,C=9;
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Lightning Energy SVE','Psychic Energy SVE']),
  basicEnergyTypes:{Lightning:L,Psychic:P,Fairy:Y},
  colorlessEnergyType:C,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
/**
 * Exact native-shaped detached owner observation; no unknown deck contents,
 * opposing hidden cards, or native State access.
 * @param {number[]} cost
 * @param {number[]} types
 * @param {string[]} energies
 * @param {string[]} stadium
 * @returns {object}
 */
function view(cost,types,energies,stadium=[]){
  return {
    decisionKind:'owner-root',globalTurn:3,ownHand:[],
    ownTurnResources:{
      energyPlayedTurn:3,energyPlayLocked:false,
      pokemonPlayLocked:false
    },
    ownPublic:{
      active:{name:'Iron Thorns ex',printed:{types},energies,
        attacks:[{name:'Printed Attack',cost,gxAttack:false}],
        specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],stadium,
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{stadium:[]}
  };
}

test('visible Wondrous Labyrinth prevents a false non-Fairy root attack',()=>{
  const s=view([L,C,C],[L],Array(3).fill('Lightning Energy SVE'));
  assert.deepEqual(chooseActorRootIntent(s,catalog),
    {kind:'attack',attackName:'Printed Attack'});
  s.ownPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  assert.equal(chooseActorRootIntent(s,catalog).kind,'pass');
  s.ownPublic.stadium=[];
  s.opponentPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  assert.equal(chooseActorRootIntent(s,catalog).kind,'pass');
});

test('Wondrous exemption requires confirmed public Fairy type',()=>{
  const s=view([L,C,C],[Y],Array(3).fill('Lightning Energy SVE'),
    ['Wondrous Labyrinth Prism Star TEU']);
  assert.equal(chooseActorRootIntent(s,catalog).kind,'attack');
  delete s.ownPublic.active.printed.types;
  assert.equal(chooseActorRootIntent(s,catalog).kind,'pass');
});

test('Dimension Valley publicly reduces Psychic attack cost by one Colorless',()=>{
  const s=view([P,C],[P],['Psychic Energy SVE']);
  assert.equal(chooseActorRootIntent(s,catalog).kind,'pass');
  s.ownPublic.stadium=['Dimension Valley PHF'];
  assert.equal(chooseActorRootIntent(s,catalog).kind,'attack');
});

test('Thunder Mountain publicly reduces Lightning attack cost once',()=>{
  const s=view([L,C,C],[L],
    Array(2).fill('Lightning Energy SVE'));
  assert.equal(chooseActorRootIntent(s,catalog).kind,'pass');
  s.opponentPublic.stadium=['Thunder Mountain Prism Star LOT'];
  assert.equal(chooseActorRootIntent(s,catalog).kind,'attack');
});

test('irrelevant secret zones do not change public Stadium-cost root',()=>{
  const a=view([L,C,C],[L],Array(3).fill('Lightning Energy SVE'),
    ['Wondrous Labyrinth Prism Star TEU']);
  const b=structuredClone(a);
  a.opponentPrivate={hand:['secret A'],prizes:['Prize A']};
  b.opponentPrivate={hand:['secret B'],prizes:['Prize B']};
  assert.deepEqual(chooseActorRootIntent(a,catalog),
    chooseActorRootIntent(b,catalog));
});
