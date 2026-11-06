'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withKoSourcePromptPhysical:watch}=
  require('../simulation/twinleaf/agent3-ko-source-prompt-physical-v3.cjs');

const GameMessage={CHOOSE_PRIZE_CARD:'CHOOSE_PRIZE_CARD'};
class AddPlayerAction {}
class KoAction {constructor(victim){this.victim=victim;}}
class OrphanKoAction {constructor(victim){this.victim=victim;}}
class OtherPrizeAction {constructor(taker){this.taker=taker;}}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class KnockOutEffect {
  constructor(player){this.player=player;this.prizeCount=1;
    this.preventDefault=false;this.prizeDestination=undefined;}
}
class ChoosePrizePrompt {
  constructor(owner,destination){
    this.playerId=owner.id;this.message=GameMessage.CHOOSE_PRIZE_CARD;
    this.options={count:1,destination};this.result=undefined;
  }
}
function hiddenCard(){
  const card={};
  for(const name of ['name','fullName','text','id'])
    Object.defineProperty(card,name,{get(){throw Error('Hidden Prize read')}});
  return card;
}
class Store {
  constructor(mode='hand'){
    this.mode=mode;
    this.state={
      players:[0,1].map(id=>({id,hand:{cards:[]},lostzone:{cards:[]},
        prizes:[{cards:[hiddenCard()]}]})),
      prompts:[],turn:5,phase:3
    };
  }
  dispatch(action){
    if(action instanceof KoAction) {
      this.reduceEffect(this.state,
        new KnockOutEffect(this.state.players[action.victim]));
      const taker=this.state.players[1-action.victim];
      this.prompt(this.state,new ChoosePrizePrompt(taker,taker.hand));
    } else if(action instanceof OrphanKoAction) {
      this.reduceEffect(this.state,
        new KnockOutEffect(this.state.players[action.victim]));
    } else if(action instanceof OtherPrizeAction) {
      const taker=this.state.players[action.taker];
      this.prompt(this.state,new ChoosePrizePrompt(taker,taker.hand));
    } else if(action instanceof ResolvePromptAction &&
              this.mode!=='silent') {
      const p=this.state.prompts.find(p=>p.id===action.id);
      p.result=action.result;
      if(this.mode!=='no-transfer') {
        const owner=this.state.players.find(x=>x.id===p.playerId);
        const target=this.mode==='lost-zone'?owner.lostzone:owner.hand;
        for(const slot of action.result)
          target.cards.push(...slot.cards.splice(0,slot.cards.length));
      }
    }
    return this.state;
  }
  reduceEffect(state,effect){return state;}
  prompt(state,p){p.id=state.prompts.length+1;state.prompts.push(p);return state;}
}
const deps={Store,GameMessage};
function play(store,taker){
  store.dispatch(new AddPlayerAction());
  store.dispatch(new KoAction(1-taker));
  store.dispatch(new ResolvePromptAction(1,
    [store.state.players[taker].prizes[0]]));
}
for(const seat of [0,1]){
  for(const mode of ['hand','lost-zone','no-transfer','silent']){
    test('same KO prompt and physical custody seat '+seat+' mode '+mode,()=>{
      const store=new Store(mode);
      const original=Store.prototype.dispatch;
      const {audit}=watch(()=>play(store,seat),deps);
      assert.equal(audit.version,VERSION);
      assert.equal(audit.registeredStoreSessions,1);
      assert.equal(audit.eligibleKoEffects,1);
      assert.equal(audit.nativeSourcePrompts,1);
      assert.equal(audit.exactSourceJoinedHandTransfers,
        mode==='hand'?1:0);
      assert.equal(audit.exactSourceJoinedLostZoneTransfers,
        mode==='lost-zone'?1:0);
      assert.equal(audit.sourceJoinedOtherDestinations,
        mode==='no-transfer'?1:0);
      assert.equal(audit.nativeSourceUnresolvedAnswers,
        mode==='silent'?1:0);
      assert.equal(audit.nativeSourceSettledAnswers,
        mode==='silent'?0:1);
      assert.equal(audit.records.length,mode==='silent'?0:1);
      if(mode!=='silent'){
        assert.equal(audit.records[0].seat,seat);
        assert.equal(audit.records[0].turn,5);
        assert.equal(audit.records[0].selectedPhysicalCards,1);
        assert.equal(audit.records[0].session,1);
      }
      assert.equal(audit.chosenPrizeFacesReadByPolicy,false);
      assert.equal(audit.uniqueCheckStateOriginCertified,false);
      assert.strictEqual(Store.prototype.dispatch,original);
    });
  }
  test('unrelated prompt and speculative reducer cannot count as KO seat '+seat,()=>{
    const store=new Store();
    const {audit}=watch(()=>{
      store.dispatch(new AddPlayerAction());
      store.reduceEffect(store.state,
        new KnockOutEffect(store.state.players[1-seat]));
      store.dispatch(new OtherPrizeAction(seat));
      store.dispatch(new ResolvePromptAction(1,
        [store.state.players[seat].prizes[0]]));
    },deps);
    assert.equal(audit.eligibleKoEffects,0);
    assert.equal(audit.unrelatedPrizePrompts,1);
    assert.equal(audit.nativeSourcePrompts,0);
    assert.equal(audit.exactSourceJoinedHandTransfers,0);
  });
}
test('hypothetical Store with no real player registration excluded',()=>{
  const actual=new Store(),hypothetical=new Store();
  const {audit}=watch(()=>{
    actual.dispatch(new AddPlayerAction());
    hypothetical.dispatch(new KoAction(1));
    hypothetical.dispatch(new ResolvePromptAction(1,
      [hypothetical.state.players[0].prizes[0]]));
    actual.dispatch(new KoAction(1));
    actual.dispatch(new ResolvePromptAction(1,
      [actual.state.players[0].prizes[0]]));
  },deps);
  assert.equal(audit.registeredStoreSessions,1);
  assert.equal(audit.exactSourceJoinedHandTransfers,1);
});
test('simulated KO while native Store is calculating playability is excluded',()=>{
  const actual=new Store();
  const {audit}=watch(()=>{
    actual.dispatch(new AddPlayerAction());
    actual.calculatingPlayability=true;
    actual.dispatch(new KoAction(1));
    actual.calculatingPlayability=false;
    actual.dispatch(new ResolvePromptAction(1,
      [actual.state.players[0].prizes[0]]));
  },deps);
  assert.equal(audit.eligibleKoEffects,0);
  assert.equal(audit.nativeSourcePrompts,0);
  assert.equal(audit.exactSourceJoinedHandTransfers,0);
});
test('separate native Store episodes have distinct session ordinals',()=>{
  const a=new Store(),b=new Store();
  const {audit}=watch(()=>{play(a,0);play(b,1);},deps);
  assert.equal(audit.registeredStoreSessions,2);
  assert.deepEqual(audit.records.map(x=>x.session),[1,2]);
  assert.deepEqual(audit.records.map(x=>x.seat),[0,1]);
});
test('exception restores all native methods and abort-side audit',()=>{
  const original=['dispatch','prompt','reduceEffect']
    .map(k=>Store.prototype[k]);
  assert.throws(()=>watch(()=>{
    const s=new Store();s.dispatch(new AddPlayerAction());
    s.dispatch(new KoAction(1));throw Error('injected failure');
  },deps),error=>{
    assert.equal(error.message,'injected failure');
    assert.equal(error.agent3KoSourcePhysicalAudit.eligibleKoEffects,1);
    return true;
  });
  assert.deepEqual(['dispatch','prompt','reduceEffect']
    .map(k=>Store.prototype[k]),original);
});

for(const seat of [0,1]){
  test('orphan KO on an earlier root cannot taint unrelated later Prize choice seat '+seat,()=>{
    const store=new Store();
    const {audit}=watch(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new OrphanKoAction(1-seat));
      store.dispatch(new OtherPrizeAction(seat));
      store.dispatch(new ResolvePromptAction(1,
        [store.state.players[seat].prizes[0]]));
    },deps);
    assert.equal(audit.eligibleKoEffects,1);
    assert.equal(audit.expiredUnjoinedKoEffects,1);
    assert.equal(audit.unrelatedPrizePrompts,1);
    assert.equal(audit.nativeSourcePrompts,0);
    assert.equal(audit.nativeSourceSettledAnswers,0);
    assert.equal(audit.exactSourceJoinedHandTransfers,0);
  });
}
