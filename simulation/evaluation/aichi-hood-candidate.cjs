'use strict';

const assert = require('node:assert/strict');
const candidate = require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const { planAichi, summarisePlan } = require('./aichi-pilot.cjs');
const { runMatch } = require('../twinleaf/headless.cjs');

/**
 * Validate that the exact printing-aware 60-card Hood Shield challenger can
 * be resolved by the pinned executable game environment and drive two seats
 * against one representative persistent lock opponent.
 *
 * All games use uncalibrated SimpleTacticsAi. Their game winner is deliberately
 * excluded from the output: this tests engine feasibility, not strength.
 *
 * @returns {object}
 */
function probeHoodCandidate() {
  const plan = planAichi(candidate, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  });
  const status = summarisePlan(plan);
  assert.equal(status.candidateResolved, true,
    'Hood Shield must resolve to 60 supported pinned-engine card IDs');
  assert.equal(plan.candidate.cards.length, 60);
  assert.deepEqual(status.unavailableSourceRanks, [23, 25, 28]);

  const ranks = [6, 8];
  const matchups = [];
  for (const rank of ranks) {
    const opponent = plan.opponents.find(row => row.rank === rank);
    assert.equal(opponent.status, 'ready');
    const games = [];
    for (let candidateSide = 0; candidateSide <= 1; candidateSide += 1) {
      const game = runMatch({
        deckA: candidateSide === 0 ? plan.candidate.cards : opponent.cards,
        deckB: candidateSide === 1 ? plan.candidate.cards : opponent.cards,
        seed: 2026101715 + rank * 97 + candidateSide,
        maxActions: 1000,
        label: 'Hood Shield fixed challenger engine feasibility vs source rank ' + rank
      });
      games.push({
        candidateEngineSide: candidateSide === 0 ? 'A' : 'B',
        finished: game.finished, endReason: game.endReason,
        actions: game.actions, turns: game.turns,
        trueStartingTurnSlot: game.firstTurnSlot,
        firstTurnDrawLogVerified: game.verifiedByDrawLog,
        candidateActuallyWentFirst: game.verifiedByDrawLog === true
          ? game.firstTurnSlot === candidateSide : null,
        candidateCardsPlayed: game.cardsPlayedBySeat[candidateSide],
        candidateAttacks: game.attackTrace.filter(x => x.seat === candidateSide)
          .map(x => ({turn:x.turn,activePokemon:x.activePokemon,attack:x.attack})),
        opponentCardsPlayed: game.cardsPlayedBySeat[1 - candidateSide],
        engineDeckHashes: game.deckHashes
      });
    }
    matchups.push({opponentRank:rank,opponentArchetype:opponent.archetype,games});
  }
  return {
    kind: 'Hood Shield exact source-list engine and weak-policy feasibility',
    status,
    candidateDigest: plan.candidateDigest,
    fieldManifestDigest: plan.manifestDigest,
    matchups,
    evidence: 'two opponent source lists, both engine sides; generic bot competence and all actual game results unvalidated',
    cannotInferCompetitiveWinRate: true
  };
}

if (require.main === module) {
  console.log(JSON.stringify(probeHoodCandidate(), null, 2));
}

module.exports = { probeHoodCandidate };
