'use strict';
const path = require('node:path');
const { resolveManifestFile } = require('./resolve-field.cjs');
const { runMatch, initializeCards } = require('./headless.cjs');

/** @param {string} relativePath */
function engine(relativePath) {
  return require(path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output', relativePath));
}

/** Probe the policy variants against two actual published 60-card lists. */
function probe() {
  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    { allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true }
  );
  const decks = new Map(field.decks.map(deck => [deck.rank, deck.cardIds]));
  const { TrainerCard } = engine('game/store/card/trainer-card');
  const { TrainerType } = engine('game/store/card/card-types');
  const supporters = new Set(initializeCards().getAllCards()
    .filter(card => card instanceof TrainerCard && card.trainerType === TrainerType.SUPPORTER)
    .map(card => card.name));
  const cases = [false, true].map(corrected => {
    const label = corrected ? 'SupporterDecisionGuard-v1' : 'pinned-baseline';
    try {
      const game = runMatch({
        deckA: decks.get(1), deckB: decks.get(10),
        seed: 20261016, maxActions: 900, isolatePolicyRandomness: true,
        supporterDecisionCorrection: corrected,
        label: 'Aichi 1 vs 10, ' + label
      });
      const supporterPlays = game.cardsPlayedBySeat.map(cards =>
        Object.fromEntries(Object.entries(cards).filter(([name]) => supporters.has(name))));
      return {
        label, status: game.finished ? 'finished' : 'action-limited',
        seed: game.seed, actions: game.actions, turns: game.turns,
        firstTurnSlot: game.firstTurnSlot, verifiedByDrawLog: game.verifiedByDrawLog,
        winner: game.winner, supporterPlays,
        allCardsPlayedBySeat: game.cardsPlayedBySeat,
        deckHashes: game.deckHashes,
        policy: game.policy, randomnessProtocol: game.randomnessProtocol
      };
    } catch (error) {
      return {label, status: 'engine-exception', message: String(error.message)};
    }
  });
  return {
    kind: 'source-deck Supporter policy feasibility, no competitive inference',
    pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05', cases
  };
}
if (require.main === module) {
  const report = probe();
  console.log(JSON.stringify(report, null, 2));
  if (report.cases.every(item => item.status === 'engine-exception')) process.exitCode = 1;
}
module.exports = {probe};
