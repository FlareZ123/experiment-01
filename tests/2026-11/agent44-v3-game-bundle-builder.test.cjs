'use strict';

const test = require('node:test');
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

const policyHash = n => n.toString(16).padStart(64,'0');

function signed(attestation,privateKey) {
  attestation.signatureBase64=sign(null,policyAttestationSigningBytes(attestation),privateKey)
    .toString('base64');
  return attestation;
}

function makePolicyFixture() {
  const unavailable=[23,25,28];
  const now=Date.now();
  const candidate={
    deckSha256:policyHash(7),policySha256:policyHash(100),
    entryManifestSha256:policyHash(101),challengeSuiteSha256:policyHash(102),
    policyProducerId:'candidate-policy-author'
  };
  const ranks=Array.from({length:32},(_,index)=>{
    const rank=index+1;
    if(unavailable.includes(rank)) return {
      rank,sourceStatus:'source-unavailable',deckSha256:null,policySha256:null,
      entryManifestSha256:null,challengeSuiteSha256:null,policyProducerId:null
    };
    return {
      rank,sourceStatus:'authenticated',
      deckSha256:rank===1?policyHash(6):policyHash(1000+rank),
      policySha256:policyHash(2000+rank),
      entryManifestSha256:policyHash(3000+rank),
      challengeSuiteSha256:policyHash(4000+rank),
      policyProducerId:'opponent-policy-author'
    };
  });
  const constraints={
    observationSurface:{ownerVisible:true,publicState:true},
    hiddenInformationBoundary:{forbidOpponentPrivateHand:true,forbidDeckOrder:true},
    decisionBudget:{maxNodes:128,deadlineMs:250},
    timeoutPolicy:{maxTimeouts:0,fallback:'safe-legal-action'},
    randomizationProtocol:{algorithm:'seeded-prng',seed:'frozen-panel-seed'},
    publicHistoryWindow:{scope:'full-match'},
    resourceAccounting:{energyZones:true,oncePerTurn:true}
  };
  const policyPlanCore={
    schema:'aichi-policy-plan-core-v1',comparisonMode:'candidate-vs-field',
    candidate,opponentPolicyBundle:{
      schema:'aichi-opponent-policy-bundle-v1',ranks
    },constraints
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
    timingProtocolSha256:evidenceBundleSha256(timingProtocol)
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

function makeTrial(preDeal,fixture) {
  const trialId=preDeal.trialId;
  const dealGeneratedAt=new Date(Date.parse(preDeal.gameRegistration.dealGeneratedAt)+1000).toISOString();
  const initialSourceDealFingerprint=policyHash(8001);
  const roots=[{actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction'}];
  return {
    trialId,registrationRef:preDeal.gameRegistration.registrationRef,
    preregistrationEvidenceRef:preDeal.gameRegistration.registrationRef,
    preregistrationSha256:evidenceBundleSha256(preDeal.gameRegistration),
    preregistration:preDeal.gameRegistration,timingMode:UNTIMED,
    dealGeneratedAt,initialSourceDealFingerprint,
    originalSourceSeat:0,candidateSeat:1,actualFirstPlayerSeat:0,
    sourcePhysicalDealSha256:policyHash(1),fullPhysicalDealSha256:policyHash(2),
    vendorCommitSha:'a'.repeat(40),researchRevisionSha:'b'.repeat(40),
    hookRevisionSha:'c'.repeat(40),decisionTraceSha256:policyHash(7001),
    originalPrinted60Sha256:fixture.ranks[0].deckSha256,
    candidatePrinted60Sha256:fixture.candidate.deckSha256,
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
    schema:'aichi-policy-application-receipt-v1',
    trialId:preDeal.trialId,
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
    decisionTraceSha256:policyHash(7001),timeoutStatus:'within-budget'
  };
}

function makePreDealPersistenceReceipt(preDeal) {
  const registeredAt=Date.parse(preDeal.gameRegistration.registeredAt);
  const plannedDealAt=Date.parse(preDeal.gameRegistration.dealGeneratedAt);
  return {
    schema:'aichi-predeal-artifact-persistence-receipt-v1',
    trialId:preDeal.trialId,repositoryFullName:'FlareZ123/experiment-01',
    artifactRef:preDeal.preDealArtifactRef,
    artifactSha256:preDeal.preDealArtifactSha256,
    serverTimestampSource:'github-actions-run-started-at',
    workflowRunId:'1234567890',
    workflowHeadSha:'a'.repeat(40),
    commitSha:'a'.repeat(40),blobSha:'b'.repeat(40),
    workflowRunStartedAt:new Date(registeredAt+
      Math.floor((plannedDealAt-registeredAt)/2)).toISOString()
  };
}

function makeDealGenerationReceipt(preDeal,trial,persistenceReceipt) {
  return {
    schema:'aichi-physical-deal-generation-receipt-v1',
    trialId:preDeal.trialId,
    artifactRef:persistenceReceipt.artifactRef,
    artifactSha256:persistenceReceipt.artifactSha256,
    commitSha:persistenceReceipt.commitSha,blobSha:persistenceReceipt.blobSha,
    workflowRunId:persistenceReceipt.workflowRunId,
    workflowHeadSha:persistenceReceipt.workflowHeadSha,
    jobId:'1234567891',
    stepName:'Generate physical deal',
    stepStartedAt:trial.dealGeneratedAt,
    runnerRevision:trial.researchRevisionSha,
    sourceDealFingerprint:trial.initialSourceDealFingerprint
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
    exactJapanesePrinted60sVerified:true,
    eventDateLegalityVerified:true,
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
  assert.deepEqual(built.bundle.evidenceManifest.map(x=>x.kind),MANIFEST);
  assert.equal(built.bundle.evidenceManifest.length,9);
  assert.equal(built.bundle.policyPanelReceipts.length,1);
  assert.equal(built.fieldStatus,'INCOMPLETE_FIELD');
  assert.equal(built.fullFieldPanelComplete,false);
  assert.equal(built.assessment.fixtureOnly,true);
  assert.equal(built.assessment.competitiveAdmission,false);
  assert.throws(()=>buildV3GameBundle({
    preDeal:{...input,...preDeal},trial,evidence:makeEvidence(),
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture),
    policyPanelReceipts:[],reviews:[]
  }),/fixture-only pre-deal artifacts/);
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

test('production pre-deal gate rejects fixture reviewers and backdated deal registration',()=>{
  const fixture=makePolicyFixture();
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

test('postgame builder rejects rank or physical-seat policy drift',()=>{
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

  const changedPreDeal={...common.preDeal,
    policyRegistrationSha256:policyHash(9999)};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDeal:changedPreDeal,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/persisted pre-deal artifact changed/);

  const changedArtifactDigest={...common.preDeal,
    preDealArtifactSha256:policyHash(9998)};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDeal:changedArtifactDigest,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/persisted pre-deal artifact changed/);

  const changedArtifactRef={...common.preDeal,
    preDealArtifactRef:'results/retroactive-or-uncommitted.json'};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDeal:changedArtifactRef,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/persisted pre-deal artifact changed/);

  const latePersistence={...preDealPersistenceReceipt,
    workflowRunStartedAt:trial.dealGeneratedAt};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDealPersistenceReceipt:latePersistence,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/workflow did not start after registration and before planned deal generation/);

  const wrongWorkflow={...dealGenerationReceipt,workflowRunId:'9876543210'};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,dealGenerationReceipt:wrongWorkflow,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/same server-timestamped workflow/);

  const wrongHead={...preDealPersistenceReceipt,workflowHeadSha:'c'.repeat(40)};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDealPersistenceReceipt:wrongHead,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/server-timestamped workflow run/);

  const wrongStep={...dealGenerationReceipt,stepName:'untrusted generation step'};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,dealGenerationReceipt:wrongStep,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/same server-timestamped workflow/);

  const earlyTime=new Date(Date.parse(preDeal.gameRegistration.dealGeneratedAt)-1000).toISOString();
  const earlyStep={...dealGenerationReceipt,stepStartedAt:earlyTime};
  const earlyTrial={...trial,dealGeneratedAt:earlyTime};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,trial:earlyTrial,dealGenerationReceipt:earlyStep,
    policyApplicationReceipt:makeReceipt(preDeal,earlyTrial,fixture)
  },fixture.reviewerRegistry),/did not start after preregistered time and workflow persistence/);

  const wrongDealFingerprint={...dealGenerationReceipt,
    sourceDealFingerprint:policyHash(8002)};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,dealGenerationReceipt:wrongDealFingerprint,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/server-timestamped generation step/);

  const wrongBlob={...dealGenerationReceipt,blobSha:'c'.repeat(40)};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,dealGenerationReceipt:wrongBlob,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/same server-timestamped workflow/);

  const wrongPersistenceTrial={...preDealPersistenceReceipt,trialId:'another-trial'};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,preDealPersistenceReceipt:wrongPersistenceTrial,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/server-timestamped workflow run/);

  const wrongRunnerRevision={...dealGenerationReceipt,runnerRevision:'d'.repeat(40)};
  assert.throws(()=>buildV3GameBundleFixture({
    ...common,dealGenerationReceipt:wrongRunnerRevision,
    policyApplicationReceipt:makeReceipt(preDeal,trial,fixture)
  },fixture.reviewerRegistry),/same server-timestamped workflow/);

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
  },retroFixture.reviewerRegistry),/pre-deal persistence receipt is missing or not bound/);
});
