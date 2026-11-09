'use strict';

const HANDIWORK = "Team Rocket's Handiwork FCO";
const VERSION = 'agent1-owner-held-handiwork-pass-root-v1';

/**
 * Select an already-held Handiwork at an otherwise passing actor root.
 * Uses only the detached owner's own hand and public game conditions.
 * Native Store canPlay and action dispatch remain mandatory follow-up gates.
 * @param {object} view Detached actorObservation for the acting player.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseOwnerHeldHandiwork(view) {
  if (view?.decisionKind !== 'owner-root' ||
      !Array.isArray(view.ownHand) ||
      view.globalTurn === 1 ||
      view.ownTurnResources?.supporterPlayLocked === true ||
      view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked === true ||
      view.ownTurnResources?.supporterPlayedTurn > 0 ||
      view.opponentPublic?.deckCount === 0) return null;
  const index = view.ownHand.indexOf(HANDIWORK);
  return index < 0 ? null : {
    kind: 'play-owner-held-handiwork',
    handIndex: index,
    printing: HANDIWORK
  };
}

module.exports = {VERSION, HANDIWORK, chooseOwnerHeldHandiwork};
