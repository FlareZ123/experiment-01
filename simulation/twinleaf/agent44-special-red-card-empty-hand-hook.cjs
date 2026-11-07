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
 * @param {(()=>number)|undefined} shuffleRandom Optional explicit game-physical
 *   uniform random stream, used solely for real opposing-hand permutation.
 *   Omit to keep the existing zero-hand-only correction without random draws.
 * @returns {() => void} Idempotent restoration of pinned methods.
 */
function installSpecialRedCardPaperHook(shuffleRandom) {
  if (shuffleRandom !== undefined && typeof shuffleRandom !== 'function')
    throw new TypeError('shuffleRandom must be an explicit game-physical random callback');
  if (installed) {
    if (installed.shuffleRandom !== shuffleRandom)
      throw new Error('Special Red Card hook is installed with another random stream');
    return installed.restore;
  }
  const {SpecialRedCard} = require(path.join(output,
    'sets/11-mega-evolution/set-chaos-rising/special-red-card'));
  const {TrainerEffect} = require(path.join(output,
    'game/store/effects/play-card-effects'));
  const {StateUtils} = require(path.join(output,'game/store/state-utils'));
  const {GameError} = require(path.join(output,'game/game-error'));
  const {GameMessage} = require(path.join(output,'game/game-message'));
  const {deckPermutation} = require('./headless.cjs');

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
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const opponent = StateUtils.getOpponent(state,effect.player);
      if (opponent.hand.cards.length === 0)
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      const prizes = opponent.prizes.filter(p=>p.cards.length>0).length;
      if (shuffleRandom !== undefined && prizes<=3 &&
          opponent.hand.cards.length>1) {
        const order=deckPermutation(opponent.hand.cards.length,shuffleRandom);
        opponent.hand.applyOrder(order);
      }
    }
    return originalReduceEffect.call(this,store,state,effect);
  }

  SpecialRedCard.prototype.canPlay = paperCanPlay;
  SpecialRedCard.prototype.reduceEffect = paperReduceEffect;
  function restoreSpecialRedCardPaperHook() {
    if (!installed) return;
    if (SpecialRedCard.prototype.canPlay !== paperCanPlay ||
        SpecialRedCard.prototype.reduceEffect !== paperReduceEffect)
      throw new Error('Special Red Card hook was replaced by another hook');
    SpecialRedCard.prototype.canPlay=originalCanPlay;
    SpecialRedCard.prototype.reduceEffect=originalReduceEffect;
    installed=null;
  }
  installed={shuffleRandom,restore:restoreSpecialRedCardPaperHook};
  return restoreSpecialRedCardPaperHook;
}

/** @returns {()=>void} Previous zero-hand-only installation contract. */
function installSpecialRedCardEmptyHandHook() {
  return installSpecialRedCardPaperHook();
}

module.exports = {installSpecialRedCardEmptyHandHook,
  installSpecialRedCardPaperHook};
