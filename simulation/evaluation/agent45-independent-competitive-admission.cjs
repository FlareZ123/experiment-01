'use strict';

const {createPublicKey, verify} = require('node:crypto');
const {canonicalJson, evidenceBundleSha256} = require('./canonical-evidence-json.cjs');
const {evaluateBilateralCompetence} = require('./agent45-bilateral-competence-gate.cjs');
const {inspectMewTechnoCooldownBridge} =
  require('./agent45-mew-techno-cooldown-bridge.cjs');
const authorized = require('./agent45-authorized-reviewers.json');

const BUNDLE_SCHEMA = 'aichi-complete-game-bundle-v1';
const REVIEW_SCHEMA = 'aichi-independent-review-v1';
const RESULT_SCHEMA = 'aichi-competitive-admission-v1';
const ROLES = ['paper', 'clock', 'strategy'];
const MANIFEST = [
  'registration', 'original-printed-60', 'contender-printed-60',
  'full-physical-deal', 'accepted-native-root-ledger',
  'owner-payment-and-targets', 'paper-rules', 'clock-continuity',
  'policy-and-counterplay'
];

/**
 * Exact bytes signed by each independent reviewer. Use Node Ed25519
 * sign(null, reviewSigningBytes(review), privateKey) outside this module.
 * @param {object} review
 * @returns {Buffer}
 */
function reviewSigningBytes(review) {
  const {signatureBase64, ...signed} = review;
  return Buffer.from(REVIEW_SCHEMA + '\n' + canonicalJson(signed), 'utf8');
}

/** @param {object} bundle @returns {string[]} */
function bundleFailures(bundle) {
  const errors = [];
  if (bundle?.schema !== BUNDLE_SCHEMA || typeof bundle?.producerId !== 'string' ||
      !bundle.producerId || !bundle.trial || typeof bundle.trial !== 'object')
    errors.push('missing-complete-game-bundle');
  if (!Array.isArray(bundle?.evidenceManifest)) {
    errors.push('missing-evidence-manifest');
  } else {
    const names = bundle.evidenceManifest.map(x => x?.kind);
    if (names.length !== MANIFEST.length ||
        new Set(names).size !== MANIFEST.length ||
        MANIFEST.some(name => !names.includes(name)) ||
        bundle.evidenceManifest.some(x => typeof x?.ref !== 'string' || !x.ref ||
          !/^[0-9a-f]{64}$/.test(x?.sha256)))
      errors.push('incomplete-or-unhashed-evidence-manifest');
  }
  return errors;
}

/**
 * Structural + signature inspection. The trust registry MUST come from
 * a separate, code-reviewed operator authority, never from the producer.
 * @param {object} bundle
 * @param {object[]} reviews
 * @param {object} reviewerRegistry
 * @returns {object}
 */
function inspectAdmission(bundle, reviews, reviewerRegistry) {
  const failures = bundleFailures(bundle);
  let structural = null;
  let cooldown = null;
  let fullStructuralEligibility = false;
  if (bundle?.trial) {
    try {
      structural = evaluateBilateralCompetence(bundle.trial);
      cooldown = inspectMewTechnoCooldownBridge(bundle.trial);
      // A proven copied-Techno-Blast cooldown explains precisely one
      // mandatory source Pass between source attack and later re-attack.
      // No other provenance, policy, payment, clock, or rules veto can be
      // bypassed, and actual three-party signed review remains required.
      const onlyCooldownEpisodeGap =
        structural.failures.length === 1 &&
        structural.failures[0] === 'no-certified-source-reply-source-episode';
      fullStructuralEligibility = structural.structuralGatePassed ||
        (onlyCooldownEpisodeGap && cooldown.conditionallyCertified);
      if (!fullStructuralEligibility)
        failures.push('competence-or-paper-clock-structure-failed');
    } catch {
      failures.push('malformed-or-unverifiable-native-competence-trial');
    }
  }
  const digest = evidenceBundleSha256(bundle);
  if (bundle?.trial?.trialId && bundle.trial.trialId !== bundle?.trialId)
    failures.push('trial-identity-mismatch');
  const reviewed = [];
  const validReviewers = Array.isArray(reviewerRegistry?.reviewers) ? reviewerRegistry.reviewers : [];
  if (reviewerRegistry?.schema !== 'aichi-trusted-reviewers-v1' || validReviewers.length === 0)
    failures.push('external-review-unavailable');
  if (!Array.isArray(reviews)) failures.push('no-signed-review-packets');
  else {
    const usedIds = new Set();
    for (const role of ROLES) {
      const matching = reviews.filter(r => r?.role === role);
      if (matching.length !== 1) {
        failures.push('review-' + role + '-missing-or-duplicate');
        continue;
      }
      const r = matching[0];
      const configured = validReviewers.find(v => v.reviewerId === r.reviewerId &&
        Array.isArray(v.roles) && v.roles.includes(role));
      let signatureValid = false;
      if (configured && typeof configured.publicKeyPem === 'string' &&
          typeof r.signatureBase64 === 'string' &&
          /^[A-Za-z0-9+/]{86}==$/.test(r.signatureBase64)) {
        try {
          const publicKey = createPublicKey(configured.publicKeyPem);
          signatureValid = publicKey.asymmetricKeyType === 'ed25519' &&
            verify(null, reviewSigningBytes(r), publicKey,
              Buffer.from(r.signatureBase64, 'base64'));
        } catch { signatureValid = false; }
      }
      const outcome = structural?.conditionallyAdjudicatedPaperWinnerSeat;
      const valid = r.schema === REVIEW_SCHEMA && r.bundleSha256 === digest &&
        r.decision === 'approve' && r.paperWinnerSeat === outcome &&
        (outcome === 0 || outcome === 1) &&
        r.reviewerId !== bundle?.producerId && !usedIds.has(r.reviewerId) &&
        typeof r.reviewEvidenceRef === 'string' && !!r.reviewEvidenceRef &&
        /^[0-9a-f]{64}$/.test(r.reviewEvidenceSha256) && signatureValid;
      if (!valid) failures.push('review-' + role + '-unauthorized-or-contradictory');
      if (typeof r.reviewerId === 'string') usedIds.add(r.reviewerId);
      reviewed.push({role, reviewerId:r.reviewerId??null,valid});
    }
    if (reviews.length !== ROLES.length)
      failures.push('extra-or-duplicate-review-packets');
  }
  return {schema:RESULT_SCHEMA,bundleSha256:digest,trialId:bundle?.trialId??null,
    nativeStructuralGatePassed:structural?.structuralGatePassed===true,
    structuralFailureCodes:structural?.failures??null,
    structuralProgress:structural?{
      provenanceComplete:structural.provenanceComplete,
      samePolicy:structural.samePolicy,
      nativeTerminal:structural.nativeTerminal,
      certifiedMaterialRoots:structural.certifiedMaterialRoots,
      reciprocalEpisodeObserved:structural.reciprocalEpisodeObserved,
      officialClockStatus:structural.officialClockStatus
    }:null,
    cooldownBridgeConditional:cooldown?.conditionallyCertified===true,
    structuralEligibilityAfterReviewedCooldown:fullStructuralEligibility,
    conditionalPaperWinnerSeat:structural?.conditionallyAdjudicatedPaperWinnerSeat??null,
    verifiedReviewRoles:reviewed,failures:[...new Set(failures)],
    acceptanceReady:failures.length===0};
}

/**
 * Production reads pinned, code-reviewed trust. Without actual independent
 * registered reviewers, every game has competitiveAdmission false.
 * @param {object} bundle
 * @param {object[]} reviews
 * @returns {object}
 */
function evaluateCompetitiveAdmission(bundle, reviews) {
  if (bundle?.admissionContract === 'aichi-outcome-and-competitive-admission-v3') {
    return require('./2026-11/agent43-independent-outcome-competence-v3.cjs')
      .evaluateCompetitiveAdmissionV3(bundle,reviews);
  }
  if (bundle?.admissionContract === 'aichi-outcome-and-competitive-admission-v2') {
    return require('./2026-11/agent43-independent-outcome-competence-v2.cjs')
      .evaluateCompetitiveAdmissionV2(bundle,reviews);
  }
  const assessment=inspectAdmission(bundle,reviews,authorized);
  return {...assessment,competitiveAdmission:assessment.acceptanceReady,
    disposition:assessment.acceptanceReady?'independently-admitted':
      assessment.failures.includes('external-review-unavailable')?
        'external-review-unavailable':'rejected-or-pending-independent-review'};
}

/**
 * Synthetic reviewer-key injection for isolated unit tests only.
 * Its competitiveAdmission is always false and cannot be published.
 * @param {object} bundle
 * @param {object[]} reviews
 * @param {object} fixtureRegistry
 * @returns {object}
 */
function inspectFixtureReview(bundle,reviews,fixtureRegistry) {
  const result=inspectAdmission(bundle,reviews,fixtureRegistry);
  return {...result,competitiveAdmission:false,fixtureOnly:true};
}

module.exports={BUNDLE_SCHEMA,REVIEW_SCHEMA,RESULT_SCHEMA,MANIFEST,
  canonicalJson,evidenceBundleSha256,reviewSigningBytes,bundleFailures,
  evaluateCompetitiveAdmission,inspectFixtureReview};
