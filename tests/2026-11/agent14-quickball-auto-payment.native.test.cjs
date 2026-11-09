'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withPaperPromptContractPortfolio,VERSION}=
  require('../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {
  probeQuickBallMandatoryPayment,probeQuickBallExplicitPayment
}=require('../../simulation/twinleaf/agent4-quickball-mandatory-payment-native.cjs');

for(const seat of [0,1]){
  test('pinned native owner Quick Ball auto-pays its sole other hand card in seat '+seat,()=>{
    const {result,audit}=withPaperPromptContractPortfolio(()=>
      probeQuickBallMandatoryPayment(seat,'zero'));
    assert.equal(result.seat,seat);
    assert.equal(result.rootError,null);
    assert.equal(result.energyAutoDiscardedBeforeSearch,true);
    assert.equal(result.energyInHand,false);
    assert.equal(result.energyInDiscard,true);
    assert.equal(result.promptEvidence.message,'CHOOSE_CARD_TO_HAND');
    assert.equal(audit.inspectedQuickBallPlayCardRoots,1);
    assert.equal(audit.inspectedQuickBallPaymentPrompts,0);
    assert.deepEqual(audit.quickBallAutomaticRootPayments,{
      attempted:1,verified:1,unverified:0,
      firstEvent:{sourcePrinting:'Quick Ball FST',trialId:null,
        turn:audit.quickBallAutomaticRootPayments.firstEvent.turn,
        storeOrdinal:audit.quickBallAutomaticRootPayments.firstEvent.storeOrdinal,
        physicallyPaid:true,submittedAtRoot:true}
    });
    assert.equal(audit.schema,VERSION);
  });
  test('pinned native multi-other-card Quick Ball uses explicit prompt instead of auto branch, seat '+seat,()=>{
    const {result,audit}=withPaperPromptContractPortfolio(()=>
      probeQuickBallExplicitPayment(seat,'one'));
    assert.equal(result.seat,seat);
    assert.equal(result.paymentError,null);
    assert.equal(result.energyInDiscard,true);
    assert.equal(audit.inspectedQuickBallPaymentPrompts,1);
    assert.equal(audit.quickBallAutomaticRootPayments.attempted,0);
    assert.equal(audit.physicalPaidDiscardByPrinting['Quick Ball FST'].verified,1);
  });
}
