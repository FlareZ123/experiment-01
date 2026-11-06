'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withCheckStateGeneratorOriginToken:observe}=
  require('../simulation/twinleaf/agent3-checkstate-generator-origin-token.cjs');

class StartAction{}
class ResumeWaitAction{}
class ResolveAction{}
class RecheckAction{}
class ThrowAction{}
class TwoChecksSameRootAction{}
class KnockOutEffect {
  constructor(player,count=1){
    this.player=player;this.prizeCount=count;this.preventDefault=false;
  }
}
class DrawPrizesEffect{
  constructor(player,prizes){
    this.player=player;this.prizes=prizes;
    this.destination=player.hand;this.preventDefault=false;
  }
}
class ChoosePrizePrompt{
  constructor(player){
    this.playerId=player.id;this.options={count:1};
    this.message='CHOOSE_PRIZE_CARD';
  }
}
function secret(){
  const c={};
  Object.defineProperty(c,'name',{get(){throw Error('hidden Prize face read');}});
  return c;
}
const checkModule={
  checkState(store,state){
    if(state.checkMode==='defer'){
      store.reduceEffect(state,new KnockOutEffect(state.players[1],1));
      store.waitPrompt(state,()=>{
        store.reduceEffect(state,new DrawPrizesEffect(state.players[0],
          [{cards:[secret()]}]));
        store.prompt(state,new ChoosePrizePrompt(state.players[0]),()=>{
          store.reduceEffect(state,new DrawPrizesEffect(state.players[0],
            [{cards:[secret()]}]));
        });
      });
    }else if(state.checkMode==='ko-only'){
      store.reduceEffect(state,new KnockOutEffect(state.players[1],1));
    }else if(state.checkMode==='prize-only'){
      store.prompt(state,new ChoosePrizePrompt(state.players[0]),()=>{});
    }else if(state.checkMode==='automatic'){
      store.reduceEffect(state,new KnockOutEffect(state.players[1],3));
      store.reduceEffect(state,new DrawPrizesEffect(state.players[0],
        [{cards:[secret()]},{cards:[secret()]},{cards:[secret()]}]));
    }
    return state;
  }
};
class Store{
  constructor(){
    this.state={
      turn:5,phase:3,checkMode:'defer',
      players:[0,1].map(id=>({
        id,hand:{cards:[]},prizes:[{cards:[secret()]}]
      })),prompts:[]
    };
    this.waitItems=[];this.pending=[];
    this.calculatingPlayability=false;
  }
  dispatch(action){
    if(action instanceof ThrowAction)throw Error('injected root error');
    if(action instanceof StartAction)
      checkModule.checkState(this,this.state);
    if(action instanceof RecheckAction) {
      this.state.checkMode='automatic';
      checkModule.checkState(this,this.state);
    }
    if(action instanceof TwoChecksSameRootAction){
      this.state.checkMode='ko-only';
      checkModule.checkState(this,this.state);
      this.state.checkMode='prize-only';
      checkModule.checkState(this,this.state);
    }
    if(action instanceof ResumeWaitAction)
      this.waitItems.shift()();
    if(action instanceof ResolveAction)
      this.pending.shift()();
    return this.state;
  }
  waitPrompt(state,callback){this.waitItems.push(callback);return state;}
  prompt(state,prompt,callback){
    this.state.prompts.push(prompt);
    this.pending.push(callback);
    return state;
  }
  reduceEffect(state,effect){return state;}
}

test('same generator token persists across deferred native wait and prompt callbacks',()=>{
  const actual=new Store(),rootBinding={
    current:actual,currentTrialId:'6:210:B:champion-reference'
  };
  const original=Object.getOwnPropertyDescriptor(checkModule,'checkState');
  const methods=['waitPrompt','prompt','reduceEffect'].map(k=>Store.prototype[k]);
  const {audit}=observe(()=>{
    actual.dispatch(new StartAction());
    actual.dispatch(new ResumeWaitAction());
    actual.dispatch(new ResolveAction());
  },{Store,checkModule,rootBinding});
  assert.equal(audit.version,VERSION);
  assert.equal(audit.authoritativeChecks,1);
  assert.equal(audit.nativeKoEffects,1);
  assert.equal(audit.nativeDrawPrizesEffects,2);
  assert.equal(audit.sourcePrizePrompts,1);
  assert.equal(audit.deferredContinuationsRegistered,1);
  assert.equal(audit.deferredContinuationsResumed,1);
  assert.equal(audit.promptCallbacksRegistered,1);
  assert.equal(audit.promptCallbacksResumed,1);
  assert.equal(audit.sameTokenKoPrizePrompts,1);
  assert.equal(audit.sameTokenKoDrawPrizes,1);
  assert.equal(audit.tokenGroups.length,1);
  assert.equal(audit.tokenGroups[0].trialId,rootBinding.currentTrialId);
  assert.equal(audit.tokenGroups[0].ko[0].ownerSeat,1);
  assert.equal(audit.tokenGroups[0].draws.length,2);
  assert.equal(audit.observedHiddenPrizeCardFaces,false);
  assert.deepEqual(Object.getOwnPropertyDescriptor(checkModule,'checkState'),original);
  assert.deepEqual(['waitPrompt','prompt','reduceEffect'].map(k=>Store.prototype[k]),methods);
});

test('two native checkState invocations in one Store get distinct origin tokens',()=>{
  const actual=new Store(),rootBinding={current:actual,currentTrialId:'1:212:B:champion-reference'};
  const {audit}=observe(()=>{
    actual.dispatch(new StartAction());
    actual.dispatch(new RecheckAction());
    actual.dispatch(new ResumeWaitAction());
  },{Store,checkModule,rootBinding});
  assert.equal(audit.authoritativeChecks,2);
  assert.equal(audit.nativeKoEffects,2);
  assert.equal(audit.nativeDrawPrizesEffects,4);
  assert.equal(audit.tokenGroups.length,2);
  assert.notEqual(audit.tokenGroups[0].token,audit.tokenGroups[1].token);
  assert.deepEqual(audit.tokenGroups.map(x=>x.ko[0].count),[1,3]);
  assert.equal(audit.sameTokenKoDrawPrizes,2);
  assert.equal(audit.sameTokenKoPrizePrompts,1);
});

test('two checks in the SAME Store root must not falsely join unrelated KO and Prize prompt',()=>{
  const actual=new Store(),rootBinding={
    current:actual,currentTrialId:'11:211:A:champion-reference'
  };
  const {audit}=observe(()=>{
    actual.dispatch(new TwoChecksSameRootAction());
  },{Store,checkModule,rootBinding});
  assert.equal(audit.authoritativeChecks,2);
  assert.equal(audit.nativeKoEffects,1);
  assert.equal(audit.sourcePrizePrompts,1);
  assert.equal(audit.tokenGroups.length,2);
  const first=audit.tokenGroups.find(row=>row.ko.length>0);
  const second=audit.tokenGroups.find(row=>row.prompts.length>0);
  assert.ok(first&&second);
  assert.notEqual(first.token,second.token);
  assert.equal(first.prompts.length,0);
  assert.equal(second.ko.length,0);
  assert.equal(audit.sameTokenKoPrizePrompts,0);
});

test('foreign Store checkState cannot impersonate authoritative Store context',()=>{
  const actual=new Store(),foreign=new Store();
  const rootBinding={current:actual,currentTrialId:'6:210:B:champion-reference'};
  const {audit}=observe(()=>{
    foreign.dispatch(new RecheckAction());
    actual.dispatch(new RecheckAction());
  },{Store,checkModule,rootBinding});
  assert.equal(audit.authoritativeChecks,1);
  assert.equal(audit.foreignChecks,1);
  assert.equal(audit.nativeKoEffects,1);
  assert.equal(audit.nativeDrawPrizesEffects,1);
});

test('error restores prototype and checkState module exports',()=>{
  const actual=new Store(),rootBinding={current:actual};
  const original=checkModule.checkState;
  const before=['waitPrompt','prompt','reduceEffect'].map(k=>Store.prototype[k]);
  assert.throws(()=>observe(()=>{
    actual.dispatch(new StartAction());
    actual.dispatch(new ThrowAction());
  },{Store,checkModule,rootBinding}),error=>{
    assert.equal(error.message,'injected root error');
    assert.equal(error.agent3GeneratorOriginAudit.authoritativeChecks,1);
    return true;
  });
  assert.strictEqual(checkModule.checkState,original);
  assert.deepEqual(['waitPrompt','prompt','reduceEffect'].map(k=>Store.prototype[k]),before);
});
