'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');
const {installDetachedSimulatorHook} =
  require('./detached-simulator-hook.cjs');

/** @param {object} result */
function selectTrajectory(result) {
  return {
    seed: result.seed,
    deckHashes: result.deckHashes,
    actualFirstTurn: result.firstTurnSlot,
    finished: result.finished,
    endReason: result.endReason,
    winner: result.winner,
    actions: result.actions,
    turns: result.turns,
    attackCountBySeat: [0, 1].map(seat =>
      result.attackTrace.filter(entry => entry.seat === seat).length),
    attacks: result.attackTrace.map(x => ({turn: x.turn, seat: x.seat,
      name: x.attack, attacker: x.activePokemon})),
    passesBySeat: result.actionsBySeat.map(x => x.PassTurnAction || 0),
    prizesRemaining: result.prizesRemaining,
    recordFingerprint: createHash('sha256').update(JSON.stringify({
      attacks: result.attackTrace, actionCounts: result.actionCounts,
      finalState: result.finalState, prizesRemaining: result.prizesRemaining,
      winner: result.winner, actions: result.actions, turns: result.turns
    })).digest('hex')
  };
}

/**
 * A small, fixed-list, fixed-seed Aichi engine policy-sensitivity diagnostic.
 * Comparing these trajectories cannot certify competitive play strength.
 *
 * @returns {object}
 */
function compareDetachedSimulatorGames() {
  const manifest = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const resolved = resolveManifestFile(manifest, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const ranks = new Map(resolved.decks.map(deck => [deck.rank, deck]));
  const a = ranks.get(1), b = ranks.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine,
    'Rank-1 and rank-10 source lists must resolve against the pinned engine');
  const request = {
    deckA: a.cardIds, deckB: b.cardIds,
    seed: 20261049, maxActions: 350,
    label: 'Agent 49 Simulator isolation one-seed diagnostic',
    strictPromptValidation: true, forestSealSearchCorrection: true,
    supporterDecisionCorrection: true, doubleDragonRecovery: true,
    isolatePolicyRandomness: true
  };
  const baseline = selectTrajectory(runMatch(request));
  const restore = installDetachedSimulatorHook();
  let isolated;
  try {
    isolated = selectTrajectory(runMatch(request));
  } finally {
    restore();
  }
  assert.deepEqual(isolated.deckHashes, baseline.deckHashes);
  assert.equal(isolated.seed, baseline.seed);
  assert.equal(isolated.actualFirstTurn, baseline.actualFirstTurn);
  return {
    experiment: 'source-locked-aichi-detached-simulator-policy-sensitivity-v1',
    sourceRanks: [1, 10], enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seed: request.seed, maxActions: request.maxActions,
    fixedDecksSame: true, actualFirstTurnSame: true,
    baselineProfile: 'pinned-simulator-card-alias',
    isolatedProfile: 'detached-simulator-experimental-v1',
    trajectoryFingerprintsEqual:
      baseline.recordFingerprint === isolated.recordFingerprint,
    baseline, isolated,
    caveat: 'Two runs share the same seed but are not independent matches. Any divergence is policy or model sensitivity under a weak bot, never a skilled-play win-rate observation.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(compareDetachedSimulatorGames(), null, 2) + '\n');
}
module.exports = {compareDetachedSimulatorGames,selectTrajectory};
