'use strict';

const {freeBenchIndex, untooledTrubbish} =
  require('./rank11-direct-opportunity.cjs');

const DISTINCT_TOOLS = Object.freeze(['Muscle Band', 'Float Stone']);
const SOURCE_V = new Set(['Oranguru V', 'Crobat V']);

/**
 * Source-ranked held-Seal first-own-turn line. One Forest Seal Stone is
 * reserved for a Tool-free Pokemon V while a separate physical Tool must
 * remain attachable to Trubbish. Only own hand and face-up board are read.
 * Search targets are later selected using actual owner-search prompts.
 *
 * @param {object} state Real Store state.
 * @param {object} player Acting source player.
 * @param {0|1} seat Source physical seat.
 * @param {number} turnPhase Pinned GamePhase.PLAYER_TURN.
 * @param {boolean} [avoidBothGarbodorHeld] Optional source-60 K0 guard.
 * @returns {{route:'bench'|'hand'|'vip',tool:string,vTarget:{slot:'active'|'bench',index:number}}|null}
 */
function heldSealOpportunity(state, player, seat, turnPhase,
  avoidBothGarbodorHeld = false) {
  if ((state.turn !== 1 && state.turn !== 2) ||
      state.activePlayer !== seat || state.phase !== turnPhase ||
      player.usedVSTAR) return null;
  const hand = player.hand.cards.map(card => card.name);
  if (hand.includes('Boost Shake') || !hand.includes('Forest Seal Stone') ||
      (avoidBothGarbodorHeld && hand.filter(name => name === 'Garbodor').length === 2)) {
    return null;
  }
  const tool = DISTINCT_TOOLS.find(name => hand.includes(name)) ??
    (hand.filter(name => name === 'Forest Seal Stone').length >= 2 ?
      'Forest Seal Stone' : null);
  if (!tool) return null;
  let vTarget = null;
  if (SOURCE_V.has(player.active.getPokemonCard()?.name) &&
      player.active.tools.length === 0) {
    vTarget = {slot:'active',index:0};
  } else {
    const index = player.bench.findIndex(slot =>
      SOURCE_V.has(slot.getPokemonCard()?.name) && slot.tools.length === 0);
    if (index >= 0) vTarget = {slot:'bench',index};
  }
  if (!vTarget) return null;
  let route = 'bench';
  if (untooledTrubbish(player) < 0) {
    if (freeBenchIndex(player) < 0) return null;
    if (hand.includes('Trubbish')) route = 'hand';
    else if (hand.includes('Battle VIP Pass')) route = 'vip';
    else return null;
  }
  return {route,tool,vTarget};
}

module.exports = {heldSealOpportunity, DISTINCT_TOOLS, SOURCE_V};
