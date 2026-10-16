'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(root, modulePath));

let activeRestore = null;

/**
 * Reversible, opt-in correction for pinned Twinleaf Alolan Raichu UNM
 * Electro Rain, whose attack text deals damage to the selected Pokémon.
 *
 * Pinned upstream resolves each selection with PutCountersEffect. That
 * bypasses attack-damage prevention, modifiers and after-damage effects.
 * Replace only this attack's selected hit with the proper damage path.
 *
 * The attack-specific printed no-Weakness/Resistance effect is applied
 * only while evaluating this hit and restored even if a reducer throws.
 *
 * @returns {() => void} Restore exact pinned Store method.
 */
function installElectroRainDamageHook() {
  if (activeRestore) return activeRestore;
  const {Store} = load('game/store/store');
  const {PutCountersEffect, PutDamageEffect} = load('game/store/effects/attack-effects');
  const original = Store.prototype.reduceEffect;

  /** @param {object} state @param {object} effect */
  function corrected(state, effect) {
    if (effect instanceof PutCountersEffect &&
        effect.attack?.name === 'Electro Rain' &&
        effect.source?.getPokemonCard()?.fullName === 'Alolan Raichu UNM') {
      const damageEffect = new PutDamageEffect(effect.attackEffect, effect.damage);
      damageEffect.target = effect.target;
      const base = effect.attackEffect;
      const savedWeakness = base.ignoreWeakness;
      const savedResistance = base.ignoreResistance;
      base.ignoreWeakness = true;
      base.ignoreResistance = true;
      try {
        return original.call(this, state, damageEffect);
      } finally {
        base.ignoreWeakness = savedWeakness;
        base.ignoreResistance = savedResistance;
      }
    }
    return original.call(this, state, effect);
  }

  Store.prototype.reduceEffect = corrected;
  activeRestore = () => {
    if (Store.prototype.reduceEffect === corrected) {
      Store.prototype.reduceEffect = original;
    }
    activeRestore = null;
  };
  return activeRestore;
}

/**
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function withElectroRainDamageHook(fn) {
  const restore = installElectroRainDamageHook();
  try {
    return fn();
  } finally {
    restore();
  }
}

module.exports = {installElectroRainDamageHook, withElectroRainDamageHook};
