'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseStrandedMarnie,VERSION}=
  require('../simulation/twinleaf/agent50-stranded-marnie-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

/** @returns {object} Detached owner-only pre-Pass fixture. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:7,
    ownHand:['Marnie SSH','Professors Letter BKT','Boost Shake EVS',
      'Garbodor BKP','Shopping Center EVS'],
    ownTurnResources:{
      supporterPlayedTurn:0,energyPlayedTurn:0,
      supporterPlayLocked:false,energyPlayLocked:false,
      pokemonPlayLocked:false
    },
    ownPublic:{
      active:{name:'Garbodor',energies:[],attacks:[
        {name:'Offensive Bomb',cost:[1,0,0,0]}],
        publicRestrictions:{},specialConditions:[],
        printed:{types:[]}},
      bench:[{name:'Oranguru V',energies:['Darkness Energy SWSH']},
        null,null,null,null],
      stadium:[],deckCount:25,
      publicTurnRestrictions:{supporterPlayLocked:false,
        attackLockTurnsRemaining:0}
    },
    opponentPublic:{stadium:[],handCount:3}
  };
}

const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  basicEnergyTypes:{Lightning:2},colorlessEnergyType:0,
  specialConditions:{ASLEEP:20,PARALYZED:21}
};

test('default actor root still passes; opt-in proposes held printed Marnie',()=>{
  const actor=view();
  assert.equal(typeof VERSION,'string');
  assert.equal(chooseActorRootIntent(actor,catalog).kind,'pass');
  assert.deepEqual(chooseStrandedMarnie(actor),{
    kind:'play-stranded-marnie',handIndex:0,printing:'Marnie SSH'
  });
  assert.deepEqual(chooseActorRootIntent(actor,catalog,{strandedMarnieRoot:true}),
    chooseStrandedMarnie(actor));
});

test('requires actual stranded board and acting-owner unspent Supporter',()=>{
  const scenarios=[
    v=>{v.ownPublic.active.energies=['Psychic Energy SWSH'];},
    v=>{v.ownPublic.bench[0].energies=[];},
    v=>{v.ownTurnResources.supporterPlayedTurn=1;},
    v=>{v.ownTurnResources.supporterPlayLocked=true;},
    v=>{v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;},
    v=>{v.ownHand[0]='Guzma BUS';},
    v=>{v.ownHand.push('Crobat V DAA');},
    v=>{v.ownPublic.deckCount=0;},
    v=>{v.globalTurn=1;}
  ];
  for(const mutate of scenarios){
    const actor=view();mutate(actor);
    assert.equal(chooseStrandedMarnie(actor),null);
  }
});

test('owner hand printing index remains exact and stronger root takes priority',()=>{
  const actor=view();
  actor.ownHand=['Professors Letter BKT','Marnie SSH'];
  assert.equal(chooseStrandedMarnie(actor)?.handIndex,1);
  actor.ownHand.unshift('Pidgey OBF');
  const advanced={...catalog,basics:new Set(['Pidgey OBF'])};
  assert.deepEqual(chooseActorRootIntent(actor,advanced,{strandedMarnieRoot:true}),{
    kind:'bench-basic',handIndex:0,benchIndex:1,printing:'Pidgey OBF'
  });
});

test('only actor counts are needed; unknown identities never supplied',()=>{
  const actor=view();
  assert.equal(Object.hasOwn(actor,'deck'),false);
  assert.equal(Object.hasOwn(actor,'prizes'),false);
  assert.equal(Object.hasOwn(actor.opponentPublic,'hand'),false);
  assert.equal(chooseStrandedMarnie(actor)?.kind,'play-stranded-marnie');
});


test('Marnie physical Supporter receipt is publicly verifiable',()=>{
  const {rootPhysicalWitness}=require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
  const intent={kind:'play-stranded-marnie',printing:'Marnie SSH'};
  assert.equal(rootPhysicalWitness(intent,{marnieSpent:0,supporterTurn:0},
    {marnieSpent:1,supporterTurn:7},{}),'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,{marnieSpent:0,supporterTurn:0},
    {marnieSpent:0,supporterTurn:7},{}),'no-confirmed-public-effect');
});
