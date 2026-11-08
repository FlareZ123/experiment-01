'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent9-mail-selected-handiwork-owner-follow-v1';
const HANDIWORK = "Team Rocket's Handiwork FCO";

/**
 * Choose a previously Mail-selected Supporter at an otherwise passing
 * actual owner root. The caller supplies indices proven to correspond to
 * physical cards selected from a settled owner Trainers' Mail prompt.
 * Native Store must independently accept the resulting PlayCardAction.
 *
 * @param {object} view Detached actor-only owner-root observation.
 * @param {number[]} selectedHandIndices Physical hand indices backed by Mail receipts.
 * @returns {{kind:'play-mail-selected-handiwork',handIndex:number,printing:string}|null}
 */
function chooseMailSelectedHandiwork(view, selectedHandIndices) {
  assert.equal(view?.decisionKind, 'owner-root');
  assert.ok(Array.isArray(selectedHandIndices));
  const r = view.ownTurnResources;
  if (!r || view.globalTurn === 1 ||
      r.supporterPlayLocked === true ||
      r.supporterPlayedTurn > 0 ||
      view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked === true) {
    return null;
  }
  const hand = view.ownHand;
  if (!Array.isArray(hand)) return null;
  const index = selectedHandIndices.find(i =>
    Number.isSafeInteger(i) && i >= 0 && i < hand.length &&
    hand[i] === HANDIWORK);
  return index === undefined ? null : {
    kind: 'play-mail-selected-handiwork',
    handIndex: index,
    printing: HANDIWORK
  };
}

module.exports = {VERSION, HANDIWORK, chooseMailSelectedHandiwork};
