'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Correct Eldegoss V RCL's pre-Bench Happy Match suppression under in-play-only
 * Ability locks. Temporarily put the physical Basic in its actual Bench target
 * for the existing lock evaluation, then restore the unchanged source zones.
 * The upstream card reducer runs normally if the Ability is not blocked.
 * @returns {() => void}
 */
function installEldegossEntryLockHook() {
  if (installed) return () => {};
  const { EldegossV } = require(path.join(output,
    'sets/09-sword-and-shield/set-rebel-clash/eldegoss-v'));
  const { PlayPokemonEffect } = require(path.join(output,
    'game/store/effects/play-card-effects'));
  const { IS_ABILITY_BLOCKED } = require(path.join(output,
    'game/store/prefabs/prefabs'));
  const original = EldegossV.prototype.reduceEffect;

  function guardedReduceEffect(store, state, effect) {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const hand = effect.player.hand.cards;
      const handIndex = hand.indexOf(this);
      const target = effect.target;
      if (handIndex >= 0 && target.cards.length === 0 &&
          effect.player.bench.includes(target)) {
        hand.splice(handIndex, 1);
        target.cards.push(this);
        let blocked;
        try {
          blocked = IS_ABILITY_BLOCKED(store, state, effect.player,
            this, this.powers[0]);
        } finally {
          target.cards.splice(target.cards.indexOf(this), 1);
          hand.splice(handIndex, 0, this);
        }
        if (blocked) return state;
      }
    }
    return original.call(this, store, state, effect);
  }

  EldegossV.prototype.reduceEffect = guardedReduceEffect;
  installed = { original, guardedReduceEffect };
  return function restoreEldegossEntryLockHook() {
    if (!installed || installed.guardedReduceEffect !== guardedReduceEffect) {
      return;
    }
    if (EldegossV.prototype.reduceEffect === guardedReduceEffect) {
      EldegossV.prototype.reduceEffect = original;
    }
    installed = null;
  };
}

module.exports = { installEldegossEntryLockHook };
