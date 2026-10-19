'use strict';

const assert = require('node:assert/strict');

/**
 * Inspect only own publicly observable copy donors, own Active Energy, and
 * the opposing public board after a real Pass has already been selected.
 * The pinned Mewtwo & Mew-GX helper excludes its own printing from the
 * discard-only extra source list. Attack costs remain unvalidated here.
 *
 * @param {object} state Pinned Store state at a real post-choice root.
 * @param {0|1} seat Player's physical slot.
 * @param {{gx:number,ex:number}} tags Actual pinned GX/EX CardTag values.
 * @returns {object} Detached, nonactionable diagnostic data.
 */
function publicPerfectionPrerequisites(state, seat, tags) {
  assert.ok(seat === 0 || seat === 1);
  const owner = state.players[seat];
  const opponent = state.players[1 - seat];
  const eligible = card => card && typeof card.hasTag === 'function' &&
    (card.hasTag(tags.gx) || card.hasTag(tags.ex));
  const entry = (card, zone) => ({
    zone, printing: card.fullName,
    attacks: card.attacks.map(attack => attack.name)
  });
  const bench = owner.bench.map(slot => slot.getPokemonCard())
    .filter(eligible).map(card => entry(card, 'Bench'));
  const discard = owner.discard.cards.filter(card =>
    eligible(card) && card.fullName !== 'Mewtwo & Mew-GX UNM')
    .map(card => entry(card, 'discard'));
  const opponentBoard = [opponent.active, ...opponent.bench]
    .filter(slot => slot.getPokemonCard())
    .map(slot => ({
      printing: slot.getPokemonCard().fullName,
      tools: slot.tools.map(card => card.fullName)
    }));
  return {
    ownActive: owner.active.getPokemonCard()?.fullName ?? null,
    ownActiveEnergy: owner.active.energies.cards.map(card => card.fullName),
    ownVisibleCopySources: [...bench, ...discard],
    opponentBoard, publicStadiums: state.players.flatMap(player =>
      player.stadium.cards.map(card => card.fullName)),
    scope: 'Owner Bench and discard, face-up field and attached Energy only',
    gameplayIntervention: false,
    attackSelectionQualified: false
  };
}

module.exports = { publicPerfectionPrerequisites };
