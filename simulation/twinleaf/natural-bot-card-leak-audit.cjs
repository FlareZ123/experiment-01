'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');
const {selectTrajectory} = require('./detached-simulator-game-contrast.cjs');
const {installCardReferenceLeakObserver} =
  require('./simulator-leak-observer.cjs');
const {installDetachedSimulatorHook} =
  require('./detached-simulator-hook.cjs');

/**
 * Observational audit of the real, source-ranked SimpleTacticsAi calls.
 * Calls are seeded and source-identical. One control is uninstrumented;
 * the two observed calls use the original and detached Simulator.
 *
 * @returns {object}
 */
function characterizeNaturalPolicyLeaks() {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const byRank = new Map(field.decks.map(d => [d.rank, d]));
  const a = byRank.get(1), b = byRank.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine,
    'Need both original source decks in pinned engine');
  const request = {
    deckA: a.cardIds, deckB: b.cardIds,
    seed: 20261049, maxActions: 350,
    label: 'read-only Card alias telemetry rank1-rank10',
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    supporterDecisionCorrection: true,
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true
  };

  const unobserved = selectTrajectory(runMatch(request));
  const originalMonitor = installCardReferenceLeakObserver();
  let original, originalReport;
  try {
    original = selectTrajectory(runMatch(request));
    originalReport = originalMonitor.report;
  } finally {
    originalMonitor.restore();
  }
  assert.deepEqual(original, unobserved,
    'Observational monitor changed the unmodified game trajectory');

  const detach = installDetachedSimulatorHook();
  let detached, detachedReport;
  try {
    const monitored = installCardReferenceLeakObserver();
    try {
      detached = selectTrajectory(runMatch(request));
      detachedReport = monitored.report;
    } finally {
      monitored.restore();
    }
  } finally {
    detach();
  }

  assert.deepEqual(original.deckHashes, detached.deckHashes);
  assert.equal(original.actualFirstTurn, detached.actualFirstTurn);
  return {
    experiment: 'natural-bot-simulator-card-leak-observation-v1',
    sourceRanks: [1, 10], seed: request.seed, maxActions: request.maxActions,
    enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    controlNoninterferenceVerified: true,
    original: {
      outcome: {winner: original.winner, actions: original.actions,
        turns: original.turns},
      trajectoryFingerprint: original.recordFingerprint,
      speculativeFieldMutations: originalReport
    },
    detached: {
      outcome: {winner: detached.winner, actions: detached.actions,
        turns: detached.turns},
      trajectoryFingerprint: detached.recordFingerprint,
      speculativeFieldMutations: detachedReport
    },
    caveat: 'Read-only telemetry and weak SimpleTacticsAi decisions; one deterministic pair, no qualified competitive win rate. A changed field could be reset by a later effect.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(characterizeNaturalPolicyLeaks(), null, 2) + '\n');
}
module.exports = {characterizeNaturalPolicyLeaks};
