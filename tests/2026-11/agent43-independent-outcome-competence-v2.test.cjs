'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync,sign} = require('node:crypto');
const {rootDigest} =
  require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {aichiClockProtocolSha256} =
  require('../../simulation/evaluation/agent45-aichi-clock-receipt.cjs');
const {BUNDLE_SCHEMA,REVIEW_SCHEMA,MANIFEST,evidenceBundleSha256,reviewSigningBytes} =
  require('../../simulation/evaluation/agent45-independent-competitive-admission.cjs');
const {SCHEMA,inspectAdmissionV2,evaluateCompetitiveAdmissionV2} =
  require('../../simulation/evaluation/2026-11/agent43-independent-outcome-competence-v2.cjs');

const attack = (ordinal,turnBefore,playerSlot) =>
  ({actionOrdinal:ordinal,turnBefore,playerSlot,action:'AttackAction'});
const pass = (ordinal,turnBefore,playerSlot) =>
  ({actionOrdinal:ordinal,turnBefore,playerSlot,action:'PassTurnAction'});

/** @param {object} r @returns {object} */
function materialCertificate(r) {
  const i=r.actionOrdinal;
  return {rootOrdinal:i,actorSeat:r.playerSlot,action:r.action,
    selectedOptionId:'choice'+i,realStoreAccepted:true,
    paperLegalityReviewed:true,paidResourcesVerified:true,
    targetsAndTransitionsVerified:true,ownerInformationOnly:true,
    independentReviewer:'external-paper-reviewer',
    paperEvidenceRef:'paper'+i,physicalReceiptRef:'custody'+i,
    consequenceType:'damage-transition',
    effectWitness:{type:'damage-transition',sourceActionRootOrdinal:i,
      changedUnits:10,realNativeStateChange:true,paperRelevantTransition:true,
      costPaymentOnly:false,independentlyReviewed:true,
      beforeStateEvidenceRef:'before'+i,afterStateEvidenceRef:'after'+i,
      effectEvidenceRef:'damage'+i},
    ownerOpportunityAudit:{actualRootOwnerView:true,
      exhaustivePaperAffordableScan:true,independentReview:true,
      evidenceRef:'owner'+i,options:[{id:'choice'+i,action:r.action,
        ownerVisible:true,paperAffordable:true,evidenceRef:'option'+i}]}};
}

/** @param {object[]} roots @returns {object} */
function makeBundle(roots) {
  const trial={
    trialId:'predeclared-synthetic-full-paper-game',registrationRef:'reg/test',
    originalSourceSeat:0,candidateSeat:1,actualFirstPlayerSeat:0,
    sourcePhysicalDealSha256:'source-fingerprint',
    fullPhysicalDealSha256:'both-fingerprint',
    vendorCommitSha:'pinned-vendor',researchRevisionSha:'research-revision',
    hookRevisionSha:'hook-revision',
    originalPrinted60Sha256:'source-printed-60',
    candidatePrinted60Sha256:'contender-printed-60',
    policySha256BySeat:['one-shared-policy','one-shared-policy'],
    nativeFinished:true,nativeWinner:0,nativeEndReason:'natural-prize-win',
    finalPrizes:[0,6],engineError:false,rootCapReached:false,
    rootActionLedger:roots,rootActionLedgerSha256:rootDigest(roots),
    actionCertificates:roots.filter(r=>r.action==='AttackAction').map(materialCertificate),
    fullRootPaperReceipts:roots.map(r=>({
      rootOrdinal:r.actionOrdinal,actorSeat:r.playerSlot,action:r.action,
      paperLegalityReviewed:true,paymentsVerified:true,
      targetsAndTransitionsVerified:true,ownerInformationOnly:true,
      physicalCustodyVerified:true,independentlyReviewed:true,
      independentReviewerId:'external-paper-reviewer',
      evidenceRef:'physical/complete-root-'+r.actionOrdinal
    })),
    independentFullPaperRulesAudit:true,hiddenInformationAudit:true,
    eventStage:'open-top32',clockDisposition:'no-official-call',
    clockReceiptId:null,paperReceiptId:'paper/terminal',
    adjudicationProtocolSha:aichiClockProtocolSha256(),
    noCallClockPacket:{stage:'open-top32',officialEndCallObserved:false,
      elapsedSecondsAtNaturalTerminal:390,
      officialClockCoverageEvidenceRef:'clock/uninterrupted',
      stageEvidenceRef:'event/top32',paperTerminalEvidenceRef:'paper/terminal',
      independentReviewEvidenceRef:'clock-external-review',
      noCallCoverageIndependentlyReviewed:true,
      paperStateIndependentlyReviewed:true,
      paperGameWinner:0,paperGameTie:false}
  };
  return {schema:BUNDLE_SCHEMA,trialId:trial.trialId,
    producerId:'synthetic-producer',trial,
    evidenceManifest:MANIFEST.map((kind,i)=>({
      kind,ref:'synth/'+kind,sha256:i.toString(16).padStart(64,'0')
    }))};
}

/**
 * Test keys exist only in this SFT and are deliberately not production keys.
 * Each signature binds every trial audit and receipt into the bundle digest.
 * @param {object} bundle
 * @param {object} [opportunity]
 * @param {string[]} [reviewRoles]
 * @returns {{reviews:object[],registry:object}}
 */
function signFixture(bundle,opportunity,reviewRoles=['paper','clock','strategy']) {
  const registry={schema:'aichi-trusted-reviewers-v1',reviewers:[]};
  const reviews=[];
  for(const role of reviewRoles) {
    const reviewerId='test-independent-'+role;
    const {privateKey,publicKey}=generateKeyPairSync('ed25519');
    registry.reviewers.push({reviewerId,roles:[role],
      publicKeyPem:publicKey.export({type:'spki',format:'pem'})});
    const review={schema:REVIEW_SCHEMA,role,reviewerId,
      bundleSha256:evidenceBundleSha256(bundle),decision:'approve',
      paperWinnerSeat:0,reviewEvidenceRef:'independent/'+role,
      reviewEvidenceSha256:'a'.repeat(64)};
    if(role==='strategy'&&opportunity) Object.assign(review,{
      responseOpportunityDisposition:opportunity.disposition,
      responseOpportunityEvidenceRef:opportunity.evidenceRef,
      policyChallengeEvidenceRef:'adversarial-policy-challenge/reviewed',
      ownerCounterplayReviewEvidenceRef:'owner-alternatives/reviewed'
    });
    review.signatureBase64=sign(null,reviewSigningBytes(review),privateKey)
      .toString('base64');
    reviews.push(review);
  }
  return {reviews,registry};
}

/** @param {object} bundle @param {object} [audit] @param {string[]} [roles] */
function inspect(bundle,audit,roles) {
  if(audit) bundle.trial.responseOpportunityAudit=audit;
  const signed=signFixture(bundle,audit,roles);
  return inspectAdmissionV2(bundle,signed.reviews,signed.registry);
}

/** @returns {object} */
function earlyTerminalAudit() {
  return {disposition:'verified-terminal-before-reply',
    evidenceRef:'independent/terminal-before-next-turn',
    independentlyReviewed:true,completeGameOwnerOpportunityReview:true,
    terminalRootOrdinal:0,noFurtherPlayerTurnOccurred:true,
    paperTerminalCausalityReviewed:true,
    physicalTerminalEvidenceRef:'physical/last-prize-and-no-next-turn'};
}

/** @returns {object} */
function suppressionAudit() {
  return {disposition:'independently-reviewed-suppression',
    evidenceRef:'independent/exhaustive-lock-opportunities',
    independentlyReviewed:true,completeGameOwnerOpportunityReview:true,
    lockControllerSeat:0,lockedTurns:[{
      passRootOrdinal:1,turnBefore:5,opponentSeat:1,
      paperLockActiveReviewed:true,
      exhaustiveOwnerAffordableScanReviewed:true,
      noMateriallyEffectiveAffordableResponse:true,
      physicalLockCustodyReviewed:true,
      legalAlternativesEvidenceRef:'paper/owner-turn5-options',
      lockEffectEvidenceRef:'paper/lock-turn5'
    }]};
}

const singleAttack=()=>makeBundle([attack(0,4,0)]);
const lockGame=()=>makeBundle([
  attack(0,4,0),pass(1,5,1),attack(2,6,0)]);

test('paper terminal admitted as game outcome without mandatory three-turn episode',()=>{
  const b=singleAttack(),r=inspect(b,earlyTerminalAudit());
  assert.equal(r.schema,SCHEMA);
  assert.equal(r.reciprocalEpisodeObserved,false);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,true);
  assert.equal(r.acceptanceReady,true);
  assert.equal(r.competitiveAdmission,false);
  assert.equal(r.fixtureOnly,true);
});

test('paper/clock outcome can be independently reviewed with no strategy signature',()=>{
  const b=singleAttack(),r=inspect(b,undefined,['paper','clock']);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.equal(r.acceptanceReady,false);
});

test('paper-reviewed complete lock suppresses affordable opponent options, not outcome',()=>{
  const r=inspect(lockGame(),suppressionAudit());
  assert.equal(r.reciprocalEpisodeObserved,false);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,true);
  assert.equal(r.responseOpportunityDisposition,'independently-reviewed-suppression');
});

test('an affordable material opponent reply passed remains unqualified for competence',()=>{
  const b=lockGame(),a=suppressionAudit();
  a.disposition='affordable-response-passed';
  const r=inspect(b,a);
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
  assert.equal(r.competitiveAdmission,false);
});

test('no signed disposition or no policy challenge can bypass the competence gate',()=>{
  const b=singleAttack(),a=earlyTerminalAudit();
  b.trial.responseOpportunityAudit=a;
  const signed=signFixture(b);
  assert.equal(inspectAdmissionV2(b,signed.reviews,signed.registry)
    .competitivePolicyCompetenceReady,false);
  const r=inspect(b,{...a,completeGameOwnerOpportunityReview:false});
  assert.equal(r.competitivePolicyCompetenceReady,false);
});

test('missing, duplicate or misbound physical root receipts block game-outcome admission',()=>{
  for(const mutate of [
    b=>{b.trial.fullRootPaperReceipts=[];},
    b=>{b.trial.fullRootPaperReceipts[0].rootOrdinal=1;},
    b=>{b.trial.fullRootPaperReceipts[0].paymentsVerified=false;},
    b=>{b.trial.fullRootPaperReceipts[0].physicalCustodyVerified=false;},
    b=>{b.trial.actionCertificates[0].paidResourcesVerified=false;}
  ]) {
    const b=singleAttack();mutate(b);
    const r=inspect(b,earlyTerminalAudit());
    assert.equal(r.gameOutcomeAdmissionReady,false);
    assert.ok(r.failures.includes('missing-complete-root-paper-receipts'));
  }
});

test('clock, printed identity and two-seat shared policy remain outcome vetoes',()=>{
  for(const mutate of [
    b=>{b.trial.noCallClockPacket.noCallCoverageIndependentlyReviewed=false;},
    b=>{b.trial.originalPrinted60Sha256='';},
    b=>{b.trial.policySha256BySeat[1]='weakened-opponent';},
    b=>{b.trial.rootCapReached=true;}
  ]){
    const b=singleAttack();mutate(b);
    assert.equal(inspect(b,earlyTerminalAudit()).gameOutcomeAdmissionReady,false);
  }
});

test('signed but false lock audit and unobserved opponent Pass cannot qualify',()=>{
  for(const mutate of [
    a=>{a.lockedTurns[0].noMateriallyEffectiveAffordableResponse=false;},
    a=>{a.lockedTurns[0].paperLockActiveReviewed=false;},
    a=>{a.lockedTurns[0].passRootOrdinal=0;},
    a=>{a.lockControllerSeat=1;},
    a=>{a.lockedTurns[0].legalAlternativesEvidenceRef='';}
  ]){
    const b=lockGame(),a=suppressionAudit();mutate(a);
    const r=inspect(b,a);
    assert.equal(r.gameOutcomeAdmissionReady,true);
    assert.equal(r.competitivePolicyCompetenceReady,false);
  }
});

test('winning root followed by a subsequent opponent turn is not terminal-before-reply',()=>{
  const b=makeBundle([attack(0,4,0),pass(1,5,1)]);
  const r=inspect(b,earlyTerminalAudit());
  assert.equal(r.gameOutcomeAdmissionReady,true);
  assert.equal(r.competitivePolicyCompetenceReady,false);
});

test('tampering after signatures or an empty production trust registry never admits',()=>{
  const b=singleAttack(),a=earlyTerminalAudit();
  b.trial.responseOpportunityAudit=a;
  const s=signFixture(b,a);
  b.trial.fullRootPaperReceipts[0].paymentsVerified=false;
  assert.equal(inspectAdmissionV2(b,s.reviews,s.registry).gameOutcomeAdmissionReady,false);
  const production=evaluateCompetitiveAdmissionV2(singleAttack(),[]);
  assert.equal(production.competitiveAdmission,false);
  assert.equal(production.acceptanceReady,false);
});
