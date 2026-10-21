'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const glass='Powerglass SFA';
const psychic='Psychic Energy SVE';
const donor='Gengar & Mimikyu-GX TEU';
const blank=()=>({
  decisionKind:'owner-root',globalTurn:42,
  ownHand:[glass,'Powerglass SFA'],
  ownTurnResources:{
    pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
    toolPlayLocked:false,energyPlayLocked:false,energyPlayedTurn:42
  },
  ownPublic:{
    active:{printing:'Mewtwo & Mew-GX UNM',
      name:'Mewtwo & Mew-GX',tools:[],energies:[],
      attacks:[],specialConditions:[],publicRestrictions:{}},
    bench:[{printing:donor}],discard:[psychic,psychic,psychic],
    stadium:[],publicTurnRestrictions:{toolPlayLocked:false}
  },
  opponentPublic:{stadium:[],active:null,bench:[]}
});
const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set([psychic]),
  specialConditions:{ASLEEP:1,PARALYZED:2}
};
const choose=view=>chooseActorRootIntent(view,catalog,{powerglassRoot:true});

test('Mewtwo with public donor and discarded Basic Psychic equips held Powerglass',()=>{
  const intent=choose(blank());
  assert.deepEqual(intent,{kind:'equip-powerglass',
    handIndex:0,printing:glass});
  assert.equal(chooseActorRootIntent(blank(),catalog,{}).kind,'pass');
});

test('Powerglass intent stops on occupied Tool, missing Energy, missing donor or Tool lock',()=>{
  const equipped=blank();equipped.ownPublic.active.tools.push('Air Balloon SSH');
  assert.equal(choose(equipped).kind,'pass');
  const noEnergy=blank();noEnergy.ownPublic.discard.length=0;
  assert.equal(choose(noEnergy).kind,'pass');
  const noDonor=blank();noDonor.ownPublic.bench=[];noDonor.ownPublic.discard=[psychic];
  assert.equal(choose(noDonor).kind,'pass');
  const locked=blank();locked.ownTurnResources.toolPlayLocked=true;
  assert.equal(choose(locked).kind,'pass');
  const publicLock=blank();publicLock.ownPublic.publicTurnRestrictions.toolPlayLocked=true;
  assert.equal(choose(publicLock).kind,'pass');
});

test('owner-visible Powerglass play is attested by true native Tool occupancy',()=>{
  const before={handCount:5,activeToolPrintings:[]};
  const after={handCount:4,activeToolPrintings:[glass]};
  const intent={kind:'equip-powerglass',printing:glass};
  assert.equal(rootPhysicalWitness(intent,before,after,{}),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,{
    handCount:4,activeToolPrintings:[]},{}),'no-confirmed-public-effect');
});
