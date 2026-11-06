'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent31-original-allpass-archive-parity-v1';
const TRIAL_IDS = Object.freeze([
  '5:0:A:champion-reference',
  '5:0:A:new-moon-lockbreaker-v1',
  '11:3:B:champion-reference',
  '11:3:B:new-moon-lockbreaker-v1'
]);

/**
 * Reconcile a historical complete 32-trial control archive with a later
 * four-arm, observer-only replay of two frozen registered source-deal groups.
 * All physical deals and actual native action arrays must be identical.
 * The later archive may add read-only post-choice owner observations.
 *
 * @param {object} historical Immutable archived rank5/rank11 A/B run.
 * @param {object} observed Later retrospective all-Pass native run.
 * @returns {object} Exact parity and previously missing Pass classifications.
 */
function auditArchiveParity(historical, observed) {
  assert.equal(historical?.base?.rows?.length, 32);
  assert.equal(observed?.native?.rows?.length, TRIAL_IDS.length);
  assert.equal(observed.native.nativeAllOwnerPassFrontierOptIn, true);
  assert.equal(observed.native.actorFundedShadowRiderFloatStoneRootOptIn, false);

  const original = new Map();
  for (const row of historical.base.rows) {
    assert.equal(typeof row.trial?.id, 'string');
    assert.ok(!original.has(row.trial.id), 'duplicate baseline trial id');
    original.set(row.trial.id, row);
  }
  assert.deepEqual(
    observed.native.rows.map(row => row.trial.id),
    [...TRIAL_IDS]
  );
  const rows = [];
  for (const replay of observed.native.rows) {
    const baseline = original.get(replay.trial.id);
    assert.ok(baseline, 'registered original trial missing');
    for (const field of [
      'sourceSeat', 'candidateSeat', 'sourceDealFingerprint',
      'fullPhysicalDealFingerprint', 'rootActionLedgerSha256', 'finished',
      'winner', 'endReason', 'turns', 'actionCount'
    ]) {
      assert.deepEqual(replay[field], baseline[field],
        `${replay.trial.id} diverged in ${field}`);
    }
    assert.deepStrictEqual(replay.rootActionLedger, baseline.rootActionLedger,
      `${replay.trial.id} diverged in actual Store root choices`);
    const frontier = replay.nativeAllOwnerPassFrontier;
    assert.equal(frontier?.completeNativePassCoverage, true);
    const accepted = replay.rootActionLedger.filter(root =>
      root.action === 'PassTurnAction');
    assert.equal(frontier.actualNativePassRoots, accepted.length);
    assert.equal(frontier.receipts.length, accepted.length);
    const passed = new Set();
    for (let index = 0; index < accepted.length; index++) {
      const root = accepted[index];
      const receipt = frontier.receipts[index];
      assert.equal(root.actionOrdinal, receipt.actionOrdinal);
      assert.equal(root.playerSlot, receipt.actorSeat);
      assert.equal(root.turnBefore, receipt.turn);
      assert.ok(!passed.has(receipt.actionOrdinal));
      passed.add(receipt.actionOrdinal);
    }

    const historicalSourceAttackConditioned = new Set(
      (baseline.candidateRepliesAfterSourceAttacks ?? [])
        .map(event => event.candidateReplyTurnFinalPass?.ordinal)
        .filter(Number.isSafeInteger));
    const actualCandidatePasses = new Set(accepted
      .filter(root => root.playerSlot === replay.candidateSeat)
      .map(root => root.actionOrdinal));
    for (const id of historicalSourceAttackConditioned)
      assert.ok(actualCandidatePasses.has(id),
        'old conditionally sampled candidate Pass absent from replay');

    const positives = frontier.receipts.filter(receipt =>
      receipt.role === 'candidate' && receipt.visibleFundedVmax);
    const eligible = positives.map(receipt => receipt.actionOrdinal);
    const recovered = eligible.filter(id =>
      !historicalSourceAttackConditioned.has(id));
    rows.push({
      id: replay.trial.id,
      sourceSeat: replay.sourceSeat,
      candidateSeat: replay.candidateSeat,
      rootCount: replay.rootActionLedger.length,
      allNativePasses: accepted.length,
      candidatePasses: actualCandidatePasses.size,
      sourceAttackConditionedCapturedPasses:
        historicalSourceAttackConditioned.size,
      narrowVisibleFundedVmaxPasses: eligible,
      newlyRecoveredFromOldObserver: recovered,
      samePhysicalDealAndExactNativeRootLedger: true
    });
  }
  return {
    schema: VERSION,
    originalControlTrialsAvailable: historical.base.rows.length,
    matchedRetrospectiveTrials: rows.length,
    exactNativeRootAndPhysicalParity: true,
    totalNativePasses: rows.reduce((sum, row) => sum + row.allNativePasses, 0),
    newlyRecoveredPassRoots: rows.flatMap(row =>
      row.newlyRecoveredFromOldObserver.map(ordinal => ({
        id: row.id, ordinal
      }))),
    independenceUnit: 'registered physical game, never repeated Pass root',
    competitivelyQualifiedGames: 0,
    rows
  };
}

module.exports = {VERSION, TRIAL_IDS, auditArchiveParity};
