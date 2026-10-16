'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let activeRestore = null;

/**
 * The pinned engine propagates PlayPokemonEffect before moving the Basic from
 * hand to Bench. A Rule Box Ability operating on entry must be checked in
 * its destination zone: Iron Thorns Initialization affects only in-play
 * Pokémon, but the pre-move IS_ABILITY_BLOCKED probe otherwise misses it.
 * This hook only affects Tapu Lele-GX's Wonder Tag entry trigger.
 *
 * @returns {() => void}
 */
function installLeleEntryAbilityLockHook() {
  if (activeRestore) return activeRestore;
  const {TapuLeleGX} = require(path.join(output,
    'sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx'));
  const {PlayPokemonEffect} = require(path.join(output,
    'game/store/effects/play-card-effects'));
  const {IS_ABILITY_BLOCKED} = require(path.join(output,
    'game/store/prefabs/prefabs'));
  const original = TapuLeleGX.prototype.reduceEffect;

  /** @param {any} store @param {any} state @param {any} effect */
  function corrected(store, state, effect) {
    if (effect instanceof PlayPokemonEffect &&
        effect.pokemonCard === this && effect.target.cards.length === 0 &&
        effect.player.bench.includes(effect.target)) {
      const hand = effect.player.hand.cards;
      const index = hand.indexOf(this);
      if (index !== -1) {
        hand.splice(index, 1);
        effect.target.cards.push(this);
        let blocked;
        try {
          blocked = IS_ABILITY_BLOCKED(store, state, effect.player, this, this.powers[0]);
        } finally {
          const position = effect.target.cards.indexOf(this);
          if (position !== -1) effect.target.cards.splice(position, 1);
          hand.splice(index, 0, this);
        }
        if (blocked) return state;
      }
    }
    return original.call(this, store, state, effect);
  }

  TapuLeleGX.prototype.reduceEffect = corrected;
  activeRestore = () => {
    if (TapuLeleGX.prototype.reduceEffect === corrected) {
      TapuLeleGX.prototype.reduceEffect = original;
    }
    activeRestore = null;
  };
  return activeRestore;
}

module.exports = {installLeleEntryAbilityLockHook};
