'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent48-registered-estimand-receipt-v1';
const SHA256 = /^[0-9a-f]{64}$/;

/** @param {unknown} value @returns {string|null} */
const digest = value => typeof value === 'string' && SHA256.test(value) ?
  value : null;

/** @param {unknown} value @returns {0|1|null} */
const seat = value => value === 0 || value === 1 ? value : null;

/**
 * Preserve the complete predeclared natural-game population before considering
 * source-deal matching. Controlled comparisons remain separate postgame audits.
 * No first-live hand, result winner, or post-treatment board is used in parity.
 *
 * @param {object[]} registered Frozen trial rows with unique ids.
 * @param {object[]} nativeRows Actual returned rows, including errors and caps.
 * @param {object[]} [comparisonPlans] Predeclared {id,leftId,rightId,purpose}.
 *   purpose: 'same-60-policy-ab' or 'different-60-fixed-opening'.
 * @returns {object} A read-only, competitively unqualified receipt.
 */
function registeredEstimandReceipt(registered, nativeRows, comparisonPlans = []) {
  assert.ok(Array.isArray(registered) && Array.isArray(nativeRows));
  assert.ok(Array.isArray(comparisonPlans));
  const planned = new Map();
  for (const trial of registered) {
    assert.ok(typeof trial?.id === 'string' && trial.id.length > 0);
    assert.ok(!planned.has(trial.id), 'Duplicate registered trial ID');
    assert.ok(Number.isSafeInteger(trial.rank) && trial.rank > 0);
    assert.ok(Number.isSafeInteger(trial.seed) && trial.seed >= 0);
    assert.ok(trial.candidateSlot === 'A' || trial.candidateSlot === 'B');
    assert.ok(typeof trial.candidateId === 'string' && trial.candidateId.length > 0);
    planned.set(trial.id, trial);
  }
  const observed = new Map();
  for (const row of nativeRows) {
    const id = row?.trial?.id;
    assert.ok(planned.has(id), 'Unregistered native trial');
    assert.ok(!observed.has(id), 'Duplicate native attempt');
    const frozen = planned.get(id);
    for (const field of ['rank', 'seed', 'candidateSlot', 'candidateId']) {
      assert.equal(row.trial[field], frozen[field],
        'Native trial differs from frozen registration: ' + field);
    }
    assert.ok(typeof row.status === 'string' && row.status.length > 0,
      'Native attempt missing disposition');
    observed.set(id, row);
  }
  const statuses = {};
  const attempts = [...planned].map(([id, trial]) => {
    const row = observed.get(id);
    const status = row?.status ?? 'MISSING_NATIVE_ROW';
    statuses[status] = (statuses[status] ?? 0) + 1;
    return {id, rank: trial.rank, candidateId: trial.candidateId,
      candidateSlot: trial.candidateSlot, status,
      nativeRowObserved: Boolean(row)};
  });

  const usedComparisonIds = new Set();
  const comparisons = comparisonPlans.map(pair => {
    assert.ok(typeof pair?.id === 'string' && pair.id.length > 0);
    assert.ok(!usedComparisonIds.has(pair.id), 'Duplicate comparison ID');
    usedComparisonIds.add(pair.id);
    assert.ok(pair.leftId !== pair.rightId, 'Self comparison');
    const left = planned.get(pair.leftId), right = planned.get(pair.rightId);
    assert.ok(left && right, 'Comparison references unregistered trial');
    assert.ok(['same-60-policy-ab', 'different-60-fixed-opening']
      .includes(pair.purpose), 'Unknown comparison purpose');
    const a = observed.get(pair.leftId), b = observed.get(pair.rightId);
    const eligiblePlan = left.rank === right.rank &&
      left.seed === right.seed && left.candidateSlot === right.candidateSlot;
    const sameCandidate = left.candidateId === right.candidateId;
    const eligibleType = pair.purpose === 'same-60-policy-ab' ?
      sameCandidate : !sameCandidate;
    let parity = 'UNKNOWN';
    if (!eligiblePlan || !eligibleType) {
      parity = 'INELIGIBLE_PLAN';
    } else if (a && b) {
      const leftSource = digest(a.sourceDealFingerprint);
      const rightSource = digest(b.sourceDealFingerprint);
      const leftFull = digest(a.fullPhysicalDealFingerprint);
      const rightFull = digest(b.fullPhysicalDealFingerprint);
      const leftPrint = digest(left.candidatePrintSha256);
      const rightPrint = digest(right.candidatePrintSha256);
      const leftRoster = digest(left.sourcePrintSha256);
      const rightRoster = digest(right.sourcePrintSha256);
      const starterA = a.verifiedFirstTurn === true ?
        seat(a.actualStarterSeat) : null;
      const starterB = b.verifiedFirstTurn === true ?
        seat(b.actualStarterSeat) : null;
      const sourceA = seat(a.sourceSeat), sourceB = seat(b.sourceSeat);
      const required = [leftSource,rightSource,leftFull,rightFull,
        leftPrint,rightPrint,leftRoster,rightRoster,
        starterA,starterB,sourceA,sourceB];
      if (required.every(v => v !== null)) {
        parity = leftSource === rightSource && leftFull === rightFull &&
          leftRoster === rightRoster && starterA === starterB &&
          sourceA === sourceB &&
          (pair.purpose !== 'same-60-policy-ab' ||
            leftPrint === rightPrint) ?
          'MATCHED_REPORTED_INITIAL_STATE' : 'MISMATCHED';
      } else {
        const knownMismatch = (leftSource && rightSource &&
          leftSource !== rightSource) ||
          (leftFull && rightFull && leftFull !== rightFull) ||
          (leftRoster && rightRoster && leftRoster !== rightRoster) ||
          (starterA !== null && starterB !== null && starterA !== starterB) ||
          (sourceA !== null && sourceB !== null && sourceA !== sourceB) ||
          (pair.purpose === 'same-60-policy-ab' && leftPrint &&
            rightPrint && leftPrint !== rightPrint);
        parity = knownMismatch ? 'MISMATCHED' : 'UNKNOWN';
      }
    }
    return {id: pair.id, purpose: pair.purpose, leftId: pair.leftId,
      rightId: pair.rightId, parity,
      onlyConditionalFixedOpeningDiagnostic:
        pair.purpose === 'different-60-fixed-opening',
      competitiveInferenceQualified: false};
  });

  return {version: VERSION,
    primaryNaturalGamePopulationRetained: {
      registeredAttempts: registered.length,
      attemptRows: attempts,
      nativeRowsObserved: observed.size,
      missingNativeRows: registered.length - observed.size,
      statusCounts: statuses,
      registrationPopulationPreserved: true,
      crossDeckPhysicalParityUsedAsFilter: false,
      competitiveQualifiedGames: 0
    },
    secondaryControlledPairPretreatmentParity: comparisons,
    postTreatmentFirstLiveHandUsedForPairing: false,
    gameWinRateCertified: false};
}

module.exports = {VERSION, registeredEstimandReceipt};
