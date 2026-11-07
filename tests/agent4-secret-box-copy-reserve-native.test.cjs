'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeSecretBoxCopyReservePayment}=
  require('../simulation/twinleaf/agent4-secret-box-copy-reserve-native.cjs');

test('copy-reserve frontier representatives map to real Secret Box payments in both seats',()=>{
  for(const seat of [0,1]){
    for(const candidate of ['carrier','lillie']){
      const {result,audit}=probeSecretBoxCopyReservePayment(seat,candidate);
      console.log('AGENT4_SECRET_BOX_COPY_RESERVE_NATIVE '+JSON.stringify({result,audit}));
      assert.equal(result.rootError,null);
      assert.equal(result.prompt.type,'ChooseCardsPrompt');
      assert.equal(result.prompt.source,'Secret Box TWM');
      assert.equal(result.prompt.message,'CHOOSE_CARD_TO_DISCARD');
      assert.equal(result.prompt.ownerId,411);
      assert.equal(result.prompt.min,3);
      assert.equal(result.prompt.max,3);
      assert.equal(result.prompt.offeredCount,9);
      assert.equal(result.adapter.version,'owner-hand-discard-copy-reserve-v1');
      assert.equal(result.adapter.sourceIndex,null);
      assert.equal(result.adapter.sourceCardPresentInHand,false);
      assert.equal(result.adapter.sourcePrinting,null);
      assert.equal(result.adapter.handLength,9);
      assert.equal(result.adapter.possibleFirstPaymentCount,'56');
      assert.equal(result.adapter.hardReservedCards.length,1);
      assert.equal(result.adapter.hardReservedCards[0].printing,'Rescue Carrier EVS');
      assert.equal(result.adapter.softProtectedCards.length,1);
      assert.equal(result.adapter.softProtectedCards[0].printing,"Lillie's Determination M1L");
      assert.equal(result.adapter.hardRequirementsSatisfied,true);
      assert.equal(result.adapter.softPreferenceCapacityAvailable,true);
      assert.equal(result.selectedPhysicalUniqueCount,3);
      assert.equal(new Set(result.selectedPhysicalIds).size,3);
      assert.ok(result.selectedCards.every(card=>
        Number.isSafeInteger(card.promptIndex)&&
        Number.isSafeInteger(card.physicalId)));
      assert.equal(result.nativeValidatorAccepted,true);
      assert.equal(result.paymentError,null);
      assert.equal(result.paymentSettled,true);
      assert.equal(result.physicalPaymentSettled,true);
      assert.deepEqual(result.selectedPrintings,candidate==='carrier'?
        ['Battle VIP Pass FST','Battle VIP Pass FST','Rescue Carrier EVS']:
        ['Battle VIP Pass FST','Battle VIP Pass FST',"Lillie's Determination M1L"]);
      assert.equal(result.adapter.vector.deadCardsSpent,2);
      assert.equal(result.adapter.vector.protectedSacrificed,
        candidate==='carrier'?0:1);
      assert.equal(result.adapter.vector.nextUnprotectedPaymentWays,
        candidate==='carrier'?'6':'10');
      assert.ok(result.adapter.equivalentPhysicalPayments>=1);
      const hardId=result.adapter.hardReservedCards[0].physicalId;
      const softId=result.adapter.softProtectedCards[0].physicalId;
      assert.ok(!result.selectedPhysicalIds.includes(hardId));
      assert.equal(result.selectedPhysicalIds.includes(softId),candidate==='lillie');
      assert.equal(result.remainingVipCopies,0);
      assert.equal(result.remainingCarrierCopies,candidate==='carrier'?1:2);
      assert.equal(result.remainingLillieCopies,candidate==='carrier'?2:1);
      assert.equal(result.remainingPowerglass,true);
      assert.equal(result.remainingForestSealStone,true);
      assert.equal(result.remainingMysteriousTreasure,true);
      assert.ok(Number.isFinite(result.recoveryTargetHp));
      assert.ok(result.recoveryTargetHp<=90);
      assert.equal(result.secretBoxSearchPending,true);
      assert.equal(result.preexistingDiscardPreserved,true);
      assert.equal(result.qualifiedGame,false);
      assert.equal(audit.inspectedRoots,1);
      assert.equal(audit.inspectedPayments,1);
      assert.equal(audit.vetoedRoots,0);
      assert.equal(audit.vetoedPayments,0);
      assert.equal(audit.qualifiedGames,0);
    }
  }
});
