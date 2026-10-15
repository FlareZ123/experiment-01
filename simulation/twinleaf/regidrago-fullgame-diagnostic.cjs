'use strict';
const path = require('node:path');
const { resolveManifestFile } = require('./resolve-field.cjs');
const { runMatch, initializeCards } = require('./headless.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root, name));

/**
 * Capture actual bot decisions, not internal speculative Simulator decisions.
 * Only wraps SimpleTacticsAi.decodeNextAction while runMatch executes.
 *
 * @typedef {{ turn: number, first: any, last: any, actions: string[], everActiveVstar: boolean, maxActiveEnergyCards: number, maxDiscardDragons: number }} TurnRecord
 */

/** @param {any} state @param {any} player @param {any} CardType */
function summarizeBoard(state, player, CardType) {
  const activeCard = player.active.getPokemonCard();
  const attached = player.active.cards.filter(card =>
    card.superType === 'ENERGY' || card.name.endsWith('Energy'));
  const allAttached = attached.map(card => card.fullName);
  const discardDragons = player.discard.cards.filter(card =>
    Array.isArray(card.cardType) && card.cardType.includes(CardType.DRAGON));
  return {
    turn: state.turn,
    active: activeCard?.fullName || null,
    activeEnergy: allAttached,
    bench: player.bench.map(slot => slot.getPokemonCard()?.fullName).filter(Boolean),
    handVstar: player.hand.cards.filter(card => card.name === 'Regidrago VSTAR').length,
    discardDragons: discardDragons.map(card => card.fullName),
    prizesRemaining: player.prizes.filter(slot => slot.cards.length > 0).length
  };
}

/**
 * Drive actual source lists with the same weak generic bot; track precisely
 * when Regidrago is Active and what its real action policy chooses.
 * No matchup-strength inference may be drawn from these completions.
 */
function probeRegidragoDecisions() {
  const filePath = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const field = resolveManifestFile(filePath, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const byRank = new Map(field.decks.map(deck => [deck.rank, deck]));
  const regidrago = byRank.get(10);
  const shadowRider = byRank.get(1);
  if (!regidrago?.playableUnderEngine || !shadowRider?.playableUnderEngine) {
    throw new Error('Aichi rank 10 or rank 1 deck not reproducibly mapped');
  }
  initializeCards();
  const { SimpleTacticsAi } = load('simple-bot/simple-tactics-ai');
  const { CardType } = load('game/store/card/card-types');
  const { GamePhase } = load('game/store/state/state');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const pairs = [
    { rankA: 10, rankB: 1, seed: 20261016, observedPlayerId: 101 },
    { rankA: 1, rankB: 10, seed: 20261016, observedPlayerId: 202 },
    { rankA: 10, rankB: 1, seed: 20261103, observedPlayerId: 101 },
    { rankA: 1, rankB: 10, seed: 20261103, observedPlayerId: 202 }
  ];
  const outcomes = [];

  for (const pair of pairs) {
    /** @type {Map<number, TurnRecord>} */
    const turns = new Map();
    SimpleTacticsAi.prototype.decodeNextAction = function tracedAction(state) {
      const action = original.call(this, state);
      if (this.client.id !== pair.observedPlayerId ||
          state.phase !== GamePhase.PLAYER_TURN ||
          state.players[state.activePlayer]?.id !== this.client.id ||
          state.prompts.some(prompt => prompt.result === undefined)) {
        return action;
      }
      const player = state.players.find(candidate => candidate.id === this.client.id);
      const board = summarizeBoard(state, player, CardType);
      const actionLabel = action?.constructor.name === 'AttackAction'
        ? 'Attack:' + action.name
        : action?.constructor.name === 'PlayCardAction'
          ? 'Play:' + (player.hand.cards[action.handIndex]?.fullName || '?')
          : action?.constructor.name || 'None';
      let turn = turns.get(state.turn);
      if (!turn) {
        turn = { turn: state.turn, first: board, last: board, actions: [],
          everActiveVstar: false, maxActiveEnergyCards: 0, maxDiscardDragons: 0 };
        turns.set(state.turn, turn);
      }
      turn.last = board;
      turn.actions.push(actionLabel);
      turn.everActiveVstar ||= board.active === 'Regidrago VSTAR SIT';
      turn.maxActiveEnergyCards = Math.max(turn.maxActiveEnergyCards, board.activeEnergy.length);
      turn.maxDiscardDragons = Math.max(turn.maxDiscardDragons, board.discardDragons.length);
      return action;
    };
    try {
      const game = runMatch({
        deckA: byRank.get(pair.rankA).cardIds,
        deckB: byRank.get(pair.rankB).cardIds,
        seed: pair.seed,
        maxActions: 1200,
        label: 'policy readiness ' + pair.rankA + '-' + pair.rankB
      });
      const sourceSeat = pair.rankA === 10 ? 0 : 1;
      outcomes.push({
        pair: [pair.rankA, pair.rankB], seed: pair.seed,
        sourceSeat, finished: game.finished, turns: game.turns, actionCount: game.actions,
        activeApexCount: game.attackTrace.filter(row => row.seat === sourceSeat &&
          row.attack === 'Apex Dragon').length,
        recordedAttacks: game.attackTrace.filter(row => row.seat === sourceSeat).map(row =>
          ({ turn: row.turn, pokemon: row.activePokemon, attack: row.attack })),
        decisionTurns: [...turns.values()]
      });
    } finally {
      SimpleTacticsAi.prototype.decodeNextAction = original;
    }
  }
  return {
    study: 'Regidrago rank-10 source-list actual generic-bot decision readiness',
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    decks: [1, 10],
    methodology: 'SimpleTacticsAi exact source decks and trace before each actual turn action',
    caveat: 'Low-skill generic policy, four seeds/seats only; not match-win evidence',
    outcomes
  };
}

if (require.main === module) console.log(JSON.stringify(probeRegidragoDecisions(), null, 2));
module.exports = { probeRegidragoDecisions };
