'use strict';

// Shared conservative evidence admission gate. No paper evidence or original
// source authenticity is established from caller-supplied boolean/hash strings.
const FIELD_SIZE = 32;
const SEATS = [0, 1];
const FIRST_PLAYER_SEATS = [0, 1];
const SHA256 = /^[a-f0-9]{64}$/i;
const GIT_SHA = /^[a-f0-9]{40}$/i;
const {sha256: canonicalSha256} =
  require('../simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs');
const POLICY_PLAN_SCHEMA = 'aichi-policy-plan-core-v1';
const OPPONENT_BUNDLE_SCHEMA = 'aichi-opponent-policy-bundle-v1';
const POLICY_IDENTITY_FIELDS = Object.freeze([
  'deckSha256','policySha256','entryManifestSha256','challengeSuiteSha256'
]);
const POLICY_ONLY_IDENTITY_FIELDS = Object.freeze([
  'policySha256','entryManifestSha256','challengeSuiteSha256'
]);
const GAME_RULESETS = new Set(['Expanded','Japanese Extra']);

function validDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
}

function validEvidenceRef(value) {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim() ||
      value.startsWith('/') || value.includes('\\')) return false;
  return value.split('/').every(part => part && part !== '.' && part !== '..') &&
    !/[\u0000-\u001f\u007f]/.test(value);
}
const REQUIRED_POLICY_CONSTRAINTS = Object.freeze([
  'observationSurface','hiddenInformationBoundary','decisionBudget',
  'timeoutPolicy','randomizationProtocol','publicHistoryWindow','resourceAccounting'
]);

function isExplicitConstraint(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function isStableProducerId(value) {
  return typeof value === 'string' && value.trim().length > 0 &&
    value.length <= 128 && value === value.trim();
}

/**
 * Validate the immutable V3 candidate-vs-field policy-plan core and its
 * per-game application receipts. This is structural/digest validation only:
 * it does not authenticate source lists, verify reviewer signatures, or prove
 * policy competence. Candidate/rank producer IDs and their receipt echoes are
 * structural policy identity; reviewer/producer independence belongs to the
 * V3 signed-attestation layer. An explicit source-unavailable rank keeps the
 * 32-rank aggregate incomplete; it is never silently omitted or treated as a bye.
 *
 * @param {object} request {policyPlanCore, expectedPolicyPlanSha256?,
 *   gameReceipts?}
 */
function validateOpponentPolicyFieldBundle(request) {
  if (!request || !request.policyPlanCore ||
      typeof request.policyPlanCore !== 'object' ||
      Array.isArray(request.policyPlanCore)) {
    throw new TypeError('policyPlanCore must be an object');
  }
  const {policyPlanCore, expectedPolicyPlanSha256, gameReceipts = []} = request;
  if (!Array.isArray(gameReceipts))
    throw new TypeError('gameReceipts must be an array');

  const problems = new Set();
  const incomplete = new Set();
  let policyPlanSha256 = null;
  let opponentPolicyBundleSha256 = null;
  let policyConstraintsSha256 = null;
  try {
    policyPlanSha256 = canonicalSha256(policyPlanCore);
  } catch {
    problems.add('policy-plan-noncanonical');
  }
  if (expectedPolicyPlanSha256 !== undefined &&
      (!SHA256.test(expectedPolicyPlanSha256) ||
       expectedPolicyPlanSha256 !== policyPlanSha256)) {
    problems.add('policy-plan-digest-mismatch');
  }
  if (policyPlanCore.schema !== POLICY_PLAN_SCHEMA)
    problems.add('policy-plan-schema-invalid');
  if (policyPlanCore.comparisonMode !== 'candidate-vs-field')
    problems.add('comparison-mode-invalid');
  if (Object.hasOwn(policyPlanCore, 'policyPlanSha256') ||
      Object.keys(policyPlanCore).some(key =>
        /reviewer|attestation|signature|post.?game|outcome/i.test(key))) {
    problems.add('policy-plan-core-mixes-attestation-or-outcome-data');
  }

  const constraints = policyPlanCore.constraints;
  const gameRuleset = constraints?.gameRuleset;
  const formatAware = gameRuleset !== undefined;
  if (formatAware) {
    if (!GAME_RULESETS.has(gameRuleset) ||
        policyPlanCore.gameRuleset !== gameRuleset ||
        policyPlanCore.candidateFormat !== gameRuleset ||
        constraints?.candidateFormat !== gameRuleset ||
        policyPlanCore.opponentSourceEventFormat !== 'Japanese Extra' ||
        constraints?.opponentSourceEventFormat !== 'Japanese Extra')
      problems.add('policy-plan-game-ruleset-format-mismatch');
    if (gameRuleset === 'Expanded' &&
        (!validDateOnly(constraints?.expandedLegalityAsOf) ||
         (constraints?.eventDate !== null && constraints?.eventDate !== undefined)))
      problems.add('expanded-legality-date-unverified');
    if (gameRuleset === 'Japanese Extra' &&
        (!validDateOnly(constraints?.eventDate) ||
         (constraints?.expandedLegalityAsOf !== null &&
          constraints?.expandedLegalityAsOf !== undefined)))
      problems.add('japanese-extra-event-date-unverified');
  }

  const candidate = policyPlanCore.candidate;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
      POLICY_IDENTITY_FIELDS.some(field => !SHA256.test(candidate[field]))) {
    problems.add('candidate-policy-plan-identity-unverified');
  }
  if (!isStableProducerId(candidate?.policyProducerId))
    problems.add('candidate-policy-producer-unverified');
  if (formatAware && candidate?.formatStatus !== 'legal')
    problems.add('candidate-format-not-verified-legal');
  if (formatAware && !validEvidenceRef(candidate?.formatStatusEvidenceRef))
    problems.add('candidate-format-evidence-ref-unverified');

  const bundle = policyPlanCore.opponentPolicyBundle;
  const ranks = Array.isArray(bundle?.ranks) ? bundle.ranks : [];
  if (!bundle || bundle.schema !== OPPONENT_BUNDLE_SCHEMA)
    problems.add('opponent-policy-bundle-schema-invalid');
  if (ranks.length !== FIELD_SIZE)
    problems.add('opponent-field-size-invalid');

  const rankByNumber = new Map();
  const availableRanks = [];
  const unavailableRanks = [];
  const formatIncompatibleRanks = [];
  const formatUnverifiedRanks = [];
  for (let index = 0; index < ranks.length; index++) {
    const entry = ranks[index];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) ||
        !Number.isInteger(entry.rank) || entry.rank < 1 ||
        entry.rank > FIELD_SIZE) {
      problems.add('opponent-rank-entry-invalid');
      continue;
    }
    if (rankByNumber.has(entry.rank)) {
      problems.add('opponent-rank-duplicate');
      continue;
    }
    rankByNumber.set(entry.rank, entry);
    if (entry.rank !== index + 1)
      problems.add('opponent-rank-order-invalid');

    if (entry.sourceStatus === 'authenticated') {
      if (formatAware) {
        if (!SHA256.test(entry.deckSha256 ?? ''))
          problems.add('opponent-rank-identity-unverified');
        if (entry.formatStatus === 'legal') {
          const rankIdentityValid =
            POLICY_ONLY_IDENTITY_FIELDS.every(field => SHA256.test(entry[field])) &&
            isStableProducerId(entry.policyProducerId) &&
            validEvidenceRef(entry.formatStatusEvidenceRef);
          if (!rankIdentityValid) {
            if (POLICY_ONLY_IDENTITY_FIELDS.some(field => !SHA256.test(entry[field])))
              problems.add('opponent-rank-policy-identity-unverified');
            if (!isStableProducerId(entry.policyProducerId))
              problems.add('opponent-rank-policy-producer-unverified');
            if (!validEvidenceRef(entry.formatStatusEvidenceRef))
              problems.add('opponent-rank-format-evidence-ref-unverified');
          } else {
            availableRanks.push(entry.rank);
          }
        } else if (entry.formatStatus === 'incompatible') {
          if (POLICY_ONLY_IDENTITY_FIELDS.some(field => entry[field] !== null) ||
              entry.policyProducerId !== null)
            problems.add('format-incompatible-rank-has-policy-identity');
          if (!validEvidenceRef(entry.formatStatusEvidenceRef))
            problems.add('format-incompatible-rank-evidence-ref-missing');
          formatIncompatibleRanks.push(entry.rank);
          incomplete.add('field-format-incompatible');
        } else if (entry.formatStatus === 'unverified') {
          if (POLICY_ONLY_IDENTITY_FIELDS.some(field => entry[field] !== null) ||
              entry.policyProducerId !== null)
            problems.add('format-unverified-rank-has-policy-identity');
          if (entry.formatStatusEvidenceRef !== null &&
              entry.formatStatusEvidenceRef !== undefined &&
              !validEvidenceRef(entry.formatStatusEvidenceRef))
            problems.add('format-unverified-rank-evidence-ref-invalid');
          formatUnverifiedRanks.push(entry.rank);
          incomplete.add('field-format-unverified');
        } else {
          problems.add('opponent-format-status-invalid');
        }
      } else {
        const rankIdentityValid =
          POLICY_IDENTITY_FIELDS.every(field => SHA256.test(entry[field])) &&
          isStableProducerId(entry.policyProducerId);
        if (!rankIdentityValid) {
          if (POLICY_IDENTITY_FIELDS.some(field => !SHA256.test(entry[field])))
            problems.add('opponent-rank-identity-unverified');
          if (!isStableProducerId(entry.policyProducerId))
            problems.add('opponent-rank-policy-producer-unverified');
        } else {
          availableRanks.push(entry.rank);
        }
      }
    } else if (entry.sourceStatus === 'source-unavailable') {
      if (POLICY_IDENTITY_FIELDS.some(field => entry[field] !== null) ||
          entry.policyProducerId !== null) {
        problems.add('unavailable-rank-has-identity');
      } else {
        unavailableRanks.push(entry.rank);
        incomplete.add('field-incomplete');
      }
      if (formatAware && entry.formatStatus !== null &&
          entry.formatStatus !== undefined)
        problems.add('source-unavailable-rank-has-format-status');
    } else {
      problems.add('opponent-source-status-invalid');
    }
  }
  if (rankByNumber.size !== FIELD_SIZE ||
      Array.from({length:FIELD_SIZE}, (_, i) => i + 1)
        .some(rank => !rankByNumber.has(rank))) {
    problems.add('opponent-field-rank-coverage-invalid');
  }
  try {
    if (bundle && typeof bundle === 'object')
      opponentPolicyBundleSha256 = canonicalSha256(bundle);
  } catch {
    problems.add('opponent-policy-bundle-noncanonical');
  }

  if (!constraints || typeof constraints !== 'object' ||
      Array.isArray(constraints)) {
    problems.add('policy-constraints-invalid');
  } else {
    for (const field of REQUIRED_POLICY_CONSTRAINTS) {
      if (!Object.hasOwn(constraints, field) ||
          !isExplicitConstraint(constraints[field])) {
        problems.add(`policy-constraint-missing:${field}`);
      }
    }
    try {
      policyConstraintsSha256 = canonicalSha256(constraints);
    } catch {
      problems.add('policy-constraints-noncanonical');
    }
  }

  const trialIds = new Set();
  let attestationBundleSha = null;
  let enginePin = null;
  let runnerRevision = null;
  for (const receipt of gameReceipts) {
    if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
      problems.add('policy-application-receipt-invalid');
      continue;
    }
    const trialId = receipt.trialId;
    if (typeof trialId !== 'string' || trialId.length === 0 ||
        trialIds.has(trialId)) {
      problems.add('policy-application-trial-identity-invalid');
    } else {
      trialIds.add(trialId);
    }

    const rank = receipt.opponentRank ?? receipt.rank;
    const entry = Number.isInteger(rank) ? rankByNumber.get(rank) : null;
    if (!entry) {
      problems.add('policy-application-opponent-rank-invalid');
      continue;
    }
    if (entry.sourceStatus !== 'authenticated') {
      problems.add('game-against-source-unavailable-rank');
      continue;
    }
    if (formatAware && entry.formatStatus !== 'legal') {
      problems.add(entry.formatStatus === 'incompatible' ?
        'game-against-format-incompatible-rank' :
        'game-against-format-unverified-rank');
      continue;
    }
    if (formatAware && (
        receipt.gameRuleset !== gameRuleset ||
        receipt.candidateFormat !== policyPlanCore.candidateFormat ||
        receipt.opponentSourceEventFormat !== policyPlanCore.opponentSourceEventFormat ||
        (gameRuleset === 'Expanded' &&
          receipt.expandedLegalityAsOf !== constraints.expandedLegalityAsOf) ||
        (gameRuleset === 'Japanese Extra' && receipt.eventDate !== constraints.eventDate)))
      problems.add('game-receipt-game-ruleset-format-mismatch');
    if (receipt.policyPlanSha256 !== policyPlanSha256)
      problems.add('game-policy-plan-digest-mismatch');
    if (!SHA256.test(receipt.policyRegistrationSha256))
      problems.add('game-policy-registration-unverified');
    if (!SHA256.test(receipt.policyAttestationBundleSha256))
      problems.add('game-policy-attestation-bundle-unverified');
    // Registration is trial-scoped: it binds this trialId and its
    // registeredAt/dealGeneratedAt timestamps. Only the pre-deal policy
    // attestation bundle is field-constant across distinct game receipts.
    if (attestationBundleSha === null)
      attestationBundleSha = receipt.policyAttestationBundleSha256;
    if (receipt.policyAttestationBundleSha256 !== attestationBundleSha)
      problems.add('game-policy-attestation-bundle-changed');

    const same = (actual, expected, reason) => {
      if (actual !== expected) problems.add(reason);
    };
    same(receipt.candidateDeckSha256 ?? receipt.candidate60Sha,candidate?.deckSha256,
      'game-candidate-deck-mismatch');
    same(receipt.candidatePolicySha256 ?? receipt.candidatePolicySha,candidate?.policySha256,
      'game-candidate-policy-mismatch');
    same(receipt.candidateEntryManifestSha256,candidate?.entryManifestSha256,
      'game-candidate-entry-manifest-mismatch');
    same(receipt.candidateChallengeSuiteSha256,candidate?.challengeSuiteSha256,
      'game-candidate-challenge-suite-mismatch');
    same(receipt.candidatePolicyProducerId,candidate?.policyProducerId,
      'game-candidate-policy-producer-mismatch');
    same(receipt.opponentDeckSha256 ?? receipt.source60Sha,entry.deckSha256,
      'game-opponent-deck-mismatch');
    same(receipt.opponentPolicySha256,entry.policySha256,
      'game-opponent-policy-mismatch');
    same(receipt.opponentEntryManifestSha256,entry.entryManifestSha256,
      'game-opponent-entry-manifest-mismatch');
    same(receipt.opponentChallengeSuiteSha256,entry.challengeSuiteSha256,
      'game-opponent-challenge-suite-mismatch');
    same(receipt.opponentPolicyProducerId,entry.policyProducerId,
      'game-opponent-policy-producer-mismatch');
    const receiptBundleSha = receipt.opponentPolicyBundleSha256 ?? receipt.opponentPolicyBundleSha;
    if (receiptBundleSha !== undefined)
      same(receiptBundleSha,opponentPolicyBundleSha256,
        'game-opponent-policy-bundle-mismatch');

    const candidateSeat = receipt.candidateSeat ?? receipt.seat;
    const opponentSeat = receipt.opponentSeat ??
      (Number.isInteger(candidateSeat) ? 1 - candidateSeat : undefined);
    if (![0,1].includes(candidateSeat) || ![0,1].includes(opponentSeat) ||
        candidateSeat === opponentSeat) {
      problems.add('game-policy-seat-assignment-invalid');
    }
    if (!Array.isArray(receipt.policySha256BySeat) ||
        receipt.policySha256BySeat.length !== 2) {
      problems.add('game-policy-seat-hashes-invalid');
    } else if ([0,1].includes(candidateSeat) && [0,1].includes(opponentSeat)) {
      same(receipt.policySha256BySeat[candidateSeat],candidate?.policySha256,
        'game-candidate-seat-policy-mismatch');
      same(receipt.policySha256BySeat[opponentSeat],entry.policySha256,
        'game-opponent-seat-policy-mismatch');
    }

    if (!GIT_SHA.test(receipt.enginePin))
      problems.add('game-engine-pin-unverified');
    if (enginePin === null) enginePin = receipt.enginePin;
    if (receipt.enginePin !== enginePin)
      problems.add('game-engine-pin-changed');
    if (!GIT_SHA.test(receipt.runnerRevision))
      problems.add('game-runner-revision-unverified');
    if (runnerRevision === null) runnerRevision = receipt.runnerRevision;
    if (receipt.runnerRevision !== runnerRevision)
      problems.add('game-runner-revision-changed');
    same(receipt.policyConstraintsSha256,policyConstraintsSha256,
      'game-policy-constraints-mismatch');
    if (!SHA256.test(receipt.decisionTraceSha256))
      problems.add('game-decision-trace-unverified');
    if (typeof receipt.timeoutStatus !== 'string' ||
        receipt.timeoutStatus.trim().length === 0) {
      problems.add('game-timeout-status-unverified');
    }
  }

  const rejectionReasons = [...problems, ...incomplete].sort();
  return {
    status: problems.size ? 'INVALID' : incomplete.size ? 'INCOMPLETE_FIELD' : 'VALID',
    policyPlanSha256, opponentPolicyBundleSha256, policyConstraintsSha256,
    availableRanks: availableRanks.sort((a,b)=>a-b),
    unavailableRanks: unavailableRanks.sort((a,b)=>a-b),
    formatIncompatibleRanks: formatIncompatibleRanks.sort((a,b)=>a-b),
    formatUnverifiedRanks: formatUnverifiedRanks.sort((a,b)=>a-b),
    gameRuleset: formatAware ? gameRuleset : null,
    receiptCount: gameReceipts.length, rejectionReasons
  };
}


/**
 * Join the existing 128-stratum outcome ledger to the same V3 policy-plan
 * and per-game application receipts used by the V3 admission evaluator.
 * Legacy ledgers remain supported when neither V3 field is supplied.
 */
function validateV3PolicyPanelJoin(request, attempts, problems,
    ledgerOpponentPolicyBundleSha) {
  const hasPolicyPlan = request.policyPlanCore !== undefined;
  const hasPanelReceipts = request.policyPanelReceipts !== undefined;
  if (!hasPolicyPlan && !hasPanelReceipts) return;
  if (!hasPolicyPlan || !hasPanelReceipts ||
      !Array.isArray(request.policyPanelReceipts)) {
    problems.add('v3-policy-panel-evidence-incomplete');
    return;
  }
  if (!SHA256.test(request.policyPlanSha256))
    problems.add('v3-policy-plan-digest-unverified');

  let panel;
  try {
    panel = validateOpponentPolicyFieldBundle({
      policyPlanCore:request.policyPlanCore,
      expectedPolicyPlanSha256:request.policyPlanSha256,
      gameReceipts:request.policyPanelReceipts
    });
  } catch {
    problems.add('v3-policy-panel-invalid');
    return;
  }
  if (panel.status !== 'VALID') problems.add('v3-policy-panel-invalid');
  if (panel.policyPlanSha256 !== request.policyPlanSha256)
    problems.add('v3-policy-plan-digest-mismatch');
  if (panel.opponentPolicyBundleSha256 !== ledgerOpponentPolicyBundleSha)
    problems.add('v3-policy-bundle-ledger-mismatch');
  if (request.policyPanelReceipts.length !== attempts.length)
    problems.add('v3-policy-panel-attempt-count-mismatch');

  const receiptByTrial = new Map();
  for (const receipt of request.policyPanelReceipts) {
    if (!receipt || typeof receipt.trialId !== 'string' ||
        receipt.trialId.length === 0 || receiptByTrial.has(receipt.trialId)) {
      problems.add('v3-policy-panel-trial-identity-invalid');
      continue;
    }
    receiptByTrial.set(receipt.trialId,receipt);
  }

  const attemptIds = new Set();
  for (const attempt of attempts) {
    if (typeof attempt.trialId !== 'string' || attempt.trialId.length === 0)
      continue;
    if (attemptIds.has(attempt.trialId)) continue;
    attemptIds.add(attempt.trialId);
    const receipt = receiptByTrial.get(attempt.trialId);
    if (!receipt) {
      problems.add('v3-policy-receipt-missing-for-outcome');
      continue;
    }

    if (receipt.opponentRank !== attempt.rank ||
        receipt.candidateSeat !== attempt.seat ||
        receipt.firstPlayerSeat !== attempt.firstPlayerSeat ||
        receipt.opponentSeat !== 1 - attempt.seat ||
        receipt.candidateDeckSha256 !== attempt.candidate60Sha ||
        receipt.candidatePolicySha256 !== attempt.candidatePolicySha ||
        receipt.opponentDeckSha256 !== attempt.source60Sha ||
        receipt.opponentPolicyBundleSha256 !== panel.opponentPolicyBundleSha256 ||
        attempt.opponentPolicyBundleSha !== panel.opponentPolicyBundleSha256 ||
        attempt.policyPlanSha256 !== panel.policyPlanSha256 ||
        attempt.policyRegistrationSha256 !== receipt.policyRegistrationSha256 ||
        attempt.policyAttestationBundleSha256 !== receipt.policyAttestationBundleSha256 ||
        attempt.policyApplicationReceiptSha256 !== receipt.receiptSha256) {
      problems.add('v3-policy-receipt-outcome-mismatch');
    }

    const {receiptSha256,...payload} = receipt;
    try {
      if (!SHA256.test(receiptSha256) ||
          canonicalSha256(payload) !== receiptSha256) {
        problems.add('v3-policy-application-receipt-digest-invalid');
      }
    } catch {
      problems.add('v3-policy-application-receipt-digest-invalid');
    }
  }

  for (const trialId of receiptByTrial.keys()) {
    if (!attemptIds.has(trialId))
      problems.add('v3-policy-receipt-without-outcome');
  }
}

/**
 * Verify structure of a COMPLETE equally weighted 32-rank, two-seat,
 * two-first-player 128-stratum registration ledger. For statistical validity,
 * every row must also be externally verified to be a genuinely independent,
 * paper-legal completed game, and the registration must predate the experiment.
 *
 * @param {object} request Caller-supplied complete field receipt manifest.
 *   Optional V3 mode supplies policyPlanCore, policyPlanSha256 and
 *   policyPanelReceipts; every outcome attempt must carry the matching
 *   policyApplicationReceiptSha256, policyRegistrationSha256 and
 *   policyAttestationBundleSha256. Receipts are joined one-to-one by trialId.
 *   For full-field inference, policyPanelReceipts is the aggregate of actual
 *   per-game receipts across all outcome attempts; never synthesize missing cells.
 * @param {readonly string[]} allowedStatuses Exact externally audited labels.
 * @param {string} unqualifiedLabel Rejection label when status is not allowed.
 * @returns {{target:number,confidence:number,rejectionReasons:string[],
 *   totalAttempts:number,winCount:number,
 *   attemptsPerRankSeatAndFirstPlayer:number|null}}
 */
function validateFieldLedger(request, allowedStatuses, unqualifiedLabel) {
  if (!request || !Array.isArray(request.originalSources) ||
      !Array.isArray(request.attempts)) {
    throw new TypeError('originalSources and attempts must be arrays');
  }
  const {originalSources, attempts, registeredAttemptCount,
    registrationSha, target = 0.995, confidence = 0.95} = request;
  if (!(target > 0 && target < 1) ||
      !(confidence > 0 && confidence < 1)) {
    throw new RangeError('target and confidence must be between 0 and 1');
  }
  let winCount = 0;

  const problems = new Set();
  const sourceByRank = new Map();
  if (originalSources.length !== FIELD_SIZE) problems.add('field-incomplete');
  for (const source of originalSources) {
    if (!Number.isInteger(source.rank) ||
        source.rank < 1 || source.rank > FIELD_SIZE ||
        sourceByRank.has(source.rank)) {
      problems.add('invalid-or-repeated-source-rank');
      continue;
    }
    sourceByRank.set(source.rank, source);
    if (!SHA256.test(source.source60Sha) ||
        source.authenticatedSource60 !== true) {
      problems.add('source-unverified');
    }
  }
  if (sourceByRank.size !== FIELD_SIZE) problems.add('field-incomplete');
  if (!Number.isSafeInteger(registeredAttemptCount) ||
      registeredAttemptCount !== attempts.length) {
    problems.add('incomplete-preregistered-attempt-ledger');
  }
  if (!SHA256.test(registrationSha)) problems.add('registration-unverified');
  const counts = Array.from({length: FIELD_SIZE}, () =>
    SEATS.map(() => [0, 0]));
  const trialIds = new Set();
  const physicalDealIds = new Set();
  const paperReceiptIds = new Set();
  let candidate60Sha = null;
  let candidatePolicySha = null;
  let engineAndHooksSha = null;
  let opponentPolicyBundleSha = null;
  let adjudicationProtocolSha = null;
  for (const attempt of attempts) {
    if (!Number.isInteger(attempt.rank) || attempt.rank < 1 ||
        attempt.rank > FIELD_SIZE || !SEATS.includes(attempt.seat) ||
        !FIRST_PLAYER_SEATS.includes(attempt.firstPlayerSeat)) {
      problems.add('invalid-rank-seat-or-first-player');
      continue;
    }
    counts[attempt.rank - 1][attempt.seat][attempt.firstPlayerSeat]++;
    const source = sourceByRank.get(attempt.rank);
    if (!source || attempt.source60Sha !== source.source60Sha) {
      problems.add('source-identity-mismatch');
    }
    if (!allowedStatuses.includes(attempt.status)) {
      problems.add(unqualifiedLabel);
    }
    if (attempt.status === 'paper-qualified-win') winCount++;
    for (const [key, seen, error] of [
      ['trialId', trialIds, 'duplicate-or-missing-trial'],
      ['physicalDealId', physicalDealIds, 'duplicate-or-missing-physical-deal'],
      ['paperReceiptId', paperReceiptIds, 'duplicate-or-missing-paper-receipt']
    ]) {
      const value = attempt[key];
      if (typeof value !== 'string' || value.length === 0 || seen.has(value)) {
        problems.add(error);
      } else {
        seen.add(value);
      }
    }
    if (!SHA256.test(attempt.candidate60Sha) ||
        !SHA256.test(attempt.candidatePolicySha)) {
      problems.add('candidate-or-policy-unverified');
    }
    if (candidate60Sha === null) candidate60Sha = attempt.candidate60Sha;
    if (candidatePolicySha === null) {
      candidatePolicySha = attempt.candidatePolicySha;
    }
    if (attempt.candidate60Sha !== candidate60Sha ||
        attempt.candidatePolicySha !== candidatePolicySha) {
      problems.add('candidate-or-policy-changed');
    }
    if (![attempt.engineAndHooksSha,
          attempt.opponentPolicyBundleSha,
          attempt.adjudicationProtocolSha].every(x => SHA256.test(x))) {
      problems.add('engine-opponent-or-adjudication-unverified');
    }
    if (engineAndHooksSha === null) {
      engineAndHooksSha = attempt.engineAndHooksSha;
    }
    if (opponentPolicyBundleSha === null) {
      opponentPolicyBundleSha = attempt.opponentPolicyBundleSha;
    }
    if (adjudicationProtocolSha === null) {
      adjudicationProtocolSha = attempt.adjudicationProtocolSha;
    }
    if (attempt.engineAndHooksSha !== engineAndHooksSha ||
        attempt.opponentPolicyBundleSha !== opponentPolicyBundleSha ||
        attempt.adjudicationProtocolSha !== adjudicationProtocolSha) {
      problems.add('engine-opponent-or-adjudication-changed');
    }
    if (attempt.registrationSha !== registrationSha) {
      problems.add('registration-mismatch');
    }
  }
  validateV3PolicyPanelJoin(request, attempts, problems,
    opponentPolicyBundleSha);
  const strata = counts.flat(2);
  const n = strata[0];
  if (n === 0 || strata.some(value => value !== n)) {
    problems.add('rank-seat-first-player-exposure-unbalanced');
  }
  const rejectionReasons = [...problems].sort();
  return {
    target, confidence, rejectionReasons, totalAttempts: attempts.length,
    winCount,
    attemptsPerRankSeatAndFirstPlayer:
      rejectionReasons.length === 0 ? n : null
  };
}

module.exports = {validateFieldLedger, validateOpponentPolicyFieldBundle, FIELD_SIZE};
