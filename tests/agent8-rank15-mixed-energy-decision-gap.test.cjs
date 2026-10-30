'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const field=require('../results/aichi-2026/full-decklists.json');
const {specialFundsImmediateAttack}=
  require('../simulation/twinleaf/agent41-energy-attachment-contest.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const C=9;

/**
 * Authentic source-60 card identities, plus a synthetic stationary Mega
 * Lopunny board. No claim that an observed Aichi game reached this board.
 * Native attack effects, movement history and the opponent are unmodeled.
 */
function rank15Fixture(){
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownHand:['Grass Energy MEE','Double Colorless Energy SUM'],
    ownTurnResources:{pokemonPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false,energyPlayedTurn:0},
    ownPublic:{
      bench:[null,null,null,null,null],stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0},
      active:{name:'Mega Lopunny ex',printing:'Mega Lopunny ex PFL',
        energies:[],specialConditions:[],publicRestrictions:{},
        attacks:[
          {name:'Gale Thrust',damage:60,cost:[C],gxAttack:false},
          {name:'Spiky Hopper',damage:160,cost:[C,C],gxAttack:false}
        ]}
    },opponentPublic:{stadium:[]}
  };
}

const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Grass Energy MEE']),
  specialEnergies:new Set(['Double Colorless Energy SUM']),
  basicEnergyTypes:{Grass:1},colorlessEnergyType:C,
  specialConditions:{ASLEEP:6,PARALYZED:7}
};

test('exact rank15 original sixty contains the competing Grass and DCE printings',()=>{
  const source=field.decks.find(deck=>deck.rank===15);
  assert.equal(source.player,'Ryotaro Nozawa');
  assert.equal(source.cards.reduce((n,card)=>n+card.count,0),60);
  const card=(name)=>source.cards.find(item=>item.name===name);
  assert.equal(card('Grass Energy').count,2);
  assert.equal(card('Grass Energy').printing.set,'MEE');
  assert.equal(card('Double Colorless Energy').count,1);
  assert.equal(card('Double Colorless Energy').printing.set,'SUM');
  assert.equal(card('Mega Lopunny ex').count,2);
  assert.equal(card('Mega Lopunny ex').printing.set,'PFL');
});

test('source-plausible Lopunny one-Energy versus two-Energy damage-axis remains unmodeled',()=>{
  const view=rank15Fixture();
  const opts={contestedEnergyRoot:true,specialEnergyRoot:true};
  // The scorer intentionally preserves Basic whenever ANY printed attack
  // becomes payable. Here that means Gale Thrust (60), despite DCE
  // offering the distinct printed 160-damage Spiky Hopper immediately.
  assert.equal(specialFundsImmediateAttack(view,catalog),null);
  const selected=chooseActorRootIntent(view,catalog,opts);
  assert.equal(selected.kind,'attach-basic-energy');
  assert.equal(selected.printing,'Grass Energy MEE');
  // On a turn when Lopunny moved from Bench, Gale Thrust's printed +170
  // condition may reverse a naive damage ranking. This fixture cannot
  // certify the best attachment in a real game.
});
