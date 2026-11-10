'use strict';

/**
 * Versioned independent game-outcome / competitive-policy admission contract.
 * This is a signed-evidence gate, not a paper-rules oracle. It intentionally
 * preserves the original three-turn screen as an optional competence witness.
 * No fixture registry can turn a synthetic game into a production admission.
 */

const {inspectFixtureReview} = require('../agent45-independent-competitive-admission.cjs');
const {evaluateBilateralCompetence} = require('../agent45-bilateral-competence-gate.cjs');
const authorized = require('../agent45-authorized-reviewers.json');

const SCHEMA = 'aichi-outcome-and-competitive-admission-v2';
const MATERIAL = new Set([
  'AttackAction', 'PlayCardAction', 'RetreatAction', 'UseAbilityAction',
  'UseTrainerAbilityAction', 'UseEnergyAbilityAction', 'UseStadiumAction'
]);
const ACCEPTED_DISPOSITIONS = new Set([
  'certified-reciprocal', 'verified-terminal-before-reply',
  'independently-reviewed-suppression'
]);

/** @param {unknown} value @returns {boolean} */
function nonempty(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Require a separately reviewed paper/owner/payment/zone receipt for every
 * physical root, including Pass and prompts. A material-action payoff
 * certificate is insufficient to review a no-op or a valid non-payoff root.
 * @param {object} trial
 * @returns {boolean}
 */
function completeRootPaperAudit(trial) {
  const roots = trial?.rootActionLedger;
  const receipts = trial?.fullRootPaperReceipts;
  return Array.isArray(roots) && roots.length > 0 &&
    Array.isArray(receipts) && roots.length === receipts.length &&
    roots.every((root, i) => {
      const receipt = receipts[i];
      return receipt?.rootOrdinal === i &&
        receipt.actorSeat === root.playerSlot &&
        receipt.action === root.action &&
        receipt.paperLegalityReviewed === true &&
        receipt.paymentsVerified === true &&
        receipt.targetsAndTransitionsVerified === true &&
        receipt.ownerInformationOnly === true &&
        receipt.physicalCustodyVerified === true &&
        receipt.independentlyReviewed === true &&
        nonempty(receipt.independentReviewerId) &&
        nonempty(receipt.evidenceRef);
    }) &&
    (!Array.isArray(trial.actionCertificates) ||
      trial.actionCertificates.every(cert => {
        const root = roots[cert.rootOrdinal];
        return root && (!MATERIAL.has(root.action) ||
          (cert.action === root.action &&
           cert.actorSeat === root.playerSlot &&
           cert.paperLegalityReviewed === true &&
           cert.paidResourcesVerified === true &&
           cert.targetsAndTransitionsVerified === true &&
           cert.ownerInformationOnly === true));
      }));
}

/**
 * Verify that a paper-valid terminal prevented a following turn, rather than
 * treating an ordinary Pass as no counterplay. Review evidence is included in
 * the immutable signed bundle and cross-referenced by the strategy signature.
 * @param {object} trial
 * @param {object} audit
 * @returns {boolean}
 */
function verifiedTerminalBeforeReply(trial, audit) {
  const roots = trial.rootActionLedger;
  const ordinal = audit.terminalRootOrdinal;
  const terminal = Number.isSafeInteger(ordinal) ? roots[ordinal] : null;
  return trial.nativeFinished === true &&
    (trial.nativeWinner === 0 || trial.nativeWinner === 1) &&
    terminal?.actionOrdinal === ordinal &&
    (terminal.playerSlot === 0 || terminal.playerSlot === 1) &&
    roots.slice(ordinal + 1).every(r => r.turnBefore === terminal.turnBefore) &&
    audit.noFurtherPlayerTurnOccurred === true &&
    audit.paperTerminalCausalityReviewed === true &&
    nonempty(audit.physicalTerminalEvidenceRef);
}

/**
 * Verify actual opponent-turn Pass roots and independent complete owner-visible
 * counterplay audits. A lock keyword alone proves nothing about affordability.
 * @param {object} trial
 * @param {object} audit
 * @returns {boolean}
 */
function independentlyReviewedSuppression(trial, audit) {
  return Array.isArray(audit.lockedTurns) && audit.lockedTurns.length > 0 &&
    audit.lockedTurns.every(item => {
      const root = trial.rootActionLedger?.[item.passRootOrdinal];
      return root?.actionOrdinal === item.passRootOrdinal &&
        root.action === 'PassTurnAction' &&
        root.playerSlot === item.opponentSeat &&
        root.turnBefore === item.turnBefore &&
        (audit.lockControllerSeat===0 || audit.lockControllerSeat===1) &&
        item.opponentSeat === 1 - audit.lockControllerSeat;
    }) &&
    audit.lockedTurns.every(item =>
      item.paperLockActiveReviewed === true &&
      item.exhaustiveOwnerAffordableScanReviewed === true &&
      item.noMateriallyEffectiveAffordableResponse === true &&
      item.physicalLockCustodyReviewed === true &&
      nonempty(item.legalAlternativesEvidenceRef) &&
      nonempty(item.lockEffectEvidenceRef));
}

/**
 * The strategy reviewer must sign a disposition and an independently
 * reproducible challenge/audit reference. The trial-level audit is bound by
 * the bundle digest, so neither may be changed after signatures are issued.
 * @param {object} trial
 * @param {object|undefined} review
 * @param {object} structural
 * @param {object} baseline
 * @returns {{disposition:string,valid:boolean,reason:string}}
 */
function inspectResponseOpportunity(trial, review, structural, baseline) {
  const audit = trial?.responseOpportunityAudit;
  const disposition = review?.responseOpportunityDisposition ?? 'undetermined';
  const strategySigned = baseline.verifiedReviewRoles?.some(x =>
    x.role === 'strategy' && x.valid === true);
  if (!strategySigned || !ACCEPTED_DISPOSITIONS.has(disposition) ||
      audit?.disposition !== disposition ||
      !nonempty(audit.evidenceRef) ||
      audit.evidenceRef !== review?.responseOpportunityEvidenceRef ||
      !nonempty(review.policyChallengeEvidenceRef) ||
      !nonempty(review.ownerCounterplayReviewEvidenceRef) ||
      audit.independentlyReviewed !== true ||
      audit.completeGameOwnerOpportunityReview !== true)
    return {disposition,valid:false,reason:'unreviewed-or-unsigned-opportunity'};

  if (disposition === 'certified-reciprocal')
    return {disposition,valid:structural.reciprocalEpisodeObserved === true ||
      baseline.cooldownBridgeConditional === true,
    reason:'certified-reciprocal-or-printed-cooldown'};
  if (disposition === 'verified-terminal-before-reply')
    return {disposition,valid:verifiedTerminalBeforeReply(trial,audit),
      reason:'paper-terminal-causality'};
  return {disposition,valid:independentlyReviewedSuppression(trial,audit),
    reason:'independent-lock-and-affordable-option-scan'};
}

/**
 * Signed reviews for the paper and clock roles establish game-outcome
 * admissibility, separately from policy competence. The original v1 checker
 * still verifies all Ed25519 signatures and immutable bundle SHA.
 * @param {object} bundle
 * @param {object[]} reviews
 * @param {object} reviewerRegistry
 * @returns {object}
 */
function inspectAdmissionV2(bundle,reviews,reviewerRegistry) {
  const baseline = inspectFixtureReview(bundle,reviews,reviewerRegistry);
  let structural = null;
  try {
    if (bundle?.trial) structural = evaluateBilateralCompetence(bundle.trial);
  } catch {
    // Baseline already reports invalid ledger/certificates as an error.
  }
  // A game's independently reviewed paper outcome does not depend on whether
  // both automated players used an identical decision policy. The latter is
  // a separate, mandatory competitive-comparison qualification.
  const outcomeStructuralFailures = structural?.failures.filter(x =>
    x !== 'no-certified-source-reply-source-episode' &&
    x !== 'policy-asymmetry-or-unverified') ?? ['unverifiable-native-trial'];
  const roles = baseline.verifiedReviewRoles ?? [];
  const paperAndClockReviewed = ['paper','clock'].every(role =>
    roles.some(item => item.role===role && item.valid===true));
  const submitted = Array.isArray(reviews) ? reviews : [];
  const acceptableReviewShape = submitted.length === 2 || submitted.length === 3;
  const seen = submitted.map(x=>x?.role);
  const uniqueReviewRoles = new Set(seen).size === seen.length &&
    seen.every(x => x === 'paper' || x === 'clock' || x === 'strategy');
  const admissibleOldErrors = new Set([
    'competence-or-paper-clock-structure-failed',
    'review-strategy-missing-or-duplicate',
    'review-strategy-unauthorized-or-contradictory',
    'extra-or-duplicate-review-packets'
  ]);
  const otherBaselineFailures = baseline.failures.filter(code =>
    !admissibleOldErrors.has(code));
  const fullRootPaperAudit = completeRootPaperAudit(bundle?.trial);
  const gameOutcomeAdmissionReady = outcomeStructuralFailures.length === 0 &&
    paperAndClockReviewed && acceptableReviewShape && uniqueReviewRoles &&
    otherBaselineFailures.length === 0 && fullRootPaperAudit;
  const strategyReview = submitted.find(x => x?.role === 'strategy');
  const opportunity = inspectResponseOpportunity(
    bundle?.trial, strategyReview, structural??{}, baseline);
  const competitivePolicyCompetenceReady = gameOutcomeAdmissionReady &&
    structural?.samePolicy === true && opportunity.valid &&
    roles.some(x => x.role==='strategy' && x.valid===true);
  const failures = [];
  if (outcomeStructuralFailures.length) failures.push(...outcomeStructuralFailures);
  if (!fullRootPaperAudit) failures.push('missing-complete-root-paper-receipts');
  if (!paperAndClockReviewed) failures.push('independent-paper-or-clock-review-missing');
  if (!acceptableReviewShape || !uniqueReviewRoles)
    failures.push('malformed-review-role-composition');
  failures.push(...otherBaselineFailures);
  if (structural?.samePolicy !== true)
    failures.push('policy-asymmetry-or-unverified-for-competitive');
  if (!competitivePolicyCompetenceReady)
    failures.push('independent-policy-competence-unproven');
  return {
    schema:SCHEMA,bundleSha256:baseline.bundleSha256,
    trialId:baseline.trialId,
    gameOutcomeAdmissionReady,
    competitivePolicyCompetenceReady,
    reciprocalEpisodeObserved:structural?.reciprocalEpisodeObserved??false,
    responseOpportunityDisposition:opportunity.disposition,
    responseOpportunityVerified:opportunity.valid,
    responseOpportunityEvidenceStatus:opportunity.reason,
    completeRootPaperReceiptsVerified:fullRootPaperAudit,
    signedReviewRoles:roles,
    outcomeStructuralFailures,
    failures:[...new Set(failures)],
    acceptanceReady:gameOutcomeAdmissionReady && competitivePolicyCompetenceReady,
    fixtureOnly:true,
    competitiveAdmission:false
  };
}

/** @param {object} bundle @param {object[]} reviews @returns {object} */
function evaluateCompetitiveAdmissionV2(bundle,reviews) {
  const assessment = inspectAdmissionV2(bundle,reviews,authorized);
  return {...assessment,fixtureOnly:false,
    competitiveAdmission:assessment.acceptanceReady,
    disposition:assessment.acceptanceReady?'independently-admitted-v2':
      'unqualified-or-pending-evidence'};
}

module.exports={SCHEMA,completeRootPaperAudit,verifiedTerminalBeforeReply,
  independentlyReviewedSuppression,inspectResponseOpportunity,
  inspectAdmissionV2,evaluateCompetitiveAdmissionV2};
