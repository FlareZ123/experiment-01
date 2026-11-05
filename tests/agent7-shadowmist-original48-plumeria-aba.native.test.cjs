'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {VERSION,runOriginalShadowMistPlumeriaAB}=
  require('../simulation/evaluation/agent7-shadowmist-original48-plumeria-aba.cjs');

test('actual original-source rank6 locked Pass is replaced by native Plumeria',()=>{
  // Actor-held printings only. Opt in to existing passive post-Store
  // receipts; the game's card choices, starting deals and policies stay fixed.
  const flag='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  const had=Object.hasOwn(process.env,flag);
  const prior=process.env[flag];
  let r;
  try{
    process.env[flag]='true';
    r=runOriginalShadowMistPlumeriaAB();
  }finally{
    if(had)process.env[flag]=prior;
    else delete process.env[flag];
  }
  const row=r.target;
  console.log('AGENT7_SHADOWMIST_PLUMERIA_ORIGINAL_AB',JSON.stringify({
    version:VERSION,targetTrial:row.id,
    originalSourceSeat:row.originalSourceSeat,
    originalSourceDealSha256:row.sourceDealSha256,
    matchedPhysicalTrialCount:r.paired.length,
    firstDivergence:row.firstDivergence,
    physicalPlumeriaAudit:row.physicalPlumeriaAudit,
    acceptedPlumeriaNativeRootSequence:
      row.treatmentAcceptedRootsFromFirstChange,
    firstSourceNonpromptAfterPlay:row.firstSourceNonpromptAfterChange,
    firstCandidateNonpromptAfterPlay:row.firstCandidateNonpromptAfterChange,
    byTrial:r.paired.map(x=>({
      id:x.id,control:x.controlStatus,treatment:x.treatmentStatus,
      unchangedPublicPrefix:x.commonRootPrefixLength,
      firstDiff:x.firstDivergence,
      originalRoots:x.controlRootCount,newRoots:x.treatmentRootCount,
      nativeFinishedControl:x.controlFinished,
      nativeFinishedTreatment:x.treatmentFinished
    })),
    nativeCompetitiveGames:0
  }));
  assert.equal(r.paired.length,8);
  assert.equal(r.unchangedOriginalAndFullDeal,true);
  assert.equal(row.originalSourceSeat,1);
  assert.ok(row.firstDivergence);
  assert.equal(row.firstDivergence.control.action,'PassTurnAction');
  assert.equal(row.firstDivergence.treatment.action,'PlayCardAction');
  assert.equal(row.firstDivergence.treatment.card,'Plumeria');
  assert.ok(row.physicalPlumeriaAudit,
    'Real native original Store physical payment audit must be retained');
  assert.ok(row.physicalPlumeriaAudit.acceptedPlayRoots>=1,
    'Source must have successfully played Plumeria');
  assert.ok(row.physicalPlumeriaAudit.nativeAcceptedMandatoryPrompts>=3,
    'Two-card payment, Pokemon target and attached Energy prompts must settle');
  assert.ok(row.physicalPlumeriaAudit.settledOpponentEnergyDiscards>=1,
    'An actual attached opponent Energy must leave through native settlement');
  assert.equal(row.physicalPlumeriaAudit.unresolvedPromptChains,0);
  const receipts=row.physicalPlumeriaAudit.ownerPaymentPrintingReceipts;
  assert.ok(Array.isArray(receipts),'Explicit read-only owner payment archive missing');
  assert.equal(receipts.length,1,'The original source T3 printed payment is unique');
  const receipt=receipts[0];
  assert.equal(receipt.seat,1);
  assert.equal(receipt.turn,3);
  assert.equal(receipt.acceptedByOriginalStore,true);
  assert.equal(receipt.payment.length,2);
  assert.ok(receipt.payment.every(card=>
    Number.isSafeInteger(card.handIndex)&&card.handIndex>=0&&
    typeof card.printing==='string'&&card.printing.length>0));
  assert.notEqual(receipt.payment[0].handIndex,receipt.payment[1].handIndex,
    'Two different physical hand positions must be discarded');
  assert.equal(r.nativePaperCompetitiveGames,0);
});
