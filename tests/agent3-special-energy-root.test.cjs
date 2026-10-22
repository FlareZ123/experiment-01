'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {chooseActorRootIntent} =
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {specialEnergyUnits, missingEnergyUnits, chooseSpecialEnergyIntent} =
  require('../simulation/twinleaf/agent3-special-energy-frontier.cjs');

const {rootPhysicalWitness} =
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const catalog = {
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  specialEnergies:new Set([
    'Speed Lightning Energy RCL','Double Colorless Energy SUM',
    'Capture Energy RCL','Spiky Energy JTG','Rainbow Energy CES'
  ]),
  basicEnergyTypes:{Lightning:4,Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** @returns {object} Detached source-rank-6-shaped actor root. */
function view() {
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownHand:['Speed Lightning Energy RCL','Double Colorless Energy SUM'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      specialEnergyPlayLocked:false,stadiumPlayedTurn:0,
      pokemonPlayLocked:false},
    ownPublic:{
      active:{name:'Iron Thorns ex',energies:[],
        attacks:[{name:'Volt Cyclone',cost:[4,9,9],gxAttack:false}],
        specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false}
    },
    opponentPublic:{stadium:[]}
  };
}

test('four exact eligible printings have numeric units; unknown stays unsupported',()=>{
  assert.deepEqual(specialEnergyUnits('Speed Lightning Energy RCL',catalog),[4]);
  assert.deepEqual(specialEnergyUnits('Double Colorless Energy SUM',catalog),[9,9]);
  assert.deepEqual(specialEnergyUnits('Capture Energy RCL',catalog),[9]);
  assert.deepEqual(specialEnergyUnits('Spiky Energy JTG',catalog),[9]);
  assert.equal(specialEnergyUnits('Rainbow Energy CES',catalog),null);
  assert.equal(specialEnergyUnits('Double Colorless Energy XY',catalog),null);
  assert.deepEqual(specialEnergyUnits('Double Colorless Energy SUM',catalog,true),[9]);
  assert.deepEqual(specialEnergyUnits('Speed Lightning Energy RCL',catalog,true),[9]);
});

test('numeric repeated requirements consume distinct Energy units',()=>{
  assert.equal(missingEnergyUnits([4,9,9],[],9),3);
  assert.equal(missingEnergyUnits([4,9,9],[9,9],9),1);
  assert.equal(missingEnergyUnits([4,9,9],[9,9,4],9),0);
  assert.equal(missingEnergyUnits([5,5],[5],9),1);
  assert.equal(missingEnergyUnits([5,5],[5,5],9),0);
  assert.equal(missingEnergyUnits([5,5],[9,9],9),2);
});

test('default actor root cannot attach source-only Specials, opt-in chooses DCE',()=>{
  const v=view();
  assert.equal(chooseActorRootIntent(v,catalog).kind,'pass');
  assert.deepEqual(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}),{
    kind:'attach-special-energy',handIndex:1,printing:'Double Colorless Energy SUM'
  });
});

test('source actor takes natural second Special, then a payable attack',()=>{
  const v=view();
  v.ownPublic.active.energies=['Double Colorless Energy SUM'];
  v.ownHand=['Speed Lightning Energy RCL'];
  assert.deepEqual(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}),{
    kind:'attach-special-energy',handIndex:0,printing:'Speed Lightning Energy RCL'
  });
  v.ownHand=[];
  v.ownPublic.active.energies.push('Speed Lightning Energy RCL');
  v.ownTurnResources.energyPlayedTurn=2;
  assert.deepEqual(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}),{
    kind:'attack',attackName:'Volt Cyclone'
  });
  assert.equal(chooseActorRootIntent(v,catalog).kind,'pass');
});

test('Temple of Sinnoh strips Special effects and source lacks Lightning',()=>{
  const v=view();
  v.ownPublic.active.energies=[
    'Double Colorless Energy SUM','Speed Lightning Energy RCL'
  ];
  v.ownPublic.stadium=['Temple of Sinnoh ASR'];
  v.ownHand=[];
  v.ownTurnResources.energyPlayedTurn=2;
  assert.equal(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}).kind,'pass');
});

test('public lock, exhausted attachment, unknown Specials all fail closed',()=>{
  const v=view();
  v.ownTurnResources.specialEnergyPlayLocked=true;
  assert.equal(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}).kind,'pass');
  v.ownTurnResources.specialEnergyPlayLocked=false;
  v.ownTurnResources.energyPlayedTurn=2;
  assert.equal(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}).kind,'pass');
  v.ownTurnResources.energyPlayedTurn=0;
  v.ownHand=['Rainbow Energy CES'];
  assert.equal(chooseSpecialEnergyIntent(v,catalog),null);
});

test('opponent concealed card identities do not enter selected Special',()=>{
  const a=view(),b=view();
  a.opponentSecret=['Prize A','Hand A'];
  b.opponentSecret=['Prize B','Hand B'];
  assert.deepEqual(chooseActorRootIntent(a,catalog,{specialEnergyRoot:true}),
    chooseActorRootIntent(b,catalog,{specialEnergyRoot:true}));
});

test('zero-progress Colorless does not consume an attachment',()=>{
  const v=view();
  v.ownHand=['Double Colorless Energy SUM'];
  v.ownPublic.active.attacks=[{
    name:'Psychic Gate',cost:[5,5],gxAttack:false
  }];
  assert.equal(chooseSpecialEnergyIntent(v,catalog),null);
  assert.equal(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}).kind,
    'pass');
});

test('no printed attack leaves held Special Energy intact',()=>{
  const v=view();
  v.ownHand=['Double Colorless Energy SUM'];
  v.ownPublic.active.attacks=[];
  assert.equal(chooseSpecialEnergyIntent(v,catalog),null);
});

test('positive colored-plus-Colorless progress still attaches DCE',()=>{
  const v=view();
  v.ownHand=['Double Colorless Energy SUM'];
  v.ownPublic.active.energies=['Psychic Energy SVE'];
  v.ownPublic.active.attacks=[{
    name:'Psychic Gate',cost:[5,9,9],gxAttack:false
  }];
  const knownCatalog={...catalog,
    basicEnergies:new Set(['Psychic Energy SVE'])};
  assert.deepEqual(chooseSpecialEnergyIntent(v,knownCatalog),{
    kind:'attach-special-energy',handIndex:0,
    printing:'Double Colorless Energy SUM'
  });
});

test('native physical witness admits Special Energy with optional hand draw',()=>{
  const before={turn:2,phase:2,handCount:2,
    activeEnergies:['Speed Lightning Energy RCL']};
  const after={turn:2,phase:2,handCount:3,
    activeEnergies:['Speed Lightning Energy RCL','Double Colorless Energy SUM']};
  assert.equal(rootPhysicalWitness(
    {kind:'attach-special-energy',printing:'Double Colorless Energy SUM'},
    before,after,{FINISHED:7}),'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(
    {kind:'attach-special-energy',printing:'Spiky Energy JTG'},
    before,after,{FINISHED:7}),'no-confirmed-public-effect');
});

test('payable owner attack outranks unnecessary further Special attachment',()=>{
  const v=view();
  v.ownHand=['Spiky Energy JTG'];
  v.ownPublic.active.energies=[
    'Double Colorless Energy SUM','Speed Lightning Energy RCL'
  ];
  assert.deepEqual(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}),{
    kind:'attack',attackName:'Volt Cyclone'
  });
});

test('visible Thunder Mountain makes attached DCE pay Thorns Lightning reduction',()=>{
  const v=view();
  v.ownPublic.active.printed={types:[4]};
  v.ownPublic.stadium=['Thunder Mountain Prism Star LOT'];
  v.ownPublic.active.energies=['Double Colorless Energy SUM'];
  v.ownHand=['Speed Lightning Energy RCL'];
  assert.deepEqual(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}),{
    kind:'attack',attackName:'Volt Cyclone'
  });
  v.ownPublic.stadium=[];
  assert.deepEqual(chooseActorRootIntent(v,catalog,{specialEnergyRoot:true}),{
    kind:'attach-special-energy',handIndex:0,
    printing:'Speed Lightning Energy RCL'
  });
});
