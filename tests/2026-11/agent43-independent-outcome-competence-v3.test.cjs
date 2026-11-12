'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync,sign} = require('node:crypto');
const {
  BUNDLE_SCHEMA,REVIEW_SCHEMA,MANIFEST,evidenceBundleSha256,reviewSigningBytes
} = require('../../simulation/evaluation/agent45-independent-competitive-admission.cjs');
const {rootDigest} =
  require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {aichiClockProtocolSha256} =
  require('../../simulation/evaluation/agent45-aichi-clock-receipt.cjs');
const {
  SCHEMA,UNTIMED,EVENT,CLOCK_NOT_APPLICABLE,
  inspectAdmissionV3,evaluateCompetitiveAdmissionV3
} = require('../../simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs');

const trialId = 'v3-preregistered-untimed-game-001';
const sha = n => String(n).repeat(64);

function makeBundle({mode=UNTIMED,outcome='win',samePolicy=true,clockPath='none'}={}) {
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
      eventStage:mode===EVENT?'open-top32':null
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
    eventStage:null,clockDisposition:CLOCK_NOT_APPLICABLE,
    clockReceiptId:null,paperReceiptId:null,adjudicationProtocolSha:null,
    noCallClockPacket:null,timeCallPacket:null,extensionLedgerPacket:null
  };
  if(mode===EVENT){
    trial.eventStage='open-top32';
    trial.paperReceiptId='paper/terminal';
    trial.adjudicationProtocolSha=aichiClockProtocolSha256();
    if(clockPath==='no-call'){
      trial.clockDisposition='no-official-call';
      trial.noCallClockPacket={
        stage:'open-top32',officialEndCallObserved:false,
        elapsedSecondsAtNaturalTerminal:600,
        officialClockCoverageEvidenceRef:'clock/continuous',
        stageEvidenceRef:'event/stage',
        paperTerminalEvidenceRef:'paper/terminal',
        independentReviewEvidenceRef:'review/clock',
        noCallCoverageIndependentlyReviewed:true,
        paperStateIndependentlyReviewed:true,
        paperGameWinner:0,paperGameTie:false
      };
    }else if(clockPath==='official-call'){
      trial.clockDisposition='official-call';
      trial.clockReceiptId='clock/official-call';
      trial.timeCallPacket={
        stage:'open-top32',officialEndCallObserved:true,
        officialClockEvidenceRef:'clock/official-call',
        elapsedSecondsAtOfficialCall:1500,
        stageEvidenceRef:'event/stage',firstPlayerSeat:0,
        firstPlayerEvidenceRef:'event/first-player',turnOwnerWhenCalled:1,
        turnOwnerWhenCalledEvidenceRef:'event/turn-owner',
        turnSequenceEvidenceRef:'event/turn-sequence',
        independentPaperStateEvidenceRef:'paper/terminal',
        paperStateIndependentlyReviewed:true,prizesRemaining:[4,4],
        paperGameWinner:0,paperGameTie:false
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

function signReviews(bundle,{roles=['paper'],strategyAudit=null}={}){
  const registry={schema:'aichi-trusted-reviewers-v1',reviewers:[]};
  const reviews=[];
  for(const role of roles){
    const reviewerId='test-reviewer-'+role;
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

test('untimed natural win needs paper review but no clock receipt or clock reviewer',()=>{
  const b=makeBundle(),r=inspect(b);
  assert.equal(r.schema,SCHEMA);
  assert.equal(r.timingMode,UNTIMED);
  assert.equal(r.clockStatus,CLOCK_NOT_APPLICABLE);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.equal(r.candidateOutcome,'loss');
  assert.equal(r.competitiveAdmission,false);
  assert.equal(r.fixtureOnly,true);
});

test('untimed natural tie remains a tie and is not clock-adjudicated',()=>{
  const b=makeBundle({outcome:'tie'}),r=inspect(b);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.naturalOutcome,'tie');
  assert.equal(r.candidateOutcome,'tie');
  assert.equal(r.clockStatus,CLOCK_NOT_APPLICABLE);
  assert.equal(r.competitiveAdmission,false);
});

test('untimed natural terminal can separately pass policy competence with signed strategy review',()=>{
  const b=makeBundle(),audit=terminalAudit();
  const r=inspect(b,['paper','strategy'],audit);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,true);
  assert.equal(r.acceptanceReady,true);
  assert.equal(r.competitiveAdmission,false);
});

test('missing or post-outcome preregistration cannot infer untimed mode from absent clock',()=>{
  const a=makeBundle();delete a.trial.preregistration;
  assert.equal(inspect(a).gameOutcomeAdmissionReady,false);
  const b=makeBundle();
  b.trial.preregistration.registeredAt='2026-11-12T01:02:00.000Z';
  b.trial.preregistrationSha256=evidenceBundleSha256(b.trial.preregistration);
  b.evidenceManifest.find(x=>x.kind==='registration').sha256=b.trial.preregistrationSha256;
  assert.equal(inspect(b).gameOutcomeAdmissionReady,false);
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

test('policy asymmetry leaves factual outcome admissible but blocks comparative competence',()=>{
  const b=makeBundle({samePolicy:false}),r=inspect(b);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.ok(r.failures.includes('policy-asymmetry-or-unverified-for-competitive'));
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

test('wrong event stage and empty production trust registry fail closed',()=>{
  const b=makeBundle({mode:EVENT,clockPath:'no-call'});
  b.trial.eventStage='open-final';
  assert.equal(inspect(b).gameOutcomeAdmissionReady,false);
  const untimed=makeBundle();
  const signed=signReviews(untimed);
  assert.equal(evaluateCompetitiveAdmissionV3(untimed,signed.reviews)
    .competitiveAdmission,false);
});
