'use strict';

const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {generateKeyPairSync,sign} = require('node:crypto');
const {
  MANIFEST,REVIEW_SCHEMA,evidenceBundleSha256,reviewSigningBytes
} = require('../../simulation/evaluation/agent45-independent-competitive-admission.cjs');
const {rootDigest} =
  require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {
  UNTIMED,CLOCK_NOT_APPLICABLE,inspectUntimedNaturalOutcome,
  policyAttestationSigningBytes
} = require('../../simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs');
const {
  preparePreDealPolicyRegistration,
  preparePreDealPolicyRegistrationFixture,
  buildV3GameBundle,buildV3GameBundleFixture
} = require('../../simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs');
const productionReviewerRegistry =
  require('../../simulation/evaluation/agent45-authorized-reviewers.json');

const policyHash = n => n.toString(16).padStart(64,'0');

function signed(attestation,privateKey) {
  attestation.signatureBase64=sign(null,policyAttestationSigningBytes(attestation),privateKey)
    .toString('base64');
  return attestation;
}

function makePolicyFixture({fullProcessClosureCovered=false}={}) {
  const unavailable=[23,25,28];
  const now=Date.now();
  const candidate={
    deckSha256:policyHash(7),policySha256:policyHash(100),
    entryManifestSha256:policyHash(101),challengeSuiteSha256:policyHash(102),
    policyProducerId:'candidate-policy-author',
    formatStatus:'legal',formatStatusEvidenceRef:'format/candidate-expanded'
  };
  const ranks=Array.from({length:32},(_,index)=>{
    const rank=index+1;
    if(unavailable.includes(rank)) return {
      rank,sourceStatus:'source-unavailable',formatStatus:null,formatStatusEvidenceRef:null,
      deckSha256:null,policySha256:null,
      entryManifestSha256:null,challengeSuiteSha256:null,policyProducerId:null
    };
    return {
      rank,sourceStatus:'authenticated',
      deckSha256:rank===1?policyHash(6):policyHash(1000+rank),
      policySha256:policyHash(2000+rank),
      entryManifestSha256:policyHash(3000+rank),
      challengeSuiteSha256:policyHash(4000+rank),
      policyProducerId:'opponent-policy-author',
      formatStatus:'legal',formatStatusEvidenceRef:'format/opponent-rank-'+rank
    };
  });
  const cardPoolInitializationReceipt={
    schema:'agent36-twinleaf-card-pool-initialization-v1',
    enginePin:'a'.repeat(40),
    startupPath:'vendor/twinleaf/ptcg-server/start.js',
    startupSha256:policyHash(7002),
    setNames:['base','black-white-1'],
    definedSetCount:2,
    cardCount:1200
  };
  const runtimePatchReceipts=[{
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
  const runtimePinEvidence={
    schema:'aichi-runtime-pin-evidence-v2',
    unionSha256:policyHash(7003),
    loadedProcessClosureSha256:policyHash(7004),
    cardPoolInitializationSha256:evidenceBundleSha256(cardPoolInitializationReceipt),
    fullProcessClosureCovered
  };
  const constraints={
    candidateFormat:'Expanded',gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',
    expandedLegalityAsOf:'2026-11-13',eventDate:null,
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
  const policyPlanCore={
    schema:'aichi-policy-plan-core-v1',comparisonMode:'candidate-vs-field',
    fixtureOnly:true,candidateFormat:'Expanded',gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',
    formatReviewStatus:'independently-reviewed',
    candidate,opponentPolicyBundle:{
      schema:'aichi-opponent-policy-bundle-v1',ranks
    },constraints,runtimePinEvidence
  };
  const policyPlanSha256=evidenceBundleSha256(policyPlanCore);
  const policyConstraintsSha256=evidenceBundleSha256(constraints);
  const opponentPolicyBundleSha256=evidenceBundleSha256(policyPlanCore.opponentPolicyBundle);
  const candidateKeys=generateKeyPairSync('ed25519');
  const opponentKeys=generateKeyPairSync('ed25519');
  const paperKeys=generateKeyPairSync('ed25519');
  const strategyKeys=generateKeyPairSync('ed25519');
  const candidateAttestation=signed({
    schema:'aichi-policy-competence-attestation-v1',
    role:'candidate-policy',reviewerId:'candidate-policy-reviewer',
    decision:'approve',policyPlanSha256,policyConstraintsSha256,
    policyProducerId:candidate.policyProducerId,
    deckSha256:candidate.deckSha256,policySha256:candidate.policySha256,
    entryManifestSha256:candidate.entryManifestSha256,
    challengeSuiteSha256:candidate.challengeSuiteSha256,
    evidenceRef:'policy-review/candidate',evidenceSha256:policyHash(5001),
    attestedAt:new Date(now-120_000).toISOString()
  },candidateKeys.privateKey);
  const opponentAttestation=signed({
    schema:'aichi-policy-competence-attestation-v1',
    role:'opponent-policy',reviewerId:'opponent-policy-reviewer',
    decision:'approve',policyPlanSha256,policyConstraintsSha256,
    opponentPolicyBundleSha256,
    rankReviews:ranks.filter(x=>x.sourceStatus==='authenticated').map(entry=>({
      rank:entry.rank,deckSha256:entry.deckSha256,
      policySha256:entry.policySha256,
      entryManifestSha256:entry.entryManifestSha256,
      challengeSuiteSha256:entry.challengeSuiteSha256,
      policyProducerId:entry.policyProducerId,
      decision:'approve',evidenceRef:'policy-review/opponent-rank-'+entry.rank,
      evidenceSha256:policyHash(6000+entry.rank)
    })),
    evidenceRef:'policy-review/opponent-field',evidenceSha256:policyHash(5002),
    attestedAt:new Date(now-110_000).toISOString()
  },opponentKeys.privateKey);
  const policyAttestationBundle={
    schema:'aichi-policy-attestation-bundle-v1',policyPlanSha256,
    candidatePolicy:candidateAttestation,opponentPolicy:opponentAttestation
  };
  const reviewerRegistry={
    schema:'aichi-trusted-reviewers-v1',
    reviewers:[
      {reviewerId:'candidate-policy-reviewer',roles:['candidate-policy'],
        publicKeyPem:candidateKeys.publicKey.export({type:'spki',format:'pem'})},
      {reviewerId:'opponent-policy-reviewer',roles:['opponent-policy'],
        publicKeyPem:opponentKeys.publicKey.export({type:'spki',format:'pem'})},
      {reviewerId:'paper-game-reviewer',roles:['paper'],
        publicKeyPem:paperKeys.publicKey.export({type:'spki',format:'pem'})},
      {reviewerId:'strategy-game-reviewer',roles:['strategy'],
        publicKeyPem:strategyKeys.publicKey.export({type:'spki',format:'pem'})}
    ]
  };
  return {
    candidate,ranks,policyPlanCore,policyAttestationBundle,reviewerRegistry,
    cardPoolInitializationReceipt,runtimePatchReceipts,runtimePinEvidence,
    paperKeys,strategyKeys,
    policyPlanSha256,policyConstraintsSha256,opponentPolicyBundleSha256
  };
}

function makeGameRegistration(trialId,{pastDeal=false}={}) {
  const now=Date.now();
  const registeredAt=new Date(now-(pastDeal?90_000:30_000)).toISOString();
  const dealGeneratedAt=new Date(now+(pastDeal?-60_000:300_000)).toISOString();
  const timingProtocol={
    schema:'aichi-game-timing-protocol-preregistration-v1',
    mode:UNTIMED,declaredBeforeDealGeneration:true,
    tournamentTimerApplies:false,officialEndCallApplies:false,
    eventStageAdjudicationApplies:false,eventStage:null
  };
  return {
    schema:'aichi-game-level-preregistration-v1',
    registrationRef:'results/aichi-2026/registrations/'+trialId+'.json',
    trialId,mode:UNTIMED,registeredBeforeDealGeneration:true,
    registeredAt,dealGeneratedAt,timingProtocol,
    timingProtocolSha256:evidenceBundleSha256(timingProtocol),
    candidateFormat:'Expanded',gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',
    expandedLegalityAsOf:'2026-11-13',eventDate:null,
    formatReviewStatus:'independently-reviewed'
  };
}

function makePreDeal(fixture,{pastDeal=false}={}) {
  const trialId='agent44-v3-builder-fixture';
  const gameRegistration=makeGameRegistration(trialId,{pastDeal});
  const input={
    producerId:'agent44-v3-builder-test-producer',trialId,gameRegistration,
    preDealArtifactRef:gameRegistration.registrationRef+'.policy-predeal.json',
    policyPlanCore:fixture.policyPlanCore,
    policyAttestationBundle:fixture.policyAttestationBundle
  };
  return {input,result:preparePreDealPolicyRegistrationFixture(input,fixture.reviewerRegistry)};
}

function makeTrial(preDeal,fixture,{fixtureOnly=true}={}) {
  const trialId=preDeal.trialId;
  const dealGenerationStepStartedAt=new Date(
    Date.parse(preDeal.gameRegistration.dealGeneratedAt)+1000).toISOString();
  const dealGeneratedAt=new Date(
    Date.parse(preDeal.gameRegistration.dealGeneratedAt)+2000).toISOString();
  const initialSourceDealFingerprint=policyHash(8001);
  const roots=[{actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction'}];
  return {
    fixtureOnly,
    trialId,registrationRef:preDeal.gameRegistration.registrationRef,
    preregistrationEvidenceRef:preDeal.gameRegistration.registrationRef,
    preregistrationSha256:evidenceBundleSha256(preDeal.gameRegistration),
    preregistration:preDeal.gameRegistration,timingMode:UNTIMED,
    candidateFormat:'Expanded',gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',
    expandedLegalityAsOf:'2026-11-13',eventDate:null,
    formatReviewStatus:'independently-reviewed',
    dealGeneratedAt,dealGenerationStepStartedAt,initialSourceDealFingerprint,
    originalSourceSeat:0,candidateSeat:1,actualFirstPlayerSeat:0,
    sourcePhysicalDealSha256:policyHash(1),fullPhysicalDealSha256:policyHash(2),
    vendorCommitSha:'a'.repeat(40),researchRevisionSha:'b'.repeat(40),
    hookRevisionSha:'c'.repeat(40),decisionTraceSha256:policyHash(7001),
    originalPrinted60Sha256:fixture.ranks[0].deckSha256,
    candidatePrinted60Sha256:fixture.candidate.deckSha256,
    cardPoolInitializationReceipt:fixture.cardPoolInitializationReceipt,
    runtimePatchReceipts:fixture.runtimePatchReceipts,
    nativeFinished:true,nativeWinner:0,nativeOutcome:'win',
    nativeEndReason:'natural-prize-terminal',
    terminalKind:'natural-paper-terminal',finalPrizes:[0,6],
    engineError:false,rootCapReached:false,
    rootActionLedger:roots,rootActionLedgerSha256:rootDigest(roots),
    actionCertificates:[],fullRootPaperReceipts:[],
    independentFullPaperRulesAudit:false,hiddenInformationAudit:false,
    responseOpportunityAudit:null,eventStage:null,
    clockDisposition:CLOCK_NOT_APPLICABLE,clockReceiptId:null,
    paperReceiptId:null,adjudicationProtocolSha:null,
    noCallClockPacket:null,timeCallPacket:null,extensionLedgerPacket:null
  };
}

function makeReceipt(preDeal,trial,fixture) {
  const candidate=fixture.candidate,opponent=fixture.ranks[0];
  return {
    schema:'aichi-policy-application-receipt-v2',
    trialId:preDeal.trialId,
    candidateFormat:'Expanded',gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',
    expandedLegalityAsOf:'2026-11-13',eventDate:null,
    formatReviewStatus:'independently-reviewed',
    policyPlanSha256:preDeal.policyPlanSha256,
    policyRegistrationSha256:preDeal.policyRegistrationSha256,
    policyAttestationBundleSha256:preDeal.policyAttestationBundleSha256,
    opponentPolicyBundleSha256:fixture.opponentPolicyBundleSha256,
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
    enginePin:trial.vendorCommitSha,runnerRevision:trial.researchRevisionSha,
    policyConstraintsSha256:fixture.policyConstraintsSha256,
    runtimePinUnionSha256:fixture.runtimePinEvidence.unionSha256,
    loadedProcessClosureSha256:fixture.runtimePinEvidence.loadedProcessClosureSha256,
    cardPoolInitializationSha256:fixture.runtimePinEvidence.cardPoolInitializationSha256,
    runtimePatchReceipts:fixture.runtimePatchReceipts,
    runtimePatchReceiptsSha256:evidenceBundleSha256(fixture.runtimePatchReceipts),
    decisionTraceSha256:policyHash(7001),timeoutStatus:'within-budget'
  };
}

function makePreDealPersistenceReceipt(preDeal) {
  const registeredAt=Date.parse(preDeal.gameRegistration.registeredAt);
  const plannedDealAt=Date.parse(preDeal.gameRegistration.dealGeneratedAt);
  return {
    schema:'aichi-fixture-predeal-artifact-persistence-receipt-v1',
    fixtureOnly:true,fixtureClockSource:'local-fixture-clock',
    trialId:preDeal.trialId,
    artifactRef:preDeal.preDealArtifactRef,
    artifactSha256:preDeal.preDealArtifactSha256,
    persistedAt:new Date(registeredAt+
      Math.floor((plannedDealAt-registeredAt)/2)).toISOString()
  };
}

function makeDealGenerationReceipt(preDeal,trial,persistenceReceipt) {
  return {
    schema:'aichi-fixture-physical-deal-generation-receipt-v1',
    fixtureOnly:true,fixtureClockSource:'local-fixture-clock',
    trialId:preDeal.trialId,
    artifactRef:persistenceReceipt.artifactRef,
    artifactSha256:persistenceReceipt.artifactSha256,
    stepStartedAt:trial.dealGenerationStepStartedAt,
    runnerRevision:trial.researchRevisionSha,
    sourceDealFingerprint:trial.initialSourceDealFingerprint,
    sourcePhysicalDealSha256:trial.sourcePhysicalDealSha256,
    fullPhysicalDealSha256:trial.fullPhysicalDealSha256
  };
}

function makeGameReview(bundle,trial,fixture,role) {
  const outcome=inspectUntimedNaturalOutcome(trial);
  assert.ok(outcome,'review fixture requires a recorded natural terminal');
  const review={
    schema:REVIEW_SCHEMA,role,
    reviewerId:role==='paper'?'paper-game-reviewer':'strategy-game-reviewer',
    decision:'approve',
    bundleSha256:evidenceBundleSha256(bundle),
    paperOutcome:outcome.kind,paperWinnerSeat:outcome.winnerSeat,
    reviewEvidenceRef:'review-evidence/'+role,
    reviewEvidenceSha256:policyHash(role==='paper'?9001:9002)
  };
  if(role==='paper') Object.assign(review,{
    timingMode:UNTIMED,
    candidateFormat:'Expanded',gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',
    expandedLegalityAsOf:trial.expandedLegalityAsOf,
    formatReviewStatus:'independently-reviewed',
    candidatePrinted60Sha256:trial.candidatePrinted60Sha256,
    opponentPrinted60Sha256:trial.originalPrinted60Sha256,
    untimedProtocolVerified:true,
    untimedProtocolPreDealVerified:true,
    untimedProtocolEvidenceRef:trial.registrationRef,
    untimedProtocolSha256:trial.preregistrationSha256,
    noTournamentTimerUsed:true,
    noOfficialEndCallObserved:true,
    noEventStageAdjudicationUsed:true,
    clockStatus:CLOCK_NOT_APPLICABLE,
    naturalTerminalVerified:true,
    naturalTerminalEvidenceRef:'review-evidence/natural-terminal',
    timerBoundaryEvidenceRef:'review-evidence/timer-boundary',
    exactExpandedCandidatePrinted60Verified:true,
    exactExpandedOpponentPrinted60Verified:true,
    candidateExpandedLegalityVerified:true,
    opponentExpandedLegalityVerified:true,
    candidateExpandedPrinted60EvidenceRef:'review-evidence/candidate-expanded-60',
    opponentExpandedPrinted60EvidenceRef:'review-evidence/opponent-expanded-60',
    candidateExpandedLegalityEvidenceRef:'review-evidence/candidate-expanded-legality',
    opponentExpandedLegalityEvidenceRef:'review-evidence/opponent-expanded-legality',
    expandedRulesetEvidenceRef:'review-evidence/expanded-ruleset',
    initial120CardCustodyVerified:true,
    actualSeatsAndFirstPlayerVerified:true,
    printed60EvidenceRef:'review-evidence/printed-60',
    initialPhysicalDealEvidenceRef:'review-evidence/physical-deal',
    seatAndFirstPlayerEvidenceRef:'review-evidence/seats'
  });
  const keys=role==='paper'?fixture.paperKeys:fixture.strategyKeys;
  review.signatureBase64=sign(null,reviewSigningBytes(review),keys.privateKey)
    .toString('base64');
  return review;
}

function makeEvidence() {
  const evidence={};
  for(const kind of [
    'original-printed-60','contender-printed-60','full-physical-deal',
    'accepted-native-root-ledger','owner-payment-and-targets','paper-rules',
    'clock-continuity'
  ]) evidence[kind]={
    ref:'evidence/'+kind,value:{kind,fixture:'agent44-v3-builder'}
  };
  evidence['policy-and-counterplay']={ref:'evidence/policy-and-counterplay'};
  return evidence;
}

test('V3 builder freezes signed policy registration before deal and assembles the existing nine-object bundle',()=>{
  const fixture=makePolicyFixture();
  const {input,result:preDeal}=makePreDeal(fixture);
  assert.equal(preDeal.ready,true,preDeal.failures.join(','));
  assert.equal(preDeal.fixtureOnly,true);
  assert.equal(preDeal.fieldStatus,'INCOMPLETE_FIELD');
  assert.equal(preDeal.availableRanks.length,29);
  assert.deepEqual(preDeal.unavailableRanks,[23,25,28]);
  assert.match(preDeal.policyRegistrationSha256,/^[0-9a-f]{64}$/);
  assert.equal(preDeal.preDealArtifactRef,input.preDealArtifactRef);
  assert.match(preDeal.preDealArtifactSha256,/^[0-9a-f]{64}$/);

  const trial=makeTrial(preDeal,fixture);
  const preDealPersistenceReceipt=makePreDealPersistenceReceipt(preDeal);
  const dealGenerationReceipt=makeDealGenerationReceipt(preDeal,trial,preDealPersistenceReceipt);
  const built=buildV3GameBundleFixture({
    preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture),
    preDealPersistenceReceipt,dealGenerationReceipt,
    policyPanelReceipts:[],reviews:[]
  },fixture.reviewerRegistry);

  assert.equal(built.fixtureOnly,true);
  assert.equal(built.bundle.trial.trialId,preDeal.trialId);
  assert.equal(built.bundle.trial.gameRuleset,'Expanded');
  assert.equal(built.bundle.trial.preregistrationSha256,
    evidenceBundleSha256(preDeal.gameRegistration));
  assert.equal(built.bundle.policyRegistration.formatReviewStatus,'independently-reviewed');
  assert.equal(built.bundle.policyApplicationReceipt.gameRuleset,'Expanded');
  assert.deepEqual(built.bundle.evidenceManifest.map(x=>x.kind),MANIFEST);
  assert.equal(built.bundle.evidenceManifest.length,9);
  assert.equal(built.bundle.policyPanelReceipts.length,1);
  assert.equal(built.fieldStatus,'INCOMPLETE_FIELD');
  assert.equal(built.fullFieldPanelComplete,false);
  assert.equal(built.assessment.fixtureOnly,true);
  assert.equal(built.assessment.competitiveAdmission,false);
  assert.equal(built.assessment.admissionEligible,false);
  assert.equal(built.assessment.fullProcessClosureCovered,false);
  assert.equal(built.competitiveAdmission,false);
  assert.equal(built.admissionEligible,false);
  assert.equal(built.fullProcessClosureCovered,false);
  assert.throws(()=>buildV3GameBundle({
    preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture),
    policyPanelReceipts:[],reviews:[]
  }),/fixture-only pre-deal artifacts/);
});



test('fixture builder uses local fixture chronology and rejects production-shaped receipts',()=>{
  const fixture=makePolicyFixture();
  const {input,result:preDeal}=makePreDeal(fixture);
  const trial=makeTrial(preDeal,fixture);
  const preDealPersistenceReceipt=makePreDealPersistenceReceipt(preDeal);
  const dealGenerationReceipt=makeDealGenerationReceipt(preDeal,trial,preDealPersistenceReceipt);
  const common={
    preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture),
    preDealPersistenceReceipt,dealGenerationReceipt,
    policyPanelReceipts:[],reviews:[]
  };
  const built=buildV3GameBundleFixture(common,fixture.reviewerRegistry);
  assert.equal(built.fixtureOnly,true);
  assert.equal(built.competitiveAdmission,false);
  assert.equal(built.admissionEligible,false);
  assert.equal(built.fullProcessClosureCovered,false);
  assert.equal(built.preDealPersistenceReceipt.fixtureOnly,true);
  assert.equal(built.dealGenerationReceipt.fixtureOnly,true);
  assert.equal(built.preDealPersistenceReceipt.schema,
    'aichi-fixture-predeal-artifact-persistence-receipt-v1');
  assert.equal(built.dealGenerationReceipt.schema,
    'aichi-fixture-physical-deal-generation-receipt-v1');

  const productionShaped={
    ...preDealPersistenceReceipt,
    schema:'aichi-predeal-artifact-persistence-receipt-v1',
    fixtureOnly:false,serverTimestampSource:'github-actions-run-started-at'
  };
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDealPersistenceReceipt:productionShaped
  },fixture.reviewerRegistry),/fixture pre-deal persistence receipt/);

  const productionDealShaped={
    ...dealGenerationReceipt,
    schema:'aichi-physical-deal-generation-receipt-v1',
    fixtureOnly:false,
    workflowRunId:'1234567890',
    workflowHeadSha:'d'.repeat(40),
    stepName:'Generate physical deal'
  };
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,dealGenerationReceipt:productionDealShaped
  },fixture.reviewerRegistry),/fixture deal-generation receipt/);

  const wrongFingerprint={
    ...dealGenerationReceipt,sourceDealFingerprint:policyHash(9999)
  };
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,dealGenerationReceipt:wrongFingerprint
  },fixture.reviewerRegistry),/fixture trial generation time or source-deal fingerprint disagrees with receipt/);
});

test('valid signed postgame reviews remain external to the finalized bundle digest',()=>{
  const fixture=makePolicyFixture();
  const {input,result:preDeal}=makePreDeal(fixture);
  const trial=makeTrial(preDeal,fixture);
  const preDealPersistenceReceipt=makePreDealPersistenceReceipt(preDeal);
  const dealGenerationReceipt=makeDealGenerationReceipt(preDeal,trial,preDealPersistenceReceipt);
  const common={
    preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture),
    preDealPersistenceReceipt,dealGenerationReceipt,policyPanelReceipts:[]
  };
  const withoutReviews=buildV3GameBundleFixture({...common,reviews:[]},fixture.reviewerRegistry);
  const reviews=[
    makeGameReview(withoutReviews.bundle,trial,fixture,'paper'),
    makeGameReview(withoutReviews.bundle,trial,fixture,'strategy')
  ];
  const withReviews=buildV3GameBundleFixture({...common,reviews},fixture.reviewerRegistry);
  assert.equal(evidenceBundleSha256(withReviews.bundle),
    evidenceBundleSha256(withoutReviews.bundle));
  assert.deepEqual(withReviews.bundle,withoutReviews.bundle);
  assert.equal(Object.hasOwn(withReviews.policyEvidence,'postgameReviews'),false);
  assert.deepEqual(withReviews.assessment.signedReviewRoles.map(x=>({
    role:x.role,valid:x.valid
  })),[{role:'paper',valid:true},{role:'strategy',valid:true}]);
});

test('production pre-deal registration requires full process closure while fixture registration permits partial closure',()=>{
  const partial=makePolicyFixture({fullProcessClosureCovered:false});
  const {input:partialInput,result:fixturePartial}=makePreDeal(partial);
  assert.equal(fixturePartial.ready,true,fixturePartial.failures.join(','));

  const original=productionReviewerRegistry.reviewers;
  try {
    productionReviewerRegistry.reviewers=partial.reviewerRegistry.reviewers;
    const blocked=preparePreDealPolicyRegistration(partialInput);
    assert.equal(blocked.ready,false);
    assert.ok(blocked.failures.includes('production-runtime-process-closure-incomplete'));

    const complete=makePolicyFixture({fullProcessClosureCovered:true});
    const {input:completeInput}=makePreDeal(complete);
    productionReviewerRegistry.reviewers=complete.reviewerRegistry.reviewers;
    const accepted=preparePreDealPolicyRegistration(completeInput);
    assert.equal(accepted.ready,true,accepted.failures.join(','));
    assert.equal(accepted.policyPlanCore.runtimePinEvidence.fullProcessClosureCovered,true);
  } finally {
    productionReviewerRegistry.reviewers=original;
  }
});

test('production pre-deal gate rejects fixture reviewers and backdated deal registration',()=>{
  // Isolate reviewer authorization/chronology from the separate runtime-closure gate.
  const fixture=makePolicyFixture({fullProcessClosureCovered:true});
  const {input}=makePreDeal(fixture);
  const production=preparePreDealPolicyRegistration(input);
  assert.equal(production.ready,false);
  assert.equal(production.policyRegistration,null);

  const unsafeArtifactRef=preparePreDealPolicyRegistrationFixture({
    ...input,preDealArtifactRef:'../../outside-repository.json'
  },fixture.reviewerRegistry);
  assert.equal(unsafeArtifactRef.ready,false);
  assert.ok(unsafeArtifactRef.failures.includes('predeal-artifact-reference-invalid'));
  assert.ok(production.failures.some(x=>x.includes('predeal')||
    x.includes('candidate-policy-predeal')||x.includes('opponent-policy-predeal')));

  const past={...input,gameRegistration:makeGameRegistration(input.trialId,{pastDeal:true})};
  const rejected=preparePreDealPolicyRegistration(past);
  assert.equal(rejected.ready,false);
  assert.ok(rejected.failures.includes(
    'predeal-registration-is-not-currently-before-physical-deal'));
});

test('fixture postgame builder rejects rank, seat, trial-mode, and local chronology drift',()=>{
  const fixture=makePolicyFixture();
  const {input,result:preDeal}=makePreDeal(fixture);
  const trial=makeTrial(preDeal,fixture);
  const preDealPersistenceReceipt=makePreDealPersistenceReceipt(preDeal);
  const dealGenerationReceipt=makeDealGenerationReceipt(preDeal,trial,preDealPersistenceReceipt);
  const common={
    preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
    preDealPersistenceReceipt,dealGenerationReceipt,
    policyPanelReceipts:[],reviews:[]
  };

  const wrongSeat=makeReceipt(preDeal,trial,fixture);
  wrongSeat.policySha256BySeat[0]=fixture.candidate.policySha256;
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,policyApplicationReceipt:wrongSeat
  },fixture.reviewerRegistry),/role-to-seat policy mapping/);

  const unavailableRank=makeReceipt(preDeal,trial,fixture);
  unavailableRank.opponentRank=23;
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,policyApplicationReceipt:unavailableRank
  },fixture.reviewerRegistry),/not authenticated/);

  for (const changed of [
    {...common.preDeal,policyRegistrationSha256:policyHash(9999)},
    {...common.preDeal,preDealArtifactSha256:policyHash(9998)},
    {...common.preDeal,preDealArtifactRef:'results/retroactive-or-uncommitted.json'}
  ]) {
    assert.throws(()=>buildV3GameBundleFixture({
      ...common,preDeal:changed,
      policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
    },fixture.reviewerRegistry),/persisted pre-deal artifact changed/);
  }

  assert.throws(()=>buildV3GameBundleFixture({
    ...common,trial:{...trial,fixtureOnly:false}
  },fixture.reviewerRegistry),/fixture builder requires trial.fixtureOnly:true/);

  const latePersistence={
    ...preDealPersistenceReceipt,
    persistedAt:new Date(Date.parse(preDeal.gameRegistration.dealGeneratedAt)+1000).toISOString()
  };
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDealPersistenceReceipt:latePersistence
  },fixture.reviewerRegistry),/fixture pre-deal artifact was not persisted between registration and deal generation/);

  const earlyTime=new Date(Date.parse(preDeal.gameRegistration.dealGeneratedAt)-1000).toISOString();
  const earlyStep={...dealGenerationReceipt,stepStartedAt:earlyTime};
  const earlyTrial={...trial,dealGenerationStepStartedAt:earlyTime};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,trial:earlyTrial,dealGenerationReceipt:earlyStep
  },fixture.reviewerRegistry),/fixture deal-generation step did not follow fixture registration and persistence/);

  const noGenerationStep={...trial};
  delete noGenerationStep.dealGenerationStepStartedAt;
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,trial:noGenerationStep
  },fixture.reviewerRegistry),/fixture trial generation time or source-deal fingerprint disagrees with receipt/);

  const wrongPersistenceTrial={...preDealPersistenceReceipt,trialId:'another-trial'};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDealPersistenceReceipt:wrongPersistenceTrial
  },fixture.reviewerRegistry),/fixture pre-deal persistence receipt is missing or not bound/);

  const wrongRunnerRevision={...dealGenerationReceipt,runnerRevision:'d'.repeat(40)};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,dealGenerationReceipt:wrongRunnerRevision
  },fixture.reviewerRegistry),/fixture deal-generation receipt is missing or not bound to the native physical deal/);

  const retroFixture=makePolicyFixture();
  const retroTrialId='agent44-retroactive-ready-fixture';
  const retroRegistration=makeGameRegistration(retroTrialId,{pastDeal:true});
  const retroInput={
    producerId:'agent44-v3-builder-test-producer',trialId:retroTrialId,
    gameRegistration:retroRegistration,
    preDealArtifactRef:retroRegistration.registrationRef+'.policy-predeal.json',
    policyPlanCore:retroFixture.policyPlanCore,
    policyAttestationBundle:retroFixture.policyAttestationBundle
  };
  const retroPreDeal=preparePreDealPolicyRegistrationFixture(retroInput,retroFixture.reviewerRegistry);
  assert.equal(retroPreDeal.ready,true,'fixture can construct an internally consistent past-dated artifact');
  const retroTrial=makeTrial(retroPreDeal,retroFixture);
  assert.throws(()=>buildV3GameBundleFixture({
    preDeal:{...retroInput,...retroPreDeal},trial:retroTrial,
    evidence:makeEvidence(),
    policyApplicationReceipt:makeReceipt(retroPreDeal,retroTrial,retroFixture)
  },retroFixture.reviewerRegistry),/fixture pre-deal persistence receipt is missing or not bound/);
});

test('production builder retains server chronology and rejects partial runtime closure',()=>{
  const fixture=makePolicyFixture({fullProcessClosureCovered:true});
  const originalReviewers=productionReviewerRegistry.reviewers;
  productionReviewerRegistry.reviewers=fixture.reviewerRegistry.reviewers;
  try {
    const trialId='agent44-v3-production-builder-fixture';
    const gameRegistration=makeGameRegistration(trialId);
    const input={
      producerId:'agent44-v3-builder-test-producer',trialId,gameRegistration,
      preDealArtifactRef:gameRegistration.registrationRef+'.policy-predeal.json',
      policyPlanCore:fixture.policyPlanCore,
      policyAttestationBundle:fixture.policyAttestationBundle
    };
    const preDeal=preparePreDealPolicyRegistration(input);
    assert.equal(preDeal.ready,true,preDeal.failures.join(','));
    assert.equal(preDeal.fixtureOnly,false);
    const trial=makeTrial(preDeal,fixture,{fixtureOnly:false});
    const commitSha='d'.repeat(40);
    const blobSha='e'.repeat(40);
    const workflowRunId='1234567890';
    const preDealPersistenceReceipt={
      schema:'aichi-predeal-artifact-persistence-receipt-v1',
      trialId,serverTimestampSource:'github-actions-run-started-at',
      repositoryFullName:'FlareZ123/experiment-01',
      artifactRef:preDeal.preDealArtifactRef,
      artifactSha256:preDeal.preDealArtifactSha256,
      commitSha,blobSha,workflowRunId,workflowHeadSha:commitSha,
      workflowRunStartedAt:new Date(Date.parse(gameRegistration.registeredAt)+1000).toISOString()
    };
    const dealGenerationReceipt={
      schema:'aichi-physical-deal-generation-receipt-v1',
      trialId,artifactRef:preDealPersistenceReceipt.artifactRef,
      artifactSha256:preDealPersistenceReceipt.artifactSha256,
      commitSha,blobSha,workflowRunId,workflowHeadSha:commitSha,
      jobId:'1234567891',stepName:'Generate physical deal',
      stepStartedAt:trial.dealGenerationStepStartedAt,
      runnerRevision:trial.researchRevisionSha,
      sourceDealFingerprint:trial.initialSourceDealFingerprint
    };
    const common={
      preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
      policyApplicationReceipt:makeReceipt(preDeal,trial,fixture),
      preDealPersistenceReceipt,dealGenerationReceipt,
      policyPanelReceipts:[],reviews:[]
    };
    const built=buildV3GameBundle(common);
    assert.equal(built.fixtureOnly,false);
    assert.equal(built.fullProcessClosureCovered,true);
    assert.equal(built.bundle.trial.fixtureOnly,false);
    assert.equal(built.admissionEligible,false);
    assert.equal(built.competitiveAdmission,false);

    const partialPreDeal={
      ...common.preDeal,
      policyPlanCore:{
        ...common.preDeal.policyPlanCore,
        runtimePinEvidence:{
          ...common.preDeal.policyPlanCore.runtimePinEvidence,
          fullProcessClosureCovered:false
        }
      }
    };
    assert.throws(()=>buildV3GameBundle({...common,preDeal:partialPreDeal}),
      /production-runtime-process-closure-incomplete/);
    assert.throws(()=>buildV3GameBundle({
      ...common,trial:{...trial,fixtureOnly:true}
    }),/production builder rejects fixture-only trials/);

    const latePersistence={
      ...preDealPersistenceReceipt,
      workflowRunStartedAt:trial.dealGenerationStepStartedAt
    };
    assert.throws(()=>buildV3GameBundle({
      ...common,preDealPersistenceReceipt:latePersistence
    }),/pre-deal artifact workflow did not start after registration and before planned deal generation/);

    const wrongWorkflow={...dealGenerationReceipt,workflowRunId:'9876543210'};
    assert.throws(()=>buildV3GameBundle({
      ...common,dealGenerationReceipt:wrongWorkflow
    }),/same server-timestamped workflow/);

    const wrongHead={...preDealPersistenceReceipt,workflowHeadSha:'c'.repeat(40)};
    assert.throws(()=>buildV3GameBundle({
      ...common,preDealPersistenceReceipt:wrongHead
    }),/server-timestamped workflow run/);

    const wrongStep={...dealGenerationReceipt,stepName:'untrusted generation step'};
    assert.throws(()=>buildV3GameBundle({
      ...common,dealGenerationReceipt:wrongStep
    }),/same server-timestamped workflow/);

    const legacyPersistence={...preDealPersistenceReceipt,
      commitTimestampSource:'github-api-commit-committer-date',
      committedAt:gameRegistration.registeredAt};
    delete legacyPersistence.serverTimestampSource;
    delete legacyPersistence.workflowRunId;
    delete legacyPersistence.workflowHeadSha;
    delete legacyPersistence.workflowRunStartedAt;
    assert.throws(()=>buildV3GameBundle({
      ...common,preDealPersistenceReceipt:legacyPersistence
    }),/server-timestamped workflow run/);

    const legacyDeal={...dealGenerationReceipt,generatedAt:trial.dealGeneratedAt};
    delete legacyDeal.workflowRunId;
    delete legacyDeal.workflowHeadSha;
    delete legacyDeal.jobId;
    delete legacyDeal.stepName;
    delete legacyDeal.stepStartedAt;
    assert.throws(()=>buildV3GameBundle({
      ...common,dealGenerationReceipt:legacyDeal
    }),/same server-timestamped workflow/);

    const earlyTime=new Date(Date.parse(gameRegistration.dealGeneratedAt)-1000).toISOString();
    const earlyStep={...dealGenerationReceipt,stepStartedAt:earlyTime};
    const earlyTrial={...trial,dealGenerationStepStartedAt:earlyTime};
    assert.throws(()=>buildV3GameBundle({
      ...common,trial:earlyTrial,dealGenerationReceipt:earlyStep
    }),/did not start after preregistered time and workflow persistence/);

    const noServerStepTrial={...trial};
    delete noServerStepTrial.dealGenerationStepStartedAt;
    assert.throws(()=>buildV3GameBundle({
      ...common,trial:noServerStepTrial
    }),/server-reported generation step time or source-deal fingerprint disagrees/);

    const wrongDealFingerprint={...dealGenerationReceipt,sourceDealFingerprint:policyHash(8002)};
    assert.throws(()=>buildV3GameBundle({
      ...common,dealGenerationReceipt:wrongDealFingerprint
    }),/server-reported generation step time or source-deal fingerprint disagrees/);

    const wrongBlob={...dealGenerationReceipt,blobSha:'c'.repeat(40)};
    assert.throws(()=>buildV3GameBundle({
      ...common,dealGenerationReceipt:wrongBlob
    }),/same server-timestamped workflow/);

    const wrongPersistenceTrial={...preDealPersistenceReceipt,trialId:'another-trial'};
    assert.throws(()=>buildV3GameBundle({
      ...common,preDealPersistenceReceipt:wrongPersistenceTrial
    }),/server-timestamped workflow run/);

    const wrongRunnerRevision={...dealGenerationReceipt,runnerRevision:'d'.repeat(40)};
    assert.throws(()=>buildV3GameBundle({
      ...common,dealGenerationReceipt:wrongRunnerRevision
    }),/same server-timestamped workflow/);
  } finally {
    productionReviewerRegistry.reviewers=originalReviewers;
  }
});


test('production builder can assemble post-deal chronology without a durable pre-deal artifact',()=>{
  const realDateNow=Date.now;
  const actualNow=realDateNow();
  const simulatedPreparationNow=actualNow-600_000;
  const originalReviewers=productionReviewerRegistry.reviewers;
  let fixture,input,preDeal;
  productionReviewerRegistry.reviewers=[];
  try {
    // Prepare a valid in-memory registration as though it were created ten
    // minutes earlier. Restore the real clock before postgame assembly.
    Date.now=()=>simulatedPreparationNow;
    fixture=makePolicyFixture({fullProcessClosureCovered:true});
    const trialId='agent49-v3-postdeal-unpersisted-20261113';
    const gameRegistration=makeGameRegistration(trialId);
    input={
      producerId:'agent49-v3-unpersisted-test-producer',
      trialId,gameRegistration,
      preDealArtifactRef:gameRegistration.registrationRef+'.policy-predeal.json',
      policyPlanCore:fixture.policyPlanCore,
      policyAttestationBundle:fixture.policyAttestationBundle
    };
    productionReviewerRegistry.reviewers=fixture.reviewerRegistry.reviewers;
    preDeal=preparePreDealPolicyRegistration(input);
    assert.equal(preDeal.ready,true,preDeal.failures.join(','));
    assert.equal(preDeal.fixtureOnly,false);
    Date.now=realDateNow;

    const trial=makeTrial(preDeal,fixture,{fixtureOnly:false});
    assert.ok(Date.parse(trial.dealGenerationStepStartedAt)<actualNow,
      'the supplied generation step must already be in the past');
    assert.ok(Date.parse(trial.dealGeneratedAt)<actualNow,
      'the supplied physical-deal time must already be in the past');
    assert.equal(fs.existsSync(path.resolve(process.cwd(),preDeal.preDealArtifactRef)),false,
      'the referenced pre-deal artifact must not exist in the checkout');

    // These are syntactically valid placeholders, not GitHub API responses.
    // The pure builder never fetches the referenced commit, blob, run, job or step.
    const commitSha='d'.repeat(40);
    const blobSha='e'.repeat(40);
    const workflowRunId='1234567890';
    const preDealPersistenceReceipt={
      schema:'aichi-predeal-artifact-persistence-receipt-v1',
      trialId,serverTimestampSource:'github-actions-run-started-at',
      repositoryFullName:'FlareZ123/experiment-01',
      artifactRef:preDeal.preDealArtifactRef,
      artifactSha256:preDeal.preDealArtifactSha256,
      commitSha,blobSha,workflowRunId,workflowHeadSha:commitSha,
      workflowRunStartedAt:new Date(
        Date.parse(gameRegistration.registeredAt)+1000).toISOString()
    };
    const dealGenerationReceipt={
      schema:'aichi-physical-deal-generation-receipt-v1',
      trialId,artifactRef:preDealPersistenceReceipt.artifactRef,
      artifactSha256:preDealPersistenceReceipt.artifactSha256,
      commitSha,blobSha,workflowRunId,workflowHeadSha:commitSha,
      jobId:'1234567891',stepName:'Generate physical deal',
      stepStartedAt:trial.dealGenerationStepStartedAt,
      runnerRevision:trial.researchRevisionSha,
      sourceDealFingerprint:trial.initialSourceDealFingerprint
    };
    const built=buildV3GameBundle({
      preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
      policyApplicationReceipt:makeReceipt(preDeal,trial,fixture),
      preDealPersistenceReceipt,dealGenerationReceipt,
      policyPanelReceipts:[],reviews:[]
    });
    assert.equal(built.bundle.trial.trialId,trialId);
    assert.equal(built.preDealPersistenceReceipt.commitSha,commitSha);
    assert.equal(built.preDealPersistenceReceipt.blobSha,blobSha);
    assert.equal(built.admissionEligible,false);
    assert.equal(built.competitiveAdmission,false);
  } finally {
    Date.now=realDateNow;
    productionReviewerRegistry.reviewers=originalReviewers;
  }
});


test('builder distinguishes structurally valid policy panel from actor-only competitive eligibility',()=>{
  const fixture=makePolicyFixture();
  const {input,result:preDeal}=makePreDeal(fixture);
  const trial=makeTrial(preDeal,fixture);
  const preDealPersistenceReceipt=makePreDealPersistenceReceipt(preDeal);
  const dealGenerationReceipt=makeDealGenerationReceipt(preDeal,trial,preDealPersistenceReceipt);
  const built=buildV3GameBundleFixture({
    preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture),
    preDealPersistenceReceipt,dealGenerationReceipt,
    policyPanelReceipts:[],reviews:[]
  },fixture.reviewerRegistry);

  assert.equal(built.policyPanelConsistency.valid,true);
  assert.equal(built.policyPanelConsistency.actorOnlyExecutionBoundaryEligible,false);
  assert.ok(built.policyPanelConsistency.actorOnlyExecutionBoundaryFailures
    .includes('actor-only-execution-boundary-missing'));
  assert.equal(built.assessment.competitivePolicyCompetenceReady,false);
  assert.equal(built.assessment.acceptanceReady,false);
  assert.equal(built.admissionEligible,false);
  assert.equal(built.competitiveAdmission,false);
});


test('format-aware pre-deal registration rejects an Expanded/Japanese Extra mismatch',()=>{
  const fixture=makePolicyFixture();
  const {input,result:preDeal}=makePreDeal(fixture);
  assert.equal(preDeal.ready,true,preDeal.failures.join(','));
  const wrongRegistration={...input.gameRegistration,candidateFormat:'Japanese Extra'};
  const rejected=preparePreDealPolicyRegistrationFixture({
    ...input,gameRegistration:wrongRegistration
  },fixture.reviewerRegistry);
  assert.equal(rejected.ready,false);
  assert.ok(rejected.failures.includes('game-ruleset-format-review-status-not-frozen-before-deal'));
});
