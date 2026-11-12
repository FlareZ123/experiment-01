'use strict';

const {createPublicKey, verify} = require('node:crypto');
const {
  BUNDLE_SCHEMA, REVIEW_SCHEMA, evidenceBundleSha256, reviewSigningBytes,
  bundleFailures
} = require('../agent45-independent-competitive-admission.cjs');
const {evaluateBilateralCompetence} =
  require('../agent45-bilateral-competence-gate.cjs');
const {
  completeRootPaperAudit, inspectResponseOpportunity, inspectAdmissionV2
} = require('./agent43-independent-outcome-competence-v2.cjs');
const authorized = require('../agent45-authorized-reviewers.json');

const SCHEMA = 'aichi-outcome-and-competitive-admission-v3';
const UNTIMED = 'untimed-research-game';
const EVENT = 'aichi-event-match';
const CLOCK_NOT_APPLICABLE = 'not-applicable-by-preregistered-untimed-protocol';
const EVENT_STAGES = new Set(['open-swiss', 'open-top32', 'open-final']);
const HEX_SHA256 = /^[0-9a-f]{64}$/;

/** @param {unknown} value @returns {boolean} */
function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** @param {unknown} value @returns {string|null} */
function safeDigest(value) {
  try { return evidenceBundleSha256(value); }
  catch { return null; }
}

/**
 * Validate the frozen registration and its explicit timing mode. The exact
 * registration snapshot is included in the signed bundle digest and its hash
 * must match the registration entry in the evidence manifest.
 * @param {object} bundle
 * @returns {{valid:boolean,mode:string|null,errors:string[],registration:object|null}}
 */
function inspectTimingPreregistration(bundle) {
  const trial = bundle?.trial;
  const registration = trial?.preregistration;
  const protocol = registration?.timingProtocol;
  const mode = trial?.timingMode ?? null;
  const errors = [];
  const registrationEntries = Array.isArray(bundle?.evidenceManifest) ?
    bundle.evidenceManifest.filter(x => x?.kind === 'registration') : [];

  if (bundle?.admissionContract !== SCHEMA)
    errors.push('wrong-or-missing-v3-contract-discriminator');
  if (bundle?.schema !== BUNDLE_SCHEMA || !trial || typeof trial !== 'object')
    errors.push('missing-complete-game-bundle');
  if (mode !== UNTIMED && mode !== EVENT)
    errors.push('missing-or-unknown-preregistered-timing-mode');
  if (!nonempty(trial?.trialId) || trial?.trialId !== bundle?.trialId ||
      registration?.trialId !== trial?.trialId)
    errors.push('timing-mode-trial-identity-mismatch');
  if (!nonempty(trial?.registrationRef) ||
      registration?.registrationRef !== trial?.registrationRef)
    errors.push('frozen-registration-reference-missing-or-mismatched');
  if (!nonempty(trial?.preregistrationEvidenceRef) ||
      registrationEntries.length !== 1 ||
      registrationEntries[0]?.ref !== trial?.preregistrationEvidenceRef)
    errors.push('frozen-registration-evidence-reference-missing-or-mismatched');
  if (!HEX_SHA256.test(trial?.preregistrationSha256 ?? '') ||
      registrationEntries[0]?.sha256 !== trial?.preregistrationSha256 ||
      !registration ||
      safeDigest(registration) !== trial?.preregistrationSha256)
    errors.push('frozen-registration-digest-missing-or-mismatched');

  if (registration?.schema !== 'aichi-game-level-preregistration-v1' ||
      registration?.mode !== mode ||
      registration?.registeredBeforeDealGeneration !== true)
    errors.push('timing-mode-not-frozen-before-deal-generation');
  const registeredAt = Date.parse(registration?.registeredAt ?? '');
  const dealGeneratedAt = Date.parse(registration?.dealGeneratedAt ?? '');
  if (!Number.isFinite(registeredAt) || !Number.isFinite(dealGeneratedAt) ||
      registeredAt >= dealGeneratedAt)
    errors.push('registration-does-not-precede-physical-deal');
  if (protocol?.schema !== 'aichi-game-timing-protocol-preregistration-v1' ||
      protocol?.mode !== mode || protocol?.declaredBeforeDealGeneration !== true ||
      registration?.timingProtocolSha256 !== safeDigest(protocol))
    errors.push('timing-protocol-attestation-missing-or-mismatched');

  if (mode === UNTIMED) {
    if (protocol?.tournamentTimerApplies !== false ||
        protocol?.officialEndCallApplies !== false ||
        protocol?.eventStageAdjudicationApplies !== false ||
        protocol?.eventStage != null)
      errors.push('untimed-preregistration-does-not-exclude-event-clock');
    if (trial?.eventStage != null ||
        trial?.clockDisposition !== CLOCK_NOT_APPLICABLE ||
        trial?.clockReceiptId != null ||
        trial?.adjudicationProtocolSha != null ||
        trial?.noCallClockPacket != null ||
        trial?.timeCallPacket != null ||
        trial?.extensionLedgerPacket != null)
      errors.push('untimed-trial-has-missing-or-event-clock-evidence');
  } else if (mode === EVENT) {
    if (protocol?.tournamentTimerApplies !== true ||
        protocol?.officialEndCallApplies !== true ||
        protocol?.eventStageAdjudicationApplies !== true ||
        !EVENT_STAGES.has(protocol?.eventStage) ||
        trial?.eventStage !== protocol?.eventStage ||
        trial?.clockDisposition === CLOCK_NOT_APPLICABLE)
      errors.push('event-mode-stage-or-clock-preregistration-mismatch');
  }

  return {valid:errors.length === 0,mode,errors,registration:registration ?? null};
}

/**
 * A deliberately untimed game has only a natural paper terminal. A tie is a
 * valid recorded outcome, not an Aichi clock result or an automatic win.
 * @param {object} trial
 * @returns {{kind:'win'|'tie',winnerSeat:0|1|null}|null}
 */
function inspectUntimedNaturalOutcome(trial) {
  if (trial?.nativeFinished !== true || trial?.engineError === true ||
      trial?.rootCapReached === true ||
      trial?.terminalKind !== 'natural-paper-terminal' ||
      !nonempty(trial?.nativeEndReason) ||
      !Array.isArray(trial?.finalPrizes) || trial.finalPrizes.length !== 2 ||
      !trial.finalPrizes.every(x => Number.isInteger(x) && x >= 0 && x <= 6))
    return null;
  if (trial.nativeOutcome === 'win' &&
      (trial.nativeWinner === 0 || trial.nativeWinner === 1))
    return {kind:'win',winnerSeat:trial.nativeWinner};
  if (trial.nativeOutcome === 'tie' && trial.nativeWinner === null)
    return {kind:'tie',winnerSeat:null};
  return null;
}

/**
 * Verify a reviewer packet using the same V1 Ed25519 signing bytes, but with
 * V3's mode-specific paper outcome fields. This authenticates the reviewer
 * statement; the referenced source evidence still requires human audit.
 * @param {object} bundle
 * @param {object} review
 * @param {string} role
 * @param {object} registry
 * @param {{kind:string,winnerSeat:number|null}} outcome
 * @param {Set<string>} usedIds
 * @returns {boolean}
 */
function verifyV3Review(bundle, review, role, registry, outcome, usedIds) {
  const digest = safeDigest(bundle);
  if (!review || !digest || review.schema !== REVIEW_SCHEMA || review.role !== role ||
      review.bundleSha256 !== digest ||
      review.decision !== 'approve' ||
      review.paperOutcome !== outcome.kind ||
      review.paperWinnerSeat !== outcome.winnerSeat ||
      !nonempty(review.reviewerId) || review.reviewerId === bundle?.producerId ||
      usedIds.has(review.reviewerId) || !nonempty(review.reviewEvidenceRef) ||
      !HEX_SHA256.test(review.reviewEvidenceSha256 ?? '')) return false;

  const reviewers = Array.isArray(registry?.reviewers) ? registry.reviewers : [];
  const configured = reviewers.find(x => x?.reviewerId === review.reviewerId &&
    Array.isArray(x.roles) && x.roles.includes(role));
  if (!configured || !nonempty(configured.publicKeyPem) ||
      typeof review.signatureBase64 !== 'string' ||
      !/^[A-Za-z0-9+/]{86}==$/.test(review.signatureBase64)) return false;
  try {
    const key = createPublicKey(configured.publicKeyPem);
    if (key.asymmetricKeyType !== 'ed25519' ||
        !verify(null, reviewSigningBytes(review), key,
          Buffer.from(review.signatureBase64, 'base64'))) return false;
  } catch { return false; }
  usedIds.add(review.reviewerId);
  return true;
}

/**
 * Verify the independent paper review's preregistration, clock boundary and
 * natural terminal. These are signed reviewer attestations, not producer
 * booleans and not a substitute for opening the cited evidence.
 * @param {object} review
 * @param {object} trial
 * @param {object} prereg
 * @returns {boolean}
 */
function untimedPaperAttestationValid(review, trial, prereg) {
  return review?.timingMode === UNTIMED &&
    review?.untimedProtocolVerified === true &&
    review?.untimedProtocolPreDealVerified === true &&
    review?.untimedProtocolEvidenceRef === trial?.registrationRef &&
    review?.untimedProtocolSha256 === trial?.preregistrationSha256 &&
    review?.noTournamentTimerUsed === true &&
    review?.noOfficialEndCallObserved === true &&
    review?.noEventStageAdjudicationUsed === true &&
    review?.clockStatus === CLOCK_NOT_APPLICABLE &&
    review?.naturalTerminalVerified === true &&
    nonempty(review?.naturalTerminalEvidenceRef) &&
    nonempty(review?.timerBoundaryEvidenceRef) &&
    review?.exactJapanesePrinted60sVerified === true &&
    review?.eventDateLegalityVerified === true &&
    review?.initial120CardCustodyVerified === true &&
    review?.actualSeatsAndFirstPlayerVerified === true &&
    nonempty(review?.printed60EvidenceRef) &&
    nonempty(review?.initialPhysicalDealEvidenceRef) &&
    nonempty(review?.seatAndFirstPlayerEvidenceRef) &&
    prereg?.timingProtocol?.mode === UNTIMED;
}

/**
 * V3 fixture/production evaluator. Untimed games require one signed paper
 * reviewer; event matches retain V2's paper+clock role composition unchanged.
 * Strategy review remains optional for factual outcome admission and mandatory
 * for comparative competitive-policy competence.
 * @param {object} bundle
 * @param {object[]} reviews
 * @param {object} reviewerRegistry
 * @returns {object}
 */
function inspectAdmissionV3(bundle, reviews, reviewerRegistry) {
  const prereg = inspectTimingPreregistration(bundle);
  if (!prereg.valid) {
    return {
      schema:SCHEMA,timingMode:prereg.mode,
      gameOutcomeAdmissionReady:false,
      competitivePolicyCompetenceReady:false,
      acceptanceReady:false,competitiveAdmission:false,fixtureOnly:true,
      clockStatus:prereg.mode === UNTIMED ? 'untimed-protocol-unverified' : 'unverified',
      preregistrationVerified:false,
      failures:[...prereg.errors]
    };
  }

  if (prereg.mode === EVENT) {
    const paperPackets = Array.isArray(reviews) ?
      reviews.filter(x => x?.role === 'paper') : [];
    const paper = paperPackets.length === 1 ? paperPackets[0] : null;
    const printAndCustodyReviewed = paper?.exactJapanesePrinted60sVerified === true &&
      paper?.eventDateLegalityVerified === true &&
      paper?.initial120CardCustodyVerified === true &&
      paper?.actualSeatsAndFirstPlayerVerified === true &&
      nonempty(paper?.printed60EvidenceRef) &&
      nonempty(paper?.initialPhysicalDealEvidenceRef) &&
      nonempty(paper?.seatAndFirstPlayerEvidenceRef);
    if (!printAndCustodyReviewed) {
      return {schema:SCHEMA,timingMode:EVENT,preregistrationVerified:true,
        gameOutcomeAdmissionReady:false,competitivePolicyCompetenceReady:false,
        acceptanceReady:false,competitiveAdmission:false,fixtureOnly:true,
        clockStatus:'event-clock-required',
        failures:['independent-printed-60-or-physical-deal-review-missing']};
    }
    let event;
    try { event = inspectAdmissionV2(bundle,reviews,reviewerRegistry); }
    catch {
      return {schema:SCHEMA,timingMode:EVENT,preregistrationVerified:true,
        gameOutcomeAdmissionReady:false,competitivePolicyCompetenceReady:false,
        acceptanceReady:false,competitiveAdmission:false,fixtureOnly:true,
        clockStatus:'event-clock-unverified',failures:['unverifiable-event-match-bundle']};
    }
    return {...event,schema:SCHEMA,timingMode:EVENT,
      preregistrationVerified:true,
      clockStatus:event.structuralProgress?.officialClockStatus ?? 'unverified',
      fixtureOnly:true,competitiveAdmission:false};
  }

  const trial = bundle.trial;
  const outcome = inspectUntimedNaturalOutcome(trial);
  const bundleErrors = (() => {
    try { return bundleFailures(bundle); }
    catch { return ['malformed-evidence-bundle']; }
  })();
  const trialIdentityValid = nonempty(bundle?.trialId) &&
    bundle.trialId === trial?.trialId;
  let structural = null;
  try { structural = evaluateBilateralCompetence(trial); }
  catch { /* A malformed ledger is reported as an outcome structural failure. */ }
  const tie = outcome?.kind === 'tie';
  const excluded = new Set([
    'no-certified-source-reply-source-episode',
    'policy-asymmetry-or-unverified',
    'official-match-clock-audit-pending'
  ]);
  if (tie) excluded.add('no-natural-native-or-adjudicated-paper-outcome');
  const outcomeStructuralFailures = structural ?
    structural.failures.filter(x => !excluded.has(x)) : ['unverifiable-native-trial'];
  let fullRootPaperAudit = false;
  try { fullRootPaperAudit = completeRootPaperAudit(trial); }
  catch { fullRootPaperAudit = false; }
  const submitted = Array.isArray(reviews) ? reviews : [];
  const paperPackets = submitted.filter(x => x?.role === 'paper');
  const strategyPackets = submitted.filter(x => x?.role === 'strategy');
  const unknownRoles = submitted.filter(x =>
    x?.role !== 'paper' && x?.role !== 'strategy');
  const reviewCompositionValid = paperPackets.length === 1 &&
    strategyPackets.length <= 1 && unknownRoles.length === 0 &&
    submitted.length >= 1 && submitted.length <= 2;
  const reviewerRegistryAvailable = reviewerRegistry?.schema ===
    'aichi-trusted-reviewers-v1' &&
    Array.isArray(reviewerRegistry.reviewers) &&
    reviewerRegistry.reviewers.length > 0;
  const usedIds = new Set();
  const paperReview = paperPackets.length === 1 ? paperPackets[0] : null;
  const strategyReview = strategyPackets.length === 1 ? strategyPackets[0] : null;
  const paperSignatureValid = Boolean(outcome && reviewerRegistryAvailable &&
    reviewCompositionValid && verifyV3Review(bundle,paperReview,'paper',
      reviewerRegistry,outcome,usedIds));
  let paperAttestationValid = false;
  try { paperAttestationValid = paperSignatureValid &&
    untimedPaperAttestationValid(paperReview,trial,prereg.registration); }
  catch { paperAttestationValid = false; }
  const strategySignatureValid = Boolean(outcome && reviewerRegistryAvailable &&
    strategyReview && reviewCompositionValid &&
    verifyV3Review(bundle,strategyReview,'strategy',reviewerRegistry,
      outcome,usedIds));
  const baseline = {verifiedReviewRoles:[
    {role:'paper',valid:paperAttestationValid},
    {role:'strategy',valid:strategySignatureValid}
  ],cooldownBridgeConditional:false};
  let opportunity;
  try { opportunity = inspectResponseOpportunity(
    trial,strategyReview,structural ?? {},baseline); }
  catch { opportunity = {disposition:'undetermined',valid:false,
    reason:'malformed-response-opportunity-audit'}; }
  const gameOutcomeAdmissionReady = bundleErrors.length === 0 &&
    trialIdentityValid && prereg.valid && outcome !== null &&
    outcomeStructuralFailures.length === 0 && fullRootPaperAudit &&
    paperAttestationValid;
  const competitivePolicyCompetenceReady = gameOutcomeAdmissionReady &&
    structural?.samePolicy === true && strategySignatureValid &&
    opportunity.valid;
  const candidateOutcome = outcome === null ? null : outcome.kind === 'tie' ?
    'tie' : outcome.winnerSeat === trial.candidateSeat ? 'win' : 'loss';
  const failures = [...bundleErrors,...prereg.errors,...outcomeStructuralFailures];
  if (!trialIdentityValid) failures.push('trial-identity-mismatch');
  if (!outcome) failures.push('untimed-natural-terminal-outcome-unverified');
  if (!fullRootPaperAudit) failures.push('missing-complete-root-paper-receipts');
  if (!reviewerRegistryAvailable) failures.push('external-review-unavailable');
  if (!reviewCompositionValid) failures.push('malformed-untimed-review-role-composition');
  if (!paperSignatureValid) failures.push('independent-paper-review-missing-or-invalid');
  if (!paperAttestationValid)
    failures.push('untimed-protocol-or-natural-terminal-review-incomplete');
  if (structural?.samePolicy !== true)
    failures.push('policy-asymmetry-or-unverified-for-competitive');
  if (!strategySignatureValid)
    failures.push('independent-strategy-review-missing-or-invalid');
  if (!opportunity.valid) failures.push('independent-policy-competence-unproven');
  const uniqueFailures = [...new Set(failures)];
  return {
    schema:SCHEMA,timingMode:UNTIMED,
    bundleSha256:evidenceBundleSha256(bundle),trialId:bundle?.trialId??null,
    preregistrationVerified:prereg.valid,
    preregistrationSha256:trial.preregistrationSha256,
    clockStatus:CLOCK_NOT_APPLICABLE,
    naturalOutcome:outcome?.kind??null,candidateOutcome,
    gameOutcomeAdmissionReady,
    competitivePolicyCompetenceReady,
    reciprocalEpisodeObserved:structural?.reciprocalEpisodeObserved??false,
    responseOpportunityDisposition:opportunity.disposition,
    responseOpportunityVerified:opportunity.valid,
    responseOpportunityEvidenceStatus:opportunity.reason,
    completeRootPaperReceiptsVerified:fullRootPaperAudit,
    signedReviewRoles:[
      {role:'paper',reviewerId:paperReview?.reviewerId??null,
        valid:paperAttestationValid},
      {role:'strategy',reviewerId:strategyReview?.reviewerId??null,
        valid:strategySignatureValid}
    ],
    outcomeStructuralFailures,
    failures:uniqueFailures,
    acceptanceReady:gameOutcomeAdmissionReady &&
      competitivePolicyCompetenceReady,
    fixtureOnly:true,competitiveAdmission:false
  };
}

/** @param {object} bundle @param {object[]} reviews @returns {object} */
function evaluateCompetitiveAdmissionV3(bundle, reviews) {
  const assessment = inspectAdmissionV3(bundle,reviews,authorized);
  return {...assessment,fixtureOnly:false,
    competitiveAdmission:assessment.acceptanceReady,
    disposition:assessment.acceptanceReady ? 'independently-admitted-v3' :
      'unqualified-or-pending-evidence'};
}

module.exports = {
  SCHEMA,UNTIMED,EVENT,CLOCK_NOT_APPLICABLE,safeDigest,inspectTimingPreregistration,
  inspectUntimedNaturalOutcome,untimedPaperAttestationValid,
  inspectAdmissionV3,evaluateCompetitiveAdmissionV3
};
