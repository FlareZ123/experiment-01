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
  policyAttestationSigningBytes,inspectPolicyPanelConsistency
} = require('../../simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs');

const trialId = 'v3-preregistered-untimed-game-001';
const sha = n => String(n).repeat(64);

function makeBundle({mode=UNTIMED,outcome='win',samePolicy=true,clockPath='none',eventStage='open-top32'}={}) {
  const roots=[{actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction'}];
  const registration={
    schema:'aichi-game-level-preregistration-v1',
    registrationRef:'results/aichi-2026/registrations/v3-game-001.json',
    trialId,mode,registeredBeforeDealGeneration:true,
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

function signReviews(bundle,{roles=['paper'],strategyAudit=null,reviewerIdOverrides={}}={}){
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
      timingMode:UNTIMED,untimedProtocolVerified:true,
      untimedProtocolPreDealVerified:true,
      untimedProtocolEvidenceRef:bundle.trial.registrationRef,
      untimedProtocolSha256:bundle.trial.preregistrationSha256,
      noTournamentTimerUsed:true,noOfficialEndCallObserved:true,
      noEventStageAdjudicationUsed:true,
      clockStatus:CLOCK_NOT_APPLICABLE,
      naturalTerminalVerified:true,
      naturalTerminalEvidenceRef:'paper/natural-terminal',
      timerBoundaryEvidenceRef:'paper/timer-boundary',
      exactJapanesePrinted60sVerified:true,eventDateLegalityVerified:true,
      initial120CardCustodyVerified:true,actualSeatsAndFirstPlayerVerified:true,
      printed60EvidenceRef:'paper/printed-sixties',
      initialPhysicalDealEvidenceRef:'paper/initial-120',
      seatAndFirstPlayerEvidenceRef:'paper/seats-first-player'
    });
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

function makePolicyBundle({mode=UNTIMED,unavailable=[23,25,28],candidateProducerId='candidate-policy-author',opponentProducerId='opponent-policy-author',rankProducerOverrides={}}={}) {
  const bundle = makeBundle({mode,samePolicy:false,clockPath:mode===EVENT?'no-call':'none'});
  const candidate = {
    deckSha256:sha(7),policySha256:policyHash(100),
    entryManifestSha256:policyHash(101),challengeSuiteSha256:policyHash(102),
    policyProducerId:candidateProducerId
  };
  const ranks = Array.from({length:32},(_,index)=>{
    const rank=index+1;
    if(unavailable.includes(rank)) return {
      rank,sourceStatus:'source-unavailable',deckSha256:null,policySha256:null,
      entryManifestSha256:null,challengeSuiteSha256:null,policyProducerId:null
    };
    return {
      rank,sourceStatus:'authenticated',
      deckSha256:rank===1?sha(6):policyHash(1000+rank),
      policySha256:policyHash(2000+rank),
      entryManifestSha256:policyHash(3000+rank),
      challengeSuiteSha256:policyHash(4000+rank),
      policyProducerId:rankProducerOverrides[rank]??opponentProducerId
    };
  });
  const constraints = {
    observationSurface:{ownerVisible:true,publicState:true},
    hiddenInformationBoundary:{forbidOpponentPrivateHand:true,forbidDeckOrder:true},
    decisionBudget:{maxNodes:128,deadlineMs:250},
    timeoutPolicy:{maxTimeouts:0,fallback:'safe-legal-action'},
    randomizationProtocol:{algorithm:'seeded-prng',seed:'frozen-panel-seed'},
    publicHistoryWindow:{scope:'full-match'},
    resourceAccounting:{energyZones:true,oncePerTurn:true}
  };
  const core = {
    schema:'aichi-policy-plan-core-v1',comparisonMode:'candidate-vs-field',
    candidate,opponentPolicyBundle:{
      schema:'aichi-opponent-policy-bundle-v1',ranks
    },constraints
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
  const receipt = {
    schema:'aichi-policy-application-receipt-v1',
    trialId:bundle.trialId,policyPlanSha256:planSha,
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
        const receipt={
          ...current,
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
  const receipt={...bundle.policyApplicationReceipt,...overrides,
    trialId:'additional-panel-trial'};
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


test('deck-aware V3 accepts distinct frozen policies and keeps the 29-rank field explicitly incomplete',()=>{
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

test('complete 29-rank receipt coverage still cannot complete the missing three-rank field',()=>{
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
  assert.equal(evaluateCompetitiveAdmissionV3(untimed,signed.reviews)
    .competitiveAdmission,false);
});
