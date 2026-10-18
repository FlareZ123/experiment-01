'use strict';

/**
 * Witness the Tool-bearing Garbodor at the FIRST ordinary decision boundary
 * of its opponent. Unlike a later source-owned prompt, this cannot silently
 * certify delayed setup or lock persistence.
 * @param {object} state
 * @param {0|1} sourceSeat
 * @param {number} sourceId
 * @param {number|null} openingTurn
 * @param {number|null} completedStage
 * @param {string|null} toolName
 * @param {number} normalTurnPhase
 * @returns {{turn:number,opponentDecisionSeat:number,equippedGarbodor:boolean}|null}
 */
function nextOpponentLockWitness(state, sourceSeat, sourceId, openingTurn,
  completedStage, toolName, normalTurnPhase) {
  if (completedStage !== 6 || openingTurn === null ||
      state.turn <= openingTurn || state.activePlayer === sourceSeat ||
      state.phase !== normalTurnPhase) return null;
  const source = state.players.find(side => side.id === sourceId);
  if (!source) return null;
  return {
    turn: state.turn,
    opponentDecisionSeat: state.activePlayer,
    equippedGarbodor: source.bench.some(slot =>
      slot.getPokemonCard()?.name === 'Garbodor' &&
      slot.tools.some(tool => tool.name === toolName))
  };
}

module.exports = {nextOpponentLockWitness};
