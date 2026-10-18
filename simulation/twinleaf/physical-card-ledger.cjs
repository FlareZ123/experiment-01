'use strict';

/**
 * Diagnose physical-card reference ownership in pinned Twinleaf State.
 *
 * CardList.cards and PokemonCardList.tools are canonical locations. energies.cards
 * is a secondary attachment index and must not be counted as an additional
 * physical zone. Card identifiers may be duplicated by independent clones,
 * so ownership is determined by reference identity.
 *
 * This audit is read-only and independent of card names or hidden card faces.
 *
 * @param {{players: object[]}} state Current live Store state.
 * @returns {{schema: string, canonicalCounts: number[], referenceDuplications:
 * Array<{locations: string[]}>, energyWithoutPhysicalCard:
 * Array<{location: string, count: number}>, repeatedEnergyIndexes:
 * Array<{location: string, count: number}>}}
 */
function inspectPhysicalCardZones(state) {
  const seen = new Map();
  const doubled = new Map();
  const canonicalCounts = state.players.map(() => 0);
  const energyWithoutPhysicalCard = [];
  const repeatedEnergyIndexes = [];

  /** @param {object} list @param {string} label @param {number} seat */
  function visit(list, label, seat) {
    for (const card of list.cards) {
      canonicalCounts[seat]++;
      const previous = seen.get(card);
      if (previous === undefined) {
        seen.set(card, label);
      } else {
        const locations = doubled.get(card) || [previous];
        locations.push(label);
        doubled.set(card, locations);
      }
    }
  }

  /** @param {object} slot @param {string} label @param {number} seat */
  function visitPokemon(slot, label, seat) {
    visit(slot, label, seat);
    if (slot.tools) visit({cards: slot.tools}, label + '.tools', seat);
    const physical = new Set(slot.cards);
    const indexed = new Set();
    let ghost = 0;
    let repeats = 0;
    for (const energy of slot.energies.cards) {
      if (!physical.has(energy)) ghost++;
      if (indexed.has(energy)) repeats++;
      indexed.add(energy);
    }
    if (ghost > 0) energyWithoutPhysicalCard.push({location: label, count: ghost});
    if (repeats > 0) repeatedEnergyIndexes.push({location: label, count: repeats});
  }

  for (const [seat, player] of state.players.entries()) {
    const prefix = 'seat' + seat;
    for (const zone of ['deck', 'hand', 'discard', 'lostzone', 'stadium', 'supporter']) {
      visit(player[zone], prefix + '.' + zone, seat);
    }
    visitPokemon(player.active, prefix + '.active', seat);
    for (const [index, slot] of player.bench.entries()) {
      visitPokemon(slot, prefix + '.bench[' + index + ']', seat);
    }
    for (const [index, prize] of player.prizes.entries()) {
      visit(prize, prefix + '.prizes[' + index + ']', seat);
    }
  }

  // Some prefabs temporarily move top-deck cards into a CardList owned by
  // a ChooseCardsPrompt. Such custody is not a canonical board zone.
  const transientPromptCustody = state.players.map(() => 0);
  const transientSeen = new Set();
  for (const prompt of state.prompts || []) {
    const cards = prompt.cards?.cards;
    if (!Array.isArray(cards)) continue;
    const ownerId = prompt.player?.id ?? prompt.playerId;
    const seat = state.players.findIndex(player => player.id === ownerId);
    if (seat < 0) continue;
    for (const card of cards) {
      if (!seen.has(card) && !transientSeen.has(card)) {
        transientPromptCustody[seat]++;
        transientSeen.add(card);
      }
    }
  }

  return {
    schema: 'twinleaf-physical-reference-ownership-v1',
    canonicalCounts,
    transientPromptCustody,
    referenceDuplications: [...doubled.values()].map(locations => ({locations})),
    energyWithoutPhysicalCard,
    repeatedEnergyIndexes
  };
}

function fixedDeckCountAnomalies(ledger, expected = 60) {
  return ledger.canonicalCounts.flatMap((observed, seat) => observed === expected ? [] : [{seat, observed, expected}]);
}

module.exports = {inspectPhysicalCardZones, fixedDeckCountAnomalies};
