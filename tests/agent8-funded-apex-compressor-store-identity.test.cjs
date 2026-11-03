'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withFundedApexCompressorAfterPass,ITEM}=
  require('../simulation/twinleaf/agent8-funded-apex-compressor-owner-bridge.cjs');
class PassTurnAction {}
class AddPlayerAction {}
class PlayCardAction {
 constructor(playerId,handIndex,target){
  Object.assign(this,{playerId,handIndex,target});
 }
}
class ResolvePromptAction {
 constructor(id,result){Object.assign(this,{id,result});}
}
class FakeAi {
 constructor(){this.client={id:101};}
 decodeNextAction(){return new PassTurnAction();}
}
class FakeStore {
 constructor(){this.state={players:[],activePlayer:0,turn:8,phase:2,prompts:[]};}
 dispatch(action){
  if(action instanceof AddPlayerAction){
   this.state.players=[{id:101,hand:{cards:[{fullName:ITEM}]},
    deck:{cards:[{fullName:'Dragapult ex TWM',id:2},
      {fullName:'Noivern ex PAL',id:3},
      {fullName:'Grass Energy MEE',id:4}]},
    discard:{cards:[]},supporter:{cards:[]}}];
   return;
  }
  const own=this.state.players[0];
  if(action instanceof PlayCardAction){
   const [card]=own.hand.cards.splice(action.handIndex,1);
   own.supporter.cards.push(card);
   const prompt=new (class ChooseCardsPrompt {})();
   Object.assign(prompt,{id:37,playerId:101,cards:own.deck,
    message:'CHOOSE_CARD_TO_DISCARD',
    validate:cards=>cards.length>=1&&cards.length<=3});
   this.state.prompts=[prompt];
   return;
  }
  if(action instanceof ResolvePromptAction){
   for(const card of action.result){
    const index=own.deck.cards.indexOf(card);
    assert.ok(index>=0);
    own.discard.cards.push(...own.deck.cards.splice(index,1));
   }
   own.supporter.cards=[];
   this.state.prompts=[];
  }
 }
}
function ownerRoot(){
 return {decisionKind:'owner-root',actorSeat:0,globalTurn:8,
  ownHand:[ITEM],ownTurnResources:{itemPlayLocked:false},
  ownPublic:{active:{printing:'Regidrago VSTAR SIT',
    energies:['Double Dragon Energy ROS','Double Dragon Energy ROS']},
    bench:[null],deckCount:3,discard:[],stadium:[],
    publicTurnRestrictions:{itemPlayLocked:false}},
  opponentPublic:{stadium:[]}};
}
test('genuine Store passes and donor prompts settle; clones cannot masquerade',()=>{
 const originalAi=FakeAi.prototype.decodeNextAction;
 const originalDispatch=FakeStore.prototype.dispatch;
 const injected={SimpleTacticsAi:FakeAi,Store:FakeStore,
  GamePhase:{PLAYER_TURN:2},
  cardActions:{PlayCardAction,PlayerType:{ANY:'any'},SlotType:{BOARD:'board'}},
  promptActions:{ResolvePromptAction},
  actorObservation:()=>ownerRoot()};
 const out=withFundedApexCompressorAfterPass(()=>{
  const live=new FakeStore(),ai=new FakeAi();
  live.dispatch(new AddPlayerAction());
  const clone=new FakeStore();
  clone.state={...live.state};
  assert.ok(ai.decodeNextAction(clone.state) instanceof PassTurnAction);
  const action=ai.decodeNextAction(live.state);
  assert.ok(action instanceof PlayCardAction);
  live.dispatch(action);
  const answer=ai.decodeNextAction(live.state);
  assert.ok(answer instanceof ResolvePromptAction);
  live.dispatch(answer);
  assert.deepEqual(live.state.players[0].discard.cards.map(x=>x.fullName),
    ['Dragapult ex TWM','Noivern ex PAL']);
  return 'settled';
 },0,injected);
 assert.equal(out.result,'settled');
 assert.equal(out.audit.observedLiveNativeStore,true);
 assert.equal(out.audit.afterPassRootCount,1);
 assert.equal(out.audit.eligibleAtAnyLiveOwnerRootCount,1);
 assert.equal(out.audit.sameRootCompetingActions[0].previousAction,'PassTurnAction');
 assert.equal(out.audit.acceptedItems,1);
 assert.equal(out.audit.ownerDeckPromptsAnswered,1);
 assert.equal(out.audit.physicalDragonMoved,2);
 assert.strictEqual(FakeAi.prototype.decodeNextAction,originalAi);
 assert.strictEqual(FakeStore.prototype.dispatch,originalDispatch);
});
