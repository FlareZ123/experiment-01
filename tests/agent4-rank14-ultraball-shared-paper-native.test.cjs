'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  independentUltraBallPaymentNegative,withPaperPromptContractPortfolio,
  VERSION
}=require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {probeUltraBallZeroPayment}=
  require('../simulation/twinleaf/agent4-ultra-ball-zero-payment-native.cjs');

test('pure mandatory Ultra Ball cost has two distinct physically available cards',()=>{
  assert.match(VERSION,/v10-ultra-ball-mandatory-cost/);
  const grass={},fire={},unknown={};
  const p={cards:{cards:[grass,fire]}};
  assert.equal(independentUltraBallPaymentNegative(p,[]),
    'ULTRA_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_TWO');
  assert.equal(independentUltraBallPaymentNegative(p,[grass]),
    'ULTRA_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_TWO');
  assert.equal(independentUltraBallPaymentNegative(p,[grass,fire,unknown]),
    'ULTRA_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_TWO');
  assert.equal(independentUltraBallPaymentNegative(p,[grass,grass]),
    'ULTRA_BALL_REQUIRES_TWO_DISTINCT_PHYSICAL_CARDS');
  assert.equal(independentUltraBallPaymentNegative(p,[grass,unknown]),
    'ULTRA_BALL_PAYMENT_OUTSIDE_PHYSICAL_HAND');
  assert.equal(independentUltraBallPaymentNegative(p,[grass,fire]),null);
});

test('shared v10 native owner Ultra Ball rejects free search, retains paid search in both seats',()=>{
  for(const seat of [0,1]){
    const failed=withPaperPromptContractPortfolio(()=>
      probeUltraBallZeroPayment(seat,'zero'));
    const a=failed.result,fa=failed.audit;
    assert.equal(a.rootError,null);
    assert.equal(a.originalPrintedCard,'Ultra Ball MEG 131');
    assert.equal(a.paymentPromptSource,'Ultra Ball MEG');
    assert.equal(a.originalMin,2);
    assert.equal(a.originalMax,2);
    assert.equal(a.chosenValidatorAccepted,false);
    assert.match(a.zeroPaymentError,/PAPER_PROMPT_INVALID:.*ULTRA_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_TWO/);
    assert.equal(a.zeroPaymentPromptSettled,false);
    assert.equal(a.regidragoStillInDeck,true);
    assert.equal(a.regidragoAddedToHand,false);
    assert.equal(a.grassStillInHand,true);
    assert.equal(a.fireStillInHand,true);
    assert.ok(fa.inspectedUltraBallPaymentPrompts>=1);
    assert.ok(fa.vetoedBeforeDispatch>=1);

    const paid=withPaperPromptContractPortfolio(()=>
      probeUltraBallZeroPayment(seat,'two'));
    const b=paid.result,ba=paid.audit;
    assert.equal(b.rootError,null);
    assert.equal(b.paymentPromptSource,'Ultra Ball MEG');
    assert.equal(b.zeroPaymentError,null);
    assert.equal(b.zeroPaymentPromptSettled,true);
    assert.equal(b.grassDiscarded,true);
    assert.equal(b.fireDiscarded,true);
    assert.equal(b.regidragoAddedToHand,true);
    assert.equal(b.regidragoStillInDeck,false);
    assert.deepEqual(b.promptsPending,[]);
    assert.equal(ba.inspectedUltraBallPlayCardRoots,1);
    assert.equal(ba.vetoedUltraBallInsufficientRoots,0);
    assert.equal(ba.inspectedUltraBallPaymentPrompts,1);
    assert.equal(ba.statusCounts.PAPER_PROMPT_INVALID,0);
    console.log('AGENT4_SHARED_V10_ULTRA_BALL '+JSON.stringify({
      seat,zeroError:a.zeroPaymentError,zeroAccepted:a.zeroPaymentPromptSettled,
      paidSearch:b.regidragoAddedToHand,paidEnergyDiscarded:[
        b.grassDiscarded,b.fireDiscarded],rootChecks:ba.inspectedUltraBallPlayCardRoots,
      paymentChecks:ba.inspectedUltraBallPaymentPrompts
    }));
  }
});
