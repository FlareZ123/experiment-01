'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,independentUltraBallPaymentNegative,
  independentUltraBallPaidCustody,independentPrintedDiscardPaidCustody,
  withPaperPromptContractPortfolio
}=require('../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');

class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class PlayCardAction {
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ChooseCardsPrompt {
  constructor(owner){
    this.id=17;
    this.playerId=owner.id;
    this.sourceCard={fullName:'Ultra Ball MEG'};
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.cards=owner.hand;
    this.options={min:2,max:2};
  }
  validate(result){return Array.isArray(result);}
}
class FakeStore {
  constructor(state){this.state=state;this.mutations=0;}
  dispatch(action){
    this.mutations++;
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      prompt.result=action.result;
      if(prompt.message==='CHOOSE_CARD_TO_DISCARD'){
        const owner=this.state.players.find(p=>p.id===prompt.playerId);
        for(const selected of action.result){
          const index=owner.hand.cards.indexOf(selected);
          if(index>=0)owner.hand.cards.splice(index,1);
          if(index>=0)owner.discard.cards.push(selected);
        }
      }
    }
    return {accepted:true};
  }
}
class FakeIronThorns {reduceEffect(){}}
const deps={Store:FakeStore,IronThornsex:FakeIronThorns,
  types:{PlayerType:{BOTTOM_PLAYER:'BOTTOM_PLAYER'},SlotType:{BENCH:'BENCH'}}};

function setup(){
  const ball={fullName:'Ultra Ball MEG'};
  const one={fullName:'Grass Energy MEE'};
  const two={fullName:'Grass Energy MEE'};
  const foreign={fullName:'Darkness Energy MEE'};
  const owner={id:101,hand:{cards:[one,two]},discard:{cards:[]},
    deck:{cards:[]}};
  const opponent={id:202,hand:{cards:[]},discard:{cards:[]},deck:{cards:[]}};
  const state={turn:5,players:[owner,opponent],
    prompts:[new ChooseCardsPrompt(owner)]};
  return {ball,one,two,foreign,owner,opponent,state,store:new FakeStore(state)};
}
test('exact two offered and owned physical cards, with owner custody',()=>{
  const x=setup(),prompt=x.state.prompts[0];
  assert.equal(independentUltraBallPaymentNegative(
    prompt,[x.one,x.two],x.owner),null);
  assert.match(independentUltraBallPaymentNegative(
    prompt,[x.one],x.owner),/EXACTLY_TWO/);
  assert.match(independentUltraBallPaymentNegative(
    prompt,[x.one,x.one],x.owner),/DISTINCT/);
  assert.match(independentUltraBallPaymentNegative(
    prompt,[x.one,x.foreign],x.owner),/OUTSIDE_ACTUAL_OWNER_HAND/);
  // Even an offered object cannot be spent if it belongs to another zone.
  prompt.cards={cards:[x.one,x.two,x.foreign]};
  assert.match(independentUltraBallPaymentNegative(
    prompt,[x.one,x.foreign],x.owner),/OUTSIDE_ACTUAL_OWNER_HAND/);
  prompt.message='CHOOSE_CARD_TO_HAND';
  assert.match(independentUltraBallPaymentNegative(
    prompt,[x.one,x.two],x.owner),/WRONG_PAYMENT_PROMPT/);
});
test('same two card objects must leave owner hand and reach owner discard',()=>{
  const x=setup();
  assert.equal(independentUltraBallPaidCustody(x.owner,[x.one,x.two]),false);
  x.owner.hand.cards.splice(0,2);
  x.owner.discard.cards.push(x.one,x.two);
  assert.equal(independentUltraBallPaidCustody(x.owner,[x.one,x.two]),true);
  assert.equal(independentUltraBallPaidCustody(x.opponent,[x.one,x.two]),false);
  assert.equal(independentUltraBallPaidCustody(x.owner,[x.one,x.one]),false);
});
test('shared actual dispatch boundary rejects forged payment then verifies genuine paid custody',()=>{
  const x=setup();
  const before=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const result=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>x.store.dispatch(
      new ResolvePromptAction(17,[x.one,x.foreign])),/PAPER_PROMPT_INVALID/);
    assert.equal(x.store.mutations,0);
    assert.equal(x.state.prompts[0].result,undefined);
    return x.store.dispatch(new ResolvePromptAction(17,[x.one,x.two]));
  },deps);
  assert.equal(result.audit.schema,VERSION);
  assert.equal(result.audit.vetoedBeforeDispatch,1);
  // Generic physical-source membership rejects the forged card before the\n  // Ultra-specific prompt branch runs. The valid payment reaches that branch.\n  assert.equal(result.audit.inspectedUltraBallPaymentPrompts,1);
  assert.equal(result.audit.verifiedUltraBallPhysicalPayments,1);
  assert.equal(result.audit.unverifiedUltraBallPhysicalPayments,0);
  const row=result.audit.byTrial?.missing??result.audit.examples.find(
    event=>event.sourcePrinting==='Ultra Ball MEG'&&event.nativeAccepted);
  assert.equal(row.physicalEffectVerified,true);
  assert.equal(x.owner.hand.cards.length,0);
  assert.deepEqual(x.owner.discard.cards,[x.one,x.two]);
  assert.strictEqual(FakeStore.prototype.dispatch,before.value);
});
test('native-looking success without physical payment stays unverified',()=>{
  const x=setup();
  const old=FakeStore.prototype.dispatch;
  FakeStore.prototype.dispatch=function(action){
    this.mutations++;
    this.state.prompts[0].result=action.result;
    return {accepted:true};
  };
  try{
    const result=withPaperPromptContractPortfolio(()=>
      x.store.dispatch(new ResolvePromptAction(17,[x.one,x.two])),deps);
    assert.equal(result.audit.verifiedUltraBallPhysicalPayments,0);
    assert.equal(result.audit.unverifiedUltraBallPhysicalPayments,1);
    assert.equal(result.audit.nativeSettlementUnverified,1);
    assert.equal(result.audit.examples[0].physicalEffectVerified,false);
  }finally{FakeStore.prototype.dispatch=old;}
});
test('root needs two other hand cards; optional deck-search reply is not payment',()=>{
  const x=setup();
  x.owner.hand.cards=[x.ball,x.one];
  x.state.prompts=[];
  const result=withPaperPromptContractPortfolio(()=>{
    assert.throws(()=>x.store.dispatch(new PlayCardAction(x.owner.id,0)),
      /ULTRA_BALL_REQUIRES_TWO_OTHER_CARDS/);
    assert.equal(x.store.mutations,0);
    x.owner.hand.cards.push(x.two);
    x.store.dispatch(new PlayCardAction(x.owner.id,0));
    const search=new ChooseCardsPrompt(x.owner);
    search.message='CHOOSE_CARD_TO_HAND';
    search.options={min:0,max:1};
    x.state.prompts.push(search);
    x.store.dispatch(new ResolvePromptAction(search.id,[]));
    return true;
  },deps);
  assert.equal(result.audit.inspectedUltraBallPlayCardRoots,2);
  assert.equal(result.audit.vetoedUltraBallInsufficientRoots,1);
  assert.equal(result.audit.inspectedUltraBallPaymentPrompts,0);
});

test('shared generic printed-card custody supports one, two or three-card exact payment',()=>{
  const x=setup();
  x.owner.hand.cards=[];
  x.owner.discard.cards=[x.one,x.two,x.foreign];
  for(const [count,selection] of [[1,[x.one]],[2,[x.one,x.two]],
    [3,[x.one,x.two,x.foreign]]]){
    assert.equal(independentPrintedDiscardPaidCustody(
      x.owner,selection,count),true);
  }
  assert.equal(independentPrintedDiscardPaidCustody(
    x.owner,[x.one,x.two],3),false);
  assert.equal(independentPrintedDiscardPaidCustody(
    x.owner,[x.one,x.two,x.two],3),false);
  x.owner.hand.cards.push(x.foreign);
  assert.equal(independentPrintedDiscardPaidCustody(
    x.owner,[x.one,x.two,x.foreign],3),false);
});

test('source Quick Ball one-other-card root physically auto-pays without a payment prompt',()=>{
  class AutoPaidQuickBallStore extends FakeStore {
    dispatch(action){
      this.mutations++;
      if(action instanceof PlayCardAction){
        const owner=this.state.players.find(p=>p.id===action.id);
        const ball=owner.hand.cards[action.handIndex];
        const paid=owner.hand.cards.find(card=>card!==ball);
        owner.hand.cards.splice(owner.hand.cards.indexOf(paid),1);
        owner.discard.cards.push(paid);
      }
      return {accepted:true};
    }
  }
  const x=setup();
  const quick={fullName:'Quick Ball FST'};
  x.owner.hand.cards=[quick,x.one];
  x.state.prompts=[];
  const store=new AutoPaidQuickBallStore(x.state);
  const audited=withPaperPromptContractPortfolio(()=>
    store.dispatch(new PlayCardAction(x.owner.id,0)),{
      ...deps,Store:AutoPaidQuickBallStore
    });
  const root=audited.audit.quickBallAutomaticRootPayments;
  assert.equal(root.attempted,1);
  assert.equal(root.verified,1);
  assert.equal(root.unverified,0);
  assert.equal(root.firstEvent.sourcePrinting,'Quick Ball FST');
  assert.equal(root.firstEvent.physicallyPaid,true);
  assert.equal(audited.audit.inspectedQuickBallPaymentPrompts,0);
  assert.deepEqual(x.owner.discard.cards,[x.one]);
});
test('source Quick Ball auto-payment native-like nonmovement remains visible as unverified',()=>{
  const x=setup();
  x.owner.hand.cards=[{fullName:'Quick Ball FST'},x.one];
  x.state.prompts=[];
  const audited=withPaperPromptContractPortfolio(()=>
    x.store.dispatch(new PlayCardAction(x.owner.id,0)),deps);
  const root=audited.audit.quickBallAutomaticRootPayments;
  assert.equal(root.attempted,1);
  assert.equal(root.verified,0);
  assert.equal(root.unverified,1);
  assert.equal(root.firstEvent.physicallyPaid,false);
});
