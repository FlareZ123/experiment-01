'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent31-shadow-rider-visible-pass-frontier-v1';
const safeOpponentNames = new Set(['Mega Absol ex', 'Oranguru V', 'Latias ex']);
const isPsychic = energy => /^Psychic Energy(?: |$)/.test(energy);

/**
 * Narrow, read-only sufficient visible geometry at a recorded candidate Pass.
 * Unrepresented status, prior effects and external paper-cost checks remain
 * unresolved; this must never be interpreted as a full legal-action oracle.
 *
 * @param {object} row Native archived original-source game row.
 * @param {object} pass Original owner-hand and public-board Pass receipt.
 * @returns {object|null}
 */
function visibleFundedVmaxPass(row, pass) {
  const seat = row.candidateSeat;
  if (![0, 1].includes(seat) || !Number.isInteger(pass?.ordinal) ||
      !Number.isInteger(pass?.turn) ||
      !Array.isArray(pass.ownerHandAfterDecision) ||
      !Array.isArray(pass.publicBoardBeforePass) ||
      pass.publicBoardBeforePass.length !== 2) return null;

  const roots = row.rootActionLedger ?? [];
  const action = roots.find(root => root.actionOrdinal === pass.ordinal);
  if (!action || action.playerSlot !== seat ||
      action.action !== 'PassTurnAction' ||
      action.turnBefore !== pass.turn) return null;
  if (roots.some(root => root.playerSlot === seat &&
      root.action === 'RetreatAction' && root.turnBefore === pass.turn &&
      root.actionOrdinal < pass.ordinal)) return null;

  const stoneCount = pass.ownerHandAfterDecision.filter(card =>
    /^Float Stone(?: |$)/.test(card)).length;
  if (!stoneCount) return null;

  const own = pass.publicBoardBeforePass[seat];
  const opponent = pass.publicBoardBeforePass[1 - seat];
  if (!own || !opponent || !own.active || !opponent.active ||
      !Array.isArray(own.bench) || !Array.isArray(opponent.bench)) return null;
  const opposing = [opponent.active, ...opponent.bench];
  if (!opposing.every(p => safeOpponentNames.has(p.name) &&
      Array.isArray(p.toolCards) && p.toolCards.length === 0)) return null;
  const stadiums = [own.stadium, opponent.stadium];
  if (!stadiums.every(s => Array.isArray(s) && s.length === 0)) return null;

  const active = own.active;
  if (active.name !== 'Shadow Rider Calyrex VMAX' ||
      !Array.isArray(active.toolCards) || active.toolCards.length !== 0 ||
      !Array.isArray(active.energyCards) ||
      active.energyCards.length >= 3 ||
      !active.energyCards.every(isPsychic)) return null;

  const benched = own.bench.findIndex(p =>
    p.name === 'Shadow Rider Calyrex VMAX' &&
    Array.isArray(p.energyCards) &&
    p.energyCards.length >= 3 &&
    p.energyCards.every(isPsychic) &&
    Array.isArray(p.printedAttacks) &&
    p.printedAttacks.some(attack =>
      attack.name === 'Max Geist' &&
      Array.isArray(attack.cost) &&
      attack.cost.length === 3 &&
      attack.cost.every(symbol => symbol === 9))
  );
  if (benched < 0) return null;
  return {trialId:row.trial.id,passRoot:pass.ordinal,
    globalTurn:pass.turn,stoneInOwnerHand:stoneCount,
    activePsychicCards:active.energyCards.length,
    fundedBenchedVmaxIndex:benched,
    fundedBenchedPsychicCards:own.bench[benched].energyCards.length,
    opponentActive:opponent.active.name,
    visibility:'owner-hand-and-public-board-only',
    paperLegality:'unresolved-status-and-effect-review'};
}

/**
 * Compares every archived opponent-attack-following candidate Pass snapshot;
 * snapshots of the same game are correlated and are never separate trials.
 *
 * @param {object} archive Native paired A/B full artifact.
 * @returns {object}
 */
function auditPairedPasses(archive) {
  assert.equal(archive.rows.length, archive.base.rows.length);
  assert.equal(archive.rows.length, archive.rescue.rows.length);
  const ids = new Set();
  const results = {};
  for (const arm of ['base', 'rescue']) {
    const trials = [], positive = [];
    let observedPassSnapshots = 0, withStone = 0, candidatePassRoots = 0;
    const byOriginalRank = {};
    for (let index = 0; index < archive.rows.length; index++) {
      const row = archive[arm].rows[index];
      assert.equal(row.trial.id, archive.rows[index].id);
      if (arm === 'base') {
        assert.ok(!ids.has(row.trial.id));
        ids.add(row.trial.id);
      }
      const rank = String(row.trial.rank ?? row.trial.id.split(':')[0]);
      const passRoots = new Set((row.rootActionLedger ?? []).filter(root =>
        root.playerSlot === row.candidateSeat &&
        root.action === 'PassTurnAction').map(root => root.actionOrdinal));
      candidatePassRoots += passRoots.size;
      byOriginalRank[rank] ??= {candidatePassRoots:0,capturedPasses:0,visiblePasses:0};
      byOriginalRank[rank].candidatePassRoots += passRoots.size;
      const alreadyCaptured = new Set();
      const reference = archive.base.rows[index];
      assert.equal(row.sourceDealFingerprint, reference.sourceDealFingerprint);
      assert.equal(row.fullPhysicalDealFingerprint,
        reference.fullPhysicalDealFingerprint);
      let observed = 0;
      for (const event of row.candidateRepliesAfterSourceAttacks ?? []) {
        const pass = event.candidateReplyTurnFinalPass;
        if (!pass) continue;
        assert.ok(passRoots.has(pass.ordinal), 'Captured Pass missing native root');
        assert.ok(!alreadyCaptured.has(pass.ordinal), 'Duplicate Pass capture');
        alreadyCaptured.add(pass.ordinal);
        observedPassSnapshots++;
        byOriginalRank[rank].capturedPasses++;
        const held = (pass.ownerHandAfterDecision ?? []).some(card =>
          /^Float Stone(?: |$)/.test(card));
        withStone += Number(held);
        const match = visibleFundedVmaxPass(row, pass);
        if (match) {
          byOriginalRank[rank].visiblePasses++;
          positive.push(match);
          observed++;
        }
      }
      if (observed) trials.push({trialId:row.trial.id,passCount:observed});
    }
    results[arm] = {
      candidatePassRoots, observedPassSnapshots,
      unobservedCandidatePassRoots:candidatePassRoots-observedPassSnapshots,
      byOriginalRank, passSnapshotsHoldingStone:withStone,
      visibleFundedVmaxPasses:positive.length,
      distinctTrialsWithVisibleOpportunity:trials.length,
      trials, positive
    };
  }
  return {version:VERSION,matchedRegisteredTrials:ids.size,
    evidenceScope:'candidate-passes-following-original-source-attacks-only',
    independenceUnit:'registered-physical-trial-not-pass-snapshot',
    ...results,
    competitivePaperQualifiedGames:0};
}

module.exports = {VERSION, visibleFundedVmaxPass, auditPairedPasses};
