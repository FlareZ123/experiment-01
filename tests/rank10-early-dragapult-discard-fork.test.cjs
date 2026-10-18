'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  eligibleDragonCost,withPhysicalDiscardObserver,findTreasureCost
} = require('../simulation/twinleaf/rank10-early-dragapult-discard-fork.cjs');

class ChooseCardsPrompt {
  constructor(player, cards, message) {
    this.playerId = player.id;
    this.cards = cards;
    this.message = message;
  }
  validate(cards) { return cards.length === 1 &&
    this.cards.cards.includes(cards[0]); }
}

const dragon = {fullName:'Dragapult ex TWM'};
function sourceState(turn=3) {
  const hand = {cards:[dragon,{fullName:'Other Card'}]};
  return {turn,players:[{id:101,hand:{cards:[]},discard:{cards:[]}},
    {id:202,hand,discard:{cards:[]}}],prompts:[]};
}

test('choice exists only at frozen physical owner-hand discard prompt',()=>{
  const state=sourceState();
  const prompt=new ChooseCardsPrompt(state.players[1],state.players[1].hand,7);
  assert.equal(eligibleDragonCost(state,prompt,202,7),dragon);
  assert.equal(eligibleDragonCost({...state,turn:4},prompt,202,7),null);
  assert.equal(eligibleDragonCost(state,prompt,101,7),null);
  assert.equal(eligibleDragonCost(state,prompt,202,8),null);
  const otherZone=new ChooseCardsPrompt(state.players[1],
    {cards:[dragon]},7);
  assert.equal(eligibleDragonCost(state,otherZone,202,7),null);
  prompt.validate=()=>false;
  assert.equal(eligibleDragonCost(state,prompt,202,7),null);
});

test('root-only observer verifies selected physical Card in discard',()=>{
  class AddPlayerAction {}
  class ResolvePromptAction {
    constructor(id,result) {this.id=id;this.result=result;}
  }
  class FakeStore {
    constructor(state) {this.state=state;}
    dispatch(action) {
      if(action instanceof ResolvePromptAction) {
        const selected=action.result;
        this.state.players[1].hand.cards=this.state.players[1]
          .hand.cards.filter(card=>!selected.includes(card));
        this.state.players[1].discard.cards.push(...selected);
      }
      return this.state;
    }
  }
  const live=new FakeStore(sourceState());
  live.dispatch(new AddPlayerAction());
  live.state.prompts.push(new ChooseCardsPrompt(
    live.state.players[1],live.state.players[1].hand,7));
  live.state.prompts[0].id=5;
  const speculative=new FakeStore(sourceState());
  const captured=withPhysicalDiscardObserver(FakeStore,()=>{
    live.dispatch(new AddPlayerAction());
    speculative.dispatch(new ResolvePromptAction(5,[dragon]));
    return live.dispatch(new ResolvePromptAction(5,[dragon]));
  });
  assert.equal(captured.costAnswers.length,1);
  assert.equal(captured.costAnswers[0].physicalDiscardConfirmed,true);
  assert.deepEqual(captured.costAnswers[0].selectedPrintings,
    ['Dragapult ex TWM']);
  assert.equal(FakeStore.prototype.dispatch.name,'dispatch');
});

test('Treasure chain requires same-seat later hand selection',()=>{
  const trace=[
    {playerSlot:1,turnBefore:3,action:'PlayCardAction',
      card:'Mysterious Treasure',actionOrdinal:11},
    {playerSlot:0,turnBefore:3,actionOrdinal:12,
      cardSelection:{sourceZone:'hand',sourcePlayerSlot:0,
        selectedCards:['Other']}},
    {playerSlot:1,turnBefore:3,actionOrdinal:13,
      cardSelection:{sourceZone:'hand',sourcePlayerSlot:1,
        selectedCards:['Dragapult ex TWM']}}
  ];
  assert.deepEqual(findTreasureCost(trace),{
    played:{ordinal:11,turn:3},
    answer:{ordinal:13,printings:['Dragapult ex TWM']}
  });
});
