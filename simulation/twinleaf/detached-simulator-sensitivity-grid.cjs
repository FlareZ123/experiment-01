'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');
const {installDetachedSimulatorHook} =
  require('./detached-simulator-hook.cjs');
const {selectTrajectory} =
  require('./detached-simulator-game-contrast.cjs');

/**
 * Predeclared exploratory seed cohort. Includes the original seed that exposed
 * an outcome change; results are diagnostics, not independent qualification.
 */
const SEEDS = Object.freeze([20261049, 20261050, 20261051, 20261052]);

/**
 * Compare full-game simulator identity semantics over a bounded source-ranked
 * cohort. Fixed policy, seed, two physical slots and exact published decks.
 *
 * @returns {object}
 */
function compareDetachmentAcrossSeeds() {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const byRank = new Map(field.decks.map(d => [d.rank, d]));
  const champion = byRank.get(1), regidrago = byRank.get(10);
  assert.ok(champion?.playableUnderEngine && regidrago?.playableUnderEngine);
  const params = {
    deckA: champion.cardIds, deckB: regidrago.cardIds,
    maxActions: 350,
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    supporterDecisionCorrection: true,
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true
  };
  const rows = [];
  for (const seed of SEEDS) {
    const request = {...params, seed,
      label: 'Agent 49 fixed-source simulator detachment seed grid'};
    const baseline = selectTrajectory(runMatch(request));
    const restore = installDetachedSimulatorHook();
    let detached;
    try {
      detached = selectTrajectory(runMatch(request));
    } finally {
      restore();
    }
    assert.equal(baseline.seed, detached.seed);
    assert.deepEqual(baseline.deckHashes, detached.deckHashes);
    assert.equal(baseline.actualFirstTurn, detached.actualFirstTurn);
    rows.push({
      seed,
      actualFirstTurn: baseline.actualFirstTurn,
      sourceRanksInSlots: [1, 10],
      baseline: {
        finished: baseline.finished, winner: baseline.winner,
        actions: baseline.actions, attacks: baseline.attackCountBySeat,
        fingerprint: baseline.recordFingerprint
      },
      detached: {
        finished: detached.finished, winner: detached.winner,
        actions: detached.actions, attacks: detached.attackCountBySeat,
        fingerprint: detached.recordFingerprint
      },
      trajectoryChanged:
        baseline.recordFingerprint !== detached.recordFingerprint,
      engineWinnerChanged: baseline.finished && detached.finished &&
        baseline.winner !== detached.winner
    });
  }
  return {
    experiment: 'pinned-aichi-deterministic-simulator-isolation-grid-v1',
    engineRevision: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    publishedSourceRanks: [1, 10], seeds: SEEDS,
    count: rows.length,
    completedBoth: rows.filter(r => r.baseline.finished && r.detached.finished).length,
    changedTrajectories: rows.filter(r => r.trajectoryChanged).length,
    changedEngineWinners: rows.filter(r => r.engineWinnerChanged).length,
    rows,
    caveat: 'Four predeclared exploratory seeds, including the previously selected one. Neither bot is calibrated to skilled play, and changing Simulator identity can affect semantics beyond leaked damageTakenLastTurn. These records cannot estimate matchup win rate.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(compareDetachmentAcrossSeeds(), null, 2) + '\n');
}
module.exports = {SEEDS,compareDetachmentAcrossSeeds};
