'use strict';

const path = require('node:path');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Add the official Japanese Special Red Card M4 zero-opponent-hand necessity
 * check to both native playability advertisements and actual Store effects.
 * No vendor files are modified. The default engine remains unchanged unless
 * this hook is explicitly installed by research code.
 *
 * Paper source: the Pokémon Japan named-card FAQ answers "no" when asked
 * whether Special Red Card can be played against an empty opposing hand.
 *
 * @returns {() => void} Safe, idempotent restoration of pinned methods.
 */
function installSpecialRedCardEmptyHandHook() {
  if (installed) return () => {};
  const {SpecialRedCard} = require(path.join(output,
    'sets/11-mega-evolution/set-chaos-rising/special-red-card'));
  const {TrainerEffect} = require(path.join(output,
    'game/store/effects/play-card-effects'));
  const {StateUtils} = require(path.join(output,'game/store/state-utils'));
  const {GameError} = require(path.join(output,'game/game-error'));
  const {GameMessage} = require(path.join(output,'game/game-message'));

  const originalCanPlay = SpecialRedCard.prototype.canPlay;
  const originalReduceEffect = SpecialRedCard.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} player */
  function paperCanPlay(store,state,player) {
    if (StateUtils.getOpponent(state,player).hand.cards.length === 0)
      return false;
    return originalCanPlay.call(this,store,state,player);
  }

  /** @param {object} store @param {object} state @param {object} effect */
  function paperReduceEffect(store,state,effect) {
    if (effect instanceof TrainerEffect && effect.trainerCard === this &&
        StateUtils.getOpponent(state,effect.player).hand.cards.length === 0)
      throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
    return originalReduceEffect.call(this,store,state,effect);
  }

  SpecialRedCard.prototype.canPlay = paperCanPlay;
  SpecialRedCard.prototype.reduceEffect = paperReduceEffect;
  installed = {SpecialRedCard,originalCanPlay,originalReduceEffect,
    paperCanPlay,paperReduceEffect};
  return function restoreSpecialRedCardEmptyHandHook() {
    if (!installed ||
        SpecialRedCard.prototype.canPlay !== installed.paperCanPlay ||
        SpecialRedCard.prototype.reduceEffect !== installed.paperReduceEffect)
      return;
    SpecialRedCard.prototype.canPlay = installed.originalCanPlay;
    SpecialRedCard.prototype.reduceEffect = installed.originalReduceEffect;
    installed = null;
  };
}

module.exports = {installSpecialRedCardEmptyHandHook};
