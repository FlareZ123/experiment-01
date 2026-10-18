'use strict';

const path = require('node:path');
const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output,name));
let activeRestore = null;

/**
 * Pinned Gengar & Mimikyu-GX TEU Horror House-GX checks the raw
 * EnergyCard.provides array. Rainbow and Prism supply Psychic only through
 * CheckProvidedEnergyEffect while in play, so the unpatched extra-Psychic
 * condition omits their supplied Psychic units.
 *
 * Narrow opt-in, reversible research hook; does not modify vendor sources.
 * Preserves existing GX availability and lock behavior, inserting only the
 * missing both-players-draw-to-seven branch after a successfully dispatched
 * printed Horror House-GX attack effect.
 *
 * @returns {()=>void} Restores the exact pinned prototype.
 */
function installHorrorHouseExtraPsychicHook() {
  if (activeRestore) return activeRestore;
  const {GengarMimikyuGX} =
    load('sets/08-sun-and-moon/set-team-up/gengar-and-mimikyu-gx');
  const {CheckProvidedEnergyEffect} =
    load('game/store/effects/check-effects');
  const {CardType,SuperType} =
    load('game/store/card/card-types');
  const {StateUtils} = load('game/store/state-utils');
  const {WAS_ATTACK_USED,DRAW_CARDS_UNTIL_CARDS_IN_HAND} =
    load('game/store/prefabs/prefabs');
  const original = GengarMimikyuGX.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} effect */
  function corrected(store,state,effect) {
    if (!WAS_ATTACK_USED(effect,1,this)) {
      return original.call(this,store,state,effect);
    }

    const player = effect.player;
    const provided = new CheckProvidedEnergyEffect(player);
    store.reduceEffect(state,provided);
    const semanticallyExtraPsychic = StateUtils.checkEnoughEnergy(
      provided.energyMap,[CardType.PSYCHIC,CardType.PSYCHIC]);
    const pinnedExtraPsychic = player.active.cards.filter(card =>
      card.superType === SuperType.ENERGY &&
      card.provides.includes(CardType.PSYCHIC)).length > 1;

    const result = original.call(this,store,state,effect);
    if (semanticallyExtraPsychic && !pinnedExtraPsychic) {
      [player,StateUtils.getOpponent(result,player)].forEach(p =>
        DRAW_CARDS_UNTIL_CARDS_IN_HAND(p,7));
    }
    return result;
  }

  GengarMimikyuGX.prototype.reduceEffect = corrected;
  activeRestore = () => {
    if (GengarMimikyuGX.prototype.reduceEffect === corrected) {
      GengarMimikyuGX.prototype.reduceEffect = original;
    }
    activeRestore = null;
  };
  return activeRestore;
}

/** @template T @param {()=>T} execute @returns {T} */
function withHorrorHouseExtraPsychicHook(execute) {
  const restore = installHorrorHouseExtraPsychicHook();
  try {
    return execute();
  } finally {
    restore();
  }
}

module.exports = {
  installHorrorHouseExtraPsychicHook,withHorrorHouseExtraPsychicHook
};
