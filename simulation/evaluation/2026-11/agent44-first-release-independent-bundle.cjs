'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {MANIFEST,evidenceBundleSha256,bundleFailures,
  evaluateCompetitiveAdmission}=
  require('../agent45-independent-competitive-admission.cjs');
const {rootDigest}=
  require('../agent45-bilateral-competence-gate.cjs');

const INTAKE_SCHEMA='agent44-first-independent-original-source-case-intake-v2';
const V2_SCHEMA='aichi-outcome-and-competitive-admission-v2';
const RAW_SCHEMA='agent36-live-paper-root-receipts-v2-attached-energy-custody';
const REFERENCE='agent44-first-independent-rank5-newmoon-case-v2.json';
const RELEASE_REFERENCE='agent44-first-release-nine-object-intake-v2.json';

function rootReviewWorklist(raw,roots){
  const receipts=Array.isArray(raw.receipts)?raw.receipts:[];
  const byOrdinal=new Map();
  const duplicates=new Set();
  for(const receipt of receipts){
    const ordinal=receipt?.actionOrdinal;
    if(byOrdinal.has(ordinal)) duplicates.add(ordinal);
    else byOrdinal.set(ordinal,receipt);
  }
  const rows=roots.map((root,index)=>{
    const ordinal=root?.actionOrdinal??index;
    const receipt=duplicates.has(ordinal)?null:byOrdinal.get(ordinal)??null;
    const aligned=Boolean(receipt)&&receipt.actionOrdinal===ordinal&&
      receipt.seat===root.playerSlot&&receipt.action===root.action&&
      ordinal===index;
    return {
      rootOrdinal:ordinal,
      actorSeat:root?.playerSlot??null,
      action:root?.action??null,
      turnBefore:root?.turnBefore??null,
      turnAfter:receipt?.turnAfter??null,
      rawSeat:receipt?.seat??null,
      rawAction:receipt?.action??null,
      rawReceiptPresent:Boolean(receipt),
      rawReceiptAligned:aligned,
      rawReceiptRef:receipt?
        REFERENCE+'#/rawNativePhysicalReceipts/receipts/'+receipts.indexOf(receipt):null,
      rawReceiptSha256:receipt?evidenceBundleSha256(receipt):null,
      movement:receipt?.movement??[],
      beforePositions:receipt?.beforePositions??null,
      afterPositions:receipt?.afterPositions??null,
      beforePrompts:receipt?.beforePrompts??[],
      afterPrompts:receipt?.afterPrompts??[],
      beforePhysicalSha256:receipt?.beforePhysicalSha256??null,
      afterPhysicalSha256:receipt?.afterPhysicalSha256??null,
      activePlayerBefore:receipt?.activePlayerBefore??null,
      activePlayerAfter:receipt?.activePlayerAfter??null,
      phaseBefore:receipt?.phaseBefore??null,
      phaseAfter:receipt?.phaseAfter??null,
      anomalies:receipt?.anomalies??null,
      physicalCardInventoryRef:
        REFERENCE+'#/rawNativePhysicalReceipts/originalPhysicalCards',
      reviewChecklist:{
        paperLegality:'pending-independent-review',
        payment:'pending-independent-review',
        targetsAndTransitions:'pending-independent-review',
        ownerInformation:'pending-independent-review',
        physicalCustody:'pending-independent-review'
      }
    };
  });
  const matched=new Set(rows.filter(x=>x.rawReceiptAligned)
    .map(x=>x.rawReceiptRef));
  const unmatchedRawReceipts=receipts.flatMap((receipt,index)=>{
    const ref=REFERENCE+'#/rawNativePhysicalReceipts/receipts/'+index;
    return matched.has(ref)?[]:[{
      ref,rootOrdinal:receipt?.actionOrdinal??null,
      seat:receipt?.seat??null,action:receipt?.action??null,
      sha256:evidenceBundleSha256(receipt),
      reason:duplicates.has(receipt?.actionOrdinal)?
        'duplicate-raw-receipt-ordinal':'no-unique-aligned-root'
    }];
  });
  const uniqueOrdinals=raw.rootOrdinalsUnique===true&&
    new Set(receipts.map(x=>x?.actionOrdinal)).size===receipts.length;
  const acceptedStoreRootCountMatches=raw.acceptedStoreRootCount===receipts.length;
  const complete=roots.length===receipts.length&&acceptedStoreRootCountMatches&&
    uniqueOrdinals&&rows.every(x=>x.rawReceiptAligned)&&
    unmatchedRawReceipts.length===0;
  return {rows,unmatchedRawReceipts,alignment:{
    nativeRootCount:roots.length,rawReceiptCount:receipts.length,
    acceptedStoreRootCount:raw.acceptedStoreRootCount??null,
    acceptedStoreRootCountMatches,uniqueRawOrdinals:uniqueOrdinals,alignedRootCount:
      rows.filter(x=>x.rawReceiptAligned).length,
    complete
  }};
}

/**
 * Convert one immutable V2 native intake into the production V2 review
 * envelope. Raw Store observations remain raw; no independent review is
 * created by this producer.
 * @param {object} original Parsed Agent44 V2 native intake.
 */
function build(original){
  assert.equal(original?.schema,INTAKE_SCHEMA,
    'Only the prospective Agent44 V2 intake is accepted');
  assert.equal(original?.intake?.schema,INTAKE_SCHEMA);
  assert.equal(original.registration.preRegisteredTrials.length,1);
  assert.equal(original.intake.releaseStatus.competitiveAdmission,false);
  const trialId=original.intake.trial.id;
  assert.equal(original.registration.preRegisteredTrials[0].id,trialId);
  const src=original.nativeDevelopmentRow;
  const roots=Array.isArray(src?.rootActionLedger)?src.rootActionLedger:[];
  const raw=original.rawNativePhysicalReceipts;
  assert.equal(raw?.schema,RAW_SCHEMA,
    'The attached-Energy V2 raw receipt packet is required');
  assert.equal(raw.trialId,trialId);
  assert.ok(Array.isArray(raw.receipts),
    'The raw receipt packet must retain its receipt array');
  const {rows:worklist,unmatchedRawReceipts,alignment}=
    rootReviewWorklist(raw,roots);
  const physicalInventoryComplete=Array.isArray(raw.originalPhysicalCards)&&
    raw.originalPhysicalCards.length===120;
  const rawNativePhysicalReceiptCaptureComplete=
    physicalInventoryComplete&&alignment.complete;
  const nativeFinished=src.finished===true&&!src.error;
  const zoneTape=original.postStoreZoneTape??{};
  const nativeTraceComplete=nativeFinished&&roots.length>0&&
    zoneTape.postAcceptedRootCount===roots.length&&
    rawNativePhysicalReceiptCaptureComplete;
  const native=original.intake.native??{};
  const recorded=original.intake.nineEvidenceObjects??{};
  const rawSha256=evidenceBundleSha256(raw);
  const worklistSha256=evidenceBundleSha256(worklist);
  const rootSha256=rootDigest(roots);
  const content={
    registration:original.registration,
    'original-printed-60':{
      manifest:'results/aichi-2026/full-decklists.json',
      authenticatedSourceRank:5,
      original60Sha256:original.intake.sourcePrintedSha256??null,
      nativeSourceManifestSha256:
        original.intake.sourcePrintedInventorySha256??null,
      independentlyVerifiedJapanesePrintingIdentity:false
    },
    'contender-printed-60':{
      manifest:'results/als/new-moon-perfection-source-60.json',
      candidateId:'new-moon-lockbreaker-v1',
      published60Sha256:
        original.intake.candidatePrintedInventorySha256??null,
      independentlyVerifiedJapanesePrintingIdentity:false
    },
    'full-physical-deal':{
      nativeDigest:src.fullPhysicalDealFingerprint??null,
      firstStableAfterSetup:zoneTape.initialStablePhysicalDeal??null,
      postStoreZoneTape:zoneTape,
      observedPhysicalStoreRootCount:zoneTape.postAcceptedRootCount??0,
      physicalIntegrity:src.physicalZoneQualification??null,
      originalPhysicalCardInventorySha256:
        Array.isArray(raw.originalPhysicalCards)?
          evidenceBundleSha256(raw.originalPhysicalCards):null,
      originalPhysicalCardCount:
        Array.isArray(raw.originalPhysicalCards)?
          raw.originalPhysicalCards.length:0
    },
    'accepted-native-root-ledger':{
      registeredTrial:src.trial??null,
      nativeRootActionLedger:roots,
      nativeRootActionLedgerSha256:rootSha256,
      nativeEndReason:src.endReason??null,
      nativeFinished,
      nativeWinner:nativeFinished?src.winner??null:null,
      rawReceiptAlignment:alignment,
      rawNativePhysicalReceiptsSha256:rawSha256
    },
    'owner-payment-and-targets':{
      nativeTargetSidecar:src.nativeAcceptedTargetSidecar??null,
      ownerPromptSidecar:src.paperPromptPortfolioAudit??null,
      sourceQuickBallPayment:src.nativeQuickBallOwnerTransactions??null,
      rawNativePhysicalReceipts:raw,
      rawNativePhysicalReceiptsSha256:rawSha256,
      rootPaperReviewWorklist:worklist,
      rootPaperReviewWorklistSha256:worklistSha256,
      unmatchedRawReceipts,
      independentPaperPaymentReviewComplete:false
    },
    'paper-rules':{
      review:'pending-external-independent-complete-action-rule-review',
      nativeGameRulesDoNotCertifyPaperLegality:true,
      independentReviewerSignature:null,
      producerCreatedFullRootPaperReceipts:false
    },
    'clock-continuity':{
      captured:recorded.officialClockAndNoCall??null,
      independentOfficialClockReview:'pending',
      noCallClockPacket:null,
      timeCallPacket:null,
      extensionLedgerPacket:null
    },
    'policy-and-counterplay':{
      originalSourceResponseWindow:
        recorded.sourceReplyAndNextOriginalTurn?.replyWindow??[],
      nativeSourceAttackCount:native.sourceAttacks??0,
      nativeCandidateAttackCount:native.candidateAttacks??0,
      responseOpportunityAudit:null,
      independentlyReviewed:false,
      policyChallengeEvidenceRef:null,
      ownerCounterplayReviewEvidenceRef:null
    }
  };
  assert.deepEqual(Object.keys(content).sort(),MANIFEST.slice().sort());
  const manifest=MANIFEST.map(kind=>({
    kind,ref:RELEASE_REFERENCE+'#/releaseNineObjects/'+kind,
    sha256:evidenceBundleSha256(content[kind])
  }));
  const bundle={
    // Keep the signed nine-object envelope schema stable. This explicit
    // discriminator selects the separately versioned V2 admission contract.
    schema:'aichi-complete-game-bundle-v1',
    admissionContract:V2_SCHEMA,
    producerId:'Agent45',
    trialId,
    trial:{
      trialId,
      registrationRef:
        'results/aichi-2026/registrations/agent44-first-original-rank5-newmoon-case-20261109.json',
      originalSourceSeat:original.intake.sourceSeat,
      candidateSeat:original.intake.candidateSeat,
      actualFirstPlayerSeat:native.actualFirstSeat??null,
      sourcePhysicalDealSha256:src.sourceDealFingerprint??null,
      fullPhysicalDealSha256:src.fullPhysicalDealFingerprint??null,
      vendorCommitSha:original.intake.enginePinnedCommit??null,
      researchRevisionSha:
        original.intake.researchRevisionSha??src.researchRevisionSha??null,
      hookRevisionSha:
        original.intake.hookRevisionSha??src.hookRevisionSha??null,
      originalPrinted60Sha256:original.intake.sourcePrintedSha256??null,
      candidatePrinted60Sha256:
        original.intake.candidatePrintedInventorySha256??null,
      policySha256BySeat:
        original.intake.policySha256BySeat??src.policySha256BySeat??[null,null],
      nativeFinished,
      nativeWinner:nativeFinished?src.winner??null:null,
      nativeEndReason:src.endReason??null,
      finalPrizes:src.finalPrizes??null,
      engineError:Boolean(src.error),
      rootCapReached:src.rootCapReached===true,
      rootActionLedger:roots,
      rootActionLedgerSha256:rootSha256,
      actionCertificates:[],
      // Raw observations are never copied into this independently reviewed
      // field. A reviewer must supply one signed assessment per root.
      fullRootPaperReceipts:[],
      rootPaperReviewWorklist:worklist,
      unmatchedRawReceipts,
      rawNativePhysicalReceipts:raw,
      rawNativePhysicalReceiptsSha256:rawSha256,
      rawReceiptAlignment:alignment,
      rawPhysicalInventoryComplete:physicalInventoryComplete,
      independentFullPaperRulesAudit:false,
      hiddenInformationAudit:false,
      responseOpportunityAudit:null,
      eventStage:null,
      clockDisposition:null,
      clockReceiptId:null,
      paperReceiptId:null,
      adjudicationProtocolSha:null,
      noCallClockPacket:null,
      timeCallPacket:null,
      extensionLedgerPacket:null
    },
    evidenceManifest:manifest
  };
  assert.deepEqual(bundleFailures(bundle),[]);
  const admission=evaluateCompetitiveAdmission(bundle,[]);
  assert.equal(admission.schema,V2_SCHEMA,
    'The live builder must exercise the production V2 admission route');
  assert.equal(admission.fixtureOnly,false);
  assert.equal(admission.competitiveAdmission,false,
    'No raw native capture may self-admit as a paper game');
  assert.equal(admission.gameOutcomeAdmissionReady,false);
  assert.equal(admission.competitivePolicyCompetenceReady,false);
  assert.equal(admission.completeRootPaperReceiptsVerified,false);
  assert.ok(admission.failures.includes('missing-complete-root-paper-receipts'));
  assert.ok(admission.failures.includes('independent-paper-or-clock-review-missing'));
  for(const entry of manifest){
    assert.equal(entry.ref,RELEASE_REFERENCE+'#/releaseNineObjects/'+entry.kind);
    assert.equal(entry.sha256,evidenceBundleSha256(content[entry.kind]));
  }
  return {
    schema:'agent44-first-release-nine-object-bundle-intake-v2',
    admissionContract:V2_SCHEMA,
    caseId:original.intake.caseId,
    sourceIntakeSchema:original.schema,
    originalSourceArtifact:REFERENCE,
    originalRegistrationSha256:original.registrationSha256,
    bundle,bundleSha256:evidenceBundleSha256(bundle),
    releaseNineObjects:content,
    rawNativePhysicalReceipts:raw,
    rootPaperReviewWorklist:worklist,
    unmatchedRawReceipts,
    signedReviewerPackets:[],
    independentAdmissionGate:admission,
    captureStatus:original.intake.releaseStatus,
    releaseStatus:{
      rawNativePhysicalReceiptCaptureComplete,
      nativeTraceComplete,
      physicalInventoryComplete,
      rawReceiptAlignmentComplete:alignment.complete,
      pendingIndependentRootPaperReviews:roots.length,
      gameOutcomeAdmissionReady:admission.gameOutcomeAdmissionReady,
      competitivePolicyCompetenceReady:
        admission.competitivePolicyCompetenceReady,
      competitiveAdmission:false,
      firstMissingEvidence:admission.failures[0]??null
    },
    nativeDevelopmentRow:src,
    postStoreZoneTape:zoneTape,
    nativeGameRetainedAsDevelopmentOnly:true,
    noReviewEvidenceSynthesized:true,
    builderExecutionNeverRunsNativeGame:true
  };
}

/** Atomic, exclusively locked small output. */
function save(output,data){
  fs.mkdirSync(path.dirname(output),{recursive:true});
  const lock=output+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=output+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const fp=fs.openSync(temp,'r');
    try{fs.fsyncSync(fp);}finally{fs.closeSync(fp);}
    fs.renameSync(temp,output);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  assert.ok(process.argv[2],'Supply previously archived Agent44 V2 case JSON');
  const raw=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const result=build(raw);
  const output=process.argv[3]??path.resolve(
    'artifacts/agent44-first-release-nine-object-intake-v2.json');
  save(output,result);
  console.log('AGENT44_FIRST_RELEASE_V2_BUNDLE',JSON.stringify({
    caseId:result.caseId,
    bundleSha256:result.bundleSha256,
    nativeFinished:result.nativeDevelopmentRow.finished===true,
    rootCount:result.bundle.trial.rootActionLedger.length,
    rawPhysicalInventoryComplete:result.releaseStatus.physicalInventoryComplete,
    rawReceiptAlignmentComplete:result.releaseStatus.rawReceiptAlignmentComplete,
    pendingRootReviews:result.releaseStatus.pendingIndependentRootPaperReviews,
    outcomeReady:result.independentAdmissionGate.gameOutcomeAdmissionReady,
    policyReady:result.independentAdmissionGate.competitivePolicyCompetenceReady,
    competitiveAdmission:result.independentAdmissionGate.competitiveAdmission,
    blockers:result.independentAdmissionGate.failures
  })));
}
module.exports={INTAKE_SCHEMA,V2_SCHEMA,RAW_SCHEMA,rootReviewWorklist,build,save};
