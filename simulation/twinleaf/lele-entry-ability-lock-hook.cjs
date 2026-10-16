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
