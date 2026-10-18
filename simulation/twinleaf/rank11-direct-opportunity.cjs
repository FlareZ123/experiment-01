'use strict';

const TOOLS = Object.freeze(['Muscle Band', 'Float Stone', 'Forest Seal Stone']);

/** @param {object} player @returns {number} */
function untooledTrubbish(player) {
  return player.bench.findIndex(slot => slot.getPokemonCard()?.name === 'Trubbish' && slot.tools.length === 0);
}

/** @param {object} player @returns {number} */
function freeBenchIndex(player) {
  const hole = player.bench.findIndex(slot => !slot.getPokemonCard());
  return hole >= 0 ? hole : player.bench.length < 5 ? player.bench.length : -1;
}

/**
 * Sufficient first-own-turn hand and public-board predicate. No own deck,
 * face-down Prize or opponent-hand inspection. Tool priority is a declared
 * policy preference, not a demonstrated strategically optimal choice.
 * @param {object} state
 * @param {object} player
 * @param {0|1} seat
 * @param {number} playerTurnPhase
 * @returns {{route:'bench'|'hand'|'vip',tool:string}|null}
 */
function directBoostShakeOpportunity(state, player, seat, playerTurnPhase) {
  if (![1,2].includes(state.turn) || state.activePlayer !== seat ||
      state.phase !== playerTurnPhase) return null;
  const hand = player.hand.cards.map(card => card.name);
  if (!hand.includes('Boost Shake')) return null;
  const tool = TOOLS.find(name => hand.includes(name));
  if (!tool) return null;
  if (untooledTrubbish(player) >= 0) return {route:'bench', tool};
  if (freeBenchIndex(player) < 0) return null;
  if (hand.includes('Trubbish')) return {route:'hand', tool};
  if (hand.includes('Battle VIP Pass')) return {route:'vip', tool};
  return null;
}

module.exports = {TOOLS, untooledTrubbish, freeBenchIndex, directBoostShakeOpportunity};
