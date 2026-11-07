'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {captureProfessorResearchPhysicalDraw,VERSION}=require(
  '../simulation/twinleaf/agent2-professor-research-physical-draw-witness.cjs');

function deal(){
  const Research={fullName:"Professor's Research JTG"};
  const originalDeck=Array.from({length:12},(_,i)=>({
    fullName:'Psychic Energy MEE',i
  }));
  const owner={
    supporterTurn:0,
    hand:{cards:[Research]},deck:{cards:[...originalDeck]},
    supporter:{cards:[]},discard:{cards:[]}
  };
  const before={turn:31,activePlayer:0,players:[owner,{}]};
  const chosen=originalDeck.slice(0,7);
  const after={turn:31,activePlayer:0,players:[{
    supporterTurn:1,hand:{cards:chosen},deck:{cards:originalDeck.slice(7)},
    supporter:{cards:[Research]},discard:{cards:[]}
  },{}]};
  return {before,after,Research,originalDeck};
}

test('exact seven physical owner deck objects and quota are confirmed',()=>{
  const x=deal();
  const output=captureProfessorResearchPhysicalDraw(x.before,0,0)
    .verify(x.after);
  assert.equal(output.version,VERSION);
  assert.equal(output.valid,true);
  assert.equal(output.afterHandCount,7);
  assert.equal(output.afterDeckCount,5);
  assert.equal(output.ownerPrivateDeckIdentitySerialized,false);
});

test('same seven printings from a different physical deck fail',()=>{
  const x=deal();
  x.after.players[0].hand.cards=x.after.players[0].hand.cards.map(
    y=>({...y}));
  assert.equal(captureProfessorResearchPhysicalDraw(x.before,0,0)
    .verify(x.after).physicalDrawnExactlySeven,false);
});

test('Supporter unresolved or quota not spent cannot certify full draw',()=>{
  const x=deal();
  x.after.players[0].supporter.cards=[];
  assert.equal(captureProfessorResearchPhysicalDraw(x.before,0,0)
    .verify(x.after).sourceCardResolved,false);
  x.after.players[0].supporter.cards=[x.Research];
  x.after.players[0].supporterTurn=0;
  assert.equal(captureProfessorResearchPhysicalDraw(x.before,0,0)
    .verify(x.after).supporterQuotaSpent,false);
});

test('drawing six, excess cards or inconsistent deck counts fail',()=>{
  const x=deal();
  x.after.players[0].hand.cards.pop();
  assert.equal(captureProfessorResearchPhysicalDraw(x.before,0,0)
    .verify(x.after).valid,false);
  const z=deal();
  z.after.players[0].deck.cards.push(z.originalDeck[0]);
  assert.equal(captureProfessorResearchPhysicalDraw(z.before,0,0)
    .verify(z.after).deckCountConserved,false);
});

test('restricted pre-action witness rejects other cards and insufficient deck',()=>{
  const x=deal();
  x.before.players[0].hand.cards.push({fullName:'Forest Seal Stone SIT'});
  assert.throws(()=>captureProfessorResearchPhysicalDraw(x.before,0,0),
    /lone physical Research/);
  x.before.players[0].hand.cards.pop();
  x.before.players[0].deck.cards.length=6;
  assert.throws(()=>captureProfessorResearchPhysicalDraw(x.before,0,0),
    /at least seven physical owner deck cards required/);
});

test('unchanged native turn and unique physical objects required',()=>{
  const x=deal();
  x.after.turn=32;
  assert.equal(captureProfessorResearchPhysicalDraw(x.before,0,0)
    .verify(x.after).turnUnchanged,false);
  const z=deal();
  z.before.players[0].deck.cards[1]=z.before.players[0].deck.cards[0];
  assert.throws(()=>captureProfessorResearchPhysicalDraw(z.before,0,0),
    /distinct physical object identity/);
});
