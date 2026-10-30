'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorObservationWithPublicMulligans}=require(
  '../simulation/evaluation/agent26-public-mulligan-actor-view.cjs');

function card(fullName){
  return {fullName,name:fullName,hp:210,
    attacks:[{name:'Test Attack',cost:['COLORLESS']}],powers:[]};
}
function slot(name){
  const p=card(name);
  return {getPokemonCard:()=>p,cards:[p],damage:0,
    energies:{cards:[]},tools:[],specialConditions:[]};
}
function player(name,id){
  return {id,active:slot(name),bench:Array(5).fill(null).map(()=>
    ({getPokemonCard:()=>null,cards:[],damage:0,
      energies:{cards:[]},tools:[]})),
  hand:{cards:[card('Invisible Card')]},deck:{cards:[card('Hidden Deck')]},
  prizes:[{cards:[card('Hidden Prize')]}],
  discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
  supporter:{cards:[]},supporterTurn:0,retreatedTurn:-1,
  energyPlayedTurn:-1,stadiumPlayedTurn:-1};
}
const printings=['Shown One A','Shown Two B','Shown Three C',
  'Shown Four D','Shown Five E','Shown Six F','Shown Seven G'];
const names=new Map(printings.map((name)=>[name,name]));
const packet={
  schema:'native-public-opponent-mulligan-reveal-v1',
  provenance:'opponent-facing ShowMulliganPrompt only',
  effectOnActorPolicy:false,
  createsCompetitiveWinRateEvidence:false,
  excludesPrivateCurrentHandDeckPrize:true,
  revealedHandCounts:[0,1],
  handsByOwner:[[],[printings]]
};
const fixture=()=>({
  players:[player('Active First',101),player('Active Second',202)],
  activePlayer:0,turn:2,phase:5,prompts:[]
});

test('owner-only optional view adds exactly other-seat public failed-seven names',()=>{
  const state=fixture();
  const v=actorObservationWithPublicMulligans(state,0,packet,names);
  assert.deepEqual(v.publicFailedOpponentSevens,[printings]);
  assert.ok(Object.isFrozen(v));
  assert.ok(Object.isFrozen(v.publicFailedOpponentSevens[0]));
  assert.deepEqual(v.ownHand,['Invisible Card']);
  assert.equal(v.opponentPublic.active.printing,'Active Second');
  state.activePlayer=1;
  const b=actorObservationWithPublicMulligans(state,1,packet,names);
  assert.deepEqual(b.publicFailedOpponentSevens,[]);
});

test('opponent current concealed cards and deck order cannot change extras',()=>{
  const x=fixture(),y=fixture();
  x.players[1].hand.cards=[card('Hidden A')];
  y.players[1].hand.cards=[card('Hidden B')];
  x.players[1].deck.cards=[card('Hidden X'),card('Hidden Y')];
  y.players[1].deck.cards=[card('Hidden Y'),card('Hidden X')];
  x.players[1].prizes[0].cards=[card('Unknown Prize A')];
  y.players[1].prizes[0].cards=[card('Unknown Prize B')];
  assert.deepEqual(actorObservationWithPublicMulligans(x,0,packet,names),
    actorObservationWithPublicMulligans(y,0,packet,names));
});

test('root ownership and public packet authenticity failures are fail closed',()=>{
  const state=fixture();
  assert.throws(()=>actorObservationWithPublicMulligans(
    state,1,packet,names),/Actor-only/);
  const invalid={...packet,excludesPrivateCurrentHandDeckPrize:false};
  assert.throws(()=>actorObservationWithPublicMulligans(
    state,0,invalid,names));
  const absent=new Map([...names].slice(1));
  assert.throws(()=>actorObservationWithPublicMulligans(
    state,0,packet,absent),/no verified public name/);
});

test('concrete identity reads from hidden physical zones stay impossible',()=>{
  const s=fixture();
  const poison=n=>new Proxy({length:n},{get(obj,property){
    if(property==='length')return obj.length;
    throw new Error('Forbidden hidden card identity read '+String(property));
  }});
  s.players[0].deck.cards=poison(26);
  s.players[0].prizes[0].cards=poison(1);
  s.players[1].hand.cards=poison(4);
  s.players[1].deck.cards=poison(25);
  s.players[1].prizes[0].cards=poison(1);
  const v=actorObservationWithPublicMulligans(s,0,packet,names);
  assert.deepEqual(v.publicFailedOpponentSevens,[printings]);
  assert.equal(v.opponentPublic.handCount,4);
  assert.equal(v.opponentPublic.deckCount,25);
  assert.equal(v.opponentPublic.prizeCount,1);
});

test('provenance mismatch cannot turn arbitrary private lists into public history',()=>{
  const state=fixture();
  const wrong={...packet,provenance:'opponent hand identity'};
  assert.throws(()=>actorObservationWithPublicMulligans(
    state,0,wrong,names),/opponent-facing ShowMulliganPrompt only/);
});
