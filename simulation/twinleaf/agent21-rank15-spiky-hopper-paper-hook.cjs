'use strict';

/*
 * Scoped paper-Expanded compatibility hook for pinned Twinleaf a9905a76.
 *
 * Mega Lopunny ex PFL84 / native Mega Lopunny ex M2 implements Spiky Hopper
 * as direct opponent.active.damage += damage, skipping DealDamageEffect.
 * Consequently its printed Powerful Colorless Energy DAA176 and Choice Belt
 * PAL176 bonuses never run. Its base attack is 160, ignores *defender*
 * effects (not attacker bonuses), and still applies Weakness/Resistance.
 *
 * This hook uses native attached-card reducer code to calculate the known
 * two source modifiers without dispatching DealDamageEffect, since a native
 * DealDamageEffect would also apply defending-Pokemon effects the attack
 * explicitly ignores. It preserves the pinned direct/shred damage path.
 *
 * Research-only, reversible, opt-in, and single synchronous Store scope.
 * This is a targeted exact-source repair, NOT a general shred/attack-damage
 * correctness certificate or a native competitive-result qualification.
 */

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent21-rank15-spiky-hopper-paper-damage-v1';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const MODIFIERS = Object.freeze({
  energy: 'Powerful Colorless Energy DAA',
  tool: 'Choice Belt PAL'
});

function positiveDamage(value, label) {
  assert.ok(Number.isFinite(value) && value >= 0,
    label + ' must be a finite nonnegative number');
  return value;
}

/**
 * Intercept only the native printed attack, not every generic shred.
 *
 * @param {object} card Current PFL84 Mega Lopunny ex instance.
 * @param {object} store Native Store.
 * @param {object} state Native State.
 * @param {object} effect Native AttackEffect for Spiky Hopper.
 * @param {object} api Pinned native classes and utilities (also injectable).
 * @returns {object} Native state.
 */
function resolvePaperSpikyHopper(card, store, state, effect, api) {
  const source = effect.source;
  assert.equal(source?.getPokemonCard?.(), card,
    'Spiky Hopper source must be the current Mega Lopunny instance');
  const opponent = api.StateUtils.getOpponent(state, effect.player);
  assert.equal(effect.opponent, opponent);
  assert.equal(source, effect.player.active);

  // Card modifiers inspect a DealDamageEffect. A probe passed ONLY to the
  // two relevant attached card reducers makes their own suppression logic
  // authoritative while avoiding the normal defender-effect damage path.
  const initial = positiveDamage(effect.damage, 'printed base damage');
  const probe = new api.DealDamageEffect(effect, initial);
  assert.equal(probe.target, opponent.active);

  for (const energy of source.energies?.cards ?? []) {
    if (energy?.fullName === MODIFIERS.energy) {
      state = energy.reduceEffect(store, state, probe);
    }
  }
  for (const tool of source.tools ?? []) {
    if (tool?.fullName === MODIFIERS.tool) {
      state = tool.reduceEffect(store, state, probe);
    }
  }

  // Native DealDamageEffect reducer ordinarily applies these source-scoped
  // attack modifiers; the manual-shred implementation skipped them as well.
  let damage = positiveDamage(probe.damage, 'source-modified damage');
  const reduction = positiveDamage(
    source.attackDamageReductionNextTurn ?? 0, 'source pre-Weakness reduction');
  damage = Math.max(0, damage - reduction);
  const outgoing = positiveDamage(
    source.outgoingAttackDamageBonusNextTurn ?? 0, 'source outgoing bonus');
  damage += outgoing;

  const weakness = new api.ApplyWeaknessEffect(effect, damage);
  state = store.reduceEffect(state, weakness);
  damage = positiveDamage(weakness.damage, 'Weakness and Resistance damage');
  damage = Math.max(0, damage -
    positiveDamage(source.attackDamageReductionAfterWeaknessNextTurn ?? 0,
      'source post-Weakness reduction'));

  // Prevent the generic after-card pipeline from dealing 160 again.
  effect.damage = 0;
  if (damage > 0) {
    opponent.active.damage += damage;
    const afterDamage = new api.AfterDamageEffect(effect, damage);
    state = store.reduceEffect(state, afterDamage);
  }
  return state;
}

/**
 * Revert the exact original prototype method in finally, including on throw.
 * Must not cross async boundaries. No upstream file is edited.
 */
function withPaperRank15SpikyHopper(work, injected = {}) {
  assert.equal(typeof work, 'function');
  const output = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load = moduleName => require(path.join(output, moduleName));
  const MegaLopunnyex = injected.MegaLopunnyex ??
    load('sets/11-mega-evolution/set-phantasmal-flames/mega-lopunny-ex').MegaLopunnyex;
  const attacks = injected.attacks ?? load('game/store/effects/attack-effects');
  const prefabs = injected.prefabs ?? load('game/store/prefabs/prefabs');
  const api = {
    DealDamageEffect: attacks.DealDamageEffect,
    ApplyWeaknessEffect: attacks.ApplyWeaknessEffect,
    AfterDamageEffect: attacks.AfterDamageEffect,
    StateUtils: injected.StateUtils ?? load('game/store/state-utils').StateUtils
  };
  for (const name of ['DealDamageEffect','ApplyWeaknessEffect','AfterDamageEffect'])
    assert.equal(typeof api[name], 'function', 'Pinned effect class missing: ' + name);
  assert.equal(typeof prefabs.WAS_ATTACK_USED, 'function');
  assert.equal(typeof MegaLopunnyex?.prototype?.reduceEffect, 'function');

  const proto = MegaLopunnyex.prototype;
  const original = Object.getOwnPropertyDescriptor(proto, 'reduceEffect');
  assert.equal(typeof original?.value, 'function');
  assert.ok(original.writable || original.configurable,
    'Pinned reducer cannot be reversibly patched');
  const replacement = function(store, state, effect) {
    if (!prefabs.WAS_ATTACK_USED(effect, 1, this))
      return original.value.call(this, store, state, effect);
    return resolvePaperSpikyHopper(this, store, state, effect, api);
  };
  Object.defineProperty(proto, 'reduceEffect', {...original, value:replacement});
  try {
    const result = work();
    assert.ok(!result || typeof result.then !== 'function',
      'Do not await work inside a temporary pinned-Store paper hook');
    return result;
  } finally {
    Object.defineProperty(proto, 'reduceEffect', original);
  }
}

module.exports = {
  VERSION, ENGINE_PIN, MODIFIERS, resolvePaperSpikyHopper,
  withPaperRank15SpikyHopper
};
