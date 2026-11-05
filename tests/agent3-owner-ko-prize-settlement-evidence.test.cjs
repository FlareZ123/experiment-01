'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION,withOwnerKoPrizeSettlementEvidence:watch
} = require('../simulation/twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs');

const GameMessage={CHOOSE_PRIZE_CARD:'CHOOSE_PRIZE_CARD'};
class AddPlayerAction {}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ChoosePrizePrompt {
  constructor(owner,destination){
    this.id=44;this.playerId=owner.id;
    this.message=GameMessage.CHOOSE_PRIZE_CARD;
    this.options={count:1,allowCancel:false,useOpponentPrizes:false,
      blocked:[],destination};
    this.result=undefined;
  }
}
/** @param {object} owner @param {string} mode */
class Store {
  constructor(state,mode){this.state=state;this.mode=mode;}
  dispatch(action){
    if(action instanceof AddPlayerAction)return this.state;
    const p=this.state.prompts.find(p=>
      p.id===action.id&&p.result===undefined);
    assert.ok(p);
    if(this.mode==='silent')return this.state;
    p.result=action.result;
    if(this.mode!=='no-transfer'){
      const owner=this.state.players.find(x=>x.id===p.playerId);
      const target=this.mode==='lost-zone'?owner.lostzone:owner.hand;
      for(const slot of action.result)
        target.cards.push(...slot.cards.splice(0,slot.cards.length));
    }
    return this.state;
  }
}
const deps={Store,GameMessage};
function privatePrizeCard(){
  const card={};
  Object.defineProperties(card,{
    name:{get(){throw Error('Read hidden Prize name')}},
    fullName:{get(){throw Error('Read hidden Prize printing')}}
  });
  return card;
}
/**
 * @param {number} seat
 * @param {'hand'|'lost-zone'|'silent'|'no-transfer'} mode
 * @param {boolean} [omitDestination]
 */
function fixture(seat,mode,omitDestination=false){
  const players=[0,1].map(id=>({
    id,hand:{cards:[]},lostzone:{cards:[]},
    prizes:Array.from({length:6},(_,i)=>({
      cards:i===0?[privatePrizeCard()]:[]
    }))
  }));
  const owner=players[seat];
  const prompt=new ChoosePrizePrompt(owner,
    omitDestination?undefined:owner.hand);
  const state={phase:3,turn:9,players,prompts:[prompt]};
  const store=new Store(state,mode);
  const action=new ResolvePromptAction(prompt.id,[owner.prizes[0]]);
  return {owner,prompt,store,action};
}
for(const seat of [0,1]){
  test('exact owner-hand Prize transfer settled on seat '+seat,()=>{
    const f=fixture(seat,'hand');
    const earlier=Store.prototype.dispatch;
    const {audit}=watch(()=>{
      f.store.dispatch(new AddPlayerAction());
      f.store.dispatch(f.action);
    },deps);
    assert.equal(audit.version,VERSION);
    assert.equal(audit.nativeResolved,1);
    assert.equal(audit.exactOwnerHandTransfers,1);
    assert.equal(audit.exactOwnerLostZoneTransfers,0);
    assert.equal(audit.otherOrUnverifiedDestinations,0);
    assert.equal(audit.records[0].postPrizeCards,0);
    assert.equal(audit.records[0].handDelta,1);
    assert.equal(audit.bySeat[seat],1);
    assert.strictEqual(f.prompt.result,f.action.result);
    assert.strictEqual(Store.prototype.dispatch,earlier);
  });
  test('Barbaracle-style redirected Prize goes to Lost Zone seat '+seat,()=>{
    const f=fixture(seat,'lost-zone');
    const {audit}=watch(()=>{
      f.store.dispatch(new AddPlayerAction());
      f.store.dispatch(f.action);
    },deps);
    assert.equal(audit.nativeResolved,1);
    assert.equal(audit.exactOwnerHandTransfers,0);
    assert.equal(audit.exactOwnerLostZoneTransfers,1);
    assert.equal(audit.records[0].lostZoneDelta,1);
    assert.equal(audit.records[0].handDelta,0);
    assert.equal(audit.competitivelyQualifiedGames,0);
  });
  test('resolved prompt without Prize movement is unverified seat '+seat,()=>{
    const f=fixture(seat,'no-transfer');
    const {audit}=watch(()=>{
      f.store.dispatch(new AddPlayerAction());
      f.store.dispatch(f.action);
    },deps);
    assert.equal(audit.nativeResolved,1);
    assert.equal(audit.exactOwnerHandTransfers,0);
    assert.equal(audit.otherOrUnverifiedDestinations,1);
    assert.equal(audit.records[0].postPrizeCards,1);
    assert.equal(audit.records[0].handDelta,0);
  });
  test('silent native no-op is rejected, with no accepted Prize seat '+seat,()=>{
    const f=fixture(seat,'silent');
    const original=Store.prototype.dispatch;
    assert.throws(()=>watch(()=>{
      f.store.dispatch(new AddPlayerAction());
      f.store.dispatch(f.action);
    },deps),error=>{
      assert.match(error.message,/without resolution/);
      assert.equal(error.agent3KoPrizeSettlementAudit.nativeUnresolved,1);
      assert.equal(error.agent3KoPrizeSettlementAudit.nativeResolved,0);
      assert.equal(error.agent3KoPrizeSettlementAudit.exactOwnerHandTransfers,0);
      return true;
    });
    assert.strictEqual(Store.prototype.dispatch,original);
  });
  test('same-class non-KO Prize prompt with no hand destination is not certified seat '+seat,()=>{
    const f=fixture(seat,'hand',true);
    const {audit}=watch(()=>{
      f.store.dispatch(new AddPlayerAction());
      f.store.dispatch(f.action);
    },deps);
    assert.equal(audit.observedKoShapedSelections,0);
    assert.equal(audit.nativeResolved,0);
    assert.equal(audit.records.length,0);
  });
}

test('observer does not change deterministic native Prize disposition',()=>{
  for(const seat of [0,1])for(const mode of ['hand','lost-zone','no-transfer']){
    const control=fixture(seat,mode);
    control.store.dispatch(new AddPlayerAction());
    control.store.dispatch(control.action);
    const observed=fixture(seat,mode);
    const withAudit=watch(()=>{
      observed.store.dispatch(new AddPlayerAction());
      observed.store.dispatch(observed.action);
    },deps);
    const publicState=f=>({
      selectedResolved:f.prompt.result===f.action.result,
      handCards:f.owner.hand.cards.length,
      lostZoneCards:f.owner.lostzone.cards.length,
      prizeCards:f.owner.prizes.reduce((a,p)=>a+p.cards.length,0)
    });
    assert.deepEqual(publicState(observed),publicState(control));
    assert.equal(withAudit.audit.nativeResolved,1);
    assert.equal(withAudit.audit.competitivelyQualifiedGames,0);
  }
});

class RejectPrizeStore extends Store {
  dispatch(action){
    if(action instanceof ResolvePromptAction)
      throw new Error('native rejected Prize answer');
    return super.dispatch(action);
  }
}
test('native throwing Prize dispatch is separately rejected and restored',()=>{
  const f=fixture(1,'hand');
  const rejectedStore=new RejectPrizeStore(f.store.state,'hand');
  const previous=RejectPrizeStore.prototype.dispatch;
  assert.throws(()=>watch(()=>{
    rejectedStore.dispatch(new AddPlayerAction());
    rejectedStore.dispatch(f.action);
  },{...deps,Store:RejectPrizeStore}),error=>{
    assert.match(error.message,/native rejected Prize answer/);
    assert.equal(error.agent3KoPrizeSettlementAudit.nativeRejected,1);
    assert.equal(error.agent3KoPrizeSettlementAudit.nativeResolved,0);
    assert.equal(error.agent3KoPrizeSettlementAudit.nativeUnresolved,0);
    return true;
  });
  assert.strictEqual(RejectPrizeStore.prototype.dispatch,previous);
});
