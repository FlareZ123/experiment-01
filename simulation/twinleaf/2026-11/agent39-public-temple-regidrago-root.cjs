'use strict';
const assert = require('node:assert/strict');
const VERSION = 'agent39-owner-visible-temple-against-regidrago-v1';

/**
 * Offer a held Temple of Sinnoh against a publicly established Regidrago line.
 * Restrict the intervention to an empty Stadium zone to avoid collapsing
 * either Bench or consuming an existing useful Stadium.
 * The exact card's printed attack cost and source responses are checked by
 * the native Store; this actor cannot see either hidden deck or Prize cards.
 * @param {object} view Detached owner-only observation.
 * @returns {object|null}
 */
function choosePublicTempleAgainstRegidrago(view) {
  assert.equal(view.decisionKind, 'owner-root');
  const own = view.ownPublic, opponent = view.opponentPublic;
  const restrictions = view.ownTurnResources;
  if (!own.active || restrictions.stadiumPlayLocked !== false ||
      !Number.isSafeInteger(restrictions.stadiumPlayedTurn) ||
      restrictions.stadiumPlayedTurn >= view.globalTurn) return null;
  const currentStadiums = [...(own.stadium ?? []), ...(opponent.stadium ?? [])];
  if (currentStadiums.length !== 0) return null;
  const publicOpponents = [opponent.active, ...(opponent.bench ?? [])]
    .filter(Boolean);
  if (!publicOpponents.some(p =>
      p.name === 'Regidrago V' || p.name === 'Regidrago VSTAR')) return null;
  const handIndex = view.ownHand.findIndex(p =>
    p.startsWith('Temple of Sinnoh '));
  if (handIndex < 0) return null;
  return {
    kind: 'play-temple-of-sinnoh', handIndex,
    printing: view.ownHand[handIndex],
    source: VERSION,
    reason: 'owner-held-Temple-empty-Stadium-public-Regidrago-board'
  };
}

module.exports = { VERSION, choosePublicTempleAgainstRegidrago };
