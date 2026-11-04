'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativePrizeZoneCustody,VERSION}=
  require('../simulation/twinleaf/agent20-native-prize-zone-custody.cjs');

class AddPlayerAction {}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class FakeStore{
  constructor(){
    this.state={
      turn:5,
      players:[{id:1,hand:{cards:[]},
        prizes:[{cards:[{}]},{cards:[{}]}]}],
      prompts:[]
    };
  }
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const prize=this.state.players[0].prizes[0];
      this.state.players[0].hand.cards.push(prize.cards.pop());
      this.state.prompts[0].result=action.result;
    }
    return true;
  }
}
function testPrompt(){
  const store=new FakeStore();
  const prompt={
    id:13,result:undefined,constructor:{name:'ChoosePrizePrompt'},
    message:'CHOOSE_PRIZE_CARD',playerId:1,
    options:{count:1,useOpponentPrizes:false,allowCancel:false},
    getPerspectivePlayerId:()=>1
  };
  store.state.prompts.push(prompt);
  return store;
}
test('genuine owner Prize transfer produces only count evidence',()=>{
  const original=FakeStore.prototype.dispatch;
  const store=testPrompt();
  const outcome=withNativePrizeZoneCustody(()=>{
    store.dispatch(new AddPlayerAction());
    return store.dispatch(new ResolvePromptAction(13,[store.state.players[0].prizes[0]]));
  },{Store:FakeStore});
  assert.equal(outcome.result,true);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
  assert.equal(outcome.audit.version,VERSION);
  assert.equal(outcome.audit.acceptedPrizePromptActions,1);
  assert.equal(outcome.audit.postDispatchZoneTransfersObserved,1);
  assert.equal(outcome.audit.events[0].before.hand,0);
  assert.equal(outcome.audit.events[0].after.hand,1);
  assert.equal(outcome.audit.events[0].before.prizes,2);
  assert.equal(outcome.audit.events[0].after.prizes,1);
  assert.equal(outcome.audit.concealedCardFacesRead,false);
});

test('speculative unmatched Store and non-Prize prompt never count',()=>{
  const store=testPrompt();
  const clone=testPrompt();
  const result=withNativePrizeZoneCustody(()=>{
    store.dispatch(new AddPlayerAction());
    clone.dispatch(new ResolvePromptAction(13,[]));
    return 'finished';
  },{Store:FakeStore});
  assert.equal(result.result,'finished');
  assert.equal(result.audit.acceptedPrizePromptActions,0);
});

test('observer persists a safe failure audit and restores dispatch',()=>{
  const original=FakeStore.prototype.dispatch;
  const error=new Error('fixture native abort');
  const store=testPrompt();
  assert.throws(()=>withNativePrizeZoneCustody(()=>{
    store.dispatch(new AddPlayerAction());
    throw error;
  },{Store:FakeStore}),/native abort/);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
  assert.equal(error.agent20PrizeZoneCustodyAudit.acceptedPrizePromptActions,0);
  assert.equal(error.agent20PrizeZoneCustodyAudit.concealedCardFacesRead,false);
});
