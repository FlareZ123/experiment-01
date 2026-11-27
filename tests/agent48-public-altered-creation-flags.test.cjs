'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {validateActorObservation}=require('../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

function card(fullName) {
  return {fullName,name:fullName,hp:180,stage:'BASIC',
    attacks:[{name:'Attack',cost:[],damage:10}],powers:[],cardType:['DRAGON'],retreat:[],
    weakness:[],resistance:[]};
}
function occupied(n) {
  const pokemon=card(n);
  return {getPokemonCard:()=>pokemon,cards:[pokemon],damage:0,pokemonPlayedTurn:1,
    energies:{cards:[]},tools:[]};
}
function empty() {
  return {getPokemonCard:()=>null,cards:[],damage:0,energies:{cards:[]},tools:[]};
}
function player(n) {
  return {id:n,active:occupied('Arceus & Dialga & Palkia GX CEC'),bench:Array.from({length:5},empty),
    hand:{cards:[card('Water Energy SVE')]},deck:{cards:[card('Metal Energy SVE')]},
    prizes:[{cards:[card('Hidden Prize '+n)]}],discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},supporterTurn:0,retreatedTurn:0,
    energyPlayedTurn:0,stadiumPlayedTurn:0,stadiumUsedTurn:0,usedGX:false,usedVSTAR:false};
}
function fixture(){return {activePlayer:0,turn:6,phase:5,prompts:[],
  players:[player(0),player(1)]};}
test('Altered Creation +30 and conditional extra Prize remain distinct and actor-relative',()=>{
  const state=fixture();
  state.players[0].alteredCreationDamage=true;
  state.players[0].usedAlteredCreation=false;
  state.players[1].alteredCreationDamage=true;
  state.players[1].usedAlteredCreation=true;
  for (const seat of [0,1]) {
    state.activePlayer=seat;
    const view=actorObservation(state,seat);
    const own=view.ownPublic.publicTurnRestrictions;
    const opp=view.opponentPublic.publicTurnRestrictions;
    assert.equal(own.alteredCreationDamage,true);
    assert.equal(opp.alteredCreationDamage,true);
    assert.equal(own.usedAlteredCreation,seat===1);
    assert.equal(opp.usedAlteredCreation,seat===0);
    assert.equal(Object.isFrozen(own),true);
    validateActorObservation(view,seat);
  }
});
test('absence of native flags projects inactive, but malformed worker-facing flags are rejected',()=>{
  const state=fixture();
  const view=actorObservation(state,0);
  assert.equal(view.ownPublic.publicTurnRestrictions.alteredCreationDamage,false);
  assert.equal(view.ownPublic.publicTurnRestrictions.usedAlteredCreation,false);
  validateActorObservation(view,0);
  const malformed=JSON.parse(JSON.stringify(view));
  malformed.opponentPublic.publicTurnRestrictions.usedAlteredCreation='yes';
  assert.throws(()=>validateActorObservation(malformed,0));
  const omitted=JSON.parse(JSON.stringify(view));
  delete omitted.ownPublic.publicTurnRestrictions.alteredCreationDamage;
  delete omitted.opponentPublic.publicTurnRestrictions.usedAlteredCreation;
  validateActorObservation(omitted,0); // optional for legacy worker fixtures
});
test('public Altered Creation flags do not expose or depend on opponent concealed identities',()=>{
  const a=fixture(),b=fixture();
  for(const state of [a,b]){
    state.players[1].alteredCreationDamage=true;
    state.players[1].usedAlteredCreation=true;
  }
  a.players[1].hand.cards=[card('Water Energy SVE')];
  b.players[1].hand.cards=[card('Secret Box TWM')];
  a.players[1].deck.cards=[card('Dragon Energy Alpha')];
  b.players[1].deck.cards=[card('Dragon Energy Beta')];
  a.players[1].prizes[0].cards=[card('Secret Prize Alpha')];
  b.players[1].prizes[0].cards=[card('Secret Prize Beta')];
  assert.deepEqual(actorObservation(a,0),actorObservation(b,0));
  b.players[1].usedAlteredCreation=false;
  assert.notDeepEqual(actorObservation(a,0),actorObservation(b,0),
    'public effect state must be observable');
});
