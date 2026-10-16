'use strict';

/**
 * Capture only public aggregate fields around a state transition. In
 * particular, do not persist cards in hidden hands, decks or Prizes.
 *
 * @param {object} state A live pinned Twinleaf Store state.
 * @returns {object} Detached JSON-serializable public counts.
 */
function publicSnapshot(state) {
  return {
    phase: state.phase,
    turn: state.turn,
    activePlayer: state.activePlayer,
    winner: state.winner ?? null,
    players: state.players.map(player => ({
      deckRemaining: player.deck.cards.length,
      handSize: player.hand.cards.length,
      prizesRemaining: player.prizes.filter(prize => prize.cards.length > 0).length,
      inPlayPokemon: (player.active.getPokemonCard() ? 1 : 0) +
        player.bench.filter(bench => bench.getPokemonCard()).length
    }))
  };
}

/**
 * Record the action immediately responsible for transitioning the engine into
 * FINISHED. A terminal transition alone does not prove which formal rule
 * caused a loss when multiple conditions become true together.
 *
 * @param {object} before Detached snapshot taken immediately before dispatch.
 * @param {object} after Detached snapshot taken immediately after dispatch.
 * @param {{name:string, playerSlot:number, pendingPrompt:string|null}} action
 * @param {number|string} finishedPhase Pinned Twinleaf GamePhase.FINISHED value.
 * @returns {object|null}
 */
function observeTerminalTransition(before, after, action, finishedPhase) {
  if (before.phase === finishedPhase || after.phase !== finishedPhase) return null;
  return {
    evidenceType: 'observed-engine-terminal-transition-v1',
    actionName: action.name,
    playerSlot: action.playerSlot,
    pendingPrompt: action.pendingPrompt,
    before,
    after
  };
}

module.exports = {publicSnapshot, observeTerminalTransition};
