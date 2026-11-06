'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {withKoEffectPromptProvenance:watch,VERSION} =
  require('../simulation/twinleaf/agent3-ko-effect-prompt-provenance.cjs');

const GameMessage={CHOOSE_PRIZE_CARD:'CHOOSE_PRIZE_CARD'};
class AddPlayerAction {}
class PlayKoAction {constructor(victim){this.victim=victim;}}
class PlayOtherPrizeAction {constructor(taker){this.taker=taker;}}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class KnockOutEffect {
  constructor(player){this.player=player;this.prizeCount=1;
    this.preventDefault=false;this.prizeDestination=undefined;}
}
class ChoosePrizePrompt {
  constructor(taker,destination){
    this.playerId=taker.id;this.message=GameMessage.CHOOSE_PRIZE_CARD;
    this.options={count:1,destination};this.result=undefined;
  }
}
class Store {
  constructor(){
    this.state={players:[{id:10,hand:{}},{id:20,hand:{}}],
      prompts:[]};
    this.silent=false;
  }
  dispatch(action){
    if(action instanceof PlayKoAction){
      this.reduceEffect(this.state,
        new KnockOutEffect(this.state.players[action.victim]));
      const taker=this.state.players[1-action.victim];
      this.prompt(this.state,new ChoosePrizePrompt(taker,taker.hand));
    } else if(action instanceof PlayOtherPrizeAction){
      const taker=this.state.players[action.taker];
      this.prompt(this.state,new ChoosePrizePrompt(taker,taker.hand));
    } else if(action instanceof ResolvePromptAction && !this.silent){
      this.state.prompts.find(p=>p.id===action.id).result=action.result;
    }
    return this.state;
  }
  reduceEffect(state,effect){return state;}
  prompt(state,p){
    p.id=state.prompts.length+100;
    state.prompts.push(p);
    return state;
  }
}
const deps={Store,GameMessage};

for(const seat of [0,1]){
  test('real Store KO event joins Prize creation and native answer for seat '+seat,()=>{
    const original=Store.prototype.dispatch;
    const store=new Store();
    const {audit}=watch(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PlayKoAction(1-seat));
      store.dispatch(new ResolvePromptAction(100,['slot']));
    },deps);
    assert.equal(audit.version,VERSION);
    assert.equal(audit.eligibleKoEffects,1);
    assert.equal(audit.koCorrelatedPrompts,1);
    assert.equal(audit.settledKoCorrelatedAnswers,1);
    assert.equal(audit.unsettledKoCorrelatedAnswers,0);
    assert.equal(audit.unrelatedPrizePrompts,0);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(audit.uniqueCheckStateOriginCertified,false);
    assert.equal(audit.competitivelyQualifiedGames,0);
    assert.strictEqual(Store.prototype.dispatch,original);
  });
  test('unrelated Prize choice cannot inherit speculative KO '+seat,()=>{
    const store=new Store();
    const {audit}=watch(()=>{
      store.dispatch(new AddPlayerAction());
      store.reduceEffect(store.state,
        new KnockOutEffect(store.state.players[1-seat]));
      store.dispatch(new PlayOtherPrizeAction(seat));
      store.dispatch(new ResolvePromptAction(100,['slot']));
    },deps);
    assert.equal(audit.eligibleKoEffects,0);
    assert.equal(audit.unrelatedPrizePrompts,1);
    assert.equal(audit.koCorrelatedPrompts,0);
    assert.equal(audit.settledKoCorrelatedAnswers,0);
  });
}
test('a second simulator Store without real player registration is excluded',()=>{
  const real=new Store(),simulator=new Store();
  const {audit}=watch(()=>{
    real.dispatch(new AddPlayerAction());
    simulator.dispatch(new PlayKoAction(1));
    simulator.dispatch(new ResolvePromptAction(100,['slot']));
    real.dispatch(new PlayKoAction(1));
    real.dispatch(new ResolvePromptAction(100,['slot']));
  },deps);
  assert.equal(audit.eligibleKoEffects,1);
  assert.equal(audit.koCorrelatedPrompts,1);
  assert.equal(audit.settledKoCorrelatedAnswers,1);
});
test('native silent prompt no-op does not count as settled',()=>{
  const store=new Store();store.silent=true;
  const {audit}=watch(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayKoAction(1));
    store.dispatch(new ResolvePromptAction(100,['slot']));
  },deps);
  assert.equal(audit.eligibleKoEffects,1);
  assert.equal(audit.koCorrelatedPrompts,1);
  assert.equal(audit.unsettledKoCorrelatedAnswers,1);
  assert.equal(audit.settledKoCorrelatedAnswers,0);
});
test('throw restores all prototype methods and preserves audit',()=>{
  const before=['dispatch','reduceEffect','prompt']
    .map(k=>Store.prototype[k]);
  assert.throws(()=>watch(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayKoAction(1));
    throw new Error('fault');
  },deps),error=>{
    assert.equal(error.message,'fault');
    assert.equal(error.agent3KoProvenanceAudit.eligibleKoEffects,1);
    return true;
  });
  assert.deepEqual(['dispatch','reduceEffect','prompt']
    .map(k=>Store.prototype[k]),before);
});
