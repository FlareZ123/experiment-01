'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {VERSION,withPaperPromptContractPortfolio}=
  require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {probeSecretBoxPayment,probeSecretBoxInsufficientRoot}=
  require('../simulation/twinleaf/agent4-secret-box-payment-native.cjs');

test('common v11 rejects real source-stamped Secret Box zero payment before Store mutation in both seats',()=>{
  for(const seat of [0,1]){
    const {result:r,audit}=withPaperPromptContractPortfolio(()=>
      probeSecretBoxPayment(seat,'zero','four'));
    assert.equal(r.rootError,null);
    assert.equal(r.paymentPromptEvidence.type,'ChooseCardsPrompt');
    assert.equal(r.paymentPromptEvidence.sourcePrinting,'Secret Box TWM');
    assert.equal(r.paymentPromptEvidence.message,'CHOOSE_CARD_TO_DISCARD');
    assert.equal(r.paymentPromptEvidence.min,3);
    assert.equal(r.paymentPromptEvidence.max,3);
    assert.match(r.paymentError,/PAPER_PROMPT_INVALID:.*SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS/);
    assert.equal(r.paymentSettled,false);
    assert.equal(r.boxInDiscard,false);
    assert.equal(r.energyADiscarded,false);
    assert.equal(r.energyBDiscarded,false);
    assert.equal(r.energyCDiscarded,false);
    assert.equal(r.targetLocations.every(row=>row.inDeck),true);
    assert.equal(audit.schema,VERSION);
    assert.equal(audit.inspectedSecretBoxPlayCardRoots,1);
    assert.equal(audit.inspectedSecretBoxPaymentPrompts,1);
    assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,1);
    assert.equal(audit.vetoedBeforeDispatch,1);
    console.log('SHARED_SECRET_BOX_V11_NATIVE_NEGATIVE',JSON.stringify({seat,
      paymentError:r.paymentError,source:r.paymentPromptEvidence.sourcePrinting,
      guard:VERSION,vetoed:audit.vetoedBeforeDispatch}));
  }
});

test('common v11 accepts real Secret Box three-card paid search and prevents insufficient-hand roots in both seats',()=>{
  for(const seat of [0,1]){
    const paid=withPaperPromptContractPortfolio(()=>
      probeSecretBoxPayment(seat,'three'));
    assert.equal(paid.result.rootError,null);
    assert.equal(paid.result.paymentError,null);
    assert.equal(paid.result.paymentSettled,true);
    assert.equal(paid.result.energyADiscarded,true);
    assert.equal(paid.result.energyBDiscarded,true);
    assert.equal(paid.result.energyCDiscarded,true);
    assert.equal(paid.result.boxInDiscard,true);
    assert.equal(paid.result.passInHand,true);
    assert.equal(paid.audit.inspectedSecretBoxPaymentPrompts,1);
    assert.equal(paid.audit.statusCounts.PAPER_PROMPT_INVALID,0);
    assert.equal(paid.audit.vetoedBeforeDispatch,0);
    // Negative-only paper certificate; full four-category effects are
    // separately audited, not silently promoted to 'paper verified'.
    assert.ok(paid.audit.statusCounts.PAPER_PROMPT_UNVERIFIED>=1);
    const insufficient=withPaperPromptContractPortfolio(()=>
      probeSecretBoxInsufficientRoot(seat));
    assert.match(insufficient.result.rootError,
      /PAPER_ROOT_INVALID:SECRET_BOX_REQUIRES_THREE_OTHER_CARDS/);
    assert.equal(insufficient.result.boxRetained,true);
    assert.equal(insufficient.result.boxDiscarded,false);
    assert.deepEqual(insufficient.result.pendingPrompts,[]);
    assert.equal(insufficient.audit.inspectedSecretBoxPlayCardRoots,1);
    assert.equal(insufficient.audit.vetoedSecretBoxInsufficientRoots,1);
    console.log('SHARED_SECRET_BOX_V11_NATIVE_POSITIVE',JSON.stringify({seat,
      paidPrompt:paid.audit.inspectedSecretBoxPaymentPrompts,
      accepted:paid.audit.nativeAccepted,
      rootVeto:insufficient.audit.vetoedSecretBoxInsufficientRoots}));
  }
});
