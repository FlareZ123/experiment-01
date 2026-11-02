'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerSkylinerRondoRetreat,VERSION:ORIGINAL_VERSION}=
  require('../simulation/twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs');
const {VERSION,BASE_VERSION,publicSkylinerSuppressionReason,
  choosePublicLockGuardedSkylinerRondoRetreat}=
  require('../simulation/twinleaf/agent6-skyliner-ability-suppression-guard.cjs');

const psychic='Psychic Energy MEE';
const telepath='Telepath [P] Energy M3';
const catalog={basicEnergies:new Set([psychic]),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:11,PARALYZED:12}};

/** @returns {object} Owner-only public view with genuine printed policy pieces. */
function view(){
  return {decisionKind:'owner-root',globalTurn:33,ownHand:[],
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{stadium:[],publicTurnRestrictions:{
      attackLockTurnsRemaining:0},
      active:{printing:'Mimikyu GRI',name:'Mimikyu',
        energies:[telepath],attacks:[{name:'Filch',damage:0}],
        specialConditions:[],publicRestrictions:{}},
      bench:[
        {printing:"Lillie's Clefairy ex JTG",energies:[psychic,psychic],
          attacks:[{name:'Full Moon Rondo',cost:[5,9],damage:20}],
          specialConditions:[],publicRestrictions:{}},
        {printing:'Unown LOT',energies:[],abilities:[]},
        {printing:'Unown LOT',energies:[],abilities:[]},
        {printing:'Latias ex SSP',abilities:['Skyliner'],energies:[]},
        {printing:'Unown LOT',energies:[],abilities:[]}]},
    opponentPublic:{stadium:[],
      active:{printing:'Duskull VIV',hp:60,damage:0,abilities:[],
        tools:[]},
      bench:[{printing:'Unown LOT',abilities:[],tools:[]},
        {printing:'Unown LOT',abilities:[],tools:[]},
        {printing:'Unown LOT',abilities:[],tools:[]},
        {printing:'Unown LOT',abilities:[],tools:[]},
        {printing:'Unown LOT',abilities:[],tools:[]}]}
  };
}

test('registered v2 version and positive baseline remain identical',()=>{
  const original='agent6-owner-public-skyliner-rondo-mobility-v2-nominal-ko';
  assert.equal(ORIGINAL_VERSION,original);
  assert.equal(BASE_VERSION,original);
  assert.equal(VERSION,'agent6-skyliner-public-ability-suppression-v1');
  const state=view();
  assert.equal(publicSkylinerSuppressionReason(state),null);
  assert.deepEqual(choosePublicLockGuardedSkylinerRondoRetreat(state,catalog),
    chooseOwnerSkylinerRondoRetreat(state,catalog));
  assert.equal(choosePublicLockGuardedSkylinerRondoRetreat(state,catalog)
    ?.kind,'skyliner-rondo-retreat');
});

test('Path to Peak blocks even though printed Skyliner remains listed',()=>{
  for(const side of ['ownPublic','opponentPublic']){
    const state=view();
    state[side].stadium=['Path to the Peak CRE'];
    assert.equal(publicSkylinerSuppressionReason(state),
      'path-to-peak-rule-box-ability-lock');
    assert.equal(choosePublicLockGuardedSkylinerRondoRetreat(
      state,catalog),null);
    assert.equal(chooseOwnerSkylinerRondoRetreat(state,catalog)
      ?.kind,'skyliner-rondo-retreat');
  }
});

test('opponent active Iron Thorns Initialization disables non-Future Skyliner',()=>{
  const state=view();
  state.opponentPublic.active={
    ...state.opponentPublic.active,
    printing:'Iron Thorns ex TWM',
    abilities:['Initialization']
  };
  assert.equal(publicSkylinerSuppressionReason(state),
    'opponent-active-iron-thorns-initialization');
  assert.equal(choosePublicLockGuardedSkylinerRondoRetreat(
    state,catalog),null);
  const benched=view();
  benched.opponentPublic.bench[0]=state.opponentPublic.active;
  assert.equal(publicSkylinerSuppressionReason(benched),null);
});

test('equipped Garbotoxin on either visible Bench suppresses Skyliner',()=>{
  for(const side of ['ownPublic','opponentPublic']){
    const state=view();
    state[side].bench[1]={
      printing:'Garbodor BKP',abilities:['Garbotoxin'],
      tools:['Float Stone BKT']
    };
    assert.equal(publicSkylinerSuppressionReason(state),
      'tool-equipped-garbotoxin');
    assert.equal(choosePublicLockGuardedSkylinerRondoRetreat(
      state,catalog),null);
    state[side].bench[1].tools=[];
    assert.equal(publicSkylinerSuppressionReason(state),null);
  }
});

test('opponent active Neutralizing Gas suppresses, benched does not',()=>{
  const state=view();
  const weezing={printing:'Galarian Weezing RCL',
    abilities:['Neutralizing Gas']};
  state.opponentPublic.active={...state.opponentPublic.active,...weezing};
  assert.equal(publicSkylinerSuppressionReason(state),
    'opponent-active-neutralizing-gas');
  assert.equal(choosePublicLockGuardedSkylinerRondoRetreat(
    state,catalog),null);
  const benched=view();
  benched.opponentPublic.bench[0]=weezing;
  assert.equal(publicSkylinerSuppressionReason(benched),null);
});

test('no own or opponent concealed-zone access',()=>{
  const state=view();
  const sealed=new Proxy({},{get(){throw Error('hidden zone read');}});
  state.ownPublic.deck=sealed;state.ownPublic.prizes=sealed;
  state.opponentPublic.hand=sealed;state.opponentPublic.deck=sealed;
  assert.equal(choosePublicLockGuardedSkylinerRondoRetreat(
    state,catalog)?.kind,'skyliner-rondo-retreat');
});
