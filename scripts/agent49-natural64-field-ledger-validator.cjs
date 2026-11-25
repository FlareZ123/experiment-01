'use strict';

// Structural admission for the balanced natural-protocol 64-stratum field mean.
// This module deliberately does not authenticate source provenance, prove
// CSPRNG provenance/shuffle fairness, prove policy competence, or certify a
// statistical claim. It binds the evidence needed for an independent audit.

const {evidenceBundleSha256: canonicalSha256} =
  require('../simulation/evaluation/canonical-evidence-json.cjs');
const {
  validateOpponentPolicyFieldBundle, FIELD_SIZE
} = require('./agent12-balanced-field-ledger-validator.cjs');
const {
  PROTOCOL: RNG_PROTOCOL, validateRandomMaterial, randomMaterialCommitment
} = require('../simulation/evaluation/agent37-independent-rng-v1.cjs');

const SHA256 = /^[a-f0-9]{64}$/i;
const GIT_SHA = /^[a-f0-9]{40}$/i;
const SEATS = Object.freeze([0, 1]);
const STATUS_TO_RESULT = Object.freeze({
  'paper-qualified-win': 'candidate-win',
  'paper-qualified-loss': 'candidate-loss',
  'paper-qualified-tie': 'tie'
});
const CLOCK_MODES = new Set([
  'clock-free-game-win',
  'aichi-top32-event-clock'
]);
const DECISION_SCHEDULES = new Set([
  'fixed-1280',
  'two-look-1216-1280'
]);
const RNG_HOOKS = Object.freeze([
  'Gladion CIN',
  'Hisuian Heavy Ball ASR',
  'Marnie SSH',
  'Iono PAL'
]);
const MANIFEST_SCHEMA = 'aichi-natural64-field-registration-v1';
const ADJUDICATION_SCHEMA = 'aichi-natural64-adjudication-receipt-v1';
const RNG_RECEIPT_SCHEMA = 'aichi-natural64-rng-receipt-v1';
// Versioned name for agent37's Fisher-Yates permutation with rejection-sampled bounded integers.
const UNBIASED_SHUFFLE_METHOD = 'fisher-yates-bounded-rejection-v1';
const SAMPLING_MODEL = 'balanced-natural-64-strata-v1';
const REGISTERED_ATTEMPTS = 1280;
const GAMES_PER_STRATUM = 20;
const LOOK1_ATTEMPTS = 1216;

function isSha(value) {
  return typeof value === 'string' && SHA256.test(value);
}

function isGitSha(value) {
  return typeof value === 'string' && GIT_SHA.test(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function add(problems, reason) {
  problems.add(reason);
}

function receiptDigest(receipt) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) return null;
  const {receiptSha256, ...payload} = receipt;
  try {
    return isSha(receiptSha256) && canonicalSha256(payload) === receiptSha256;
  } catch {
    return false;
  }
}

function validateManifest(request, problems) {
  const manifest = request.fieldSamplingRegistration;
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    add(problems, 'field-sampling-registration-missing');
    return {manifest: null, roster: new Map(), registrationValid: false};
  }

  if (manifest.schema !== MANIFEST_SCHEMA) add(problems, 'field-sampling-registration-schema-invalid');
  if (manifest.samplingModel !== SAMPLING_MODEL ||
      request.stratumSamplingModel !== SAMPLING_MODEL) {
    add(problems, 'field-sampling-model-invalid');
  }
  if (manifest.target !== 0.995 || request.target !== 0.995 ||
      manifest.confidence !== 0.95 || request.confidence !== 0.95) {
    add(problems, 'field-sampling-inference-contract-mismatch');
  }
  if (manifest.registeredAttemptCount !== REGISTERED_ATTEMPTS ||
      request.registeredAttemptCount !== REGISTERED_ATTEMPTS) {
    add(problems, 'field-sampling-registered-attempt-count-invalid');
  }
  if (manifest.gamesPerStratum !== GAMES_PER_STRATUM) {
    add(problems, 'field-sampling-stratum-quota-invalid');
  }
  if (!DECISION_SCHEDULES.has(manifest.decisionSchedule)) {
    add(problems, 'field-sampling-decision-schedule-invalid');
  }
  if (manifest.maxNonwins !== 2 || manifest.stopAfterThirdNonwin !== true) {
    add(problems, 'field-sampling-stopping-rule-invalid');
  }
  if (manifest.preGameFailureDisposition !== 'invalidate-batch') {
    add(problems, 'field-sampling-pregame-failure-policy-invalid');
  }
  if (!CLOCK_MODES.has(manifest.clockMode)) {
    add(problems, 'adjudication-clock-mode-missing-or-invalid');
  }
  if (!isSha(manifest.adjudicationProtocolSha)) {
    add(problems, 'adjudication-protocol-unverified');
  }
  if (manifest.randomizationProtocol !== RNG_PROTOCOL ||
      manifest.unbiasedShuffleMethod !== UNBIASED_SHUFFLE_METHOD ||
      !isGitSha(manifest.rngProtocolModuleSha)) {
    add(problems, 'randomization-protocol-unverified');
  }
  for (const field of [
    'candidate60Sha', 'candidatePolicySha', 'engineAndHooksSha',
    'opponentPolicyBundleSha', 'policyPlanSha256'
  ]) {
    if (!isSha(manifest[field])) add(problems, 'fixed-experiment-identity-unverified:' + field);
  }
  if (!isGitSha(manifest.twinleafPin) || !isGitSha(manifest.runnerRevision)) {
    add(problems, 'engine-or-runner-revision-unverified');
  }
  if (typeof manifest.registeredAt !== 'string' ||
      !/(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(manifest.registeredAt) ||
      !Number.isFinite(Date.parse(manifest.registeredAt))) {
    add(problems, 'field-sampling-registration-time-invalid');
  }

  let digestValid = false;
  try {
    digestValid = isSha(request.registrationSha) &&
      canonicalSha256(manifest) === request.registrationSha;
  } catch {}
  if (!digestValid) add(problems, 'field-sampling-registration-digest-mismatch');

  const roster = new Map();
  if (!Array.isArray(manifest.attempts) ||
      manifest.attempts.length !== REGISTERED_ATTEMPTS) {
    add(problems, 'field-sampling-attempt-roster-invalid');
  } else {
    const roundCells = Array.from({length: 20}, () => new Set());
    for (let i = 0; i < manifest.attempts.length; i += 1) {
      const planned = manifest.attempts[i];
      const expectedRound = Math.floor(i / 64);
      if (!planned || typeof planned !== 'object' ||
          !isText(planned.trialId) || roster.has(planned.trialId) ||
          planned.sequenceIndex !== i || planned.roundIndex !== expectedRound ||
          !Number.isInteger(planned.rank) || planned.rank < 1 ||
          planned.rank > FIELD_SIZE || !SEATS.includes(planned.seat)) {
        add(problems, 'field-sampling-attempt-roster-invalid');
        continue;
      }
      const cell = planned.rank + ':' + planned.seat;
      if (roundCells[expectedRound].has(cell)) {
        add(problems, 'field-sampling-round-cell-duplicate');
      }
      roundCells[expectedRound].add(cell);
      roster.set(planned.trialId, planned);
    }
    if (roundCells.some(cells => cells.size !== 64)) {
      add(problems, 'field-sampling-round-cell-coverage-invalid');
    }
    if (roster.size !== REGISTERED_ATTEMPTS) {
      add(problems, 'field-sampling-attempt-roster-invalid');
    }
  }

  if (!Array.isArray(manifest.originalSources) ||
      manifest.originalSources.length !== FIELD_SIZE) {
    add(problems, 'field-sampling-source-roster-invalid');
  }

  return {manifest, roster, registrationValid: digestValid && roster.size === REGISTERED_ATTEMPTS};
}

function validateSources(originalSources, manifest, policyPlanCore, problems) {
  const sourceByRank = new Map();
  if (!Array.isArray(originalSources) || originalSources.length !== FIELD_SIZE) {
    add(problems, 'field-incomplete');
  }
  for (const source of Array.isArray(originalSources) ? originalSources : []) {
    if (!source || !Number.isInteger(source.rank) || source.rank < 1 ||
        source.rank > FIELD_SIZE || sourceByRank.has(source.rank)) {
      add(problems, 'invalid-or-repeated-source-rank');
      continue;
    }
    sourceByRank.set(source.rank, source);
    if (!isSha(source.source60Sha) || source.authenticatedSource60 !== true) {
      add(problems, 'source-unverified');
    }
  }
  if (sourceByRank.size !== FIELD_SIZE) add(problems, 'field-incomplete');

  const planned = new Map();
  for (const source of Array.isArray(manifest?.originalSources) ? manifest.originalSources : []) {
    if (!source || !Number.isInteger(source.rank) || source.rank < 1 ||
        source.rank > FIELD_SIZE || planned.has(source.rank) ||
        !isSha(source.source60Sha)) {
      add(problems, 'field-sampling-source-roster-invalid');
      continue;
    }
    planned.set(source.rank, source.source60Sha);
  }
  if (planned.size !== FIELD_SIZE) add(problems, 'field-sampling-source-roster-invalid');
  for (const [rank, source] of sourceByRank) {
    if (planned.get(rank) !== source.source60Sha) {
      add(problems, 'field-sampling-source-roster-mismatch');
    }
  }

  const ranks = policyPlanCore?.opponentPolicyBundle?.ranks;
  if (!Array.isArray(ranks) || ranks.length !== FIELD_SIZE) {
    add(problems, 'policy-plan-field-incomplete');
  } else {
    for (let rank = 1; rank <= FIELD_SIZE; rank += 1) {
      const policyRank = ranks[rank - 1];
      const source = sourceByRank.get(rank);
      if (!policyRank || policyRank.rank !== rank ||
          policyRank.sourceStatus !== 'authenticated' ||
          !source || policyRank.deckSha256 !== source.source60Sha) {
        add(problems, 'policy-plan-source-identity-mismatch');
      }
    }
  }
  return sourceByRank;
}

function validateNaturalStarter(attempt, problems) {
  const coin = attempt.coinWinnerSeat;
  const chooser = attempt.chooserSeat;
  if (!SEATS.includes(coin) || !SEATS.includes(chooser) || chooser !== coin) {
    add(problems, 'natural-coin-chooser-invalid');
    return;
  }
  if (attempt.goFirstResponse !== 'yes' && attempt.goFirstResponse !== 'no') {
    add(problems, 'natural-go-first-response-invalid');
    return;
  }
  const expectedStarter = attempt.goFirstResponse === 'yes' ? chooser : 1 - chooser;
  if (attempt.firstPlayerSeat !== expectedStarter ||
      attempt.actualFirstPlayerSeat !== expectedStarter) {
    add(problems, 'natural-first-player-mismatch');
  }
  if (attempt.hostOverride !== false) add(problems, 'host-first-player-override-present');
}

function validateAdjudicationReceipt(attempt, manifest, problems) {
  const receipt = attempt.adjudicationReceipt;
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    add(problems, 'terminal-adjudication-receipt-missing');
    return;
  }
  const result = STATUS_TO_RESULT[attempt.status];
  if (!result) add(problems, 'outcome-status-invalid');
  if (receipt.schema !== ADJUDICATION_SCHEMA ||
      receipt.receiptId !== attempt.paperReceiptId ||
      !isText(receipt.receiptId)) {
    add(problems, 'terminal-adjudication-receipt-identity-invalid');
  }
  if (receipt.trialId !== attempt.trialId ||
      receipt.rank !== attempt.rank ||
      receipt.candidateSeat !== attempt.seat ||
      receipt.opponentSeat !== 1 - attempt.seat ||
      receipt.candidate60Sha !== attempt.candidate60Sha ||
      receipt.source60Sha !== attempt.source60Sha ||
      receipt.candidatePolicySha !== attempt.candidatePolicySha ||
      receipt.opponentPolicyBundleSha !== attempt.opponentPolicyBundleSha ||
      receipt.enginePin !== attempt.enginePin ||
      receipt.runnerRevision !== attempt.runnerRevision ||
      receipt.actualFirstPlayerSeat !== attempt.firstPlayerSeat ||
      receipt.coinWinnerSeat !== attempt.coinWinnerSeat ||
      receipt.chooserSeat !== attempt.chooserSeat ||
      receipt.goFirstResponse !== attempt.goFirstResponse ||
      receipt.hostOverride !== attempt.hostOverride ||
      receipt.startedAt !== attempt.startedAt ||
      receipt.endedAt !== attempt.endedAt ||
      receipt.registrationSha !== attempt.registrationSha ||
      receipt.randomizationReceiptSha256 !== attempt.randomizationReceiptSha256 ||
      receipt.policyApplicationReceiptSha256 !== attempt.policyApplicationReceiptSha256) {
    add(problems, 'terminal-adjudication-receipt-outcome-mismatch');
  }
  if (!isSha(receipt.engineTerminalSha256) ||
      !isSha(receipt.adjudicatorAttestationSha256) ||
      !isText(receipt.adjudicatorId) || !isText(receipt.terminalClass)) {
    add(problems, 'terminal-adjudication-receipt-evidence-unverified');
  }
  if (receipt.gameStarted !== true || receipt.terminalReached !== true ||
      receipt.adjudicationStatus !== 'determinate') {
    add(problems, 'terminal-adjudication-not-determinate');
  }
  const adjudicatedAt = Date.parse(receipt.adjudicatedAt);
  const endedAt = Date.parse(attempt.endedAt);
  if (typeof receipt.adjudicatedAt !== 'string' ||
      !/(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(receipt.adjudicatedAt) ||
      !Number.isFinite(adjudicatedAt) || !Number.isFinite(endedAt) ||
      adjudicatedAt < endedAt) {
    add(problems, 'terminal-adjudication-time-invalid');
  }
  if (!['candidate-win', 'candidate-loss', 'tie'].includes(receipt.adjudicatedCandidateResult) ||
      receipt.adjudicatedCandidateResult !== result) {
    add(problems, 'terminal-adjudication-result-status-mismatch');
  }
  if (receipt.clockMode !== manifest.clockMode ||
      receipt.adjudicationProtocolSha !== manifest.adjudicationProtocolSha ||
      attempt.adjudicationProtocolSha !== manifest.adjudicationProtocolSha) {
    add(problems, 'terminal-adjudication-protocol-mismatch');
  }
  if (!receiptDigest(receipt) ||
      attempt.adjudicationReceiptSha256 !== receipt.receiptSha256) {
    add(problems, 'terminal-adjudication-receipt-digest-invalid');
  }
}

function validateRandomization(attempt, manifest, problems) {
  let commitment = null;
  try {
    const material = validateRandomMaterial(attempt.rngMaterial);
    commitment = randomMaterialCommitment(material);
  } catch {
    add(problems, 'independent-rng-material-invalid');
  }
  if (!commitment || attempt.rngMaterialCommitment !== commitment ||
      attempt.observedRngProtocol !== RNG_PROTOCOL ||
      attempt.observedRngMaterialCommitment !== commitment) {
    add(problems, 'independent-rng-observation-mismatch');
  }
  const options = attempt.effectiveMatchOptions;
  if (!options || typeof options !== 'object' ||
      options.rngProtocol !== RNG_PROTOCOL ||
      options.physicalShuffleRandomIsolation !== true ||
      options.aichiFieldPaperShuffleRandomIsolation !== true ||
      JSON.stringify(options.aichiFieldPaperShuffleRandomIsolationHooks) !== JSON.stringify(RNG_HOOKS) ||
      options.unbiasedShuffleMethod !== UNBIASED_SHUFFLE_METHOD ||
      options.hisuianHeavyBallPrizeShuffleCorrection !== true ||
      options.coinRandomIsolation !== true ||
      options.engineRandomIsolation !== true) {
    add(problems, 'independent-rng-hook-evidence-incomplete');
  }
  const payload = {
    schema: RNG_RECEIPT_SCHEMA,
    trialId: attempt.trialId,
    rngProtocol: RNG_PROTOCOL,
    rngMaterialCommitment: attempt.rngMaterialCommitment,
    observedRngProtocol: attempt.observedRngProtocol,
    observedRngMaterialCommitment: attempt.observedRngMaterialCommitment,
    coinWinnerSeat: attempt.coinWinnerSeat,
    unbiasedShuffleMethod: options && options.unbiasedShuffleMethod,
    effectiveMatchOptions: options
  };
  try {
    if (!isSha(attempt.randomizationReceiptSha256) ||
        canonicalSha256(payload) !== attempt.randomizationReceiptSha256) {
      add(problems, 'independent-rng-receipt-digest-invalid');
    }
  } catch {
    add(problems, 'independent-rng-receipt-digest-invalid');
  }
}

function validatePolicyPanel(request, attempts, manifest, problems) {
  if (!request.policyPlanCore || !Array.isArray(request.policyPanelReceipts)) {
    add(problems, 'v3-policy-panel-evidence-incomplete');
    return;
  }
  let panel;
  try {
    panel = validateOpponentPolicyFieldBundle({
      policyPlanCore: request.policyPlanCore,
      expectedPolicyPlanSha256: request.policyPlanSha256,
      gameReceipts: request.policyPanelReceipts
    });
  } catch {
    add(problems, 'v3-policy-panel-invalid');
    return;
  }
  if (panel.status !== 'VALID') add(problems, 'v3-policy-panel-invalid');
  if (panel.policyPlanSha256 !== manifest.policyPlanSha256 ||
      panel.opponentPolicyBundleSha256 !== manifest.opponentPolicyBundleSha) {
    add(problems, 'v3-policy-plan-or-bundle-mismatch');
  }
  if (request.policyPanelReceipts.length !== attempts.length) {
    add(problems, 'v3-policy-panel-attempt-count-mismatch');
  }

  const byTrial = new Map();
  for (const receipt of request.policyPanelReceipts) {
    if (!receipt || typeof receipt !== 'object' ||
        !isText(receipt.trialId) || byTrial.has(receipt.trialId)) {
      add(problems, 'v3-policy-panel-trial-identity-invalid');
      continue;
    }
    byTrial.set(receipt.trialId, receipt);
  }
  const attemptIds = new Set();
  for (const attempt of attempts) {
    if (!attempt || typeof attempt !== 'object' ||
        !isText(attempt.trialId) || attemptIds.has(attempt.trialId)) continue;
    attemptIds.add(attempt.trialId);
    const receipt = byTrial.get(attempt.trialId);
    if (!receipt) {
      add(problems, 'v3-policy-receipt-missing-for-outcome');
      continue;
    }
    if (receipt.opponentRank !== attempt.rank ||
        receipt.candidateSeat !== attempt.seat ||
        receipt.firstPlayerSeat !== attempt.firstPlayerSeat ||
        receipt.opponentSeat !== 1 - attempt.seat ||
        receipt.candidateDeckSha256 !== attempt.candidate60Sha ||
        receipt.candidatePolicySha256 !== attempt.candidatePolicySha ||
        receipt.opponentDeckSha256 !== attempt.source60Sha ||
        receipt.opponentPolicyBundleSha256 !== manifest.opponentPolicyBundleSha ||
        attempt.opponentPolicyBundleSha !== manifest.opponentPolicyBundleSha ||
        attempt.policyPlanSha256 !== manifest.policyPlanSha256 ||
        attempt.policyRegistrationSha256 !== receipt.policyRegistrationSha256 ||
        attempt.policyAttestationBundleSha256 !== receipt.policyAttestationBundleSha256 ||
        attempt.policyApplicationReceiptSha256 !== receipt.receiptSha256) {
      add(problems, 'v3-policy-receipt-outcome-mismatch');
    }
    if (!receiptDigest(receipt)) add(problems, 'v3-policy-application-receipt-digest-invalid');
  }
  for (const trialId of byTrial.keys()) {
    if (!attemptIds.has(trialId)) add(problems, 'v3-policy-receipt-without-outcome');
  }
}

function evaluateStoppingRule(attempts, manifest, problems) {
  const counts = {wins: 0, losses: 0, ties: 0};
  for (const attempt of attempts) {
    if (!attempt || typeof attempt !== 'object') continue;
    if (attempt.status === 'paper-qualified-win') counts.wins += 1;
    else if (attempt.status === 'paper-qualified-loss') counts.losses += 1;
    else if (attempt.status === 'paper-qualified-tie') counts.ties += 1;
  }
  const nonwins = counts.losses + counts.ties;
  const n = attempts.length;
  const thirdNonwinIndex = (() => {
    let seen = 0;
    for (let i = 0; i < attempts.length; i += 1) {
      if (attempts[i] && attempts[i].status !== 'paper-qualified-win') {
        seen += 1;
        if (seen === 3) return i;
      }
    }
    return -1;
  })();

  if (manifest.decisionSchedule === 'two-look-1216-1280' &&
      n > LOOK1_ATTEMPTS &&
      attempts.slice(0, LOOK1_ATTEMPTS).every(a => a && a.status === 'paper-qualified-win')) {
    add(problems, 'two-look-continued-after-early-pass');
    return {disposition: 'INVALID_STOP', met: false, counts};
  }

  if (nonwins >= 3) {
    if (nonwins !== 3 || thirdNonwinIndex !== n - 1) {
      add(problems, 'futility-stop-not-immediate');
      return {disposition: 'INVALID_STOP', met: false, counts};
    }
    return {disposition: 'FUTILITY_STOP', met: false, counts};
  }

  if (manifest.decisionSchedule === 'fixed-1280') {
    if (n !== REGISTERED_ATTEMPTS) {
      return {disposition: 'INCOMPLETE', met: null, counts};
    }
    return {disposition: nonwins <= 2 ? 'PASS' : 'FAIL',
      met: nonwins <= 2, counts};
  }

  if (manifest.decisionSchedule === 'two-look-1216-1280') {
    if (n === LOOK1_ATTEMPTS && nonwins === 0) {
      return {disposition: 'PASS_EARLY_ALL_WIN', met: true, counts};
    }
    if (n === REGISTERED_ATTEMPTS) {
      const firstLookNonwins = attempts.slice(0, LOOK1_ATTEMPTS)
        .filter(a => !a || a.status !== 'paper-qualified-win').length;
      if (firstLookNonwins === 0) {
        add(problems, 'two-look-continued-after-early-pass');
        return {disposition: 'INVALID_STOP', met: false, counts};
      }
      return {disposition: nonwins <= 2 ? 'PASS_FINAL' : 'FAIL',
        met: nonwins <= 2, counts};
    }
    return {disposition: 'INCOMPLETE', met: null, counts};
  }
  return {disposition: 'INVALID_SCHEDULE', met: false, counts};
}

/**
 * Validate a preregistered 32-rank × candidate-physical-seat design. Actual
 * first-player seat is observed from the natural coin/GO_FIRST sequence and
 * is never quota-balanced. A pre-game failure invalidates this batch under
 * the registered conservative disposition. Repeated random seeds/deals are
 * permitted: sampling is with replacement and no redraw/uniqueness filter is
 * applied to random material or physicalDealId.
 */
function validateNatural64FieldLedger(request) {
  if (!request || !Array.isArray(request.originalSources) ||
      !Array.isArray(request.attempts)) {
    throw new TypeError('originalSources and attempts must be arrays');
  }
  const problems = new Set();
  const target = request.target ?? 0.995;
  const confidence = request.confidence ?? 0.95;
  const {manifest, registrationValid} = validateManifest(request, problems);
  if (!manifest) {
    return {
      status: 'INVALID', rejectionReasons: [...problems].sort(),
      totalAttempts: request.attempts.length, winCount: 0, nonWinCount: 0,
      designThresholdMet: null, decisionRuleDisposition: 'INVALID_REGISTRATION',
      structuralAdmissionOnly: true,
      sourceAuthenticityProven: false,
      policyCompetenceProven: false,
      rngIntegrationProven: false,
      paperAdjudicatorSignatureVerified: false,
      externalQualificationRequired: true,
      statisticalCertification: 'NOT_ESTABLISHED'
    };
  }

  const sourceByRank = validateSources(request.originalSources, manifest,
    request.policyPlanCore, problems);

  let policyPlanDigest = null;
  let policyBundleDigest = null;
  try {
    if (request.policyPlanCore && typeof request.policyPlanCore === 'object') {
      policyPlanDigest = canonicalSha256(request.policyPlanCore);
      policyBundleDigest = canonicalSha256(request.policyPlanCore.opponentPolicyBundle);
    }
  } catch {}
  if (request.policyPlanSha256 !== manifest.policyPlanSha256 ||
      !isSha(request.policyPlanSha256) ||
      policyPlanDigest !== request.policyPlanSha256) {
    add(problems, 'policy-plan-registration-mismatch');
  }
  if (policyBundleDigest !== manifest.opponentPolicyBundleSha) {
    add(problems, 'opponent-policy-bundle-registration-mismatch');
  }
  if (request.policyPlanCore?.candidate?.deckSha256 !== manifest.candidate60Sha ||
      request.policyPlanCore?.candidate?.policySha256 !== manifest.candidatePolicySha) {
    add(problems, 'candidate-policy-plan-registration-mismatch');
  }

  const attempts = request.attempts;
  if (attempts.length > REGISTERED_ATTEMPTS) add(problems, 'attempt-count-exceeds-registration');
  const trialIds = new Set();
  const paperReceiptIds = new Set();
  const rngCommitmentTrials = new Map();

  for (let i = 0; i < attempts.length; i += 1) {
    const attempt = attempts[i];
    const planned = manifest.attempts?.[i];
    if (!attempt || typeof attempt !== 'object' || Array.isArray(attempt)) {
      add(problems, 'attempt-record-invalid');
      continue;
    }
    if (!planned || attempt.trialId !== planned.trialId ||
        attempt.sequenceIndex !== i || attempt.roundIndex !== Math.floor(i / 64) ||
        attempt.rank !== planned.rank || attempt.seat !== planned.seat) {
      add(problems, 'attempt-roster-prefix-mismatch');
    }
    if (!isText(attempt.trialId) || trialIds.has(attempt.trialId)) {
      add(problems, 'duplicate-or-missing-trial');
    } else {
      trialIds.add(attempt.trialId);
    }
    if (!Number.isInteger(attempt.rank) || attempt.rank < 1 ||
        attempt.rank > FIELD_SIZE || !SEATS.includes(attempt.seat)) {
      add(problems, 'invalid-rank-or-candidate-seat');
      continue;
    }
    const source = sourceByRank.get(attempt.rank);
    if (!source || attempt.source60Sha !== source.source60Sha) {
      add(problems, 'source-identity-mismatch');
    }
    for (const [field, manifestField] of [
      ['candidate60Sha', 'candidate60Sha'],
      ['candidatePolicySha', 'candidatePolicySha'],
      ['engineAndHooksSha', 'engineAndHooksSha'],
      ['opponentPolicyBundleSha', 'opponentPolicyBundleSha'],
      ['adjudicationProtocolSha', 'adjudicationProtocolSha']
    ]) {
      const expected = manifest[manifestField];
      if (attempt[field] !== expected) add(problems, 'attempt-fixed-identity-mismatch:' + field);
    }
    if (attempt.enginePin !== manifest.twinleafPin ||
        attempt.runnerRevision !== manifest.runnerRevision) {
      add(problems, 'attempt-engine-or-runner-mismatch');
    }
    if (attempt.registrationSha !== request.registrationSha ||
        attempt.policyPlanSha256 !== manifest.policyPlanSha256) {
      add(problems, 'attempt-registration-or-policy-plan-mismatch');
    }
    if (attempt.opponentSeat !== 1 - attempt.seat) {
      add(problems, 'opponent-seat-mismatch');
    }
    if (!['paper-qualified-win', 'paper-qualified-loss',
         'paper-qualified-tie'].includes(attempt.status)) {
      add(problems, 'attempt-status-invalid-or-pregame-failure');
    }
    if (attempt.gameStarted !== true || attempt.terminalReached !== true) {
      add(problems, 'attempt-is-not-a-completed-game');
    }
    validateNaturalStarter(attempt, problems);
    if (!isText(attempt.paperReceiptId) || paperReceiptIds.has(attempt.paperReceiptId)) {
      add(problems, 'duplicate-or-missing-paper-receipt');
    } else {
      paperReceiptIds.add(attempt.paperReceiptId);
    }
    const registeredAt = Date.parse(manifest.registeredAt);
    const startedAt = Date.parse(attempt.startedAt);
    const endedAt = Date.parse(attempt.endedAt);
    if (typeof attempt.startedAt !== 'string' ||
        typeof attempt.endedAt !== 'string' ||
        !/(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(attempt.startedAt) ||
        !/(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(attempt.endedAt) ||
        !Number.isFinite(startedAt) || !Number.isFinite(endedAt) ||
        startedAt < registeredAt || endedAt < startedAt) {
      add(problems, 'attempt-time-or-preregistration-invalid');
    }
    validateAdjudicationReceipt(attempt, manifest, problems);
    validateRandomization(attempt, manifest, problems);
    if (isSha(attempt.rngMaterialCommitment)) {
      const ids = rngCommitmentTrials.get(attempt.rngMaterialCommitment) || [];
      ids.push(attempt.trialId);
      rngCommitmentTrials.set(attempt.rngMaterialCommitment, ids);
    }
  }

  validatePolicyPanel(request, attempts, manifest, problems);

  const stopping = evaluateStoppingRule(attempts, manifest, problems);
  const rejectionReasons = [...problems].sort();
  const structuralValid = rejectionReasons.length === 0;
  const rankSummary = Array.from({length: FIELD_SIZE}, (_, index) => {
    const bySeat = [0, 1].map(seat => {
      const rows = attempts.filter(a => a && a.rank === index + 1 && a.seat === seat);
      return {
        attempts: rows.length,
        wins: rows.filter(a => a && a.status === 'paper-qualified-win').length,
        losses: rows.filter(a => a && a.status === 'paper-qualified-loss').length,
        ties: rows.filter(a => a && a.status === 'paper-qualified-tie').length,
        noWinnerTerminals: rows.filter(a => a && a.adjudicationReceipt &&
          a.adjudicationReceipt.terminalClass === 'no-winner').length
      };
    });
    return {rank: index + 1, seat0: bySeat[0], seat1: bySeat[1]};
  });
  const nonWinCount = stopping.counts.losses + stopping.counts.ties;
  const noWinnerTerminalCount = attempts.filter(a => a && a.adjudicationReceipt &&
    a.adjudicationReceipt.terminalClass === 'no-winner').length;
  const repeatedRandomizationMaterialGroups = [...rngCommitmentTrials.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([commitment, trialIds]) => ({commitment, trialIds}));
  const warnings = repeatedRandomizationMaterialGroups.length
    ? ['repeated-rng-material-commitment-requires-independent-draw-audit']
    : [];
  return {
    status: structuralValid ? (stopping.disposition === 'INCOMPLETE' ? 'INCOMPLETE' : 'VALID') : 'INVALID',
    target, confidence,
    totalAttempts: attempts.length,
    registeredAttemptCount: REGISTERED_ATTEMPTS,
    winCount: stopping.counts.wins,
    lossCount: stopping.counts.losses,
    tieCount: stopping.counts.ties,
    noWinnerTerminalCount,
    nonWinCount,
    observedWinRate: attempts.length ? stopping.counts.wins / attempts.length : null,
    attemptsPerRankAndCandidateSeat:
      attempts.length === LOOK1_ATTEMPTS ? 19 :
      attempts.length === REGISTERED_ATTEMPTS ? 20 : null,
    rankSummary,
    repeatedRandomizationMaterialGroups,
    warnings,
    decisionRuleDisposition: stopping.disposition,
    designThresholdMet: structuralValid ? stopping.met : null,
    samplingModelRegistrationValid: registrationValid && structuralValid,
    clockMode: manifest.clockMode,
    randomizationProtocol: manifest.randomizationProtocol,
    unbiasedShuffleMethod: manifest.unbiasedShuffleMethod,
    structuralAdmissionOnly: true,
    sourceAuthenticityProven: false,
    policyCompetenceProven: false,
    rngIntegrationProven: false,
    paperAdjudicatorSignatureVerified: false,
    externalQualificationRequired: true,
    statisticalCertification: 'NOT_ESTABLISHED',
    rejectionReasons
  };
}

module.exports = {
  validateNatural64FieldLedger,
  NATURAL64_MANIFEST_SCHEMA: MANIFEST_SCHEMA,
  NATURAL64_SAMPLING_MODEL: SAMPLING_MODEL,
  NATURAL64_ADJUDICATION_SCHEMA: ADJUDICATION_SCHEMA,
  NATURAL64_RNG_PROTOCOL: RNG_PROTOCOL,
  NATURAL64_UNBIASED_SHUFFLE_METHOD: UNBIASED_SHUFFLE_METHOD
};
