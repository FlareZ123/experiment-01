'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Fix a narrow pinned-engine contract mismatch without changing vendor code.
 * Snorlax PGO Block currently rejects RetreatEffect only. The interactive
 * RetreatStartAction dispatches RetreatStartEffect and, after a selection
 * prompt, switches Pokémon without ever dispatching RetreatEffect.
 *
 * For this specific Pokémon, run the already implemented Block legality
 * check on a synthetic RetreatEffect before processing RetreatStartEffect.
 * This preserves the original Hood, Ability-lock, and Tool Jammer handling.
 *
 * @returns {() => void} Restores the exact pinned prototype method.
 */
function installSnorlaxRetreatStartHook() {
  if (installed) return () => {};
  const { Snorlax } = require(path.join(
    output, 'sets/09-sword-and-shield/set-pokemon-go/snorlax'
  ));
  const { RetreatEffect, RetreatStartEffect } = require(path.join(
    output, 'game/store/effects/game-effects'
  ));
  const original = Snorlax.prototype.reduceEffect;

  function correctedReduceEffect(store, state, effect) {
    if (effect instanceof RetreatStartEffect) {
      // Block checks effect.player and ignores effect.benchIndex, so zero is
      // only a dummy index; nothing is actually switched by this call.
      original.call(this, store, state, new RetreatEffect(effect.player, 0));
    }
    return original.call(this, store, state, effect);
  }

  Snorlax.prototype.reduceEffect = correctedReduceEffect;
  installed = {original, corrected:correctedReduceEffect};

  return function restoreSnorlaxRetreatStartHook() {
    if (!installed || Snorlax.prototype.reduceEffect !== installed.corrected) return;
    Snorlax.prototype.reduceEffect = installed.original;
    installed = null;
  };
}

module.exports = {installSnorlaxRetreatStartHook};
