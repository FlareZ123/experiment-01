'use strict';

const {
  evidenceBundleSha256: canonicalSha256
} = require('../../../simulation/evaluation/canonical-evidence-json.cjs');

const SHA256 = /^[a-f0-9]{64}$/i;
const RECEIPT_SCHEMA = 'aichi-terminal-adjudication-receipt-v5';
const RUNNER_EVIDENCE_SCHEMA = 'aichi-runner-terminal-evidence-v1';
const ADJUDICATOR_EVIDENCE_SCHEMA = 'aichi-adjudicator-evidence-v2';
const SETUP_EVIDENCE_SCHEMA = 'aichi-natural64-setup-coin-choice-evidence-v1';
const SETUP_RECEIPT_VERSION = 'agent16-accepted-native-setup-coin-and-first-choice-v1';
const CLOCK_MODES = new Set([
  'clock-free-game-win',
  'aichi-top32-event-clock'
]);
const RESULT_TO_STATUS = Object.freeze({
  'candidate-win': 'paper-qualified-win',
  'candidate-loss': 'paper-qualified-loss',
  'genuine-tie': 'paper-qualified-tie'
});
const NO_WINNER_STATUS = 'paper-qualified-no-winner';
const DUAL_DEFEAT_EVIDENCE_SCHEMA = 'aichi-dual-defeat-penalty-evidence-v1';
const SINGLE_DEFEAT_EVIDENCE_SCHEMA = 'aichi-single-defeat-penalty-evidence-v1';
const SETUP_EVIDENCE_KEYS = new Set([
  'schema', 'attemptId', 'trialId', 'slotId', 'receipt', 'receiptSha256', 'evidenceSha256'
]);
const SETUP_RECEIPT_KEYS = new Set([
  'version', 'status', 'coin', 'choice', 'firstSeatFromAcceptedSetup',
  'firstSeatFromVerifiedDraw', 'nativeFirstDrawVerified', 'firstSetupOnly',
  'malformedNativeSetupEvents', 'fullGamePolicyCertified',
  'officialCoinChoiceRuleCertified', 'competitiveGameQualified'
]);
const SETUP_COIN_KEYS = new Set(['ordinal', 'resolution', 'heads', 'coinWinnerSeat']);
const SETUP_CHOICE_KEYS = new Set([
  'ordinal', 'resolution', 'choiceOwnerSeat', 'choseFirst'
]);
const RUNNER_EVIDENCE_KEYS = new Set([
  'schema', 'attemptId', 'slotId', 'enginePin', 'runnerRevision',
  'gameStarted', 'terminalReached', 'terminalEventSha256',
  'engineTerminalSha256', 'capturedAt', 'evidenceSha256'
]);
const ADJUDICATOR_EVIDENCE_KEYS = new Set([
  'schema', 'attemptId', 'slotId', 'adjudicationProtocolSha256',
  'protocolRuleId', 'protocolRuleSha256', 'runnerEvidenceSha256',
  'terminalEventSha256', 'engineTerminalSha256', 'clockMode',
  'adjudicatorId', 'adjudicatedAt', 'terminalClass', 'adjudicationReason',
  'adjudicatedCandidateResult', 'attestationSha256', 'dualDefeatEvidence',
  'singleDefeatEvidence', 'evidenceSha256'
]);
const TERMINAL_RECEIPT_KEYS = new Set([
  'schema', 'attemptId', 'trialId', 'slotId', 'paperReceiptId',
  'registrationSha', 'rank', 'candidatePhysicalSeat', 'actualStarterSeat',
  'firstPlayerSeat', 'coinWinnerSeat', 'chooserSeat', 'goFirstResponse',
  'physicalDealId', 'source60Sha', 'candidate60Sha', 'candidatePolicySha',
  'engineAndHooksSha', 'opponentPolicyBundleSha', 'adjudicationProtocolSha256',
  'protocolRuleId', 'protocolRuleSha256', 'clockMode',
  'rngMaterialCommitmentSha256', 'setupCoinChoiceReceiptSha256',
  'setupCoinChoiceEvidenceSha256', 'runnerEvidenceSha256',
  'adjudicationEvidenceSha256', 'terminalEventSha256', 'engineTerminalSha256',
  'adjudicatorAttestationSha256', 'adjudicatorId', 'adjudicatedAt',
  'terminalClass', 'adjudicationReason', 'adjudicatedCandidateResult',
  'statisticalStatus', 'gameStarted', 'terminalReached', 'adjudicationStatus',
  'receiptSha256'
]);
const DEFEAT_EVIDENCE_KEYS = new Set([
  'eventStage', 'judgeRulingRef', 'penalizedPhysicalSeats', 'penalty', 'schema'
]);
const TERMINAL_CLASS_ALLOWED_RESULTS = Object.freeze({
  'engine-winner': Object.freeze(['candidate-win', 'candidate-loss']),
  'opponent-forfeit': Object.freeze(['candidate-win']),
  'opponent-concession': Object.freeze(['candidate-win']),
  'candidate-forfeit': Object.freeze(['candidate-loss']),
  'candidate-defeat': Object.freeze(['candidate-loss']),
  'opponent-defeat': Object.freeze(['candidate-win']),
  'draw': Object.freeze(['genuine-tie']),
  'no-winner': Object.freeze([null]),
  'top32-prize-tiebreaker': Object.freeze(['candidate-win', 'candidate-loss'])
});
const TERMINAL_CLASS_ALLOWED_REASONS = Object.freeze({
  'engine-winner': Object.freeze(['engine-winner']),
  'opponent-forfeit': Object.freeze(['opponent-forfeit']),
  'opponent-concession': Object.freeze(['opponent-concession']),
  'candidate-forfeit': Object.freeze(['candidate-forfeit']),
  'candidate-defeat': Object.freeze(['candidate-defeat']),
  'opponent-defeat': Object.freeze(['opponent-defeat']),
  'draw': Object.freeze(['draw']),
  'no-winner': Object.freeze(['both-players-defeated']),
  'top32-prize-tiebreaker': Object.freeze(['top32-prize-tiebreaker'])
});

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha(value) {
  return typeof value === 'string' && SHA256.test(value);
}

function hasOnlyKeys(record, allowed) {
  return !!record && typeof record === 'object' && !Array.isArray(record) &&
    Object.keys(record).every(key => allowed.has(key));
}

function validIso(value) {
  return typeof value === 'string' &&
    /(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function digestMatches(record, field) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false;
  const digest = record[field];
  if (!isSha(digest)) return false;
  const payload = {...record};
  delete payload[field];
  try {
    return canonicalSha256(payload) === digest;
  } catch {
    return false;
  }
}

/**
 * Wrap the native Store's post-dispatch setup receipt with immutable attempt
 * identity. This digest is structural evidence, not a signature or proof of
 * fair coin randomness.
 */
function createSetupCoinChoiceEvidence({attemptId, trialId, slotId, receipt}) {
  if (!nonEmptyString(attemptId) || !nonEmptyString(trialId) ||
      !nonEmptyString(slotId) || !receipt || typeof receipt !== 'object' ||
      Array.isArray(receipt)) {
    throw new TypeError('attempt identity and native setup receipt are required');
  }
  const payload = {
    schema: SETUP_EVIDENCE_SCHEMA,
    attemptId,
    trialId,
    slotId,
    receipt,
    receiptSha256: canonicalSha256(receipt)
  };
  return {...payload, evidenceSha256: canonicalSha256(payload)};
}

function validateSetupCoinChoiceEvidence({attempt, receipt, setupEvidence}) {
  const problems = new Set();
  const reject = reason => problems.add(reason);
  if (!setupEvidence || typeof setupEvidence !== 'object' || Array.isArray(setupEvidence)) {
    return ['terminal-adjudication-setup-coin-choice-evidence-missing'];
  }
  if (!hasOnlyKeys(setupEvidence, SETUP_EVIDENCE_KEYS)) {
    reject('terminal-adjudication-setup-coin-choice-evidence-invalid');
  }
  const setup = setupEvidence.receipt;
  let setupReceiptDigestValid = false;
  try {
    setupReceiptDigestValid = isSha(setupEvidence.receiptSha256) &&
      canonicalSha256(setup) === setupEvidence.receiptSha256;
  } catch {}
  if (setupEvidence.schema !== SETUP_EVIDENCE_SCHEMA ||
      setupEvidence.attemptId !== attempt.attemptId ||
      setupEvidence.trialId !== attempt.trialId ||
      setupEvidence.slotId !== attempt.slotId ||
      !hasOnlyKeys(setup, SETUP_RECEIPT_KEYS) ||
      !hasOnlyKeys(setup?.coin, SETUP_COIN_KEYS) ||
      !hasOnlyKeys(setup?.choice, SETUP_CHOICE_KEYS) ||
      !setup || typeof setup !== 'object' || Array.isArray(setup) ||
      !digestMatches(setupEvidence, 'evidenceSha256') ||
      !setupReceiptDigestValid) {
    reject('terminal-adjudication-setup-coin-choice-evidence-invalid');
  }
  if (attempt.setupCoinChoiceReceiptSha256 !== setupEvidence.receiptSha256 ||
      attempt.setupCoinChoiceEvidenceSha256 !== setupEvidence.evidenceSha256 ||
      receipt.setupCoinChoiceReceiptSha256 !== setupEvidence.receiptSha256 ||
      receipt.setupCoinChoiceEvidenceSha256 !== setupEvidence.evidenceSha256) {
    reject('terminal-adjudication-setup-coin-choice-binding-mismatch');
  }
  const coin = setup?.coin;
  const choice = setup?.choice;
  if (setup?.version !== SETUP_RECEIPT_VERSION ||
      setup?.status !== 'consistent-accepted-native-setup-and-first-draw' ||
      setup?.firstSetupOnly !== true ||
      setup?.nativeFirstDrawVerified !== true ||
      setup?.malformedNativeSetupEvents !== 0 ||
      setup?.fullGamePolicyCertified !== false ||
      setup?.officialCoinChoiceRuleCertified !== false ||
      setup?.competitiveGameQualified !== false ||
      !coin || coin.resolution !== 'accepted-native-prompt' ||
      typeof coin.heads !== 'boolean' ||
      ![0, 1].includes(coin.coinWinnerSeat) ||
      coin.coinWinnerSeat !== (coin.heads ? 0 : 1) ||
      !Number.isInteger(coin.ordinal) ||
      !choice || choice.resolution !== 'accepted-native-prompt' ||
      ![0, 1].includes(choice.choiceOwnerSeat) ||
      typeof choice.choseFirst !== 'boolean' ||
      !Number.isInteger(choice.ordinal) || choice.ordinal <= coin.ordinal ||
      choice.choiceOwnerSeat !== coin.coinWinnerSeat) {
    reject('terminal-adjudication-native-setup-receipt-invalid');
  } else {
    const expectedFirstSeat = choice.choseFirst
      ? coin.coinWinnerSeat
      : 1 - coin.coinWinnerSeat;
    if (setup.firstSeatFromAcceptedSetup !== expectedFirstSeat ||
        setup.firstSeatFromVerifiedDraw !== expectedFirstSeat ||
        attempt.coinWinnerSeat !== coin.coinWinnerSeat ||
        attempt.chooserSeat !== choice.choiceOwnerSeat ||
        attempt.goFirstResponse !== (choice.choseFirst ? 'yes' : 'no') ||
        attempt.firstPlayerSeat !== expectedFirstSeat ||
        attempt.actualFirstPlayerSeat !== expectedFirstSeat ||
        attempt.hostOverride !== false) {
      reject('terminal-adjudication-native-setup-outcome-mismatch');
    }
    if (receipt.coinWinnerSeat !== coin.coinWinnerSeat ||
        receipt.chooserSeat !== choice.choiceOwnerSeat ||
        receipt.goFirstResponse !== (choice.choseFirst ? 'yes' : 'no') ||
        receipt.firstPlayerSeat !== expectedFirstSeat ||
        receipt.actualStarterSeat !== expectedFirstSeat) {
      reject('terminal-adjudication-receipt-setup-binding-mismatch');
    }
  }
  return [...problems].sort();
}

/**
 * Bind a played attempt to separate runner-terminal, adjudicator, and native
 * setup evidence. Protocol semantics are supplied by the content-addressed
 * manifest rule; this helper does not invent universal concession/timeout rules.
 * Content digests are not signatures and authenticate none of the producers.
 */
function validateTerminalAdjudicationReceipt({
  attempt,
  expected,
  runnerEvidence,
  adjudicationEvidence,
  setupCoinChoiceEvidence,
  seenReceiptSha256 = new Set(),
  seenTerminalEventSha256 = new Set(),
  seenRunnerEvidenceSha256 = new Set(),
  seenAdjudicationEvidenceSha256 = new Set(),
  seenSetupEvidenceSha256 = new Set()
}) {
  const problems = new Set();
  const reject = reason => problems.add(reason);

  if (!attempt || typeof attempt !== 'object' || Array.isArray(attempt)) {
    return {valid: false, rejectionReasons: ['terminal-adjudication-attempt-invalid'], receiptSha256: null};
  }
  if (!expected || typeof expected !== 'object' || Array.isArray(expected)) {
    return {valid: false, rejectionReasons: ['terminal-adjudication-expected-bindings-invalid'], receiptSha256: null};
  }
  const receipt = attempt.terminalAdjudicationReceipt;
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return {valid: false, rejectionReasons: ['terminal-adjudication-receipt-missing'], receiptSha256: null};
  }
  if (!runnerEvidence || typeof runnerEvidence !== 'object' || Array.isArray(runnerEvidence)) {
    reject('terminal-adjudication-independent-runner-evidence-missing');
  } else if (!hasOnlyKeys(runnerEvidence, RUNNER_EVIDENCE_KEYS)) {
    reject('terminal-adjudication-runner-evidence-schema-fields-invalid');
  }
  if (!adjudicationEvidence || typeof adjudicationEvidence !== 'object' || Array.isArray(adjudicationEvidence)) {
    reject('terminal-adjudication-independent-adjudicator-evidence-missing');
  } else if (!hasOnlyKeys(adjudicationEvidence, ADJUDICATOR_EVIDENCE_KEYS)) {
    reject('terminal-adjudication-adjudicator-evidence-schema-fields-invalid');
  }
  if (!hasOnlyKeys(receipt, TERMINAL_RECEIPT_KEYS)) {
    reject('terminal-adjudication-receipt-schema-fields-invalid');
  }

  if (receipt.schema !== RECEIPT_SCHEMA) reject('terminal-adjudication-receipt-schema-invalid');
  if (!nonEmptyString(attempt.attemptId) || attempt.trialId !== attempt.attemptId ||
      !nonEmptyString(attempt.slotId) || receipt.attemptId !== attempt.attemptId ||
      receipt.trialId !== attempt.trialId || receipt.slotId !== attempt.slotId ||
      receipt.paperReceiptId !== attempt.paperReceiptId) {
    reject('terminal-adjudication-receipt-identity-invalid');
  }

  const bindings = {
    registrationSha: expected.registrationSha,
    rank: expected.rank,
    candidatePhysicalSeat: expected.candidatePhysicalSeat,
    actualStarterSeat: expected.actualStarterSeat,
    firstPlayerSeat: expected.firstPlayerSeat,
    coinWinnerSeat: expected.coinWinnerSeat,
    chooserSeat: expected.chooserSeat,
    goFirstResponse: expected.goFirstResponse,
    physicalDealId: expected.physicalDealId,
    source60Sha: expected.source60Sha,
    candidate60Sha: expected.candidate60Sha,
    candidatePolicySha: expected.candidatePolicySha,
    engineAndHooksSha: expected.engineAndHooksSha,
    opponentPolicyBundleSha: expected.opponentPolicyBundleSha,
    adjudicationProtocolSha256: expected.adjudicationProtocolSha256,
    clockMode: expected.clockMode,
    rngMaterialCommitmentSha256: expected.rngMaterialCommitmentSha256
  };
  for (const [field, value] of Object.entries(bindings)) {
    if (value === undefined || value === null ||
        (typeof value === 'string' && value.trim().length === 0)) {
      reject('terminal-adjudication-expected-binding-missing:' + field);
    } else if (receipt[field] !== value) {
      reject('terminal-adjudication-binding-mismatch:' + field);
    }
  }
  for (const field of [
    'registrationSha', 'source60Sha', 'candidate60Sha', 'candidatePolicySha',
    'engineAndHooksSha', 'opponentPolicyBundleSha', 'adjudicationProtocolSha256',
    'rngMaterialCommitmentSha256'
  ]) {
    if (!isSha(expected[field])) reject('terminal-adjudication-expected-hash-invalid:' + field);
  }
  if (!Number.isInteger(expected.rank) || expected.rank < 1 || expected.rank > 32) {
    reject('terminal-adjudication-rank-invalid');
  }
  if (![0, 1].includes(expected.candidatePhysicalSeat) ||
      ![0, 1].includes(expected.actualStarterSeat) ||
      ![0, 1].includes(expected.firstPlayerSeat) ||
      ![0, 1].includes(expected.coinWinnerSeat) ||
      ![0, 1].includes(expected.chooserSeat) ||
      !['yes', 'no'].includes(expected.goFirstResponse)) {
    reject('terminal-adjudication-seat-or-choice-invalid');
  }
  if (!nonEmptyString(expected.physicalDealId)) reject('terminal-adjudication-physical-deal-id-invalid');
  if (!CLOCK_MODES.has(expected.clockMode)) reject('terminal-adjudication-clock-mode-invalid');

  for (const reason of validateSetupCoinChoiceEvidence({
    attempt, receipt, setupEvidence: setupCoinChoiceEvidence
  })) reject(reason);
  if (setupCoinChoiceEvidence && isSha(setupCoinChoiceEvidence.evidenceSha256)) {
    if (seenSetupEvidenceSha256.has(setupCoinChoiceEvidence.evidenceSha256)) {
      reject('terminal-adjudication-setup-coin-choice-evidence-replayed');
    } else {
      seenSetupEvidenceSha256.add(setupCoinChoiceEvidence.evidenceSha256);
    }
  }

  if (runnerEvidence) {
    if (runnerEvidence.schema !== RUNNER_EVIDENCE_SCHEMA ||
        runnerEvidence.attemptId !== attempt.attemptId ||
        runnerEvidence.slotId !== attempt.slotId ||
        runnerEvidence.enginePin !== expected.enginePin ||
        runnerEvidence.runnerRevision !== expected.runnerRevision ||
        runnerEvidence.gameStarted !== true ||
        runnerEvidence.terminalReached !== true ||
        !isSha(runnerEvidence.terminalEventSha256) ||
        !isSha(runnerEvidence.engineTerminalSha256) ||
        !validIso(runnerEvidence.capturedAt) ||
        !validIso(expected.endedAt) ||
        Date.parse(runnerEvidence.capturedAt) < Date.parse(expected.endedAt) ||
        !digestMatches(runnerEvidence, 'evidenceSha256')) {
      reject('terminal-adjudication-runner-evidence-invalid');
    }
    if (receipt.runnerEvidenceSha256 !== runnerEvidence.evidenceSha256 ||
        receipt.terminalEventSha256 !== runnerEvidence.terminalEventSha256 ||
        receipt.engineTerminalSha256 !== runnerEvidence.engineTerminalSha256) {
      reject('terminal-adjudication-runner-evidence-binding-mismatch');
    }
    if (isSha(runnerEvidence.evidenceSha256)) {
      if (seenRunnerEvidenceSha256.has(runnerEvidence.evidenceSha256)) {
        reject('terminal-adjudication-runner-evidence-replayed');
      } else {
        seenRunnerEvidenceSha256.add(runnerEvidence.evidenceSha256);
      }
    }
    if (isSha(runnerEvidence.terminalEventSha256)) {
      if (seenTerminalEventSha256.has(runnerEvidence.terminalEventSha256)) {
        reject('terminal-adjudication-terminal-event-replayed');
      } else {
        seenTerminalEventSha256.add(runnerEvidence.terminalEventSha256);
      }
    }
  }

  if (adjudicationEvidence) {
    if (adjudicationEvidence.schema !== ADJUDICATOR_EVIDENCE_SCHEMA ||
        adjudicationEvidence.attemptId !== attempt.attemptId ||
        adjudicationEvidence.slotId !== attempt.slotId ||
        adjudicationEvidence.adjudicationProtocolSha256 !== expected.adjudicationProtocolSha256 ||
        adjudicationEvidence.clockMode !== expected.clockMode ||
        !nonEmptyString(adjudicationEvidence.adjudicatorId) ||
        !validIso(adjudicationEvidence.adjudicatedAt) ||
        Date.parse(adjudicationEvidence.adjudicatedAt) < Date.parse(expected.endedAt) ||
        !runnerEvidence || !validIso(runnerEvidence.capturedAt) ||
        Date.parse(adjudicationEvidence.adjudicatedAt) < Date.parse(runnerEvidence.capturedAt) ||
        !isSha(adjudicationEvidence.attestationSha256) ||
        !isSha(adjudicationEvidence.runnerEvidenceSha256) ||
        !isSha(adjudicationEvidence.terminalEventSha256) ||
        !isSha(adjudicationEvidence.engineTerminalSha256) ||
        !nonEmptyString(adjudicationEvidence.protocolRuleId) ||
        !isSha(adjudicationEvidence.protocolRuleSha256) ||
        !digestMatches(adjudicationEvidence, 'evidenceSha256')) {
      reject('terminal-adjudication-adjudicator-evidence-invalid');
    }
    if (!runnerEvidence ||
        adjudicationEvidence.runnerEvidenceSha256 !== runnerEvidence.evidenceSha256 ||
        adjudicationEvidence.terminalEventSha256 !== runnerEvidence.terminalEventSha256 ||
        adjudicationEvidence.engineTerminalSha256 !== runnerEvidence.engineTerminalSha256) {
      reject('terminal-adjudication-adjudicator-terminal-binding-mismatch');
    }
    if (receipt.adjudicationEvidenceSha256 !== adjudicationEvidence.evidenceSha256 ||
        receipt.adjudicatorAttestationSha256 !== adjudicationEvidence.attestationSha256 ||
        receipt.adjudicatorId !== adjudicationEvidence.adjudicatorId ||
        receipt.adjudicatedAt !== adjudicationEvidence.adjudicatedAt ||
        receipt.terminalClass !== adjudicationEvidence.terminalClass ||
        receipt.adjudicationReason !== adjudicationEvidence.adjudicationReason ||
        receipt.adjudicatedCandidateResult !== adjudicationEvidence.adjudicatedCandidateResult ||
        receipt.protocolRuleId !== adjudicationEvidence.protocolRuleId ||
        receipt.protocolRuleSha256 !== adjudicationEvidence.protocolRuleSha256) {
      reject('terminal-adjudication-adjudicator-evidence-binding-mismatch');
    }
    if (isSha(adjudicationEvidence.evidenceSha256)) {
      if (seenAdjudicationEvidenceSha256.has(adjudicationEvidence.evidenceSha256)) {
        reject('terminal-adjudication-adjudicator-evidence-replayed');
      } else {
        seenAdjudicationEvidenceSha256.add(adjudicationEvidence.evidenceSha256);
      }
    }
  }

  if (receipt.terminalClass === 'no-winner') {
    const dualDefeat = adjudicationEvidence?.dualDefeatEvidence;
    if (!hasOnlyKeys(dualDefeat, DEFEAT_EVIDENCE_KEYS) ||
        dualDefeat.schema !== DUAL_DEFEAT_EVIDENCE_SCHEMA ||
        dualDefeat.eventStage !== 'aichi-open-top32' ||
        dualDefeat.penalty !== 'Defeat' ||
        !Array.isArray(dualDefeat.penalizedPhysicalSeats) ||
        dualDefeat.penalizedPhysicalSeats.length !== 2 ||
        dualDefeat.penalizedPhysicalSeats[0] !== 0 ||
        dualDefeat.penalizedPhysicalSeats[1] !== 1 ||
        !nonEmptyString(dualDefeat.judgeRulingRef)) {
      reject('terminal-adjudication-dual-defeat-evidence-invalid');
    }
  } else if (adjudicationEvidence?.dualDefeatEvidence !== undefined) {
    reject('terminal-adjudication-dual-defeat-evidence-unexpected');
  }

  if (receipt.terminalClass === 'candidate-defeat' ||
      receipt.terminalClass === 'opponent-defeat') {
    const singleDefeat = adjudicationEvidence?.singleDefeatEvidence;
    const expectedSeat = receipt.terminalClass === 'candidate-defeat'
      ? expected.candidatePhysicalSeat : 1 - expected.candidatePhysicalSeat;
    if (!hasOnlyKeys(singleDefeat, DEFEAT_EVIDENCE_KEYS) ||
        singleDefeat.schema !== SINGLE_DEFEAT_EVIDENCE_SCHEMA ||
        singleDefeat.eventStage !== 'aichi-open-top32' ||
        singleDefeat.penalty !== 'Defeat' ||
        !Array.isArray(singleDefeat.penalizedPhysicalSeats) ||
        singleDefeat.penalizedPhysicalSeats.length !== 1 ||
        singleDefeat.penalizedPhysicalSeats[0] !== expectedSeat ||
        !nonEmptyString(singleDefeat.judgeRulingRef)) {
      reject('terminal-adjudication-single-defeat-evidence-invalid');
    }
  } else if (adjudicationEvidence?.singleDefeatEvidence !== undefined) {
    reject('terminal-adjudication-single-defeat-evidence-unexpected');
  }

  const result = receipt.adjudicatedCandidateResult;
  const isNoWinnerTerminal = receipt.terminalClass === 'no-winner';
  const expectedStatus = isNoWinnerTerminal && result === null
    ? NO_WINNER_STATUS
    : RESULT_TO_STATUS[result];
  const rule = expected.protocolRule;
  if (expected.clockMode === 'aichi-top32-event-clock' ||
      rule?.clockMode === 'aichi-top32-event-clock' ||
      rule?.terminalClass === 'top32-prize-tiebreaker') {
    reject('terminal-adjudication-event-clock-evidence-unsupported');
  }
  const classAllowedResults = rule && TERMINAL_CLASS_ALLOWED_RESULTS[rule.terminalClass];
  const classAllowedReasons = rule && TERMINAL_CLASS_ALLOWED_REASONS[rule.terminalClass];
  const classResultSetValid = Array.isArray(classAllowedResults) &&
    Array.isArray(rule.allowedResults) &&
    rule.allowedResults.length === classAllowedResults.length &&
    classAllowedResults.every(allowed => rule.allowedResults.includes(allowed)) &&
    classAllowedResults.includes(result);
  const classReasonValid = Array.isArray(classAllowedReasons) &&
    classAllowedReasons.includes(rule.reason);
  let protocolRuleSha256 = null;
  try {
    if (rule && typeof rule === 'object' && !Array.isArray(rule)) {
      protocolRuleSha256 = canonicalSha256(rule);
    }
  } catch {}
  if (!expectedStatus || !rule || typeof rule !== 'object' || Array.isArray(rule) ||
      !nonEmptyString(rule.ruleId) || !nonEmptyString(rule.reason) ||
      !nonEmptyString(rule.terminalClass) || !Array.isArray(rule.allowedResults) ||
      !rule.allowedResults.includes(result) || !classResultSetValid ||
      !classReasonValid ||
      !CLOCK_MODES.has(rule.clockMode) ||
      (rule.terminalClass === 'top32-prize-tiebreaker' &&
        rule.clockMode !== 'aichi-top32-event-clock') ||
      rule.reason !== receipt.adjudicationReason ||
      rule.terminalClass !== receipt.terminalClass ||
      (isNoWinnerTerminal && result !== null) ||
      (!isNoWinnerTerminal && result === null) ||
      rule.clockMode !== expected.clockMode ||
      receipt.protocolRuleId !== rule.ruleId ||
      receipt.protocolRuleSha256 !== protocolRuleSha256 ||
      !adjudicationEvidence ||
      adjudicationEvidence.protocolRuleId !== rule.ruleId ||
      adjudicationEvidence.protocolRuleSha256 !== protocolRuleSha256) {
    reject('terminal-adjudication-protocol-rule-binding-invalid');
  }
  const statusConsistent = isNoWinnerTerminal
    ? result === null && receipt.statisticalStatus === null &&
      attempt.status === NO_WINNER_STATUS && expected.status === NO_WINNER_STATUS
    : receipt.statisticalStatus === expectedStatus &&
      attempt.status === expected.status && expected.status === expectedStatus;
  if (!statusConsistent) reject('terminal-adjudication-result-status-mismatch');
  if (receipt.gameStarted !== true || receipt.terminalReached !== true ||
      receipt.adjudicationStatus !== 'determinate') {
    reject('terminal-adjudication-not-determinate');
  }
  if (!validIso(receipt.adjudicatedAt) || !validIso(expected.endedAt) ||
      Date.parse(receipt.adjudicatedAt) < Date.parse(expected.endedAt)) {
    reject('terminal-adjudication-time-invalid');
  }
  if (receipt.clockMode !== expected.clockMode ||
      receipt.adjudicationProtocolSha256 !== expected.adjudicationProtocolSha256) {
    reject('terminal-adjudication-protocol-mismatch');
  }
  if (!digestMatches(receipt, 'receiptSha256') ||
      attempt.terminalAdjudicationReceiptSha256 !== receipt.receiptSha256) {
    reject('terminal-adjudication-receipt-digest-invalid');
  }

  if (isSha(receipt.receiptSha256)) {
    if (seenReceiptSha256.has(receipt.receiptSha256)) {
      reject('terminal-adjudication-receipt-replayed');
    } else {
      seenReceiptSha256.add(receipt.receiptSha256);
    }
  }

  return {
    valid: problems.size === 0,
    rejectionReasons: [...problems].sort(),
    receiptSha256: isSha(receipt.receiptSha256) ? receipt.receiptSha256 : null
  };
}

module.exports = {
  validateTerminalAdjudicationReceipt,
  validateSetupCoinChoiceEvidence,
  createSetupCoinChoiceEvidence,
  RECEIPT_SCHEMA,
  RUNNER_EVIDENCE_SCHEMA,
  ADJUDICATOR_EVIDENCE_SCHEMA,
  SETUP_EVIDENCE_SCHEMA,
  SETUP_RECEIPT_VERSION,
  CLOCK_MODES,
  RESULT_TO_STATUS,
  NO_WINNER_STATUS,
  SINGLE_DEFEAT_EVIDENCE_SCHEMA,
  TERMINAL_CLASS_ALLOWED_RESULTS,
  TERMINAL_CLASS_ALLOWED_REASONS,
  digestMatches
};
