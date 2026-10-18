'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name */
const pinned = name => require(path.join(output, name));
const FIELD = '__researchCancelingCologneLastPlayedTurn';
let activeInstallation = null;

/**
 * Reversibly enforce the official Japanese ruling that one player cannot play
 * a second Canceling Cologne during the same turn. Track the resolved play
 * on the cloned Player itself, so speculative State copies retain the fact.
 * This deliberately leaves the vendor tree unmodified.
 *
 * @returns {()=>void} Idempotent uninstall callback.
 */
function installCancelingCologneOncePerTurnHook() {
  if (activeInstallation) return activeInstallation.restore;
  const {initializeCards} = require('./headless.cjs');
  const exemplar = initializeCards().getCardByName('Canceling Cologne ASR');
  if (!exemplar) throw new Error('Pinned Canceling Cologne ASR is missing');
  const prototype = Object.getPrototypeOf(exemplar);
  if (prototype.constructor.name !== 'CancelingCologne') {
    throw new Error('Pinned Canceling Cologne class changed');
  }
  const {WAS_TRAINER_USED} = pinned('game/store/prefabs/trainer-prefabs');
  const {Store} = pinned('game/store/store');
  const {PlayItemEffect} = pinned('game/store/effects/play-card-effects');
  const {GameError} = pinned('game/game-error');
  const {GameMessage} = pinned('game/game-message');
  const priorStoreReduceEffect = Store.prototype.reduceEffect;
  const priorCanPlay = prototype.canPlay;
  const priorReduceEffect = prototype.reduceEffect;
  if (typeof priorCanPlay !== 'function' || typeof priorReduceEffect !== 'function') {
    throw new Error('Pinned Cologne hooks unavailable');
  }
  // The pinned PlayCard reducer dispatches Items without consulting canPlay.
  // Veto the PlayItemEffect before it moves the second physical card to the
  // Supporter/Item play zone; a late TrainerEffect veto would strand that card.
  Store.prototype.reduceEffect = function paperCologneStoreReduceEffect(state, effect) {
    if (effect instanceof PlayItemEffect &&
        effect.trainerCard?.name === 'Canceling Cologne' &&
        effect.player?.[FIELD] === state.turn) {
      throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
    }
    return priorStoreReduceEffect.call(this, state, effect);
  };
  prototype.canPlay = function paperCologneCanPlay(store, state, player) {
    return player[FIELD] !== state.turn &&
      priorCanPlay.call(this, store, state, player);
  };
  prototype.reduceEffect = function paperCologneReduceEffect(store, state, effect) {
    const played = WAS_TRAINER_USED(effect, this);
    const result = priorReduceEffect.call(this, store, state, effect);
    if (played) effect.player[FIELD] = state.turn;
    return result;
  };
  /** @returns {void} */
  const restore = () => {
    if (!activeInstallation) return;
    Store.prototype.reduceEffect = priorStoreReduceEffect;
    prototype.canPlay = priorCanPlay;
    prototype.reduceEffect = priorReduceEffect;
    activeInstallation = null;
  };
  activeInstallation = {restore};
  return restore;
}

module.exports = {installCancelingCologneOncePerTurnHook};
