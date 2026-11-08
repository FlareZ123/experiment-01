'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,withOwnerPromptMetadataObserver
}=require('../simulation/twinleaf/agent10-owner-prompt-metadata-observer-v1.cjs');

class FakeStore{
  constructor(state){this.state=state;this.nextPromptId=0;}
  dispatch(action){return typeof action.run==='function'?action.run(this):action;}
  prompt(state,prompt){
    prompt.id=prompt.id??String(++this.nextPromptId);
    state.prompts.push(prompt);
    return prompt;
  }
}
class PlayCardAction{constructor(run){this.run=run;}}
class ChooseCardsPrompt{
  constructor(player,cards,message,options){
    this.player=player;
    this.playerId=player.id;
    this.cards=cards;
    this.message=message;
    this.options=options;
  }
}

test('owner prompt observer records sanitized metadata and the triggering root',()=>{
  const owner={id:10},opponent={id:20};
  const state={
    turn:54,phase:3,activePlayer:0,
    players:[owner,opponent],prompts:[]
  };
  const store=new FakeStore(state);
  const secretCards=[
    {fullName:'Secret Card One'},
    {fullName:'Secret Card Two'}
  ];
  const originalPrompt=FakeStore.prototype.prompt;
  const originalDispatch=FakeStore.prototype.dispatch;
  const {result,audit}=withOwnerPromptMetadataObserver(()=>
    store.dispatch(new PlayCardAction(()=>store.prompt(state,
      new ChooseCardsPrompt(owner,secretCards,42,{
        min:1,max:2,allowCancel:false,isSecret:true
      })))),{
    Store:FakeStore,
    GameMessage:{CHOOSE_CARD_TO_PUT_ONTO_BENCH:42}
  });

  assert.equal(result.id,'1');
  assert.equal(audit.version,VERSION);
  assert.equal(audit.storeCount,1);
  assert.equal(audit.dispatchCount,1);
  assert.equal(audit.promptCount,1);
  assert.equal(audit.events.length,1);
  const event=audit.events[0];
  assert.equal(event.promptId,'1');
  assert.equal(event.promptIdBeforeStore,null);
  assert.equal(event.turn,54);
  assert.equal(event.phase,3);
  assert.equal(event.ownerSeat,0);
  assert.equal(event.promptType,'ChooseCardsPrompt');
  assert.equal(event.message,'CHOOSE_CARD_TO_PUT_ONTO_BENCH');
  assert.equal(event.min,1);
  assert.equal(event.max,2);
  assert.equal(event.allowCancel,false);
  assert.equal(event.isSecret,true);
  assert.equal(event.selectableCount,2);
  assert.equal(event.pendingPromptCount,1);
  assert.equal(event.stateMatchesLiveStore,true);
  assert.equal(event.triggeringAction,'PlayCardAction');
  assert.equal(event.triggeringDispatchOrdinal,1);
  assert.equal(event.triggeringDispatchDepth,0);
  assert.equal(JSON.stringify(audit).includes('Secret Card One'),false);
  assert.equal(JSON.stringify(audit).includes('Secret Card Two'),false);
  assert.equal(FakeStore.prototype.prompt,originalPrompt);
  assert.equal(FakeStore.prototype.dispatch,originalDispatch);
});

test('observer counts CardList options without serializing their contents and restores after throw',()=>{
  class CardList{constructor(cards){this.cards=cards;}}
  const owner={id:7};
  const state={turn:2,phase:1,activePlayer:0,players:[owner],prompts:[]};
  const store=new FakeStore(state);
  const originalPrompt=FakeStore.prototype.prompt;
  const originalDispatch=FakeStore.prototype.dispatch;
  assert.throws(()=>withOwnerPromptMetadataObserver(()=>{
    store.dispatch(new PlayCardAction(()=>store.prompt(state,
      new ChooseCardsPrompt(owner,
        new CardList([{fullName:'Hidden Option'}]),42,{min:0,max:1}))));
    throw new Error('sentinel');
  },{
    Store:FakeStore,
    GameMessage:{CHOOSE_CARD_TO_PUT_ONTO_BENCH:42}
  }),/sentinel/);
  assert.equal(FakeStore.prototype.prompt,originalPrompt);
  assert.equal(FakeStore.prototype.dispatch,originalDispatch);
});
