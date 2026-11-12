'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {build,INTAKE_SCHEMA,V2_SCHEMA,RAW_SCHEMA}=
  require('../../simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs');
const {rootDigest}=
  require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {BUNDLE_SCHEMA,MANIFEST,evidenceBundleSha256}=
  require('../../simulation/evaluation/agent45-independent-competitive-admission.cjs');

const TRIAL='5:4411:B:new-moon-lockbreaker-v1';
const CASE='agent44-20261112-original-rank5-newmoon-livepaper-v2-2163320309';

function fixture(){
  const roots=[
    {actionOrdinal:0,turnBefore:1,playerSlot:0,action:'AttackAction',
      card:'Tapu Lele-GX',attack:'Energy Drive'},
    {actionOrdinal:1,turnBefore:2,playerSlot:1,action:'PassTurnAction'}
  ];
  const receipts=roots.map((root,i)=>({
    trialId:TRIAL,actionOrdinal:root.actionOrdinal,seat:root.playerSlot,
    turnBefore:root.turnBefore,turnAfter:root.turnBefore,
    action:root.action,selected:null,declaredCard:root.card??null,
    beforePrompts:[{id:i,type:'ChooseCardsPrompt',message:'Choose cards'}],
    afterPrompts:[],beforePhysicalSha256:'before-'+i,
    afterPhysicalSha256:'after-'+i,
    movement:[{id:'0:0',printing:'Tapu Lele-GX',
      from:'s0.deck:0',to:'s0.active:0'}],
    beforePositions:{'0:0':'s0.deck:0'},
    afterPositions:{'0:0':'s0.active:0'},
    activePlayerBefore:root.playerSlot,activePlayerAfter:root.playerSlot,
    phaseBefore:2,phaseAfter:2,
    anomalies:{beforeDuplicates:[],afterDuplicates:[],
      afterUnregistered:[],afterPromptCustody:[],
      missingOriginalPhysicalIds:[]}
  }));
  const raw={
    schema:RAW_SCHEMA,trialId:TRIAL,
    originalPhysicalCards:Array.from({length:120},(_,i)=>({
      id:(i<60?'0:':'1:')+(i%60),
      originalSeat:i<60?0:1,printing:'Physical card '+i
    })),
    acceptedStoreRootCount:2,rootOrdinalsUnique:true,
    receipts,rejectedDispatches:[],settledPhysicalIdentityClean:true,
    paperPaymentReviewed:false,clockReviewed:false,
    competitiveGameQualified:false
  };
  const intake={
    schema:INTAKE_SCHEMA,caseId:CASE,
    originalRank:5,sourceSeat:0,candidateSeat:1,
    runtime:{researchRevisionSha:'research-revision-4411'},
    rootReceiptAlignment:{schema:true,originalPhysicalCardCount:120,
      ledgerCount:2,receiptCount:2,acceptedStoreRootCount:2,
      rootCountMatches:true,exactOrdinalSeatActionParity:true,
      rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
      rejectedDispatchCount:0,complete:true},
    trial:{id:TRIAL},enginePinnedCommit:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePrintedSha256:'source-printed-60',
    sourcePrintedInventorySha256:'source-inventory',
    candidatePrintedInventorySha256:'candidate-inventory',
    native:{actualFirstSeat:0,sourceAttacks:1,candidateAttacks:0},
    nineEvidenceObjects:{
      officialClockAndNoCall:{available:false,reason:'No clock packet'},
      sourceReplyAndNextOriginalTurn:{replyWindow:[]}
    },
    releaseStatus:{competitiveAdmission:false,
      firstMissingEvidence:'verified-exact-Japanese-candidate-physical-printings'}
  };
  const row={
    trial:{id:TRIAL},finished:true,winner:0,endReason:'natural-prize-win',
    finalPrizes:[0,6],error:null,rootCapReached:false,
    sourceDealFingerprint:'source-deal',fullPhysicalDealFingerprint:'full-deal',
    sourceDeckFingerprint:'source-deck',
    rootActionLedger:roots,rootActionLedgerSha256:rootDigest(roots),
    physicalZoneQualification:{physicalIntegrityQualified:true},
    nativeAcceptedTargetSidecar:{rootOrdinalLinked:true},
    paperPromptPortfolioAudit:{},nativeQuickBallOwnerTransactions:[]
  };
  const zoneTape={
    initialStablePhysicalDeal:{rootOrdinal:0,sha256:'opening-zones'},
    postAcceptedRootCount:2,postAcceptedRoots:[],
    allRootPhysicalZonesSha256:'all-root-zones'
  };
  const registration={
    schema:'agent44-first-independent-review-case-registration-v2',
    caseId:intake.caseId,
    preRegisteredTrials:[{id:TRIAL}]
  };
  return {schema:INTAKE_SCHEMA,registration,registrationSha256:'registration-hash',
    intake,nativeDevelopmentRow:row,postStoreZoneTape:zoneTape,
    rawNativePhysicalReceipts:raw};
}

test('live Agent44 builder consumes V2 raw receipts and selects production V2 admission',()=>{
  const original=fixture();
  const result=build(original);
  assert.equal(result.schema,'agent44-first-release-nine-object-bundle-intake-v2');
  assert.equal(result.caseId,CASE);
  assert.equal(result.originalSourceArtifact,'agent44-first-independent-rank5-newmoon-live-paper-v2.json');
  assert.equal(result.bundle.schema,BUNDLE_SCHEMA);
  assert.equal(result.bundle.admissionContract,V2_SCHEMA);
  assert.deepEqual(result.bundle.rawNativePhysicalReceipts,original.rawNativePhysicalReceipts);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
  assert.equal(result.bundle.trial.actionCertificates.length,0);
  assert.equal(result.bundle.trial.responseOpportunityAudit,null);
  assert.equal(result.bundle.trial.registrationRef,
    'results/aichi-2026/registrations/agent44-rank5-newmoon-live-paper-v2-20261112.json');
  assert.equal(result.bundle.trial.researchRevisionSha,'research-revision-4411');
  assert.equal(result.bundle.trial.runtime.researchRevisionSha,'research-revision-4411');
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,true);
  assert.equal(result.releaseStatus.producerAlignmentMatches,true);
  assert.equal(result.bundle.rootPaperReviewWorklist.length,2);
  const first=result.bundle.rootPaperReviewWorklist[0];
  assert.equal(first.rootOrdinal,0);
  assert.equal(first.actorSeat,0);
  assert.equal(first.action,'AttackAction');
  assert.deepEqual(first.movement,original.rawNativePhysicalReceipts.receipts[0].movement);
  assert.deepEqual(first.beforePositions,original.rawNativePhysicalReceipts.receipts[0].beforePositions);
  assert.deepEqual(first.afterPositions,original.rawNativePhysicalReceipts.receipts[0].afterPositions);
  assert.deepEqual(first.beforePrompts,original.rawNativePhysicalReceipts.receipts[0].beforePrompts);
  assert.equal(first.reviewChecklist.paperLegality,'pending-independent-review');
  assert.equal(first.reviewChecklist.payment,'pending-independent-review');
  assert.ok(first.rawReceiptRef.startsWith(
    'agent44-first-independent-rank5-newmoon-live-paper-v2.json#/rawNativePhysicalReceipts/receipts/'));
  assert.ok(first.physicalCardInventoryRef.startsWith(
    'agent44-first-independent-rank5-newmoon-live-paper-v2.json#/rawNativePhysicalReceipts/originalPhysicalCards'));
  assert.equal(Object.hasOwn(first,'independentReviewerId'),false);
  assert.deepEqual(Object.keys(result.releaseNineObjects).sort(),MANIFEST.slice().sort());
  assert.equal(result.bundleSha256,evidenceBundleSha256(result.bundle));
  assert.equal(result.independentAdmissionGate.schema,V2_SCHEMA);
  assert.equal(result.independentAdmissionGate.fixtureOnly,false);
  assert.equal(result.independentAdmissionGate.gameOutcomeAdmissionReady,false);
  assert.equal(result.independentAdmissionGate.competitivePolicyCompetenceReady,false);
  assert.equal(result.independentAdmissionGate.completeRootPaperReceiptsVerified,false);
  assert.equal(result.independentAdmissionGate.competitiveAdmission,false);
  assert.ok(result.independentAdmissionGate.failures.includes(
    'missing-complete-root-paper-receipts'));
  assert.ok(result.independentAdmissionGate.failures.includes(
    'independent-paper-or-clock-review-missing'));
});

test('V1 intake cannot silently enter the V2 release builder',()=>{
  const original=fixture();
  original.schema='agent44-first-independent-original-source-case-intake-v1';
  assert.throws(()=>build(original),/Only the prospective Agent44 V2 intake is accepted/);
});

test('raw receipt anomalies and missing alignments remain visible instead of being repaired',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.receipts[0].seat=1;
  const result=build(original);
  assert.equal(result.releaseStatus.rawReceiptAlignmentComplete,false);
  assert.equal(result.bundle.rootPaperReviewWorklist[0].rawReceiptAligned,false);
  assert.equal(result.bundle.rootPaperReviewWorklist[0].rawSeat,1);
  assert.equal(result.bundle.trial.producerRootReceiptAlignmentMatches,false);
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,false);
  assert.equal(result.bundle.unmatchedRawReceipts.length,1);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
});

test('accepted Store root count mismatch remains an explicit capture blocker',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.acceptedStoreRootCount=1;
  const result=build(original);
  assert.equal(result.bundle.trial.rawReceiptAlignment.acceptedStoreRootCountMatches,false);
  assert.equal(result.releaseStatus.rawReceiptAlignmentComplete,false);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
});

test('settled physical identity conservation is required for raw capture completeness',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.settledPhysicalIdentityClean=false;
  const result=build(original);
  assert.equal(result.bundle.trial.rawReceiptAlignment.settledPhysicalIdentityClean,false);
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,false);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
});

test('root ordinal uniqueness is required for raw capture completeness',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.rootOrdinalsUnique=false;
  const result=build(original);
  assert.equal(result.bundle.trial.rawReceiptAlignment.rootOrdinalsUnique,false);
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,false);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
});

test('missing 120-card inventory and incomplete receipt coverage remain explicit blockers',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.originalPhysicalCards=[];
  original.rawNativePhysicalReceipts.receipts.pop();
  original.rawNativePhysicalReceipts.acceptedStoreRootCount=1;
  const result=build(original);
  assert.equal(result.releaseStatus.physicalInventoryComplete,false);
  assert.equal(result.releaseStatus.rawReceiptAlignmentComplete,false);
  assert.equal(result.releaseStatus.competitiveAdmission,false);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
});
