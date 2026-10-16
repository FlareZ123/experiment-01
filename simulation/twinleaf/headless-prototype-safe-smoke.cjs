'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');

/**
 * Exercise opt-in isolation with exact published 60-card lists. This is a
 * runner lifecycle regression; it does not assess match competitiveness.
 * @returns {object}
 */
function verifyPrototypeSafeHeadlessLifecycle() {
  const resolved = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const ranks = new Map(resolved.decks.map(deck => [deck.rank, deck]));
  const a = ranks.get(1), b = ranks.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine);

  const simulatorModule = require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/bots/simulator'));
  const originalSimulator = simulatorModule.Simulator;
  const request = {
    deckA: a.cardIds, deckB: b.cardIds,
    seed: 20261049, maxActions: 350,
    label: 'agent8-prototype-safe-headless-lifecycle',
    strictPromptValidation: true, supporterDecisionCorrection: true,
    forestSealSearchCorrection: true, doubleDragonRecovery: true,
    isolatePolicyRandomness: true
  };

  const baseline = runMatch(request);
  assert.strictEqual(simulatorModule.Simulator, originalSimulator);
  assert.equal(baseline.prototypeSafeSimulatorIsolation, false);
  assert.doesNotMatch(baseline.policy, /PrototypeSafeSimulatorIsolation/);

  const isolated = runMatch({...request, prototypeSafeSimulatorIsolation: true});
  assert.strictEqual(simulatorModule.Simulator, originalSimulator,
    'Prototype-safe and fair Simulator wrappers must be restored');
  assert.equal(isolated.prototypeSafeSimulatorIsolation, true);
  assert.match(isolated.policy, /PrototypeSafeSimulatorIsolation-experimental-v1/);
  assert.deepEqual(isolated.deckHashes, baseline.deckHashes);
  assert.equal(isolated.seed, baseline.seed);
  assert.equal(isolated.firstTurnSlot, baseline.firstTurnSlot);
  assert.equal(isolated.verifiedByDrawLog, true);
  assert.equal(baseline.verifiedByDrawLog, true);

  assert.throws(() => runMatch({
    ...request, prototypeSafeSimulatorIsolation: true, maxActions: 0
  }), /maxActions must be a positive integer/);
  assert.strictEqual(simulatorModule.Simulator, originalSimulator,
    'Exceptional runner cleanup must restore upstream Simulator');

  const baselineAfter = runMatch(request);
  assert.deepEqual(baselineAfter, baseline,
    'Opt-in isolation must not contaminate a later unmodified match');

  return {
    scope: 'source-ranked experimental Simulator lifecycle and telemetry',
    seed: request.seed, sourceRanks: [1, 10],
    engine: baseline.engine,
    deckHashes: baseline.deckHashes,
    firstTurnSlot: baseline.firstTurnSlot,
    baseline: {actions: baseline.actions, turns: baseline.turns,
      finished: baseline.finished, winner: baseline.winner},
    isolated: {actions: isolated.actions, turns: isolated.turns,
      finished: isolated.finished, winner: isolated.winner},
    restoredOriginalSimulator: simulatorModule.Simulator === originalSimulator,
    postIsolationBaselineIdentical: true,
    caution: 'The prototype-safe clone is a research experiment with unverified coverage. Finished bot games here do not qualify as competitive results.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(verifyPrototypeSafeHeadlessLifecycle(), null, 2)+'\n');
}

module.exports = {verifyPrototypeSafeHeadlessLifecycle};
