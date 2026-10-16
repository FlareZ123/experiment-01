'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');
const {selectTrajectory} = require('./detached-simulator-game-contrast.cjs');
const {installGeneralCardLeakObserver} =
  require('./simulator-general-card-leak-observer.cjs');
const {installPrototypeSafeSimulatorHook} =
  require('./prototype-safe-simulator-hook.cjs');

/**
 * Trace read-only primitive/flat-array state leaks during one exact-source
 * ranked bot game and test a source-prototype-safe profile separately.
 *
 * @returns {object}
 */
function characterizeGeneralCardLeaks() {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const byRank = new Map(field.decks.map(d => [d.rank,d]));
  const rank1 = byRank.get(1), rank10 = byRank.get(10);
  assert.ok(rank1?.playableUnderEngine && rank10?.playableUnderEngine);
  const request = {
    deckA: rank1.cardIds, deckB: rank10.cardIds,
    seed: 20261049, maxActions: 350,
    label: 'Agent49 observational primitive Card mutation probe',
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    supporterDecisionCorrection: true,
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true
  };
  const control = selectTrajectory(runMatch(request));
  const observer = installGeneralCardLeakObserver();
  let observed, originalTelemetry;
  try {
    observed = selectTrajectory(runMatch(request));
    originalTelemetry = observer.report;
  } finally {
    observer.restore();
  }
  assert.deepEqual(observed, control,
    'Read-only primitive mutation observer must be noninterfering');

  const restore = installPrototypeSafeSimulatorHook();
  let safe, safeTelemetry;
  try {
    const safeObserver = installGeneralCardLeakObserver();
    try {
      safe = selectTrajectory(runMatch(request));
      safeTelemetry = safeObserver.report;
    } finally {
      safeObserver.restore();
    }
  } finally {
    restore();
  }
  assert.deepEqual(control.deckHashes, safe.deckHashes);
  return {
    experiment: 'natural-bot-general-card-primitive-alias-audit-v1',
    engineRevision: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRanks: [1,10], seed: request.seed,
    observerNoninterference: true,
    baseline: {
      fingerprint: control.recordFingerprint,
      winner: control.winner, finished: control.finished,
      telemetry: originalTelemetry
    },
    prototypeSafe: {
      fingerprint: safe.recordFingerprint,
      winner: safe.winner, finished: safe.finished,
      telemetry: safeTelemetry
    },
    caveat: 'One source-locked weak-bot game with broad scalar-and-flat-array Card-field observation; no claims about deep object mutation or qualified competitive win rate.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(characterizeGeneralCardLeaks(), null, 2) + '\n');
}
module.exports = {characterizeGeneralCardLeaks};
