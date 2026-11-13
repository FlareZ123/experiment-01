'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {sha256:policyHash}=
  require('../../simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs');
const {build,INTAKE_SCHEMA,V2_SCHEMA,RAW_SCHEMA,REFERENCE,REGISTRATION_REF,
  CASE_ID,TRIAL_ID}=
  require('../../simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs');
const TRIAL='5:4410:B:new-moon-lockbreaker-v1';
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
    candidatePrintedManifest:'results/als/new-moon-perfection-source-60.json',
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
  const candidateManifestBinding={
    schema:'agent44-candidate-print-manifest-binding-v1',
    status:'PRE_EXECUTION_CORRECTIVE_BINDING_NOT_A_NEW_REGISTRATION',
    registrationCandidateManifestPointer:'results/als/new-moon-perfection-source-60.json',
    registrationCandidateManifestPointerMatches:false,
    boundCandidateJapanesePrintManifest:'results/als/new-moon-lockbreak-japanese-print-60.json',
    candidateJapanesePrintManifestSha256:'candidate-japanese-manifest-sha',
    candidateJapanesePrintInventoryCanonicalSha256:'13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047',
    candidateEnglishMechanicalProxyManifest:'results/als/new-moon-lockbreak-english-proxy-60.json',
    candidateEnglishMechanicalProxyManifestSha256:'candidate-english-manifest-sha',
    candidateEnglishProxyIdCountSha256:'candidate-english-inventory',
    candidatePrintedCardCount:60,candidateUniqueNameCount:34,
    candidateNameCountParity:{names:34,cards:60},
    nativeCandidateLoader:'scripts/aichi-new-moon-candidate.cjs',
    nativeCandidateId:'new-moon-lockbreaker-v1',
    nativeCandidateLoaderNameCountParity:true,nativeCandidateLoaderNameAliases:[
      {nativeName:'Psychic Energy',printedName:'Basic Psychic Energy',count:3}
    ],
    candidateOfficialJapaneseDeckCode:null,
    candidateDerivedFromOfficialJapaneseSourceDeckCode:'GxxDYx-a4rD4W-a8xYxc',
    proposedPrintManifestStatus:'PROPOSED_JAPANESE_PRINT_MANIFEST_NOT_OFFICIAL_REGISTRATION',
    paperLegalityIndependentlyCertified:false
  };
  const candidateManifestBindingSha256=hash(candidateManifestBinding);
  const paperCologneNativePlayAudit={
    accepted:1,bySeat:{'0':1,'1':0},episodes:1,authenticatedRestarts:0,
    duplicateAcceptedBySeatTurn:[],acceptedOncePerSeatTurn:true,
    scope:'Accepted native Store PlayCardAction roots only, segmented by authenticated native game epochs. Missing rejected proposals and unqualified game rules remain.'
  };
  const paperCologneReviewGate={
    schema:'agent44-paper-cologne-accepted-root-review-gate-v3',
    cardRuleSource:'official-japanese-canceling-cologne-card-specific-qa',
    cardRuleSourceUrl:'https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E3%82%B3%E3%83%AD%E3%83%B3&regulation_sidebar_form=all',
    disposition:'eligible-pending-independent-paper-review',
    auditPresent:true,auditShapeValid:true,acceptedOncePerSeatTurn:true,
    multipleAcceptedBySeatTurn:[],
    cardSpecificOncePerTurnConformance:'pass',
    hookOptInEnabled:false,paperRuleReviewBlocked:false,
    paperItemLegalityReviewStatus:'pending-per-use-target-and-effect-review',
    requiresTargetAndEffectReview:true,independentPaperReviewRequired:true,
    paperLegalityCertified:false,rawCaptureRetainedRegardlessOfGate:true
  };
  const policyManifest={
    schema:'agent36-effective-bilateral-policy-manifest-v1',
    complete:false,samePolicy:false,
    reason:'capture-only; activated-hook and policy-entrypoint closures are not independently attested',
    hookRevisionSha:null,environmentSha256:'runtime-environment-sha',
    activationAudit:{agent41PaperSupporterQuota:{optIn:true}},
    policyVersion:'agent8-v6',candidatePolicy:'new-moon-lockbreaker-v1',
    sourceSeat:0,candidateSeat:1,activationAudit:{},
    requestedOptions:{},sourceOnlyFeatureMap:{},sourceScopedOptions:[],
    sourceScopedFeatureMap:{},policySha256BySeat:[null,null],perSeat:[],
    unknownSourceOnlyFlags:[],configurationRoots:[],
    actorRuntimeClosureDigest:null,mewDceRootApplicationReceipt:null,
    paperCologneNativePlayAudit
  };
  const policyManifestSha256=policyHash(policyManifest);
  const policyProvenanceBase={
    schema:'agent26-4410-capture-only-policy-provenance-v2',
    status:'PARTIAL_CAPTURE_ONLY',trialId:TRIAL_ID,sourceSeat:0,candidateSeat:1,
    candidateManifestPath:'results/als/new-moon-lockbreak-japanese-print-60.json',
    candidateManifestBlobSha256:'candidate-manifest-blob-sha',
    policyProfilePath:'simulation/evaluation/agent41-frozen-bilateral-development-v2.json',
    policyProfileBlobSha256:'policy-profile-blob-sha',
    enginePin:registration.enginePinnedCommit,
    runnerExecutionConfig:{nativeRootActionLimit:300,callbackBindings:{
      onRootStoreCreated:'fullPaperObserver.onRootStoreCreated'}},
    runtimeEvidenceReceipts:{agent48CologneNativePlayAudit:paperCologneNativePlayAudit},
    runtimeLoadedCodeManifest:{schema:'agent26-runtime-loaded-code-manifest-v1',sha256:'runtime-code-sha'},
    runtimeLoadedCodeSnapshotSha256:'runtime-code-sha',
    configuredRunnerOptions:{},effectiveSeatConfiguration:[],
    effectiveSeatConfigSha256BySeat:[],actorRuntimeClosure:null,
    actorRuntimeClosureError:null,actorOnlyDecisionCoverage:null,
    mewDceRootApplicationReceipt:null,paperCologneNativePlayAudit,
    activatedHookManifest:{schema:'agent26-4410-activated-hook-manifest-v1',
      status:'PARTIAL_ACTIVATION_RECEIPTS_ONLY',complete:false,
      observedActivationReceipts:{agent41PaperSupporterQuota:{optIn:true}},unresolvedDependencyScopes:[],sha256:null},
    policyEntryManifest:{schema:'agent26-4410-policy-entry-manifest-v1',
      status:'INCOMPLETE_RUNTIME_SNAPSHOT_ONLY',complete:false,
      candidateRootInventory:[],runtimeLoadedCodeSnapshotSha256:'runtime-code-sha',
      unresolvedDependencySites:[],unresolvedDependencyInventoryComplete:false,
      unresolvedDependencyScopes:[],sha256:null},
    policyManifest,policyManifestSha256,hookRevisionSha:null,
    policySha256BySeat:[null,null],samePolicy:false,
    competitivePolicyCompetenceReady:false,
    reason:'A runtime snapshot and observed actor receipt are descriptive evidence only.'
  };
  const policyProvenanceSha256=policyHash(policyProvenanceBase);
  const policyProvenance={...policyProvenanceBase,policyProvenanceSha256};
  const intake={
    schema:INTAKE_SCHEMA,caseId:CASE_ID,registrationRef:REGISTRATION_REF,
    originalRank:5,sourceSeat:0,candidateSeat:1,runtime,
    policyProvenance,policyProvenanceSha256,policyManifestSha256,
    hookRevisionSha:null,policySha256BySeat:[null,null],
    fixedRegisteredSourceAndCandidateSixties:true,
    exactJapaneseSourcePrintingsIndependentlyVerified:false,
    exactJapaneseCandidatePrintingsIndependentlyVerified:false,
    rootReceiptAlignment:alignment,
    candidateOfficialJapaneseDeckCode:null,
    candidateDerivedFromOfficialJapaneseSourceDeckCode:'GxxDYx-a4rD4W-a8xYxc',
    candidateManifestBinding,candidateManifestBindingSha256,
    sourcePrintedSha256:'source-printed-60',
    sourcePrintedInventorySha256:'source-inventory',
    candidatePrintedInventorySha256:'13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047',
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
      sourceM4AuditCount:0,paperCologneNativePlayAudit,paperCologneReviewGate
    },
    nineEvidenceObjects:{
      officialClockAndNoCall:{available:false,reason:'No independent clock packet'},
      sourceReplyAndNextOriginalTurn:{replyWindow:[]}
    },
    releaseStatus:{competitiveAdmission:false,
      firstMissingEvidence:'verified-exact-Japanese-candidate-physical-printings'}
  };
  const row={
    trial:{id:TRIAL_ID},candidateSeat:1,finished:true,winner:0,endReason:'natural-prize-win',
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
    paperCologneNativePlayAudit,
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
    candidateManifestBinding,candidateManifestBindingSha256,
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
  assert.deepEqual(result.bundle.trial.rawNativePhysicalReceipts,original.rawNativePhysicalReceipts);
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
  assert.equal(result.bundle.trial.actionCertificates.length,0);
  assert.equal(result.bundle.trial.responseOpportunityAudit,null);
  assert.equal(result.bundle.trial.eventStage,null);
  assert.equal(result.bundle.trial.clockDisposition,null);
  assert.equal(result.bundle.trial.clockReceiptId,null);
  const contender=result.releaseNineObjects['contender-printed-60'];
  assert.equal(contender.manifest,'results/als/new-moon-lockbreak-japanese-print-60.json');
  assert.equal(contender.candidateOfficialJapaneseDeckCode,null);
  assert.equal(original.registration.candidateOfficialJapaneseDeckCode,undefined);
  assert.equal(contender.canonicalPrintIdCountSha256,
    '13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047');
  assert.deepEqual(contender.nativeCandidateLoaderNameAliases,[
    {nativeName:'Psychic Energy',printedName:'Basic Psychic Energy',count:3}
  ]);
  assert.equal(contender.candidateDerivedFromOfficialJapaneseSourceDeckCode,
    'GxxDYx-a4rD4W-a8xYxc');
  assert.equal(contender.registrationCandidateManifestPointer,
    'results/als/new-moon-perfection-source-60.json');
  assert.equal(contender.registrationCandidateManifestPointerMatches,false);
  assert.deepEqual(contender.candidateManifestBinding,original.intake.candidateManifestBinding);
  assert.equal(contender.candidateManifestBindingSha256,
    original.intake.candidateManifestBindingSha256);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockEvidence,null);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockEvidenceRef,null);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockAssessment,null);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockProtocolSha256,aichiClockProtocolSha256());
  assert.equal(result.releaseStatus.rawNativePhysicalReceiptCaptureComplete,true);
  assert.equal(result.releaseStatus.producerAlignmentMatches,true);
  assert.equal(result.releaseStatus.producerRawReceiptCaptureComplete,true);
  assert.equal(result.releaseStatus.producerRawReceiptSummaryMatches,true);
  assert.equal(result.releaseStatus.producerAcceptedRootLedgerSha256Matches,true);
  assert.equal(result.bundle.trial.rootPaperReviewWorklist.length,2);
  const first=result.bundle.trial.rootPaperReviewWorklist[0];
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
  const paperRules=result.releaseNineObjects['paper-rules'];
  assert.equal(paperRules.cancelingCologneRuleGate.disposition,
    original.intake.native.paperCologneReviewGate.disposition);
  assert.equal(paperRules.cancelingCologneRuleGate.paperLegalityCertified,false);
  const strategy=result.releaseNineObjects['policy-and-counterplay'];
  assert.deepEqual(strategy.nativeActionEvidence.paperCologneNativePlayAudit,
    original.nativeDevelopmentRow.paperCologneNativePlayAudit);
  assert.deepEqual(strategy.nativeActionEvidence.paperCologneReviewGate,
    original.intake.native.paperCologneReviewGate);
  assert.deepEqual(strategy.policyProvenance,original.intake.policyProvenance);
  assert.equal(strategy.policyProvenanceDigestVerified,true);
  assert.equal(strategy.policyManifestDigestVerified,true);
  assert.equal(strategy.policyProvenanceSha256,original.intake.policyProvenanceSha256);
  assert.equal(strategy.policyManifestSha256,original.intake.policyManifestSha256);
  assert.equal(strategy.policyProvenanceStatus,'PARTIAL_CAPTURE_ONLY');
  assert.equal(strategy.policyManifestComplete,false);
  assert.equal(strategy.hookRevisionSha,null);
  assert.deepEqual(strategy.policySha256BySeat,[null,null]);
  assert.equal(strategy.samePolicy,false);
  assert.equal(strategy.competitivePolicyCompetenceReady,false);
  assert.equal(result.bundle.trial.hookRevisionSha,null);
  assert.deepEqual(result.bundle.trial.policySha256BySeat,[null,null]);
  assert.equal(result.releaseStatus.policyProvenanceDigestVerified,true);
  assert.equal(result.releaseStatus.policyManifestDigestVerified,true);
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

test('capture-only policy provenance digests are canonical and never promote competitive hashes',()=>{
  const original=fixture();
  const result=build(original);
  const strategy=result.releaseNineObjects['policy-and-counterplay'];
  assert.equal(strategy.policyProvenanceDigestVerified,true);
  assert.equal(strategy.policyManifestDigestVerified,true);
  assert.equal(strategy.policyProvenance.policyManifest.complete,false);
  assert.equal(strategy.policyProvenance.policyManifest.samePolicy,false);
  assert.equal(strategy.policyProvenance.policyManifest.hookRevisionSha,null);
  assert.deepEqual(strategy.policyProvenance.policyManifest.policySha256BySeat,[null,null]);
  assert.equal(strategy.policyProvenance.activatedHookManifest.complete,false);
  assert.equal(strategy.policyProvenance.policyEntryManifest.complete,false);
  assert.equal(strategy.competitivePolicyCompetenceReady,false);
});

test('native development row identity must remain bound to the frozen intake',()=>{
  const wrongTrial=fixture();
  wrongTrial.nativeDevelopmentRow.trial.id='transplanted-trial';
  assert.throws(()=>build(wrongTrial),
    /Native development row trial must match intake trial/);

  const wrongCandidateSeat=fixture();
  wrongCandidateSeat.nativeDevelopmentRow.candidateSeat=0;
  assert.throws(()=>build(wrongCandidateSeat),
    /Native development row candidateSeat must match intake candidate seat/);

  const wrongSourceSeat=fixture();
  wrongSourceSeat.nativeDevelopmentRow.sourceSeat=1;
  assert.throws(()=>build(wrongSourceSeat),
    /Native development row sourceSeat must match intake source seat/);
});

test('intake physical seats cannot be transplanted away from the frozen candidate slot',()=>{
  const original=fixture();
  original.intake.sourceSeat=1;
  original.intake.candidateSeat=0;
  original.nativeDevelopmentRow.candidateSeat=0;
  original.intake.policyProvenance.sourceSeat=1;
  original.intake.policyProvenance.candidateSeat=0;
  const payload={...original.intake.policyProvenance};
  delete payload.policyProvenanceSha256;
  const digest=policyHash(payload);
  original.intake.policyProvenance.policyProvenanceSha256=digest;
  original.intake.policyProvenanceSha256=digest;
  assert.throws(()=>build(original),
    /Intake candidateSeat must match the frozen registration candidateSlot/);
});

test('capture-only policy provenance cannot be transplanted across intake identity even after re-signing',()=>{
  const cases=[
    ['trialId',value=>{value.trialId='transplanted-trial';},
      /Policy provenance trialId must bind the exact intake trial/],
    ['sourceSeat',value=>{value.sourceSeat=1;},
      /Policy provenance sourceSeat must bind the exact intake source seat/],
    ['candidateSeat',value=>{value.candidateSeat=0;},
      /Policy provenance candidateSeat must bind the exact intake candidate seat/],
    ['enginePin',value=>{value.enginePin='e'.repeat(40);},
      /Policy provenance enginePin must bind the frozen registration engine pin/]
  ];
  for(const [field,mutate,expected] of cases){
    const original=fixture();
    mutate(original.intake.policyProvenance);
    const payload={...original.intake.policyProvenance};
    delete payload.policyProvenanceSha256;
    const digest=policyHash(payload);
    original.intake.policyProvenance.policyProvenanceSha256=digest;
    original.intake.policyProvenanceSha256=digest;
    assert.throws(()=>build(original),expected,field);
  }
});

test('mutated capture-only policy provenance fails its canonical self-digest',()=>{
  const original=fixture();
  original.intake.policyProvenance.reason='tampered after digest';
  assert.throws(()=>build(original),/capture-only policy provenance must match its canonical self-digest/);
});

test('mutated policy manifest fails its canonical nested digest',()=>{
  const original=fixture();
  original.intake.policyProvenance.policyManifestSha256='tampered';
  original.intake.policyManifestSha256='tampered';
  assert.throws(()=>build(original),/nested policy manifest must match its canonical digest/);
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
  assert.equal(result.bundle.trial.rootPaperReviewWorklist[0].rawReceiptAligned,false);
  assert.equal(result.bundle.trial.rootPaperReviewWorklist[0].rawSeat,1);
  assert.equal(result.bundle.trial.unmatchedRawReceipts.length,1);
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
  assert.equal(result.bundle.trial.unmatchedRawReceipts.length,2);
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
  assert.equal(result.releaseNineObjects['clock-continuity'].clockAssessment.status,
    'INSUFFICIENT_NO_CALL_EVIDENCE');
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
  assert.throws(()=>build(original,{clockEvidence:null,
    clockEvidenceRef:'orphan.json'}),/cannot be supplied without its receipt object/);
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
  assert.equal(result.releaseNineObjects['clock-continuity'].clockAssessment.shapeComplete,false);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockAssessment.status,
    'MISSING_OR_MISMATCHED_PAPER_PROTOCOL');
  assert.deepEqual(result.bundle.trial.noCallClockPacket,clockEvidence.noCallClockPacket);
  assert.deepEqual(result.releaseNineObjects['clock-continuity'].clockEvidence,clockEvidence);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockEvidenceRef,
    clockEvidenceRef);
  assert.equal(result.releaseNineObjects['clock-continuity'].clockProtocolSha256,
    aichiClockProtocolSha256());
  assert.equal(result.releaseNineObjects['clock-continuity'].clockAssessment.status,
    'MISSING_OR_MISMATCHED_PAPER_PROTOCOL');
  assert.equal(result.bundle.trial.fullRootPaperReceipts.length,0);
  assert.equal(result.independentAdmissionGate.competitiveAdmission,false);
});
