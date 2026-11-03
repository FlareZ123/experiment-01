'use strict';

const assert = require('node:assert/strict');
const {isDeepStrictEqual} = require('node:util');

const BASELINE = 'joint-v1-control';
const SELECTED = 'selected-v2-symmetric-vip';

/**
 * Classify a single native simulation row, never treating caps as wins.
 * @param {object} row Full original engine row.
 * @returns {'candidate-win'|'source-win'|'capped'|'error'|'unclassified'}
 */
function classifyNativeRow(row) {
  if (row.status === 'engine-error') return 'error';
  if (row.endReason === 'action-limit') return 'capped';
  if (row.endReason !== 'engine-game-end') return 'unclassified';
  assert.ok(row.candidateSeat === 0 || row.candidateSeat === 1);
  assert.equal(row.sourceSeat, 1 - row.candidateSeat);
  assert.ok(row.winner === 0 || row.winner === 1,
    'Finished native game must have a classified winner');
  return row.winner === row.candidateSeat ? 'candidate-win' : 'source-win';
}

/**
 * Check a real physical source and candidate setup, not just RNG seed equality.
 * @param {object} a Frozen-policy native row.
 * @param {object} b Selected-policy native row.
 * @returns {boolean} Strict exact initial setup match.
 */
function samePhysicalSetup(a, b) {
  return typeof a.sourceDealFingerprint === 'string' &&
    a.sourceDealFingerprint.length > 0 &&
    a.sourceDealFingerprint === b.sourceDealFingerprint &&
    typeof a.fullPhysicalDealFingerprint === 'string' &&
    a.fullPhysicalDealFingerprint.length > 0 &&
    a.fullPhysicalDealFingerprint === b.fullPhysicalDealFingerprint &&
    a.actualStarterSeat != null &&
    a.actualStarterSeat === b.actualStarterSeat &&
    a.candidateSeat === b.candidateSeat &&
    a.sourceSeat === b.sourceSeat &&
    typeof a.sourceDeckFingerprint === 'string' &&
    a.sourceDeckFingerprint.length > 0 &&
    a.sourceDeckFingerprint === b.sourceDeckFingerprint &&
    typeof a.candidateDeckFingerprint === 'string' &&
    a.candidateDeckFingerprint.length > 0 &&
    a.candidateDeckFingerprint === b.candidateDeckFingerprint;
}

/**
 * Find the earliest changed native action, including a newly inserted action.
 * @param {object[]} before Original native root ledger.
 * @param {object[]} after Selected native root ledger.
 * @returns {object|null} First difference and corresponding native roots.
 */
function firstChangedRoot(before, after) {
  assert.ok(Array.isArray(before) && Array.isArray(after));
  const n = Math.max(before.length, after.length);
  for (let i = 0; i < n; i++) {
    if (!isDeepStrictEqual(before[i], after[i])) {
      return {index: i, baseline: before[i] ?? null, selected: after[i] ?? null};
    }
  }
  return null;
}

/**
 * Posthoc fixed-candidate policy contrast; preserves every native terminal,
 * cap and error while refusing winner comparisons on missing physical setups.
 * Matching opponent source draws across DIFFERENT candidate printed sixties
 * can condition away deck-specific mulligan bonus draws. Therefore never use
 * these matched-subset rows to estimate an unconditional deck-choice win rate.
 * It makes no paper-legal-game or match-strength claim.
 * @param {object} archive Two-mode original native joint-v2 artifact.
 * @returns {object} Deterministic paired-native disposition audit.
 */
function auditPairedNativeOutcomes(archive) {
  assert.deepEqual(archive.modes.map(x => x.id), [BASELINE, SELECTED]);
  const baseline = archive.modes[0].native.rows;
  const selected = archive.modes[1].native.rows;
  assert.equal(baseline.length, selected.length);
  const nativeDispositions = [Object.create(null), Object.create(null)];
  const transitions = Object.create(null);
  const unmatched = [];
  const paired = [];
  const adverseCandidateReversals = [];
  for (let i = 0; i < baseline.length; i++) {
    const a = baseline[i], b = selected[i];
    assert.equal(a.trial.id, b.trial.id, 'Native rows must preserve trial order');
    const aOutcome = classifyNativeRow(a);
    const bOutcome = classifyNativeRow(b);
    nativeDispositions[0][aOutcome] = (nativeDispositions[0][aOutcome] ?? 0) + 1;
    nativeDispositions[1][bOutcome] = (nativeDispositions[1][bOutcome] ?? 0) + 1;
    if (!samePhysicalSetup(a, b)) {
      unmatched.push({trialId: a.trial.id, baselineOutcome: aOutcome,
        selectedOutcome: bOutcome, pairedWinComparisonPermitted: false});
      continue;
    }
    const firstRoot = firstChangedRoot(a.rootActionLedger, b.rootActionLedger);
    const transition = `${aOutcome}->${bOutcome}`;
    transitions[transition] = (transitions[transition] ?? 0) + 1;
    const row = {trialId: a.trial.id, baselineOutcome: aOutcome,
      selectedOutcome: bOutcome, candidateSeat: a.candidateSeat,
      sourceSeat: a.sourceSeat, firstChangedRoot: firstRoot,
      sourceDealFingerprint: a.sourceDealFingerprint,
      fullPhysicalDealFingerprint: a.fullPhysicalDealFingerprint};
    paired.push(row);
    if (aOutcome === 'candidate-win' && bOutcome === 'source-win') {
      adverseCandidateReversals.push(row);
    }
  }
  return {
    schema: 'agent4-matched-physical-native-disposition-audit-v1',
    estimand: 'within-the-same-candidate-deck-two-policy-mechanistic-contrast',
    unconditionalCrossCandidateWinRateQualified: false,
    modes: [BASELINE, SELECTED],
    totalNativeAttempts: baseline.length + selected.length,
    attemptedPairs: baseline.length,
    physicalMatchedPairs: paired.length,
    unmatchedPairs: unmatched,
    nativeDispositions, transitions, paired,
    adverseCandidateReversals,
    paperCompetitivelyQualifiedGames: 0,
    certifiedWinRate: null
  };
}

module.exports = {classifyNativeRow, samePhysicalSetup, firstChangedRoot,
  auditPairedNativeOutcomes};
