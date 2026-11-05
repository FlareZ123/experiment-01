'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  classifyPendingPaperPrompt,withPaperPromptDispositionObserver
}=require('../simulation/twinleaf/agent12-paper-prompt-disposition-observer.cjs');

class ResolvePromptAction{
  constructor(result){this.id=20;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(cards,source='Camping Gear BST'){
    this.id=20;this.result=undefined;this.player={deck:{cards}};
    this.cards=this.player.deck;this.sourceCard={fullName:source};
  }
  validate(result){
    return Array.isArray(result)&&result.length<=1&&
      result.every(card=>this.cards.cards.includes(card));
  }
}
class WaitPrompt{
  constructor(){this.id=20;this.result=undefined;}
}
class Store{
  constructor(prompt){this.state={turn:1,prompts:[prompt]};this.calls=0;}
  dispatch(action){
    this.calls++;
    if(action.result?.invalid)throw Error('native-rejected');
    return this.state;
  }
}
const a={name:'a'},b={name:'b'};

test('no matching live prompt is conservatively unverified',()=>{
  const row=classifyPendingPaperPrompt({prompts:[]},new ResolvePromptAction([a]));
  assert.equal(row.status,'PROMPT_PAPER_UNVERIFIED');
  assert.equal(row.coverage,'missing-prompt-context');
});

test('valid original Camping Gear independently paper verified',()=>{
  const state={prompts:[new ChooseCardsPrompt([a,b])]};
  const row=classifyPendingPaperPrompt(state,new ResolvePromptAction([a]));
  assert.equal(row.status,'PROMPT_PAPER_VERIFIED');
  assert.equal(row.nativeValidateVerdict,true);
  assert.equal(row.submittedCount,1);
});

test('zero (native valid) and two (native invalid) independently paper invalid',()=>{
  const state={prompts:[new ChooseCardsPrompt([a,b])]};
  const zero=classifyPendingPaperPrompt(state,new ResolvePromptAction([]));
  const two=classifyPendingPaperPrompt(state,new ResolvePromptAction([a,b]));
  assert.equal(zero.status,'PROMPT_PAPER_INVALID');
  assert.equal(zero.nativeValidateVerdict,true);
  assert.equal(two.status,'PROMPT_PAPER_INVALID');
  assert.equal(two.nativeValidateVerdict,false);
});

test('other source printed item and WaitPrompt explicitly remain unverified',()=>{
  const other={prompts:[new ChooseCardsPrompt([a,b],'Other item')]};
  const wait={prompts:[new WaitPrompt()]};
  assert.equal(classifyPendingPaperPrompt(other,
    new ResolvePromptAction([a])).status,'PROMPT_PAPER_UNVERIFIED');
  assert.equal(classifyPendingPaperPrompt(wait,
    new ResolvePromptAction(null)).status,'PROMPT_PAPER_UNVERIFIED');
});

test('nonthrowing unchanged prompt retains paper verdict but is not accepted',()=>{
  const before=Store.prototype.dispatch;
  const store=new Store(new ChooseCardsPrompt([a,b]));
  const run=()=>store.dispatch(new ResolvePromptAction([a,b]));
  const observed=withPaperPromptDispositionObserver(run,{Store});
  assert.equal(observed.audit.resolvedPromptAttempts,1);
  assert.equal(observed.audit.nativeAccepted,0);
  assert.equal(observed.audit.nativeReturnedNoThrow,1);
  assert.equal(observed.audit.nativeReturnOnlyNoOp,1);
  assert.equal(observed.audit.statusCounts.PROMPT_PAPER_INVALID,1);
  assert.equal(observed.audit.firstByStatus.PROMPT_PAPER_INVALID.nativeAccepted,false);
  assert.equal(observed.audit.firstByStatus.PROMPT_PAPER_INVALID.nativeSettlement,
    'NATIVE_RETURN_ONLY_NO_OP');
  assert.equal(Store.prototype.dispatch,before);
});

test('first late positive survives bounded general examples',()=>{
  const before=Store.prototype.dispatch;
  const store=new Store(new WaitPrompt());
  const observed=withPaperPromptDispositionObserver(()=>{
    for(let i=0;i<48;i++)store.dispatch(new ResolvePromptAction(null));
    store.state.prompts=[new ChooseCardsPrompt([a,b])];
    return store.dispatch(new ResolvePromptAction([a]));
  },{Store,exampleLimit:4});
  assert.equal(observed.audit.resolvedPromptAttempts,49);
  assert.equal(observed.audit.statusCounts.PROMPT_PAPER_UNVERIFIED,48);
  assert.equal(observed.audit.statusCounts.PROMPT_PAPER_VERIFIED,1);
  assert.equal(observed.audit.examples.length,4);
  assert.equal(observed.audit.examplesTruncated,true);
  assert.equal(observed.audit.firstByStatus.PROMPT_PAPER_VERIFIED.ordinal,48);
  assert.equal(observed.audit.nativeAccepted,0);
  assert.equal(observed.audit.nativeReturnOnlyNoOp,49);
  assert.equal(Store.prototype.dispatch,before);
});

test('native failure preserves verdict, counts, guard restoration',()=>{
  const before=Store.prototype.dispatch,store=new Store(new WaitPrompt());
  let caught;
  try{
    withPaperPromptDispositionObserver(()=>{
      store.dispatch(new ResolvePromptAction({invalid:true}));
    },{Store});
  }catch(error){caught=error;}
  assert.match(caught.message,/native-rejected/);
  assert.equal(caught.agent12PaperPromptDispositionAudit.nativeRejected,1);
  assert.equal(caught.agent12PaperPromptDispositionAudit.resolvedPromptAttempts,1);
  assert.equal(Store.prototype.dispatch,before);
});

/** A genuine native prompt setter, unlike Store's deliberately silent mock. */
class SettlingStore extends Store{
  dispatch(action){
    this.calls++;
    const pending=this.state.prompts.find(p=>
      p.id===action.id&&p.result===undefined);
    if(!pending)return this.state;
    pending.result=action.result;
    return this.state;
  }
}

for(const seat of [0,1]){
  test('native settled result is counted on physical seat '+seat,()=>{
    const p=new ChooseCardsPrompt([a,b]);
    p.playerId=seat;
    const store=new SettlingStore(p);
    const previous=SettlingStore.prototype.dispatch;
    const observed=withPaperPromptDispositionObserver(()=>
      store.dispatch(new ResolvePromptAction([a])),{Store:SettlingStore});
    assert.equal(observed.audit.nativeAccepted,1);
    assert.equal(observed.audit.nativeSettled,1);
    assert.equal(observed.audit.nativeReturnedNoThrow,1);
    assert.equal(observed.audit.nativeReturnOnlyNoOp,0);
    assert.equal(observed.audit.firstByStatus.PROMPT_PAPER_VERIFIED.nativeSettlement,
      'PROMPT_RESULT_SETTLED');
    assert.equal(observed.audit.firstByStatus.PROMPT_PAPER_VERIFIED.physicalEffectVerified,
      false);
    assert.strictEqual(SettlingStore.prototype.dispatch,previous);
  });
}

test('stale prompt ID cannot turn a nonthrowing Store reply into acceptance',()=>{
  const store=new Store(new ChooseCardsPrompt([a,b]));
  const action=new ResolvePromptAction([a]);
  action.id=999;
  const observed=withPaperPromptDispositionObserver(()=>
    store.dispatch(action),{Store});
  assert.equal(observed.audit.nativeAccepted,0);
  assert.equal(observed.audit.nativeSettlementUnverified,1);
  assert.equal(observed.audit.nativeReturnedNoThrow,1);
  assert.equal(observed.audit.firstByStatus.PROMPT_PAPER_UNVERIFIED.nativeSettlement,
    'PROMPT_SETTLEMENT_UNVERIFIED');
});

class RemovingStore extends Store{
  dispatch(action){
    this.calls++;
    this.state.prompts=[];
    return this.state;
  }
}

test('prompt removed without a settled result remains unverified',()=>{
  const store=new RemovingStore(new ChooseCardsPrompt([a,b]));
  const observed=withPaperPromptDispositionObserver(()=>
    store.dispatch(new ResolvePromptAction([a])),{Store:RemovingStore});
  assert.equal(observed.audit.nativeAccepted,0);
  assert.equal(observed.audit.nativeSettlementUnverified,1);
  assert.equal(observed.audit.nativeReturnOnlyNoOp,0);
  assert.equal(observed.audit.firstByStatus.PROMPT_PAPER_VERIFIED.nativeSettlement,
    'PROMPT_SETTLEMENT_UNVERIFIED');
});
