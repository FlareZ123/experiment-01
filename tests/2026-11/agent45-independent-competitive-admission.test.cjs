'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync, sign} = require('node:crypto');
const {rootDigest} = require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {aichiClockProtocolSha256} = require('../../simulation/evaluation/agent45-aichi-clock-receipt.cjs');
const {EXPECTED_EFFECT,inspectMewTechnoCooldownBridge}=
  require('../../simulation/evaluation/agent45-mew-techno-cooldown-bridge.cjs');
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


/** @returns {object} Certified synthetic Mew/Genesect source cooldown fixture. */
function cooldownBundle(){
  const b=bundleFor();
  const tape=[
    {actionOrdinal:0,turnBefore:14,playerSlot:0,
      action:'AttackAction',attack:'Cross Fusion Strike'},
    {actionOrdinal:1,turnBefore:14,playerSlot:0,
      action:'ResolvePromptAction',pendingPrompt:'ChooseAttackPrompt',
      initiatingRootActionOrdinal:0,attackChoice:{
        printing:'Genesect V FST',attackName:'Techno Blast'}},
    {actionOrdinal:2,turnBefore:15,playerSlot:0,
      action:'ResolvePromptAction',pendingPrompt:'WaitPrompt',
      initiatingRootActionOrdinal:0},
    {actionOrdinal:3,turnBefore:15,playerSlot:1,
      action:'PlayCardAction',card:'Unown'},
    {actionOrdinal:4,turnBefore:15,playerSlot:1,
      action:'PassTurnAction'},
    {actionOrdinal:5,turnBefore:16,playerSlot:0,
      action:'PassTurnAction'},
    {actionOrdinal:6,turnBefore:17,playerSlot:1,
      action:'PassTurnAction'},
    {actionOrdinal:7,turnBefore:18,playerSlot:0,
      action:'AttackAction',attack:'Cross Fusion Strike'}
  ];
  b.trial.rootActionLedger=tape;
  b.trial.rootActionLedgerSha256=rootDigest(tape);
  const source=certificate(tape[0],0);
  const reply=certificate(tape[3],3);
  reply.linkedEarlierRootOrdinal=0;
  reply.causalEvidenceRef='reviewed-t14-to-t15-response';
  const returned=certificate(tape[7],7);
  returned.linkedEarlierRootOrdinal=3;
  returned.causalEvidenceRef='reviewed-t15-reply-to-t18-return';
  b.trial.actionCertificates=[source,reply,returned];
  b.trial.cooldownCertificates=[{
    rule:'Mew-Genesect-Techno-Blast-next-turn-no-attack',
    sourceAttackOrdinal:0,copiedAttackPromptOrdinal:1,
    opponentReplyOrdinal:3,cooldownPassOrdinal:5,
    sourceReturnOrdinal:7,settlementCompletionOrdinal:2,
    technoBlastPrintedEffect:EXPECTED_EFFECT,
    copyingRuleSections:['C-18','C-15','E-02'],
    actualActivePokemonPrinting:'Mew VMAX FST',
    samePhysicalActiveThroughCooldown:true,
    paperAttackEffectReviewed:true,nativeSettlementChainReviewed:true,
    ownerAlternativesIndependentlyReviewed:true,
    otherMaterialLinesReviewed:true,
    continuationAttackPaperPaidReviewed:true,
    officialPrintedCardEvidenceRef:'cards/en/swsh8.json#swsh8-185',
    paperCopyRuleEvidenceRef:'rulebook/C-18+C-15+E-02',
    physicalActiveIdentityEvidenceRef:'archive/active-t14-to-t16',
    sourcePassOpportunityEvidenceRef:'owner/pass-t16-all-options',
    actualAttackSettlementEvidenceRef:'archive/t14-copy-and-t18-return',
    independentReviewer:'independent-paper-reviewer'
  }];
  return b;
}

test('copied Techno Blast can bridge exactly one signed-reviewed cooldown Pass',()=>{
  const b=cooldownBundle();
  const normal=require('../../simulation/evaluation/agent45-bilateral-competence-gate.cjs')
    .evaluateBilateralCompetence(b.trial);
  assert.deepEqual(normal.failures,['no-certified-source-reply-source-episode']);
  const bridge=inspectMewTechnoCooldownBridge(b.trial);
  assert.equal(bridge.conditionallyCertified,true);
  assert.deepEqual(bridge.episode.turns,[14,15,16,18]);
  const synthetic=assess(b);
  assert.equal(synthetic.nativeStructuralGatePassed,false);
  assert.equal(synthetic.cooldownBridgeConditional,true);
  assert.equal(synthetic.structuralEligibilityAfterReviewedCooldown,true);
  assert.equal(synthetic.acceptanceReady,true);
  assert.equal(synthetic.competitiveAdmission,false);
  assert.equal(evaluateCompetitiveAdmission(b,[]).competitiveAdmission,false);
});

test('unreviewed cooldown and wrong copied attack never become a free Pass',()=>{
  for(const change of [
    b=>{b.trial.cooldownCertificates[0].otherMaterialLinesReviewed=false;},
    b=>{b.trial.cooldownCertificates[0].technoBlastPrintedEffect='';},
    b=>{b.trial.rootActionLedger[1].attackChoice.printing='Wrong donor';},
    b=>{b.trial.cooldownCertificates[0].copyingRuleSections=['C-18'];},
    b=>{b.trial.actionCertificates[2].paidResourcesVerified=false;},
    b=>{b.trial.rootActionLedger[5].action='AttackAction';}
  ]){
    const b=cooldownBundle();
    change(b);
    b.trial.rootActionLedgerSha256=rootDigest(b.trial.rootActionLedger);
    assert.equal(inspectMewTechnoCooldownBridge(b.trial).conditionallyCertified,false);
    assert.equal(assess(b).acceptanceReady,false);
  }
});

test('even a correctly witnessed cooldown cannot bypass missing clock or paper',()=>{
  for(const change of [
    b=>{b.trial.hiddenInformationAudit=false;},
    b=>{b.trial.noCallClockPacket.noCallCoverageIndependentlyReviewed=false;},
    b=>{b.trial.policySha256BySeat[1]='different';},
    b=>{b.trial.rootCapReached=true;}
  ]){
    const b=cooldownBundle();change(b);
    assert.equal(inspectMewTechnoCooldownBridge(b.trial).conditionallyCertified,true);
    assert.equal(assess(b).acceptanceReady,false);
  }
});


test('V2 release builder rejects legacy V1 intake instead of synthesizing a release envelope',()=>{
  const {build}=require('../../simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs');
  const legacyV1={schema:'agent44-first-independent-original-source-case-intake-v1'};
  assert.throws(()=>build(legacyV1),
    /Only the prospective Agent44 V2 intake is accepted/);
});
