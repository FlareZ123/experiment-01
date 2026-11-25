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

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha(value) {
  return typeof value === 'string' && SHA256.test(value);
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
  }
  if (!adjudicationEvidence || typeof adjudicationEvidence !== 'object' || Array.isArray(adjudicationEvidence)) {
    reject('terminal-adjudication-independent-adjudicator-evidence-missing');
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

  const result = receipt.adjudicatedCandidateResult;
  const isNoWinnerTerminal = receipt.terminalClass === 'no-winner';
  const expectedStatus = isNoWinnerTerminal && result === null
    ? NO_WINNER_STATUS
    : RESULT_TO_STATUS[result];
  const rule = expected.protocolRule;
  let protocolRuleSha256 = null;
  try {
    if (rule && typeof rule === 'object' && !Array.isArray(rule)) {
      protocolRuleSha256 = canonicalSha256(rule);
    }
  } catch {}
  if (!expectedStatus || !rule || typeof rule !== 'object' || Array.isArray(rule) ||
      !nonEmptyString(rule.ruleId) || !nonEmptyString(rule.reason) ||
      !nonEmptyString(rule.terminalClass) || !Array.isArray(rule.allowedResults) ||
      !rule.allowedResults.includes(result) ||
      rule.reason !== receipt.adjudicationReason ||
      rule.terminalClass !== receipt.terminalClass ||
      (isNoWinnerTerminal && result !== null) ||
      (!isNoWinnerTerminal && result === null) ||
      (rule.clockMode !== undefined && rule.clockMode !== expected.clockMode) ||
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
  digestMatches
};
