'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync, sign} = require('node:crypto');
const {rootDigest} = require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {aichiClockProtocolSha256} = require('../../simulation/evaluation/agent45-aichi-clock-receipt.cjs');
const {BUNDLE_SCHEMA,REVIEW_SCHEMA,MANIFEST,canonicalJson,
  evidenceBundleSha256,reviewSigningBytes,evaluateCompetitiveAdmission,
  inspectFixtureReview} =
  require('../../simulation/evaluation/agent45-independent-competitive-admission.cjs');

const roots=[
  {actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction'},
  {actionOrdinal:1,turnBefore:5,playerSlot:1,action:'PlayCardAction'},
  {actionOrdinal:2,turnBefore:6,playerSlot:0,action:'PlayCardAction'}
];

/** @param {object} root @param {number} i @returns {object} */
function certificate(root,i) {
  const type=root.action==='AttackAction'?'damage-transition':'resource-transfer';
  return {rootOrdinal:i,actorSeat:root.playerSlot,action:root.action,
    selectedOptionId:'selected-'+i,realStoreAccepted:true,
    paperLegalityReviewed:true,paidResourcesVerified:true,
    targetsAndTransitionsVerified:true,ownerInformationOnly:true,
    independentReviewer:'trusted-field-reviewer',
    paperEvidenceRef:'rule-'+i,physicalReceiptRef:'payment-'+i,
    consequenceType:type,
    effectWitness:{type,sourceActionRootOrdinal:i,changedUnits:1,
      realNativeStateChange:true,paperRelevantTransition:true,costPaymentOnly:false,
      independentlyReviewed:true,beforeStateEvidenceRef:'before-'+i,
      afterStateEvidenceRef:'after-'+i,effectEvidenceRef:'effect-'+i},
    ownerOpportunityAudit:{actualRootOwnerView:true,
      exhaustivePaperAffordableScan:true,independentReview:true,
      evidenceRef:'opportunity-'+i,
      options:[{id:'selected-'+i,action:root.action,ownerVisible:true,
        paperAffordable:true,evidenceRef:'owner-'+i}]},
    linkedEarlierRootOrdinal:i>0?i-1:null,
    causalEvidenceRef:i>0?'causal-'+i:null};
}

/** @returns {object} */
function trialFor() {
  return {trialId:'synthetic-original-rank5-native-game',
    registrationRef:'registration/frozen-fixture',originalSourceSeat:0,
    candidateSeat:1,actualFirstPlayerSeat:1,
    sourcePhysicalDealSha256:'source-physical-fingerprint',
    fullPhysicalDealSha256:'two-sided-physical-fingerprint',
    vendorCommitSha:'pinned-vendor-sha',researchRevisionSha:'research-sha',
    hookRevisionSha:'hook-sha',originalPrinted60Sha256:'source-sixty-sha',
    candidatePrinted60Sha256:'contender-sixty-sha',
    policySha256BySeat:['shared-policy-sha','shared-policy-sha'],
    nativeFinished:true,nativeWinner:0,nativeEndReason:'natural-prize-win',
    finalPrizes:[0,2],engineError:false,rootCapReached:false,
    rootActionLedger:roots,rootActionLedgerSha256:rootDigest(roots),
    actionCertificates:roots.map(certificate),
    independentFullPaperRulesAudit:true,hiddenInformationAudit:true,
    eventStage:'open-top32',clockDisposition:'no-official-call',
    clockReceiptId:null,paperReceiptId:'paper/native-verified-claim',
    adjudicationProtocolSha:aichiClockProtocolSha256(),
    noCallClockPacket:{stage:'open-top32',officialEndCallObserved:false,
      elapsedSecondsAtNaturalTerminal:600,
      officialClockCoverageEvidenceRef:'clock/continuous-video',
      stageEvidenceRef:'event/top32-stage',
      paperTerminalEvidenceRef:'paper/native-verified-claim',
      independentReviewEvidenceRef:'review/clock-paper',
      noCallCoverageIndependentlyReviewed:true,
      paperStateIndependentlyReviewed:true,
      paperGameWinner:0,paperGameTie:false}};
}

/** @returns {object} */
function bundleFor() {
  return {schema:BUNDLE_SCHEMA,trialId:'synthetic-original-rank5-native-game',
    producerId:'Agent45-synthetic-test',trial:trialFor(),
    evidenceManifest:MANIFEST.map((kind,i)=>({kind,
      ref:'artifact/fixture/'+kind,
      sha256:i.toString(16).padStart(64,'0')}))};
}

/** @param {object} bundle @returns {{reviews:object[],trust:object}} */
function signReviews(bundle) {
  const registry={schema:'aichi-trusted-reviewers-v1',reviewers:[]};
  const reviews=[];
  for(const role of ['paper','clock','strategy']){
    const reviewerId='independent-'+role+'-reviewer';
    const {privateKey,publicKey}=generateKeyPairSync('ed25519');
    registry.reviewers.push({reviewerId,roles:[role],
      publicKeyPem:publicKey.export({type:'spki',format:'pem'})});
    const review={schema:REVIEW_SCHEMA,role,reviewerId,
      bundleSha256:evidenceBundleSha256(bundle),decision:'approve',
      paperWinnerSeat:0,reviewEvidenceRef:'independent-review/'+role,
      reviewEvidenceSha256:'a'.repeat(64)};
    review.signatureBase64=sign(null,reviewSigningBytes(review),privateKey)
      .toString('base64');
    reviews.push(review);
  }
  return {reviews,trust:registry};
}

/** @param {object} bundle @param {(signed:object)=>void} [change] */
function assess(bundle,change=()=>{}) {
  const signed=signReviews(bundle);
  change(signed);
  return inspectFixtureReview(bundle,signed.reviews,signed.trust);
}

test('three signed independent reviewers satisfy synthetic structure without real admission',()=>{
  const b=bundleFor();
  const fixture=assess(b);
  assert.equal(fixture.nativeStructuralGatePassed,true);
  assert.equal(fixture.acceptanceReady,true);
  assert.equal(fixture.competitiveAdmission,false);
  assert.equal(fixture.fixtureOnly,true);
  assert.equal(fixture.verifiedReviewRoles.length,3);
  const production=evaluateCompetitiveAdmission(b,[]);
  assert.equal(production.competitiveAdmission,false);
  assert.ok(production.failures.includes('external-review-unavailable'));
});
test('canonical evidence digest ignores JSON object insertion order',()=>{
  assert.equal(canonicalJson({x:1,z:{b:3,a:2}}),
    canonicalJson({z:{a:2,b:3},x:1}));
});
test('changing evidence after signing breaks all three reviewer signatures',()=>{
  const b=bundleFor(),s=signReviews(b);
  b.evidenceManifest[0].sha256='f'.repeat(64);
  assert.equal(inspectFixtureReview(b,s.reviews,s.trust).acceptanceReady,false);
});
test('unregistered keys never authorize paper-competitive admission',()=>{
  const b=bundleFor(),s=signReviews(b);s.trust.reviewers=[];
  assert.ok(inspectFixtureReview(b,s.reviews,s.trust).failures
    .includes('external-review-unavailable'));
});
test('forged signatures, identities, winners, and reviewer decisions fail',()=>{
  for(const change of [
    s=>{s.reviews[0].signatureBase64=s.reviews[1].signatureBase64;},
    s=>{s.reviews[0].reviewerId='unapproved-person';},
    s=>{s.reviews[0].paperWinnerSeat=1;},
    s=>{s.reviews[0].decision='reject';}
  ]){
    const result=assess(bundleFor(),change);
    assert.equal(result.acceptanceReady,false);
    assert.ok(result.failures.some(x=>x.startsWith('review-paper-')));
  }
});
test('self-review, duplicate reviewer, and absent strategy review all fail',()=>{
  const b=bundleFor();
  for(const change of [
    s=>{s.reviews[0].reviewerId=b.producerId;},
    s=>{s.reviews[2].reviewerId=s.reviews[1].reviewerId;},
    s=>{s.reviews.pop();}
  ])assert.equal(assess(b,change).acceptanceReady,false);
});
test('incomplete, unhashed and duplicate evidence manifest entries fail',()=>{
  for(const change of [
    b=>{b.evidenceManifest.pop();},
    b=>{b.evidenceManifest[0].sha256='not-a-sha';},
    b=>{b.evidenceManifest[0].kind=b.evidenceManifest[1].kind;}
  ]){
    const b=bundleFor();change(b);
    assert.ok(assess(b).failures.includes('incomplete-or-unhashed-evidence-manifest'));
  }
});
test('native action caps, paper winner conflicts and missing clock veto admission',()=>{
  for(const change of [
    b=>{b.trial.rootCapReached=true;},
    b=>{b.trial.noCallClockPacket.paperGameWinner=1;},
    b=>{b.trial.noCallClockPacket.noCallCoverageIndependentlyReviewed=false;}
  ]){
    const b=bundleFor();change(b);
    assert.equal(assess(b).nativeStructuralGatePassed,false);
  }
});
test('asymmetric actors, unpaid resources and missing source return fail',()=>{
  for(const change of [
    b=>{b.trial.policySha256BySeat[1]='asymmetric-policy';},
    b=>{b.trial.actionCertificates[1].paidResourcesVerified=false;},
    b=>{b.trial.actionCertificates.pop();}
  ]){
    const b=bundleFor();change(b);
    assert.equal(assess(b).nativeStructuralGatePassed,false);
  }
});
test('trial identity disagreement and extra signatures are rejected',()=>{
  const b=bundleFor();b.trialId='different-game';
  assert.ok(assess(b).failures.includes('trial-identity-mismatch'));
  assert.ok(assess(bundleFor(),s=>s.reviews.push({...s.reviews[0]}))
    .failures.includes('extra-or-duplicate-review-packets'));
});
