'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * The pinned Radiant Eternatus checks IS_ABILITY_BLOCKED on PlayPokemonEffect
 * while its source card is still in the hand. In-play-only locks (such as
 * Iron Thorns Initialization) are consequently invisible to that check.
 * Temporarily assess the exact entering Basic as a Benched Pokémon, then
 * restore the original card zones before the normal PlayPokemonEffect reducer
 * performs its actual hand-to-Bench move.
 *
 * This is a synchronous, reversible, research-side card hook. It does not
 * modify the pinned Twinleaf submodule or change hand-only lock checks.
 *
 * @returns {() => void} Restore the original prototype method.
 */
function installRadiantGateLockHook() {
  if (installed) return () => {};
  const { RadiantEternatus } = require(path.join(output,
    'sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus'));
  const { PlayPokemonEffect } = require(path.join(output,
    'game/store/effects/play-card-effects'));
  const { IS_ABILITY_BLOCKED } = require(path.join(output,
    'game/store/prefabs/prefabs'));
  const previous = RadiantEternatus.prototype.reduceEffect;

  function patchedReduceEffect(store, state, effect) {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const hand = effect.player.hand.cards;
      const originalIndex = hand.indexOf(this);
      const target = effect.target;

      if (originalIndex >= 0 && target.cards.length === 0 &&
          effect.player.bench.includes(target)) {
        hand.splice(originalIndex, 1);
        target.cards.push(this);
        let enteringBenchAbilityBlocked;
        try {
          enteringBenchAbilityBlocked = IS_ABILITY_BLOCKED(
            store, state, effect.player, this, this.powers[0]
          );
        } finally {
          target.cards.splice(target.cards.indexOf(this), 1);
          hand.splice(originalIndex, 0, this);
        }
        if (enteringBenchAbilityBlocked) return state;
      }
    }
    return previous.call(this, store, state, effect);
  }

  RadiantEternatus.prototype.reduceEffect = patchedReduceEffect;
  installed = {previous, patched: patchedReduceEffect};
  return function restoreRadiantGateLockHook() {
    if (!installed || RadiantEternatus.prototype.reduceEffect !== installed.patched) return;
    RadiantEternatus.prototype.reduceEffect = installed.previous;
    installed = null;
  };
}

module.exports = {installRadiantGateLockHook};
