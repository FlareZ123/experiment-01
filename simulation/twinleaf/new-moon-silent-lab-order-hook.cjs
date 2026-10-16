'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Official Japanese ruling: an already-present Silent Lab removes New Moon
 * before a Lunatone entering play may protect its side from Stadium effects.
 * A later Silent Lab has no such effect when New Moon is already active.
 *
 * This narrowly corrects Bench entry by a PlayPokemonEffect, and does not
 * claim to model every possible initial-board, evolution, or return-to-play
 * path. Reversible hook; never modifies pinned upstream source.
 *
 * @returns {() => void}
 */
function installNewMoonSilentLabOrderHook() {
  if (installed) return installed.restore;

  const {Lunatone} = require(path.join(output,
    'sets/10-scarlet-and-violet/set-obsidian-flames/lunatone'));
  const {PlayPokemonEffect,StadiumEffect} = require(path.join(output,
    'game/store/effects/play-card-effects'));
  const {StateUtils} = require(path.join(output,
    'game/store/state-utils'));

  const original = Lunatone.prototype.reduceEffect;
  const previousLabByLunatone = new WeakMap();

  /** @param {any} store @param {any} state @param {any} effect */
  function withOfficialOrder(store, state, effect) {
    const stadium = StateUtils.getStadiumCard(state);
    if (previousLabByLunatone.has(this)) {
      const prior = previousLabByLunatone.get(this);
      if (prior !== null && stadium !== prior) {
        previousLabByLunatone.set(this, null);
      }
    }

    if (effect instanceof PlayPokemonEffect &&
        effect.pokemonCard === this &&
        effect.player.bench.includes(effect.target)) {
      previousLabByLunatone.set(this,
        stadium && stadium.fullName === 'Silent Lab PRC' ? stadium : null);
    }

    if (effect instanceof StadiumEffect &&
        stadium &&
        stadium === previousLabByLunatone.get(this)) {
      // With pre-existing Lab, there is no functioning New Moon to shield
      // the target from this Stadium's effects.
      return state;
    }

    return original.call(this, store, state, effect);
  }

  Lunatone.prototype.reduceEffect = withOfficialOrder;
  const restore = () => {
    if (Lunatone.prototype.reduceEffect === withOfficialOrder) {
      Lunatone.prototype.reduceEffect = original;
    }
    installed = null;
  };
  installed = {restore};
  return restore;
}

module.exports = {installNewMoonSilentLabOrderHook};
