'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,withOwnerPromptMetadataObserver
}=require('../simulation/twinleaf/agent10-owner-prompt-metadata-observer-v1.cjs');

class FakeStore{
  constructor(state){this.state=state;this.nextPromptId=0;}
  dispatch(action){return typeof action.run==='function'?action.run(this):action;}
  prompt(state,promptArgument){
    const prompts=Array.isArray(promptArgument)?promptArgument:[promptArgument];
    for(const prompt of prompts){
      prompt.id=String(++this.nextPromptId);
      if(prompt.promptControllerId!=null)prompt.playerId=prompt.promptControllerId;
      else if(prompt.player?.id!=null)prompt.playerId=prompt.player.id;
      if(prompt.perspectivePlayerId==null)
        prompt.perspectivePlayerId=prompt.player?.id??prompt.playerId;
      state.prompts.push(prompt);
    }
    return state;
  }
}
class PlayCardAction{constructor(run){this.run=run;}}
class ChooseCardsPrompt{
  constructor(player,cards,message,options,identity={}){
    this.id=0;
    this.player=player;
    this.playerId=player.id;
    this.promptControllerId=identity.controllerId??null;
    this.perspectivePlayerId=identity.perspectiveId??player.id;
    this.cards=cards;
    this.message=message;
    this.options=options;
  }
}

test('single owner prompt records sanitized metadata and the triggering root',()=>{
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
  const prompt=new ChooseCardsPrompt(owner,secretCards,42,{
    min:1,max:2,allowCancel:false,isSecret:true
  });
  const {result,audit}=withOwnerPromptMetadataObserver(()=>
    store.dispatch(new PlayCardAction(()=>store.prompt(state,prompt))),{
      Store:FakeStore,
      GameMessage:{CHOOSE_CARD_TO_PUT_ONTO_BENCH:42}
    });

  assert.equal(result,state);
  assert.equal(audit.version,VERSION);
  assert.equal(audit.storeCount,1);
  assert.equal(audit.dispatchCount,1);
  assert.equal(audit.promptCount,1);
  assert.equal(audit.events.length,1);
  const event=audit.events[0];
  assert.equal(event.promptId,'1');
  assert.equal(event.promptIdBeforeStore,'0');
  assert.equal(event.turn,54);
  assert.equal(event.phase,3);
  assert.equal(event.resourceOwnerSeat,0);
  assert.equal(event.controllerSeat,0);
  assert.equal(event.perspectiveSeat,0);
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

test('prompt arrays preserve each prompt ID, resource owner, controller and perspective',()=>{
  class CardList{constructor(cards){this.cards=cards;}}
  const owner={id:10},opponent={id:20};
  const state={
    turn:17,phase:2,activePlayer:1,
    players:[owner,opponent],prompts:[]
  };
  const store=new FakeStore(state);
  const originalPrompt=FakeStore.prototype.prompt;
  const originalDispatch=FakeStore.prototype.dispatch;
  const first=new ChooseCardsPrompt(opponent,[
    {fullName:'Secret A'},{fullName:'Secret B'}
  ],42,{min:1,max:2},{controllerId:String(owner.id),perspectiveId:String(opponent.id)});
  const second=new ChooseCardsPrompt(owner,
    new CardList([{fullName:'Secret C'}]),43,{min:0,max:1},
    {controllerId:String(opponent.id),perspectiveId:String(owner.id)});
  const {result,audit}=withOwnerPromptMetadataObserver(()=>
    store.dispatch(new PlayCardAction(()=>store.prompt(state,[first,second]))),{
      Store:FakeStore,
      GameMessage:{
        CHOOSE_CARD_TO_PUT_ONTO_BENCH:42,
        CHOOSE_CARD_TO_DISCARD:43
      }
    });

  assert.equal(result,state);
  assert.equal(audit.events.length,2);
  assert.equal(audit.promptCount,2);
  assert.deepEqual(audit.events.map(event=>event.promptId),['1','2']);
  assert.deepEqual(audit.events.map(event=>event.promptIdBeforeStore),['0','0']);
  assert.deepEqual(audit.events.map(event=>event.promptOrdinal),[1,2]);
  assert.deepEqual(audit.events.map(event=>event.resourceOwnerSeat),[1,0]);
  assert.deepEqual(audit.events.map(event=>event.controllerSeat),[0,1]);
  assert.deepEqual(audit.events.map(event=>event.perspectiveSeat),[1,0]);
  assert.deepEqual(audit.events.map(event=>event.message),[
    'CHOOSE_CARD_TO_PUT_ONTO_BENCH','CHOOSE_CARD_TO_DISCARD'
  ]);
  assert.deepEqual(audit.events.map(event=>event.selectableCount),[2,1]);
  assert.deepEqual(audit.events.map(event=>event.triggeringDispatchOrdinal),[1,1]);
  assert.equal(audit.events.every(event=>event.pendingPromptCount===2),true);
  assert.equal(JSON.stringify(audit).includes('Secret A'),false);
  assert.equal(JSON.stringify(audit).includes('Secret B'),false);
  assert.equal(JSON.stringify(audit).includes('Secret C'),false);
  assert.equal(FakeStore.prototype.prompt,originalPrompt);
  assert.equal(FakeStore.prototype.dispatch,originalDispatch);
});

test('observer restores Store methods after a thrown prompt action',()=>{
  class CardList{constructor(cards){this.cards=cards;}}
  const owner={id:7};
  const state={turn:2,phase:1,activePlayer:0,players:[owner],prompts:[]};
  const store=new FakeStore(state);
  const originalPrompt=FakeStore.prototype.prompt;
  const originalDispatch=FakeStore.prototype.dispatch;
  assert.throws(()=>withOwnerPromptMetadataObserver(()=>
    store.dispatch(new PlayCardAction(()=>{
      store.prompt(state,new ChooseCardsPrompt(owner,
        new CardList([{fullName:'Hidden Option'}]),42,{min:0,max:1}));
      throw new Error('sentinel');
    })),{
      Store:FakeStore,
      GameMessage:{CHOOSE_CARD_TO_PUT_ONTO_BENCH:42}
    }),/sentinel/);
  assert.equal(FakeStore.prototype.prompt,originalPrompt);
  assert.equal(FakeStore.prototype.dispatch,originalDispatch);
});
