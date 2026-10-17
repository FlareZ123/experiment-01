'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Apply in-play Ability locks to Articuno-GX CES Legendary Ascent at
 * the intended Bench destination, before upstream offers its optional switch.
 * The temporary staging is restored before the original card reducer runs.
 * @returns {() => void}
 */
function installArticunoEntryLockHook() {
  if (installed) return () => {};
  const { ArticunoGX } = require(path.join(output,
    'sets/08-sun-and-moon/set-celestial-storm/articuno-gx'));
  const { PlayPokemonEffect } = require(path.join(output,
    'game/store/effects/play-card-effects'));
  const { IS_ABILITY_BLOCKED } = require(path.join(output,
    'game/store/prefabs/prefabs'));
  const original = ArticunoGX.prototype.reduceEffect;

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

  ArticunoGX.prototype.reduceEffect = guardedReduceEffect;
  installed = { original, guardedReduceEffect };
  return function restoreArticunoEntryLockHook() {
    if (!installed || installed.guardedReduceEffect !== guardedReduceEffect) {
      return;
    }
    if (ArticunoGX.prototype.reduceEffect === guardedReduceEffect) {
      ArticunoGX.prototype.reduceEffect = original;
    }
    installed = null;
  };
}

module.exports = { installArticunoEntryLockHook };
