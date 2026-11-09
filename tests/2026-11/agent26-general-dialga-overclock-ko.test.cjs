'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {choosePotentialKnockout}=require('../../simulation/twinleaf/agent49-actor-potential-knockout.cjs');
const {chooseActorRootIntent}=require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

function view(){
  return {decisionKind:'owner-root',globalTurn:53,ownHand:[],
    ownTurnResources:{energyPlayedTurn:53,energyPlayLocked:false,
      pokemonPlayLocked:false},
    ownPublic:{
      active:{name:'Dialga-GX',printing:'Dialga-GX UPR',
        energies:['Fire Energy MEE','Fire Energy MEE',
          'Double Dragon Energy ROS'],
        specialConditions:[],publicRestrictions:{},
        printed:{types:[10]},
        attacks:[
          {name:'Overclock',damage:0,cost:[8],damageCalculation:null,
            gxAttack:false},
          {name:'Shred',damage:80,cost:[8,9,9],damageCalculation:null,
            gxAttack:false},
          {name:'Timeless-GX',damage:150,cost:[8,8,8,9,9],
            gxAttack:true}
        ]},
      bench:[null,null,null,null,null],
      stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{active:{name:'Unown',printing:'Unown AOR',
      hp:60,damage:0,printed:{types:[12],weakness:[],resistance:[]}},
      stadium:[]}};
}
function catalog(){
  return {basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(['Fire Energy MEE']),
    specialEnergies:new Set(['Double Dragon Energy ROS']),
    dragonPokemonPrintings:new Set(['Dialga-GX UPR']),
    basicEnergyTypes:{Fire:2,Metal:8},colorlessEnergyType:9,
    specialConditions:{ASLEEP:2,PARALYZED:0}};
}

test('generic owner policy chooses printed Shred 80 over draw-only Overclock for lethal 60HP',()=>{
  const v=view(),c=catalog();
  assert.equal(choosePotentialKnockout(v,v.ownPublic.active.attacks).name,'Shred');
  assert.deepEqual(chooseActorRootIntent(v,c),
    {kind:'attack',attackName:'Overclock'});
  assert.deepEqual(chooseActorRootIntent(v,c,{potentialKoRoot:true}),
    {kind:'attack',attackName:'Shred'});
});

test('draw-only Overclock remains favored when the later attack cannot KO',()=>{
  const v=view();v.opponentPublic.active.hp=140;
  assert.deepEqual(chooseActorRootIntent(v,catalog(),{potentialKoRoot:true}),
    {kind:'attack',attackName:'Overclock'});
});

test('one missing special unit or non-Dragon context cannot falsely fund Shred',()=>{
  const v=view();
  v.ownPublic.active.energies.splice(2,1);
  assert.deepEqual(chooseActorRootIntent(v,catalog(),{potentialKoRoot:true}),
    {kind:'attack',attackName:'Overclock'});
  const b=view();const c=catalog();c.dragonPokemonPrintings.clear();
  assert.deepEqual(chooseActorRootIntent(b,c,{potentialKoRoot:true}),
    {kind:'attack',attackName:'Overclock'});
});

test('other setup attacks and unresolved variable damage retain existing discretion',()=>{
  const v=view();
  v.ownPublic.active.printing='Other Attack Setup';
  assert.equal(choosePotentialKnockout(v,v.ownPublic.active.attacks).name,
    'Overclock');
  v.ownPublic.active.printing='Dialga-GX UPR';
  v.ownPublic.active.attacks[0].damageCalculation=2;
  assert.equal(choosePotentialKnockout(v,v.ownPublic.active.attacks).name,
    'Overclock');
});

test('opponent concealed hand or Prize permutations cannot affect printed KO action',()=>{
  const v=view(),w=view();
  v.opponentHiddenHand=['A'];w.opponentHiddenHand=['B'];
  v.opponentPrizePositions=[1,2];w.opponentPrizePositions=[2,1];
  assert.deepEqual(chooseActorRootIntent(v,catalog(),{potentialKoRoot:true}),
    chooseActorRootIntent(w,catalog(),{potentialKoRoot:true}));
});
