'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {quickBallPaymentNegative,withPaperQuickBallMandatoryPayment}=
  require('../simulation/twinleaf/agent4-quick-ball-paper-payment-hook.cjs');
const {probeQuickBallMandatoryPayment,probeQuickBallNoOtherCard}=
  require('../simulation/twinleaf/agent4-quickball-mandatory-payment-native.cjs');

test('Quick Ball printed cost requires one actual offered physical card',()=>{
  const a={},b={},prompt={cards:{cards:[a]}};
  assert.equal(quickBallPaymentNegative(prompt,[]),
    'QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE');
  assert.equal(quickBallPaymentNegative(prompt,[a,a]),
    'QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE');
  assert.equal(quickBallPaymentNegative(prompt,[b]),
    'QUICK_BALL_PAYMENT_OUTSIDE_PHYSICAL_OWNER_HAND');
  assert.equal(quickBallPaymentNegative(prompt,[a]),null);
});

test('genuine rank5 FST Quick Ball source printed payment both physical seats',()=>{
  for(const seat of [0,1]){
    const raw=probeQuickBallMandatoryPayment(seat,'zero');
    const guarded=withPaperQuickBallMandatoryPayment(()=>
      probeQuickBallMandatoryPayment(seat,'zero'));
    const a=guarded.result;
    console.log('AGENT4_QUICK_BALL_PROMPT_ZONE '+JSON.stringify({seat,raw,guarded:a,audit:guarded.audit}));
    assert.equal(a.rootError,null);
    assert.equal(a.promptEvidence.printing,'Quick Ball FST');
    assert.equal(a.promptEvidence.type,'ChooseCardsPrompt');
    assert.equal(a.promptEvidence.min,0); // Native permits a printed-forbidden zero-cost payment.
    assert.equal(a.promptEvidence.max,1);
    assert.match(a.paymentError,/PAPER_QUICK_BALL_PAYMENT_INVALID:QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE/);
    assert.equal(a.paymentSettled,false);
    assert.equal(a.energyInHand,true);
    assert.equal(a.dedenneInDeck,true);
    assert.equal(guarded.audit.inspectedRoots,1);
    assert.equal(guarded.audit.inspectedPayments,1);
    assert.equal(guarded.audit.vetoedPayments,1);
    const paid=withPaperQuickBallMandatoryPayment(()=>
      probeQuickBallMandatoryPayment(seat,'one'));
    const b=paid.result;
    assert.equal(b.rootError,null);
    assert.equal(b.paymentError,null);
    assert.equal(b.paymentSettled,true);
    assert.equal(b.energyInDiscard,true);
    assert.equal(b.dedenneInHand,true);
    assert.equal(b.dedenneInDeck,false);
    assert.deepEqual(b.pendingPrompts,[]);
    assert.equal(paid.audit.vetoedPayments,0);
    console.log('AGENT4_QUICK_BALL_NATIVE_PAYMENT '+JSON.stringify({
      seat,rawZeroError:raw.paymentError,
      rawZeroSettled:raw.paymentSettled,
      guardedZeroError:a.paymentError,guardedZeroSettled:a.paymentSettled,
      paidDiscard:b.energyInDiscard,paidBasicInHand:b.dedenneInHand,
      validPaymentPromptSource:b.promptEvidence.printing
    }));
  }
});

test('Quick Ball root with no other physically held card is guarded in both seats',()=>{
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
