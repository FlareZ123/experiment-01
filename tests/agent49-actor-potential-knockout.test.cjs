'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {choosePotentialKnockout,VERSION}=
  require('../simulation/twinleaf/agent49-actor-potential-knockout.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const attack=(name,damage,extras={})=>({name,damage,cost:[5],
  damageCalculation:null,gxAttack:false,...extras});
const view=()=>({
  decisionKind:'owner-root',globalTurn:2,ownHand:[],
  ownTurnResources:{energyPlayedTurn:2,energyPlayLocked:false,
    pokemonPlayLocked:false},
  ownPublic:{active:{energies:['Psychic Energy MEE'],
    specialConditions:[],publicRestrictions:{},
    attacks:[attack('Setup',20),attack('Finish',60)]},
    bench:[null,null,null,null,null],
    publicTurnRestrictions:{attackLockTurnsRemaining:0}},
  opponentPublic:{active:{hp:100,damage:50}}
});
const catalog={basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}};

test('frozen common public-only scorer ranks a potential exact-base KO',()=>{
  const v=view(),moves=v.ownPublic.active.attacks;
  Object.freeze(moves);Object.freeze(v.opponentPublic.active);
  assert.equal(choosePotentialKnockout(v,moves),moves[1]);
  assert.equal(VERSION,'agent49-public-printed-potential-ko-v1');
});

test('native-neutral root opt-in changes only printed payable attack choice',()=>{
  const v=view();
  assert.deepEqual(chooseActorRootIntent(v,catalog),
    {kind:'attack',attackName:'Setup'});
  assert.deepEqual(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}),
    {kind:'attack',attackName:'Finish'});
  assert.deepEqual(chooseActorRootIntent(v,catalog,{potentialKoRoot:false}),
    {kind:'attack',attackName:'Setup'});
});

test('variable damage, lower damage, and no public foe preserve first payable',()=>{
  const v=view();
  const one=attack('First',20), dynamic=attack('Variable',300,{damageCalculation:2});
  assert.equal(choosePotentialKnockout(v,[one,dynamic]),one);
  assert.equal(choosePotentialKnockout(v,[one,attack('Other',40)]),one);
  v.opponentPublic.active=null;
  assert.equal(choosePotentialKnockout(v,[one,attack('Finish',500)]),one);
});

test('GX-first remains unchanged to avoid overriding discrete once-game tradeoff',()=>{
  const v=view();const first=attack('GX-First',20,{gxAttack:true});
  assert.equal(choosePotentialKnockout(v,[first,attack('Non-GX',80)]),first);
});

test('opponent concealed information cannot influence printed potential selection',()=>{
  const a=view(),b=view();
  a.hiddenOpponentHand=['Double Colorless Energy'];
  b.hiddenOpponentHand=['N'];
  a.hiddenOpponentPrizeOrder=[1,2];b.hiddenOpponentPrizeOrder=[2,1];
  assert.deepEqual(chooseActorRootIntent(a,catalog,{potentialKoRoot:true}),
    chooseActorRootIntent(b,catalog,{potentialKoRoot:true}));
});

test('insufficient Energy or blocked attack still yields no selected root',()=>{
  const v=view();v.ownPublic.active.energies=[];
  assert.equal(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}).kind,'pass');
  v.ownPublic.active.energies=['Psychic Energy MEE'];
  v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseActorRootIntent(v,catalog,{potentialKoRoot:true}).kind,'pass');
});
