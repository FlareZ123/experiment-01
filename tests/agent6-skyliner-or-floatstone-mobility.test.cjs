'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerSkylinerRondoRetreat}=
  require('../simulation/twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs');
const {choosePublicLockGuardedSkylinerRondoRetreat}=
  require('../simulation/twinleaf/agent6-skyliner-ability-suppression-guard.cjs');
const {VERSION,chooseSkylinerOrFloatStoneRondoRetreat}=
  require('../simulation/twinleaf/agent6-skyliner-or-floatstone-mobility.cjs');

const psychic='Psychic Energy MEE';
const catalog={basicEnergies:new Set([psychic]),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:11,PARALYZED:12}};

function view(){
  return {
    decisionKind:'owner-root',globalTurn:12,ownHand:[],
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{
      active:{printing:'Latias ex SSP',name:'Latias ex',
        abilities:['Skyliner'],energies:[],tools:[],
        attacks:[{name:'Eon Blade',damage:200,cost:[5,5,9]}],
        publicRestrictions:{},specialConditions:[]},
      bench:[{
        printing:"Lillie's Clefairy ex JTG",
        energies:[psychic,psychic],
        attacks:[{name:'Full Moon Rondo',cost:[5,9],damage:20}],
        publicRestrictions:{},specialConditions:[]
      },{printing:'Pidgey MEW'},null,null,null],
      stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:{printing:'Duskull VIV',hp:60,damage:0,
      abilities:[],tools:[]},bench:[null,null,null,null,null],
      stadium:[]}
  };
}

test('no lock: unchanged v2 source fallback, no Float Stone required',()=>{
  const state=view();
  const old=chooseOwnerSkylinerRondoRetreat(state,catalog);
  assert.deepEqual(chooseSkylinerOrFloatStoneRondoRetreat(state,catalog),old);
  assert.equal(VERSION,'agent6-skyliner-or-floatstone-owner-mobility-v1');
});

test('Path blocks Skyliner; an already attached Float Stone restores zero-cost line',()=>{
  const state=view();
  state.opponentPublic.stadium=['Path to the Peak CRE'];
  assert.equal(choosePublicLockGuardedSkylinerRondoRetreat(
    state,catalog),null);
  assert.equal(chooseSkylinerOrFloatStoneRondoRetreat(state,catalog),null);
  state.ownPublic.active.tools=['Float Stone BKT'];
  const chosen=chooseSkylinerOrFloatStoneRondoRetreat(state,catalog);
  assert.equal(chosen?.kind,'skyliner-rondo-retreat');
  assert.equal(chosen?.mobilitySource,'float-stone-bkt');
  assert.equal(chosen?.underlyingSkylinerBlock,
    'path-to-peak-rule-box-ability-lock');
});

test('Tool Jammer on opponent Active nullifies the Float Stone workaround',()=>{
  const state=view();
  state.ownPublic.active.tools=['Float Stone BKT'];
  state.opponentPublic.stadium=['Path to the Peak CRE'];
  state.opponentPublic.active.tools=['Tool Jammer BST'];
  assert.equal(chooseSkylinerOrFloatStoneRondoRetreat(state,catalog),null);
  state.opponentPublic.active.tools=[];
  assert.equal(chooseSkylinerOrFloatStoneRondoRetreat(
    state,catalog)?.mobilitySource,'float-stone-bkt');
});

test('Jamming Tower blocks Float Stone; equipped Garbotoxin keeps Skyliner off',()=>{
  const state=view();
  state.ownPublic.active.tools=['Float Stone BKT'];
  state.opponentPublic.stadium=['Jamming Tower TWM'];
  state.opponentPublic.bench[0]={printing:'Garbodor BKP',
    abilities:['Garbotoxin'],tools:['Float Stone BKT']};
  assert.equal(chooseSkylinerOrFloatStoneRondoRetreat(state,catalog),null);
  state.opponentPublic.stadium=[];
  assert.equal(chooseSkylinerOrFloatStoneRondoRetreat(
    state,catalog)?.mobilitySource,'float-stone-bkt');
});

test('no hidden cards can be inspected to rescue the alternative',()=>{
  const state=view();
  state.ownPublic.active.tools=['Float Stone BKT'];
  state.opponentPublic.stadium=['Path to the Peak CRE'];
  const unavailable=new Proxy({},{get(){throw Error('hidden identity read');}});
  state.opponentPublic.hand=unavailable;
  state.opponentPublic.deck=unavailable;
  state.ownPublic.prizes=unavailable;
  assert.equal(chooseSkylinerOrFloatStoneRondoRetreat(
    state,catalog)?.mobilitySource,'float-stone-bkt');
});
