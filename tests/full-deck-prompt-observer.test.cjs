'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {fullOwnDeckPrompt,recordFirstFullOwnDeckPrompt}=
  require('../simulation/twinleaf/full-deck-prompt-observer.cjs');

class ChooseCardsPrompt {
  constructor(playerId,cards) {this.playerId=playerId;this.cards=cards;}
}
class OtherPrompt extends ChooseCardsPrompt {}

function fixture() {
  const a={id:101,deck:{cards:[{id:1},{id:2}]},
    hand:{cards:[{id:3},{id:4}]},prizes:[{cards:[{id:5}]},{cards:[]}]};
  const b={id:202,deck:{cards:[{id:6}]},
    hand:{cards:[{id:7}]},prizes:[{cards:[{id:8}]}]};
  const state={turn:9,players:[a,b]};
  return {state,a,b};
}

test('only the exact owner deck CardList establishes an observed full-deck prompt',()=>{
  const {state,a,b}=fixture();
  const observed=fullOwnDeckPrompt(state,new ChooseCardsPrompt(a.id,a.deck),ChooseCardsPrompt);
  assert.deepEqual(observed,{playerId:101,turn:9,deckCardCount:2,prizeSlotsRemaining:1});
  for(const prompt of [
    new ChooseCardsPrompt(a.id,a.hand),
    new ChooseCardsPrompt(a.id,{cards:a.deck.cards}),
    new ChooseCardsPrompt(a.id,b.deck),
    new ChooseCardsPrompt(404,a.deck),
    {playerId:a.id,cards:a.deck}
  ]) {
    assert.equal(fullOwnDeckPrompt(state,prompt,ChooseCardsPrompt),null);
  }
});

test('first-prompt recorder is per player, read-only, and ignores repeated searches',()=>{
  const {state,a,b}=fixture();
  const before=JSON.stringify(state),events=[];
  recordFirstFullOwnDeckPrompt(events,state,new ChooseCardsPrompt(a.id,a.hand),ChooseCardsPrompt,3);
  assert.deepEqual(events,[]);
  recordFirstFullOwnDeckPrompt(events,state,new ChooseCardsPrompt(a.id,a.deck),ChooseCardsPrompt,4);
  recordFirstFullOwnDeckPrompt(events,state,new ChooseCardsPrompt(a.id,a.deck),ChooseCardsPrompt,7);
  recordFirstFullOwnDeckPrompt(events,state,new ChooseCardsPrompt(b.id,b.deck),ChooseCardsPrompt,8);
  assert.equal(events.length,2);
  assert.deepEqual(events.map(x=>[x.playerId,x.actionOrdinal]),[[101,4],[202,8]]);
  assert.equal(JSON.stringify(state),before);
  assert.ok(events.every(e=>!Object.hasOwn(e,'cards')));
});
