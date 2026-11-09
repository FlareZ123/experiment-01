'use strict';

const assert = require('node:assert/strict');
const {frozenGroups} =
  require('./agent3/prospective-all29-celestial-paper-v2.cjs');
const {runArm, summarize} =
  require('./agent3/portable-champion-all29-20261109.cjs');
const {runDevelopment} =
  require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook} =
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook} =
  require('../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {installPlayabilityOrphanPromptHook} =
  require('../twinleaf/agent48-playability-orphan-prompt-hook.cjs');

const VERSION = 'agent48-original-rank7-guzma-orphan-replay-v1';
const ID = '7:6213:B:champion-reference';

/** @param {boolean} fix Reversible opt-in orphan-prompt hook. */
function one(fix) {
  const group = frozenGroups().find(g => g.id === ID);
  assert.ok(group, 'Original preregistered source deal missing');
  const prior = process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV = 'true';
  const door = installUnderworldDoorPsychicRecipientHook();
  let roar, orphan;
  try {
    roar = installRegidragoCelestialRoarPaperCustodyHook();
    if (fix) orphan = installPlayabilityOrphanPromptHook();
    const row = runArm(false, [group], options =>
      runDevelopment({...options, allowSingleCandidatePerGroup: false,
        allowSingleCandidateArm: true})).rows[0];
    const summary = summarize(row);
    return {
      arm: fix ? 'orphan-hook-on' : 'original-control',
      trial: group, status: summary.status,
      rootActionCount: summary.rootCount,
      nativeFinished: row.finished === true,
      nativeWinner: row.winner ?? null,
      nativeEndReason: row.endReason ?? null,
      error: summary.error,
      sourceDealFingerprint: summary.sourceDealFingerprint,
      fullPhysicalDealFingerprint: summary.fullPhysicalDealFingerprint,
      finalPrizes: row.finalPrizes ?? null,
      orphanAudit: orphan?.audit ?? null,
      lastAcceptedRoots: summary.rootActionLedger?.slice(-12) ?? null,
      paperQualified: false
    };
  } finally {
    if (orphan) orphan.restore();
    if (roar) roar();
    door();
    if (prior === undefined) delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV = prior;
  }
}

function run() {
  const control = one(false), treatment = one(true);
  return {
    version: VERSION, originalRegisteredDeal: ID,
    sameSourcePhysicalDeal: Boolean(control.sourceDealFingerprint &&
      control.sourceDealFingerprint === treatment.sourceDealFingerprint),
    sameFullPhysicalDeal: Boolean(control.fullPhysicalDealFingerprint &&
      control.fullPhysicalDealFingerprint === treatment.fullPhysicalDealFingerprint),
    arms: [control, treatment], paperQualifiedGames: 0
  };
}

if (require.main === module) {
  const result = run();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
module.exports = {VERSION, ID, one, run};
