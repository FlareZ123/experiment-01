'use strict';

/**
 * Describe only cards already face-up in play. Attached Energy and Tools,
 * the Active Pokémon, Bench Pokémon and Stadium are public game information.
 *
 * @param {object} slot Pinned Twinleaf PokemonCardList.
 * @returns {object|null} Detached public card details.
 */
function describeInPlayPokemon(slot) {
  const pokemon = slot.getPokemonCard();
  if (!pokemon) return null;
  return {
    name: pokemon.name,
    damage: slot.damage,
    energyCards: slot.energies.cards.map(card => card.name),
    toolCards: slot.tools.map(card => card.name),
    printedAttacks: pokemon.attacks.map(attack => ({
      name: attack.name, cost: attack.cost.slice()
    }))
  };
}

/**
 * Inspect the publicly visible board immediately before a player passes.
 * Printed attack costs are included for human diagnosis, but this function
 * does not calculate payable attack costs, lock effects or legal actions.
 *
 * @param {object} state A pinned Twinleaf game state.
 * @returns {object[]} Detached public board descriptions for both players.
 */
function publicBoardSnapshot(state) {
  return state.players.map(player => ({
    active: describeInPlayPokemon(player.active),
    bench: player.bench.map(describeInPlayPokemon).filter(Boolean),
    stadium: player.stadium.cards.map(card => card.name)
  }));
}

module.exports = {describeInPlayPokemon, publicBoardSnapshot};
