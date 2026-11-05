'use strict';
const assert=require('node:assert/strict');
const {VERSION,withPaperPromptContractPortfolio}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');
const {
  probeQuickBallMandatoryPayment,probeQuickBallExplicitPayment,
  probeQuickBallNoOtherCard
}=require('./agent4-quickball-mandatory-payment-native.cjs');

/**
 * Real pinned native Store and printed Quick Ball FST 237 from the original
 * Aichi source rank 5. This uses staged physical hands in both seat orientations.
 * It demonstrates only the narrow payment contract and native continuation.
 *
 * @returns {object} Both-seat paper negative and physical positive witnesses.
 */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const insufficient=withPaperPromptContractPortfolio(()=>
      probeQuickBallNoOtherCard(seat));
    assert.match(insufficient.result.error,
      /PAPER_ROOT_INVALID:QUICK_BALL_ONE_OTHER_CARD_REQUIRED/);
    assert.equal(insufficient.result.ballInHand,true);
    assert.equal(insufficient.result.ballInDiscard,false);
    assert.equal(insufficient.audit.inspectedQuickBallPlayCardRoots,1);
    assert.equal(insufficient.audit.vetoedQuickBallInsufficientRoots,1);

    const auto=withPaperPromptContractPortfolio(()=>
      probeQuickBallMandatoryPayment(seat,'zero'));
    assert.equal(auto.result.rootError,null);
    assert.equal(auto.result.energyAutoDiscardedBeforeSearch,true);
    assert.equal(auto.result.energyInDiscard,true);
    assert.equal(auto.result.ballInDiscard,true);
    assert.equal(auto.result.promptEvidence.message,'CHOOSE_CARD_TO_HAND');
    assert.equal(auto.result.searchError,null);
    assert.equal(auto.result.searchSettled,true);
    assert.equal(auto.audit.inspectedQuickBallPaymentPrompts,0);

    const zero=withPaperPromptContractPortfolio(()=>
      probeQuickBallExplicitPayment(seat,'zero'));
    assert.equal(zero.result.rootError,null);
    assert.equal(zero.result.paymentPromptEvidence.message,'CHOOSE_CARD_TO_DISCARD');
    assert.match(zero.result.paymentError,
      /PAPER_PROMPT_INVALID:.*QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE/);
    assert.equal(zero.result.paymentSettled,false);
    assert.equal(zero.result.energyInHand,true);
    assert.equal(zero.result.energyInDiscard,false);
    assert.equal(zero.audit.inspectedQuickBallPaymentPrompts,1);

    const paid=withPaperPromptContractPortfolio(()=>
      probeQuickBallExplicitPayment(seat,'one'));
    assert.equal(paid.result.rootError,null);
    assert.equal(paid.result.paymentError,null);
    assert.equal(paid.result.paymentSettled,true);
    assert.equal(paid.result.energyInDiscard,true);
    assert.equal(paid.result.energyInHand,false);
    assert.equal(paid.audit.inspectedQuickBallPaymentPrompts,1);
    assert.equal(paid.audit.statusCounts.PAPER_PROMPT_INVALID,0);
    assert.equal(paid.audit.statusCounts.PAPER_PROMPT_VERIFIED,0);
    rows.push({seat,
      insufficient:{rootError:insufficient.result.error,
        inspected:insufficient.audit.inspectedQuickBallPlayCardRoots,
        noPhysicalMutation:insufficient.result.ballInHand &&
          !insufficient.result.ballInDiscard},
      oneOtherAuto:{rootError:auto.result.rootError,
        paymentNoPrompt:auto.audit.inspectedQuickBallPaymentPrompts===0,
        energyPhysicallyDiscarded:auto.result.energyInDiscard},
      zeroPrompt:{paymentError:zero.result.paymentError,
        rootAccepted:zero.result.rootError===null,
        paymentLeftUnsettled:!zero.result.paymentSettled},
      paidPrompt:{paymentError:paid.result.paymentError,
        energyPhysicallyDiscarded:paid.result.energyInDiscard,
        exactOneOwnerCard:paid.result.paymentPromptEvidence.offered.length===2}});
  }
  const out={schema:'agent46-quick-ball-original-source-common-paper-v1',
    portfolioVersion:VERSION,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalFieldNameCountSourceCount:21,
    originalFieldQuickBallCopies:72,
    sourcePrinting:'Quick Ball FST 237',
    nativeCompilesRequired:true,entireGamePaperQualified:false,
    opponentPolicyQualified:false,competitiveQualifiedGames:0,rows};
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)run();
module.exports={run};
