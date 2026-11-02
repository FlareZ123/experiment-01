'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withPaperPromptContractPortfolio,VERSION}=
  require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');

class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(id,owner,sourcePrinting,message){
    this.id=id;this.playerId=owner.id;
    this.sourceCard={fullName:sourcePrinting};
    this.cards=owner.hand;
    this.message=message;
    this.options={min:3,max:3,allowCancel:false};
  }
}
class FakeStore{
  constructor(state){this.state=state;this.calls=0;}
  dispatch(action){
    this.calls++;
    const prompt=this.state.prompts.find(p=>p.id===action.id&&p.result===undefined);
    if(prompt)prompt.result=action.result;
    return {accepted:true};
  }
}
class IronThornsex{
  reduceEffect(_store,_state,_effect){}
}
const deps={Store:FakeStore,IronThornsex,types:{
  PlayerType:{BOTTOM_PLAYER:'bottom',TOP_PLAYER:'top'},
  SlotType:{ACTIVE:'active',BENCH:'bench'},
  SuperType:{ENERGY:'energy'}
}};
function state(sourceSeat){
  const players=[0,1].map(id=>({
    id,hand:{cards:[]},deck:{cards:[]},
    active:{cards:[]},bench:[]
  }));
  return {players,prompts:[],turn:1,source:players[sourceSeat]};
}

test('v11 paper Secret Box mandatory discard is source-scoped and two-seat',()=>{
  assert.match(VERSION,/v11-secret-box/);
  for(const seat of [0,1]){
    const s=state(seat),owner=s.source;
    const [a,b,c]=[{name:'hand A'},{name:'hand B'},{name:'hand C'}];
    owner.hand.cards.push(a,b,c);
    const payment=new ChooseCardsPrompt(10,owner,'Secret Box TWM',
      'CHOOSE_CARD_TO_DISCARD');
    s.prompts.push(payment);
    const store=new FakeStore(s);
    const result=withPaperPromptContractPortfolio(()=>{
      assert.throws(()=>store.dispatch(new ResolvePromptAction(10,[])),
        /PAPER_PROMPT_INVALID:.*SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS/);
      assert.equal(store.calls,0);
      assert.equal(payment.result,undefined);
      assert.throws(()=>store.dispatch(new ResolvePromptAction(10,[a,a,b])),
        /PAPER_PROMPT_INVALID/);
      assert.equal(store.calls,0);
      return store.dispatch(new ResolvePromptAction(10,[a,b,c]));
    },deps);
    assert.equal(result.result.accepted,true);
    assert.equal(store.calls,1);
    assert.equal(result.audit.inspectedSecretBoxPaymentPrompts,3);
    assert.equal(result.audit.statusCounts.PAPER_PROMPT_INVALID,2);
    assert.equal(result.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
    assert.equal(result.audit.vetoedBeforeDispatch,2);
    assert.equal(result.audit.nativeAccepted,1);
    assert.equal(JSON.stringify(result.audit).includes('hand A'),false);
  }
});

test('v11 physical foreign payment card fails closed for both native seats',()=>{
  for(const seat of [0,1]){
    const s=state(seat),owner=s.source;
    const a={},b={},foreign={};
    owner.hand.cards.push(a,b);
    const payment=new ChooseCardsPrompt(14,owner,'Secret Box TWM',
      'CHOOSE_CARD_TO_DISCARD');
    payment.cards={cards:[a,b,foreign]};
    s.prompts.push(payment);
    const store=new FakeStore(s);
    const result=withPaperPromptContractPortfolio(()=>{
      assert.throws(()=>store.dispatch(new ResolvePromptAction(14,[a,b,foreign])),
        /PAPER_PROMPT_INVALID/);
      assert.equal(store.calls,0);
    },deps);
    assert.equal(result.audit.nativeAccepted,0);
    assert.equal(result.audit.vetoedBeforeDispatch,1);
  }
});

test('v11 root guard rejects fewer than three other hand cards without Store mutation',()=>{
  for(const seat of [0,1]){
    const s=state(seat),owner=s.source;
    const box={fullName:'Secret Box TWM'};
    owner.hand.cards.push(box,{},{});
    const store=new FakeStore(s);
    const observed=withPaperPromptContractPortfolio(()=>{
      assert.throws(()=>store.dispatch(new PlayCardAction(owner.id,0)),
        /PAPER_ROOT_INVALID:SECRET_BOX_REQUIRES_THREE_OTHER_CARDS/);
      assert.equal(store.calls,0);
      owner.hand.cards.push({});
      return store.dispatch(new PlayCardAction(owner.id,0));
    },deps);
    assert.equal(observed.audit.inspectedSecretBoxPlayCardRoots,2);
    assert.equal(observed.audit.vetoedSecretBoxInsufficientRoots,1);
    assert.equal(store.calls,1);
  }
});

test('v11 optional Secret Box own-deck search and unrelated source are not payment prompts',()=>{
  for(const printing of ['Secret Box TWM','Other Item TEST']){
    const s=state(0),owner=s.source;
    const prompt=new ChooseCardsPrompt(20,owner,printing,'CHOOSE_CARD_TO_HAND');
    prompt.cards=owner.deck;
    prompt.options={min:0,max:4,allowCancel:false};
    s.prompts=[prompt];
    const store=new FakeStore(s);
    const result=withPaperPromptContractPortfolio(()=>
      store.dispatch(new ResolvePromptAction(20,[])),deps);
    assert.equal(result.audit.inspectedSecretBoxPaymentPrompts,0);
    assert.equal(result.audit.vetoedBeforeDispatch,0);
    assert.equal(result.audit.nativeAccepted,1);
    assert.equal(store.calls,1);
  }
});
