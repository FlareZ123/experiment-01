'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {projectNativeAction}=require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

// This is a real actorObservation -> real native action projector -> candidate
// worker source chain on constructed native-shaped State objects. It is NOT
// a compiled pinned-Twinleaf Store or a resolved match.
const E='Psychic Energy MEE 13';
function c(fullName,extra={}){
  return {fullName,name:fullName,hp:200,cardType:['PSYCHIC'],
    stage:'BASIC',subtypes:['Basic'],attacks:[],powers:[],
    retreat:[],weakness:[],resistance:[],...extra};
}
function slot(card){
  return {cards:card?[card]:[],getPokemonCard:()=>card??null,damage:0,
    energies:{cards:[]},tools:[],specialConditions:[],pokemonPlayedTurn:1};
}
function player(id,owner,recipientType='PSYCHIC'){
  const active=owner?c('Shadow Rider Calyrex VMAX CRE',{
    stage:'VMAX',subtypes:['VMAX'],powers:[{name:'Underworld Door'}]}):
    c('Mimikyu GRI');
  const bench=owner?c('Shadow Rider Calyrex V CRE',
    {cardType:[recipientType]}):null;
  return {id,active:slot(active),bench:[slot(bench),
    slot(null),slot(null),slot(null),slot(null)],
    hand:{cards:owner?[c(E)]:[]},deck:{cards:Array(30).fill(c(E))},
    prizes:Array(6).fill(null).map(()=>({cards:[c(E)]})),
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},stadiumAndToolHaveNoEffectTurnsRemaining:0,
    supporterTurn:0,energyPlayedTurn:0,stadiumPlayedTurn:0,
    usedGX:false,usedVSTAR:false};
}
const minimalNative={PlayerType:{BOTTOM_PLAYER:'BOTTOM_PLAYER',
  TOP_PLAYER:'TOP_PLAYER'},SlotType:{ACTIVE:'ACTIVE',BENCH:'BENCH'}};
function root(seat,recipientType){
  const state={players:[player(100,seat===0,recipientType),
    player(200,seat===1,recipientType)],activePlayer:seat,
    turn:4,phase:5,prompts:[]};
  const view=actorObservation(state,seat);
  const action=projectNativeAction({type:'USE_ABILITY_ACTION',
    name:'Underworld Door',target:{
      player:'BOTTOM_PLAYER',slot:'ACTIVE',index:0}},
    state,seat,minimalNative,'door');
  assert.ok(action);
  const frontier={schema:protocol.FRONTIER_SCHEMA,items:[action,
    {kind:'pass',token:'pass'}]};
  const worker=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  protocol.validateFrontier(frontier);
  const decision=worker.decide({role:'candidate',seat,observation:view,
    prompt:null,publicEventReceipt:null,actionFrontier:frontier});
  return {view,action,decision};
}
for(const seat of [0,1]){
  test('actorObservation native PSYCHIC bench admits Underworld Door root seat '+seat,()=>{
    const {view,action,decision}=root(seat,'PSYCHIC');
    assert.deepEqual(view.ownPublic.bench[0].printed.types,['PSYCHIC']);
    assert.deepEqual(action.publicMetadata,{abilityName:'Underworld Door',
      sourceZone:'active',sourceSeat:'actor',sourceIndex:0});
    assert.deepEqual(decision,{kind:'select-action',token:'door'});
  });
  test('actorObservation native METAL bench rejects Door despite offer seat '+seat,()=>{
    const {view,decision}=root(seat,'METAL');
    assert.deepEqual(view.ownPublic.bench[0].printed.types,['METAL']);
    assert.deepEqual(decision,{kind:'select-action',token:'pass'});
  });
}
