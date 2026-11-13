'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync,sign} = require('node:crypto');
const {
  BUNDLE_SCHEMA,REVIEW_SCHEMA,MANIFEST,evidenceBundleSha256,reviewSigningBytes
} = require('../../simulation/evaluation/agent45-independent-competitive-admission.cjs');
const {rootDigest} =
  require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {aichiClockProtocolSha256,inspectOfficialAichiClock} =
  require('../../simulation/evaluation/agent45-aichi-clock-receipt.cjs');
const {
  SCHEMA,UNTIMED,EVENT,CLOCK_NOT_APPLICABLE,
  inspectAdmissionV3,evaluateCompetitiveAdmissionV3,
  policyAttestationSigningBytes,inspectPolicyPanelConsistency,
  inspectTimingPreregistration,untimedPaperAttestationValid
} = require('../../simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs');
const {validateOpponentPolicyFieldBundle} =
  require('../../scripts/agent12-balanced-field-ledger-validator.cjs');
const authorizedReviewers =
  require('../../simulation/evaluation/agent45-authorized-reviewers.json');

const trialId = 'v3-preregistered-untimed-game-001';
const sha = n => String(n).repeat(64);

function makeBundle({mode=UNTIMED,outcome='win',samePolicy=true,clockPath='none',eventStage='open-top32'}={}) {
  const roots=[{actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction'}];
  const registration={
    schema:'aichi-game-level-preregistration-v1',
    registrationRef:'results/aichi-2026/registrations/v3-game-001.json',
    trialId,mode,registeredBeforeDealGeneration:true,
    candidateFormat:mode===UNTIMED?'Expanded':'Japanese Extra',
    gameRuleset:mode===UNTIMED?'Expanded':'Japanese Extra',
    opponentSourceEventFormat:'Japanese Extra',
    expandedLegalityAsOf:mode===UNTIMED?'2026-11-13':null,
    eventDate:mode===EVENT?'2026-05-10':null,
    formatReviewStatus:'independently-reviewed',
    registeredAt:'2026-11-12T01:00:00.000Z',
    dealGeneratedAt:'2026-11-12T01:01:00.000Z',
    timingProtocol:{
      schema:'aichi-game-timing-protocol-preregistration-v1',
      mode,declaredBeforeDealGeneration:true,
      tournamentTimerApplies:mode===EVENT,
      officialEndCallApplies:mode===EVENT,
      eventStageAdjudicationApplies:mode===EVENT,
      eventStage:mode===EVENT?eventStage:null
    }
  };
  registration.timingProtocolSha256=evidenceBundleSha256(registration.timingProtocol);
  const trial={
    trialId,registrationRef:registration.registrationRef,
    preregistrationEvidenceRef:registration.registrationRef,
    preregistrationSha256:evidenceBundleSha256(registration),
    preregistration:registration,timingMode:mode,
    candidateFormat:registration.candidateFormat,gameRuleset:registration.gameRuleset,
    opponentSourceEventFormat:registration.opponentSourceEventFormat,
    expandedLegalityAsOf:registration.expandedLegalityAsOf,eventDate:registration.eventDate,
    formatReviewStatus:registration.formatReviewStatus,
    originalSourceSeat:0,candidateSeat:1,actualFirstPlayerSeat:0,
    sourcePhysicalDealSha256:sha(1),fullPhysicalDealSha256:sha(2),
    vendorCommitSha:sha(3),researchRevisionSha:sha(4),hookRevisionSha:sha(5),
    originalPrinted60Sha256:sha(6),candidatePrinted60Sha256:sha(7),
    policySha256BySeat:samePolicy?['shared-policy','shared-policy']:
      ['source-policy','candidate-policy'],
    nativeFinished:true,nativeWinner:outcome==='tie'?null:0,
    nativeOutcome:outcome,nativeEndReason:'natural-prize-terminal',
    terminalKind:'natural-paper-terminal',finalPrizes:outcome==='tie'?[3,3]:[0,6],
    engineError:false,rootCapReached:false,
    rootActionLedger:roots,rootActionLedgerSha256:rootDigest(roots),
    actionCertificates:[],
    fullRootPaperReceipts:roots.map(r=>({
      rootOrdinal:r.actionOrdinal,actorSeat:r.playerSlot,action:r.action,
      paperLegalityReviewed:true,paymentsVerified:true,
      targetsAndTransitionsVerified:true,ownerInformationOnly:true,
      physicalCustodyVerified:true,independentlyReviewed:true,
      independentReviewerId:'external-paper-reviewer',
      evidenceRef:'paper/root-'+r.actionOrdinal
    })),
    independentFullPaperRulesAudit:true,hiddenInformationAudit:true,
    responseOpportunityAudit:null,
    eventStage:mode===EVENT?eventStage:null,clockDisposition:CLOCK_NOT_APPLICABLE,
    clockReceiptId:null,paperReceiptId:null,adjudicationProtocolSha:null,
    noCallClockPacket:null,timeCallPacket:null,extensionLedgerPacket:null
  };
  if(mode===EVENT){
    trial.eventStage=eventStage;
    trial.paperReceiptId='paper/terminal';
    trial.adjudicationProtocolSha=aichiClockProtocolSha256();
    if(clockPath==='no-call'){
      trial.clockDisposition='no-official-call';
      trial.noCallClockPacket={
        stage:eventStage,officialEndCallObserved:false,
        elapsedSecondsAtNaturalTerminal:600,
        officialClockCoverageEvidenceRef:'clock/continuous',
        stageEvidenceRef:'event/stage',
        paperTerminalEvidenceRef:'paper/terminal',
        independentReviewEvidenceRef:'review/clock',
        noCallCoverageIndependentlyReviewed:true,
        paperStateIndependentlyReviewed:true,
        paperGameWinner:outcome==='tie'?null:0,paperGameTie:outcome==='tie'
      };
    }else if(clockPath==='official-call'){
      trial.clockDisposition='official-call';
      trial.clockReceiptId='clock/official-call';
      trial.timeCallPacket={
        stage:eventStage,officialEndCallObserved:true,
        officialClockEvidenceRef:'clock/official-call',
        elapsedSecondsAtOfficialCall:1500,
        stageEvidenceRef:'event/stage',firstPlayerSeat:0,
        firstPlayerEvidenceRef:'event/first-player',turnOwnerWhenCalled:1,
        turnOwnerWhenCalledEvidenceRef:'event/turn-owner',
        turnSequenceEvidenceRef:'event/turn-sequence',
        independentPaperStateEvidenceRef:'paper/terminal',
        paperStateIndependentlyReviewed:true,prizesRemaining:[4,4],
        paperGameWinner:outcome==='tie'?null:0,paperGameTie:outcome==='tie'
      };
    }
  }
  const registrationSha=trial.preregistrationSha256;
  const evidenceManifest=MANIFEST.map((kind,i)=>({
    kind,ref:kind==='registration'?trial.preregistrationEvidenceRef:'evidence/'+kind,
    sha256:kind==='registration'?registrationSha:sha(i+1)
  }));
  return {schema:BUNDLE_SCHEMA,admissionContract:SCHEMA,producerId:'bundle-producer',
    trialId,trial,evidenceManifest};
}

function signReviews(bundle,{roles=['paper'],strategyAudit=null,reviewerIdOverrides={},paperOverrides={}}={}){
  const registry={schema:'aichi-trusted-reviewers-v1',reviewers:[]};
  const reviews=[];
  for(const role of roles){
    const reviewerId=reviewerIdOverrides[role]??'test-reviewer-'+role;
    const {privateKey,publicKey}=generateKeyPairSync('ed25519');
    registry.reviewers.push({reviewerId,roles:[role],
      publicKeyPem:publicKey.export({type:'spki',format:'pem'})});
    const review={schema:REVIEW_SCHEMA,role,reviewerId,
      bundleSha256:evidenceBundleSha256(bundle),decision:'approve',
      paperOutcome:bundle.trial.nativeOutcome,
      paperWinnerSeat:bundle.trial.nativeWinner,
      reviewEvidenceRef:'review/'+role,
      reviewEvidenceSha256:sha(8)};
    if(role==='paper') Object.assign(review,{
      timingMode:bundle.trial.timingMode,gameRuleset:bundle.trial.gameRuleset,
      candidateFormat:bundle.trial.candidateFormat,
      opponentSourceEventFormat:bundle.trial.opponentSourceEventFormat,
      formatReviewStatus:bundle.trial.formatReviewStatus,
      candidatePrinted60Sha256:bundle.trial.candidatePrinted60Sha256,
      opponentPrinted60Sha256:bundle.trial.originalPrinted60Sha256,
      initial120CardCustodyVerified:true,actualSeatsAndFirstPlayerVerified:true,
      initialPhysicalDealEvidenceRef:'paper/initial-120',
      seatAndFirstPlayerEvidenceRef:'paper/seats-first-player',
      ...(bundle.trial.timingMode===UNTIMED?{
        expandedLegalityAsOf:bundle.trial.expandedLegalityAsOf,
        eventDate:null,
        untimedProtocolVerified:true,untimedProtocolPreDealVerified:true,
        untimedProtocolEvidenceRef:bundle.trial.registrationRef,
        untimedProtocolSha256:bundle.trial.preregistrationSha256,
        noTournamentTimerUsed:true,noOfficialEndCallObserved:true,
        noEventStageAdjudicationUsed:true,clockStatus:CLOCK_NOT_APPLICABLE,
        naturalTerminalVerified:true,naturalTerminalEvidenceRef:'paper/natural-terminal',
        timerBoundaryEvidenceRef:'paper/timer-boundary',
        exactExpandedCandidatePrinted60Verified:true,
        exactExpandedOpponentPrinted60Verified:true,
        candidateExpandedLegalityVerified:true,opponentExpandedLegalityVerified:true,
        candidateExpandedPrinted60EvidenceRef:'paper/candidate-expanded-60',
        opponentExpandedPrinted60EvidenceRef:'paper/opponent-expanded-60',
        candidateExpandedLegalityEvidenceRef:'legality/candidate-expanded',
        opponentExpandedLegalityEvidenceRef:'legality/opponent-expanded',
        expandedRulesetEvidenceRef:'rules/expanded'
      }:{
        eventDate:bundle.trial.eventDate,
        expandedLegalityAsOf:null,
        exactJapanesePrinted60sVerified:true,eventDateLegalityVerified:true,
        exactJapaneseCandidatePrinted60Verified:true,
        exactJapaneseOpponentPrinted60Verified:true,
        candidateEventDateLegalityVerified:true,opponentEventDateLegalityVerified:true,
        candidateJapanesePrinted60EvidenceRef:'paper/candidate-japanese-60',
        opponentJapanesePrinted60EvidenceRef:'paper/opponent-japanese-60',
        candidateEventDateLegalityEvidenceRef:'legality/candidate-japanese-extra',
        opponentEventDateLegalityEvidenceRef:'legality/opponent-japanese-extra',
        japaneseExtraRulesetEvidenceRef:'rules/japanese-extra',
        printed60EvidenceRef:'paper/printed-sixties',
        eventDateLegalityEvidenceRef:'legality/event-date'
      })
    });
    if(role==='paper') Object.assign(review,paperOverrides);
    if(role==='strategy'&&strategyAudit){
      Object.assign(review,{
        responseOpportunityDisposition:strategyAudit.disposition,
        responseOpportunityEvidenceRef:strategyAudit.evidenceRef,
        policyChallengeEvidenceRef:'strategy/adversarial-challenge',
        ownerCounterplayReviewEvidenceRef:'strategy/owner-counterplay'
      });
    }
    review.signatureBase64=sign(null,reviewSigningBytes(review),privateKey)
      .toString('base64');
    reviews.push(review);
  }
  return {reviews,registry};
}

function terminalAudit(){
  return {disposition:'verified-terminal-before-reply',
    evidenceRef:'strategy/terminal-before-reply',
    independentlyReviewed:true,completeGameOwnerOpportunityReview:true,
    terminalRootOrdinal:0,noFurtherPlayerTurnOccurred:true,
    paperTerminalCausalityReviewed:true,
    physicalTerminalEvidenceRef:'paper/terminal-and-no-next-turn'};
}

function inspect(bundle,roles=['paper'],audit=null){
  if(audit)bundle.trial.responseOpportunityAudit=audit;
  const signed=signReviews(bundle,{roles,strategyAudit:audit});
  return inspectAdmissionV3(bundle,signed.reviews,signed.registry);
}

function policyHash(n) {
  return n.toString(16).padStart(64,'0');
}

function actorOnlyBoundary(candidateSeat,opponentSeat,candidateOverrides={},opponentOverrides={}) {
  const role=(name,seat,overrides)=>({
    role:name,policyOwnerSeat:seat,version:'agent34-actor-only-root-policy-v1',
    origin:'detached-actor-observation',
    observationSchema:'agent2-public-native-dispatch-diff-v1',
    nativeOwnerTrainerFallbackEnabled:false,ownerFallbackDiagnosticViewEnabled:false,
    nativePolicyMayUseHiddenInformation:false,unsupportedPromptFallbacks:0,
    nonLiveSpeculativeFallbacks:0,nonOwnerNativeDelegations:0,
    nonTurnPhaseFallbacks:0,nonOwnerSeatBypassCalls:0,
    nativeOwnerTrainerFallbackAttemptedUnsupportedPasses:0,...overrides
  });
  return {schema:'aichi-actor-only-execution-boundary-v1',valid:true,failures:[],
    candidate:role('candidate',candidateSeat,candidateOverrides),
    opponent:role('opponent',opponentSeat,opponentOverrides)};
}

function signPolicyAttestation(attestation, privateKey) {
  attestation.signatureBase64 = sign(null,policyAttestationSigningBytes(attestation),privateKey)
    .toString('base64');
  return attestation;
}

function refreshPolicyEnvelope(bundle) {
  const attestationSha = evidenceBundleSha256(bundle.policyAttestationBundle);
  bundle.policyAttestationBundleSha256 = attestationSha;
  bundle.policyRegistration.policyAttestationBundleSha256 = attestationSha;
  const registrationSha = evidenceBundleSha256(bundle.policyRegistration);
  bundle.policyRegistrationSha256 = registrationSha;
  bundle.trial.policyPlanSha256 = bundle.policyPlanSha256;
  bundle.trial.policyAttestationBundleSha256 = attestationSha;
  bundle.trial.policyRegistrationSha256 = registrationSha;
  const receipt = bundle.policyApplicationReceipt;
  receipt.policyAttestationBundleSha256 = attestationSha;
  receipt.policyRegistrationSha256 = registrationSha;
  delete receipt.receiptSha256;
  receipt.receiptSha256 = evidenceBundleSha256(receipt);
  bundle.policyPanelReceipts = [receipt];
  return bundle;
}

function rehashTimingPreregistration(bundle) {
  const digest=evidenceBundleSha256(bundle.trial.preregistration);
  bundle.trial.preregistrationSha256=digest;
  const registrationEntry=bundle.evidenceManifest.find(x=>x.kind==='registration');
  registrationEntry.sha256=digest;
  return bundle;
}

function rehashPolicyBundle(bundle) {
  const planSha=evidenceBundleSha256(bundle.policyPlanCore);
  bundle.policyPlanSha256=planSha;
  bundle.policyAttestationBundle.policyPlanSha256=planSha;
  const attestationSha=evidenceBundleSha256(bundle.policyAttestationBundle);
  bundle.policyAttestationBundleSha256=attestationSha;
  bundle.policyRegistration.policyPlanSha256=planSha;
  bundle.policyRegistration.policyAttestationBundleSha256=attestationSha;
  const registrationSha=evidenceBundleSha256(bundle.policyRegistration);
  bundle.policyRegistrationSha256=registrationSha;
  bundle.trial.policyPlanSha256=planSha;
  bundle.trial.policyAttestationBundleSha256=attestationSha;
  bundle.trial.policyRegistrationSha256=registrationSha;
  const receipt=bundle.policyApplicationReceipt;
  receipt.policyPlanSha256=planSha;
  receipt.policyConstraintsSha256=evidenceBundleSha256(bundle.policyPlanCore.constraints);
  receipt.policyAttestationBundleSha256=attestationSha;
  receipt.policyRegistrationSha256=registrationSha;
  delete receipt.receiptSha256;
  receipt.receiptSha256=evidenceBundleSha256(receipt);
  bundle.policyPanelReceipts=[receipt];
  return bundle;
}

// Synthetic positive-path fixture: by default, 29 authenticated ranks are modeled
// as reviewed legal and three are absent. This is not the actual Aichi Expanded
// matrix; that matrix is asserted separately with five incompatible and 24 unverified.
function makePolicyBundle({mode=UNTIMED,unavailable=[23,25,28],incompatible=[],unverified=[],candidateProducerId='candidate-policy-author',opponentProducerId='opponent-policy-author',rankProducerOverrides={}}={}) {
  const bundle = makeBundle({mode,samePolicy:false,clockPath:mode===EVENT?'no-call':'none'});
  bundle.trial.vendorCommitSha='a'.repeat(40);
  bundle.trial.researchRevisionSha='b'.repeat(40);
  const cardPoolInitializationReceipt = {
    schema:'agent36-twinleaf-card-pool-initialization-v1',
    enginePin:bundle.trial.vendorCommitSha,
    startupPath:'vendor/twinleaf/ptcg-server/start.js',
    startupSha256:policyHash(7002),
    setNames:['base','black-white-1'],
    definedSetCount:2,
    cardCount:1200
  };
  bundle.trial.cardPoolInitializationReceipt=cardPoolInitializationReceipt;
  const runtimePatchReceipts = [{
    schema:'aichi-runtime-patch-installation-receipt-v1',
    patchId:'fixture-underworld-door-hook',
    modulePath:'simulation/twinleaf/fixture-hook.cjs',
    moduleSha256:policyHash(7005),
    target:'fixture-underworld-door-reducer',
    originalReducerFingerprint:policyHash(7006),
    installedReducerFingerprint:policyHash(7007),
    installCount:1,
    installBoundary:'outer-v3-runner-before-role-wrappers',
    restoreCount:1,
    restoreBoundary:'outer-finally',
    restoredOriginal:true,
    nestedInstallCount:0,
    wrapperInstallCount:0
  }];
  bundle.trial.runtimePatchReceipts=runtimePatchReceipts;
  const runtimePinEvidence = {
    schema:'aichi-runtime-pin-evidence-v2',
    unionSha256:policyHash(7003),
    loadedProcessClosureSha256:policyHash(7004),
    cardPoolInitializationSha256:evidenceBundleSha256(cardPoolInitializationReceipt),
    fullProcessClosureCovered:false
  };
  const candidate = {
    deckSha256:sha(7),policySha256:policyHash(100),
    entryManifestSha256:policyHash(101),challengeSuiteSha256:policyHash(102),
    policyProducerId:candidateProducerId,
    formatStatus:'legal',formatStatusEvidenceRef:'format/candidate-legal'
  };
  const ranks = Array.from({length:32},(_,index)=>{
    const rank=index+1;
    if(unavailable.includes(rank)) return {
      rank,sourceStatus:'source-unavailable',formatStatus:null,formatStatusEvidenceRef:null,
      deckSha256:null,policySha256:null,
      entryManifestSha256:null,challengeSuiteSha256:null,policyProducerId:null
    };
    const formatStatus=incompatible.includes(rank)?'incompatible':
      unverified.includes(rank)?'unverified':'legal';
    const policyIdentityAvailable=formatStatus==='legal';
    return {
      rank,sourceStatus:'authenticated',formatStatus,
      formatStatusEvidenceRef:formatStatus==='unverified'?null:'format/opponent-rank-'+rank,
      deckSha256:rank===1?sha(6):policyHash(1000+rank),
      policySha256:policyIdentityAvailable?policyHash(2000+rank):null,
      entryManifestSha256:policyIdentityAvailable?policyHash(3000+rank):null,
      challengeSuiteSha256:policyIdentityAvailable?policyHash(4000+rank):null,
      policyProducerId:policyIdentityAvailable?(rankProducerOverrides[rank]??opponentProducerId):null
    };
  });
  const constraints = {
    gameRuleset:bundle.trial.gameRuleset,
    candidateFormat:bundle.trial.candidateFormat,
    opponentSourceEventFormat:bundle.trial.opponentSourceEventFormat,
    expandedLegalityAsOf:bundle.trial.expandedLegalityAsOf,
    eventDate:bundle.trial.eventDate,
    formatReviewStatus:'independently-reviewed',
    observationSurface:{ownerVisible:true,publicState:true},
    hiddenInformationBoundary:{forbidOpponentPrivateHand:true,forbidDeckOrder:true},
    decisionBudget:{maxNodes:128,deadlineMs:250},
    timeoutPolicy:{maxTimeouts:0,fallback:'safe-legal-action'},
    randomizationProtocol:{algorithm:'seeded-prng',seed:'frozen-panel-seed'},
    publicHistoryWindow:{scope:'full-match'},
    resourceAccounting:{energyZones:true,oncePerTurn:true},
    sharedEngineCompatibilityPatches:[{
      patchId:'fixture-underworld-door-hook',
      modulePath:'simulation/twinleaf/fixture-hook.cjs',
      moduleSha256:policyHash(7005),
      target:'fixture-underworld-door-reducer'
    }]
  };
  const core = {
    schema:'aichi-policy-plan-core-v1',comparisonMode:'candidate-vs-field',
    candidateFormat:bundle.trial.candidateFormat,
    gameRuleset:bundle.trial.gameRuleset,
    opponentSourceEventFormat:bundle.trial.opponentSourceEventFormat,
    formatReviewStatus:'independently-reviewed',
    candidate,opponentPolicyBundle:{
      schema:'aichi-opponent-policy-bundle-v1',ranks
    },constraints,runtimePinEvidence
  };
  const planSha = evidenceBundleSha256(core);
  const constraintsSha = evidenceBundleSha256(constraints);
  const opponentBundleSha = evidenceBundleSha256(core.opponentPolicyBundle);
  const candidateKeys = generateKeyPairSync('ed25519');
  const opponentKeys = generateKeyPairSync('ed25519');
  const candidateAttestation = signPolicyAttestation({
    schema:'aichi-policy-competence-attestation-v1',
    role:'candidate-policy',reviewerId:'candidate-policy-reviewer',
    decision:'approve',policyPlanSha256:planSha,
    policyConstraintsSha256:constraintsSha,
    policyProducerId:candidate.policyProducerId,
    deckSha256:candidate.deckSha256,policySha256:candidate.policySha256,
    entryManifestSha256:candidate.entryManifestSha256,
    challengeSuiteSha256:candidate.challengeSuiteSha256,
    evidenceRef:'policy-review/candidate',evidenceSha256:policyHash(5001),
    attestedAt:'2026-11-12T00:50:00.000Z'
  },candidateKeys.privateKey);
  const opponentAttestation = signPolicyAttestation({
    schema:'aichi-policy-competence-attestation-v1',
    role:'opponent-policy',reviewerId:'opponent-policy-reviewer',
    decision:'approve',policyPlanSha256:planSha,
    policyConstraintsSha256:constraintsSha,
    opponentPolicyBundleSha256:opponentBundleSha,
    rankReviews:ranks.filter(x=>x.sourceStatus==='authenticated' && x.formatStatus==='legal').map(entry=>({
      rank:entry.rank,deckSha256:entry.deckSha256,
      policySha256:entry.policySha256,
      entryManifestSha256:entry.entryManifestSha256,
      challengeSuiteSha256:entry.challengeSuiteSha256,
      policyProducerId:entry.policyProducerId,
      decision:'approve',evidenceRef:'policy-review/opponent-rank-'+entry.rank,
      evidenceSha256:policyHash(6000+entry.rank)
    })),
    evidenceRef:'policy-review/opponent-field',evidenceSha256:policyHash(5002),
    attestedAt:'2026-11-12T00:51:00.000Z'
  },opponentKeys.privateKey);
  const attestationBundle = {
    schema:'aichi-policy-attestation-bundle-v1',
    policyPlanSha256:planSha,
    candidatePolicy:candidateAttestation,
    opponentPolicy:opponentAttestation
  };
  const attestationSha = evidenceBundleSha256(attestationBundle);
  const registration = {
    schema:'aichi-policy-registration-v1',trialId:bundle.trialId,
    policyPlanSha256:planSha,policyAttestationBundleSha256:attestationSha,
    candidateFormat:bundle.trial.candidateFormat,
    gameRuleset:bundle.trial.gameRuleset,
    opponentSourceEventFormat:bundle.trial.opponentSourceEventFormat,
    expandedLegalityAsOf:bundle.trial.expandedLegalityAsOf,
    eventDate:bundle.trial.eventDate,
    formatReviewStatus:bundle.trial.formatReviewStatus,
    candidatePolicyAttestationRef:candidateAttestation.evidenceRef,
    opponentPolicyAttestationBundleRef:opponentAttestation.evidenceRef,
    registeredAt:bundle.trial.preregistration.registeredAt,
    dealGeneratedAt:bundle.trial.preregistration.dealGeneratedAt,
    registeredBeforeDealGeneration:true
  };
  const registrationSha = evidenceBundleSha256(registration);
  const opponent = ranks[0];
  bundle.trial.opponentRank=1;
  bundle.trial.vendorCommitSha='a'.repeat(40);
  bundle.trial.researchRevisionSha='b'.repeat(40);
  bundle.trial.decisionTraceSha256=policyHash(7001);
  bundle.trial.policySha256BySeat=[opponent.policySha256,candidate.policySha256];
  bundle.trial.policyPlanSha256=planSha;
  bundle.trial.policyAttestationBundleSha256=attestationSha;
  bundle.trial.policyRegistrationSha256=registrationSha;
  bundle.trial.actorOnlyExecutionBoundary=actorOnlyBoundary(
    bundle.trial.candidateSeat,bundle.trial.originalSourceSeat);
  const receipt = {
    schema:'aichi-policy-application-receipt-v2',
    trialId:bundle.trialId,policyPlanSha256:planSha,
    candidateFormat:bundle.trial.candidateFormat,
    gameRuleset:bundle.trial.gameRuleset,
    opponentSourceEventFormat:bundle.trial.opponentSourceEventFormat,
    expandedLegalityAsOf:bundle.trial.expandedLegalityAsOf,
    eventDate:bundle.trial.eventDate,
    formatReviewStatus:bundle.trial.formatReviewStatus,
    policyRegistrationSha256:registrationSha,
    policyAttestationBundleSha256:attestationSha,
    opponentPolicyBundleSha256:opponentBundleSha,
    opponentRank:1,
    candidateDeckSha256:candidate.deckSha256,
    candidatePolicySha256:candidate.policySha256,
    candidatePolicyProducerId:candidate.policyProducerId,
    candidateEntryManifestSha256:candidate.entryManifestSha256,
    candidateChallengeSuiteSha256:candidate.challengeSuiteSha256,
    opponentDeckSha256:opponent.deckSha256,
    opponentPolicySha256:opponent.policySha256,
    opponentPolicyProducerId:opponent.policyProducerId,
    opponentEntryManifestSha256:opponent.entryManifestSha256,
    opponentChallengeSuiteSha256:opponent.challengeSuiteSha256,
    candidateSeat:1,opponentSeat:0,firstPlayerSeat:0,
    policySha256BySeat:[opponent.policySha256,candidate.policySha256],
    enginePin:bundle.trial.vendorCommitSha,
    runnerRevision:bundle.trial.researchRevisionSha,
    policyConstraintsSha256:constraintsSha,
    runtimePinUnionSha256:runtimePinEvidence.unionSha256,
    loadedProcessClosureSha256:runtimePinEvidence.loadedProcessClosureSha256,
    cardPoolInitializationSha256:runtimePinEvidence.cardPoolInitializationSha256,
    runtimePatchReceipts,
    runtimePatchReceiptsSha256:evidenceBundleSha256(runtimePatchReceipts),
    actorOnlyExecutionBoundary:bundle.trial.actorOnlyExecutionBoundary,
    actorOnlyExecutionBoundarySha256:evidenceBundleSha256(bundle.trial.actorOnlyExecutionBoundary),
    decisionTraceSha256:bundle.trial.decisionTraceSha256,
    timeoutStatus:'within-budget'
  };
  receipt.receiptSha256=evidenceBundleSha256(receipt);
  Object.assign(bundle,{
    policyPlanCore:core,policyPlanSha256:planSha,
    policyAttestationBundle:attestationBundle,
    policyAttestationBundleSha256:attestationSha,
    policyRegistration:registration,
    policyRegistrationSha256:registrationSha,
    policyApplicationReceipt:receipt,
    policyPanelReceipts:[receipt]
  });
  const policyRegistry = {
    schema:'aichi-trusted-reviewers-v1',
    reviewers:[
      {reviewerId:'candidate-policy-reviewer',roles:['candidate-policy'],
        publicKeyPem:candidateKeys.publicKey.export({type:'spki',format:'pem'})},
      {reviewerId:'opponent-policy-reviewer',roles:['opponent-policy'],
        publicKeyPem:opponentKeys.publicKey.export({type:'spki',format:'pem'})}
    ]
  };
  return {bundle,policyRegistry,candidatePrivateKey:candidateKeys.privateKey,
    opponentPrivateKey:opponentKeys.privateKey};
}

function combineRegistries(...registries) {
  return {schema:'aichi-trusted-reviewers-v1',
    reviewers:registries.flatMap(x=>x?.reviewers??[])};
}

function signedV3Result(bundle,policyRegistry,{roles=['paper','strategy'],audit=terminalAudit(),reviewerIdOverrides={}}={}) {
  // Bind the audit into the trial before signing the immutable bundle digest.
  if(audit) bundle.trial.responseOpportunityAudit=audit;
  const game = signReviews(bundle,{roles,strategyAudit:audit,reviewerIdOverrides});
  return inspectAdmissionV3(bundle,game.reviews,
    combineRegistries(policyRegistry,game.registry));
}

function populatePanelCoverage(bundle) {
  const candidate=bundle.policyPlanCore.candidate;
  const receipts=[];
  let sequence=0;
  for(const opponent of bundle.policyPlanCore.opponentPolicyBundle.ranks) {
    if(opponent.sourceStatus!=='authenticated') continue;
    for(const candidateSeat of [0,1]) {
      for(const firstPlayerSeat of [0,1]) {
        const current=bundle.policyApplicationReceipt;
        if(opponent.rank===current.opponentRank &&
            candidateSeat===current.candidateSeat &&
            firstPlayerSeat===current.firstPlayerSeat) {
          receipts.push(current);
          continue;
        }
        const boundary=actorOnlyBoundary(candidateSeat,1-candidateSeat);
        const receipt={
          ...current,
          actorOnlyExecutionBoundary:boundary,
          actorOnlyExecutionBoundarySha256:evidenceBundleSha256(boundary),
          trialId:'panel-'+opponent.rank+'-'+candidateSeat+'-'+firstPlayerSeat,
          opponentRank:opponent.rank,
          candidateDeckSha256:candidate.deckSha256,
          candidatePolicySha256:candidate.policySha256,
          candidatePolicyProducerId:candidate.policyProducerId,
          candidateEntryManifestSha256:candidate.entryManifestSha256,
          candidateChallengeSuiteSha256:candidate.challengeSuiteSha256,
          opponentDeckSha256:opponent.deckSha256,
          opponentPolicySha256:opponent.policySha256,
          opponentPolicyProducerId:opponent.policyProducerId,
          opponentEntryManifestSha256:opponent.entryManifestSha256,
          opponentChallengeSuiteSha256:opponent.challengeSuiteSha256,
          candidateSeat,opponentSeat:1-candidateSeat,firstPlayerSeat,
          policySha256BySeat:candidateSeat===0 ?
            [candidate.policySha256,opponent.policySha256] :
            [opponent.policySha256,candidate.policySha256],
          decisionTraceSha256:policyHash(9000+(sequence++))
        };
        const panelRegistration={
          ...bundle.policyRegistration,
          trialId:receipt.trialId
        };
        receipt.policyRegistrationSha256=evidenceBundleSha256(panelRegistration);
        delete receipt.receiptSha256;
        receipt.receiptSha256=evidenceBundleSha256(receipt);
        receipts.push(receipt);
      }
    }
  }
  bundle.policyPanelReceipts=receipts;
  return receipts;
}

function addPanelReceipt(bundle,overrides) {
  const candidateSeat=overrides.candidateSeat??bundle.policyApplicationReceipt.candidateSeat;
  const opponentSeat=overrides.opponentSeat??(1-candidateSeat);
  const boundary=actorOnlyBoundary(candidateSeat,opponentSeat);
  const receipt={...bundle.policyApplicationReceipt,...overrides,
    actorOnlyExecutionBoundary:boundary,
    actorOnlyExecutionBoundarySha256:evidenceBundleSha256(boundary),
    trialId:'additional-panel-trial'};
  receipt.policyRegistrationSha256=evidenceBundleSha256({
    ...bundle.policyRegistration,trialId:receipt.trialId
  });
  delete receipt.receiptSha256;
  receipt.receiptSha256=evidenceBundleSha256(receipt);
  bundle.policyPanelReceipts=[bundle.policyApplicationReceipt,receipt];
  return receipt;
}

test('untimed natural win needs paper review but no clock receipt or clock reviewer',()=>{
  const b=makeBundle(),r=inspect(b);
  assert.equal(r.schema,SCHEMA);
  assert.equal(r.timingMode,UNTIMED);
  assert.equal(r.clockStatus,CLOCK_NOT_APPLICABLE);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.equal(r.candidateOutcome,'loss');
  assert.equal(r.candidateWin,false);
  assert.equal(r.candidateNonWin,true);
  assert.equal(r.competitiveAdmission,false);
  assert.equal(r.fixtureOnly,true);
  assert.equal(r.admissionEligible,false);
  assert.equal(r.fullProcessClosureCovered,false);
});

test('untimed natural tie remains a tie and is not clock-adjudicated',()=>{
  const b=makeBundle({outcome:'tie'}),r=inspect(b);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.naturalOutcome,'tie');
  assert.equal(r.candidateOutcome,'tie');
  assert.equal(r.candidateWin,false);
  assert.equal(r.candidateNonWin,true);
  assert.equal(r.clockStatus,CLOCK_NOT_APPLICABLE);
  assert.equal(r.competitiveAdmission,false);
});

test('terminal-before-reply does not establish policy competence without pre-deal attestations',()=>{
  const b=makeBundle(),audit=terminalAudit();
  const r=inspect(b,['paper','strategy'],audit);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.equal(r.acceptanceReady,false);
  assert.equal(r.competitiveAdmission,false);
});

test('missing, post-outcome, or date-only preregistration cannot infer untimed mode from absent clock',()=>{
  const a=makeBundle();delete a.trial.preregistration;
  assert.equal(inspect(a).gameOutcomeAdmissionReady,false);
  const b=makeBundle();
  b.trial.preregistration.registeredAt='2026-11-12T01:02:00.000Z';
  b.trial.preregistrationSha256=evidenceBundleSha256(b.trial.preregistration);
  b.evidenceManifest.find(x=>x.kind==='registration').sha256=b.trial.preregistrationSha256;
  assert.equal(inspect(b).gameOutcomeAdmissionReady,false);
  const c=makeBundle();
  c.trial.preregistration.registeredAt='2026-11-12';
  c.trial.preregistrationSha256=evidenceBundleSha256(c.trial.preregistration);
  c.evidenceManifest.find(x=>x.kind==='registration').sha256=c.trial.preregistrationSha256;
  assert.equal(inspect(c).gameOutcomeAdmissionReady,false);
});

test('untimed preregistration requires explicit null event stage rather than missing metadata',()=>{
  const b=makeBundle();delete b.trial.eventStage;
  assert.equal(inspect(b).gameOutcomeAdmissionReady,false);
  const c=makeBundle();delete c.trial.preregistration.timingProtocol.eventStage;
  c.trial.preregistration.timingProtocolSha256=
    evidenceBundleSha256(c.trial.preregistration.timingProtocol);
  c.trial.preregistrationSha256=evidenceBundleSha256(c.trial.preregistration);
  c.evidenceManifest.find(x=>x.kind==='registration').sha256=
    c.trial.preregistrationSha256;
  assert.equal(inspect(c).gameOutcomeAdmissionReady,false);
});

test('actual timer, official call, or event adjudication invalidates untimed mode',()=>{
  const b=makeBundle();
  b.trial.clockDisposition='no-official-call';
  assert.equal(inspect(b).gameOutcomeAdmissionReady,false);
  const c=makeBundle();
  const signed=signReviews(c);
  signed.reviews[0].noOfficialEndCallObserved=false;
  signed.reviews[0].signatureBase64='';
  assert.equal(inspectAdmissionV3(c,signed.reviews,signed.registry)
    .gameOutcomeAdmissionReady,false);
});

test('untimed mode rejects an event clock reviewer and missing paper review',()=>{
  const b=makeBundle();
  const withClock=signReviews(b,{roles:['paper','clock']});
  assert.equal(inspectAdmissionV3(b,withClock.reviews,withClock.registry)
    .gameOutcomeAdmissionReady,false);
  const noPaper=signReviews(b,{roles:[]});
  assert.equal(inspectAdmissionV3(b,noPaper.reviews,noPaper.registry)
    .gameOutcomeAdmissionReady,false);
});

test('candidate-vs-field policy asymmetry is diagnostic, not a competence veto',()=>{
  const b=makeBundle({samePolicy:false}),r=inspect(b);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.samePolicyDiagnostic,false);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.ok(!r.failures.includes('policy-asymmetry-or-unverified-for-competitive'));
});

test('missing physical root receipts or printed/initial custody review blocks outcome',()=>{
  const b=makeBundle();b.trial.fullRootPaperReceipts=[];
  assert.equal(inspect(b).gameOutcomeAdmissionReady,false);
  const c=makeBundle(),s=signReviews(c);
  s.reviews[0].initial120CardCustodyVerified=false;
  s.reviews[0].signatureBase64='';
  assert.equal(inspectAdmissionV3(c,s.reviews,s.registry)
    .gameOutcomeAdmissionReady,false);
});

test('paper winner/tie disagreement and a native cap never admit',()=>{
  const b=makeBundle({outcome:'tie'});
  const s=signReviews(b);
  s.reviews[0].paperWinnerSeat=0;
  s.reviews[0].signatureBase64='';
  assert.equal(inspectAdmissionV3(b,s.reviews,s.registry)
    .gameOutcomeAdmissionReady,false);
  const c=makeBundle();c.trial.rootCapReached=true;
  assert.equal(inspect(c).gameOutcomeAdmissionReady,false);
});

test('untimed preregistration is bound to the registration manifest and bundle digest',()=>{
  const b=makeBundle();
  b.trial.preregistration.timingProtocol.tournamentTimerApplies=true;
  b.trial.preregistration.timingProtocolSha256=
    evidenceBundleSha256(b.trial.preregistration.timingProtocol);
  b.trial.preregistrationSha256=evidenceBundleSha256(b.trial.preregistration);
  b.evidenceManifest.find(x=>x.kind==='registration').sha256=
    b.trial.preregistrationSha256;
  assert.equal(inspect(b).gameOutcomeAdmissionReady,false);
});

test('V3 event no-call mode preserves the independently reviewed Aichi clock path',()=>{
  const b=makeBundle({mode:EVENT,clockPath:'no-call'});
  const s=signReviews(b,{roles:['paper','clock']});
  const r=inspectAdmissionV3(b,s.reviews,s.registry);
  assert.equal(r.timingMode,EVENT);
  assert.equal(r.preregistrationVerified,true);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
});

test('V3 event official-call mode preserves the official end-call adjudication path',()=>{
  const b=makeBundle({mode:EVENT,clockPath:'official-call'});
  const s=signReviews(b,{roles:['paper','clock']});
  const r=inspectAdmissionV3(b,s.reviews,s.registry);
  assert.equal(r.timingMode,EVENT);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
});

test('V3 event pre-call knockout tie requests a six-Prize tiebreaker and admits no winner',()=>{
  const b=makeBundle({mode:EVENT,outcome:'tie',clockPath:'no-call'});
  const clock=inspectOfficialAichiClock(b.trial);
  assert.equal(clock.status,'TIEBREAKER_REQUIRED_SIX_PRIZE');
  assert.equal(clock.winnerSeat,null);
  assert.equal(clock.outcome,null);
  const game=signReviews(b,{roles:['paper','clock']});
  const r=inspectAdmissionV3(b,game.reviews,game.registry);
  assert.equal(r.gameOutcomeAdmissionReady,false);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.equal(r.clockStatus,'TIEBREAKER_REQUIRED_SIX_PRIZE');
});

test('V3 event pre-call Swiss tie remains unresolved rather than applying post-call both-loss',()=>{
  const b=makeBundle({mode:EVENT,eventStage:'open-swiss',outcome:'tie',clockPath:'no-call'});
  const clock=inspectOfficialAichiClock(b.trial);
  assert.equal(clock.status,'PRE_CALL_NATURAL_TIE_UNSPECIFIED');
  assert.equal(clock.winnerSeat,null);
  assert.equal(clock.outcome,null);
  assert.notEqual(clock.status,'SWISS_BOTH_LOSE');
  const game=signReviews(b,{roles:['paper','clock']});
  const r=inspectAdmissionV3(b,game.reviews,game.registry);
  assert.equal(r.gameOutcomeAdmissionReady,false);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.equal(r.clockStatus,'PRE_CALL_NATURAL_TIE_UNSPECIFIED');
});


test('deck-aware V3 accepts distinct policies for a synthetic 29-rank fixture but keeps it explicitly incomplete',()=>{
  const {bundle,policyRegistry}=makePolicyBundle();
  const r=signedV3Result(bundle,policyRegistry);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.samePolicyDiagnostic,false);
  assert.equal(r.policyPanelConsistency.valid,true);
  assert.equal(r.policyFieldStatus,'INCOMPLETE_FIELD');
  assert.equal(r.policyFieldComplete,false);
  assert.equal(r.policyPanelCoverageComplete,false);
  assert.equal(r.policyApplicationReceiptVerified,true);
  assert.equal(r.policyCompetence.candidatePolicyAttestationValid,true);
  assert.equal(r.policyCompetence.opponentPolicyAttestationValid,true);
  assert.equal(r.responseOpportunityVerified,true);
  assert.equal(r.competitivePolicyCompetenceReady,true);
  assert.equal(r.acceptanceReady,true);
  assert.equal(r.fixtureOnly,true);
  assert.equal(r.competitiveAdmission,false);
});


test('V3 postgame reviews sign the finalized bundle externally without changing its digest',()=>{
  const {bundle,policyRegistry}=makePolicyBundle();
  const audit=terminalAudit();
  bundle.trial.responseOpportunityAudit=audit;
  const finalBundleSha=evidenceBundleSha256(bundle);
  const game=signReviews(bundle,{roles:['paper','strategy'],strategyAudit:audit});
  assert.ok(game.reviews.every(review=>review.bundleSha256===finalBundleSha));
  assert.equal(evidenceBundleSha256(bundle),finalBundleSha);
  const r=inspectAdmissionV3(bundle,game.reviews,combineRegistries(policyRegistry,game.registry));
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.responseOpportunityVerified,true);
  assert.equal(r.competitivePolicyCompetenceReady,true);
});


test('synthetic 29-rank receipt coverage still cannot complete the missing three-rank field',()=>{
  const {bundle}=makePolicyBundle();
  const receipts=populatePanelCoverage(bundle);
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(receipts.length,116);
  assert.equal(r.status,'INCOMPLETE_FIELD');
  assert.equal(r.availableRankStrataComplete,true);
  assert.equal(r.expectedAvailableStrata,116);
  assert.equal(r.observedAvailableStrata,116);
  assert.deepEqual(r.panelCoverageMissing,[]);
  assert.equal(r.fullFieldPanelComplete,false);
});

test('V3 panel preserves the actual Aichi Expanded matrix as zero available ranks',()=>{
  const incompatible=[3,6,7,24,29];
  const unavailable=[23,25,28];
  const unverified=Array.from({length:32},(_,index)=>index+1)
    .filter(rank=>!incompatible.includes(rank)&&!unavailable.includes(rank));
  const {bundle}=makePolicyBundle({
    incompatible,unverified,unavailable
  });
  const panel=inspectPolicyPanelConsistency(bundle);
  assert.equal(panel.status,'INCOMPLETE_FIELD');
  assert.deepEqual(panel.formatIncompatibleRanks,incompatible);
  assert.deepEqual(panel.formatUnverifiedRanks,unverified);
  assert.deepEqual(panel.unavailableRanks,unavailable);
  assert.deepEqual(panel.availableRanks,[]);
  assert.equal(panel.expectedAvailableStrata,0);
  assert.equal(panel.observedAvailableStrata,0);
  assert.equal(panel.fullFieldPanelComplete,false);
});

test('a complete authenticated 32-rank plan needs all 128 rank-seat-first-player strata',()=>{
  const {bundle}=makePolicyBundle({unavailable:[]});
  const receipts=populatePanelCoverage(bundle);
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(receipts.length,128);
  assert.equal(r.status,'VALID');
  assert.equal(r.fieldComplete,true);
  assert.equal(r.availableRankStrataComplete,true);
  assert.equal(r.fullFieldPanelComplete,true);
  assert.equal(r.observedAvailableStrata,128);
  assert.deepEqual(r.panelCoverageMissing,[]);
});

test('runtime process-closure status is explicit and partial closure is fixture-only',()=>{
  const {bundle,policyRegistry}=makePolicyBundle({mode:EVENT});
  const result=signedV3Result(bundle,policyRegistry,{roles:['paper','clock','strategy']});
  assert.equal(result.acceptanceReady,true);
  assert.equal(result.fullProcessClosureCovered,false);
  assert.equal(result.fixtureOnly,true);
  assert.equal(result.competitiveAdmission,false);
  assert.equal(result.admissionEligible,false);

  const missing=makePolicyBundle().bundle;
  delete missing.policyPlanCore.runtimePinEvidence.fullProcessClosureCovered;
  const panel=inspectPolicyPanelConsistency(missing);
  assert.equal(panel.valid,false);
  assert.ok(panel.failures.includes('policy-runtime-pin-evidence-missing-or-invalid'));
});

test('V3 application receipt v2 binds frozen runtime evidence and card-pool initialization',()=>{
  const {bundle}=makePolicyBundle();
  assert.equal(bundle.policyApplicationReceipt.schema,'aichi-policy-application-receipt-v2');
  assert.equal(inspectPolicyPanelConsistency(bundle).valid,true);

  const badRuntime=makePolicyBundle().bundle;
  badRuntime.policyApplicationReceipt.runtimePinUnionSha256=policyHash(9901);
  delete badRuntime.policyApplicationReceipt.receiptSha256;
  badRuntime.policyApplicationReceipt.receiptSha256=
    evidenceBundleSha256(badRuntime.policyApplicationReceipt);
  badRuntime.policyPanelReceipts=[badRuntime.policyApplicationReceipt];
  assert.equal(inspectPolicyPanelConsistency(badRuntime).valid,false);

  const badCardPool=makePolicyBundle().bundle;
  badCardPool.trial.cardPoolInitializationReceipt.cardCount++;
  assert.equal(inspectPolicyPanelConsistency(badCardPool).valid,false);
});

test('V3 actor-only boundary is digest-bound and separates factual outcome from policy competence',()=>{
  const {bundle,policyRegistry}=makePolicyBundle();
  const panel=inspectPolicyPanelConsistency(bundle);
  assert.equal(panel.actorOnlyExecutionBoundaryVerified,true);
  assert.equal(panel.actorOnlyExecutionBoundaryEligible,true);
  assert.equal(panel.currentReceiptValid,true);

  const boundary=bundle.trial.actorOnlyExecutionBoundary;
  boundary.valid=false;
  boundary.failures=['candidate-nonLiveSpeculativeFallbacks-nonzero'];
  boundary.candidate.nonLiveSpeculativeFallbacks=1;
  bundle.policyApplicationReceipt.actorOnlyExecutionBoundary=boundary;
  bundle.policyApplicationReceipt.actorOnlyExecutionBoundarySha256=evidenceBundleSha256(boundary);
  delete bundle.policyApplicationReceipt.receiptSha256;
  bundle.policyApplicationReceipt.receiptSha256=evidenceBundleSha256(bundle.policyApplicationReceipt);
  bundle.policyPanelReceipts=[bundle.policyApplicationReceipt];

  const result=signedV3Result(bundle,policyRegistry);
  assert.equal(result.gameOutcomeAdmissionReady,true,
    'actor-only policy fallback must not erase the factual natural-terminal outcome');
  assert.equal(result.competitivePolicyCompetenceReady,false,
    'speculative full-State fallback must disqualify comparative policy competence');
  assert.equal(result.policyPanelConsistency.currentReceiptValid,true,
    'the factual application receipt remains structurally valid');
  assert.equal(result.policyPanelConsistency.actorOnlyExecutionBoundaryVerified,true);
  assert.equal(result.policyPanelConsistency.actorOnlyExecutionBoundaryEligible,false);
  assert.ok(result.failures.includes('actor-only-execution-boundary-unverified-or-ineligible'));
});

test('missing actor-only boundary prevents policy competence without invalidating factual outcome',()=>{
  const {bundle,policyRegistry}=makePolicyBundle();
  delete bundle.trial.actorOnlyExecutionBoundary;
  delete bundle.policyApplicationReceipt.actorOnlyExecutionBoundary;
  delete bundle.policyApplicationReceipt.actorOnlyExecutionBoundarySha256;
  delete bundle.policyApplicationReceipt.receiptSha256;
  bundle.policyApplicationReceipt.receiptSha256=evidenceBundleSha256(bundle.policyApplicationReceipt);
  bundle.policyPanelReceipts=[bundle.policyApplicationReceipt];
  const result=signedV3Result(bundle,policyRegistry);
  assert.equal(result.gameOutcomeAdmissionReady,true);
  assert.equal(result.competitivePolicyCompetenceReady,false);
  assert.equal(result.policyPanelConsistency.currentReceiptValid,true);
  assert.equal(result.policyPanelConsistency.actorOnlyExecutionBoundaryVerified,false);
  assert.equal(result.policyPanelConsistency.actorOnlyExecutionBoundaryEligible,false);
});

test('V3 application receipt v2 rejects missing, reordered or incorrectly restored runtime patches',()=>{
  const {bundle}=makePolicyBundle();
  bundle.policyApplicationReceipt.runtimePatchReceipts[0].installCount=2;
  delete bundle.policyApplicationReceipt.receiptSha256;
  bundle.policyApplicationReceipt.receiptSha256=
    evidenceBundleSha256(bundle.policyApplicationReceipt);
  bundle.policyPanelReceipts=[bundle.policyApplicationReceipt];
  const result=inspectPolicyPanelConsistency(bundle);
  assert.equal(result.valid,false);
  assert.ok(result.failures.includes('policy-application-receipt-invalid-or-unhashed'));
});

test('panel receipts use per-trial registration digests while the current receipt stays bound to its registration',()=>{
  const {bundle}=makePolicyBundle();
  const receipts=populatePanelCoverage(bundle);
  assert.equal(new Set(receipts.map(item=>item.policyRegistrationSha256)).size,receipts.length);
  assert.equal(inspectPolicyPanelConsistency(bundle).valid,true);

  bundle.policyApplicationReceipt.policyRegistrationSha256=policyHash(9902);
  delete bundle.policyApplicationReceipt.receiptSha256;
  bundle.policyApplicationReceipt.receiptSha256=
    evidenceBundleSha256(bundle.policyApplicationReceipt);
  const result=inspectPolicyPanelConsistency(bundle);
  assert.equal(result.valid,false);
  assert.ok(result.failures.includes('current-policy-application-receipt-does-not-match-trial'));
});

test('candidate-policy hash drift across panel strata invalidates V3 application consistency',()=>{
  const {bundle}=makePolicyBundle();
  addPanelReceipt(bundle,{
    candidatePolicySha256:policyHash(9999),
    candidateSeat:0,opponentSeat:1,firstPlayerSeat:1,
    policySha256BySeat:[policyHash(9999),bundle.policyApplicationReceipt.policySha256BySeat[0]]
  });
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(r.valid,false);
  assert.ok(r.failures.includes('game-candidate-policy-mismatch'));
});

test('opponent-policy hash drift within one rank invalidates V3 application consistency',()=>{
  const {bundle}=makePolicyBundle();
  addPanelReceipt(bundle,{
    opponentPolicySha256:policyHash(9998),
    policySha256BySeat:[policyHash(9998),bundle.policyApplicationReceipt.policySha256BySeat[1]]
  });
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(r.valid,false);
  assert.ok(r.failures.includes('game-opponent-policy-mismatch'));
});

test('a source-unavailable opponent rank cannot produce a policy application receipt',()=>{
  const {bundle}=makePolicyBundle();
  const receipt=bundle.policyApplicationReceipt;
  receipt.opponentRank=23;
  receipt.receiptSha256='';
  delete receipt.receiptSha256;
  receipt.receiptSha256=evidenceBundleSha256(receipt);
  bundle.trial.opponentRank=23;
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(r.valid,false);
  assert.ok(r.failures.includes('game-against-source-unavailable-rank'));
});

test('common observation and decision-budget constraints are bound to every application receipt',()=>{
  const {bundle}=makePolicyBundle();
  const receipt=addPanelReceipt(bundle,{
    policyConstraintsSha256:policyHash(9997)
  });
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(r.valid,false);
  assert.ok(r.failures.includes('game-policy-constraints-mismatch'));
  assert.equal(receipt.policyConstraintsSha256,policyHash(9997));
});

test('candidate and opponent policy reviewers must be separately authorized',()=>{
  const {bundle,policyRegistry}=makePolicyBundle();
  const game=signReviews(bundle,{roles:['paper','strategy'],strategyAudit:terminalAudit()});
  const missingCandidate=combineRegistries(
    {...policyRegistry,reviewers:policyRegistry.reviewers.filter(x=>x.reviewerId!=='candidate-policy-reviewer')},
    game.registry
  );
  const a=inspectAdmissionV3(bundle,game.reviews,missingCandidate);
  assert.equal(a.gameOutcomeAdmissionReady,true);
  assert.equal(a.competitivePolicyCompetenceReady,false);
  assert.equal(a.policyCompetence.candidatePolicyAttestationValid,false);

  const missingOpponent=combineRegistries(
    {...policyRegistry,reviewers:policyRegistry.reviewers.filter(x=>x.reviewerId!=='opponent-policy-reviewer')},
    game.registry
  );
  const b=inspectAdmissionV3(bundle,game.reviews,missingOpponent);
  assert.equal(b.gameOutcomeAdmissionReady,true);
  assert.equal(b.competitivePolicyCompetenceReady,false);
  assert.equal(b.policyCompetence.opponentPolicyAttestationValid,false);
});

test('postgame strategy reviewer cannot also be a candidate or opponent policy producer',()=>{
  const {bundle,policyRegistry}=makePolicyBundle();
  const game=signReviews(bundle,{
    roles:['paper','strategy'],strategyAudit:terminalAudit(),
    reviewerIdOverrides:{strategy:'candidate-policy-author'}
  });
  const r=inspectAdmissionV3(bundle,game.reviews,combineRegistries(policyRegistry,game.registry));
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.ok(r.failures.includes('policy-producer-and-game-reviewers-not-independent'));
});

test('padded policy producer identities are not accepted as stable identifiers',()=>{
  const {bundle}=makePolicyBundle({candidateProducerId:'candidate-policy-author '});
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(r.valid,false);
  assert.ok(r.failures.includes('policy-producer-identity-missing-or-not-independent-from-bundle-producer'));
});

test('missing candidate or authenticated-rank policy producer identity fails closed',()=>{
  const {bundle}=makePolicyBundle();
  delete bundle.policyPlanCore.candidate.policyProducerId;
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(r.valid,false);
  assert.ok(r.failures.includes('policy-producer-identity-missing-or-not-independent-from-bundle-producer'));
});

test('duplicate trusted-registry identities cannot ambiguously authorize a policy reviewer',()=>{
  const {bundle,policyRegistry}=makePolicyBundle();
  const game=signReviews(bundle,{roles:['paper','strategy'],strategyAudit:terminalAudit()});
  const registry=combineRegistries(policyRegistry,game.registry);
  registry.reviewers.push({...policyRegistry.reviewers[0]});
  const r=inspectAdmissionV3(bundle,game.reviews,registry);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.policyCompetence.candidatePolicyAttestationValid,false);
  assert.equal(r.competitivePolicyCompetenceReady,false);
});

test('policy reviewers cannot also be candidate or opponent policy producers',()=>{
  const candidateProducer=makePolicyBundle({candidateProducerId:'candidate-policy-reviewer'});
  const candidateGame=signReviews(candidateProducer.bundle,{
    roles:['paper','strategy'],strategyAudit:terminalAudit()
  });
  const candidateResult=inspectAdmissionV3(candidateProducer.bundle,candidateGame.reviews,
    combineRegistries(candidateProducer.policyRegistry,candidateGame.registry));
  assert.equal(candidateResult.gameOutcomeAdmissionReady,true);
  assert.equal(candidateResult.policyCompetence.candidatePolicyAttestationValid,false);
  assert.equal(candidateResult.competitivePolicyCompetenceReady,false);

  const opponentProducer=makePolicyBundle({opponentProducerId:'opponent-policy-reviewer'});
  const opponentGame=signReviews(opponentProducer.bundle,{
    roles:['paper','strategy'],strategyAudit:terminalAudit()
  });
  const opponentResult=inspectAdmissionV3(opponentProducer.bundle,opponentGame.reviews,
    combineRegistries(opponentProducer.policyRegistry,opponentGame.registry));
  assert.equal(opponentResult.gameOutcomeAdmissionReady,true);
  assert.equal(opponentResult.policyCompetence.opponentPolicyAttestationValid,false);
  assert.equal(opponentResult.competitivePolicyCompetenceReady,false);
});


test('candidate and opponent policy producers cannot equal the game-bundle producer',()=>{
  const candidate=makePolicyBundle({candidateProducerId:'bundle-producer'});
  const candidateResult=signedV3Result(candidate.bundle,candidate.policyRegistry);
  assert.equal(candidateResult.gameOutcomeAdmissionReady,true);
  assert.equal(candidateResult.competitivePolicyCompetenceReady,false);
  assert.ok(candidateResult.policyPanelConsistency.failures.includes(
    'policy-producer-identity-missing-or-not-independent-from-bundle-producer'));

  const opponent=makePolicyBundle({opponentProducerId:'bundle-producer'});
  const opponentResult=signedV3Result(opponent.bundle,opponent.policyRegistry);
  assert.equal(opponentResult.gameOutcomeAdmissionReady,true);
  assert.equal(opponentResult.competitivePolicyCompetenceReady,false);
  assert.ok(opponentResult.policyPanelConsistency.failures.includes(
    'policy-producer-identity-missing-or-not-independent-from-bundle-producer'));
});

test('candidate-policy reviewer cannot be an opponent-rank policy producer',()=>{
  const fixture=makePolicyBundle();
  const attestation=fixture.bundle.policyAttestationBundle.candidatePolicy;
  attestation.reviewerId='opponent-policy-author';
  signPolicyAttestation(attestation,fixture.candidatePrivateKey);
  fixture.policyRegistry.reviewers.find(x=>x.reviewerId==='candidate-policy-reviewer')
    .reviewerId=attestation.reviewerId;
  refreshPolicyEnvelope(fixture.bundle);
  const r=signedV3Result(fixture.bundle,fixture.policyRegistry);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.ok(r.policyCompetence.failures.includes(
    'policy-reviewer-and-policy-producer-not-independent'));
});

test('opponent aggregate reviewer cannot be a different rank policy producer',()=>{
  const fixture=makePolicyBundle({rankProducerOverrides:{2:'rank-2-policy-author'}});
  const attestation=fixture.bundle.policyAttestationBundle.opponentPolicy;
  attestation.reviewerId='rank-2-policy-author';
  signPolicyAttestation(attestation,fixture.opponentPrivateKey);
  fixture.policyRegistry.reviewers.find(x=>x.reviewerId==='opponent-policy-reviewer')
    .reviewerId=attestation.reviewerId;
  refreshPolicyEnvelope(fixture.bundle);
  const r=signedV3Result(fixture.bundle,fixture.policyRegistry);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.ok(r.policyCompetence.failures.includes(
    'policy-reviewer-and-policy-producer-not-independent'));
});

test('postgame paper and clock reviewers cannot be opponent policy producers',()=>{
  for(const role of ['paper','clock']){
    const fixture=makePolicyBundle({mode:EVENT});
    const audit=terminalAudit();
    fixture.bundle.trial.responseOpportunityAudit=audit;
    const game=signReviews(fixture.bundle,{
      roles:['paper','clock','strategy'],strategyAudit:audit,
      reviewerIdOverrides:{[role]:'opponent-policy-author'}
    });
    const r=inspectAdmissionV3(fixture.bundle,game.reviews,
      combineRegistries(fixture.policyRegistry,game.registry));
    assert.equal(r.gameOutcomeAdmissionReady,true,role);
    assert.equal(r.competitivePolicyCompetenceReady,false,role);
    assert.ok(r.failures.includes('policy-producer-and-game-reviewers-not-independent'),role);
  }
});


test('a correctly re-signed policy attestation created after the deal is rejected',()=>{
  const {bundle,policyRegistry,candidatePrivateKey}=makePolicyBundle();
  bundle.policyAttestationBundle.candidatePolicy.attestedAt='2026-11-12T01:02:00.000Z';
  signPolicyAttestation(bundle.policyAttestationBundle.candidatePolicy,candidatePrivateKey);
  refreshPolicyEnvelope(bundle);
  const r=signedV3Result(bundle,policyRegistry);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.policyCompetence.candidatePolicyAttestationValid,false);
  assert.equal(r.competitivePolicyCompetenceReady,false);
});

test('event mode applies the same deck-aware policy gate without inheriting V2 samePolicy veto',()=>{
  const {bundle,policyRegistry}=makePolicyBundle({mode:EVENT});
  const r=signedV3Result(bundle,policyRegistry,{roles:['paper','clock','strategy']});
  assert.equal(r.timingMode,EVENT);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.samePolicyDiagnostic,false);
  assert.equal(r.policyFieldStatus,'INCOMPLETE_FIELD');
  assert.equal(r.policyCompetence.candidatePolicyAttestationValid,true);
  assert.equal(r.policyCompetence.opponentPolicyAttestationValid,true);
  assert.equal(r.responseOpportunityVerified,true);
  assert.equal(r.competitivePolicyCompetenceReady,true);
  assert.equal(r.acceptanceReady,true);
  assert.equal(r.competitiveAdmission,false);
  assert.equal(r.admissionEligible,false);
  assert.equal(r.fullProcessClosureCovered,false);
});

test('event game reviewers with duplicate trusted-registry identities are rejected',()=>{
  const {bundle,policyRegistry}=makePolicyBundle({mode:EVENT});
  const game=signReviews(bundle,{roles:['paper','clock','strategy'],strategyAudit:terminalAudit()});
  const registry=combineRegistries(policyRegistry,game.registry);
  registry.reviewers.push({...game.registry.reviewers.find(x=>x.reviewerId==='test-reviewer-paper')});
  const r=inspectAdmissionV3(bundle,game.reviews,registry);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.ok(r.failures.includes('game-reviewer-registry-identity-ambiguous'));
});

test('event outcome remains factual when a panel policy mapping drifts, but competence fails',()=>{
  const {bundle,policyRegistry}=makePolicyBundle({mode:EVENT});
  addPanelReceipt(bundle,{
    opponentPolicySha256:policyHash(9996),
    policySha256BySeat:[policyHash(9996),bundle.policyApplicationReceipt.policySha256BySeat[1]]
  });
  const r=signedV3Result(bundle,policyRegistry,{roles:['paper','clock','strategy']});
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.ok(r.policyPanelConsistency.failures.includes('game-opponent-policy-mismatch'));
});

test('same-deck mirror estimands require the preregistered same-policy identity relation',()=>{
  const {bundle}=makePolicyBundle();
  bundle.policyPlanCore.comparisonMode='same-deck-mirror';
  const r=inspectPolicyPanelConsistency(bundle);
  assert.equal(r.valid,false);
  assert.ok(r.failures.includes('unsupported-policy-comparison-mode'));
  assert.ok(r.failures.includes('same-policy-identity-required-for-controlled-comparison'));
});

test('wrong event stage and empty production trust registry fail closed',()=>{
  const b=makeBundle({mode:EVENT,clockPath:'no-call'});
  b.trial.eventStage='open-final';
  assert.equal(inspect(b).gameOutcomeAdmissionReady,false);
  const untimed=makeBundle();
  const signed=signReviews(untimed);
  const production=evaluateCompetitiveAdmissionV3(untimed,signed.reviews);
  assert.equal(production.competitiveAdmission,false);
  assert.equal(production.admissionEligible,false);
  assert.equal(production.fullProcessClosureCovered,false);
});


test('Expanded preregistration binds game ruleset, source event format and legality date',()=>{
  const bundle=makeBundle();
  assert.equal(inspectTimingPreregistration(bundle).valid,true);
  const wrongRuleset={...bundle,trial:{...bundle.trial,gameRuleset:'Japanese Extra'}};
  assert.ok(inspectTimingPreregistration(wrongRuleset).errors.includes(
    'game-ruleset-format-not-frozen-before-deal'));
  const missingDate={...bundle,trial:{...bundle.trial,expandedLegalityAsOf:null}};
  assert.ok(inspectTimingPreregistration(missingDate).errors.includes(
    'expanded-legality-date-not-frozen-before-deal'));
});

test('Expanded field validator fails closed on the actual Aichi-to-Expanded rank matrix',()=>{
  const incompatibleRanks=[3,6,7,24,29];
  const unavailableRanks=[23,25,28];
  const unverifiedRanks=Array.from({length:32},(_,index)=>index+1)
    .filter(rank=>!incompatibleRanks.includes(rank)&&!unavailableRanks.includes(rank));
  const {bundle}=makePolicyBundle({
    incompatible:incompatibleRanks,unverified:unverifiedRanks,unavailable:unavailableRanks
  });
  const core=bundle.policyPlanCore;
  const planSha=evidenceBundleSha256(core);
  const result=validateOpponentPolicyFieldBundle({
    policyPlanCore:core,expectedPolicyPlanSha256:planSha,gameReceipts:[]
  });
  assert.equal(result.status,'INCOMPLETE_FIELD');
  assert.deepEqual(result.formatIncompatibleRanks,incompatibleRanks);
  assert.deepEqual(result.formatUnverifiedRanks,unverifiedRanks);
  assert.deepEqual(result.unavailableRanks,unavailableRanks);
  assert.deepEqual(result.availableRanks,[]);
  const receipt={...bundle.policyApplicationReceipt,opponentRank:3,
    policyPlanSha256:planSha,
    opponentPolicyBundleSha256:evidenceBundleSha256(core.opponentPolicyBundle)};
  delete receipt.receiptSha256;
  receipt.receiptSha256=evidenceBundleSha256(receipt);
  const rejected=validateOpponentPolicyFieldBundle({
    policyPlanCore:core,expectedPolicyPlanSha256:planSha,gameReceipts:[receipt]
  });
  assert.ok(rejected.rejectionReasons.includes('game-against-format-incompatible-rank'));
});

 
test('format-aware field validator rejects missing legality evidence and identity leakage',()=>{
  const validate=core=>validateOpponentPolicyFieldBundle({
    policyPlanCore:core,expectedPolicyPlanSha256:evidenceBundleSha256(core),gameReceipts:[]
  });
  const candidateMissing=makePolicyBundle().bundle.policyPlanCore;
  candidateMissing.candidate.formatStatusEvidenceRef=null;
  assert.ok(validate(candidateMissing).rejectionReasons.includes(
    'candidate-format-evidence-ref-unverified'));
  const candidateUnverified=makePolicyBundle().bundle.policyPlanCore;
  candidateUnverified.candidate.formatStatus='unverified';
  assert.ok(validate(candidateUnverified).rejectionReasons.includes(
    'candidate-format-not-verified-legal'));

  const legalOpponentMissing=makePolicyBundle().bundle.policyPlanCore;
  legalOpponentMissing.opponentPolicyBundle.ranks[0].formatStatusEvidenceRef=null;
  assert.ok(validate(legalOpponentMissing).rejectionReasons.includes(
    'opponent-rank-format-evidence-ref-unverified'));

  const incompatibleMissing=makePolicyBundle({incompatible:[3]}).bundle.policyPlanCore;
  incompatibleMissing.opponentPolicyBundle.ranks[2].formatStatusEvidenceRef=null;
  assert.ok(validate(incompatibleMissing).rejectionReasons.includes(
    'format-incompatible-rank-evidence-ref-missing'));
  const incompatibleIdentity=makePolicyBundle({incompatible:[3]}).bundle.policyPlanCore;
  incompatibleIdentity.opponentPolicyBundle.ranks[2].policySha256=policyHash(8888);
  assert.ok(validate(incompatibleIdentity).rejectionReasons.includes(
    'format-incompatible-rank-has-policy-identity'));

  const unverifiedIdentity=makePolicyBundle({unverified:[4]}).bundle.policyPlanCore;
  unverifiedIdentity.opponentPolicyBundle.ranks[3].policySha256=policyHash(9999);
  assert.ok(validate(unverifiedIdentity).rejectionReasons.includes(
    'format-unverified-rank-has-policy-identity'));

  const unavailableWithFormat=makePolicyBundle().bundle.policyPlanCore;
  unavailableWithFormat.opponentPolicyBundle.ranks[22].formatStatus='unverified';
  assert.ok(validate(unavailableWithFormat).rejectionReasons.includes(
    'source-unavailable-rank-has-format-status'));
});



test('timing preregistration rejects a non-null inactive format date after its registration digest is recomputed',()=>{
  const expanded=makeBundle();
  expanded.trial.preregistration.eventDate='2026-05-10';
  expanded.trial.eventDate='2026-05-10';
  rehashTimingPreregistration(expanded);
  assert.ok(inspectTimingPreregistration(expanded).errors.includes(
    'untimed-preregistration-has-event-date'));

  const event=makeBundle({mode:EVENT,clockPath:'no-call'});
  event.trial.preregistration.expandedLegalityAsOf='2026-11-13';
  event.trial.expandedLegalityAsOf='2026-11-13';
  rehashTimingPreregistration(event);
  assert.ok(inspectTimingPreregistration(event).errors.includes(
    'event-preregistration-has-expanded-legality-date'));
});

test('untimed paper review requires a null inactive Japanese Extra event date',()=>{
  const bundle=makeBundle();
  const signed=signReviews(bundle);
  assert.equal(untimedPaperAttestationValid(
    signed.reviews[0],bundle.trial,bundle.trial.preregistration),true);
  assert.equal(untimedPaperAttestationValid({
    ...signed.reviews[0],eventDate:'2026-05-10'
  },bundle.trial,bundle.trial.preregistration),false);
});

test('Japanese Extra paper review rejects a non-null inactive Expanded legality date',()=>{
  const bundle=makeBundle({mode:EVENT,clockPath:'no-call'});
  const signed=signReviews(bundle,{
    roles:['paper','clock','strategy'],
    strategyAudit:terminalAudit(),
    paperOverrides:{expandedLegalityAsOf:'2026-11-13'}
  });
  const result=inspectAdmissionV3(bundle,signed.reviews,signed.registry);
  assert.equal(result.gameOutcomeAdmissionReady,false);
  assert.ok(result.failures.includes(
    'independent-printed-60-or-physical-deal-review-missing'));
});

test('V3 policy panel rejects inactive ruleset dates across registration, trial and receipts after rehashing',()=>{
  const expanded=makePolicyBundle().bundle;
  expanded.policyRegistration.eventDate='2026-05-10';
  expanded.trial.eventDate='2026-05-10';
  expanded.policyApplicationReceipt.eventDate='2026-05-10';
  rehashPolicyBundle(expanded);
  const expandedResult=inspectPolicyPanelConsistency(expanded);
  assert.equal(expandedResult.valid,false);
  assert.ok(expandedResult.failures.includes(
    'policy-registration-expanded-legality-date-mismatch'));
  assert.ok(expandedResult.failures.includes(
    'policy-application-receipt-invalid-or-unhashed'));

  const event=makePolicyBundle({mode:EVENT}).bundle;
  event.policyRegistration.expandedLegalityAsOf='2026-11-13';
  event.trial.expandedLegalityAsOf='2026-11-13';
  event.policyApplicationReceipt.expandedLegalityAsOf='2026-11-13';
  rehashPolicyBundle(event);
  const eventResult=inspectPolicyPanelConsistency(event);
  assert.equal(eventResult.valid,false);
  assert.ok(eventResult.failures.includes(
    'policy-registration-event-date-mismatch'));
  assert.ok(eventResult.failures.includes(
    'policy-application-receipt-invalid-or-unhashed'));
});


test('any partial format marker in the core, constraints, candidate or ranks activates the complete V3 format contract',()=>{
  const base=makePolicyBundle().bundle.policyPlanCore;
  const markerFields=[
    'gameRuleset','candidateFormat','opponentSourceEventFormat',
    'formatReviewStatus','expandedLegalityAsOf','eventDate',
    'formatStatus','formatStatusEvidenceRef'
  ];
  const legacy=structuredClone(base);
  for(const target of [
    legacy,legacy.constraints,legacy.candidate,...legacy.opponentPolicyBundle.ranks
  ]) {
    for(const field of markerFields) delete target[field];
  }
  const validate=core=>validateOpponentPolicyFieldBundle({
    policyPlanCore:core,
    expectedPolicyPlanSha256:evidenceBundleSha256(core),
    gameReceipts:[]
  });
  assert.equal(validate(legacy).status,'INCOMPLETE_FIELD');

  const variants=[
    ['core',core=>{core.gameRuleset='Expanded';}],
    ['constraints',core=>{core.constraints.eventDate=null;}],
    ['candidate',core=>{core.candidate.formatStatus='legal';}],
    ['ranks',core=>{core.opponentPolicyBundle.ranks[0].formatStatus='legal';}]
  ];
  for(const [label,mutate] of variants) {
    const partial=structuredClone(legacy);
    mutate(partial);
    const result=validate(partial);
    assert.ok(result.rejectionReasons.includes(
      'policy-plan-format-contract-incomplete'),label);
  }
});

test('omitting constraints.gameRuleset cannot downgrade an incompatible rank with policy hashes to legacy availability',()=>{
  const core=makePolicyBundle({incompatible:[3]}).bundle.policyPlanCore;
  delete core.constraints.gameRuleset;
  Object.assign(core.opponentPolicyBundle.ranks[2],{
    policySha256:policyHash(8801),
    entryManifestSha256:policyHash(8802),
    challengeSuiteSha256:policyHash(8803),
    policyProducerId:'opponent-policy-author'
  });
  const result=validateOpponentPolicyFieldBundle({
    policyPlanCore:core,
    expectedPolicyPlanSha256:evidenceBundleSha256(core),
    gameReceipts:[]
  });
  assert.equal(result.status,'INVALID');
  assert.equal(result.availableRanks.includes(3),false);
  assert.ok(result.rejectionReasons.includes('policy-plan-format-contract-incomplete'));
  assert.ok(result.rejectionReasons.includes('format-incompatible-rank-has-policy-identity'));
});


function makeFullClosurePolicyBundle({coreFixtureMarker}={}) {
  const generated=makePolicyBundle({unavailable:[]});
  const {bundle,candidatePrivateKey,opponentPrivateKey}=generated;
  bundle.policyPlanCore.runtimePinEvidence.fullProcessClosureCovered=true;
  if(coreFixtureMarker!==undefined) bundle.policyPlanCore.fixtureOnly=coreFixtureMarker;
  const planSha=evidenceBundleSha256(bundle.policyPlanCore);
  const constraintsSha=evidenceBundleSha256(bundle.policyPlanCore.constraints);
  const candidate=bundle.policyAttestationBundle.candidatePolicy;
  candidate.policyPlanSha256=planSha;
  candidate.policyConstraintsSha256=constraintsSha;
  signPolicyAttestation(candidate,candidatePrivateKey);
  const opponent=bundle.policyAttestationBundle.opponentPolicy;
  opponent.policyPlanSha256=planSha;
  opponent.policyConstraintsSha256=constraintsSha;
  signPolicyAttestation(opponent,opponentPrivateKey);
  bundle.policyAttestationBundle.policyPlanSha256=planSha;
  rehashPolicyBundle(bundle);
  populatePanelCoverage(bundle);
  return generated;
}

test('production evaluator rejects fixture-marked and malformed fixture flags even with full closure and otherwise valid reviews',()=>{
  const variants=[
    {coreFixtureMarker:undefined,trialFixtureMarker:true},
    {coreFixtureMarker:true,trialFixtureMarker:true},
    {coreFixtureMarker:undefined,trialFixtureMarker:'true'},
    {coreFixtureMarker:'true',trialFixtureMarker:false},
    {coreFixtureMarker:undefined,trialFixtureMarker:undefined,panelFixtureMarker:true},
    {coreFixtureMarker:undefined,trialFixtureMarker:undefined,panelFixtureMarker:'true'},
    {coreFixtureMarker:null,trialFixtureMarker:false},
    {coreFixtureMarker:undefined,trialFixtureMarker:null},
    {coreFixtureMarker:undefined,trialFixtureMarker:undefined,panelFixtureMarker:null},
    {coreFixtureMarker:undefined,trialFixtureMarker:undefined,bundleFixtureMarker:null}
  ];
  for(const variant of variants) {
    const generated=makeFullClosurePolicyBundle({
      coreFixtureMarker:variant.coreFixtureMarker
    });
    const {bundle,policyRegistry}=generated;
    if (variant.bundleFixtureMarker !== undefined)
      bundle.fixtureOnly=variant.bundleFixtureMarker;
    if (variant.trialFixtureMarker !== undefined)
      bundle.trial.fixtureOnly=variant.trialFixtureMarker;
    else
      delete bundle.trial.fixtureOnly;
    if (variant.panelFixtureMarker !== undefined) {
      const panelReceipt=bundle.policyPanelReceipts.find(item =>
        item.trialId !== bundle.policyApplicationReceipt.trialId);
      assert.ok(panelReceipt,'non-current panel receipt must exist');
      panelReceipt.fixtureOnly=variant.panelFixtureMarker;
      delete panelReceipt.receiptSha256;
      panelReceipt.receiptSha256=evidenceBundleSha256(panelReceipt);
    }
    const audit=terminalAudit();
    bundle.trial.responseOpportunityAudit=audit;
    const game=signReviews(bundle,{roles:['paper','strategy'],strategyAudit:audit});
    const combined=combineRegistries(policyRegistry,game.registry);
    const diagnostic=inspectAdmissionV3(bundle,game.reviews,combined);
    assert.equal(diagnostic.acceptanceReady,
      variant.panelFixtureMarker === undefined,diagnostic.failures.join(','));
    if (variant.panelFixtureMarker === true)
      assert.ok(diagnostic.failures.includes('game-fixture-marker-mismatch'));
    if (variant.panelFixtureMarker === 'true')
      assert.ok(diagnostic.failures.includes('game-fixture-marker-type-invalid'));
    assert.equal(bundle.policyPlanCore.runtimePinEvidence.fullProcessClosureCovered,true);

    const previous=authorizedReviewers.reviewers.slice();
    authorizedReviewers.reviewers.splice(
      0,authorizedReviewers.reviewers.length,...combined.reviewers);
    try {
      const production=evaluateCompetitiveAdmissionV3(bundle,game.reviews);
      assert.equal(production.fixtureOnly,true);
      assert.equal(production.acceptanceReady,false);
      assert.equal(production.competitiveAdmission,false);
      assert.equal(production.admissionEligible,false);
      assert.equal(production.fullProcessClosureCovered,true);
      assert.ok(production.failures.includes(
        'fixture-only-trial-not-eligible-for-competitive-admission'));
      if((variant.bundleFixtureMarker!==undefined &&
          typeof variant.bundleFixtureMarker!=='boolean') ||
         (variant.trialFixtureMarker!==undefined &&
          typeof variant.trialFixtureMarker!=='boolean') ||
         (variant.coreFixtureMarker!==undefined &&
          typeof variant.coreFixtureMarker!=='boolean') ||
         (variant.panelFixtureMarker!==undefined &&
          typeof variant.panelFixtureMarker!=='boolean')) {
        assert.ok(production.failures.includes('fixture-only-marker-type-invalid'));
      }
      assert.equal(production.disposition,'fixture-only-trial-not-admissible');
    } finally {
      authorizedReviewers.reviewers.splice(
        0,authorizedReviewers.reviewers.length,...previous);
    }
  }
});
