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
const {
  validateTerminalAdjudicationReceipt,
  RECEIPT_SCHEMA: ADJUDICATION_SCHEMA,
  RESULT_TO_STATUS,
  NO_WINNER_STATUS,
  TERMINAL_CLASS_ALLOWED_RESULTS,
  TERMINAL_CLASS_ALLOWED_REASONS
} = require('./2026-11/shared/terminal-adjudication-receipt.cjs');

const SHA256 = /^[a-f0-9]{64}$/i;
const GIT_SHA = /^[a-f0-9]{40}$/i;
const SEATS = Object.freeze([0, 1]);
const CLOCK_MODES = new Set([
  'clock-free-game-win',
  'aichi-top32-event-clock'
]);
const DECISION_SCHEDULES = new Set(['two-look-1216-1280']);
const PRE_GAME_FAILURE_CLASSES = new Set([
  'runner-launch-failure',
  'engine-startup-failure',
  'pre-game-harness-failure',
  'registered-input-failure'
]);
const PRE_GAME_FAILURE_EVIDENCE_KEYS = new Set([
  'schema', 'attemptId', 'trialId', 'slotId', 'failureClass',
  'failureCriteriaSha256', 'enginePin', 'runnerRevision',
  'gameStarted', 'terminalReached', 'failureDisposition',
  'observedAt', 'evidenceSha256'
]);
const EFFECTIVE_MATCH_OPTIONS_KEYS = new Set([
  'rngProtocol', 'isolatePolicyRandomness', 'physicalShuffleRandomIsolation',
  'aichiFieldPaperShuffleRandomIsolation',
  'aichiFieldPaperShuffleRandomIsolationHooks',
  'hisuianHeavyBallPrizeShuffleCorrection', 'coinRandomIsolation',
  'engineRandomIsolation'
]);

// A pre-game attempt is a closed record too. Only slot/trial identity and
// registered provenance metadata may remain; no nested setup/coin/terminal/RNG
// receipt or arbitrary extension can ride along with a retry.
const PRE_GAME_FAILURE_ATTEMPT_KEYS = new Set([
  'attemptId', 'trialId', 'slotId', 'sequenceIndex', 'roundIndex',
  'attemptNumber', 'retryOfAttemptId', 'rank', 'seat', 'opponentSeat',
  'status', 'gameStarted', 'terminalReached',
  'source60Sha', 'candidate60Sha', 'candidatePolicySha',
  'engineAndHooksSha', 'opponentPolicyBundleSha',
  'adjudicationProtocolSha256', 'registrationSha',
  'enginePin', 'runnerRevision', 'startedAt', 'endedAt',
  'policyPlanSha256',
  'paperReceiptId', 'terminalAdjudicationReceipt',
  'terminalAdjudicationReceiptSha256',
  'failureClass', 'failureCriteriaSha256', 'failureEvidenceSha256'
]);
const PLAYED_ATTEMPT_KEYS = new Set([
  'attemptId', 'trialId', 'slotId', 'sequenceIndex', 'roundIndex',
  'attemptNumber', 'retryOfAttemptId', 'rank', 'seat', 'opponentSeat',
  'firstPlayerSeat', 'actualFirstPlayerSeat', 'coinWinnerSeat', 'chooserSeat',
  'goFirstResponse', 'hostOverride', 'physicalDealId', 'paperReceiptId',
  'status', 'gameStarted', 'terminalReached', 'source60Sha', 'candidate60Sha',
  'candidatePolicySha', 'engineAndHooksSha', 'opponentPolicyBundleSha',
  'adjudicationProtocolSha256', 'registrationSha', 'enginePin', 'runnerRevision',
  'startedAt', 'endedAt', 'policyPlanSha256', 'policyRegistrationSha256',
  'policyAttestationBundleSha256', 'policyApplicationReceiptSha256',
  'rngProtocol', 'rngMaterial', 'rngMaterialCommitment', 'observedRngProtocol',
  'observedRngMaterialCommitment', 'effectiveMatchOptions',
  'randomizationReceiptSha256', 'setupCoinChoiceReceiptSha256',
  'setupCoinChoiceEvidenceSha256', 'terminalAdjudicationReceipt',
  'terminalAdjudicationReceiptSha256'
]);
const PLAYED_STATUSES = new Set([...Object.values(RESULT_TO_STATUS), NO_WINNER_STATUS]);
const RNG_HOOKS = Object.freeze([
  'Gladion CIN',
  'Hisuian Heavy Ball ASR',
  'Marnie SSH',
  'Iono PAL'
]);
const MANIFEST_SCHEMA = 'aichi-natural64-field-registration-v6';
const RNG_RECEIPT_SCHEMA = 'aichi-natural64-rng-receipt-v1';
const ADJUDICATION_PROTOCOL_SCHEMA = 'aichi-natural64-adjudication-protocol-v2';
const PRE_GAME_FAILURE_EVIDENCE_SCHEMA = 'aichi-natural64-pre-game-failure-evidence-v1';
const UNBIASED_SHUFFLE_METHOD = 'fisher-yates-bounded-rejection-v1';
const SAMPLING_MODEL = 'balanced-natural-64-strata-v1';
const RNG_BUNDLE_SAMPLING = 'independent-with-replacement';
const REGISTERED_SLOTS = 1280;
const GAMES_PER_STRATUM = 20;
const LOOK1_GAMES = 1216;

function isSha(value) {
  return typeof value === 'string' && SHA256.test(value);
}

function isGitSha(value) {
  return typeof value === 'string' && GIT_SHA.test(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validIso(value) {
  return typeof value === 'string' &&
    /(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
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

function validateAdjudicationProtocol(protocol, protocolSha256, problems) {
  if (!protocol || typeof protocol !== 'object' || Array.isArray(protocol) ||
      protocol.schema !== ADJUDICATION_PROTOCOL_SCHEMA ||
      !Array.isArray(protocol.rules) || protocol.rules.length === 0) {
    add(problems, 'adjudication-protocol-content-invalid');
    return;
  }
  let digestValid = false;
  try {
    digestValid = isSha(protocolSha256) &&
      canonicalSha256(protocol) === protocolSha256;
  } catch {}
  if (!digestValid) add(problems, 'adjudication-protocol-content-digest-mismatch');

  const ruleIds = new Set();
  for (const rule of protocol.rules) {
    if (!rule || typeof rule !== 'object' || Array.isArray(rule) ||
        !isText(rule.ruleId) || ruleIds.has(rule.ruleId) ||
        !isText(rule.reason) || !isText(rule.terminalClass) ||
        !Array.isArray(rule.allowedResults) || rule.allowedResults.length === 0 ||
        !Array.isArray(TERMINAL_CLASS_ALLOWED_RESULTS[rule.terminalClass]) ||
        rule.allowedResults.length !== TERMINAL_CLASS_ALLOWED_RESULTS[rule.terminalClass].length ||
        TERMINAL_CLASS_ALLOWED_RESULTS[rule.terminalClass].some(result =>
          !rule.allowedResults.includes(result)) ||
        !Array.isArray(TERMINAL_CLASS_ALLOWED_REASONS[rule.terminalClass]) ||
        !TERMINAL_CLASS_ALLOWED_REASONS[rule.terminalClass].includes(rule.reason) ||
        new Set(rule.allowedResults).size !== rule.allowedResults.length ||
        !CLOCK_MODES.has(rule.clockMode) ||
        (rule.terminalClass === 'opponent-timeout' ||
          rule.terminalClass === 'candidate-timeout' ||
          (rule.terminalClass === 'top32-prize-tiebreaker' &&
            rule.clockMode !== 'aichi-top32-event-clock') ||
          (rule.terminalClass === 'draw' &&
            rule.clockMode === 'aichi-top32-event-clock'))) {
      add(problems, 'adjudication-protocol-rule-invalid');
      continue;
    }
    ruleIds.add(rule.ruleId);
  }
}

function validateManifest(request, problems) {
  const manifest = request.fieldSamplingRegistration;
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    add(problems, 'field-sampling-registration-missing');
    return {manifest: null, slotRoster: new Map(), registrationValid: false};
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
  if (manifest.registeredSlotCount !== REGISTERED_SLOTS ||
      request.registeredSlotCount !== REGISTERED_SLOTS) {
    add(problems, 'field-sampling-registered-slot-count-invalid');
  }
  if (manifest.gamesPerStratum !== GAMES_PER_STRATUM) {
    add(problems, 'field-sampling-stratum-quota-invalid');
  }
  if (!DECISION_SCHEDULES.has(manifest.decisionSchedule) ||
      manifest.look1GameCount !== LOOK1_GAMES) {
    add(problems, 'field-sampling-decision-schedule-invalid');
  }
  if (manifest.maxNonwins !== 2 || manifest.stopAfterThirdNonwin !== true) {
    add(problems, 'field-sampling-stopping-rule-invalid');
  }
  if (manifest.preGameFailureDisposition !== 'retry-registered-budget-then-invalidate-batch' ||
      !Number.isInteger(manifest.maxPreGameRetriesPerSlot) ||
      manifest.maxPreGameRetriesPerSlot < 0 ||
      manifest.maxPreGameRetriesPerSlot > 2 ||
      !isSha(manifest.preGameFailureCriteriaSha256)) {
    add(problems, 'field-sampling-pregame-retry-policy-invalid');
  }
  if (!CLOCK_MODES.has(manifest.clockMode)) {
    add(problems, 'adjudication-clock-mode-missing-or-invalid');
  }
  if (manifest.clockMode === 'aichi-top32-event-clock') {
    add(problems, 'aichi-top32-event-clock-evidence-unsupported');
  }
  validateAdjudicationProtocol(
    manifest.adjudicationProtocol, manifest.adjudicationProtocolSha256, problems);
  if (manifest.randomizationProtocol !== RNG_PROTOCOL ||
      manifest.rngBundleSampling !== RNG_BUNDLE_SAMPLING ||
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

  const slotRoster = new Map();
  if (!Array.isArray(manifest.slots) || manifest.slots.length !== REGISTERED_SLOTS) {
    add(problems, 'field-sampling-slot-roster-invalid');
  } else {
    const roundCells = Array.from({length: 20}, () => new Set());
    for (let i = 0; i < manifest.slots.length; i += 1) {
      const planned = manifest.slots[i];
      const expectedRound = Math.floor(i / 64);
      if (!planned || typeof planned !== 'object' ||
          !isText(planned.slotId) || slotRoster.has(planned.slotId) ||
          planned.sequenceIndex !== i || planned.roundIndex !== expectedRound ||
          !Number.isInteger(planned.rank) || planned.rank < 1 ||
          planned.rank > FIELD_SIZE || !SEATS.includes(planned.seat)) {
        add(problems, 'field-sampling-slot-roster-invalid');
        continue;
      }
      const cell = planned.rank + ':' + planned.seat;
      if (roundCells[expectedRound].has(cell)) {
        add(problems, 'field-sampling-round-cell-duplicate');
      }
      roundCells[expectedRound].add(cell);
      slotRoster.set(planned.slotId, planned);
    }
    if (roundCells.some(cells => cells.size !== 64)) {
      add(problems, 'field-sampling-round-cell-coverage-invalid');
    }
    if (slotRoster.size !== REGISTERED_SLOTS) {
      add(problems, 'field-sampling-slot-roster-invalid');
    }
  }

  if (!Array.isArray(manifest.originalSources) ||
      manifest.originalSources.length !== FIELD_SIZE) {
    add(problems, 'field-sampling-source-roster-invalid');
  }

  return {
    manifest,
    slotRoster,
    registrationValid: digestValid && slotRoster.size === REGISTERED_SLOTS
  };
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

function evidenceDigest(evidence) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) return false;
  const {evidenceSha256, ...payload} = evidence;
  try {
    return isSha(evidenceSha256) && canonicalSha256(payload) === evidenceSha256;
  } catch {
    return false;
  }
}

function validatePreGameFailureEvidence(attempt, evidence, manifest, problems) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence) ||
      Object.keys(evidence).some(key => !PRE_GAME_FAILURE_EVIDENCE_KEYS.has(key)) ||
      evidence.schema !== PRE_GAME_FAILURE_EVIDENCE_SCHEMA ||
      evidence.attemptId !== attempt.attemptId ||
      evidence.trialId !== attempt.trialId ||
      evidence.slotId !== attempt.slotId ||
      evidence.failureClass !== attempt.failureClass ||
      !PRE_GAME_FAILURE_CLASSES.has(evidence.failureClass) ||
      evidence.failureDisposition !== 'unqualified-pre-game-failure' ||
      evidence.terminalEventSha256 != null ||
      evidence.engineTerminalSha256 != null ||
      evidence.paperReceiptId != null ||
      evidence.physicalDealId != null ||
      evidence.coinWinnerSeat != null ||
      evidence.chooserSeat != null ||
      evidence.goFirstResponse != null ||
      evidence.hostOverride != null ||
      evidence.firstPlayerSeat != null ||
      evidence.actualFirstPlayerSeat != null ||
      evidence.rngProtocol != null ||
      evidence.rngMaterial != null ||
      evidence.rngMaterialCommitment != null ||
      evidence.randomizationReceiptSha256 != null ||
      evidence.setupCoinChoiceReceiptSha256 != null ||
      evidence.policyApplicationReceiptSha256 != null ||
      evidence.failureCriteriaSha256 !== manifest.preGameFailureCriteriaSha256 ||
      attempt.failureCriteriaSha256 !== manifest.preGameFailureCriteriaSha256 ||
      evidence.enginePin !== manifest.twinleafPin ||
      evidence.runnerRevision !== manifest.runnerRevision ||
      evidence.gameStarted !== false ||
      evidence.terminalReached !== false ||
      !validIso(evidence.observedAt) ||
      Date.parse(evidence.observedAt) < Date.parse(attempt.endedAt) ||
      !evidenceDigest(evidence) ||
      attempt.failureEvidenceSha256 !== evidence.evidenceSha256) {
    add(problems, 'pre-game-failure-independent-evidence-invalid');
  }
}

function validateNaturalStarter(attempt, setupEvidence, problems) {
  const setup = setupEvidence?.receipt;
  const coin = setup?.coin;
  const choice = setup?.choice;
  if (!setup || !coin || !choice) {
    add(problems, 'natural-setup-coin-choice-evidence-missing');
    return;
  }
  if (!SEATS.includes(coin.coinWinnerSeat) ||
      !SEATS.includes(choice.choiceOwnerSeat) ||
      choice.choiceOwnerSeat !== coin.coinWinnerSeat ||
      typeof choice.choseFirst !== 'boolean') {
    add(problems, 'natural-coin-chooser-invalid');
    return;
  }
  const expectedStarter = choice.choseFirst
    ? coin.coinWinnerSeat
    : 1 - coin.coinWinnerSeat;
  if (attempt.coinWinnerSeat !== coin.coinWinnerSeat ||
      attempt.chooserSeat !== choice.choiceOwnerSeat ||
      attempt.goFirstResponse !== (choice.choseFirst ? 'yes' : 'no') ||
      attempt.firstPlayerSeat !== expectedStarter ||
      attempt.actualFirstPlayerSeat !== expectedStarter ||
      setup.firstSeatFromAcceptedSetup !== expectedStarter ||
      setup.firstSeatFromVerifiedDraw !== expectedStarter) {
    add(problems, 'natural-first-player-mismatch');
  }
  if (attempt.hostOverride !== false) add(problems, 'host-first-player-override-present');
}

function indexEvidence(records, playedAttempts, label, problems) {
  if (!Array.isArray(records)) {
    add(problems, label + '-evidence-array-missing');
    return new Map();
  }
  const expectedIds = new Set(playedAttempts.map(attempt => attempt.attemptId));
  const indexed = new Map();
  for (const record of records) {
    if (!record || typeof record !== 'object' || Array.isArray(record) ||
        !isText(record.attemptId) || indexed.has(record.attemptId)) {
      add(problems, label + '-evidence-identity-invalid');
      continue;
    }
    indexed.set(record.attemptId, record);
  }
  if (indexed.size !== expectedIds.size) add(problems, label + '-evidence-count-mismatch');
  for (const attemptId of expectedIds) {
    if (!indexed.has(attemptId)) add(problems, label + '-evidence-missing-for-played-attempt');
  }
  for (const attemptId of indexed.keys()) {
    if (!expectedIds.has(attemptId)) add(problems, label + '-evidence-without-played-attempt');
  }
  return indexed;
}

function validateSlotAttempts(attempts, slotRoster, manifest, problems) {
  const attemptIds = new Set();
  const slotHistory = new Map();
  const playedAttempts = [];
  let lastSequenceIndex = -1;
  let lastSlotId = null;
  let preGameFailureCount = 0;

  if (attempts.length > REGISTERED_SLOTS * (manifest.maxPreGameRetriesPerSlot + 1)) {
    add(problems, 'execution-attempt-count-exceeds-registered-retry-budget');
  }

  for (const attempt of attempts) {
    if (!attempt || typeof attempt !== 'object' || Array.isArray(attempt)) {
      add(problems, 'attempt-record-invalid');
      continue;
    }
    const planned = slotRoster.get(attempt.slotId);
    if (!planned) {
      add(problems, 'attempt-slot-unknown');
      continue;
    }
    const sequenceIndex = planned.sequenceIndex;
    if (attempt.sequenceIndex !== sequenceIndex ||
        attempt.roundIndex !== planned.roundIndex ||
        attempt.rank !== planned.rank ||
        attempt.seat !== planned.seat) {
      add(problems, 'attempt-slot-roster-mismatch');
    }
    if (!isText(attempt.attemptId) || attemptIds.has(attempt.attemptId)) {
      add(problems, 'duplicate-or-missing-attempt-id');
    } else {
      attemptIds.add(attempt.attemptId);
    }
    if (attempt.trialId !== attempt.attemptId) {
      add(problems, 'attempt-trial-id-must-equal-unique-attempt-id');
    }

    const history = slotHistory.get(attempt.slotId) || [];
    if (history.length === 0) {
      if (sequenceIndex !== lastSequenceIndex + 1) {
        add(problems, 'attempt-slot-order-or-prefix-gap');
      }
      if (attempt.attemptNumber !== 1 || attempt.retryOfAttemptId !== null) {
        add(problems, 'first-slot-attempt-retry-link-invalid');
      }
      if (lastSlotId !== null) {
        const previousHistory = slotHistory.get(lastSlotId) || [];
        const previous = previousHistory[previousHistory.length - 1];
        if (!previous || previous.status === 'pre-game-failure') {
          add(problems, 'pre-game-retry-skipped-before-next-slot');
        }
      }
    } else {
      const previous = history[history.length - 1];
      if (sequenceIndex !== lastSequenceIndex || previous.status !== 'pre-game-failure') {
        add(problems, 'retry-after-played-terminal-or-out-of-order');
      }
      if (attempt.attemptNumber !== history.length + 1 ||
          attempt.retryOfAttemptId !== previous.attemptId) {
        add(problems, 'attempt-retry-chain-invalid');
      }
      if (history.length > manifest.maxPreGameRetriesPerSlot) {
        add(problems, 'pre-game-retry-budget-exceeded');
      }
    }
    if (sequenceIndex < lastSequenceIndex) add(problems, 'attempt-slot-order-invalid');
    if (attempt.attemptNumber > manifest.maxPreGameRetriesPerSlot + 1) {
      add(problems, 'attempt-retry-budget-exceeded');
    }

    if (attempt.status === 'pre-game-failure') {
      preGameFailureCount += 1;
      if (Object.keys(attempt).some(key =>
        !PRE_GAME_FAILURE_ATTEMPT_KEYS.has(key))) {
        add(problems, 'pre-game-failure-attempt-schema-invalid');
      }
      if (attempt.gameStarted !== false || attempt.terminalReached !== false ||
          !PRE_GAME_FAILURE_CLASSES.has(attempt.failureClass) ||
          attempt.failureCriteriaSha256 !== manifest.preGameFailureCriteriaSha256 ||
          !isSha(attempt.failureEvidenceSha256)) {
        add(problems, 'pre-game-failure-evidence-invalid');
      }
      if (attempt.terminalAdjudicationReceipt != null ||
          attempt.terminalAdjudicationReceiptSha256 != null ||
          attempt.paperReceiptId != null ||
          attempt.physicalDealId != null ||
          attempt.policyApplicationReceiptSha256 != null ||
          attempt.rngProtocol != null ||
          attempt.coinWinnerSeat != null ||
          attempt.chooserSeat != null ||
          attempt.goFirstResponse != null ||
          attempt.hostOverride != null ||
          attempt.firstPlayerSeat != null ||
          attempt.actualFirstPlayerSeat != null ||
          attempt.setupCoinChoiceReceiptSha256 != null ||
          attempt.setupCoinChoiceEvidenceSha256 != null ||
          attempt.rngMaterial != null ||
          attempt.rngMaterialCommitment != null ||
          attempt.observedRngProtocol != null ||
          attempt.observedRngMaterialCommitment != null ||
          attempt.effectiveMatchOptions != null ||
          attempt.randomizationReceiptSha256 != null) {
        add(problems, 'pre-game-failure-has-played-game-evidence');
      }
      if (attempt.attemptNumber > manifest.maxPreGameRetriesPerSlot) {
        add(problems, 'pre-game-retry-budget-exhausted');
      }
    } else if (PLAYED_STATUSES.has(attempt.status)) {
      if (Object.keys(attempt).some(key => !PLAYED_ATTEMPT_KEYS.has(key))) {
        add(problems, 'played-attempt-schema-invalid');
      }
      if (attempt.gameStarted !== true || attempt.terminalReached !== true) {
        add(problems, 'played-attempt-terminal-flags-invalid');
      }
      playedAttempts.push(attempt);
    } else {
      add(problems, 'attempt-status-invalid');
    }

    history.push(attempt);
    slotHistory.set(attempt.slotId, history);
    lastSequenceIndex = sequenceIndex;
    lastSlotId = attempt.slotId;
  }

  let completedSlotCount = 0;
  for (const history of slotHistory.values()) {
    const last = history[history.length - 1];
    if (last && PLAYED_STATUSES.has(last.status)) completedSlotCount += 1;
  }
  return {
    playedAttempts,
    slotHistory,
    completedSlotCount,
    preGameFailureCount
  };
}

function validateAdjudicationReceipt(attempt, manifest, runnerEvidence,
  adjudicationEvidence, setupCoinChoiceEvidence, seen, problems) {
  const protocolRule = Array.isArray(manifest.adjudicationProtocol?.rules)
    ? manifest.adjudicationProtocol.rules.find(rule =>
        rule && rule.ruleId === adjudicationEvidence?.protocolRuleId)
    : null;
  if (!protocolRule) add(problems, 'adjudication-protocol-rule-missing');
  const result = validateTerminalAdjudicationReceipt({
    attempt,
    expected: {
      protocolRule,
      attemptId: attempt.attemptId,
      slotId: attempt.slotId,
      registrationSha: attempt.registrationSha,
      rank: attempt.rank,
      candidatePhysicalSeat: attempt.seat,
      actualStarterSeat: attempt.actualFirstPlayerSeat,
      firstPlayerSeat: attempt.firstPlayerSeat,
      coinWinnerSeat: attempt.coinWinnerSeat,
      chooserSeat: attempt.chooserSeat,
      goFirstResponse: attempt.goFirstResponse,
      physicalDealId: attempt.physicalDealId,
      source60Sha: attempt.source60Sha,
      candidate60Sha: attempt.candidate60Sha,
      candidatePolicySha: attempt.candidatePolicySha,
      engineAndHooksSha: attempt.engineAndHooksSha,
      opponentPolicyBundleSha: attempt.opponentPolicyBundleSha,
      adjudicationProtocolSha256: manifest.adjudicationProtocolSha256,
      clockMode: manifest.clockMode,
      rngMaterialCommitmentSha256: attempt.rngMaterialCommitment,
      enginePin: attempt.enginePin,
      runnerRevision: attempt.runnerRevision,
      endedAt: attempt.endedAt,
      status: attempt.status
    },
    runnerEvidence,
    adjudicationEvidence,
    setupCoinChoiceEvidence,
    seenReceiptSha256: seen.receipts,
    seenTerminalEventSha256: seen.terminalEvents,
    seenRunnerEvidenceSha256: seen.runnerEvidence,
    seenAdjudicationEvidenceSha256: seen.adjudicationEvidence,
    seenSetupEvidenceSha256: seen.setupEvidence
  });
  for (const reason of result.rejectionReasons) add(problems, reason);
}



function validateRandomization(attempt, manifest, problems) {
  let commitment = null;
  try {
    const material = validateRandomMaterial(attempt.rngMaterial);
    commitment = randomMaterialCommitment(material);
  } catch {
    add(problems, 'independent-rng-material-invalid');
  }
  if (!commitment || attempt.rngProtocol !== RNG_PROTOCOL ||
      attempt.rngMaterialCommitment !== commitment ||
      attempt.observedRngProtocol !== RNG_PROTOCOL ||
      attempt.observedRngMaterialCommitment !== commitment) {
    add(problems, 'independent-rng-observation-mismatch');
  }
  const options = attempt.effectiveMatchOptions;
  if (!options || typeof options !== 'object' ||
      Object.keys(options).some(key => !EFFECTIVE_MATCH_OPTIONS_KEYS.has(key)) ||
      options.rngProtocol !== RNG_PROTOCOL ||
      options.isolatePolicyRandomness !== true ||
      options.physicalShuffleRandomIsolation !== true ||
      options.aichiFieldPaperShuffleRandomIsolation !== true ||
      JSON.stringify(options.aichiFieldPaperShuffleRandomIsolationHooks) !== JSON.stringify(RNG_HOOKS) ||
      options.hisuianHeavyBallPrizeShuffleCorrection !== true ||
      options.coinRandomIsolation !== true ||
      options.engineRandomIsolation !== true) {
    add(problems, 'independent-rng-hook-evidence-incomplete');
  }
  const payload = {
    schema: RNG_RECEIPT_SCHEMA,
    trialId: attempt.trialId,
    rngProtocol: attempt.rngProtocol,
    rngMaterialCommitment: attempt.rngMaterialCommitment,
    observedRngProtocol: attempt.observedRngProtocol,
    observedRngMaterialCommitment: attempt.observedRngMaterialCommitment,
    coinWinnerSeat: attempt.coinWinnerSeat,
    unbiasedShuffleMethod: manifest.unbiasedShuffleMethod,
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

function evaluateStoppingRule(rawAttempts, playedAttempts, manifest, problems) {
  if (!DECISION_SCHEDULES.has(manifest.decisionSchedule)) {
    add(problems, 'field-sampling-decision-schedule-invalid');
    return {disposition: 'INVALID_SCHEDULE', met: false,
      counts: {wins: 0, losses: 0, ties: 0, noWinners: 0}};
  }
  const counts = {wins: 0, losses: 0, ties: 0, noWinners: 0};
  for (const attempt of playedAttempts) {
    if (attempt.status === 'paper-qualified-win') counts.wins += 1;
    else if (attempt.status === 'paper-qualified-loss') counts.losses += 1;
    else if (attempt.status === 'paper-qualified-tie') counts.ties += 1;
    else if (attempt.status === 'paper-qualified-no-winner') counts.noWinners += 1;
  }
  const nonwins = counts.losses + counts.ties + counts.noWinners;
  if (playedAttempts.length > REGISTERED_SLOTS) {
    add(problems, 'played-game-count-exceeds-registered-slots');
    return {disposition: 'INVALID_STOP', met: false, counts};
  }

  const firstLook = playedAttempts.slice(0, LOOK1_GAMES);
  if (firstLook.length === LOOK1_GAMES &&
      firstLook.every(attempt => attempt.status === 'paper-qualified-win')) {
    const lastFirstLookRawIndex = rawAttempts.indexOf(firstLook[LOOK1_GAMES - 1]);
    if (playedAttempts.length !== LOOK1_GAMES ||
        lastFirstLookRawIndex !== rawAttempts.length - 1) {
      add(problems, 'two-look-continued-after-early-pass');
      return {disposition: 'INVALID_STOP', met: false, counts};
    }
    return {disposition: 'PASS_EARLY_ALL_WIN', met: true, counts};
  }

  if (nonwins >= 3) {
    let seen = 0;
    let thirdNonwin = null;
    for (const attempt of playedAttempts) {
      if (attempt.status !== 'paper-qualified-win') {
        seen += 1;
        if (seen === 3) {
          thirdNonwin = attempt;
          break;
        }
      }
    }
    const thirdRawIndex = thirdNonwin ? rawAttempts.indexOf(thirdNonwin) : -1;
    if (nonwins !== 3 || thirdRawIndex !== rawAttempts.length - 1) {
      add(problems, 'futility-stop-not-immediate');
      return {disposition: 'INVALID_STOP', met: false, counts};
    }
    return {disposition: 'FUTILITY_STOP', met: false, counts};
  }

  if (playedAttempts.length === REGISTERED_SLOTS) {
    return {disposition: nonwins <= 2 ? 'PASS_FINAL' : 'FAIL',
      met: nonwins <= 2, counts};
  }
  return {disposition: 'INCOMPLETE', met: null, counts};
}

function validatePhysicalDealUniqueness(attempts, problems) {
  const seen = new Set();
  const duplicates = new Set();
  for (const attempt of attempts) {
    if (!attempt || !isText(attempt.physicalDealId)) {
      add(problems, 'physical-deal-id-missing');
      continue;
    }
    if (seen.has(attempt.physicalDealId)) duplicates.add(attempt.physicalDealId);
    else seen.add(attempt.physicalDealId);
  }
  if (duplicates.size > 0) add(problems, 'physical-deal-id-replayed-across-attempts');
  return [...duplicates].sort();
}

function findRepeatedRandomizationStreamKeyGroups(attempts) {
  const byKey = new Map();
  for (const attempt of attempts) {
    if (!attempt || attempt.status === 'pre-game-failure') continue;
    let material;
    try {
      material = validateRandomMaterial(attempt.rngMaterial);
    } catch {
      continue;
    }
    for (const [streamName, key] of Object.entries(material.streams)) {
      const occurrences = byKey.get(key) || [];
      occurrences.push({attemptId: attempt.attemptId, streamName});
      byKey.set(key, occurrences);
    }
  }
  return [...byKey.values()]
    .filter(occurrences =>
      new Set(occurrences.map(item => item.attemptId)).size > 1)
    .map(occurrences => ({
      attemptIds: [...new Set(occurrences.map(item => item.attemptId))].sort(),
      streamNames: [...new Set(occurrences.map(item => item.streamName))].sort(),
      occurrenceCount: occurrences.length
    }));
}

function findRepeatedRandomizationMaterialGroups(attempts) {
  const byCommitment = new Map();
  for (const attempt of attempts) {
    if (!attempt || attempt.status === 'pre-game-failure' ||
        !isSha(attempt.rngMaterialCommitment)) continue;
    const ids = byCommitment.get(attempt.rngMaterialCommitment) || [];
    ids.push(attempt.attemptId);
    byCommitment.set(attempt.rngMaterialCommitment, ids);
  }
  return [...byCommitment.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([commitment, attemptIds]) => ({commitment, attemptIds}));
}



/**
 * Validate a preregistered 32-rank × candidate-physical-seat design. Actual
 * first-player seat is observed from the natural coin/GO_FIRST sequence and
 * is never quota-balanced. Pre-game failures are unqualified executions and
 * may retry only within the preregistered per-slot budget; exhausted slots
 * invalidate the batch. Six-stream RNG bundles are sampled with replacement;
 * duplicate bundle/key values are preserved and flagged for audit, not rejected.
 * No-winner is a distinct completed nonwin.
 */
function validateNatural64FieldLedger(request) {
  if (!request || !Array.isArray(request.originalSources) ||
      !Array.isArray(request.attempts)) {
    throw new TypeError('originalSources and attempts must be arrays');
  }
  const problems = new Set();
  const target = request.target ?? 0.995;
  const confidence = request.confidence ?? 0.95;
  const {manifest, slotRoster, registrationValid} = validateManifest(request, problems);
  if (!manifest) {
    return {
      status: 'INVALID', rejectionReasons: [...problems].sort(),
      totalAttempts: request.attempts.length,
      rawPlayedAttemptCount: request.attempts.filter(attempt =>
        attempt && PLAYED_STATUSES.has(attempt.status)).length,
      playedGameCount: null, winCount: null, lossCount: null, tieCount: null,
      noWinnerTerminalCount: null, nonWinCount: null, observedWinRate: null,
      rankSummary: null, designThresholdMet: null,
      decisionRuleDisposition: 'NOT_EVALUABLE_INVALID',
      structuralAdmissionOnly: true,
      sourceAuthenticityProven: false,
      policyCompetenceProven: false,
      rngIntegrationProven: false,
      paperAdjudicatorSignatureVerified: false,
      preGameFailureEvidenceAuthenticated: false,
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
  const slotValidation = validateSlotAttempts(attempts, slotRoster, manifest, problems);
  const playedAttempts = slotValidation.playedAttempts;
  const preGameAttempts = attempts.filter(attempt =>
    attempt && attempt.status === 'pre-game-failure');
  const preGameFailureEvidenceByAttemptId = indexEvidence(
    request.preGameFailureEvidence, preGameAttempts, 'pre-game-failure', problems);
  const runnerEvidenceByAttemptId = indexEvidence(
    request.runnerTerminalEvidence, playedAttempts, 'runner-terminal', problems);
  const adjudicationEvidenceByAttemptId = indexEvidence(
    request.adjudicationEvidence, playedAttempts, 'adjudicator', problems);
  const setupCoinChoiceEvidenceByAttemptId = indexEvidence(
    request.setupCoinChoiceEvidence, playedAttempts, 'setup-coin-choice', problems);
  const seen = {
    receipts: new Set(),
    terminalEvents: new Set(),
    runnerEvidence: new Set(),
    adjudicationEvidence: new Set(),
    setupEvidence: new Set()
  };
  const paperReceiptIds = new Set();

  for (const attempt of attempts) {
    if (!attempt || typeof attempt !== 'object' || Array.isArray(attempt)) continue;
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
      ['adjudicationProtocolSha256', 'adjudicationProtocolSha256']
    ]) {
      if (attempt[field] !== manifest[manifestField]) {
        add(problems, 'attempt-fixed-identity-mismatch:' + field);
      }
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

    if (attempt.status === 'pre-game-failure') {
      validatePreGameFailureEvidence(
        attempt,
        preGameFailureEvidenceByAttemptId.get(attempt.attemptId),
        manifest,
        problems
      );
      continue;
    }

    validateNaturalStarter(attempt,
      setupCoinChoiceEvidenceByAttemptId.get(attempt.attemptId), problems);
    if (!isText(attempt.paperReceiptId) || paperReceiptIds.has(attempt.paperReceiptId)) {
      add(problems, 'duplicate-or-missing-paper-receipt');
    } else {
      paperReceiptIds.add(attempt.paperReceiptId);
    }
    validateAdjudicationReceipt(
      attempt,
      manifest,
      runnerEvidenceByAttemptId.get(attempt.attemptId),
      adjudicationEvidenceByAttemptId.get(attempt.attemptId),
      setupCoinChoiceEvidenceByAttemptId.get(attempt.attemptId),
      seen,
      problems
    );
    validateRandomization(attempt, manifest, problems);
  }

  const duplicatePhysicalDealIds =
    validatePhysicalDealUniqueness(playedAttempts, problems);
  validatePolicyPanel(request, playedAttempts, manifest, problems);
  const stopping = evaluateStoppingRule(attempts, playedAttempts, manifest, problems);
  const repeatedRandomizationMaterialGroups =
    findRepeatedRandomizationMaterialGroups(playedAttempts);
  const repeatedRandomizationStreamKeyGroups =
    findRepeatedRandomizationStreamKeyGroups(playedAttempts);
  const rngMaterialCollisionReviewRequired =
    repeatedRandomizationMaterialGroups.length > 0 ||
    repeatedRandomizationStreamKeyGroups.length > 0;
  const warnings = [
    ...(repeatedRandomizationMaterialGroups.length > 0
      ? ['cross-trial-rng-material-collision-review-required'] : []),
    ...(repeatedRandomizationStreamKeyGroups.length > 0
      ? ['cross-trial-rng-stream-key-collision-review-required'] : [])
  ];
  const rejectionReasons = [...problems].sort();
  const structuralValid = rejectionReasons.length === 0;
  const rankSummary = structuralValid
    ? Array.from({length: FIELD_SIZE}, (_, index) => {
    const bySeat = [0, 1].map(seat => {
      const played = playedAttempts.filter(a => a && a.rank === index + 1 && a.seat === seat);
      const executions = attempts.filter(a => a && a.rank === index + 1 && a.seat === seat);
      return {
        slotsScheduled: GAMES_PER_STRATUM,
        executionAttempts: executions.length,
        preGameFailures: executions.filter(a => a.status === 'pre-game-failure').length,
        playedGames: played.length,
        wins: played.filter(a => a.status === 'paper-qualified-win').length,
        losses: played.filter(a => a.status === 'paper-qualified-loss').length,
        ties: played.filter(a => a.status === 'paper-qualified-tie').length,
        noWinners: played.filter(a => a.status === 'paper-qualified-no-winner').length
      };
    });
    return {rank: index + 1, seat0: bySeat[0], seat1: bySeat[1]};
    }) : null;
  const winCount = structuralValid ? stopping.counts.wins : null;
  const lossCount = structuralValid ? stopping.counts.losses : null;
  const tieCount = structuralValid ? stopping.counts.ties : null;
  const noWinnerTerminalCount = structuralValid ? stopping.counts.noWinners : null;
  const nonWinCount = structuralValid
    ? lossCount + tieCount + noWinnerTerminalCount : null;
  const rawPlayedAttemptCount = playedAttempts.length;
  const playedGameCount = structuralValid ? rawPlayedAttemptCount : null;
  const decisionRuleDisposition = structuralValid
    ? stopping.disposition : 'NOT_EVALUABLE_INVALID';

  return {
    status: structuralValid
      ? (stopping.disposition === 'INCOMPLETE' ? 'INCOMPLETE' : 'VALID')
      : 'INVALID',
    target,
    confidence,
    totalAttempts: attempts.length,
    registeredSlotCount: REGISTERED_SLOTS,
    completedSlotCount: slotValidation.completedSlotCount,
    preGameFailureCount: slotValidation.preGameFailureCount,
    rawPlayedAttemptCount,
    playedGameCount,
    retryAttempts: attempts.filter(a => a && a.attemptNumber > 1).length,
    winCount,
    lossCount,
    tieCount,
    noWinnerTerminalCount,
    nonWinCount,
    observedWinRate: playedGameCount ? winCount / playedGameCount : null,
    attemptsPerRankAndCandidateSeat:
      playedGameCount === LOOK1_GAMES ? 19 :
      playedGameCount === REGISTERED_SLOTS ? 20 : null,
    rankSummary,
    repeatedRandomizationMaterialGroups,
    repeatedRandomizationStreamKeyGroups,
    duplicatePhysicalDealIds,
    rngMaterialCollisionReviewRequired,
    warnings,
    decisionRuleDisposition,
    designThresholdMet: structuralValid ? stopping.met : null,
    samplingModelRegistrationValid: registrationValid && structuralValid,
    clockMode: manifest.clockMode,
    adjudicationProtocolSha256: manifest.adjudicationProtocolSha256,
    randomizationProtocol: manifest.randomizationProtocol,
    rngBundleSampling: manifest.rngBundleSampling,
    unbiasedShuffleMethod: manifest.unbiasedShuffleMethod,
    structuralAdmissionOnly: true,
    sourceAuthenticityProven: false,
    policyCompetenceProven: false,
    rngIntegrationProven: false,
    rngPreGameCustodyProven: false,
    preGameFailureEvidenceAuthenticated: false,
    externalRngIndependenceProven: false,
    paperShuffleFairnessProven: false,
    nativeSetupReceiptAuthenticated: false,
    runnerTerminalEvidenceAuthenticated: false,
    paperAdjudicatorSignatureVerified: false,
    externalQualificationRequired: true,
    statisticalCertification: 'NOT_ESTABLISHED',
    rejectionReasons
  };
}



module.exports = {
  validateNatural64FieldLedger,
  validateNatural64SlotAttempts: validateSlotAttempts,
  evaluateNatural64StoppingRule: evaluateStoppingRule,
  findRepeatedRandomizationMaterialGroups,
  findRepeatedRandomizationStreamKeyGroups,
  validatePhysicalDealUniqueness,
  validateAdjudicationProtocol,
  PRE_GAME_FAILURE_EVIDENCE_SCHEMA,
  NATURAL64_DECISION_SCHEDULES: DECISION_SCHEDULES,
  NATURAL64_ADJUDICATION_PROTOCOL_SCHEMA: ADJUDICATION_PROTOCOL_SCHEMA,
  NATURAL64_MANIFEST_SCHEMA: MANIFEST_SCHEMA,
  NATURAL64_SAMPLING_MODEL: SAMPLING_MODEL,
  NATURAL64_ADJUDICATION_SCHEMA: ADJUDICATION_SCHEMA,
  NATURAL64_RNG_PROTOCOL: RNG_PROTOCOL,
  NATURAL64_UNBIASED_SHUFFLE_METHOD: UNBIASED_SHUFFLE_METHOD
};
