'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Temporary compatibility guard for two "play from hand onto Bench" draw
 * Abilities. Upstream invokes card handlers before moving the Basic into
 * play, which makes in-play-only Ability locks miss the entry Ability.
 * The exact destination is staged solely for the pinned lock check, then
 * restored before the unmodified card reducer executes.
 *
 * @returns {() => void} Restore both card prototype methods.
 */
function installEntryDrawLockHook() {
  if (installed) return () => {};
  const { DedenneGX } = require(path.join(output,
    'sets/08-sun-and-moon/set-unbroken-bonds/dedenne-gx'));
  const { CrobatV } = require(path.join(output,
    'sets/09-sword-and-shield/set-darkness-ablaze/crobat-v'));
  const { PlayPokemonEffect } = require(path.join(output,
    'game/store/effects/play-card-effects'));
  const { IS_ABILITY_BLOCKED } = require(path.join(output,
    'game/store/prefabs/prefabs'));

  /** @param {Function} Type */
  function patch(Type) {
    const previous = Type.prototype.reduceEffect;
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
            blocked = IS_ABILITY_BLOCKED(
              store, state, effect.player, this, this.powers[0]
            );
          } finally {
            target.cards.splice(target.cards.indexOf(this), 1);
            hand.splice(handIndex, 0, this);
          }
          if (blocked) return state;
        }
      }
      return previous.call(this, store, state, effect);
    }
    Type.prototype.reduceEffect = guardedReduceEffect;
    return { Type, previous, patched: guardedReduceEffect };
  }
  const changes = [patch(DedenneGX), patch(CrobatV)];
  installed = changes;

  return function restoreEntryDrawLockHook() {
    if (installed !== changes) return;
    for (const change of changes) {
      if (change.Type.prototype.reduceEffect === change.patched) {
        change.Type.prototype.reduceEffect = change.previous;
      }
    }
    installed = null;
  };
}

module.exports = { installEntryDrawLockHook };
