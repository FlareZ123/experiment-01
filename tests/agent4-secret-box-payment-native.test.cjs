'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {secretBoxPaymentNegative,withPaperSecretBoxMandatoryPayment}=
  require('../simulation/twinleaf/agent4-secret-box-paper-payment-hook.cjs');
const {probeSecretBoxPayment,probeSecretBoxInsufficientRoot}=
  require('../simulation/twinleaf/agent4-secret-box-payment-native.cjs');

test('Secret Box printed three OTHER physically distinct owner-hand cards',()=>{
  const a={},b={},c={},x={};
  const owner={hand:{cards:[a,b,c]}};
  const prompt={cards:{cards:[a,b,c,x]}};
  assert.equal(secretBoxPaymentNegative(prompt,[],owner),
    'SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS');
  assert.equal(secretBoxPaymentNegative(prompt,[a,b],owner),
    'SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS');
  assert.equal(secretBoxPaymentNegative(prompt,[a,a,b],owner),
    'SECRET_BOX_REQUIRES_DISTINCT_PHYSICAL_CARDS');
  assert.equal(secretBoxPaymentNegative(prompt,[a,b,x],owner),
    'SECRET_BOX_PAYMENT_OUTSIDE_PHYSICAL_OWNER_HAND');
  assert.equal(secretBoxPaymentNegative(prompt,[a,b,c],owner),null);
});

test('original Secret Box native Store paper payment, both owner seats',()=>{
  for(const seat of [0,1]){
    const raw=probeSecretBoxPayment(seat,'zero');
    const guarded=withPaperSecretBoxMandatoryPayment(()=>
      probeSecretBoxPayment(seat,'zero'));
    const a=guarded.result;
    console.log('AGENT4_SECRET_BOX_ZERO_NATIVE '+JSON.stringify({
      seat,raw,guarded:a,audit:guarded.audit
    }));
    assert.equal(a.rootError,null);
    assert.equal(a.paymentPromptEvidence.type,'ChooseCardsPrompt');
    assert.equal(a.paymentPromptEvidence.sourcePrinting,'Secret Box TWM');
    assert.equal(a.paymentPromptEvidence.message,'CHOOSE_CARD_TO_DISCARD');
    assert.equal(a.paymentPromptEvidence.min,3);
    assert.equal(a.paymentPromptEvidence.max,3);
    assert.equal(a.paymentPromptEvidence.ownerHandSubset,true);
    assert.equal(a.paymentPromptEvidence.nativeValidatorAccepted,false);
    assert.match(a.paymentError,/PAPER_SECRET_BOX_PAYMENT_INVALID:SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS/);
    assert.equal(a.paymentSettled,false);
    assert.equal(a.energyADiscarded,false);
    assert.equal(a.energyBDiscarded,false);
    assert.equal(a.energyCDiscarded,false);
    assert.equal(a.boxDiscarded??false,false);
    assert.equal(guarded.audit.inspectedPayments,1);
    assert.equal(guarded.audit.vetoedPayments,1);
    const paid=withPaperSecretBoxMandatoryPayment(()=>
      probeSecretBoxPayment(seat,'three'));
    const b=paid.result;
    console.log('AGENT4_SECRET_BOX_PAID_NATIVE '+JSON.stringify({
      seat,paid:b,audit:paid.audit
    }));
    assert.equal(b.rootError,null);
    assert.equal(b.paymentError,null);
    assert.equal(b.paymentSettled,true);
    assert.equal(b.energyADiscarded,true);
    assert.equal(b.energyBDiscarded,true);
    assert.equal(b.energyCDiscarded,true);
    assert.equal(b.passInHand,true);
    assert.equal(b.boxInDiscard,true);
    assert.deepEqual(b.pendingPrompts,[]);
  }
});

test('Secret Box cannot play without three other hand cards both seats',()=>{
  for(const seat of [0,1]){
    const raw=probeSecretBoxInsufficientRoot(seat);
    const guarded=withPaperSecretBoxMandatoryPayment(()=>
      probeSecretBoxInsufficientRoot(seat));
    assert.match(guarded.result.rootError,
      /PAPER_SECRET_BOX_ROOT_INVALID:THREE_OTHER_CARDS_REQUIRED/);
    assert.equal(guarded.result.boxRetained,true);
    assert.equal(guarded.result.boxDiscarded,false);
    assert.deepEqual(guarded.result.pendingPrompts,[]);
    assert.equal(guarded.audit.inspectedRoots,1);
    assert.equal(guarded.audit.vetoedRoots,1);
    console.log('AGENT4_SECRET_BOX_ROOT '+JSON.stringify({
      seat,raw,guarded:guarded.result
    }));
  }
});

test('native Secret Box illegal zero cost can expose all four searchable categories, both seats',()=>{
  for(const seat of [0,1]){
    const raw=probeSecretBoxPayment(seat,'zero','four');
    const guarded=withPaperSecretBoxMandatoryPayment(()=>
      probeSecretBoxPayment(seat,'zero','four'));
    console.log('AGENT4_SECRET_BOX_FREE_FOUR_CATEGORY_NATIVE '+JSON.stringify({
      seat,raw,guarded:guarded.result,audit:guarded.audit
    }));
    assert.equal(raw.rootError,null);
    assert.equal(raw.paymentError,null);
    assert.equal(raw.paymentSettled,true);
    assert.equal(raw.energyADiscarded,false);
    assert.equal(raw.energyBDiscarded,false);
    assert.equal(raw.energyCDiscarded,false);
    assert.equal(raw.boxInDiscard,true);
    assert.equal(raw.continuation[0]?.message,'CHOOSE_CARD_TO_HAND');
    assert.equal(raw.continuation[0]?.selected?.length,4);
    assert.equal(raw.continuation[0]?.nativeValidatorAccepted,true);
    assert.equal(raw.continuation[0]?.error,null);
    assert.equal(raw.targetLocations.every(x=>x.inHand===true),true);
    assert.equal(guarded.result.paymentSettled,false);
    assert.match(guarded.result.paymentError,
      /PAPER_SECRET_BOX_PAYMENT_INVALID:SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS/);
    assert.equal(guarded.result.boxInHand,true);
    assert.equal(guarded.result.targetLocations.every(x=>x.inDeck===true),true);
    assert.equal(guarded.audit.vetoedPayments,1);
  }
});
