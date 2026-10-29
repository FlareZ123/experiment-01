'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,CARMINE,chooseConservativeFirstCarmine}=
  require('../simulation/twinleaf/agent48-conservative-first-carmine.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  specialEnergies:new Set(),basicEnergyTypes:{},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** @param {string[]} hand @returns {object} */
function view(hand){
  return {
    actorSeat:0,decisionKind:'owner-root',globalTurn:1,ownHand:[...hand],
    ownTurnResources:{
      supporterPlayedTurn:0,supporterPlayLocked:false,itemPlayLocked:false,
      pokemonPlayLocked:false,energyPlayLocked:false,
      energyPlayedTurn:0,stadiumPlayLocked:false,stadiumPlayedTurn:0
    },
    ownPublic:{
      active:{name:'Regidrago V',energies:[],attacks:[],
        specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],deckCount:40,prizeCount:6,
      resolvingSupporter:[],publicTurnRestrictions:{supporterPlayLocked:false}
    },
    opponentPublic:{stadium:[],handCount:7},
    opponentConcealedCards:['NEVER_READ'],
    ownConcealedPrizeIdentity:['NEVER_READ']
  };
}

test('original first-player first-turn Carmine is an opt-in actor root',()=>{
  const input=view([CARMINE]);
  assert.equal(VERSION,'agent48-conservative-first-carmine-v1');
  assert.equal(chooseActorRootIntent(input,catalog).kind,'pass');
  assert.deepEqual(chooseConservativeFirstCarmine(input),{
    kind:'play-carmine-first',handIndex:0,printing:CARMINE,
    discardedDuplicateCarmines:0
  });
  assert.deepEqual(chooseActorRootIntent(input,catalog,{
    carmineFirstRoot:true
  }),chooseConservativeFirstCarmine(input));
});

test('duplicate Carmine discards are the only protected-hand exemption',()=>{
  const input=view([CARMINE,CARMINE,CARMINE]);
  const before=JSON.stringify(input);
  const expected={
    kind:'play-carmine-first',handIndex:0,printing:CARMINE,
    discardedDuplicateCarmines:2
  };
  assert.deepEqual(chooseConservativeFirstCarmine(input),expected);
  assert.deepEqual(chooseActorRootIntent(input,catalog,{
    carmineFirstRoot:true
  }),expected);
  assert.equal(JSON.stringify(input),before);
  input.ownHand=[CARMINE,'VS Seeker PHF'];
  assert.equal(chooseConservativeFirstCarmine(input),null);
  input.ownHand=[CARMINE,'Forest Seal Stone SIT'];
  assert.equal(chooseConservativeFirstCarmine(input),null);
  input.ownHand=[CARMINE,'Battle VIP Pass FST'];
  assert.equal(chooseConservativeFirstCarmine(input),null);
});

test('supporter quota, lock, hand state and native-first-turn timing',()=>{
  const input=view([CARMINE]);
  input.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseConservativeFirstCarmine(input),null);
  input.ownTurnResources.supporterPlayedTurn=0;
  input.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseConservativeFirstCarmine(input),null);
  input.ownTurnResources.supporterPlayLocked=false;
  input.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseConservativeFirstCarmine(input),null);
  input.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  input.ownPublic.deckCount=4;
  assert.equal(chooseConservativeFirstCarmine(input),null);
  input.ownPublic.deckCount=40;
  input.ownPublic.active=null;
  assert.equal(chooseConservativeFirstCarmine(input),null);
  input.ownPublic.active={name:'Regidrago V',attacks:[],energies:[]};
  input.globalTurn=2;
  assert.equal(chooseConservativeFirstCarmine(input),null);
  input.decisionKind='owner-prompt';
  assert.throws(()=>chooseConservativeFirstCarmine(input),/owner-root/);
});

test('opaque private-zone changes never affect public/own-hand selector',()=>{
  const a=view([CARMINE]);
  const b=structuredClone(a);
  b.opponentConcealedCards=['SOME SECRET'];
  b.ownConcealedPrizeIdentity=['OTHER SECRET'];
  assert.deepEqual(chooseConservativeFirstCarmine(a),
    chooseConservativeFirstCarmine(b));
});

test('the first-turn exception is restricted to exact printed Carmine',()=>{
  const a=view(['Carmine PRE']);
  assert.equal(chooseConservativeFirstCarmine(a),null);
  const b=view([CARMINE]);
  b.ownPublic.resolvingSupporter=['Carmine TWM'];
  assert.equal(chooseConservativeFirstCarmine(b),null);
  const c=view([]);
  assert.equal(chooseConservativeFirstCarmine(c),null);
});
