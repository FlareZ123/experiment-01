'use strict';

const BASIC_ENERGY_TYPE = Object.freeze({
  'Grass Energy': 'GRASS',
  'Fire Energy': 'FIRE',
  'Water Energy': 'WATER',
  'Lightning Energy': 'LIGHTNING',
  'Psychic Energy': 'PSYCHIC',
  'Fighting Energy': 'FIGHTING',
  'Darkness Energy': 'DARK',
  'Metal Energy': 'METAL',
  'Fairy Energy': 'FAIRY'
});

/**
 * Audit an Active Pokémon's printed attack costs against its attached Basic Energy.
 * This is a restricted public-information diagnostic. It does not determine
 * attack legality or account for Special Energy, cost changes, status conditions,
 * active effects, lock effects, or attack-specific conditions.
 *
 * @param {object} active Twinleaf public in-play Pokémon card list.
 * @param {object} cardType Pinned engine CardType enum (numeric values).
 * @returns {object|null} Detached diagnostic, or null for an empty Active.
 */
function printedBasicEnergyAudit(active, cardType) {
  const pokemon = active.getPokemonCard();
  if (!pokemon) return null;
  const attachedBasic = active.energies.cards
    .filter(card => Object.hasOwn(BASIC_ENERGY_TYPE, card.name))
    .map(card => card.name);
  const available = Object.create(null);
  for (const name of attachedBasic) {
    const type = cardType[BASIC_ENERGY_TYPE[name]];
    available[type] = (available[type] || 0) + 1;
  }
  const supportedTypes = Object.values(BASIC_ENERGY_TYPE).map(key => cardType[key]);
  const attacks = pokemon.attacks.map(attack => {
    const cost = attack.cost.slice();
    const typed = cost.filter(type => type !== cardType.COLORLESS);
    const needed = Object.create(null);
    for (const type of typed) needed[type] = (needed[type] || 0) + 1;
    const knownCost = cost.every(type => type === cardType.COLORLESS ||
      supportedTypes.includes(type));
    const printedCostCoveredByBasic = knownCost &&
      attachedBasic.length >= cost.length &&
      Object.entries(needed).every(([type, count]) => (available[type] || 0) >= count);
    return {name: attack.name, printedCost: cost, printedCostCoveredByBasic};
  });
  return {
    evidenceType: 'printed-basic-energy-cost-only-v1',
    activePokemon: pokemon.name,
    attachedBasicEnergy: attachedBasic,
    attacks
  };
}

module.exports = {printedBasicEnergyAudit};
