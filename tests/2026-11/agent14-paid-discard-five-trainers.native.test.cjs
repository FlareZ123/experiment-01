'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withPaperPromptContractPortfolio,VERSION}=
  require('../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {runSeat:treasure}=
  require('../../simulation/twinleaf/agent49-mysterious-treasure-native-probe.cjs');
const {probeQuickBallExplicitPayment:quickBall}=
  require('../../simulation/twinleaf/agent4-quickball-mandatory-payment-native.cjs');
const {probeSecretBoxPayment:secretBox}=
  require('../../simulation/twinleaf/agent4-secret-box-payment-native.cjs');
const {probeRoxieChoiceIndexShift:roxie}=
  require('../../simulation/twinleaf/agent4-rank31-roxie-koffing-spoons-native.cjs');

for(const seat of [0,1]){
  test('source-owned Mysterious Treasure prompt physically pays one in native seat '+seat,()=>{
    const {result,audit}=withPaperPromptContractPortfolio(()=>treasure(seat));
    assert.equal(result.seat,seat);
    assert.equal(result.error,null);
    assert.equal(result.nativeEffect.costDiscarded,true);
    assert.equal(result.nativeEffect.selectedTargetInHand,true);
    assert.equal(audit.inspectedTreasurePaymentPrompts,1);
    assert.equal(audit.physicalPaidDiscardByPrinting['Mysterious Treasure FLI'].verified,1);
    assert.equal(audit.physicalPaidDiscardByPrinting['Mysterious Treasure FLI'].unverified,0);
    assert.equal(audit.schema,VERSION);
  });
  test('source-owned Quick Ball explicitly pays one in native seat '+seat,()=>{
    const {result,audit}=withPaperPromptContractPortfolio(()=>
      quickBall(seat,'one'));
    assert.equal(result.seat,seat);
    assert.equal(result.paymentError,null);
    assert.equal(result.paymentSettled,true);
    assert.equal(result.energyInDiscard,true);
    assert.equal(audit.inspectedQuickBallPaymentPrompts,1);
    assert.equal(audit.physicalPaidDiscardByPrinting['Quick Ball FST'].verified,1);
    assert.equal(audit.physicalPaidDiscardByPrinting['Quick Ball FST'].unverified,0);
  });
  test('source-owned Secret Box physically pays three in native seat '+seat,()=>{
    const {result,audit}=withPaperPromptContractPortfolio(()=>
      secretBox(seat,'three'));
    assert.equal(result.seat,seat);
    assert.equal(result.paymentError,null);
    assert.equal(result.paymentSettled,true);
    assert.equal(result.energyADiscarded,true);
    assert.equal(result.energyBDiscarded,true);
    assert.equal(result.energyCDiscarded,true);
    assert.equal(audit.inspectedSecretBoxPaymentPrompts,1);
    assert.equal(audit.physicalPaidDiscardByPrinting['Secret Box TWM'].verified,1);
    assert.equal(audit.physicalPaidDiscardByPrinting['Secret Box TWM'].unverified,0);
  });
  test('source-owned Roxie physically pays eligible Koffing in native seat '+seat,()=>{
    const {result,audit}=withPaperPromptContractPortfolio(()=>
      roxie(false,false,seat));
    assert.equal(result.seat,seat);
    assert.equal(result.nativeStoreError,null);
    assert.equal(result.physicalKoffingDiscarded,true);
    assert.equal(result.promptSettled,true);
    assert.equal(audit.inspectedRoxiePaymentPrompts,1);
    assert.equal(audit.physicalPaidDiscardByPrinting['Roxie CEC'].verified,1);
    assert.equal(audit.physicalPaidDiscardByPrinting['Roxie CEC'].unverified,0);
  });
}
