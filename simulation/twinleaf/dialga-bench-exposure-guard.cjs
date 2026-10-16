'use strict';
const path = require('node:path');

/**
 * Narrow counterfactual: avoid a sole Benched copy-attack Dialga-GX against
 * Iron Thorns ex, which can force it Active with Guzma.
 * @param {object} state
 * @param {object} player
 * @param {object|undefined} action
 * @returns {boolean}
 */
function wouldExposeDialgaToGust(state, player, action) {
  if (action?.type !== 'PLAY_CARD_ACTION' ||
      player.hand.cards[action.handIndex]?.name !== 'Dialga-GX' ||
      player.active.getPokemonCard()?.name !== 'Shadow Rider Calyrex V' ||
      player.bench.some(slot => slot.getPokemonCard())) return false;
  const opponent = state.players.find(entry => entry.id !== player.id);
  return opponent?.active.getPokemonCard()?.name === 'Iron Thorns ex';
}

/** @returns {() => void} Restore the pinned Basic placement tactic. */
function installDialgaBenchExposureGuard() {
  const compiled = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics/play-basic-tactic');
  const { PlayBasicTactic } = require(compiled);
  const original = PlayBasicTactic.prototype.useTactic;
  PlayBasicTactic.prototype.useTactic = function guardedBasic(state, player) {
    const proposed = original.call(this, state, player);
    return wouldExposeDialgaToGust(state, player, proposed) ? undefined : proposed;
  };
  return () => { PlayBasicTactic.prototype.useTactic = original; };
}
module.exports = { wouldExposeDialgaToGust, installDialgaBenchExposureGuard };
