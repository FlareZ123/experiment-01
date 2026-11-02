'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {quickBallPaymentNegative,withPaperQuickBallMandatoryPayment}=
  require('../simulation/twinleaf/agent4-quick-ball-paper-payment-hook.cjs');
const {probeQuickBallMandatoryPayment,probeQuickBallExplicitPayment,
  probeQuickBallNoOtherCard}=
  require('../simulation/twinleaf/agent4-quickball-mandatory-payment-native.cjs');

test('printed Quick Ball payment requires exactly one offered physical own-hand card',()=>{
  const a={},b={},owner={hand:{cards:[a]}};
  const prompt={cards:{cards:[a]}};
  assert.equal(quickBallPaymentNegative(prompt,[],owner),
    'QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE');
  assert.equal(quickBallPaymentNegative(prompt,[a,a],owner),
    'QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE');
  assert.equal(quickBallPaymentNegative(prompt,[b],owner),
    'QUICK_BALL_PAYMENT_OUTSIDE_PHYSICAL_OWNER_HAND');
  assert.equal(quickBallPaymentNegative(prompt,[a],owner),null);
});

test('original rank5 Quick Ball autospends sole other card and allows zero Basic search both seats',()=>{
  for(const seat of [0,1]){
    const raw=probeQuickBallMandatoryPayment(seat,'zero');
    const wrapped=withPaperQuickBallMandatoryPayment(()=>
      probeQuickBallMandatoryPayment(seat,'zero'));
    const a=wrapped.result,b=wrapped.audit;
    console.log('AGENT4_QUICK_BALL_AUTO_AND_SEARCH '+JSON.stringify({
      seat,raw,guarded:a,audit:b
    }));
    assert.equal(a.rootError,null);
    assert.equal(a.promptEvidence.printing,'Quick Ball FST');
    assert.equal(a.promptEvidence.message,'CHOOSE_CARD_TO_HAND');
    assert.equal(a.promptEvidence.fromOwnerDeck,true);
    assert.equal(a.promptEvidence.min,0);
    assert.equal(a.promptEvidence.max,1);
    assert.equal(a.promptEvidence.nativeValidated,true);
    assert.equal(a.energyAutoDiscardedBeforeSearch,true);
    assert.equal(a.searchError,null);
    assert.equal(a.searchSettled,true);
    assert.equal(a.energyInDiscard,true);
    assert.equal(a.dedenneInDeck,true);
    assert.equal(a.dedenneInHand,false);
    assert.deepEqual(a.pendingPrompts,[]);
    assert.equal(b.inspectedRoots,1);
    assert.equal(b.inspectedPayments,0);
    assert.equal(b.vetoedPayments,0);
    assert.equal(b.ignoredOptionalSearchPrompts,1);
    assert.equal(raw.energyInDiscard,a.energyInDiscard);
    assert.equal(raw.dedenneInDeck,a.dedenneInDeck);
    const searched=withPaperQuickBallMandatoryPayment(()=>
      probeQuickBallMandatoryPayment(seat,'one'));
    assert.equal(searched.result.searchError,null);
    assert.equal(searched.result.dedenneInHand,true);
    assert.equal(searched.result.dedenneInDeck,false);
    assert.deepEqual(searched.result.pendingPrompts,[]);
    assert.equal(searched.audit.inspectedPayments,0);
  }
});

test('original rank5 Quick Ball explicit two-option discard blocks invalid zero but preserves valid paid search',()=>{
  for(const seat of [0,1]){
    const raw=probeQuickBallExplicitPayment(seat,'zero');
    const blocked=withPaperQuickBallMandatoryPayment(()=>
      probeQuickBallExplicitPayment(seat,'zero'));
    const a=blocked.result,b=blocked.audit;
    console.log('AGENT4_QUICK_BALL_EXPLICIT_PAYMENT '+JSON.stringify({
      seat,raw,guarded:a,audit:b
    }));
    assert.equal(a.rootError,null);
    assert.equal(a.paymentPromptEvidence.printing,'Quick Ball FST');
    assert.equal(a.paymentPromptEvidence.message,'CHOOSE_CARD_TO_DISCARD');
    assert.equal(a.paymentPromptEvidence.offeredPhysicalHand,true);
    assert.equal(a.paymentPromptEvidence.min,1);
    assert.equal(a.paymentPromptEvidence.max,1);
    assert.match(a.paymentError,
      /PAPER_QUICK_BALL_PAYMENT_INVALID:QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE/);
    assert.equal(a.paymentSettled,false);
    assert.equal(a.energyInHand,true);
    assert.equal(a.secondInHand,true);
    assert.equal(a.dedenneInDeck,true);
    assert.equal(b.inspectedPayments,1);
    assert.equal(b.vetoedPayments,1);
    const paid=withPaperQuickBallMandatoryPayment(()=>
      probeQuickBallExplicitPayment(seat,'one'));
    const c=paid.result,d=paid.audit;
    console.log('AGENT4_QUICK_BALL_PAID '+JSON.stringify({seat,paid:c,audit:d}));
    assert.equal(c.rootError,null);
    assert.equal(c.paymentError,null);
    assert.equal(c.paymentSettled,true);
    assert.equal(c.energyInDiscard,true);
    assert.equal(c.secondInHand,true);
    assert.equal(c.dedenneInHand,true);
    assert.equal(c.dedenneInDeck,false);
    assert.deepEqual(c.pendingPrompts,[]);
    assert.equal(d.inspectedPayments,1);
    assert.equal(d.vetoedPayments,0);
    assert.equal(d.ignoredOptionalSearchPrompts,1);
  }
});

test('Quick Ball root without any other physical hand card is rejected in both seats',()=>{
  for(const seat of [0,1]){
    const raw=probeQuickBallNoOtherCard(seat);
    const wrapped=withPaperQuickBallMandatoryPayment(()=>
      probeQuickBallNoOtherCard(seat));
    const a=wrapped.result;
    assert.match(a.error,/PAPER_QUICK_BALL_ROOT_INVALID:ONE_OTHER_CARD_REQUIRED/);
    assert.equal(a.ballInHand,true);
    assert.equal(a.ballInDiscard,false);
    assert.deepEqual(a.pendingPrompts,[]);
    assert.equal(wrapped.audit.inspectedRoots,1);
    assert.equal(wrapped.audit.vetoedRoots,1);
    console.log('AGENT4_QUICK_BALL_NATIVE_ROOT '+JSON.stringify({
      seat,rawError:raw.error,guardedError:a.error
    }));
  }
});

test('live-only guard excludes speculative stores and isolates native trial keys',()=>{
  class AddPlayerAction{constructor(id){this.id=id;}}
  class PlayCardAction{constructor(id,index){this.id=id;this.handIndex=index;}}
  class Store{
    constructor(){
      this.state={players:[{id:11,hand:{cards:[{fullName:'Quick Ball FST'}]}}],prompts:[]};
    }
    dispatch(){return true;}
  }
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  let trial='A';
  const liveA=new Store(),liveB=new Store(),clone=new Store();
  const observed=withPaperQuickBallMandatoryPayment(()=>{
    assert.equal(clone.dispatch(new PlayCardAction(11,0)),true);
    liveA.dispatch(new AddPlayerAction(11));
    assert.throws(()=>liveA.dispatch(new PlayCardAction(11,0)),
      /PAPER_QUICK_BALL_ROOT_INVALID/);
    assert.equal(clone.dispatch(new PlayCardAction(11,0)),true);
    trial='B';
    liveB.dispatch(new AddPlayerAction(11));
    assert.throws(()=>liveB.dispatch(new PlayCardAction(11,0)),
      /PAPER_QUICK_BALL_ROOT_INVALID/);
    assert.equal(liveA.dispatch(new PlayCardAction(11,0)),true);
    return 'completed';
  },{Store,requireLiveStore:true,currentTrialId:()=>trial});
  assert.equal(observed.result,'completed');
  assert.equal(observed.audit.liveSourceTrialCount,2);
  assert.equal(observed.audit.inspectedRoots,2);
  assert.equal(observed.audit.vetoedRoots,2);
  assert.equal(observed.audit.excludedAuxiliaryDispatches,3);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),before);
});
