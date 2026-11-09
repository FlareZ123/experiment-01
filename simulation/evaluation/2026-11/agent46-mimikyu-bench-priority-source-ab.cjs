'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('../../twinleaf/resolve-field.cjs');
const {initializeCards, runMatch} = require('../../twinleaf/headless.cjs');
const {installMimikyuPriorityBasic} =
  require('../../twinleaf/2026-11/agent46-mimikyu-priority-basic.cjs');

const SEEDS = Object.freeze([
  2007978395, 1583483005, 1937982055, 183468883,
  737823214, 1744110989, 804834356, 1088266082,
  48896019, 1446869584, 1083154278, 595758446
]);

/** @returns {object} Pinned original source rank1/rank10 mapping. */
function sourceDecks() {
  const manifest = path.resolve(__dirname,
    '../../../results/aichi-2026/full-decklists.json');
  const result = resolveManifestFile(manifest, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const byRank = new Map(result.decks.map(row => [row.rank, row]));
  for (const rank of [1, 10]) {
    const deck = byRank.get(rank);
    assert.equal(deck?.playableUnderEngine, true, 'Unmapped original rank ' + rank);
    assert.equal(deck.cardIds.length, 60);
  }
  return byRank;
}

/**
 * One immutable source 60 x source 60 physical seat and native seed.
 * Observer events are proposals, distinct from actual Store attacks.
 * @param {Map<number,object>} byRank
 * @param {number} seed
 * @param {0|1} seat
 * @param {boolean} intervention
 * @returns {object}
 */
function arm(byRank, seed, seat, intervention) {
  const ranks = seat === 0 ? [1, 10] : [10, 1];
  const proposed = [];
  const request = {
    deckA: byRank.get(ranks[0]).cardIds,
    deckB: byRank.get(ranks[1]).cardIds,
    seed,
    label: 'Agent46 original rank1 Mimikyu owner-hand priority ' +
      (intervention ? 'treatment' : 'control') + ' seat ' + seat,
    maxActions: 180,
    isolatePolicyRandomness: true,
    captureInitialSourceDealFingerprintSeat: seat,
    doubleDragonRecovery: true,
    supporterDecisionCorrection: true,
    mimikyuApexCopycatCompatibility: true,
    mimikyuApexTimelessPolicy: true,
    mimikyuApexTimelessPolicySeat: seat,
    mimikyuDeclaredHistoryCorrection: true,
    regidragoDeclaredHistoryCorrection: true,
    passClearsLastAttackCorrection: true
  };
  const base = {seed, seat, treatment: intervention,
    rankOrder: ranks, ownerRank: 1, opponentRank: 10};
  let restore = null;
  try {
    if (intervention) {
      restore = installMimikyuPriorityBasic({seat,
        onProposed: event => {
          if (proposed.length < 32) proposed.push(event);
        }
      });
    }
    const game = runMatch(request);
    const ownAttacks = game.attackTrace.filter(row => row.seat === seat);
    const opponentAttacks = game.attackTrace.filter(row => row.seat !== seat);
    return {
      ...base, status: game.finished ? 'native-terminal' : 'native-censored',
      finished: game.finished, endReason: game.endReason,
      actionCount: game.actions, turns: game.turns,
      winner: game.winner ?? null, winnerSeat: game.winnerSeat ?? null,
      actualCopycatCount: ownAttacks.filter(row => row.attack === 'Copycat').length,
      actualOpponentApexCount:
        opponentAttacks.filter(row => row.attack === 'Apex Dragon').length,
      nativeOwnerAttackTrace: ownAttacks,
      nativeOpponentAttackTrace: opponentAttacks,
      ownerSetupProposals: proposed,
      nativeFinalState: game.finalState,
      nativePrizesRemaining: game.prizesRemaining,
      nativeInitialSourceDeal: game.initialSourceDealFingerprint,
      printedSource60Hashes: game.deckHashes,
      pinnedEngine: game.engine,
      qualifiedPaperGames: 0
    };
  } catch (error) {
    return {...base,status:'native-engine-error',
      error:String(error?.stack || error),ownerSetupProposals:proposed,
      qualifiedPaperGames:0};
  } finally {
    restore?.();
  }
}

/** @returns {object} Full prospective 48-arm original-source diagnostic. */
function run() {
  initializeCards();
  const byRank = sourceDecks();
  const rows = [];
  const matchedGroups = [];
  for (const seed of SEEDS) {
    for (const seat of [0, 1]) {
      const baseline = arm(byRank, seed, seat, false);
      const treatment = arm(byRank, seed, seat, true);
      rows.push(baseline, treatment);
      const comparable = baseline.nativeInitialSourceDeal &&
        treatment.nativeInitialSourceDeal;
      const sameInitialSourceDeal = Boolean(comparable &&
        JSON.stringify(baseline.nativeInitialSourceDeal) ===
        JSON.stringify(treatment.nativeInitialSourceDeal));
      matchedGroups.push({
        seed, seat,
        sameInitialSourceDeal,
        baselineStatus: baseline.status,
        treatmentStatus: treatment.status,
        proposals: treatment.ownerSetupProposals.length,
        baselineCopycat: baseline.actualCopycatCount ?? null,
        treatmentCopycat: treatment.actualCopycatCount ?? null
      });
    }
  }
  const result = {
    schema:'agent46-prospective-mimikyu-visible-regidrago-bench-priority-ab-v1',
    registration:'results/methodology/registrations/agent46-rank1-mimikyu-visible-regidrago-bench-priority-ab-20261109.md',
    seeds:SEEDS,
    originalRank1And10Fixed60:true,
    maxActions:180,
    nativeAttempts:rows.length,
    controlledPairs:matchedGroups.length,
    physicallyMatchedPairs:matchedGroups.filter(g => g.sameInitialSourceDeal).length,
    interventionProposals:rows.filter(row => row.treatment)
      .reduce((sum,row) => sum + row.ownerSetupProposals.length,0),
    competitivePaperGames:0,
    matches:matchedGroups,
    rows
  };
  console.log(JSON.stringify(result));
  return result;
}
if (require.main === module) run();
module.exports = {SEEDS, sourceDecks, arm, run};
