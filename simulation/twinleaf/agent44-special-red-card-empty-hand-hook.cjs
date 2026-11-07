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
 * @param {(()=>number)|undefined} shuffleRandom Optional explicit uniform
 *   random stream. The caller must supply the policy/decision stream for a
 *   speculative clone or the affected hand owner's physical stream for a real
 *   Store dispatch; never reuse one stream for both contexts. Omit to keep the
 *   existing zero-hand-only correction without random draws.
 * @returns {() => void} Idempotent restoration of pinned methods.
 */
function installSpecialRedCardPaperHook(shuffleRandom) {
  if (shuffleRandom !== undefined && typeof shuffleRandom !== 'function')
    throw new TypeError('shuffleRandom must be an explicit random callback');
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

/**
 * Dispatch exactly one genuine physical Store action with the full source
 * printing paper correction. The hook is active only during a *real* native
 * action, so speculative bot Store clones cannot consume physical RNG.
 * Unrelated cards are dispatched unchanged.
 *
 * @param {object} store Pinned physical game's Store instance.
 * @param {object} action Exact selected native Action.
 * @param {()=>number} physicalRandom Deterministic reproducible fair game RNG.
 * @returns {unknown} The pinned Store.dispatch return value, passed through unchanged.
 */
function dispatchSpecialRedCardPaperRoot(store,action,physicalRandom) {
  const {PlayCardAction} = require(path.join(output,
    'game/store/actions/play-card-action'));
  if (!(action instanceof PlayCardAction)) return store.dispatch(action);
  const actor=store.state.players.find(p=>p.id===action.id);
  const card=actor?.hand.cards[action.handIndex];
  if (card?.fullName !== 'Special Red Card M4') return store.dispatch(action);
  if (typeof physicalRandom !== 'function')
    throw new TypeError('Physical M4 Store dispatch requires an explicit game RNG');
  const restore=installSpecialRedCardPaperHook(physicalRandom);
  try {
    return store.dispatch(action);
  } finally {
    restore();
  }
}

module.exports = {installSpecialRedCardEmptyHandHook,
  installSpecialRedCardPaperHook,dispatchSpecialRedCardPaperRoot};
