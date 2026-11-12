'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {MANIFEST,evidenceBundleSha256,bundleFailures,
  evaluateCompetitiveAdmission}=
  require('../agent45-independent-competitive-admission.cjs');
const {rootDigest}=
  require('../agent45-bilateral-competence-gate.cjs');
const {inspectOfficialAichiClock,aichiClockProtocolSha256}=
  require('../agent45-aichi-clock-receipt.cjs');

const INTAKE_SCHEMA='agent44-first-independent-original-source-case-intake-v2';
const V2_SCHEMA='aichi-outcome-and-competitive-admission-v2';
const RAW_SCHEMA='agent36-live-paper-root-receipts-v2-attached-energy-custody';
const REFERENCE='agent44-first-independent-rank5-newmoon-case-v2.json';
const RELEASE_REFERENCE='agent44-first-release-nine-object-intake-v2.json';
const CASE_ID='agent44-20261109-original-rank5-newmoon-fresh-4410B';
const TRIAL_ID='5:4410:B:new-moon-lockbreaker-v1';
const REGISTRATION_REF='results/aichi-2026/registrations/agent44-first-original-rank5-newmoon-case-20261109.json';

function nativeJsonSha256(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function rootReviewWorklist(raw,roots){
  const receipts=Array.isArray(raw.receipts)?raw.receipts:[];
  const duplicates=new Set();
  const seen=new Set();
  for(const receipt of receipts){
    const ordinal=receipt?.actionOrdinal;
    if(seen.has(ordinal)) duplicates.add(ordinal);
    seen.add(ordinal);
  }
  const rows=roots.map((root,index)=>{
    const ordinal=root?.actionOrdinal??index;
    // Preserve positional parity: never repair a reordered raw tape by
    // searching for a receipt with the same ordinal.
    const receipt=duplicates.has(ordinal)?null:receipts[index]??null;
    const aligned=Boolean(receipt)&&root?.actionOrdinal===index&&
      receipt.actionOrdinal===root.actionOrdinal&&
      receipt.seat===root.playerSlot&&receipt.action===root.action;
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
        REFERENCE+'#/rawNativePhysicalReceipts/receipts/'+index:null,
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
  const schema=raw.schema===RAW_SCHEMA;
  const originalPhysicalCardCount=Array.isArray(raw.originalPhysicalCards)?
    raw.originalPhysicalCards.length:0;
  const ledgerCount=roots.length;
  const receiptCount=receipts.length;
  const acceptedStoreRootCount=raw.acceptedStoreRootCount??null;
  const rootCountMatches=acceptedStoreRootCount===ledgerCount&&
    receiptCount===ledgerCount;
  const exactOrdinalSeatActionParity=ledgerCount>0&&rootCountMatches&&
    rows.every(x=>x.rawReceiptAligned);
  const rootOrdinalsUnique=raw.rootOrdinalsUnique===true&&
    new Set(receipts.map(x=>x?.actionOrdinal)).size===receiptCount;
  const settledPhysicalIdentityClean=raw.settledPhysicalIdentityClean===true;
  const complete=schema&&originalPhysicalCardCount===120&&rootCountMatches&&
    exactOrdinalSeatActionParity&&rootOrdinalsUnique&&
    settledPhysicalIdentityClean;
  return {rows,unmatchedRawReceipts,alignment:{
    schema,originalPhysicalCardCount,ledgerCount,receiptCount,
    acceptedStoreRootCount,rootCountMatches,exactOrdinalSeatActionParity,
    rootOrdinalsUnique,settledPhysicalIdentityClean,
    rejectedDispatchCount:raw.rejectedDispatches?.length??0,complete
  }};
}

/**
 * Convert one immutable V2 native intake into the production V2 review
 * envelope. Raw Store observations remain raw; no independent review is
 * created by this producer.
 * @param {object} original Parsed Agent44 V2 native intake.
 */
function build(original,{clockEvidence=null,clockEvidenceRef=null}={}){
  assert.equal(original?.schema,INTAKE_SCHEMA,
    'Only the prospective Agent44 V2 intake is accepted');
  assert.equal(original?.intake?.schema,INTAKE_SCHEMA);
  assert.equal(original.registration.schema,'agent44-first-independent-review-case-registration-v1');
  assert.equal(original.registration.preRegisteredTrials.length,1);
  assert.equal(original.registration.caseId,CASE_ID);
  assert.equal(original.intake.caseId,CASE_ID);
  assert.equal(original.registrationRef,REGISTRATION_REF);
  assert.equal(original.intake.registrationRef,REGISTRATION_REF);
  assert.equal(original.intake.releaseStatus.competitiveAdmission,false);
  const trialId=original.intake.trial.id;
  assert.equal(trialId,TRIAL_ID);
  assert.equal(original.registration.preRegisteredTrials[0].id,trialId);
  const candidateManifestBinding=original.intake.candidateManifestBinding;
  assert.ok(candidateManifestBinding&&typeof candidateManifestBinding==='object',
    'The corrected contender print-manifest binding is required');
  assert.equal(candidateManifestBinding.schema,'agent44-candidate-print-manifest-binding-v1');
  assert.equal(candidateManifestBinding.status,
    'PRE_EXECUTION_CORRECTIVE_BINDING_NOT_A_NEW_REGISTRATION');
  assert.equal(candidateManifestBinding.registrationCandidateManifestPointer,
    original.registration.candidatePrintedManifest);
  assert.equal(candidateManifestBinding.registrationCandidateManifestPointerMatches,false);
  assert.equal(candidateManifestBinding.boundCandidateJapanesePrintManifest,
    'results/als/new-moon-lockbreak-japanese-print-60.json');
  assert.equal(candidateManifestBinding.candidateEnglishMechanicalProxyManifest,
    'results/als/new-moon-lockbreak-english-proxy-60.json');
  assert.equal(candidateManifestBinding.candidatePrintedCardCount,60);
  assert.equal(candidateManifestBinding.candidateUniqueNameCount,34);
  assert.equal(candidateManifestBinding.nativeCandidateLoaderNameCountParity,true);
  assert.deepEqual(candidateManifestBinding.candidateNameCountParity,{names:34,cards:60});
  assert.equal(candidateManifestBinding.candidateJapanesePrintInventoryCanonicalSha256,
    original.intake.candidatePrintedInventorySha256);
  assert.equal(candidateManifestBinding.candidateOfficialJapaneseDeckCode,null,
    'The source deck code must never be attributed to the Lockbreaker contender');
  assert.equal(original.intake.candidateOfficialJapaneseDeckCode,null);
  assert.equal(candidateManifestBinding.candidateDerivedFromOfficialJapaneseSourceDeckCode,
    original.intake.candidateDerivedFromOfficialJapaneseSourceDeckCode);
  assert.equal(candidateManifestBinding.paperLegalityIndependentlyCertified,false);
  const candidateManifestBindingSha256=nativeJsonSha256(candidateManifestBinding);
  assert.equal(original.intake.candidateManifestBindingSha256,candidateManifestBindingSha256);
  assert.equal(original.candidateManifestBindingSha256,candidateManifestBindingSha256);
  assert.ok(clockEvidence===null||(typeof clockEvidence==='object'&&!Array.isArray(clockEvidence)),
    'External clock receipt input must be one JSON object');
  if(clockEvidence!==null){
    assert.equal(clockEvidence.trialId,trialId,
      'clockEvidence.trialId must match the frozen 4410 trial');
    assert.equal(typeof clockEvidenceRef,'string',
      'clockEvidenceRef must identify the immutable external clock packet');
    assert.ok(clockEvidenceRef.trim().length>0,
      'clockEvidenceRef must be a nonempty external reference');
  }else{
    assert.equal(clockEvidenceRef??null,null,
      'A clock evidence reference cannot be supplied without its receipt object');
  }
  assert.ok(original.intake.runtime?.researchRevisionSha,
    'The exact checked-out research revision must be captured');
  assert.equal(original.intake.runtime?.engineActualCommit,
    original.registration.enginePinnedCommit,
    'The actual checked-out Twinleaf commit must match the frozen registration');
  assert.equal(original.intake.enginePinnedCommit,original.registration.enginePinnedCommit);
  const src=original.nativeDevelopmentRow;
  const roots=Array.isArray(src?.rootActionLedger)?src.rootActionLedger:
    Array.isArray(src?.nativeAbortEvidence?.rootActionLedger)?
      src.nativeAbortEvidence.rootActionLedger:[];
  const raw=original.rawNativePhysicalReceipts;
  assert.equal(raw?.schema,RAW_SCHEMA,
    'The attached-Energy V2 raw receipt packet is required');
  assert.equal(raw.trialId,trialId);
  assert.ok(Array.isArray(raw.receipts),
    'The raw receipt packet must retain its receipt array');
  const {rows:worklist,unmatchedRawReceipts,alignment}=
    rootReviewWorklist(raw,roots);
  const producerAlignment=original.intake.rootReceiptAlignment??null;
  const producerAlignmentMatches=Boolean(producerAlignment)&&
    Object.keys(alignment).every(key=>producerAlignment[key]===alignment[key]);
  const producerRawReceiptCaptureComplete=
    original.intake.native?.rawNativePhysicalReceiptCaptureComplete===true;
  const producerRawReceiptSummary=
    original.intake.native?.rawNativePhysicalReceiptSummary??null;
  const producerRawReceiptSummaryMatches=Boolean(producerRawReceiptSummary)&&
    producerRawReceiptSummary.schema===raw.schema&&
    producerRawReceiptSummary.originalPhysicalCardCount===alignment.originalPhysicalCardCount&&
    producerRawReceiptSummary.acceptedStoreRootCount===alignment.acceptedStoreRootCount&&
    producerRawReceiptSummary.rootOrdinalsUnique===alignment.rootOrdinalsUnique&&
    producerRawReceiptSummary.settledPhysicalIdentityClean===alignment.settledPhysicalIdentityClean&&
    producerRawReceiptSummary.sha256===nativeJsonSha256(raw);
  const producerAcceptedRootLedgerSha256=
    original.intake.native?.acceptedRootLedgerSha256??null;
  const producerAcceptedRootLedgerSha256Matches=
    producerAcceptedRootLedgerSha256===nativeJsonSha256(roots);
  const physicalInventoryComplete=alignment.originalPhysicalCardCount===120;
  const rawNativePhysicalReceiptCaptureComplete=alignment.complete&&
    producerAlignmentMatches&&producerRawReceiptCaptureComplete&&
    producerRawReceiptSummaryMatches&&producerAcceptedRootLedgerSha256Matches;
  const nativeFinished=src.finished===true&&!src.error;
  const zoneTape=original.postStoreZoneTape??{};
  const nativeTraceComplete=nativeFinished&&roots.length>0&&
    zoneTape.postAcceptedRootCount===roots.length&&
    rawNativePhysicalReceiptCaptureComplete;
  const native=original.intake.native??{};
  const recorded=original.intake.nineEvidenceObjects??{};
  const clockFields={
    eventStage:clockEvidence?.eventStage??null,
    clockDisposition:clockEvidence?.clockDisposition??null,
    paperReceiptId:clockEvidence?.paperReceiptId??null,
    clockReceiptId:clockEvidence?.clockReceiptId??null,
    adjudicationProtocolSha:clockEvidence?.adjudicationProtocolSha??null,
    noCallClockPacket:clockEvidence?.noCallClockPacket??null,
    timeCallPacket:clockEvidence?.timeCallPacket??null,
    extensionLedgerPacket:clockEvidence?.extensionLedgerPacket??null
  };
  const clockAssessment=clockEvidence?
    inspectOfficialAichiClock(clockEvidence):null;
  const clockProtocolSha256=aichiClockProtocolSha256();
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
      independentlyVerifiedJapanesePrintingIdentity:false,
      exactJapanesePrintingsIndependentlyVerified:
        original.intake.exactJapaneseSourcePrintingsIndependentlyVerified===true
    },
    'contender-printed-60':{
      manifest:candidateManifestBinding.boundCandidateJapanesePrintManifest,
      manifestSha256:candidateManifestBinding.candidateJapanesePrintManifestSha256,
      candidateId:'new-moon-lockbreaker-v1',
      published60Sha256:
        original.intake.candidatePrintedInventorySha256??null,
      canonicalPrintIdCountSha256:
        candidateManifestBinding.candidateJapanesePrintInventoryCanonicalSha256,
      englishProxyManifest:candidateManifestBinding.candidateEnglishMechanicalProxyManifest,
      englishProxyManifestSha256:
        candidateManifestBinding.candidateEnglishMechanicalProxyManifestSha256,
      englishProxyIdCountSha256:candidateManifestBinding.candidateEnglishProxyIdCountSha256,
      nativeCandidateLoader:candidateManifestBinding.nativeCandidateLoader,
      nativeCandidateId:candidateManifestBinding.nativeCandidateId,
      nativeCandidateLoaderNameCountParity:
        candidateManifestBinding.nativeCandidateLoaderNameCountParity,
      nativeCandidateLoaderNameAliases:candidateManifestBinding.nativeCandidateLoaderNameAliases,
      registrationCandidateManifestPointer:
        candidateManifestBinding.registrationCandidateManifestPointer,
      registrationCandidateManifestPointerMatches:
        candidateManifestBinding.registrationCandidateManifestPointerMatches,
      candidateOfficialJapaneseDeckCode:
        candidateManifestBinding.candidateOfficialJapaneseDeckCode,
      candidateDerivedFromOfficialJapaneseSourceDeckCode:
        candidateManifestBinding.candidateDerivedFromOfficialJapaneseSourceDeckCode,
      proposedPrintManifestStatus:candidateManifestBinding.proposedPrintManifestStatus,
      paperLegalityIndependentlyCertified:
        candidateManifestBinding.paperLegalityIndependentlyCertified,
      candidateManifestBinding,candidateManifestBindingSha256,
      exactJapanesePrintingsIndependentlyVerified:
        original.intake.exactJapaneseCandidatePrintingsIndependentlyVerified===true,
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
      producerAcceptedRootLedgerSha256,
      producerAcceptedRootLedgerSha256Matches,
      producerRootReceiptAlignment:producerAlignment,
      producerRootReceiptAlignmentMatches:producerAlignmentMatches,
      producerRawReceiptSummary,
      producerRawReceiptCaptureComplete,
      producerRawReceiptSummaryMatches,
      runtime:original.intake.runtime??original.runtime??null,
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
      nativeRawStateFallbackQuarantineAudit:
        native.nativeRawStateFallbackQuarantineAudit??src.nativeRawStateFallbackQuarantineAudit??null,
      ownerPublicAcknowledgementAudit:
        native.ownerPublicAcknowledgementAudit??src.ownerPublicAcknowledgementAudit??null,
      nativeSupporterQuota:native.nativeSupporterQuota??src.nativeSupporterQuotaQualified??null,
      sourceM4AuditCount:native.sourceM4AuditCount??src.specialRedCardPaperPreselectionAudits?.length??0,
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
      clockEvidence,
      clockEvidenceRef,
      clockAssessment,
      clockProtocolSha256,
      mappedTrialClockFields:clockFields,
      independentOfficialClockReview:'pending'
    },
    'policy-and-counterplay':{
      originalSourceResponseWindow:
        recorded.sourceReplyAndNextOriginalTurn?.replyWindow??[],
      nativeSourceAttackCount:native.sourceAttacks??0,
      nativeCandidateAttackCount:native.candidateAttacks??0,
      nativeActionEvidence:{
        nativePromptChoices:src.nativePromptChoices??null,
        policyAudit:src.policyAudit??null,
        sourceAudit:src.sourceAudit??null,
        supporterModalEvidence:src.supporterModalEvidence??null,
        ownerSupporterOpportunityAudit:src.ownerSupporterOpportunityAudit??null,
        ownerCompressorOpportunityAudit:src.ownerCompressorOpportunityAudit??null,
        candidateRepliesAfterSourceAttacks:src.candidateRepliesAfterSourceAttacks??null,
        candidateAttackSettlement:src.candidateAttackSettlement??null,
        sourceAttackSettlement:src.sourceAttackSettlement??null,
        nativeAttackModalityLedger:src.nativeAttackModalityLedger??null,
        nativeAttackPhysicalTape:src.nativeAttackPhysicalTape??null,
        firstSettledPublicAttack:src.firstSettledPublicAttack??null,
        finalBoard:src.finalBoard??null,
        finalPrizes:src.finalPrizes??null,
        decisionTrace:src.decisionTrace??null
      },
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
      registrationRef:REGISTRATION_REF,
      originalSourceSeat:original.intake.sourceSeat,
      candidateSeat:original.intake.candidateSeat,
      runtime:original.intake.runtime??original.runtime??null,
      actualFirstPlayerSeat:native.actualFirstSeat??null,
      sourcePhysicalDealSha256:src.sourceDealFingerprint??null,
      fullPhysicalDealSha256:src.fullPhysicalDealFingerprint??null,
      vendorCommitSha:original.intake.enginePinnedCommit??null,
      researchRevisionSha:
        original.intake.runtime?.researchRevisionSha??
        original.runtime?.researchRevisionSha??
        original.intake.researchRevisionSha??src.researchRevisionSha??null,
      hookRevisionSha:
        original.intake.runtime?.hookRevisionSha??
        original.runtime?.hookRevisionSha??
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
      producerRootReceiptAlignment:producerAlignment,
      producerRootReceiptAlignmentMatches:producerAlignmentMatches,
      producerRawReceiptSummary,
      producerRawReceiptCaptureComplete,
      producerRawReceiptSummaryMatches,
      producerAcceptedRootLedgerSha256,
      producerAcceptedRootLedgerSha256Matches,
      rawPhysicalInventoryComplete:physicalInventoryComplete,
      independentFullPaperRulesAudit:false,
      hiddenInformationAudit:false,
      responseOpportunityAudit:null,
      eventStage:clockFields.eventStage,
      clockDisposition:clockFields.clockDisposition,
      clockReceiptId:clockFields.clockReceiptId,
      paperReceiptId:clockFields.paperReceiptId,
      adjudicationProtocolSha:clockFields.adjudicationProtocolSha,
      noCallClockPacket:clockFields.noCallClockPacket,
      timeCallPacket:clockFields.timeCallPacket,
      extensionLedgerPacket:clockFields.extensionLedgerPacket
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
      producerAlignmentMatches,
      producerRawReceiptCaptureComplete,
      producerRawReceiptSummaryMatches,
      producerAcceptedRootLedgerSha256Matches,
      settledPhysicalIdentityClean:raw.settledPhysicalIdentityClean===true,
      pendingIndependentRootPaperReviews:roots.length,
      gameOutcomeAdmissionReady:admission.gameOutcomeAdmissionReady,
      competitivePolicyCompetenceReady:
        admission.competitivePolicyCompetenceReady,
      competitiveAdmission:false,
      firstMissingEvidence:admission.failures[0]??null
    },
    nativeDevelopmentRow:src,
    postStoreZoneTape:zoneTape,
    clockEvidence,
    clockEvidenceRef,
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
  const clockEvidenceRef=process.argv[4]??null;
  const clockEvidence=clockEvidenceRef?
    JSON.parse(fs.readFileSync(clockEvidenceRef,'utf8')):null;
  const result=build(raw,{clockEvidence,clockEvidenceRef});
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
    clockEvidenceSupplied:Boolean(clockEvidenceRef),
    blockers:result.independentAdmissionGate.failures
  }));
}
module.exports={INTAKE_SCHEMA,V2_SCHEMA,RAW_SCHEMA,REFERENCE,CASE_ID,TRIAL_ID,
  REGISTRATION_REF,nativeJsonSha256,rootReviewWorklist,build,save};
