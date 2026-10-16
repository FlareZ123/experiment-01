'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards, runMatch } = require('./headless.cjs');
const { resolveManifestFile } = require('./resolve-field.cjs');

/**
 * Controlled technical characterization of two opt-in generic bot fixes.
 * Both fixes affect both players; identical seeds cannot guarantee matched
 * real game events when policies take different legal action sequences.
 * @returns {object}
 */
function runFactorial() {
  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    { allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true }
  );
  const decks = new Map(field.decks.map(deck => [deck.rank, deck]));
  assert.ok(decks.get(1)?.playableUnderEngine && decks.get(10)?.playableUnderEngine);
  const cards = initializeCards().getAllCards();
  const { TrainerType } = require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types'));
  const supporterNames = new Set(cards.filter(c =>
    c.trainerType === TrainerType.SUPPORTER).map(c => c.name));
  const outcomes = [];
  for (const seed of [20261016, 20261103]) {
    for (const regidragoSeat of [0, 1]) {
      const a = regidragoSeat === 0 ? decks.get(10) : decks.get(1);
      const b = regidragoSeat === 1 ? decks.get(10) : decks.get(1);
      for (const supporterGuard of [false, true]) {
        for (const ddeRecovery of [false, true]) {
          const game = runMatch({
            deckA: a.cardIds, deckB: b.cardIds, seed, maxActions: 600,
            isolatePolicyRandomness: true,
            ...(supporterGuard ? { supporterDecisionCorrection: true } : {}),
            ...(ddeRecovery ? { doubleDragonRecovery: true } : {}),
            label: 'Aichi rank 10 and rank 1 policy-factorial diagnostic'
          });
          const played = game.cardsPlayedBySeat[regidragoSeat];
          const regidragoSupporters = Object.entries(played)
            .filter(([name]) => supporterNames.has(name))
            .reduce((sum, [,count]) => sum + count, 0);
          outcomes.push({
            seed, regidragoSeat, supporterGuard, ddeRecovery,
            actions: game.actions, turns: game.turns, finished: game.finished,
            firstTurnVerified: game.verifiedByDrawLog, firstTurnSlot: game.firstTurnSlot,
            regidragoSupporters, doubleDragonPlayed: played['Double Dragon Energy'] || 0,
            apexDragonAttacks: game.attackTrace.filter(t =>
              t.seat === regidragoSeat && t.attack === 'Apex Dragon').length,
            regidragoAttackCount: game.attackTrace.filter(t => t.seat === regidragoSeat).length,
            deckHashes: game.deckHashes
          });
        }
      }
    }
  }
  assert.equal(outcomes.length, 16);
  return {kind:'Exact-source policy mechanics, 2x2 factorial, 2 seeds, 2 engine seats',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRanks:[10,1], evidenceClass:'generic-bot technical behavior, not win rate',
    randomnessProtocol:'separate-game-and-per-seat-policy-prng-v1',
    outcomes};
}

if (require.main === module) console.log(JSON.stringify(runFactorial(), null, 2));
module.exports = {runFactorial};
