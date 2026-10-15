'use strict';

/**
 * Canonical Twinleaf-print equivalents for ordinary Basic Energy.
 * Each permitted replacement is a fixed BW-onward printing. Special Energy,
 * effect-bearing Energy, and arbitrary same-name cards are excluded.
 *
 * Twinleaf pinned card-types enums:
 * SuperType.ENERGY = 3, EnergyType.BASIC = 0.
 * CardType.GRASS..METAL = 1..8, CardType.FAIRY = 10.
 */
const CANONICAL = Object.freeze({
  'Grass Energy': { set: 'BLW', type: 1 },
  'Fire Energy': { set: 'BLW', type: 2 },
  'Water Energy': { set: 'BLW', type: 3 },
  'Lightning Energy': { set: 'BLW', type: 4 },
  'Psychic Energy': { set: 'BLW', type: 5 },
  'Fighting Energy': { set: 'BLW', type: 6 },
  'Darkness Energy': { set: 'BLW', type: 7 },
  'Metal Energy': { set: 'BLW', type: 8 },
  'Fairy Energy': { set: 'XY', type: 10 }
});

/**
 * @param {object} card Concrete Twinleaf card.
 * @param {string} name Basic Energy name.
 * @returns {boolean} Equivalence evidence from actual card mechanics.
 */
function isOrdinaryBasicEnergy(card, name) {
  const expected = CANONICAL[name];
  return !!expected && card.name === name && card.set === expected.set &&
    card.superType === 3 && card.energyType === 0 &&
    Array.isArray(card.provides) && card.provides.length === 1 &&
    card.provides[0] === expected.type && !card.text && !card.energyEffect;
}

/** @param {Array<object>} cardPool Initialized Twinleaf card set. */
function basicEnergyEquivalents(cardPool) {
  const index = new Map();
  for (const card of cardPool) {
    if (!isOrdinaryBasicEnergy(card, card.name)) continue;
    if (index.has(card.name) && index.get(card.name) !== card.fullName) {
      throw new Error('Ambiguous canonical Basic Energy: ' + card.name);
    }
    index.set(card.name, card.fullName);
  }
  return index;
}

module.exports = { CANONICAL, isOrdinaryBasicEnergy, basicEnergyEquivalents };
