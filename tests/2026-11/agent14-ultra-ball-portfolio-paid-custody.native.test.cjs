'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withPaperPromptContractPortfolio,VERSION
}=require('../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {runOne}=require('../../simulation/twinleaf/agent47-apex-ultraball-original-store.cjs');
const {probeUltraBallZeroPayment}=
  require('../../simulation/twinleaf/agent4-ultra-ball-zero-payment-native.cjs');

for(const seat of [0,1]){
  test('pinned original rank20 Ultra Ball physically pays in native seat '+seat,()=>{
    const {result,audit}=withPaperPromptContractPortfolio(()=>
      runOne(seat,'alternate'));
    assert.equal(result.seat,seat);
    assert.equal(result.initialPhysical60,true);
    assert.equal(result.acceptedPhysicalDiscard,true);
    assert.equal(result.discardedDragonPayload,true);
    assert.equal(audit.inspectedUltraBallPaymentPrompts,1);
    assert.equal(audit.verifiedUltraBallPhysicalPayments,1);
    assert.equal(audit.unverifiedUltraBallPhysicalPayments,0);
    const event=audit.examples.find(e=>
      e.sourcePrinting==='Ultra Ball MEG'&&
      e.contract==='printed-ultra-ball-exactly-two-physical-discard-negative');
    assert.ok(event,'Missing real native Ultra Ball payment prompt');
    assert.equal(event.nativePromptSettled,true);
    assert.equal(event.physicalEffectVerified,true);
    assert.equal(audit.schema,VERSION);
  });
  test('pinned original rank14 Ultra Ball zero-card payment is rejected before native dispatch in seat '+seat,()=>{
    const {result,audit}=withPaperPromptContractPortfolio(()=>
      probeUltraBallZeroPayment(seat,'zero'));
    assert.equal(result.seat,seat);
    assert.equal(result.originalValidatorAccepted,true);
    assert.equal(result.zeroPaymentPromptSettled,false);
    assert.match(result.zeroPaymentError,/PAPER_PROMPT_INVALID/);
    assert.ok(audit.inspectedUltraBallPaymentPrompts>=1);
    assert.ok(audit.vetoedBeforeDispatch>=1);
    assert.equal(audit.verifiedUltraBallPhysicalPayments,0);
  });
}
