'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {choosePublicFlexibleImmediateAttackEnergy:choose}=
  require('../simulation/twinleaf/agent41-public-flexible-energy-contest.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const G=1,R=2,L=4,P=5,C=10;
const catalog={
  basicEnergyTypes:{Grass:G,Fire:R,Water:3,Lightning:L,Psychic:P,
    Fighting:6,Darkness:7,Metal:8,Fairy:9},
  colorlessEnergyType:C,stages:{BASIC:1,STAGE_1:2},
  specialConditions:{ASLEEP:6,PARALYZED:7},
  basicEnergies:new Set(['Grass Energy SVE','Fire Energy SVE',
    'Psychic Energy SVE']),
  specialEnergies:new Set(['Double Dragon Energy ROS',
    'Reversal Energy PAL','Unit Energy LPM UPR','Counter Energy CIN']),
  dragonPokemonPrintings:new Set(['Regidrago V SIT']),
  basics:new Set(),abilityBasics:new Set()
};
function view(){
  return {
    decisionKind:'owner-root',globalTurn:3,
    ownHand:['Grass Energy SVE','Double Dragon Energy ROS'],
    ownTurnResources:{
      pokemonPlayLocked:false,energyPlayLocked:false,
      specialEnergyPlayLocked:false,energyPlayedTurn:0
    },
    ownPublic:{
      active:{
        name:'Regidrago V',printing:'Regidrago V SIT',
        printed:{stage:1,types:[3]},energies:['Fire Energy SVE'],
        publicRestrictions:{},specialConditions:[],
        attacks:[{name:'Dragon Laser',damage:130,cost:[G,R,C],gxAttack:false}]
      },
      bench:[null,null,null,null,null],
      prizeCount:6,stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{stadium:[],prizeCount:6}
  };
}
const expected={kind:'attach-special-energy',handIndex:1,
  printing:'Double Dragon Energy ROS',slot:'active',index:0};

test('Double Dragon is an immediate original Dragon attack over held Basic',()=>{
  const v=view();
  assert.deepEqual(choose(v,catalog),expected);
  assert.equal(chooseActorRootIntent(v,catalog,{
    publicContextSpecialEnergy:true}).kind,'attach-basic-energy');
  assert.deepEqual(chooseActorRootIntent(v,catalog,{
    publicContextSpecialEnergy:true,
    publicFlexibleEnergyContest:true}),expected);
  v.ownHand=['Grass Energy SVE'];
  v.ownPublic.active.energies.push('Double Dragon Energy ROS');
  v.ownTurnResources.energyPlayedTurn=3;
  assert.deepEqual(chooseActorRootIntent(v,catalog,{
    publicContextSpecialEnergy:true,
    publicFlexibleEnergyContest:true}),{
    kind:'attack',attackName:'Dragon Laser'
  });
});

test('preserve Basic whenever ANY eligible damaging attack becomes payable',()=>{
  const v=view();
  v.ownPublic.active.attacks.push({name:'One grass',
    damage:20,cost:[R,G],gxAttack:false});
  assert.equal(choose(v,catalog),null);
});

test('never displace a currently payable printed attack',()=>{
  const v=view();
  v.ownPublic.active.attacks.push({name:'Fire Start',
    damage:20,cost:[R],gxAttack:false});
  assert.equal(choose(v,catalog),null);
});

test('Temple, Wondrous, Dragon identity, unknown attached and first-turn veto',()=>{
  const changes=[
    v=>v.ownPublic.stadium=['Temple of Sinnoh ASR'],
    v=>v.ownPublic.stadium=['Wondrous Labyrinth Prism Star TEU'],
    v=>v.ownPublic.active.printing='Pikachu UPR',
    v=>v.ownPublic.active.energies=['Unmodeled Potential Energy'],
    v=>v.globalTurn=1,
    v=>v.ownTurnResources.energyPlayLocked=true,
    v=>v.ownTurnResources.specialEnergyPlayLocked=true,
    v=>v.ownTurnResources.energyPlayedTurn=3,
    v=>v.ownPublic.active.specialConditions=[catalog.specialConditions.ASLEEP],
    v=>v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true,
    v=>v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1
  ];
  for(const modify of changes){
    const v=view();modify(v);
    assert.equal(choose(v,catalog),null);
  }
});

test('Reversal is three exact units only behind on Prizes with known non-Rule-Box evolution',()=>{
  const v=view();
  v.ownHand=['Psychic Energy SVE','Reversal Energy PAL'];
  v.ownPublic.active={
    name:'Alolan Raichu',printing:'Alolan Raichu UNM',
    printed:{stage:2,types:[L]},energies:[],
    publicRestrictions:{},specialConditions:[],
    attacks:[{name:'Three Psychic',damage:100,cost:[P,P,P],gxAttack:false}]
  };
  const profile={...catalog,publicPokemonProfileIndex:new Map([[
    'Alolan Raichu UNM',{isEvolution:true,hasRuleBox:false,
      isPokemonGX:false,isPokemonEX:false}
  ]])};
  v.ownPublic.prizeCount=6;
  v.opponentPublic.prizeCount=4;
  assert.deepEqual(choose(v,profile),{
    kind:'attach-special-energy',handIndex:1,
    printing:'Reversal Energy PAL',slot:'active',index:0
  });
  v.opponentPublic.prizeCount=6;
  assert.equal(choose(v,profile),null);
});

test('one Unit LPM can fund a colored attack when held Basic is wrong color',()=>{
  const v=view();
  v.ownPublic.active.energies=[];
  v.ownPublic.active.attacks=[{name:'Thunder Shock',damage:40,
    cost:[L],gxAttack:false}];
  v.ownHand=['Grass Energy SVE','Unit Energy LPM UPR'];
  assert.deepEqual(choose(v,catalog),{
    kind:'attach-special-energy',handIndex:1,
    printing:'Unit Energy LPM UPR',slot:'active',index:0
  });
});

test('opponent hidden cards, own unseen deck order and duplicate aliases are inert',()=>{
  const a=view(),b=structuredClone(a);
  b.opponentSecret={prizes:['different'],hand:['unseen opponent card']};
  b.ownDeckContents=['hidden card'];
  assert.deepEqual(choose(a,catalog),choose(b,catalog));
});

test('no future attack projected from zero-damage copied-attack cards',()=>{
  const v=view();
  v.ownPublic.active.attacks=[{name:'Apex Dragon',
    damage:0,cost:[G,R,C],gxAttack:false}];
  assert.equal(choose(v,catalog),null);
});
