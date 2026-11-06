'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withKoSourcePromptPhysical:observe}=
  require('../simulation/twinleaf/agent3-ko-source-prompt-physical-v4.cjs');

const GameMessage={CHOOSE_PRIZE_CARD:'CHOOSE_PRIZE_CARD'};
class AddPlayerAction {}
class KoAction {constructor(victim){this.victim=victim;}}
class OrphanKoAction {constructor(victim){this.victim=victim;}}
class OtherPrizeAction {constructor(taker){this.taker=taker;}}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class KnockOutEffect {
  constructor(player){
    this.player=player;this.prizeCount=1;
    this.preventDefault=false;this.prizeDestination=undefined;
  }
}
class ChoosePrizePrompt {
  constructor(taker){
    this.playerId=taker.id;this.message=GameMessage.CHOOSE_PRIZE_CARD;
    this.options={count:1,destination:taker.hand};this.result=undefined;
  }
}
function card(){
  const value={};
  Object.defineProperty(value,'name',{get(){
    throw Error('Hidden Prize face was accessed');
  }});
  return value;
}
class Store {
  constructor(){
    this.silent=false;
    this.state={
      players:[0,1].map(id=>({
        id,hand:{cards:[]},lostzone:{cards:[]},
        prizes:[{cards:[card()]}]
      })),
      prompts:[],turn:5,phase:3
    };
  }
  dispatch(action){
    if(action instanceof KoAction || action instanceof OrphanKoAction){
      this.reduceEffect(this.state,new KnockOutEffect(
        this.state.players[action.victim]));
      if(action instanceof KoAction){
        this.prompt(this.state,new ChoosePrizePrompt(
          this.state.players[1-action.victim]));
      }
    } else if(action instanceof OtherPrizeAction){
      this.prompt(this.state,new ChoosePrizePrompt(
        this.state.players[action.taker]));
    } else if(action instanceof ResolvePromptAction && !this.silent){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      prompt.result=action.result;
      const taker=this.state.players.find(p=>p.id===prompt.playerId);
      for(const slot of action.result)
        taker.hand.cards.push(...slot.cards.splice(0,slot.cards.length));
    }
    return this.state;
  }
  reduceEffect(state){return state;}
  prompt(state,prompt){
    prompt.id=state.prompts.length+1;
    state.prompts.push(prompt);
    return state;
  }
}
const deps={Store,GameMessage};
function choose(store,seat){
  store.dispatch(new KoAction(1-seat));
  store.dispatch(new ResolvePromptAction(store.state.prompts.length,
    [store.state.players[seat].prizes[0]]));
}

for(const seat of [0,1]){
  test('authoritative callback-root KO matches physical selected Prize in seat '+seat,()=>{
    const actual=new Store(),rootBinding={current:null};
    const original=Store.prototype.dispatch;
    const {audit}=observe(()=>{
      rootBinding.current=actual;
      actual.dispatch(new AddPlayerAction());
      choose(actual,seat);
    },{...deps,rootBinding});
    assert.equal(audit.version,VERSION);
    assert.equal(audit.registeredStoreSessions,1);
    assert.equal(audit.rootStoreCallbackBindingRequired,true);
    assert.equal(audit.ignoredUnboundAddPlayerActions,0);
    assert.equal(audit.eligibleKoEffects,1);
    assert.equal(audit.exactSourceJoinedHandTransfers,1);
    assert.equal(audit.expiredUnjoinedKoEffects,0);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(audit.chosenPrizeFacesReadByPolicy,false);
    assert.equal(audit.realStoreIdentityProofComplete,false);
    assert.strictEqual(Store.prototype.dispatch,original);
  });

  test('unregistered speculative AddPlayerAction cannot shadow authoritative Store seat '+seat,()=>{
    const actual=new Store(),simulation=new Store();
    const rootBinding={current:null};
    const {audit}=observe(()=>{
      rootBinding.current=actual;
      actual.dispatch(new AddPlayerAction());
      simulation.dispatch(new AddPlayerAction());
      choose(simulation,seat);
      choose(actual,seat);
    },{...deps,rootBinding});
    assert.equal(audit.registeredStoreSessions,1);
    assert.equal(audit.ignoredUnboundAddPlayerActions,1);
    assert.equal(audit.eligibleKoEffects,1);
    assert.equal(audit.nativeSourcePrompts,1);
    assert.equal(audit.exactSourceJoinedHandTransfers,1);
  });

  test('unjoined old-root KO cannot label later unrelated Prize seat '+seat,()=>{
    const actual=new Store(),rootBinding={current:actual};
    const {audit}=observe(()=>{
      actual.dispatch(new AddPlayerAction());
      actual.dispatch(new OrphanKoAction(1-seat));
      actual.dispatch(new OtherPrizeAction(seat));
      actual.dispatch(new ResolvePromptAction(1,
        [actual.state.players[seat].prizes[0]]));
    },{...deps,rootBinding});
    assert.equal(audit.eligibleKoEffects,1);
    assert.equal(audit.expiredUnjoinedKoEffects,1);
    assert.equal(audit.unrelatedPrizePrompts,1);
    assert.equal(audit.exactSourceJoinedHandTransfers,0);
  });
}

test('native silent no-op cannot count as settled when callback-root bound',()=>{
  const actual=new Store(),rootBinding={current:actual};
  actual.silent=true;
  const {audit}=observe(()=>{
    actual.dispatch(new AddPlayerAction());
    choose(actual,0);
  },{...deps,rootBinding});
  assert.equal(audit.nativeSourceUnresolvedAnswers,1);
  assert.equal(audit.nativeSourceSettledAnswers,0);
});

test('binding is mandatory and prototype method descriptors survive thrown roots',()=>{
  assert.throws(()=>observe(()=>null,deps),/root-bound provenance|root-bound|Root-bound/);
  const originals=['dispatch','prompt','reduceEffect'].map(x=>Store.prototype[x]);
  const actual=new Store(),rootBinding={current:actual};
  assert.throws(()=>observe(()=>{
    actual.dispatch(new AddPlayerAction());
    actual.dispatch(new KoAction(1));
    throw Error('injected');
  },{...deps,rootBinding}),error=>{
    assert.equal(error.message,'injected');
    assert.equal(error.agent3KoSourcePhysicalAudit.eligibleKoEffects,1);
    return true;
  });
  assert.deepEqual(['dispatch','prompt','reduceEffect'].map(x=>Store.prototype[x]),
    originals);
});
