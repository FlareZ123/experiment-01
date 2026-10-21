'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseStrandedGuzma,VERSION}=
  require('../simulation/twinleaf/agent50-stranded-guzma-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Darkness Energy MEE']),
  basicEnergyTypes:{Psychic:3,Darkness:2},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:10,PARALYZED:11}
};

/** @returns {object} Source-agnostic detached actor's owner-visible state. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:9,
    ownHand:['Marnie SSH','Guzma BUS','Temple of Sinnoh ASR'],
    ownTurnResources:{supporterPlayedTurn:7,
      supporterPlayLocked:false,pokemonPlayLocked:false,
      energyPlayedTurn:9,energyPlayLocked:false},
    ownPublic:{
      active:{name:'Garbodor',printing:'Garbodor BKP',
        energies:['Darkness Energy MEE'],attacks:[
          {name:'Offensive Bomb',damage:60,cost:[3,9,9,9],
            gxAttack:false}],specialConditions:[],publicRestrictions:{},
        printed:{retreatCost:[9,9,9]}},
      bench:[{name:'Oranguru V',printing:'Oranguru V ASR',
        energies:['Darkness Energy MEE'],attacks:[]},
        {name:'Crobat V',printing:'Crobat V DAA',
          energies:[],attacks:[]},null,null,null],
      stadium:[],deckCount:21,publicTurnRestrictions:{}
    },
    opponentPublic:{active:{name:'Galarian Articuno V',energies:[]},
      bench:[{name:'Mewtwo & Mew-GX',energies:[]},null,null],
      stadium:[]}
  };
}

test('held Guzma becomes actor-only optional pivot at exhausted source root',()=>{
  const v=view();
  assert.match(VERSION,/agent50/);
  assert.equal(chooseActorRootIntent(v,catalog).kind,'pass');
  assert.deepEqual(chooseStrandedGuzma(v,catalog),{
    kind:'play-stranded-guzma',handIndex:1,printing:'Guzma BUS'});
  assert.deepEqual(chooseActorRootIntent(v,catalog,{strandedGuzmaRoot:true}),
    chooseStrandedGuzma(v,catalog));
});

test('Supporter quota, real own Bench and opponent Bench constrain pivot',()=>{
  const changes=[
    v=>{v.ownTurnResources.supporterPlayedTurn=9;},
    v=>{v.ownTurnResources.supporterPlayLocked=true;},
    v=>{v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;},
    v=>{v.ownPublic.bench[0].energies=[];},
    v=>{v.opponentPublic.bench=[null];},
    v=>{v.ownHand.splice(1,1);},
    v=>{v.globalTurn=1;},
    v=>{v.ownPublic.active.attacks[0].cost=[2];}
  ];
  for(const change of changes){
    const v=view();change(v);
    assert.equal(chooseStrandedGuzma(v,catalog),null);
  }
});

test('does not inspect opponent concealed cards or unseen own deck',()=>{
  const a=view(),b=view();
  Object.defineProperty(a,'opponentHand',{get(){
    throw new Error('Hidden-zone read rejected');
  }});
  Object.defineProperty(a,'ownDeck',{get(){
    throw new Error('Unknown deck read rejected');
  }});
  b.opponentHand=['secret'];b.ownDeck=['hidden'];
  assert.deepEqual(chooseStrandedGuzma(a,catalog),
    chooseStrandedGuzma(b,catalog));
});

test('native public receipt requires spent Guzma and consumed Supporter turn',()=>{
  const intent={kind:'play-stranded-guzma',printing:'Guzma BUS'};
  const before={supporterTurn:7,guzmaSpent:0};
  assert.equal(rootPhysicalWitness(intent,before,
    {supporterTurn:9,guzmaSpent:1},{}),'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,
    {supporterTurn:9,guzmaSpent:0},{}),'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,
    {supporterTurn:7,guzmaSpent:1},{}),'no-confirmed-public-effect');
});
