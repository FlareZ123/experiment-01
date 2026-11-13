'use strict';

const {createPublicKey, verify} = require('node:crypto');
const {
  BUNDLE_SCHEMA, REVIEW_SCHEMA, canonicalJson, evidenceBundleSha256, reviewSigningBytes,
  bundleFailures
} = require('../agent45-independent-competitive-admission.cjs');
const {evaluateBilateralCompetence} =
  require('../agent45-bilateral-competence-gate.cjs');
const {
  completeRootPaperAudit, inspectResponseOpportunity, inspectAdmissionV2
} = require('./agent43-independent-outcome-competence-v2.cjs');
const authorized = require('../agent45-authorized-reviewers.json');
const {validateOpponentPolicyFieldBundle} =
  require('../../../scripts/agent12-balanced-field-ledger-validator.cjs');

const SCHEMA = 'aichi-outcome-and-competitive-admission-v3';
const UNTIMED = 'untimed-research-game';
const EVENT = 'aichi-event-match';
const CLOCK_NOT_APPLICABLE = 'not-applicable-by-preregistered-untimed-protocol';
const EVENT_STAGES = new Set(['open-swiss', 'open-top32', 'open-final']);
const HEX_SHA256 = /^[0-9a-f]{64}$/;
const GIT_SHA = /^[0-9a-f]{40}$/;
const POLICY_ATTESTATION_SCHEMA = 'aichi-policy-competence-attestation-v1';
const POLICY_ATTESTATION_BUNDLE_SCHEMA = 'aichi-policy-attestation-bundle-v1';
const POLICY_REGISTRATION_SCHEMA = 'aichi-policy-registration-v1';
const POLICY_APPLICATION_RECEIPT_SCHEMA = 'aichi-policy-application-receipt-v2';
const OFFSET_ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

/** @param {unknown} value @returns {boolean} */
function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function stableIdentityId(value) {
  return nonempty(value) && value === value.trim() && value.length <= 256 &&
    !/[\u0000-\u001f\u007f]/.test(value);
}

/** @param {unknown} value @returns {string|null} */
function safeDigest(value) {
  try { return evidenceBundleSha256(value); }
  catch { return null; }
}

function validRuntimePatchReceipts(item, core) {
  const expected = core?.constraints?.sharedEngineCompatibilityPatches;
  const actual = item?.runtimePatchReceipts;
  if (!Array.isArray(expected) || !Array.isArray(actual) ||
      actual.length !== expected.length) return false;
  const seen = new Set();
  for (let index = 0; index < expected.length; index++) {
    const want = expected[index];
    const got = actual[index];
    if (!want || typeof want !== 'object' || Array.isArray(want) ||
        !got || typeof got !== 'object' || Array.isArray(got) ||
        got.schema !== 'aichi-runtime-patch-installation-receipt-v1' ||
        !stableIdentityId(want.patchId) || !stableIdentityId(got.patchId) ||
        seen.has(got.patchId) || got.patchId !== want.patchId ||
        !nonempty(want.modulePath) || !nonempty(got.modulePath) ||
        got.modulePath !== want.modulePath ||
        !HEX_SHA256.test(want.moduleSha256 ?? '') ||
        got.moduleSha256 !== want.moduleSha256 ||
        !stableIdentityId(want.target) || got.target !== want.target ||
        !HEX_SHA256.test(got.originalReducerFingerprint ?? '') ||
        !HEX_SHA256.test(got.installedReducerFingerprint ?? '') ||
        got.originalReducerFingerprint === got.installedReducerFingerprint ||
        got.installCount !== 1 ||
        got.installBoundary !== 'outer-v3-runner-before-role-wrappers' ||
        got.restoreCount !== 1 ||
        got.restoreBoundary !== 'outer-finally' ||
        got.restoredOriginal !== true ||
        got.nestedInstallCount !== 0 ||
        got.wrapperInstallCount !== 0) return false;
    const parts = got.modulePath.split('/');
    if (got.modulePath.startsWith('/') || got.modulePath.includes('\\') ||
        parts.some(part => !part || part === '.' || part === '..')) return false;
    seen.add(got.patchId);
  }
  return HEX_SHA256.test(item?.runtimePatchReceiptsSha256 ?? '') &&
    safeDigest(actual) === item.runtimePatchReceiptsSha256;
}

function validCardPoolInitializationReceipt(trial, runtimePinEvidence) {
  const receipt = trial?.cardPoolInitializationReceipt;
  return receipt?.schema === 'agent36-twinleaf-card-pool-initialization-v1' &&
    receipt.enginePin === trial?.vendorCommitSha &&
    receipt.startupPath === 'vendor/twinleaf/ptcg-server/start.js' &&
    HEX_SHA256.test(receipt.startupSha256 ?? '') &&
    Array.isArray(receipt.setNames) && receipt.setNames.length > 0 &&
    receipt.setNames.every(nonempty) &&
    new Set(receipt.setNames).size === receipt.setNames.length &&
    receipt.definedSetCount === receipt.setNames.length &&
    Number.isInteger(receipt.cardCount) && receipt.cardCount > 0 &&
    safeDigest(receipt) === runtimePinEvidence?.cardPoolInitializationSha256;
}

/**
 * Verify the per-game actor-only boundary without conflating a policy fallback
 * with the factual validity of the game's natural terminal outcome.
 */
function inspectActorOnlyExecutionBoundaryReceipt(item,trial=null) {
  const boundary=item?.actorOnlyExecutionBoundary;
  const integrityFailures=[],qualificationFailures=[];
  if(!boundary||typeof boundary!=='object'||Array.isArray(boundary))
    return {verified:false,eligible:false,failures:['actor-only-execution-boundary-missing']};
  const boundarySha=safeDigest(boundary);
  if(boundary.schema!=='aichi-actor-only-execution-boundary-v1')
    integrityFailures.push('actor-only-execution-boundary-schema-invalid');
  if(!HEX_SHA256.test(item?.actorOnlyExecutionBoundarySha256??'')||
      boundarySha!==item.actorOnlyExecutionBoundarySha256)
    integrityFailures.push('actor-only-execution-boundary-digest-mismatch');
  if(typeof boundary.valid!=='boolean'||!Array.isArray(boundary.failures)||
      !boundary.failures.every(nonempty))
    integrityFailures.push('actor-only-execution-boundary-status-malformed');
  else if(boundary.valid!==true||boundary.failures.length!==0)
    qualificationFailures.push('actor-only-execution-boundary-reports-fallback-failure');
  for(const [role,row,seat] of [
    ['candidate',boundary.candidate,item?.candidateSeat],
    ['opponent',boundary.opponent,item?.opponentSeat]
  ]){
    if(!row||typeof row!=='object'||Array.isArray(row)){
      integrityFailures.push(role+'-actor-only-execution-boundary-summary-missing');
      continue;
    }
    if(row.role!==role||row.policyOwnerSeat!==seat||!nonempty(row.version)||
        row.origin!=='detached-actor-observation'||
        row.observationSchema!=='agent2-public-native-dispatch-diff-v1')
      integrityFailures.push(role+'-actor-only-execution-boundary-role-or-observation-binding-invalid');
    for(const key of ['nativeOwnerTrainerFallbackEnabled',
      'ownerFallbackDiagnosticViewEnabled','nativePolicyMayUseHiddenInformation']){
      if(typeof row[key]!=='boolean') integrityFailures.push(role+'-'+key+'-missing-or-invalid');
      else if(row[key]!==false) qualificationFailures.push(role+'-'+key+'-enabled');
    }
    for(const key of ['unsupportedPromptFallbacks','nonLiveSpeculativeFallbacks',
      'nonOwnerNativeDelegations','nonTurnPhaseFallbacks','nonOwnerSeatBypassCalls',
      'nativeOwnerTrainerFallbackAttemptedUnsupportedPasses']){
      if(!Number.isSafeInteger(row[key])||row[key]<0)
        integrityFailures.push(role+'-'+key+'-missing-or-invalid');
      else if(row[key]!==0) qualificationFailures.push(role+'-'+key+'-nonzero');
    }
  }
  if(trial&&safeDigest(trial.actorOnlyExecutionBoundary)!==boundarySha)
    integrityFailures.push('trial-actor-only-execution-boundary-mismatch');
  const verified=integrityFailures.length===0;
  return {verified,eligible:verified&&qualificationFailures.length===0,
    failures:[...integrityFailures,...qualificationFailures],sha256:boundarySha};
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
  if (!OFFSET_ISO_DATE_TIME.test(registration?.registeredAt ?? '') ||
      !OFFSET_ISO_DATE_TIME.test(registration?.dealGeneratedAt ?? '') ||
      !Number.isFinite(registeredAt) || !Number.isFinite(dealGeneratedAt) ||
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
        !Object.hasOwn(protocol ?? {}, 'eventStage') ||
        protocol.eventStage !== null)
      errors.push('untimed-preregistration-does-not-exclude-event-clock');
    if (!Object.hasOwn(trial ?? {}, 'eventStage') || trial.eventStage !== null ||
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
      !stableIdentityId(review.reviewerId) || !stableIdentityId(bundle?.producerId) ||
      review.reviewerId === bundle?.producerId ||
      usedIds.has(review.reviewerId) || !nonempty(review.reviewEvidenceRef) ||
      !HEX_SHA256.test(review.reviewEvidenceSha256 ?? '')) return false;

  const reviewers = Array.isArray(registry?.reviewers) ? registry.reviewers : [];
  const matching = reviewers.filter(x => x?.reviewerId === review.reviewerId);
  const configured = matching.length === 1 ? matching[0] : null;
  if (!configured || !stableIdentityId(configured.reviewerId) ||
      !Array.isArray(configured.roles) || !configured.roles.includes(role) ||
      !nonempty(configured.publicKeyPem) ||
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
 * Exact pre-deal signature payload for a panel-level policy competence review.
 * It deliberately excludes the signature itself and never includes a game
 * outcome or final game-bundle digest.
 */
function policyAttestationSigningBytes(attestation) {
  const {signatureBase64, ...signed} = attestation ?? {};
  return Buffer.from(POLICY_ATTESTATION_SCHEMA + '\n' + canonicalJson(signed), 'utf8');
}

function validOffsetDateTime(value) {
  return typeof value === 'string' && OFFSET_ISO_DATE_TIME.test(value) &&
    Number.isFinite(Date.parse(value));
}

function verifyPolicyAttestationSignature(attestation, role, reviewerRegistry,
  producerId, policyPlanSha256, policyConstraintsSha256, registeredAt, usedIds,
  policyProducerIds = new Set()) {
  if (!attestation || attestation.schema !== POLICY_ATTESTATION_SCHEMA ||
      attestation.role !== role || attestation.decision !== 'approve' ||
      attestation.policyPlanSha256 !== policyPlanSha256 ||
      attestation.policyConstraintsSha256 !== policyConstraintsSha256 ||
      !validOffsetDateTime(attestation.attestedAt) ||
      Date.parse(attestation.attestedAt) >= Date.parse(registeredAt) ||
      !stableIdentityId(attestation.reviewerId) ||
      !stableIdentityId(producerId) ||
      attestation.reviewerId === producerId || usedIds.has(attestation.reviewerId) ||
      policyProducerIds.has(attestation.reviewerId) ||
      !nonempty(attestation.evidenceRef) ||
      !HEX_SHA256.test(attestation.evidenceSha256 ?? '') ||
      typeof attestation.signatureBase64 !== 'string' ||
      !/^[A-Za-z0-9+/]{86}==$/.test(attestation.signatureBase64)) return false;

  const reviewers = Array.isArray(reviewerRegistry?.reviewers) ?
    reviewerRegistry.reviewers : [];
  const matching = reviewers.filter(x => x?.reviewerId === attestation.reviewerId);
  const configured = matching.length === 1 ? matching[0] : null;
  if (reviewerRegistry?.schema !== 'aichi-trusted-reviewers-v1' ||
      !configured || !stableIdentityId(configured.reviewerId) ||
      !Array.isArray(configured.roles) ||
      !configured.roles.includes(role) || !nonempty(configured.publicKeyPem)) return false;
  try {
    const key = createPublicKey(configured.publicKeyPem);
    if (key.asymmetricKeyType !== 'ed25519' ||
        !verify(null, policyAttestationSigningBytes(attestation), key,
          Buffer.from(attestation.signatureBase64, 'base64'))) return false;
  } catch { return false; }
  usedIds.add(attestation.reviewerId);
  return true;
}

/**
 * Structural validation for the frozen V3 policy plan, signed pre-deal
 * attestations, registration and machine-generated per-game application
 * receipts. This intentionally reuses Agent49's extension of the existing
 * Agent12 field validator; it is not a second field ledger.
 *
 * A 29/32 source field is INCOMPLETE_FIELD, not INVALID: a game against an
 * authenticated rank can be reviewed, but the full-field result remains
 * incomplete and no unavailable rank can be played as a bye.
 */
function inspectPolicyPanelConsistency(bundle) {
  const failures = [];
  const core = bundle?.policyPlanCore;
  const attestationBundle = bundle?.policyAttestationBundle;
  const registration = bundle?.policyRegistration;
  const trial = bundle?.trial;
  const receipt = bundle?.policyApplicationReceipt;
  const planSha = safeDigest(core);
  const attestationSha = safeDigest(attestationBundle);
  const registrationSha = safeDigest(registration);
  const constraintsSha = safeDigest(core?.constraints);
  const opponentBundleSha = safeDigest(core?.opponentPolicyBundle);
  const runtimePinEvidence = core?.runtimePinEvidence;
  const candidatePolicyProducerId = core?.candidate?.policyProducerId;
  const rankEntries = Array.isArray(core?.opponentPolicyBundle?.ranks) ?
    core.opponentPolicyBundle.ranks : [];
  const policyProducerIds = new Set([
    candidatePolicyProducerId,
    ...rankEntries.filter(x => x?.sourceStatus === 'authenticated')
      .map(x => x?.policyProducerId)
  ].filter(stableIdentityId));

  if (!core || core.schema !== 'aichi-policy-plan-core-v1' ||
      core.comparisonMode !== 'candidate-vs-field')
    failures.push('policy-plan-schema-or-comparison-mode-invalid');
  if (runtimePinEvidence?.schema !== 'aichi-runtime-pin-evidence-v2' ||
      !HEX_SHA256.test(runtimePinEvidence?.unionSha256 ?? '') ||
      !HEX_SHA256.test(runtimePinEvidence?.loadedProcessClosureSha256 ?? '') ||
      !HEX_SHA256.test(runtimePinEvidence?.cardPoolInitializationSha256 ?? '') ||
      typeof runtimePinEvidence?.fullProcessClosureCovered !== 'boolean')
    failures.push('policy-runtime-pin-evidence-missing-or-invalid');
  if (!validCardPoolInitializationReceipt(trial, runtimePinEvidence))
    failures.push('policy-card-pool-initialization-receipt-invalid');
  if (!stableIdentityId(bundle?.producerId))
    failures.push('bundle-producer-identity-invalid');
  if (!stableIdentityId(candidatePolicyProducerId) ||
      candidatePolicyProducerId === bundle?.producerId ||
      rankEntries.some(x => x?.sourceStatus === 'authenticated' &&
        (!stableIdentityId(x.policyProducerId) || x.policyProducerId === bundle?.producerId)) ||
      rankEntries.some(x => x?.sourceStatus === 'source-unavailable' &&
        x.policyProducerId !== null))
    failures.push('policy-producer-identity-missing-or-not-independent-from-bundle-producer');
  if (!planSha || bundle?.policyPlanSha256 !== planSha)
    failures.push('policy-plan-core-digest-missing-or-mismatched');
  if (!attestationBundle || attestationBundle.schema !== POLICY_ATTESTATION_BUNDLE_SCHEMA ||
      attestationBundle.policyPlanSha256 !== planSha ||
      !attestationSha || bundle?.policyAttestationBundleSha256 !== attestationSha)
    failures.push('policy-attestation-bundle-digest-missing-or-mismatched');
  if (!registration || registration.schema !== POLICY_REGISTRATION_SCHEMA ||
      registration.trialId !== bundle?.trialId ||
      registration.policyPlanSha256 !== planSha ||
      registration.policyAttestationBundleSha256 !== attestationSha ||
      !registrationSha || bundle?.policyRegistrationSha256 !== registrationSha ||
      !HEX_SHA256.test(registrationSha))
    failures.push('policy-registration-digest-or-identity-missing-or-mismatched');

  const timingRegistration = trial?.preregistration;
  if (registration?.registeredBeforeDealGeneration !== true ||
      !validOffsetDateTime(registration?.registeredAt) ||
      !validOffsetDateTime(registration?.dealGeneratedAt) ||
      Date.parse(registration?.registeredAt ?? '') >=
        Date.parse(registration?.dealGeneratedAt ?? '') ||
      registration?.registeredAt !== timingRegistration?.registeredAt ||
      registration?.dealGeneratedAt !== timingRegistration?.dealGeneratedAt)
    failures.push('policy-registration-not-frozen-before-physical-deal');

  if (trial?.policyPlanSha256 !== planSha ||
      trial?.policyAttestationBundleSha256 !== attestationSha ||
      trial?.policyRegistrationSha256 !== registrationSha)
    failures.push('trial-policy-registration-binding-mismatch');

  const candidateAttestation = attestationBundle?.candidatePolicy;
  const opponentAttestation = attestationBundle?.opponentPolicy;
  if (registration?.candidatePolicyAttestationRef !== candidateAttestation?.evidenceRef ||
      registration?.opponentPolicyAttestationBundleRef !== opponentAttestation?.evidenceRef)
    failures.push('policy-attestation-reference-mismatch');

  const panelReceipts = Array.isArray(bundle?.policyPanelReceipts) ?
    bundle.policyPanelReceipts : receipt ? [receipt] : [];
  const panelActorBoundaries=panelReceipts.map(item=>
    inspectActorOnlyExecutionBoundaryReceipt(item,item?.trialId===trial?.trialId?trial:null));
  const currentActorBoundary=receipt?
    inspectActorOnlyExecutionBoundaryReceipt(receipt,trial):
    {verified:false,eligible:false,failures:['current-actor-only-execution-boundary-missing']};
  const actorOnlyExecutionBoundaryVerified=panelActorBoundaries.length>0&&
    panelActorBoundaries.every(status=>status.verified)&&currentActorBoundary.verified;
  const actorOnlyExecutionBoundaryEligible=actorOnlyExecutionBoundaryVerified&&
    panelActorBoundaries.every(status=>status.eligible)&&currentActorBoundary.eligible;
  const actorOnlyExecutionBoundaryFailures=[...new Set([
    ...panelActorBoundaries.flatMap(status=>status.failures),
    ...currentActorBoundary.failures
  ])];
  if (!receipt || panelReceipts.length === 0)
    failures.push('policy-application-receipt-missing');
  const receiptValid = item => {
    if (!item || item.schema !== POLICY_APPLICATION_RECEIPT_SCHEMA) return false;
    const {receiptSha256, ...payload} = item;
    const opponentEntry = rankEntries.find(x => x?.rank === item.opponentRank);
    if (!HEX_SHA256.test(receiptSha256 ?? '') ||
        safeDigest(payload) !== receiptSha256 ||
        item.policyPlanSha256 !== planSha ||
        item.policyAttestationBundleSha256 !== attestationSha ||
        !HEX_SHA256.test(item.policyRegistrationSha256 ?? '') ||
        item.policyConstraintsSha256 !== constraintsSha ||
        item.opponentPolicyBundleSha256 !== opponentBundleSha ||
        item.candidatePolicyProducerId !== candidatePolicyProducerId ||
        item.opponentPolicyProducerId !== opponentEntry?.policyProducerId ||
        !nonempty(item.trialId) ||
        !Number.isInteger(item.opponentRank) || item.opponentRank < 1 ||
        item.opponentRank > 32 ||
        ![0,1].includes(item.candidateSeat) ||
        ![0,1].includes(item.opponentSeat) ||
        item.candidateSeat === item.opponentSeat ||
        ![0,1].includes(item.firstPlayerSeat) ||
        !Array.isArray(item.policySha256BySeat) ||
        item.policySha256BySeat.length !== 2 ||
        !item.policySha256BySeat.every(x => HEX_SHA256.test(x ?? '')) ||
        !GIT_SHA.test(item.enginePin ?? '') ||
        !GIT_SHA.test(item.runnerRevision ?? '') ||
        item.runtimePinUnionSha256 !== runtimePinEvidence?.unionSha256 ||
        item.loadedProcessClosureSha256 !== runtimePinEvidence?.loadedProcessClosureSha256 ||
        item.cardPoolInitializationSha256 !== runtimePinEvidence?.cardPoolInitializationSha256 ||
        !validRuntimePatchReceipts(item, core) ||
        !HEX_SHA256.test(item.decisionTraceSha256 ?? '') ||
        !['none','within-budget','not-exceeded'].includes(item.timeoutStatus))
      return false;
    return true;
  };
  if (!panelReceipts.every(receiptValid))
    failures.push('policy-application-receipt-invalid-or-unhashed');
  if (!receipt || !panelReceipts.some(item =>
      item?.trialId === receipt?.trialId &&
      item?.receiptSha256 === receipt?.receiptSha256))
    failures.push('current-policy-application-receipt-not-in-panel-ledger');

  const rank = trial?.opponentRank ?? trial?.originalRank ?? trial?.rank;
  if (receipt && (
      receipt.trialId !== bundle?.trialId ||
      receipt.opponentRank !== rank ||
      receipt.candidateSeat !== trial?.candidateSeat ||
      receipt.opponentSeat !== trial?.originalSourceSeat ||
      receipt.firstPlayerSeat !== trial?.actualFirstPlayerSeat ||
      receipt.candidateDeckSha256 !== trial?.candidatePrinted60Sha256 ||
      receipt.opponentDeckSha256 !== trial?.originalPrinted60Sha256 ||
      receipt.enginePin !== trial?.vendorCommitSha ||
      receipt.runnerRevision !== trial?.researchRevisionSha ||
      receipt.policyRegistrationSha256 !== registrationSha ||
      safeDigest(trial?.cardPoolInitializationReceipt) !==
        runtimePinEvidence?.cardPoolInitializationSha256 ||
      safeDigest(receipt?.runtimePatchReceipts) !==
        safeDigest(trial?.runtimePatchReceipts) ||
      receipt?.runtimePatchReceiptsSha256 !== safeDigest(trial?.runtimePatchReceipts) ||
      receipt.decisionTraceSha256 !== trial?.decisionTraceSha256 ||
      !Array.isArray(trial?.policySha256BySeat) ||
      JSON.stringify(receipt.policySha256BySeat) !== JSON.stringify(trial.policySha256BySeat)))
    failures.push('current-policy-application-receipt-does-not-match-trial');

  let field = {
    status:'INVALID', policyPlanSha256:planSha,
    opponentPolicyBundleSha256:opponentBundleSha,
    policyConstraintsSha256:constraintsSha,
    availableRanks:[], unavailableRanks:[], rejectionReasons:['field-validator-not-run']
  };
  if (core?.comparisonMode === 'candidate-vs-field') {
    try {
      field = validateOpponentPolicyFieldBundle({
        policyPlanCore:core,
        expectedPolicyPlanSha256:planSha,
        gameReceipts:panelReceipts
      });
    } catch {
      field = {...field,rejectionReasons:['field-validator-threw']};
    }
  } else {
    failures.push('unsupported-policy-comparison-mode');
    const controlledMode = ['same-deck-mirror','controlled-treatment'].includes(core?.comparisonMode);
    if (controlledMode &&
        receipt?.policySha256BySeat?.[0] !== receipt?.policySha256BySeat?.[1])
      failures.push('same-policy-identity-required-for-controlled-comparison');
    if (core?.comparisonMode === 'same-deck-mirror') {
      const candidate = core?.candidate;
      const selected = Array.isArray(core?.opponentPolicyBundle?.ranks) ?
        core.opponentPolicyBundle.ranks.find(x => x?.rank === receipt?.opponentRank) : null;
      if (!candidate || !selected ||
          candidate.deckSha256 !== selected.deckSha256 ||
          candidate.policySha256 !== selected.policySha256 ||
          candidate.entryManifestSha256 !== selected.entryManifestSha256 ||
          candidate.challengeSuiteSha256 !== selected.challengeSuiteSha256)
        failures.push('same-deck-mirror-identity-mismatch');
    }
    if (core?.comparisonMode === 'controlled-treatment') {
      const relation = core?.controlledTreatment;
      const selected = Array.isArray(core?.opponentPolicyBundle?.ranks) ?
        core.opponentPolicyBundle.ranks.find(x => x?.rank === receipt?.opponentRank) : null;
      if (relation?.schema !== 'aichi-controlled-treatment-identity-v1' ||
          !nonempty(relation?.treatmentId) ||
          ![0,1].includes(relation?.controlSeat) ||
          ![0,1].includes(relation?.treatmentSeat) ||
          relation.controlSeat === relation.treatmentSeat ||
          !HEX_SHA256.test(relation?.deckSha256 ?? '') ||
          !HEX_SHA256.test(relation?.policySha256 ?? '') ||
          relation.deckSha256 !== core?.candidate?.deckSha256 ||
          relation.deckSha256 !== selected?.deckSha256 ||
          relation.policySha256 !== receipt?.policySha256BySeat?.[relation.controlSeat] ||
          receipt?.policySha256BySeat?.[relation.controlSeat] !==
            receipt?.policySha256BySeat?.[relation.treatmentSeat])
        failures.push('controlled-treatment-identity-missing-or-mismatched');
    }
  }
  if (field.status === 'INVALID')
    failures.push(...(field.rejectionReasons ?? ['opponent-policy-field-invalid']));

  const availableRanks = field.availableRanks ?? [];
  const strata = new Set();
  for (const item of panelReceipts) {
    if (Number.isInteger(item?.opponentRank) &&
        [0,1].includes(item?.candidateSeat) && [0,1].includes(item?.firstPlayerSeat)) {
      strata.add([item.opponentRank,item.candidateSeat,item.firstPlayerSeat].join(':'));
    }
  }
  const expectedStrata = availableRanks.length * 4;
  const panelCoverageMissing = [];
  for (const opponentRank of availableRanks) {
    for (const candidateSeat of [0,1]) {
      for (const firstPlayerSeat of [0,1]) {
        const key = [opponentRank,candidateSeat,firstPlayerSeat].join(':');
        if (!strata.has(key)) panelCoverageMissing.push(key);
      }
    }
  }
  const availableRankStrataComplete = expectedStrata > 0 &&
    panelCoverageMissing.length === 0;
  // This is policy-application receipt coverage only. It is not proof that
  // these games were played or admitted; Agent12's outcome ledger remains
  // the sole source for actual game counts, matchup outcomes and confidence.
  return {
    valid:failures.length === 0 && field.status !== 'INVALID',
    status:field.status,
    policyPlanSha256:planSha,
    policyAttestationBundleSha256:attestationSha,
    policyRegistrationSha256:registrationSha,
    opponentPolicyBundleSha256:opponentBundleSha,
    policyConstraintsSha256:constraintsSha,
    runtimePinUnionSha256:runtimePinEvidence?.unionSha256 ?? null,
    loadedProcessClosureSha256:runtimePinEvidence?.loadedProcessClosureSha256 ?? null,
    cardPoolInitializationSha256:runtimePinEvidence?.cardPoolInitializationSha256 ?? null,
    fullProcessClosureCovered:runtimePinEvidence?.fullProcessClosureCovered === true,
    availableRanks,unavailableRanks:field.unavailableRanks ?? [],
    candidatePolicyProducerId,
    opponentPolicyProducerIds:[...new Set(rankEntries.filter(x =>
      x?.sourceStatus === 'authenticated').map(x => x.policyProducerId).filter(stableIdentityId))],
    fieldComplete:field.status === 'VALID',
    availableRankStrataComplete,
    fullFieldPanelComplete:field.status === 'VALID' &&
      availableRankStrataComplete && strata.size === 128,
    observedAvailableStrata:strata.size,
    expectedAvailableStrata:expectedStrata,
    panelCoverageMissing,
    currentReceiptValid:Boolean(receipt && receiptValid(receipt) &&
      !failures.includes('current-policy-application-receipt-does-not-match-trial')),
    actorOnlyExecutionBoundaryVerified,
    actorOnlyExecutionBoundaryEligible,
    actorOnlyExecutionBoundaryFailures,
    failures:[...new Set(failures)]
  };
}

/** Verify a pre-deal candidate-policy and opponent-policy competence bundle. */
function inspectPolicyCompetenceAttestations(bundle, reviewerRegistry, panel) {
  const failures = [];
  const core = bundle?.policyPlanCore;
  const attestations = bundle?.policyAttestationBundle;
  const registration = bundle?.policyRegistration;
  const candidate = core?.candidate;
  const opponentBundle = core?.opponentPolicyBundle;
  const available = Array.isArray(opponentBundle?.ranks) ?
    opponentBundle.ranks.filter(x => x?.sourceStatus === 'authenticated') : [];
  const constraintsSha = safeDigest(core?.constraints);
  const policyProducerIds = new Set([
    candidate?.policyProducerId,
    ...available.map(x => x?.policyProducerId)
  ].filter(stableIdentityId));
  const policyProducerProvenanceValid = stableIdentityId(bundle?.producerId) &&
    stableIdentityId(candidate?.policyProducerId) &&
    candidate.policyProducerId !== bundle?.producerId &&
    available.every(x => stableIdentityId(x.policyProducerId) &&
      x.policyProducerId !== bundle?.producerId);
  const usedIds = new Set();
  const candidateAttestation = attestations?.candidatePolicy;
  const opponentAttestation = attestations?.opponentPolicy;
  const reviewerProducerIndependenceValid =
    !policyProducerIds.has(candidateAttestation?.reviewerId) &&
    !policyProducerIds.has(opponentAttestation?.reviewerId);
  const producerIndependenceValid = policyProducerProvenanceValid &&
    reviewerProducerIndependenceValid;

  const candidateIdentityValid = candidateAttestation?.policyProducerId === candidate?.policyProducerId &&
    candidateAttestation?.deckSha256 === candidate?.deckSha256 &&
    candidateAttestation?.policySha256 === candidate?.policySha256 &&
    candidateAttestation?.entryManifestSha256 === candidate?.entryManifestSha256 &&
    candidateAttestation?.challengeSuiteSha256 === candidate?.challengeSuiteSha256;
  const candidateSignatureValid = verifyPolicyAttestationSignature(
    candidateAttestation,'candidate-policy',reviewerRegistry,bundle?.producerId,
    panel?.policyPlanSha256,constraintsSha,registration?.registeredAt,usedIds,policyProducerIds);
  const opponentRankReviews = opponentAttestation?.rankReviews;
  const opponentIdentityValid = opponentAttestation?.opponentPolicyBundleSha256 ===
      panel?.opponentPolicyBundleSha256 &&
    Array.isArray(opponentRankReviews) && opponentRankReviews.length === available.length &&
    available.every((entry,index) => {
      const review = opponentRankReviews[index];
      return review?.rank === entry.rank &&
        review?.deckSha256 === entry.deckSha256 &&
        review?.policySha256 === entry.policySha256 &&
        review?.entryManifestSha256 === entry.entryManifestSha256 &&
        review?.challengeSuiteSha256 === entry.challengeSuiteSha256 &&
        review?.policyProducerId === entry.policyProducerId &&
        review?.decision === 'approve' &&
        nonempty(review?.evidenceRef) &&
        HEX_SHA256.test(review?.evidenceSha256 ?? '');
    });
  const opponentSignatureValid = verifyPolicyAttestationSignature(
    opponentAttestation,'opponent-policy',reviewerRegistry,bundle?.producerId,
    panel?.policyPlanSha256,constraintsSha,registration?.registeredAt,usedIds,policyProducerIds);

  if (!candidateIdentityValid || !candidateSignatureValid)
    failures.push('candidate-policy-predeal-competence-attestation-invalid');
  if (!opponentIdentityValid || !opponentSignatureValid)
    failures.push('opponent-policy-predeal-competence-attestation-invalid');
  if (!policyProducerProvenanceValid)
    failures.push('policy-producer-identity-missing-or-not-independent-from-bundle-producer');
  if (!reviewerProducerIndependenceValid)
    failures.push('policy-reviewer-and-policy-producer-not-independent');
  if (!panel?.valid)
    failures.push('policy-panel-consistency-invalid');
  if (candidateAttestation?.evidenceRef !== registration?.candidatePolicyAttestationRef ||
      opponentAttestation?.evidenceRef !== registration?.opponentPolicyAttestationBundleRef)
    failures.push('policy-competence-attestation-registration-reference-mismatch');
  if (candidateAttestation?.reviewerId &&
      candidateAttestation.reviewerId === opponentAttestation?.reviewerId)
    failures.push('candidate-and-opponent-policy-reviewers-not-independent');

  const reviewerIds = [];
  if (candidateSignatureValid) reviewerIds.push(candidateAttestation.reviewerId);
  if (opponentSignatureValid) reviewerIds.push(opponentAttestation.reviewerId);
  return {
    valid:failures.length === 0,
    candidatePolicyAttestationValid:candidateIdentityValid && candidateSignatureValid,
    opponentPolicyAttestationValid:opponentIdentityValid && opponentSignatureValid,
    candidatePolicyReviewerId:candidateAttestation?.reviewerId ?? null,
    opponentPolicyReviewerId:opponentAttestation?.reviewerId ?? null,
    policyProducerIds:[...policyProducerIds],
    policyProducerProvenanceValid,
    reviewerProducerIndependenceValid,
    producerIndependenceValid,
    reviewerIds,failures
  };
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

  const policyPanel = inspectPolicyPanelConsistency(bundle);
  const policyAttestations = inspectPolicyCompetenceAttestations(
    bundle,reviewerRegistry,policyPanel);

  if (prereg.mode === EVENT) {
    const submitted = Array.isArray(reviews) ? reviews : [];
    const gameReviews = submitted.filter(x =>
      x?.role === 'paper' || x?.role === 'clock' || x?.role === 'strategy');
    const misplacedPolicyReviews = gameReviews.length !== submitted.length;
    const paperPackets = gameReviews.filter(x => x?.role === 'paper');
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
        policyPanelConsistency:policyPanel,
        policyCompetence:policyAttestations,
        policyFieldStatus:policyPanel.status,
        policyFieldComplete:policyPanel.fieldComplete,
        policyPanelCoverageComplete:policyPanel.fullFieldPanelComplete,
        policyApplicationReceiptVerified:policyPanel.currentReceiptValid,
        failures:['independent-printed-60-or-physical-deal-review-missing',
          ...policyPanel.failures,...policyAttestations.failures]};
    }
    let event;
    try { event = inspectAdmissionV2(bundle,gameReviews,reviewerRegistry); }
    catch {
      return {schema:SCHEMA,timingMode:EVENT,preregistrationVerified:true,
        gameOutcomeAdmissionReady:false,competitivePolicyCompetenceReady:false,
        acceptanceReady:false,competitiveAdmission:false,fixtureOnly:true,
        clockStatus:'event-clock-unverified',
        policyPanelConsistency:policyPanel,
        policyCompetence:policyAttestations,
        policyFieldStatus:policyPanel.status,
        policyFieldComplete:policyPanel.fieldComplete,
        policyPanelCoverageComplete:policyPanel.fullFieldPanelComplete,
        policyApplicationReceiptVerified:policyPanel.currentReceiptValid,
        failures:['unverifiable-event-match-bundle',
          ...policyPanel.failures,...policyAttestations.failures]};
    }
    // V2's assessment omits structuralProgress; recover these diagnostics from
    // the same pinned structural evaluator rather than silently returning null.
    let eventStructural = null;
    try { eventStructural = evaluateBilateralCompetence(bundle?.trial); }
    catch { /* The V2 outcome assessment already reports structural failure. */ }
    const gameReviewerIds = (event.signedReviewRoles ?? [])
      .filter(x => x?.valid === true).map(x => x.reviewerId).filter(Boolean);
    const gameReviewerIdentityValid = gameReviewerIds.every(stableIdentityId);
    const trustedReviewers = Array.isArray(reviewerRegistry?.reviewers) ?
      reviewerRegistry.reviewers : [];
    const gameReviewerRegistryUnique = gameReviewerIds.every(id =>
      trustedReviewers.filter(x => x?.reviewerId === id).length === 1);
    const policyReviewerOverlap = policyAttestations.reviewerIds.some(id =>
      gameReviewerIds.includes(id));
    const producerGameOverlap = policyAttestations.policyProducerIds.some(id =>
      gameReviewerIds.includes(id));
    const reviewerOverlap = policyReviewerOverlap || producerGameOverlap;
    const strategyReviewValid = (event.signedReviewRoles ?? [])
      .some(x => x?.role === 'strategy' && x?.valid === true);
    const policyRolesValid = policyAttestations.valid &&
      policyPanel.actorOnlyExecutionBoundaryEligible === true &&
      gameReviewerIdentityValid && gameReviewerRegistryUnique &&
      !reviewerOverlap && !misplacedPolicyReviews;
    const competitivePolicyCompetenceReady = event.gameOutcomeAdmissionReady &&
      policyRolesValid && strategyReviewValid &&
      event.responseOpportunityVerified === true;
    const failures = (event.failures ?? []).filter(code =>
      code !== 'policy-asymmetry-or-unverified-for-competitive' &&
      code !== 'independent-policy-competence-unproven');
    failures.push(...policyPanel.failures,...policyAttestations.failures);
    if (!policyPanel.actorOnlyExecutionBoundaryEligible)
      failures.push('actor-only-execution-boundary-unverified-or-ineligible');
    if (misplacedPolicyReviews) failures.push('policy-attestations-must-not-be-postgame-review-roles');
    if (!gameReviewerIdentityValid) failures.push('game-reviewer-identity-invalid');
    if (!gameReviewerRegistryUnique)
      failures.push('game-reviewer-registry-identity-ambiguous');
    if (policyReviewerOverlap) failures.push('policy-and-game-reviewers-not-independent');
    if (producerGameOverlap) failures.push('policy-producer-and-game-reviewers-not-independent');
    if (!strategyReviewValid) failures.push('independent-strategy-review-missing-or-invalid');
    if (event.responseOpportunityVerified !== true)
      failures.push('independent-response-opportunity-unproven');
    return {...event,schema:SCHEMA,timingMode:EVENT,
      preregistrationVerified:true,
      gameOutcomeAdmissionReady:event.gameOutcomeAdmissionReady === true,
      competitivePolicyCompetenceReady,
      policyPanelConsistency:policyPanel,
      policyCompetence:policyAttestations,
      policyFieldStatus:policyPanel.status,
      policyFieldComplete:policyPanel.fieldComplete,
      policyPanelCoverageComplete:policyPanel.fullFieldPanelComplete,
      policyApplicationReceiptVerified:policyPanel.currentReceiptValid,
      samePolicyDiagnostic:eventStructural?.samePolicy ?? null,
      clockStatus:eventStructural?.officialClockStatus ?? 'unverified',
      failures:[...new Set(failures)],
      acceptanceReady:event.gameOutcomeAdmissionReady === true &&
        competitivePolicyCompetenceReady,
      fixtureOnly:true,competitiveAdmission:false,admissionEligible:false,
      fullProcessClosureCovered:bundle?.policyPlanCore?.runtimePinEvidence?.fullProcessClosureCovered === true};
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
  const usedIds = new Set(policyAttestations.reviewerIds);
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
  const gameReviewerIds = [paperReview?.reviewerId,strategyReview?.reviewerId].filter(Boolean);
  const policyReviewerOverlap = policyAttestations.reviewerIds.some(id =>
    gameReviewerIds.includes(id));
  const producerGameOverlap = policyAttestations.policyProducerIds.some(id =>
    gameReviewerIds.includes(id));
  const reviewerOverlap = policyReviewerOverlap || producerGameOverlap;
  const competitivePolicyCompetenceReady = gameOutcomeAdmissionReady &&
    policyAttestations.valid && policyPanel.actorOnlyExecutionBoundaryEligible === true &&
    !reviewerOverlap && strategySignatureValid &&
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
  if (policyPanel.failures.length) failures.push(...policyPanel.failures);
  if (!policyPanel.actorOnlyExecutionBoundaryEligible)
    failures.push('actor-only-execution-boundary-unverified-or-ineligible');
  if (policyAttestations.failures.length) failures.push(...policyAttestations.failures);
  if (policyReviewerOverlap) failures.push('policy-and-game-reviewers-not-independent');
  if (producerGameOverlap) failures.push('policy-producer-and-game-reviewers-not-independent');
  if (structural?.samePolicy !== true &&
      ['same-deck-mirror','controlled-treatment'].includes(
        bundle?.policyPlanCore?.comparisonMode))
    failures.push('same-policy-identity-required-for-controlled-comparison');
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
    candidateWin:candidateOutcome === 'win',
    candidateNonWin:candidateOutcome === 'loss' || candidateOutcome === 'tie',
    gameOutcomeAdmissionReady,
    competitivePolicyCompetenceReady,
    reciprocalEpisodeObserved:structural?.reciprocalEpisodeObserved??false,
    samePolicyDiagnostic:structural?.samePolicy ?? null,
    policyPanelConsistency:policyPanel,
    policyCompetence:policyAttestations,
    policyFieldStatus:policyPanel.status,
    policyFieldComplete:policyPanel.fieldComplete,
    policyPanelCoverageComplete:policyPanel.fullFieldPanelComplete,
    policyApplicationReceiptVerified:policyPanel.currentReceiptValid,
    actorOnlyExecutionBoundaryVerified:policyPanel.actorOnlyExecutionBoundaryVerified,
    actorOnlyExecutionBoundaryEligible:policyPanel.actorOnlyExecutionBoundaryEligible,
    actorOnlyExecutionBoundaryFailures:policyPanel.actorOnlyExecutionBoundaryFailures,
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
    fixtureOnly:true,competitiveAdmission:false,admissionEligible:false,
      fullProcessClosureCovered:bundle?.policyPlanCore?.runtimePinEvidence?.fullProcessClosureCovered === true
  };
}

/** @param {object} bundle @param {object[]} reviews @returns {object} */
function evaluateCompetitiveAdmissionV3(bundle, reviews) {
  const assessment = inspectAdmissionV3(bundle,reviews,authorized);
  const fullProcessClosureCovered =
    bundle?.policyPlanCore?.runtimePinEvidence?.fullProcessClosureCovered === true;
  const admissionEligible = assessment.acceptanceReady && fullProcessClosureCovered;
  return {...assessment,fixtureOnly:false,
    competitiveAdmission:admissionEligible,
    admissionEligible,fullProcessClosureCovered,
    disposition:admissionEligible ? 'independently-admitted-v3' :
      assessment.acceptanceReady && !fullProcessClosureCovered ?
        'runtime-process-closure-incomplete' : 'unqualified-or-pending-evidence'};
}

module.exports = {
  SCHEMA,UNTIMED,EVENT,CLOCK_NOT_APPLICABLE,safeDigest,inspectTimingPreregistration,
  inspectUntimedNaturalOutcome,untimedPaperAttestationValid,
  inspectAdmissionV3,evaluateCompetitiveAdmissionV3,
  policyAttestationSigningBytes,inspectPolicyPanelConsistency,
  inspectPolicyCompetenceAttestations
};
