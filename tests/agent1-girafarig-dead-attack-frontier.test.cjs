'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseGirafarigAttackWhenDiscardEmpty,VERSION}=
  require('../simulation/twinleaf/agent1-girafarig-dead-attack-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const zero={name:'Get Lost',cost:[9],damage:0,text:
  "Put 2 cards from your opponent's discard pile in the Lost Zone."};
const damage={name:'Mind Shock',cost:[9,9,9],damage:70,
  text:"This attack's damage isn't affected by Weakness or Resistance."};
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** @returns {object} Detached only-owner-hand and public-board state. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:3,ownHand:[],
    ownPublic:{
      active:{printing:'Girafarig LOT',name:'Girafarig',
        energies:['Psychic Energy MEE','Psychic Energy MEE',
          'Psychic Energy MEE'],
        attacks:[zero,damage],specialConditions:[],
        publicRestrictions:{}},
      bench:[null,null,null,null,null],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{
      active:{printing:'Mimikyu GRI',hp:70,damage:0},
      discard:[],stadium:[],handCount:5
    },
    ownTurnResources:{
      pokemonPlayLocked:false,energyPlayLocked:false,energyPlayedTurn:3
    }
  };
}

test('baseline chooses printed first attack despite three paid energies',()=>{
  assert.equal(chooseActorRootIntent(view(),catalog).attackName,'Get Lost');
});
test('owner-visible target-free Get Lost has payable printed damage alternative',()=>{
  const v=view();
  assert.equal(VERSION,'agent1-owner-visible-girafarig-empty-discard-attack-v1');
  assert.equal(chooseGirafarigAttackWhenDiscardEmpty(v,[zero,damage]),
    'Mind Shock');
});
test('preserves printed priority when opponent discard has cards',()=>{
  const v=view();v.opponentPublic.discard=['Item FST'];
  assert.equal(chooseGirafarigAttackWhenDiscardEmpty(v,[zero,damage]),null);
});
test('preserves selection without a paid three-colorless alternative',()=>{
  assert.equal(chooseGirafarigAttackWhenDiscardEmpty(view(),[zero]),null);
});
test('requires exact printed Girafarig and confirmed printed Mind Shock',()=>{
  const v=view();v.ownPublic.active.printing='Girafarig XYZ';
  assert.equal(chooseGirafarigAttackWhenDiscardEmpty(v,[zero,damage]),null);
  v.ownPublic.active.printing='Girafarig LOT';
  assert.equal(chooseGirafarigAttackWhenDiscardEmpty(v,[zero,
    {...damage,damage:60}]),null);
});
test('refuses missing public opponent discard/active details',()=>{
  const v=view();delete v.opponentPublic.discard;
  assert.equal(chooseGirafarigAttackWhenDiscardEmpty(v,[zero,damage]),null);
  v.opponentPublic.discard=[];v.opponentPublic.active=null;
  assert.equal(chooseGirafarigAttackWhenDiscardEmpty(v,[zero,damage]),null);
});
test('opponent hidden-hand identity cannot change actor-visible choice',()=>{
  const a=view(),b=view();
  a.opponentPublic.handCount=2;b.opponentPublic.handCount=8;
  assert.equal(chooseGirafarigAttackWhenDiscardEmpty(a,[zero,damage]),
    chooseGirafarigAttackWhenDiscardEmpty(b,[zero,damage]));
});
