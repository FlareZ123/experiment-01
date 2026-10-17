'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  firstMismatch,differingLeafPaths,withSourceContinuity,withRootPolicyMutationAudit,hash,cardHistory
}=require('../simulation/twinleaf/source-state-continuity.cjs');

class AddPlayerAction {}
class AddOne {}
class Store {
  constructor(){this.state={count:0,card:{damageTakenLastTurn:0}};}
  dispatch(action) {
    if (action instanceof AddPlayerAction || action instanceof AddOne) {
      this.state.count++;
    }
    return this.state.count;
  }
}
const sample=state=>({
  count:state.count,damageTakenLastTurn:state.card.damageTakenLastTurn
});

test('field-level difference detects a mutable Card scalar',()=>{
  const diff=firstMismatch({a:[{history:0}]},{a:[{history:70}]});
  assert.deepEqual(diff,{path:'$.a[0].history',before:0,after:70});
  assert.equal(firstMismatch({a:1},{a:1}),null);
  assert.notEqual(hash({a:1}),hash({a:2}));
  assert.deepEqual(cardHistory([{fullName:'Dragon A',damageTakenLastTurn:20},
    {fullName:'Item X'}]),[
    {printing:'Dragon A',damageTakenLastTurn:20},
    {printing:'Item X',damageTakenLastTurn:null}
  ]);
});

test('exhaustive selected-state differences expose changes beyond first array-length discrepancy',()=>{
  const oldState={zones:{previousAttack:[{source:'A',attack:'Kaiser Tackle'}],
    zzPrivate:[{hand:['Energy'],deck:['Dragon']}]},cardHistory:[]};
  const newState={zones:{previousAttack:[],
    zzPrivate:[{hand:['Energy'],deck:['Replaced Dragon']}]},cardHistory:[]};
  assert.equal(firstMismatch(oldState,newState).path,'$.zones.previousAttack.length');
  const paths=differingLeafPaths(oldState,newState);
  assert.ok(paths.includes('$.zones.previousAttack.length'));
  assert.ok(paths.includes('$.zones.previousAttack[0]'));
  assert.ok(paths.includes('$.zones.zzPrivate[0].deck[0]'));
  assert.equal(differingLeafPaths(oldState,oldState).length,0);
});

test('changes inside Store.dispatch do not create a continuity gap',()=>{
  const store=new Store(),prior=Store.prototype.dispatch;
  const capture=withSourceContinuity(Store,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AddOne());
    return store.dispatch(new AddOne());
  },{snapshot:sample});
  assert.equal(capture.result,3);
  assert.equal(capture.liveDispatches,3);
  assert.deepEqual(capture.discontinuities,[]);
  assert.equal(Store.prototype.dispatch,prior);
});

test('mutation between root actions is detected',()=>{
  const store=new Store();
  const capture=withSourceContinuity(Store,()=>{
    store.dispatch(new AddPlayerAction());
    store.state.card.damageTakenLastTurn=90;
    store.dispatch(new AddOne());
    return store.state.count;
  },{snapshot:sample});
  assert.equal(capture.result,2);
  assert.equal(capture.discontinuities.length,1);
  assert.equal(capture.discontinuities[0].nextAction,'AddOne');
  assert.deepEqual(capture.discontinuities[0].changedLeafPaths,
    ['$.damageTakenLastTurn']);
  assert.deepEqual(capture.discontinuities[0].firstMismatch,{
    path:'$.damageTakenLastTurn',before:0,after:90
  });
});

test('ignores speculative Stores and restores wrapper on failure',()=>{
  const live=new Store(),sim=new Store(),prior=Store.prototype.dispatch;
  const capture=withSourceContinuity(Store,()=>{
    live.dispatch(new AddPlayerAction());
    sim.dispatch(new AddOne());
    live.dispatch(new AddOne());
  },{snapshot:sample});
  assert.equal(capture.liveDispatches,2);
  assert.equal(capture.otherDispatches,1);
  assert.equal(capture.discontinuities.length,0);
  assert.equal(Store.prototype.dispatch,prior);
  assert.throws(()=>withSourceContinuity(Store,()=>{
    live.dispatch(new AddPlayerAction());
    throw new Error('deliberate');
  },{snapshot:sample}),/deliberate/);
  assert.equal(Store.prototype.dispatch,prior);
});

test('policy observation is read-only for a pure bot',()=>{
  class TestBot {decodeNextAction(){return new AddOne();}}
  const live=new Store(),bot=new TestBot();
  const result=withRootPolicyMutationAudit(Store,TestBot,()=>{
    live.dispatch(new AddPlayerAction());
    live.dispatch(bot.decodeNextAction(live.state));
    return live.state.count;
  },{snapshot:sample});
  assert.equal(result.result,2);
  assert.equal(result.rootPolicyCalls,1);
  assert.deepEqual(result.rootPolicyStateMutations,[]);
});

test('policy observer attributes an actual source scalar write',()=>{
  class TestBot {
    decodeNextAction(state){
      state.card.damageTakenLastTurn=200;
      return new AddOne();
    }
  }
  const live=new Store(),bot=new TestBot();
  const result=withRootPolicyMutationAudit(Store,TestBot,()=>{
    live.dispatch(new AddPlayerAction());
    live.dispatch(bot.decodeNextAction(live.state));
  },{snapshot:sample});
  assert.equal(result.rootPolicyCalls,1);
  assert.equal(result.rootPolicyStateMutations.length,1);
  assert.equal(result.rootPolicyStateMutations[0].firstMismatch.path,
    '$.damageTakenLastTurn');
  assert.equal(result.rootPolicyStateMutations[0].firstMismatch.after,200);
});

test('opt-in policy history repair only restores physical Card history',()=>{
  const {withRootCardHistoryRepair}=
    require('../simulation/twinleaf/root-bot-history-repair.cjs');
  class PokemonCard {
    constructor(){this.fullName='Regidrago VSTAR SIT';this.damageTakenLastTurn=0;}
  }
  const physical=new PokemonCard();
  const zone=cards=>({cards});
  const player=cards=>({active:zone(cards),bench:[],hand:zone([]),
    deck:zone([]),discard:zone([]),lostzone:zone([]),prizes:[]});
  const game=new Store();
  game.state.players=[player([physical]),player([])];
  class Policy {
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      state.players[0].active.cards[0].damageTakenLastTurn=200;
      return new AddOne();
    }
  }
  const bot=new Policy();
  const audit=withRootCardHistoryRepair(Store,Policy,PokemonCard,()=>{
    game.dispatch(new AddPlayerAction());
    game.dispatch(bot.decodeNextAction(game.state));
    return game.state.count;
  });
  assert.equal(audit.result,2);
  assert.equal(audit.restorationEvents.length,1);
  assert.equal(audit.restorationEvents[0].edits[0].changed,200);
  assert.equal(physical.damageTakenLastTurn,0);
});


test('outer pre-dispatch hook produces a continuity gap without speculative policy activity',()=>{
  class PassTurnAction{}
  const store=new Store(),prior=Store.prototype.dispatch;
  const observed=withSourceContinuity(Store,()=>{
    const inner=Store.prototype.dispatch;
    Store.prototype.dispatch=function(action){
      if(action instanceof PassTurnAction) this.state.card.damageTakenLastTurn=150;
      return inner.call(this,action);
    };
    try{
      store.dispatch(new AddPlayerAction());
      return store.dispatch(new PassTurnAction());
    }finally{Store.prototype.dispatch=inner;}
  },{snapshot:sample});
  assert.equal(observed.discontinuities.length,1);
  assert.equal(observed.discontinuities[0].nextAction,'PassTurnAction');
  assert.deepEqual(observed.discontinuities[0].firstMismatch,{
    path:'$.damageTakenLastTurn',before:0,after:150
  });
  assert.equal(Store.prototype.dispatch,prior);
});

test('outer post-dispatch hook produces a later continuity gap without policy evaluation',()=>{
  class ResolvePromptAction{}
  const store=new Store(),prior=Store.prototype.dispatch;
  const observed=withSourceContinuity(Store,()=>{
    const inner=Store.prototype.dispatch;
    Store.prototype.dispatch=function(action){
      const result=inner.call(this,action);
      if(action instanceof ResolvePromptAction) this.state.card.damageTakenLastTurn=200;
      return result;
    };
    try{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new ResolvePromptAction());
      return store.dispatch(new AddOne());
    }finally{Store.prototype.dispatch=inner;}
  },{snapshot:sample});
  assert.equal(observed.discontinuities.length,1);
  assert.equal(observed.discontinuities[0].nextAction,'AddOne');
  assert.deepEqual(observed.discontinuities[0].firstMismatch,{
    path:'$.damageTakenLastTurn',before:0,after:200
  });
  assert.equal(Store.prototype.dispatch,prior);
});
