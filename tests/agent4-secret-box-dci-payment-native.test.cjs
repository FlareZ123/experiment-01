'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeSecretBoxDciPayment}=
  require('../simulation/twinleaf/agent4-secret-box-dci-payment-native.cjs');

test('native Secret Box prompt accepts Agent21 DCI VIP/VIP/Lillie payment in both seats',()=>{
  for(const seat of [0,1]){
    const {result,audit}=probeSecretBoxDciPayment(seat);
    console.log('AGENT4_SECRET_BOX_DCI_NATIVE '+JSON.stringify({result,audit}));
    assert.equal(result.rootError,null);
    assert.equal(result.prompt.type,'ChooseCardsPrompt');
    assert.equal(result.prompt.source,'Secret Box TWM');
    assert.equal(result.prompt.message,'CHOOSE_CARD_TO_DISCARD');
    assert.equal(result.prompt.ownerId,411);
    assert.equal(result.prompt.min,3);
    assert.equal(result.prompt.max,3);
    assert.equal(result.prompt.offeredCount,9);
    assert.equal(result.plan.totalCost,4);
    assert.deepEqual(result.plan.selectedPrintings,[
      'Battle VIP Pass FST',
      'Battle VIP Pass FST',
      "Lillie's Determination M1L"
    ]);
    assert.equal(result.nativeValidatorAccepted,true);
    assert.equal(result.paymentError,null);
    assert.equal(result.paymentSettled,true);
    assert.equal(result.physicalPaymentSettled,true);
    assert.equal(result.discardedVipCopies,2);
    assert.equal(result.discardedLillieCopies,1);
    assert.equal(result.discardedCarrierCopies,0);
    assert.equal(result.remainingVipCopies,0);
    assert.equal(result.remainingLillieCopies,1);
    assert.equal(result.remainingCarrierCopies,2);
    assert.equal(result.remainingPowerglass,true);
    assert.equal(result.remainingForestSealStone,true);
    assert.equal(result.remainingMysteriousTreasure,true);
    assert.ok(Number.isFinite(result.recoveryTargetHp));
    assert.ok(result.recoveryTargetHp<=90);
    assert.equal(result.carrierDiscardCost,9);
    assert.equal(result.powerglassDiscardCost,12);
    assert.equal(result.secretBoxSearchPending,true);
    assert.equal(result.preexistingDiscardPreserved,true);
    assert.equal(audit.inspectedRoots,1);
    assert.equal(audit.inspectedPayments,1);
    assert.equal(audit.vetoedRoots,0);
    assert.equal(audit.vetoedPayments,0);
  }
});
