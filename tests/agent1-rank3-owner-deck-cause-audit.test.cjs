'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  safePromptSummary,
  summarizeAction,
  withReadOnlyDeckDispatchAudit
}=require('../simulation/evaluation/agent1-rank3-owner-deck-cause-audit.cjs');

class PlayItemAction{
  constructor(card){this.card=card;}
}
class ResolvePromptAction{}
class PlayCardAction{constructor(handIndex){this.handIndex=handIndex;}}
class SearchDeckPrompt{
  constructor(){
    this.playerId=101;
    this.type='search';
    this.title='Search your deck';
    this.result=undefined;
    this.options=[{hiddenCardName:'must-not-be-emitted'}];
  }
}
class FakeStore{
  constructor(){
    const ownerCard={fullName:'Fog Crystal'};
    this.ownerCard=ownerCard;
    this.state={
      players:[
        {id:101,deck:{cards:[1,2,3]},hand:{cards:[ownerCard]}},
        {id:202,deck:{cards:[4,5,6]},hand:{cards:[]}}
      ],
      activePlayer:0,
      turn:15,
      prompts:[]
    };
  }
  dispatch(action){
    if(action instanceof ResolvePromptAction)
      this.state.players[0].deck.cards.pop();
    return 'settled';
  }
}

test('prompt-aware deck observer joins a deck decrement to its owner action and pending prompt',()=>{
  const store=new FakeStore();
  const original=FakeStore.prototype.dispatch;
  const observed=withReadOnlyDeckDispatchAudit(()=>{
    store.dispatch(new PlayItemAction(store.ownerCard));
    store.state.prompts=[new SearchDeckPrompt()];
    return store.dispatch(new ResolvePromptAction());
  },{Store:FakeStore});
  assert.equal(observed.result,'settled');
  assert.equal(observed.dispatchCount,2);
  assert.equal(observed.events.length,1);
  const event=observed.events[0];
  assert.equal(event.action.actionClass,'ResolvePromptAction');
  assert.deepEqual(event.deckDelta,[-1,0]);
  assert.equal(event.pendingPromptsBefore[0].className,'SearchDeckPrompt');
  assert.equal(event.pendingPromptsBefore[0].ownerSeat,0);
  assert.equal(event.previousOwnerAction.actionClass,'PlayItemAction');
  assert.equal(event.previousOwnerAction.ownerHandCardName,'Fog Crystal');
  assert.equal(JSON.stringify(event).includes('must-not-be-emitted'),false);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
});

test('the observer never emits an action card identity from the other players hand',()=>{
  const state={
    players:[
      {id:101,hand:{cards:[]}},
      {id:202,hand:{cards:[{fullName:'Opponent private card'}]}}
    ]
  };
  const hidden={fullName:'Opponent private card'};
  const summary=summarizeAction(new PlayItemAction(hidden),0,state);
  assert.equal(summary.ownerHandCardName,null);
  assert.equal(JSON.stringify(summary).includes('Opponent private card'),false);
});

test('PlayCardAction handIndex resolves only against the acting owners own hand',()=>{
  const state={
    players:[
      {id:101,hand:{cards:[{fullName:'Mysterious Treasure'}]}},
      {id:202,hand:{cards:[{fullName:'Opponent private card'}]}}
    ]
  };
  const summary=summarizeAction(new PlayCardAction(0),0,state);
  assert.equal(summary.ownerHandIndex,0);
  assert.equal(summary.ownerHandCardName,'Mysterious Treasure');
});

test('prompt summaries retain safe scalar metadata and omit nested option identities',()=>{
  const prompt=new SearchDeckPrompt();
  const summary=safePromptSummary(prompt,[{id:101},{id:202}]);
  assert.equal(summary.className,'SearchDeckPrompt');
  assert.equal(summary.ownerSeat,0);
  assert.ok(summary.keys.includes('options'));
  assert.deepEqual(summary.safeFields,{
    type:'search',
    title:'Search your deck'
  });
  assert.equal(JSON.stringify(summary).includes('must-not-be-emitted'),false);
});
