'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const path=require('node:path');
const {
  runStewardBilateralProbeV9,writeJsonAtomic
}=require('./agent36-issue25-common-v9-bilateral-competence.cjs');
const {
  withOwnerOneEnergyBoxKo,VERSION:BRIDGE_VERSION,
  DCI_PAYMENT_VERSION
}=require('../twinleaf/agent43-owner-secretbox-fog-ko.cjs');

const VERSION='agent39-root93-secretbox-fixed-dci-fixed-aba-v1';
const ROOT=path.resolve(__dirname,'../..');
const ARTIFACT=path.join(ROOT,
  'artifacts/agent39-secretbox-dci-payment-aba/attempt.json');
const DIAGNOSTIC=path.join(ROOT,
  'artifacts/agent39-secretbox-dci-payment-aba/diagnostic.json');
const TRIAL='11:1000:B:new-moon-lockbreaker-v1';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const LILLIE="Lillie's Determination M1L";

/** @param {unknown} value @returns {string} */
function sha256Json(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** @param {object} result @returns {object[]} */
function ledgerOf(result){
  const ledger=result?.nativeAttempt?.rootActionLedger;
  assert.ok(Array.isArray(ledger),'Native root-action ledger is required');
  return ledger;
}

/**
 * Execute one arm on the immutable historical registered deal.
 * @param {'fixed'|'dci'} paymentMode
 * @returns {{result:object,audit:object,ledger:object[]}}
 */
function runArm(paymentMode){
  const hooked=withOwnerOneEnergyBoxKo(
    ()=>runStewardBilateralProbeV9(),{paymentMode});
  const result=hooked.result;
  const audit=hooked.audit;
  assert.equal(result.manifest.registeredTrialIds[0],TRIAL);
  assert.deepEqual(result.manifest.originalSourceRanks,[11]);
  assert.equal(result.manifest.candidateSlot,'B');
  assert.equal(result.manifest.competitiveGamesQualified,0);
  assert.equal(audit.paymentMode,paymentMode);
  result.nativeAdapterAudit.agent39SecretBoxPaymentAba=audit;
  return {result,audit,ledger:ledgerOf(result)};
}

/**
 * Count an exact root-action prefix shared by two native executions.
 * @param {object[]} left
 * @param {object[]} right
 * @returns {number}
 */
function commonPrefixLength(left,right){
  let index=0;
  while(index<left.length&&index<right.length&&
    JSON.stringify(left[index])===JSON.stringify(right[index]))index++;
  return index;
}

/**
 * Produce a bounded first-divergence receipt without duplicating full ledgers.
 * @param {object[]} left
 * @param {object[]} right
 * @returns {object|null}
 */
function firstDifference(left,right){
  const index=commonPrefixLength(left,right);
  if(index===left.length&&index===right.length)return null;
  return {
    index,
    leftOrdinal:left[index]?.actionOrdinal??null,
    rightOrdinal:right[index]?.actionOrdinal??null,
    leftAction:left[index]??null,
    rightAction:right[index]??null
  };
}

/**
 * Summarize only the owner-visible payment and actual native attack receipts.
 * @param {{result:object,audit:object,ledger:object[]}} arm
 * @param {'fixed'|'dci'} mode
 * @returns {object}
 */
function summarizeArm(arm,mode){
  const payment=arm.audit.actions.find(row=>row.kind==='box-payment');
  const attack=arm.audit.actions.find(row=>row.kind==='attack');
  assert.ok(payment,'Secret Box payment receipt is missing');
  assert.ok(attack,'Native Hidden Power submission receipt is missing');
  assert.ok(arm.audit.candidatePlans>0);
  assert.ok(arm.audit.paperPaymentsAccepted>0);
  assert.ok(arm.audit.physicalBoxSearches>0);
  assert.ok(arm.audit.physicallyAttachedBasic>0);
  assert.ok(arm.audit.submittedAttacks>0);
  return {
    mode,
    trial:arm.result.nativeAttempt.id,
    seed:arm.result.nativeAttempt.seed,
    sourceDealFingerprint:arm.result.nativeAttempt.sourceDealFingerprint,
    fullPhysicalDealFingerprint:arm.result.nativeAttempt.fullPhysicalDealFingerprint,
    rootActionCount:arm.result.nativeAttempt.rootActionCount,
    rootLedgerSha256:sha256Json(arm.ledger),
    nativeStatus:arm.result.nativeAttempt.status,
    winner:arm.result.nativeAttempt.winner,
    finalPrizes:arm.result.nativeAttempt.finalPrizes,
    payment:{
      selectedPrintings:payment.paidPhysicalPrintings,
      remainingHandPrintings:payment.remainingHandPrintings,
      dciTotalCost:payment.dciPaymentTotalCost,
      dciCardCosts:payment.dciPaymentCardCosts,
      dciPlans:arm.audit.dciPaymentPlans
    },
    attack:{
      ownerPrizeBefore:attack.ownerPrizeBefore,
      ownerPrizeAfter:attack.ownerPrizeAfter,
      target:attack.attackTargetBefore
    },
    audit:{
      candidatePlans:arm.audit.candidatePlans,
      paperPaymentsAccepted:arm.audit.paperPaymentsAccepted,
      physicalBoxSearches:arm.audit.physicalBoxSearches,
      physicalBoxSearchCards:arm.audit.physicalBoxSearchCards,
      physicallyAttachedBasic:arm.audit.physicallyAttachedBasic,
      submittedAttacks:arm.audit.submittedAttacks,
      paymentMode:arm.audit.paymentMode,
      dciPaymentVersion:arm.audit.dciPaymentVersion
    }
  };
}

/**
 * Compare the fixed-payment control with the optional DCI payment and repeat
 * the fixed control. All three arms use the same registered source/candidate
 * decks, physical deal, seed and pinned native engine.
 * @returns {object}
 */
function run(){
  const fixedA1=runArm('fixed');
  const dciB=runArm('dci');
  const fixedA2=runArm('fixed');
  const arms=[fixedA1,dciB,fixedA2];
  const sourceFingerprints=arms.map(x=>
    x.result.nativeAttempt.sourceDealFingerprint);
  const fullFingerprints=arms.map(x=>
    x.result.nativeAttempt.fullPhysicalDealFingerprint);
  assert.ok(sourceFingerprints.every(x=>x===sourceFingerprints[0]),
    'All A/B/A arms must share the exact source deal');
  assert.ok(fullFingerprints.every(x=>x===fullFingerprints[0]),
    'All A/B/A arms must share the exact full physical deal');
  assert.equal(sha256Json(fixedA1.ledger),sha256Json(fixedA2.ledger),
    'Fixed-payment A1/A2 root ledgers must be exactly reproducible');

  const fixedPayment=summarizeArm(fixedA1,'fixed').payment;
  const dciPayment=summarizeArm(dciB,'dci').payment;
  const fixedRepeatPayment=summarizeArm(fixedA2,'fixed').payment;
  assert.deepEqual([...fixedPayment.selectedPrintings].sort(),
    [VIP,VIP,CARRIER].sort());
  assert.deepEqual([...fixedRepeatPayment.selectedPrintings].sort(),
    [VIP,VIP,CARRIER].sort());
  assert.deepEqual([...dciPayment.selectedPrintings].sort(),
    [VIP,VIP,LILLIE].sort());
  assert.equal(dciPayment.dciTotalCost,4);
  assert.equal(dciPayment.dciPlans.length,1);
  assert.equal(dciPayment.dciPlans[0].version,DCI_PAYMENT_VERSION);
  assert.equal(dciPayment.remainingHandPrintings.filter(x=>x===CARRIER).length,2);
  assert.equal(dciPayment.remainingHandPrintings.filter(x=>x===LILLIE).length,1);
  assert.equal(fixedPayment.remainingHandPrintings.filter(x=>x===CARRIER).length,1);
  assert.equal(fixedPayment.remainingHandPrintings.filter(x=>x===LILLIE).length,2);

  const divergence=firstDifference(fixedA1.ledger,dciB.ledger);
  assert.ok(divergence,'The two distinct physical payments must diverge in the root ledger');
  const prefix=commonPrefixLength(fixedA1.ledger,dciB.ledger);
  assert.ok(prefix>=93,'A/B must preserve the shared pre-payment root prefix');

  const summaries={
    fixedA1:summarizeArm(fixedA1,'fixed'),
    dciB:summarizeArm(dciB,'dci'),
    fixedA2:summarizeArm(fixedA2,'fixed')
  };
  const artifact={
    schema:VERSION,
    profile:'retrospective same-deal fixed/DCI/fixed Secret Box payment A/B/A',
    pinnedTwinleaf:fixedA1.result.manifest.observedGitVendorPinExpected,
    registeredTrial:TRIAL,
    originalSourceRank:11,
    sourceSeat:0,candidateSeat:1,
    sameSourceDeal:true,sameFullPhysicalDeal:true,
    fixedA1A2ExactRootLedgerParity:true,
    fixedVsDciCommonRootPrefix:prefix,
    firstDivergence:divergence,
    bridgeVersion:BRIDGE_VERSION,
    dciPaymentVersion:DCI_PAYMENT_VERSION,
    summaries,
    arms:{
      fixedA1:{nativeAttempt:fixedA1.result.nativeAttempt,audit:fixedA1.audit},
      dciB:{nativeAttempt:dciB.result.nativeAttempt,audit:dciB.audit},
      fixedA2:{nativeAttempt:fixedA2.result.nativeAttempt,audit:fixedA2.audit}
    },
    competitiveGamesQualified:0,
    estimatedWinRate:null,
    paperGameQualified:false,
    heuristicWeightsValidated:false
  };
  writeJsonAtomic(ARTIFACT,artifact);
  return {schema:VERSION,artifact:ARTIFACT,trial:TRIAL,
    fixedA1A2ExactRootLedgerParity:true,
    samePhysicalDeal:true,commonRootPrefix:prefix,
    firstDivergence:divergence,
    fixedPayment:summaries.fixedA1.payment,
    dciPayment:summaries.dciB.payment,
    finalPrizes:{
      fixedA1:summaries.fixedA1.finalPrizes,
      dciB:summaries.dciB.finalPrizes,
      fixedA2:summaries.fixedA2.finalPrizes
    },
    nativeStatuses:{
      fixedA1:summaries.fixedA1.nativeStatus,
      dciB:summaries.dciB.nativeStatus,
      fixedA2:summaries.fixedA2.nativeStatus
    },
    competitiveGamesQualified:0,estimatedWinRate:null};
}

if(require.main===module){
  try{
    process.stdout.write(JSON.stringify(run(),null,2)+'\n');
  }catch(error){
    writeJsonAtomic(DIAGNOSTIC,{
      schema:VERSION,status:'UNQUALIFIED_A_B_A_ERROR',
      errorType:error?.constructor?.name??'Error',
      errorMessage:String(error?.message??error).slice(0,800),
      dciPaymentVersion:DCI_PAYMENT_VERSION,
      competitiveGamesQualified:0
    });
    throw error;
  }
}

module.exports={VERSION,sha256Json,ledgerOf,runArm,commonPrefixLength,
  firstDifference,summarizeArm,run};
