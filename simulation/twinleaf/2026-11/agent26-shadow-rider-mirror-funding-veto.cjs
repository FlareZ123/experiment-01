'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent26-public-shadow-rider-mirror-funding-veto-v1';
const SHADOW_RIDER = new Set([
  'Shadow Rider Calyrex V CRE',
  'Shadow Rider Calyrex VMAX CRE'
]);

/**
 * A player whose opponent visibly has a Shadow Rider can rationally value
 * Underworld Door's acceleration/draw above progressing the Active manually.
 * This abstains from the optional manual-priority intervention only; the
 * existing Underworld Door owner root is still considered normally.
 *
 * This gate observes only publicly revealed opposing Pokémon. Never use an
 * opponent's deck, hand, Prizes, known tournament rank, or hidden archetype
 * classification to choose an action in a live game.
 *
 * @param {object} view Detached acting owner's observation.
 * @returns {boolean} Whether to preserve the existing Underworld line.
 */
function vetoManualActiveFunding(view) {
  assert.equal(view?.decisionKind,'owner-root');
  return [view.opponentPublic?.active,...(view.opponentPublic?.bench??[])]
    .some(p=>p!==null&&SHADOW_RIDER.has(p?.printing));
}

module.exports={VERSION,vetoManualActiveFunding};
