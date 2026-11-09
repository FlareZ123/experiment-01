'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const REGIDRAGO = new Set(['Regidrago V SIT', 'Regidrago VSTAR SIT']);
let installed = null;

/**
 * Only information visible to the acting player is inspected.
 * The published rank-1 list has one Mimikyu, and the native default
 * PlayBasicTactic otherwise chooses the first Basic in hand. This
 * narrow setup policy gives an available Mimikyu first Bench access
 * against a face-up Regidrago V/VSTAR, without presuming that Apex
 * Dragon will ever be declared.
 *
 * @param {object} state Pinned native State.
 * @param {object} player Native acting Player.
 * @returns {number} Owner-hand index, or -1 when inactive.
 */
function mimikyuPriorityHandIndex(state, player) {
  const opponent = state.players.find(p => p.id !== player.id);
  if (!opponent) return -1;
  const visible = [opponent.active, ...opponent.bench].some(slot =>
    REGIDRAGO.has(slot.getPokemonCard()?.fullName));
  if (!visible || !player.bench.some(slot => slot.cards.length === 0)) {
    return -1;
  }
  if ([player.active, ...player.bench].some(slot =>
      slot.getPokemonCard()?.fullName === 'Mimikyu GRI')) return -1;
  return player.hand.cards.findIndex(card => card.fullName === 'Mimikyu GRI');
}

/**
 * Scoped, reversible pinned-PlayBasicTactic substitution. Default bot and
 * deck remain unchanged outside this explicit experiment. The owner seat
 * check prevents opponent contamination in a two-player native match.
 *
 * @param {{seat:0|1}} options Native player's physical seat.
 * @returns {() => void} Exact restoration callback.
 */
function installMimikyuPriorityBasic({seat}) {
  if (![0, 1].includes(seat)) throw new RangeError('Expected physical seat 0 or 1');
  if (installed) {
    if (installed.seat !== seat) {
      throw new Error('Conflicting Mimikyu priority owner seat');
    }
    return installed.restore;
  }
  const {PlayBasicTactic} = require(path.join(output,
    'simple-bot/simple-tactics/play-basic-tactic'));
  const {PlayCardAction} = require(path.join(output,
    'game/store/actions/play-card-action'));
  const original = PlayBasicTactic.prototype.useTactic;
  function ownerPriorityBasic(state, player) {
    if (state.players.indexOf(player) === seat) {
      const i = mimikyuPriorityHandIndex(state, player);
      if (i >= 0) {
        const empty = player.bench.find(slot => slot.cards.length === 0);
        return new PlayCardAction(player.id, i, this.getCardTarget(player, state, empty));
      }
    }
    return original.call(this, state, player);
  }
  PlayBasicTactic.prototype.useTactic = ownerPriorityBasic;
  function restore() {
    if (PlayBasicTactic.prototype.useTactic === ownerPriorityBasic) {
      PlayBasicTactic.prototype.useTactic = original;
    }
    if (installed?.restore === restore) installed = null;
  }
  installed = {seat, restore};
  return restore;
}

module.exports = {mimikyuPriorityHandIndex, installMimikyuPriorityBasic};
