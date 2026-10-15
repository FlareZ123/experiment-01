'use strict';

const path = require('node:path');

const serverOutput = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Optional, narrowly scoped research-only compatibility hook.
 *
 * Mimikyu GRI 58's Copycat permits any opponent's last non-GX attack,
 * including Apex Dragon, even though Twinleaf's generic prefab rejects
 * attacks carrying its internal copycatAttack marker.
 *
 * This hook temporarily clears only that metadata flag during the entry to
 * the copied-last-attack handler. It restores the original attack object in
 * all cases. It does not change a printed card, its selected attack, or
 * the upstream submodule. Stateful end-to-end tests of nested copied
 * attack effects and the GX turn-skip remain necessary.
 *
 * @returns {() => void} Restore the pinned-engine behavior.
 */
function installMimikyuNonGxCopycatHook() {
  if (installed) return installed.restore;

  const { Mimikyu } = require(path.join(serverOutput,
    'sets/08-sun-and-moon/set-guardians-rising/mimikyu'));
  const { AttackEffect } = require(path.join(serverOutput,
    'game/store/effects/game-effects'));
  const { StateUtils } = require(path.join(serverOutput, 'game/store/state-utils'));
  const original = Mimikyu.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} effect */
  function patchedReduceEffect(store, state, effect) {
    if (!(effect instanceof AttackEffect)
        || effect.attack !== this.attacks[1]
        || effect.source?.getPokemonCard() !== this) {
      return original.call(this, store, state, effect);
    }

    const opponent = StateUtils.getOpponent(state, effect.player);
    const attack = state.playerLastAttack?.[opponent.id]?.attack;
    if (!attack?.copycatAttack || attack.gxAttack) {
      return original.call(this, store, state, effect);
    }

    attack.copycatAttack = false;
    try {
      return original.call(this, store, state, effect);
    } finally {
      attack.copycatAttack = true;
    }
  }

  Mimikyu.prototype.reduceEffect = patchedReduceEffect;
  const restore = () => {
    Mimikyu.prototype.reduceEffect = original;
    installed = null;
  };
  installed = { restore };
  return restore;
}

module.exports = { installMimikyuNonGxCopycatHook };
