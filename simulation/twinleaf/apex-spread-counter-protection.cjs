'use strict';

const EFFECT_PROTECTION_ENERGIES = new Set([
  'Mist Energy', 'Wash Water Energy', 'Wonder Energy'
]);

/**
 * Conservative screen for uncertain attack-counter effects on a Bench target.
 * Attached special Energies can block Phantom Dive's PutCountersEffect;
 * this deliberately does not attempt to resolve Energy-lock or type changes.
 *
 * @param {object} slot Pinned PokemonCardList.
 * @param {object} pokemon Printed PokemonCard in the slot.
 * @returns {boolean} Whether a nominal KO needs deeper effect validation.
 */
function uncertainCounterProtection(slot, pokemon) {
  return Boolean(
    pokemon.powers?.length ||
    slot.tools?.length ||
    slot.cards?.some(card => EFFECT_PROTECTION_ENERGIES.has(card.name))
  );
}

module.exports = {uncertainCounterProtection};
