'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeSecretBoxCopyReserveV2Payment}=
  require('../simulation/twinleaf/agent4-secret-box-copy-reserve-v2-native.cjs');

test('count-based reserve frontier representatives settle on native prompts in both seats',()=>{
  for(const seat of [0,1]){
    for(const candidate of ['carrier','lillie','lillie-second']){
      const {result,audit}=probeSecretBoxCopyReserveV2Payment(seat,candidate);
      console.log('AGENT4_SECRET_BOX_COPY_RESERVE_V2_NATIVE '+JSON.stringify({result,audit}));
      assert.equal(result.rootError,null);
      assert.equal(result.prompt.type,'ChooseCardsPrompt');
      assert.equal(result.prompt.source,'Secret Box TWM');
      assert.equal(result.prompt.message,'CHOOSE_CARD_TO_DISCARD');
      assert.equal(result.prompt.ownerId,411);
      assert.equal(result.prompt.min,3);
      assert.equal(result.prompt.max,3);
      assert.equal(result.prompt.offeredCount,9);
      assert.equal(result.adapter.version,'owner-hand-discard-copy-reserve-count-v2');
      assert.equal(result.adapter.sourceIndex,null);
      assert.equal(result.adapter.sourceCardPresentInHand,false);
      assert.equal(result.adapter.sourcePrinting,null);
      assert.equal(result.adapter.handLength,9);
      assert.equal(result.adapter.frontierIdentityScope,'printing-count-based');
      assert.equal(result.adapter.softReserveCopyInvariant,true);
      assert.equal(result.adapter.softReserveCountSemantics,
        'remaining-printing-multiplicities');
      assert.equal(result.adapter.possibleFirstPaymentCount,'56');
      assert.equal(result.adapter.paymentScoreGroupPhysicalPayments,
        result.adapter.possibleFirstPaymentCount);
      assert.deepEqual(result.adapter.hardReservedCards,[
        {promptIndex:1,physicalId:80032,printing:'Rescue Carrier EVS'}
      ]);
      assert.equal(result.adapter.hardRequirementsSatisfied,true);
      assert.equal(result.adapter.softPreferenceCapacityAvailable,true);
      const lillieRow=result.adapter.reserveRows.find(row=>
        row.printing==="Lillie's Determination M1L");
      assert.equal(lillieRow.softAdditionalRequired,1);
      assert.equal(lillieRow.softCapacityShortfall,0);
      assert.equal(result.selectedPhysicalUniqueCount,3);
      assert.equal(new Set(result.selectedPhysicalIds).size,3);
      const expectedThird=candidate==='carrier'?
        {promptIndex:3,physicalId:80034,printing:'Rescue Carrier EVS'}:
        candidate==='lillie'?
          {promptIndex:4,physicalId:80035,printing:"Lillie's Determination M1L"}:
          {promptIndex:5,physicalId:80036,printing:"Lillie's Determination M1L"};
      assert.deepEqual(result.selectedCards,[
        {promptIndex:0,physicalId:80030,printing:'Battle VIP Pass FST'},
        {promptIndex:2,physicalId:80033,printing:'Battle VIP Pass FST'},
        expectedThird
      ]);
      assert.deepEqual(result.adapter.representativePaymentIndices,
        candidate==='carrier'?[0,2,3]:[0,2,4]);
      assert.deepEqual(result.adapter.selectedPromptIndices,
        [0,2,expectedThird.promptIndex]);
      assert.deepEqual(result.selectedPhysicalIds,
        [80030,80033,expectedThird.physicalId]);
      assert.deepEqual(result.discardedLilliePhysicalIds,
        candidate==='carrier'?[]:[expectedThird.physicalId]);
      assert.deepEqual(result.remainingLilliePhysicalIds,
        candidate==='carrier'?[80035,80036]:
          candidate==='lillie'?[80036]:[80035]);
      assert.equal(result.nativeValidatorAccepted,true);
      assert.equal(result.paymentError,null);
      assert.equal(result.paymentSettled,true);
      assert.equal(result.physicalPaymentSettled,true);
      assert.equal(result.adapter.vector.protectedSacrificed,0);
      assert.equal(result.adapter.vector.softReserveDeficitByPrinting[
        "Lillie's Determination M1L"],0);
      assert.equal(result.adapter.vector.deadCardsSpent,2);
      assert.equal(result.adapter.vector.nextUnprotectedPaymentWays,'6');
      assert.equal(result.adapter.vector.unprotectedRemainingByPrinting[
        'Rescue Carrier EVS'],candidate==='carrier'?0:1);
      assert.equal(result.adapter.vector.unprotectedRemainingByPrinting[
        "Lillie's Determination M1L"],candidate==='carrier'?1:0);
      assert.equal(result.adapter.vector.remainingCopiesByPrinting[
        'Rescue Carrier EVS'],candidate==='carrier'?1:2);
      assert.equal(result.adapter.vector.remainingCopiesByPrinting[
        "Lillie's Determination M1L"],candidate==='carrier'?2:1);
      assert.equal(result.adapter.equivalentPhysicalPayments,
        candidate==='carrier'?1:2);
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
      assert.equal(result.adapter.paperCardPlayabilityCertified,false);
      assert.equal(result.adapter.downstreamTargetAccessCertified,false);
      assert.equal(result.adapter.strategicOptimalityCertified,false);
      assert.equal(result.qualifiedGame,false);
      assert.equal(audit.inspectedRoots,1);
      assert.equal(audit.inspectedPayments,1);
      assert.equal(audit.vetoedRoots,0);
      assert.equal(audit.vetoedPayments,0);
      assert.equal(audit.qualifiedGames,0);
    }
  }
});
