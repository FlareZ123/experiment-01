'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards, runMatch } = require('./headless.cjs');
const { resolveManifestFile } = require('./resolve-field.cjs');
const engine = p => require(path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output', p));

/**
 * Run authentic source-deck decisions and record possible attachment states.
 * Candidate boards do not establish that an Energy action is legal under locks.
 * @returns {object}
 */
function diagnose() {
  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    { allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true }
  );
  const decks = new Map(field.decks.map(d => [d.rank, d]));
  assert.ok(decks.get(10).playableUnderEngine && decks.get(1).playableUnderEngine);
  initializeCards();
  const { SimpleTacticsAi } = engine('simple-bot/simple-tactics-ai');
  const { CardType } = engine('game/store/card/card-types');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const trials = [];
  for (const seed of [20261016, 20261017, 20261103, 20261229]) {
    for (const enabled of [false, true]) {
      const samples = [];
      const seen = new Set();
      SimpleTacticsAi.prototype.decodeNextAction = function(state) {
        const action = original.call(this, state);
        const player = state.players[state.activePlayer];
        if (this.client.id === 101 && player?.id === 101 &&
            state.prompts.every(p => p.result !== undefined)) {
          const copies = player.hand.cards.filter(c => c.name === 'Double Dragon Energy').length;
          const targets = [player.active, ...player.bench]
            .map(slot => slot.getPokemonCard())
            .filter(c => c && c.cardType.includes(CardType.DRAGON))
            .map(c => c.fullName);
          if (copies && targets.length && player.energyPlayedTurn < state.turn) {
            const key = JSON.stringify([state.turn, copies, targets]);
            if (!seen.has(key)) {
              seen.add(key);
              samples.push({
                turn: state.turn, copies, targets,
                chosen: action?.constructor.name || null,
                chosenDde: action?.constructor.name === 'PlayCardAction' &&
                  player.hand.cards[action.handIndex]?.name === 'Double Dragon Energy'
              });
            }
          }
        }
        return action;
      };
      try {
        const game = runMatch({
          deckA: decks.get(10).cardIds, deckB: decks.get(1).cardIds, seed,
          maxActions: 300, isolatePolicyRandomness: true,
          ...(enabled ? { doubleDragonRecovery: true } : {})
        });
        trials.push({seed, enabled, finished: game.finished, turns: game.turns,
          played: game.cardsPlayedBySeat[0]['Double Dragon Energy'] || 0,
          samples});
      } finally {
        SimpleTacticsAi.prototype.decodeNextAction = original;
      }
    }
  }
  return {study:'Rank10 Double Dragon bot opportunities with seeded policies',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    caveat:'Observational action opportunities, not match strength',trials};
}

if (require.main === module) console.log(JSON.stringify(diagnose(), null, 2));
module.exports = { diagnose };
