'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {movedDeckCards,ownerCompressorPrompt,
  withSourceCompressorSettlementAudit}=
  require('../simulation/twinleaf/agent3-compressor-discard-settlement.cjs');

/** @param {string} name @param {number} id */
const card=(name,id)=>({name,id,fullName:name+' Test'});
class ChooseCardsPrompt {
  constructor(owner) {
    this.result=undefined;
    this.playerId=owner.id;
    this.cards=owner.deck;
    this.options={min:0,max:3};
  }
}
class ResolvePromptAction {
  constructor(cards) {this.cards=cards;}
}
class FakeStore {
  constructor(owner,opponent) {
    this.state={activePlayer:0,turn:1,
      players:[owner,opponent],prompts:[new ChooseCardsPrompt(owner)]};
  }
  dispatch(action) {
    if (action.fail) throw new Error('native rejects');
    const owner=this.state.players[0];
    for(const selected of action.cards) {
      const idx=owner.deck.cards.indexOf(selected);
      if(idx<0)throw Error('invalid native selection');
      owner.deck.cards.splice(idx,1);
      owner.discard.cards.push(selected);
    }
    this.state.prompts[0].result=action.cards;
    return 'accepted';
  }
}
function fixture() {
  const a=card('Lightning Energy',10);
  const b=card('Lightning Energy',11);
  const c=card('Exeggcute',12);
  const source={id:101,deck:{cards:[a,b,c]},
    discard:{cards:[]},supporter:{cards:[card('Battle Compressor',99)]}};
  const other={id:202,deck:{cards:[card('Secret',500)]},
    discard:{cards:[]},supporter:{cards:[]}};
  return {source,other,cards:[a,b,c]};
}

test('physical identity distinguishes identical name and printed id',()=>{
  const x=card('Lightning Energy',42),y=card('Lightning Energy',42);
  assert.deepEqual(movedDeckCards([x,y],[],[y],[x]),[x]);
  assert.deepEqual(movedDeckCards([x,y],[x],[y],[x]),[]);
});
test('only acting owner can expose an unresolved Compressor prompt',()=>{
  const f=fixture();
  const state=new FakeStore(f.source,f.other).state;
  assert.equal(ownerCompressorPrompt(state,0)?.prompt.constructor.name,
    'ChooseCardsPrompt');
  assert.equal(ownerCompressorPrompt(state,1),null);
  state.players[0].supporter.cards=[];
  assert.equal(ownerCompressorPrompt(state,0),null);
});
test('two genuine physical moves yield one positive prompt settlement',()=>{
  const f=fixture(),store=new FakeStore(f.source,f.other);
  const baseline=FakeStore.prototype.dispatch;
  const observed=withSourceCompressorSettlementAudit(0,()=>
    store.dispatch(new ResolvePromptAction(f.cards.slice(0,2))),
  {StoreClass:FakeStore});
  assert.equal(observed.result,'accepted');
  assert.equal(observed.audit.sourcePromptResolutions,1);
  assert.equal(observed.audit.acceptedPositiveResolutions,1);
  assert.equal(observed.audit.physicalMovedCopies,2);
  assert.deepEqual(observed.audit.receipts[0].physicallyMoved.map(x=>x.id),
    [10,11]);
  assert.strictEqual(FakeStore.prototype.dispatch,baseline);
});
test('zero-card response remains observed but fails paper minimum',()=>{
  const f=fixture(),store=new FakeStore(f.source,f.other);
  const observed=withSourceCompressorSettlementAudit(0,()=>
    store.dispatch(new ResolvePromptAction([])),{StoreClass:FakeStore});
  assert.equal(observed.audit.sourcePromptResolutions,1);
  assert.equal(observed.audit.acceptedPositiveResolutions,0);
  assert.equal(observed.audit.physicalMovedCopies,0);
  assert.equal(observed.audit.receipts[0].nativeDispatchReturned,true);
  assert.equal(observed.audit.receipts[0].paperMinimumMet,false);
});
test('other seat and native exceptions cannot fabricate settlement',()=>{
  const f=fixture(),store=new FakeStore(f.source,f.other);
  store.state.activePlayer=1;
  const other=withSourceCompressorSettlementAudit(0,()=>
    store.dispatch(new ResolvePromptAction(f.cards.slice(0,1))),
  {StoreClass:FakeStore});
  assert.equal(other.audit.sourcePromptResolutions,0);
  assert.equal(other.audit.physicalMovedCopies,0);
  const g=fixture(),failed=new FakeStore(g.source,g.other);
  const original=FakeStore.prototype.dispatch;
  assert.throws(()=>withSourceCompressorSettlementAudit(0,()=>
    failed.dispatch({constructor:{name:'ResolvePromptAction'},fail:true}),
  {StoreClass:FakeStore}),/native rejects/);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
  assert.deepEqual(g.source.discard.cards,[]);
});
