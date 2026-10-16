'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');

const FILE = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
const SOURCE_RANK = 6;
const BASELINE_RANK = 1;
const ENGINE = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** Source-locked two-seat probe of native/research-patched Japanese promo usage.
 * These are generic bot decisions, without competitive playing-policy claims.
 * @returns {object}
 */
function probe() {
  const field = resolveManifestFile(FILE, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const source = new Map(field.decks.map(deck => [deck.rank, deck]));
  const rank6 = source.get(SOURCE_RANK);
  const rank1 = source.get(BASELINE_RANK);
  assert.ok(rank6 && rank1, 'Published source rank 1 and 6 are required');
  assert.equal(rank6.cardIds.length, 60);
  assert.equal(rank1.cardIds.length, 60);

  const printedPromoCards = rank6.cardIds.filter(id =>
    ['Palace Book SMP', 'Palace Belt BWP', "Player's Ceremony SP 127"]
      .includes(id));
  assert.equal(printedPromoCards.length, 3,
    'Rank-6 source Japanese promo inventory changed; review fixture');
  const cases = [
    {slots: [6, 1], seed: 2026101616},
    {slots: [1, 6], seed: 2026101617}
  ].map(({slots, seed}) => {
    const sourceSeat = slots.indexOf(SOURCE_RANK);
    const deckA = source.get(slots[0]).cardIds;
    const deckB = source.get(slots[1]).cardIds;
    try {
      const game = runMatch({
        deckA, deckB, seed, maxActions: 600,
        label: 'source-rank6-JP-promos-vs-rank1-seat' + sourceSeat,
        captureDecisionTrace: true, isolatePolicyRandomness: true,
        strictPromptValidation: true, supporterDecisionCorrection: true,
        forestSealSearchCorrection: true,
        leleEntryAbilityLockCorrection: true,
        radiantGateLockCorrection: true
      });
      const selectedActions = (game.decisionTrace || []).filter(entry =>
        entry.playerSlot === sourceSeat &&
        (['Palace Book', 'Palace Belt', "Player's Ceremony"].includes(entry.card) ||
          entry.action === 'UseStadiumAction'));
      return {
        status: game.finished ? 'completed-engine-game' : 'action-limited',
        slots, sourceSeat, seed,
        engine: game.engine, deckHashes: game.deckHashes,
        actualFirstTurn: game.firstTurnSlot,
        finished: game.finished, winner: game.winner,
        actions: game.actions, turns: game.turns,
        printedPromoCards,
        sourcePlayed: Object.fromEntries(
          ['Palace Book', 'Palace Belt', "Player's Ceremony"]
            .map(name => [name, game.cardsPlayedBySeat[sourceSeat][name] || 0])),
        sourceUseStadiumActions: game.actionsBySeat[sourceSeat].UseStadiumAction || 0,
        selectedActions,
        sourceAttacks: game.attackTrace.filter(a => a.seat === sourceSeat)
          .map(a => ({turn: a.turn, attacker: a.activePokemon, attack: a.attack})),
        sourceAbilityUses: game.abilityTrace.filter(a => a.seat === sourceSeat)
          .map(a => ({turn: a.turn, ability: a.name})),
        promptValidationMode: game.promptValidationMode,
        randomnessProtocol: game.randomnessProtocol,
        gamePolicy: game.policy,
        note: 'Policy execution diagnostic, no matchup-strength inference'
      };
    } catch (error) {
      return {
        status: 'engine-exception',
        slots, sourceSeat, seed, printedPromoCards,
        error: String(error.message || error)
      };
    }
  });
  return {
    scope: 'Published Aichi rank-6 native Japanese promo card-use feasibility',
    source: 'results/aichi-2026/full-decklists.json',
    engineRevision: ENGINE,
    policyStatus: 'unqualified-generic-bot',
    sourceRank: SOURCE_RANK, opponentRank: BASELINE_RANK,
    resolvedListCount: field.decks.length,
    cases,
    competitiveWinRateClaim: false
  };
}

if (require.main === module) {
  const report = probe();
  console.log(JSON.stringify(report, null, 2));
  if (report.cases.every(c => c.status === 'engine-exception')) process.exitCode = 1;
}
module.exports = {probe};
