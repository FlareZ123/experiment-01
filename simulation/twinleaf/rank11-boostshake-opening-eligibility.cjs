'use strict';

/**
 * K0 first-turn observation gate for an Oranguru V Boost Shake plan.
 * Reads the acting player's visible board and own hand. The deck is deliberately
 * absent: the planner learns deck search outcomes only at real prompt boundaries.
 *
 * @param {object} state Real source game state.
 * @param {object} player Acting player's public board and own hand.
 * @returns {boolean}
 */
function isRank11BoostShakeCandidate(state, player) {
  if (!state || !player || player.id !== 101 ||
      state.turn !== 1 || state.activePlayer !== 0 ||
      player.usedVSTAR === true ||
      player.active?.getPokemonCard()?.name !== 'Oranguru V' ||
      player.active.tools.length !== 0 ||
      player.bench.filter(slot => slot.getPokemonCard()).length >= 5) {
    return false;
  }
  const hand = player.hand?.cards;
  return Array.isArray(hand) &&
    hand.some(card => card.name === 'Battle VIP Pass') &&
    hand.some(card => card.name === 'Float Stone');
}

module.exports = {isRank11BoostShakeCandidate};
