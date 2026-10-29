'use strict';

const TOOLS = Object.freeze(['Muscle Band', 'Float Stone', 'Forest Seal Stone']);

/** @param {object} player @returns {number} */
function untooledTrubbish(player) {
  return player.bench.findIndex(slot => slot.getPokemonCard()?.name === 'Trubbish' && slot.tools.length === 0);
}

/** @param {object} player @returns {boolean} */
function untooledActiveTrubbish(player) {
  return player.active?.getPokemonCard()?.name === 'Trubbish' &&
    player.active.tools.length === 0;
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
 * @param {boolean} [avoidAllGarbodorHeld] Optional information-set K0 guard
 * @param {boolean} [allowLaterTurns] Later-turn ordinary Boost Shake is legal.
 * @returns {{route:'active-equipped'|'bench-equipped'|'active'|'bench'|'hand'|'vip',tool:string}|null}
 */
function directBoostShakeOpportunity(state, player, seat, playerTurnPhase,
  avoidAllGarbodorHeld = false, allowLaterTurns = false) {
  if ((!allowLaterTurns && ![1,2].includes(state.turn)) ||
      state.activePlayer !== seat ||
      state.phase !== playerTurnPhase ||
      player.cannotPlayItemCards) return null;
  const hand = player.hand.cards.map(card => card.name);
  if (!hand.includes('Boost Shake') ||
      (avoidAllGarbodorHeld &&
        hand.filter(name => name === 'Garbodor').length >= 2)) return null;
  // An already attached Tool makes another hand Tool unnecessary. This also
  // permits the actual owner's later-turn held-Shake follow-through.
  // Prefer an already-Tooled Bench Trubbish: same future Garbotoxin lock
  // without occupying the Active attacker slot. Active remains the fallback.
  for (const slot of player.bench) {
    if (slot.getPokemonCard()?.name !== 'Trubbish') continue;
    const equipped = slot.tools.find(card => TOOLS.includes(card.name));
    if (equipped) return {route:'bench-equipped',tool:equipped.name};
  }
  if (player.active?.getPokemonCard()?.name === 'Trubbish') {
    const equipped = player.active.tools.find(card => TOOLS.includes(card.name));
    if (equipped) return {route:'active-equipped',tool:equipped.name};
  }
  // A standalone Tool-play lock prevents the unpaid new-Tool routes, while
  // an already-attached Tool above may still enable a legal held Shake.
  if (player.cannotPlayToolCards) return null;
  const tool = TOOLS.find(name => hand.includes(name));
  if (!tool) return null;
  if (untooledTrubbish(player) >= 0) return {route:'bench', tool};
  if (untooledActiveTrubbish(player)) return {route:'active', tool};
  if (freeBenchIndex(player) < 0) return null;
  if (hand.includes('Trubbish')) return {route:'hand', tool};
  // Battle VIP Pass can only be played during the player's first turn.
  if (state.turn <= 2 && hand.includes('Battle VIP Pass')) {
    return {route:'vip', tool};
  }
  return null;
}

module.exports = {TOOLS, untooledTrubbish, freeBenchIndex, directBoostShakeOpportunity};
