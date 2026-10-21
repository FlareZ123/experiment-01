'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const DARK=7,COLORLESS=9;
const catalog={
  basics:new Set(),abilityBasics:new Set(),evolutions:new Map(),
  basicEnergies:new Set(['Darkness Energy MEE']),
  basicEnergyTypes:{Darkness:DARK},colorlessEnergyType:COLORLESS,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** @returns {object} Detached player-observation fixture, never a Store State. */
function actorView(){
  return {
    decisionKind:'owner-root',globalTurn:3,ownHand:[],
    ownTurnResources:{pokemonPlayLocked:false,energyPlayLocked:false,
      energyPlayedTurn:3,stadiumPlayLocked:false},
    ownPublic:{
      active:{name:'Mega Absol ex',printing:'Mega Absol ex M1L',
        energies:Array(3).fill('Darkness Energy MEE'),specialConditions:[],
        publicRestrictions:{},printed:{types:[DARK]},
        attacks:[
          {name:'Terminal Period',cost:[DARK,COLORLESS],damage:0},
          {name:'Claw of Darkness',cost:[DARK,DARK,COLORLESS],damage:200}
        ]},
      bench:Array(5).fill(null),stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:{name:'Mimikyu',damage:0,hp:70},
      handCount:2,discard:[],stadium:[]}
  };
}
const attack=(view,options)=>chooseActorRootIntent(view,catalog,options);

test('default root still announces first-payable Terminal Period',()=>{
  assert.deepEqual(attack(actorView(),{}),
    {kind:'attack',attackName:'Terminal Period'});
});
test('explicit known-dead opt-in announces cost-payable Claw',()=>{
  assert.deepEqual(attack(actorView(),{knownDeadAttackRoot:true}),
    {kind:'attack',attackName:'Claw of Darkness'});
});
test('exactly 60 damage retains conditional Terminal Period',()=>{
  const v=actorView();v.opponentPublic.active.damage=60;
  assert.equal(attack(v,{knownDeadAttackRoot:true}).attackName,
    'Terminal Period');
});
test('unpayable second attack cannot be selected by selector',()=>{
  const v=actorView();v.ownPublic.active.energies.pop();
  assert.equal(attack(v,{knownDeadAttackRoot:true}).attackName,
    'Terminal Period');
});
test('wrong print and unknown public damage retain original selection',()=>{
  const v=actorView();v.ownPublic.active.printing='Mega Absol ex OTHER';
  assert.equal(attack(v,{knownDeadAttackRoot:true}).attackName,
    'Terminal Period');
  v.ownPublic.active.printing='Mega Absol ex M1L';
  delete v.opponentPublic.active.damage;
  assert.equal(attack(v,{knownDeadAttackRoot:true}).attackName,
    'Terminal Period');
});
test('Girafarig optional branch prevents empty-discard Get Lost',()=>{
  const v=actorView();
  v.ownPublic.active.name='Girafarig';
  v.ownPublic.active.printing='Girafarig LOT';
  v.ownPublic.active.attacks=[
    {name:'Get Lost',cost:[COLORLESS],damage:0},
    {name:'Mind Shock',cost:[COLORLESS,COLORLESS,COLORLESS],damage:70}
  ];
  assert.equal(attack(v,{}).attackName,'Get Lost');
  assert.equal(attack(v,{knownDeadAttackRoot:true}).attackName,
    'Mind Shock');
  v.opponentPublic.discard.push('Item SVI');
  assert.equal(attack(v,{knownDeadAttackRoot:true}).attackName,
    'Get Lost');
});
test('opponent concealed hand size does not influence either option',()=>{
  const a=actorView(),b=actorView();
  a.opponentPublic.handCount=0;b.opponentPublic.handCount=13;
  for(const flag of [false,true]){
    assert.deepEqual(attack(a,{knownDeadAttackRoot:flag}),
      attack(b,{knownDeadAttackRoot:flag}));
  }
});
test('other printed attack restrictions are applied before selection',()=>{
  const v=actorView();
  v.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn=
    'Claw of Darkness';
  assert.equal(attack(v,{knownDeadAttackRoot:true}).attackName,
    'Terminal Period');
});
