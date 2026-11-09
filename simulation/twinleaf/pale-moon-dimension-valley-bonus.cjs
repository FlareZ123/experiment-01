'use strict';

const assert = require('node:assert/strict');

/**
 * Repair the pinned Trevenant & Dusknoir-GX Pale Moon-GX extra-Energy
 * threshold for the narrowly tested Dimension Valley [P,C] -> [P] case.
 * The vendor hardcodes [P,P,C], so two Psychic units do not trigger the
 * printed extra-Psychic payoff even though the effective cost is [P].
 *
 * This intentionally does not attempt a global modifier engine. Other cost
 * increases/reductions, Stadium neutralization, energy-provider interactions,
 * and the complete Aichi paper benchmark remain independent gates.
 *
 * @param {{
 *  CardClass: Function, StateUtils: object, CardType: object,
 *  CheckProvidedEnergyEffect: Function, DiscardCardsEffect: Function,
 *  WAS_ATTACK_USED: Function
 * }} types Exact pinned native modules.
 */
function installPaleMoonDimensionValleyBonus(types) {
  const {
    CardClass, StateUtils, CardType, CheckProvidedEnergyEffect,
    DiscardCardsEffect, WAS_ATTACK_USED
  } = types;
  const proto = CardClass.prototype;
  const original = Object.getOwnPropertyDescriptor(proto, 'reduceEffect');
  assert.equal(typeof original?.value, 'function');

  let corrected = 0;
  const events = [];

  function wrapped(store, state, effect) {
    const player = effect?.player;
    const active = player?.active?.getPokemonCard();
    const stadium = StateUtils.getStadiumCard(state);
    const isEligible = active === this &&
      WAS_ATTACK_USED(effect, 1, this) &&
      stadium?.fullName === 'Dimension Valley PHF' &&
      this.cardType.includes(CardType.PSYCHIC);

    const result = original.value.call(this, store, state, effect);
    if (!isEligible) return result;

    // Original GX accounting, accepted attack and pending KO remain native.
    // The correction only supplies the skipped additional Energy-discard.
    const provided = new CheckProvidedEnergyEffect(player);
    store.reduceEffect(state, provided);
    const p = CardType.PSYCHIC;
    const c = CardType.COLORLESS;
    const hasExtraAfterReduction =
      StateUtils.checkEnoughEnergy(provided.energyMap, [p, p]);
    const nativeBonusAlreadyPaid =
      StateUtils.checkEnoughEnergy(provided.energyMap, [p, p, c]);
    if (!hasExtraAfterReduction || nativeBonusAlreadyPaid) return result;

    const opponent = StateUtils.getOpponent(state, player);
    const opponentEnergy = new CheckProvidedEnergyEffect(opponent, opponent.active);
    store.reduceEffect(state, opponentEnergy);
    const physicalCards = opponentEnergy.energyMap.map(item => item.card);
    if (physicalCards.length === 0) return result;

    const discard = new DiscardCardsEffect(effect, physicalCards);
    discard.target = opponent.active;
    store.reduceEffect(state, discard);
    corrected++;
    events.push({
      playerId: player.id,
      defenderId: opponent.id,
      stadium: stadium.fullName,
      discardedCardCount: physicalCards.length,
      attack: 'Pale Moon-GX'
    });
    return result;
  }

  Object.defineProperty(proto, 'reduceEffect', { ...original, value: wrapped });
  return {
    evidence: () => ({ corrected, events: [...events] }),
    restore: () => {
      assert.strictEqual(proto.reduceEffect, wrapped,
        'Native card handler displaced the scoped Pale Moon correction');
      Object.defineProperty(proto, 'reduceEffect', original);
    }
  };
}

/**
 * @template T
 * @param {Parameters<typeof installPaleMoonDimensionValleyBonus>[0]} types
 * @param {()=>T} work
 * @returns {{result:T,corrected:number,events:object[]}}
 */
function withPaleMoonDimensionValleyBonus(types, work) {
  const installed = installPaleMoonDimensionValleyBonus(types);
  try {
    return { result: work(), ...installed.evidence() };
  } finally {
    installed.restore();
  }
}

module.exports = {
  installPaleMoonDimensionValleyBonus,
  withPaleMoonDimensionValleyBonus
};
