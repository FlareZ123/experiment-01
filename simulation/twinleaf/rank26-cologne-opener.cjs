'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * A deliberately narrow paper-visible policy opportunity. It selects a held
 * Canceling Cologne only while the opponent's Active Pokemon presently
 * suppresses Meloetta ex's Live Debut first-turn attack exception.
 * Neither hidden Prize cards nor deck contents are consulted.
 *
 * @param {object} state
 * @param {object} player
 * @param {number} sourceSeat
 * @param {number} playerTurnPhase
 * @returns {boolean}
 */
function cologneOpeningOpportunity(state, player, sourceSeat, playerTurnPhase) {
  if (state.turn !== 1 || state.activePlayer !== sourceSeat ||
      state.phase !== playerTurnPhase ||
      player.active.getPokemonCard()?.name !== 'Meloetta ex' ||
      !player.hand.cards.some(card => card.name === 'Canceling Cologne')) {
    return false;
  }
  const opposing = state.players[1 - sourceSeat];
  const defendingName = opposing?.active.getPokemonCard()?.name;
  return defendingName === 'Iron Thorns ex' || defendingName === 'Klefki';
}

/**
 * Temporarily attach a legally constrained automatic Item choice to one
 * source-ranked opponent seat. The hook restores the pinned decoder after
 * the bounded synchronous experiment. Every other state uses the original
 * policy unchanged.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T, policyAudit:object}}
 */
function withRank26CologneOpener(sourceSeat, execute) {
  if (![0, 1].includes(sourceSeat) || typeof execute !== 'function') {
    throw new TypeError('Require known rank-26 source seat and experiment.');
  }
  const {SimpleTacticsAi} = require(path.join(OUTPUT, 'simple-bot/simple-tactics-ai'));
  const {PlayCardAction, PlayerType, SlotType} =
    require(path.join(OUTPUT, 'game/store/actions/play-card-action'));
  const {GamePhase} = require(path.join(OUTPUT, 'game/store/state/state'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = sourceSeat === 0 ? 101 : 202;
  const events = [];
  const board = {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0};
  SimpleTacticsAi.prototype.decodeNextAction = function rank26Cologne(state) {
    const own = state.players[sourceSeat];
    if (this.client?.id !== sourceId ||
        state.prompts.some(prompt => prompt.result === undefined) ||
        !cologneOpeningOpportunity(state, own, sourceSeat, GamePhase.PLAYER_TURN)) {
      return original.call(this, state);
    }
    const handIndex = own.hand.cards.findIndex(card => card.name === 'Canceling Cologne');
    const action = new PlayCardAction(sourceId, handIndex, board);
    events.push({
      turn: state.turn,
      actingSeat: sourceSeat,
      action: 'PlayCardAction',
      card: own.hand.cards[handIndex].fullName,
      target: state.players[1 - sourceSeat].active.getPokemonCard()?.name,
      source: 'acting hand plus public active board'
    });
    return action;
  };
  try {
    const result = execute();
    return {
      result,
      policyAudit: {
        version: 'rank26-cologne-opener-v1',
        sourceSeat,
        opportunitiesSelected: events.length,
        actions: events,
        qualifiedForCompetitiveInference: false
      }
    };
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

module.exports = {cologneOpeningOpportunity, withRank26CologneOpener};
