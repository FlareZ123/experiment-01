'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {build,INTAKE_SCHEMA,V2_SCHEMA,RAW_SCHEMA,REFERENCE,REGISTRATION_REF,
  CASE_ID,TRIAL_ID}=
  require('../../simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs');
const {rootDigest}=
  require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {aichiClockProtocolSha256}=
  require('../../simulation/evaluation/agent45-aichi-clock-receipt.cjs');
const {BUNDLE_SCHEMA,MANIFEST,evidenceBundleSha256}=
  require('../../simulation/evaluation/agent45-independent-competitive-admission.cjs');

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

function fixture(){
  const roots=[
    {actionOrdinal:0,turnBefore:1,playerSlot:0,action:'AttackAction',
      card:'Tapu Lele-GX',attack:'Energy Drive'},
    {actionOrdinal:1,turnBefore:2,playerSlot:1,action:'PassTurnAction'}
  ];
  const receipts=roots.map((root,i)=>({
    trialId:TRIAL_ID,actionOrdinal:root.actionOrdinal,seat:root.playerSlot,
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
    schema:RAW_SCHEMA,trialId:TRIAL_ID,
    originalPhysicalCards:Array.from({length:120},(_,i)=>({
      id:(i<60?'0:':'1:')+(i%60),
      originalSeat:i<60?0:1,printing:'Physical card '+i
    })),
    acceptedStoreRootCount:2,rootOrdinalsUnique:true,
    receipts,rejectedDispatches:[],settledPhysicalIdentityClean:true,
    paperPaymentReviewed:false,clockReviewed:false,
    competitiveGameQualified:false
  };
  const registration={
    schema:'agent44-first-independent-review-case-registration-v1',
    status:'FROZEN_BEFORE_NATIVE_EXECUTION',
    caseId:CASE_ID,
    enginePinnedCommit:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    candidateOfficialJapaneseDeckCode:'JP-NEW-MOON-CODE',
    preRegisteredTrials:[{rank:5,repeat:4410,candidateSlot:'B',
      seed:3861605836,candidateId:'new-moon-lockbreaker-v1',id:TRIAL_ID}]
  };
  const runtime={
    researchRevisionSha:'research-revision-4410',
    workflowRunId:'4410-run-id',workflowRunAttempt:'1',
    engineActualCommit:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
  };
  const alignment={
    schema:true,originalPhysicalCardCount:120,ledgerCount:2,receiptCount:2,
    acceptedStoreRootCount:2,rootCountMatches:true,
    exactOrdinalSeatActionParity:true,rootOrdinalsUnique:true,
    settledPhysicalIdentityClean:true,rejectedDispatchCount:0,complete:true
  };
  const intake={
    schema:INTAKE_SCHEMA,caseId:CASE_ID,registrationRef:REGISTRATION_REF,
    originalRank:5,sourceSeat:0,candidateSeat:1,runtime,
    fixedRegisteredSourceAndCandidateSixties:true,
    exactJapaneseSourcePrintingsIndependentlyVerified:false,
    exactJapaneseCandidatePrintingsIndependentlyVerified:false,
    rootReceiptAlignment:alignment,
    candidateOfficialJapaneseDeckCode:'JP-NEW-MOON-CODE',
    sourcePrintedSha256:'source-printed-60',
    sourcePrintedInventorySha256:'source-inventory',
    candidatePrintedInventorySha256:'candidate-inventory',
    originalFrozenRegistrationSha256:'registration-hash',
    trial:{id:TRIAL_ID},enginePinnedCommit:registration.enginePinnedCommit,
    native:{
      completed:true,status:'native-terminal',nativeWinner:0,sourceNativeWin:true,
      physicalPrizesAfter:[0,6],actualFirstSeat:0,
      sourceAttacks:1,candidateAttacks:0,sourceFirstAttackOrdinal:0,
      candidateResponseWindowAfterSourceAttack:[],
      acceptedNativeRootCount:2,acceptedRootLedgerSha256:hash(roots),
      sourceDealSha256:'source-deal',fullDealSha256:'full-deal',
      physicalZoneQualification:{physicalIntegrityQualified:true},
      rawNativePhysicalReceiptCaptureComplete:true,
      promptQuarantineClean:true,ownerAcknowledgementsComplete:true,
      nativeRawStateFallbackQuarantineAudit:{rawStateFallbackCalls:0,
        originalNativeDecoderExecuted:false,ownerInformationSafeWholePolicyCertified:false},
      ownerPublicAcknowledgementAudit:{confirmPromptDefaultEquivalent:true,
        completePolicyOwnerSafe:false,beneficialAbilityUseQualified:false},
      rawNativePhysicalReceiptSummary:{
        schema:RAW_SCHEMA,originalPhysicalCardCount:120,
        acceptedStoreRootCount:2,rootOrdinalsUnique:true,
        settledPhysicalIdentityClean:true,sha256:hash(raw)
      },
      targetOrdinalLinked:true,nativeSupporterQuota:{qualified:false},
      sourceM4AuditCount:0
    },
    nineEvidenceObjects:{
      officialClockAndNoCall:{available:false,reason:'No independent clock packet'},
      sourceReplyAndNextOriginalTurn:{replyWindow:[]}
    },
    releaseStatus:{competitiveAdmission:false,
      firstMissingEvidence:'verified-exact-Japanese-candidate-physical-printings'}
  };
  const row={
    trial:{id:TRIAL_ID},finished:true,winner:0,endReason:'natural-prize-win',
    finalPrizes:[0,6],error:null,rootCapReached:false,
    sourceDealFingerprint:'source-deal',fullPhysicalDealFingerprint:'full-deal',
    sourceDeckFingerprint:'source-deck',
    rootActionLedger:roots,rootActionLedgerSha256:hash(roots),
    physicalZoneQualification:{physicalIntegrityQualified:true},
    nativeAcceptedTargetSidecar:{rootOrdinalLinked:true},
    paperPromptPortfolioAudit:{},nativeQuickBallOwnerTransactions:[],
    nativePromptChoices:[{seat:0,selected:'Tapu Lele-GX',sourceZone:'deck'}],
    policyAudit:{ownerInformationOnly:true,policyVersion:'agent8-v6'},
    sourceAudit:{sourceControlledEvolution:true},
    supporterModalEvidence:{modal:'Supporter',ownerSeat:0},
    ownerSupporterOpportunityAudit:{complete:false},
    ownerCompressorOpportunityAudit:{complete:false},
    candidateRepliesAfterSourceAttacks:[{seat:1,reply:'retreat'}],
    candidateAttackSettlement:{damage:0,prizesTaken:0},
    sourceAttackSettlement:{damage:30,prizesTaken:0},
    nativeAttackModalityLedger:[{ordinal:0,attack:'Energy Drive'}],
    nativeAttackPhysicalTape:[{ordinal:0,before:'board-before',after:'board-after'}],
    firstSettledPublicAttack:{ordinal:0,seat:0,attack:'Energy Drive'},
    finalBoard:{active:[0,1],prizes:[0,6]},
    decisionTrace:[{seat:0,choice:'attack'}],
    nativeSupporterQuotaQualified:{qualified:false},
    specialRedCardPaperPreselectionAudits:[]
  };
  const zoneTape={
    initialStablePhysicalDeal:{rootOrdinal:0,sha256:'opening-zones'},
    postAcceptedRootCount:2,postAcceptedRoots:[],
    allRootPhysicalZonesSha256:'all-root-zones'
  };
  return {
    schema:INTAKE_SCHEMA,registration,registrationRef:REGISTRATION_REF,
    registrationSha256:'registration-hash',runtime,intake,
    nativeDevelopmentRow:row,postStoreZoneTape:zoneTape,
    rawNativePhysicalReceipts:raw
  };
}

test('live builder consumes frozen 4410 V2 intake, signs strategy evidence, and selects production V2 admission',()=>{
  const original=fixture();
  const result=build(original);
  assert.equal(result.schema,'agent44-first-release-nine-object-bundle-intake-v2');
  assert.equal(result.caseId,CASE_ID);
  assert.equal(result.originalSourceArtifact,REFERENCE);
  assert.equal(result.bundle.schema,BUNDLE_SCHEMA);
  assert.equal(result.bundle.admissionContract,V2_SCHEMA);
  assert.equal(result.bundle.trial.trialId,TRIAL_ID);
  assert.equal(result.bundle.trial.registrationRef,REGISTRATION_REF);
  assert.equal(result.bundle.trial.researchRevisionSha,'research-revision-4410');
  assert.equal(result.bundle.trial.runtime.workflowRunId,'4410-run-id');
  assert.deepEqual(result.bundle.rawNativePhysicalReceipts,original.rawNativePhysicalReceipts);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
  assert.equal(result.bundle.trial.actionCertificates.length,0);
  assert.equal(result.bundle.trial.responseOpportunityAudit,null);
  assert.equal(result.bundle.trial.eventStage,null);
  assert.equal(result.bundle.trial.clockDisposition,null);
  assert.equal(result.bundle.trial.clockReceiptId,null);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockEvidence,null);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockEvidenceRef,null);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockAssessment,null);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockProtocolSha256,aichiClockProtocolSha256());
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,true);
  assert.equal(result.releaseStatus.producerAlignmentMatches,true);
  assert.equal(result.releaseStatus.producerRawReceiptCaptureComplete,true);
  assert.equal(result.releaseStatus.producerRawReceiptSummaryMatches,true);
  assert.equal(result.releaseStatus.producerAcceptedRootLedgerSha256Matches,true);
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
  assert.ok(first.rawReceiptRef.startsWith(REFERENCE+'#/rawNativePhysicalReceipts/receipts/'));
  assert.ok(first.physicalCardInventoryRef.startsWith(REFERENCE+'#/rawNativePhysicalReceipts/originalPhysicalCards'));
  const strategy=result.releaseNineObjects['policy-and-counterplay'];
  assert.deepEqual(strategy.nativeActionEvidence.nativePromptChoices,original.nativeDevelopmentRow.nativePromptChoices);
  assert.deepEqual(strategy.nativeActionEvidence.policyAudit,original.nativeDevelopmentRow.policyAudit);
  assert.deepEqual(strategy.nativeActionEvidence.sourceAudit,original.nativeDevelopmentRow.sourceAudit);
  assert.deepEqual(strategy.nativeActionEvidence.supporterModalEvidence,original.nativeDevelopmentRow.supporterModalEvidence);
  assert.deepEqual(strategy.nativeActionEvidence.ownerSupporterOpportunityAudit,original.nativeDevelopmentRow.ownerSupporterOpportunityAudit);
  assert.deepEqual(strategy.nativeActionEvidence.ownerCompressorOpportunityAudit,original.nativeDevelopmentRow.ownerCompressorOpportunityAudit);
  assert.deepEqual(strategy.nativeActionEvidence.candidateRepliesAfterSourceAttacks,original.nativeDevelopmentRow.candidateRepliesAfterSourceAttacks);
  assert.deepEqual(strategy.nativeActionEvidence.candidateAttackSettlement,original.nativeDevelopmentRow.candidateAttackSettlement);
  assert.deepEqual(strategy.nativeActionEvidence.sourceAttackSettlement,original.nativeDevelopmentRow.sourceAttackSettlement);
  assert.deepEqual(strategy.nativeActionEvidence.nativeAttackModalityLedger,original.nativeDevelopmentRow.nativeAttackModalityLedger);
  assert.deepEqual(strategy.nativeActionEvidence.nativeAttackPhysicalTape,original.nativeDevelopmentRow.nativeAttackPhysicalTape);
  assert.deepEqual(strategy.nativeActionEvidence.firstSettledPublicAttack,original.nativeDevelopmentRow.firstSettledPublicAttack);
  assert.deepEqual(strategy.nativeActionEvidence.finalBoard,original.nativeDevelopmentRow.finalBoard);
  assert.deepEqual(strategy.nativeActionEvidence.finalPrizes,original.nativeDevelopmentRow.finalPrizes);
  assert.deepEqual(Object.keys(result.releaseNineObjects).sort(),MANIFEST.slice().sort());
  assert.equal(result.bundleSha256,evidenceBundleSha256(result.bundle));
  assert.equal(result.independentAdmissionGate.schema,V2_SCHEMA);
  assert.equal(result.independentAdmissionGate.fixtureOnly,false);
  assert.equal(result.independentAdmissionGate.gameOutcomeAdmissionReady,false);
  assert.equal(result.independentAdmissionGate.competitivePolicyCompetenceReady,false);
  assert.equal(result.independentAdmissionGate.completeRootPaperReceiptsVerified,false);
  assert.equal(result.independentAdmissionGate.competitiveAdmission,false);
  assert.ok(result.independentAdmissionGate.failures.includes('missing-complete-root-paper-receipts'));
  assert.ok(result.independentAdmissionGate.failures.includes('independent-paper-or-clock-review-missing'));
});

test('V1 intake cannot silently enter the V2 release builder',()=>{
  const original=fixture();
  original.schema='agent44-first-independent-original-source-case-intake-v1';
  assert.throws(()=>build(original),/Only the prospective Agent44 V2 intake is accepted/);
});

test('raw receipt misbinding remains visible and blocks capture completeness',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.receipts[0].seat=1;
  const result=build(original);
  assert.equal(result.bundle.trial.rawReceiptAlignment.exactOrdinalSeatActionParity,false);
  assert.equal(result.bundle.rootPaperReviewWorklist[0].rawReceiptAligned,false);
  assert.equal(result.bundle.rootPaperReviewWorklist[0].rawSeat,1);
  assert.equal(result.bundle.unmatchedRawReceipts.length,1);
  assert.equal(result.releaseStatus.producerRawReceiptSummaryMatches,false);
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,false);
});

test('accepted Store root count mismatch remains an explicit capture blocker',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.acceptedStoreRootCount=1;
  const result=build(original);
  assert.equal(result.bundle.trial.rawReceiptAlignment.rootCountMatches,false);
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,false);
});

test('settled physical identity conservation is required for raw capture completeness',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.settledPhysicalIdentityClean=false;
  const result=build(original);
  assert.equal(result.bundle.trial.rawReceiptAlignment.settledPhysicalIdentityClean,false);
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,false);
});

test('root ordinal uniqueness is required for raw capture completeness',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.rootOrdinalsUnique=false;
  const result=build(original);
  assert.equal(result.bundle.trial.rawReceiptAlignment.rootOrdinalsUnique,false);
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,false);
});

test('raw receipt order is not repaired by searching ordinals',()=>{
  const original=fixture();
  original.rawNativePhysicalReceipts.receipts.reverse();
  const result=build(original);
  assert.equal(result.bundle.trial.rawReceiptAlignment.exactOrdinalSeatActionParity,false);
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,false);
  assert.equal(result.bundle.unmatchedRawReceipts.length,2);
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
});

test('external clockEvidence is trial-bound, referenced, and passed through the shared v3 scorer',()=>{
  const original=fixture();
  const clockEvidence={
    trialId:TRIAL,eventStage:'open-swiss',
    clockDisposition:'no-official-call',paperReceiptId:'paper-terminal-4410',
    clockReceiptId:null,adjudicationProtocolSha:aichiClockProtocolSha256(),
    noCallClockPacket:{stage:'open-swiss',paperTerminalEvidenceRef:'paper-terminal-4410'},
    timeCallPacket:null,extensionLedgerPacket:null
  };
  const clockEvidenceRef='review/clock-receipt-4410.json';
  const result=build(original,{clockEvidence,clockEvidenceRef});
  assert.equal(result.bundle.trial.eventStage,'open-swiss');
  assert.equal(result.bundle.trial.clockDisposition,'no-official-call');
  assert.equal(result.bundle.trial.paperReceiptId,'paper-terminal-4410');
  assert.equal(result.bundle.trial.clockReceiptId,null);
  assert.equal(result.bundle.trial.adjudicationProtocolSha,aichiClockProtocolSha256());
  assert.deepEqual(result.bundle.trial.noCallClockPacket,clockEvidence.noCallClockPacket);
  assert.deepEqual(result.releaseNineObjects['clock-continuity'].clockEvidence,clockEvidence);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockEvidenceRef,clockEvidenceRef);
  assert.ok(result.releaseNineObjects['clock-continuity'].clockAssessment);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
  assert.equal(result.independentAdmissionGate.competitiveAdmission,false);
});

test('clockEvidence from another or unidentified trial is rejected',()=>{
  const original=fixture();
  assert.throws(()=>build(original,{clockEvidence:{trialId:'5:4411:B:new-moon-lockbreaker-v1'},
    clockEvidenceRef:'review/clock.json'}),/clockEvidence.trialId/);
  assert.throws(()=>build(original,{clockEvidence:{eventStage:'open-swiss'},
    clockEvidenceRef:'review/clock.json'}),/clockEvidence.trialId/);
  assert.throws(()=>build(original,{clockEvidence:{trialId:TRIAL},
    clockEvidenceRef:null}),/clockEvidenceRef/);
});

test('external Agent27 clock evidence maps exact fields without creating reviewer evidence',()=>{
  const original=fixture();
  const clockEvidence={
    trialId:TRIAL,eventStage:'open-swiss',clockDisposition:'no-official-call',
    paperReceiptId:'paper-terminal-4410',clockReceiptId:null,
    adjudicationProtocolSha:'protocol-sha',
    noCallClockPacket:{stage:'open-swiss',
      paperTerminalEvidenceRef:'paper-terminal-4410'},
    timeCallPacket:null,extensionLedgerPacket:null
  };
  const clockEvidenceRef='review/clock-evidence-4410.json';
  const result=build(original,{clockEvidence,clockEvidenceRef});
  assert.equal(result.bundle.trial.eventStage,'open-swiss');
  assert.equal(result.bundle.trial.clockDisposition,'no-official-call');
  assert.equal(result.bundle.trial.paperReceiptId,'paper-terminal-4410');
  assert.equal(result.bundle.trial.clockReceiptId,null);
  assert.equal(result.bundle.trial.adjudicationProtocolSha,'protocol-sha');
  assert.deepEqual(result.bundle.trial.noCallClockPacket,clockEvidence.noCallClockPacket);
  assert.deepEqual(result.releaseNineObjects['clock-continuity'].clockEvidence,clockEvidence);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockEvidenceRef,
    clockEvidenceRef);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockProtocolSha256,
    aichiClockProtocolSha256());
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
  assert.equal(result.independentAdmissionGate.competitiveAdmission,false);
});
