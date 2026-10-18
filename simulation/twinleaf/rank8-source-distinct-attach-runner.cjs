'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch, initializeCards} = require('./headless.cjs');

/**
 * Source-dealt rank8 action regression for the public runMatch correction flag.
 * A raw invalid prompt is required; opt-in must get beyond that prompt.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const seed = deriveSlotSeeds(20261016, 'pilot', 8, 0).A;
  assert.equal(seed, 3755937400);
  const sourceDir = path.resolve(__dirname, '../../results/aichi-2026');
  const candidate = JSON.parse(fs.readFileSync(path.join(sourceDir,
    'candidate-temple-shadow-rider.json'), 'utf8'));
  const planned = planAichi(candidate, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const rank8 = planned.opponents.find(x => x.rank === 8);
  assert.equal(planned.candidate.cards.length, 60);
  assert.equal(rank8?.cards?.length, 60);
  const request = {
    deckA: planned.candidate.cards,
    deckB: rank8.cards,
    seed, maxActions: 600,
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    doubleDragonRecovery: true,
    supporterDecisionCorrection: true,
    isolatePolicyRandomness: true,
    captureDecisionTrace: true,
    captureAttackPassProbes: true,
    leleEntryAbilityLockCorrection: true,
    radiantGateLockCorrection: true,
    entryDrawLockCorrection: true
  };
  let rawFailure = null;
  try {
    runMatch(request);
  } catch (error) {
    rawFailure = String(error.message || error);
  }
  assert.match(rawFailure || '',
    /invalid result to AttachEnergyPrompt \\(prompt 57\\)/,
    'Source control must reproduce the recorded duplicate-target failure');
  const guarded = runMatch({
    ...request,
    distinctAttachTargetsCorrection: true
  });
  assert.equal(guarded.distinctAttachTargetsCorrection, true);
  assert.ok(guarded.policy.includes('+DistinctAttachTargetsGuard-v1'));
  assert.equal(guarded.finished, true,
    'Opt-in guard must reach an engine terminal on this archived source deal');
  assert.equal(guarded.verifiedByDrawLog, true);
  return {
    kind: 'rank8-source-distinct-attach-headless-opt-in-v1',
    sourceRank: 8, physicalCandidateSeat: 'A', seed,
    engine: guarded.engine, actions: guarded.actions, turns: guarded.turns,
    winner: guarded.winner, finalPrizes: guarded.prizesRemaining,
    observedSourceAttacks: guarded.attackTrace.filter(x => x.seat === 1),
    rawFailure: rawFailure.slice(0, 300),
    guardedPolicy: guarded.policy,
    evidenceClass: 'source-dealt one seed, bot-policy diagnostic, not competitive evidence'
  };
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = {runTest};
