'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent2-rank9-five-energy-bomb-public-capacity-v1';
const RANK9_ORIGINAL_ENERGY_COUNT = 7;
const ELECTRODE_BOMB_REQUIRED_DISCARD = 5;

/**
 * An optimistic physical-card capacity bound for the FULL five-card
 * discharge of Extra Energy Bomb. Fewer cards may legally attach when fewer
 * than five are in discard; this function never vetoes Ability activation.
 * Cards currently attached remain outside the discard pile unless another
 * action first moves them. Unknown Prizes are deliberately counted as
 * accessible, so a false full-payload result is a conclusive capacity veto.
 *
 * @param {number} attachedCount Number of physical owner Energy cards in play.
 * @param {number} [additionalAttachments=0] Proposed future hand attachments.
 * @returns {{version:string, attachedCount:number, additionalAttachments:number,
 *   maximumDiscardCards:number, maximumBombTransferCards:number,
 *   fiveEnergyDiscardPossible:boolean,
 *   wouldCloseFiveEnergyWindow:boolean, minimumAttachedCardsToRelease:number,
 *   optimisticUnknownPrizeAssumption:boolean}}
 */
function rank9BombCapacity(attachedCount, additionalAttachments = 0) {
  for (const n of [attachedCount, additionalAttachments]) {
    assert.ok(Number.isSafeInteger(n) && n >= 0);
  }
  assert.ok(attachedCount + additionalAttachments <= RANK9_ORIGINAL_ENERGY_COUNT);
  const currentMaximum = RANK9_ORIGINAL_ENERGY_COUNT - attachedCount;
  const maximumDiscardCards = currentMaximum - additionalAttachments;
  return {
    version: VERSION,
    attachedCount,
    additionalAttachments,
    maximumDiscardCards,
    maximumBombTransferCards: Math.min(ELECTRODE_BOMB_REQUIRED_DISCARD,maximumDiscardCards),
    fiveEnergyDiscardPossible: maximumDiscardCards >= ELECTRODE_BOMB_REQUIRED_DISCARD,
    wouldCloseFiveEnergyWindow:
      currentMaximum >= ELECTRODE_BOMB_REQUIRED_DISCARD &&
      maximumDiscardCards < ELECTRODE_BOMB_REQUIRED_DISCARD,
    minimumAttachedCardsToRelease: Math.max(0,
      ELECTRODE_BOMB_REQUIRED_DISCARD - maximumDiscardCards),
    optimisticUnknownPrizeAssumption: true
  };
}

/**
 * Count physical Energy cards on owner-visible face-up Pokemon. One
 * multi-unit Special Energy card counts as one physical card. No private
 * deck, opponent hand, or unknown Prize composition is accessed.
 *
 * @param {{active?:{energies:string[]}|null,
 *   bench?:Array<{energies:string[]}|null>}} ownPublic
 * @returns {number}
 */
function countPublicAttachedEnergyCards(ownPublic) {
  assert.ok(ownPublic && Array.isArray(ownPublic.bench));
  return [ownPublic.active, ...ownPublic.bench]
    .filter(Boolean)
    .reduce((total, pokemon) => {
      assert.ok(Array.isArray(pokemon.energies));
      return total + pokemon.energies.length;
    }, 0);
}

module.exports = {
  VERSION,
  RANK9_ORIGINAL_ENERGY_COUNT,
  ELECTRODE_BOMB_REQUIRED_DISCARD,
  rank9BombCapacity,
  countPublicAttachedEnergyCards
};
