'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseKnownDeadLeadingAttack,VERSION}=
  require('../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const terminal={name:'Terminal Period',cost:[7,9],damage:0,
  text:"If your opponent's Active Pokémon has exactly 6 damage counters on it, that Pokémon is Knocked Out."};
const claw={name:'Claw of Darkness',cost:[7,7,9],damage:200,
  text:'Your opponent reveals their hand, and you discard a card you find there.'};
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Darkness Energy MEE']),
  basicEnergyTypes:{Darkness:7},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
function view(){
  return {
    decisionKind:'owner-root',globalTurn:3,ownHand:[],
    ownPublic:{
      active:{
        name:'Mega Absol ex',printing:'Mega Absol ex M1L',
        energies:['Darkness Energy MEE','Darkness Energy MEE',
          'Darkness Energy MEE'],
        attacks:[terminal,claw],specialConditions:[],
        publicRestrictions:{}
      },
      bench:[null,null,null,null,null],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{
      active:{name:'Mimikyu',printing:'Mimikyu GRI',hp:70,damage:0},
      discard:[],handCount:3,stadium:[]
    },
    ownTurnResources:{
      energyPlayLocked:false,energyPlayedTurn:3,pokemonPlayLocked:false
    }
  };
}

test('source-printed Mega Absol first-payable baseline is Terminal Period',()=>{
  assert.equal(chooseActorRootIntent(view(),catalog).attackName,
    'Terminal Period');
});
test('actor-public non-60 damage selects payable Claw of Darkness',()=>{
  assert.equal(VERSION,'agent1-actor-known-dead-leading-attack-v1');
  const decision=chooseKnownDeadLeadingAttack(view(),[terminal,claw]);
  assert.equal(decision?.attackName,'Claw of Darkness');
  assert.match(decision.reason,/exactly six/);
});
test('sixty damage counters total preserves usable exact-6 condition',()=>{
  const v=view();v.opponentPublic.active.damage=60;
  assert.equal(chooseKnownDeadLeadingAttack(v,[terminal,claw]),null);
});
test('disallowed or unpayable printed second attack cannot be chosen',()=>{
  assert.equal(chooseKnownDeadLeadingAttack(view(),[terminal]),null);
  assert.equal(chooseKnownDeadLeadingAttack(view(),[terminal,
    {...claw,damage:190}]),null);
});
test('unknown public damage and wrong printing do not invent targets',()=>{
  const v=view();v.opponentPublic.active.damage=undefined;
  assert.equal(chooseKnownDeadLeadingAttack(v,[terminal,claw]),null);
  v.opponentPublic.active.damage=0;
  v.ownPublic.active.printing='Mega Absol ex MEG';
  assert.equal(chooseKnownDeadLeadingAttack(v,[terminal,claw]),null);
});
test('Girafarig zero public discard forwards to established typed selector',()=>{
  const v=view();
  v.ownPublic.active.printing='Girafarig LOT';
  v.ownPublic.active.name='Girafarig';
  const getLost={name:'Get Lost',cost:[9],damage:0};
  const mindShock={name:'Mind Shock',cost:[9,9,9],damage:70};
  assert.equal(chooseKnownDeadLeadingAttack(v,[getLost,mindShock])?.
    attackName,'Mind Shock');
  v.opponentPublic.discard.push('Trainer Item');
  assert.equal(chooseKnownDeadLeadingAttack(v,[getLost,mindShock]),null);
});
test('opponent concealed hand count is not an attack-selector input',()=>{
  const a=view(),b=view();
  a.opponentPublic.handCount=0;b.opponentPublic.handCount=8;
  assert.deepEqual(chooseKnownDeadLeadingAttack(a,[terminal,claw]),
    chooseKnownDeadLeadingAttack(b,[terminal,claw]));
});
