'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerSetupConfirm,withOwnerSetupConfirm:setup}=
  require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ConfirmPrompt{
  constructor(id,playerId,message){
    this.id=id;this.playerId=playerId;this.message=message;
    this.result=undefined;
  }
  validate(value){return typeof value==='boolean';}
}
class ChooseCardsPrompt{
  constructor(id,playerId){
    this.id=id;this.playerId=playerId;this.result=undefined;
  }
}
class Store{
  constructor(state){this.state=state;this.accepted=[];}
  dispatch(action){
    this.accepted.push(action);
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      assert.ok(prompt);
      prompt.result=action.result;
    }
    return this.state;
  }
}
class Bot{
  constructor(id){this.client={id};this.nativeReads=0;}
  decodeNextAction(state){
    this.nativeReads++;
    return state.concealedOpponentHand;
  }
}
function fakeEngine(seat,firstPrompt='ConfirmPrompt',hidden=['one']){
  const id=seat===0?'A':'B';
  return {
    bot:new Bot(id),store:new Store({
      phase:1,turn:0,players:[{id:'A'},{id:'B'}],
      concealedOpponentHand:[...hidden],
      prompts:firstPrompt==='ConfirmPrompt'?
        [new ConfirmPrompt(11,id,'setup-consent')]:
        [new ChooseCardsPrompt(11,id)]
    })
  };
}
const deps={
  SimpleTacticsAi:Bot,Store,ResolvePromptAction,
  observe(state,seat){
    return Object.freeze({
      actorSeat:seat,decisionKind:'owner-prompt',
      globalTurn:state.turn,phase:state.phase
    });
  },
  validate(state,action){
    const prompt=state.prompts.find(p=>p.id===action.id);
    assert.equal(prompt?.validate(action.result),true);
  }
};

test('pure setup confirmation always declines with detached owner view',()=>{
  const view=Object.freeze({
    decisionKind:'owner-prompt',phase:1,globalTurn:0,
    ownHand:['secret-owner-only']
  });
  const decision=chooseOwnerSetupConfirm(view,{
    kind:'ConfirmPrompt',message:'owner-visible'
  });
  assert.deepEqual(decision,{kind:'owner-setup-confirm',answer:false});
  assert.equal(Object.isFrozen(decision),true);
  assert.throws(()=>chooseOwnerSetupConfirm({...view,phase:2},
    {kind:'ConfirmPrompt'}),{name:'AssertionError'});
});

test('genuine setup confirmation answered on both seats without native decoder',()=>{
  const before=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  for(const seat of [0,1])for(const hidden of [
    ['Alpha','Beta'],['Beta','Alpha']
  ]){
    const {bot,store}=fakeEngine(seat,'ConfirmPrompt',hidden);
    const r=setup(()=>{
      store.dispatch(new AddPlayerAction());
      const action=bot.decodeNextAction(store.state);
      assert.ok(action instanceof ResolvePromptAction);
      store.dispatch(action);
      return action.result;
    },deps);
    assert.equal(r.result,false);
    assert.equal(r.audit.selected,1);
    assert.equal(r.audit.accepted,1);
    assert.equal(r.audit.bySeat[seat],1);
    assert.equal(bot.nativeReads,0);
  }
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Bot.prototype,'decodeNextAction'),before);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),beforeDispatch);
});

test('native fallback quarantine remains live for unsupported owner prompt',()=>{
  for(const seat of [0,1]){
    const {bot,store}=fakeEngine(seat,'ChooseCardsPrompt');
    assert.throws(()=>quarantine(()=>setup(()=>{
      store.dispatch(new AddPlayerAction());
      bot.decodeNextAction(store.state);
    },deps),{SimpleTacticsAi:Bot}),error=>{
      assert.equal(error.code,CODE);
      assert.equal(error.ownerSetupConfirmAudit.selected,0);
      assert.equal(error.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,1);
      assert.equal(bot.nativeReads,0);
      return true;
    });
  }
});

test('safe Confirm then next prompt delegates and preserves accepted history',()=>{
  const {bot,store}=fakeEngine(1);
  assert.throws(()=>quarantine(()=>setup(()=>{
    store.dispatch(new AddPlayerAction());
    const confirm=bot.decodeNextAction(store.state);
    store.dispatch(confirm);
    store.state.prompts=[new ChooseCardsPrompt(12,'B')];
    bot.decodeNextAction(store.state);
  },deps),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.ownerSetupConfirmAudit.selected,1);
    assert.equal(error.ownerSetupConfirmAudit.accepted,1);
    assert.equal(store.accepted.length,2);
    assert.equal(bot.nativeReads,0);
    return true;
  });
});
