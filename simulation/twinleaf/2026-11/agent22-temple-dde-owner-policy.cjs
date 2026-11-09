'use strict';

const VERSION = 'agent22-owner-public-temple-dde-denial-v1';
const TEMPLE = 'Temple of Sinnoh ASR';
const DDE = 'Double Dragon Energy ROS';
const REGIDRAGO = new Set(['Regidrago V SIT', 'Regidrago VSTAR SIT']);

/**
 * Offer one physically held Temple only when it reduces an opposing
 * face-up Regidrago's actually attached Double Dragon Energy.
 * This is an actor-only public/own-hand decision, not a proof that the
 * opponent can no longer attack after Temple resolves.
 *
 * @param {object} view Detached frozen actorObservation.
 * @param {object} catalog Public printing/type catalog.
 * @returns {object|null} Real owner-hand Stadium action proposal.
 */
function chooseTempleDdeDenial(view, catalog) {
  if (view?.decisionKind !== 'owner-root') return null;
  const owner = view.ownPublic;
  const other = view.opponentPublic;
  if (!owner || !other) return null;
  const resources = view.ownTurnResources;
  if (resources?.stadiumPlayLocked === true ||
      owner.publicTurnRestrictions?.stadiumPlayLocked === true ||
      resources?.stadiumPlayedTurn === view.globalTurn) return null;
  if (catalog?.trainerStadiumPrints?.get(TEMPLE)?.type !== 'Stadium')
    return null;

  const handIndex = view.ownHand?.indexOf(TEMPLE) ?? -1;
  if (handIndex < 0) return null;

  // Never play a Stadium whose printed name is already the Stadium in play.
  const current = [...(owner.stadium ?? []), ...(other.stadium ?? [])];
  if (current.some(printing =>
    printing === TEMPLE || printing.startsWith('Temple of Sinnoh ')))
    return null;

  const visible = [other.active, ...(other.bench ?? [])];
  const target = visible.find(slot =>
    slot && REGIDRAGO.has(slot.printing) &&
    slot.energies?.includes(DDE));
  if (!target) return null;
  return Object.freeze({
    kind: 'play-temple-dde-denial',
    handIndex, printing: TEMPLE,
    source: VERSION,
    targetPrinting: target.printing,
    reason: 'opponent-Regidrago-visible-Double-Dragon'
  });
}

module.exports = { VERSION, TEMPLE, DDE, chooseTempleDdeDenial };
