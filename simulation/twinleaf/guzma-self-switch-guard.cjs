'use strict';
const path = require('node:path');

/**
 * Narrow rank-6 replay predicate: retain a powered Shadow Rider V rather than
 * playing Guzma and forcibly promoting the sole unpowered Dialga-GX on Bench.
 * This is an experimental policy constraint, not a universal card evaluation.
 * @param {object} state
 * @param {object} player
 * @param {object|undefined} action
 * @returns {boolean}
 */
function wouldSelfStrandShadowRider(state, player, action) {
  if (action?.type !== 'PLAY_CARD_ACTION' ||
      player.hand.cards[action.handIndex]?.name !== 'Guzma' ||
      player.active.getPokemonCard()?.name !== 'Shadow Rider Calyrex V' ||
      !player.active.energies.cards.some(card => card.name === 'Psychic Energy')) return false;
  const bench = player.bench.filter(slot => slot.getPokemonCard());
  if (bench.length !== 1 || bench[0].getPokemonCard()?.name !== 'Dialga-GX' ||
      bench[0].energies.cards.length !== 0) return false;
  const opponent = state.players.find(entry => entry.id !== player.id);
  return opponent?.active.getPokemonCard()?.name === 'Iron Thorns ex';
}

/** @returns {() => void} Revert the pinned bot tactic modification. */
function installGuzmaSelfSwitchGuard() {
  const compiled = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics/play-supporter-tactic');
  const { PlaySupporterTactic } = require(compiled);
  const original = PlaySupporterTactic.prototype.useTactic;
  PlaySupporterTactic.prototype.useTactic = function guardedGuzma(state, player) {
    const before = player.supporterTurn;
    const proposal = original.call(this, state, player);
    if (!wouldSelfStrandShadowRider(state, player, proposal)) return proposal;
    player.supporterTurn = before;
    return;
  };
  return () => { PlaySupporterTactic.prototype.useTactic = original; };
}
module.exports = { wouldSelfStrandShadowRider, installGuzmaSelfSwitchGuard };
