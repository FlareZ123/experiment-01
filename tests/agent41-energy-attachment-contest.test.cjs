'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {specialFundsImmediateAttack} =
  require('../simulation/twinleaf/agent41-energy-attachment-contest.cjs');

const L = 1, C = 9;
const catalog = {
  basicEnergies:new Set(['Lightning Energy SVE','Psychic Energy SVE']),
  specialEnergies:new Set([
    'Double Colorless Energy SUM','Speed Lightning Energy RCL',
    'Capture Energy RCL','Spiky Energy JTG'
  ]),
  basicEnergyTypes:{Lightning:L,Psychic:2},
  colorlessEnergyType:C,
  specialConditions:{ASLEEP:6,PARALYZED:7}
};
const view = () => ({
  decisionKind:'owner-root',globalTurn:3,
  ownHand:['Lightning Energy SVE','Double Colorless Energy SUM'],
  ownTurnResources:{energyPlayLocked:false,specialEnergyPlayLocked:false,
    energyPlayedTurn:0},
  ownPublic:{
    publicTurnRestrictions:{attackLockTurnsRemaining:0},
    stadium:[],
    active:{energies:['Lightning Energy SVE'],
      publicRestrictions:{cannotAttackNextTurn:false},
      specialConditions:[],
      attacks:[{name:'Volt Cyclone',damage:140,cost:[L,C,C],gxAttack:false}]}
  },
  opponentPublic:{stadium:[]},
  opponentSecret:{hand:['poisoned']},
  ownUnknownDeckOrder:['poisoned']
});

test('only Special immediately funds printed attack when Basic cannot',()=>{
  const choice=specialFundsImmediateAttack(view(),catalog);
  assert.deepEqual(choice,{kind:'attach-special-energy',handIndex:1,
    printing:'Double Colorless Energy SUM',slot:'active',index:0});
});

test('preserve Basic when some printable attack already becomes payable',()=>{
  const v=view();
  v.ownPublic.active.attacks.push({name:'Thunder Burst',damage:40,
    cost:[L,L],gxAttack:false});
  assert.equal(specialFundsImmediateAttack(v,catalog),null);
});

test('quota, attack lock and unknown attached Energy fail closed',()=>{
  const changed=[
    v=>v.ownTurnResources.energyPlayLocked=true,
    v=>v.ownTurnResources.specialEnergyPlayLocked=true,
    v=>v.ownTurnResources.energyPlayedTurn=v.globalTurn,
    v=>v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1,
    v=>v.ownPublic.active.specialConditions=[catalog.specialConditions.ASLEEP],
    v=>v.ownPublic.active.energies=['Unrecognized Energy'],
    v=>v.ownPublic.active.attacks[0].gxAttack=true,
    v=>v.globalTurn=1
  ];
  for(const modify of changed){
    const v=view();modify(v);
    assert.equal(specialFundsImmediateAttack(v,catalog),null);
  }
});

test('owner-hidden-zone changes do not change chosen public action',()=>{
  const a=view(),b=view();
  b.opponentSecret={hand:['something else']};
  b.ownUnknownDeckOrder=['different'];
  assert.deepEqual(specialFundsImmediateAttack(a,catalog),
    specialFundsImmediateAttack(b,catalog));
});

test('Special cannot be given fictitious units under Temple of Sinnoh',()=>{
  const v=view();
  v.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(specialFundsImmediateAttack(v,catalog),null);
});

test('Speed Lightning supplies Lightning even to non-Lightning recipients',()=>{
  const v=view();
  v.ownHand=['Psychic Energy SVE','Speed Lightning Energy RCL'];
  v.ownPublic.active.energies=['Lightning Energy SVE'];
  v.ownPublic.active.attacks=[{name:'Double Lightning',damage:100,
    cost:[L,L],gxAttack:false}];
  v.ownPublic.active.printed={types:[catalog.basicEnergyTypes.Psychic]};
  assert.equal(specialFundsImmediateAttack(v,catalog)?.printing,
    'Speed Lightning Energy RCL');
  v.ownPublic.active.printed={types:[L]};
  assert.equal(specialFundsImmediateAttack(v,catalog)?.printing,
    'Speed Lightning Energy RCL');
});

test('already-payable printed damaging attack does not burn held Special',()=>{
  const v=view();
  v.ownPublic.active.attacks.push({name:'Spark',damage:20,cost:[L],gxAttack:false});
  assert.equal(specialFundsImmediateAttack(v,catalog),null);
});


test('rank6 Wondrous Labyrinth tax blocks false immediate DCE-funded Volt Cyclone',()=>{
  const v=view();
  v.ownPublic.active.printed={types:[L]};
  assert.equal(specialFundsImmediateAttack(v,catalog)?.printing,
    'Double Colorless Energy SUM');
  // Non-Fairy Volt Cyclone now costs L+C+C+C; attached L plus DCE
  // supplies just three total units. Neither held option pays it.
  v.ownPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  assert.equal(specialFundsImmediateAttack(v,catalog),null);
  // Without public types, the Fairy exemption cannot be certified.
  delete v.ownPublic.active.printed;
  assert.equal(specialFundsImmediateAttack(v,catalog),null);
});

test('Thunder Mountain Lightning reduction can make DCE uniquely immediate',()=>{
  const v=view();
  v.ownPublic.active.energies=[];
  v.ownPublic.active.printed={types:[L]};
  assert.equal(specialFundsImmediateAttack(v,catalog),null);
  v.ownPublic.stadium=['Thunder Mountain Prism Star LOT'];
  assert.equal(specialFundsImmediateAttack(v,catalog)?.printing,
    'Double Colorless Energy SUM');
});

test('Wondrous Labyrinth does not tax the publicly confirmed Fairy attack',()=>{
  const v=view();
  const F=8;
  const c={...catalog,
    basicEnergyTypes:{...catalog.basicEnergyTypes,Fairy:F}};
  v.ownPublic.active.printed={types:[F]};
  v.ownPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  assert.equal(specialFundsImmediateAttack(v,c)?.printing,
    'Double Colorless Energy SUM');
});

test('effective Stadium cost respects opponent public Stadium and secret invariance',()=>{
  const a=view(),b=view();
  a.ownPublic.active.printed={types:[L]};
  b.ownPublic.active.printed={types:[L]};
  a.opponentPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  b.opponentPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];
  b.opponentPrivate={hand:['different'],prizes:['other']};
  b.ownUnknownDeckOrder=['unknown'];
  assert.deepStrictEqual(specialFundsImmediateAttack(a,catalog),
    specialFundsImmediateAttack(b,catalog));
  assert.equal(specialFundsImmediateAttack(a,catalog),null);
});
