'use strict';

// Twinleaf's generic Special Energy colorless override rewrites entries that
// card reducers already placed in CheckProvidedEnergyEffect.energyMap. Some
// conditional Special Energy (notably Double Dragon Energy on a non-Dragon
// host) place no entry at all, even while Temple of Sinnoh / Spectral Breach
// says every attached Special Energy provides exactly one Colorless.
//
// Fill only missing Special Energy rows after all card reducers have run.
// Patching Store.propagateEffect (rather than the energyMap getter) is
// important: the Energy reducer itself accesses energyMap while adding its
// native row, and a getter-time fallback could create a duplicate entry.
const installedStorePrototypes = new WeakSet();

function installSpecialEnergyColorlessFallback({
  Store,
  CheckProvidedEnergyEffect,
  EnergyCard,
  EnergyType,
  CardType
}) {
  const prototype = Store && Store.prototype;
  if (!prototype) {
    throw new TypeError('A pinned Twinleaf Store class is required.');
  }
  if (installedStorePrototypes.has(prototype)) {
    return false;
  }
  if (typeof prototype.propagateEffect !== 'function') {
    throw new TypeError('Pinned Twinleaf Store.propagateEffect is unavailable.');
  }
  if (typeof CheckProvidedEnergyEffect !== 'function'
    || typeof EnergyCard !== 'function'
    || !EnergyType || EnergyType.SPECIAL === undefined
    || !CardType || CardType.COLORLESS === undefined) {
    throw new TypeError('Pinned Twinleaf energy-effect types are incomplete.');
  }

  const originalPropagateEffect = prototype.propagateEffect;
  prototype.propagateEffect = function(state, effect) {
    const nextState = originalPropagateEffect.call(this, state, effect);

    if (effect instanceof CheckProvidedEnergyEffect
      && effect.specialEnergiesProvideColorless === true) {
      const sourceCards = effect.source && Array.isArray(effect.source.cards)
        ? effect.source.cards
        : [];
      const energyMap = effect.energyMap;
      if (!Array.isArray(energyMap)) {
        throw new TypeError('CheckProvidedEnergyEffect.energyMap must be an array.');
      }
      const present = new Set(energyMap.map(row => row.card));
      for (const card of sourceCards) {
        if (card instanceof EnergyCard
          && card.energyType === EnergyType.SPECIAL
          && !present.has(card)) {
          energyMap.push({
            card,
            provides: [CardType.COLORLESS]
          });
          present.add(card);
        }
      }
    }

    return nextState;
  };

  installedStorePrototypes.add(prototype);
  return true;
}

module.exports = {
  installSpecialEnergyColorlessFallback
};
