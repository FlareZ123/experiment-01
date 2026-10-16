'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(root, modulePath));

let activeRestore = null;

/**
 * The pinned PutDamagePrompt can accept repeated rows for one target.
 * They represent one attack's aggregate damage, so combine the rows before
 * modifiers such as Telescopic Sight are evaluated once per target.
 * @param {{target:{player:number,slot:number,index:number},damage:number}[]} rows
 */
function aggregateDamageTargets(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const target = row.target;
    const key = [target.player, target.slot, target.index].join(':');
    if (!grouped.has(key)) grouped.set(key, {target, damage: 0});
    grouped.get(key).damage += row.damage;
  }
  return [...grouped.values()];
}

/**
 * Reversible, opt-in correction for pinned Twinleaf Alolan Raichu UNM.
 * Its Electro Rain deals attack damage and ignores Weakness/Resistance.
 * Pinned upstream incorrectly uses PutCountersEffect for each target.
 *
 * The hook converts only this attack's counter effect to PutDamageEffect and
 * aggregates duplicate target rows at the matching damage prompt boundary.
 * All vendor prototypes are restored by its returned callback.
 *
 * @returns {() => void} Restore exact pinned Store methods.
 */
function installElectroRainDamageHook() {
  if (activeRestore) return activeRestore;
  const {Store} = load('game/store/store');
  const {GamePhase} = load('game/store/state/state');
  const {PutDamagePrompt} = load('game/store/prompts/put-damage-prompt');
  const {PutCountersEffect, PutDamageEffect} = load('game/store/effects/attack-effects');
  const originalReducer = Store.prototype.reduceEffect;
  const originalPrompt = Store.prototype.prompt;

  /** @param {object} state @param {object} effect */
  function correctedReducer(state, effect) {
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
        return originalReducer.call(this, state, damageEffect);
      } finally {
        base.ignoreWeakness = savedWeakness;
        base.ignoreResistance = savedResistance;
      }
    }
    return originalReducer.call(this, state, effect);
  }

  /**
   * @param {object} state
   * @param {object} prompts
   * @param {(result:object[])=>void} then
   */
  function correctedPrompt(state, prompts, then) {
    const eligible = prompts instanceof PutDamagePrompt &&
      state.phase === GamePhase.ATTACK &&
      state.players.some(player => player.id === prompts.playerId &&
        player.active.getPokemonCard()?.fullName === 'Alolan Raichu UNM');
    if (!eligible) return originalPrompt.call(this, state, prompts, then);
    return originalPrompt.call(this, state, prompts, rows =>
      then(Array.isArray(rows) ? aggregateDamageTargets(rows) : rows));
  }

  Store.prototype.reduceEffect = correctedReducer;
  Store.prototype.prompt = correctedPrompt;
  activeRestore = () => {
    if (Store.prototype.reduceEffect === correctedReducer) {
      Store.prototype.reduceEffect = originalReducer;
    }
    if (Store.prototype.prompt === correctedPrompt) {
      Store.prototype.prompt = originalPrompt;
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

module.exports = {
  aggregateDamageTargets,
  installElectroRainDamageHook,
  withElectroRainDamageHook
};
