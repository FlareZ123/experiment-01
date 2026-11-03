'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent10-rank11-letter-k0-source-target-v1';
const LETTER = 'Professors Letter BKT';
const DARKNESS = 'Darkness Energy MEE';

/**
 * Bound target copies in an owner's hidden deck from the registered 60
 * and owner-visible hand/board/discard/Lost/Stadium information. Every
 * remaining Prize is allowed to contain a matching copy.
 *
 * Assumes ownership conservation and no unrepresented owned zones.
 * No deck order, Prize identities or opponent secrets are inspected.
 *
 * @param {object} view Detached genuine owner-root actorObservation.
 * @param {string[]} registeredSixty Authenticated exact original 60.
 * @param {string} printing Exact target fullName.
 * @returns {object} Conservative paper K0 target-card bound.
 */
function ownPrintedDeckLowerBound(view, registeredSixty, printing) {
  assert.equal(view?.decisionKind, 'owner-root');
  assert.ok(Array.isArray(registeredSixty) &&
    registeredSixty.length === 60);
  assert.equal(typeof printing, 'string');
  assert.ok(Array.isArray(view.ownHand));

  const owner = view.ownPublic;
  assert.ok(owner && Number.isSafeInteger(owner.prizeCount) &&
    owner.prizeCount >= 0 && Number.isSafeInteger(owner.deckCount) &&
    owner.deckCount >= 0);
  const board = [owner.active, ...(owner.bench ?? [])].filter(Boolean);
  const outside = [
    ...view.ownHand, ...(owner.discard ?? []),
    ...(owner.lostZone ?? []), ...(owner.resolvingSupporter ?? []),
    ...(owner.stadium ?? []),
    ...board.flatMap(slot => [
      ...(slot.evolutionPrintings ?? []),
      ...(slot.energies ?? []), ...(slot.tools ?? [])
    ])
  ];
  const originalCopies = registeredSixty.filter(x => x === printing).length;
  const visibleCopies = outside.filter(x => x === printing).length;
  const mustStillExist = originalCopies - visibleCopies - owner.prizeCount;
  const conservationValid = visibleCopies <= originalCopies &&
    mustStillExist <= owner.deckCount;
  return {
    printing, originalCopies, visibleOutsideDeckCopies: visibleCopies,
    maxUnseenPrizedCopies: owner.prizeCount,
    physicallyConsistent: conservationValid,
    guaranteedDeckCopies: conservationValid
      ? Math.min(owner.deckCount, Math.max(0,
        originalCopies - visibleCopies - owner.prizeCount)) : 0,
    exactDeckOrPrizeIdentityConsulted: false,
    ownerVisibleOnly: true
  };
}

/**
 * Source-rank-11 count-specific proof of two searchable Darkness Energy,
 * with printed Letter physically held and no recorded generic Item lock.
 * Caller must independently authenticate owner identity and printed 60.
 * No action is selected; target, settlement and competing lines remain open.
 *
 * @param {object} view Owner-only observation.
 * @param {string[]} registeredSixty Authenticated source 60.
 * @returns {object|null} K0 target certificate or unresolved/null.
 */
function certifyRank11LetterTwoDarkness(view, registeredSixty) {
  assert.equal(view?.decisionKind, 'owner-root');
  assert.ok(Array.isArray(registeredSixty) &&
    registeredSixty.length === 60);
  if (registeredSixty.filter(x => x === DARKNESS).length !== 8 ||
    registeredSixty.filter(x => x === LETTER).length !== 4) return null;
  const handIndex = view.ownHand.indexOf(LETTER);
  const owner = view.ownPublic;
  if (handIndex < 0 || owner.deckCount < 2 ||
    view.ownTurnResources?.itemPlayLocked === true ||
    owner.publicTurnRestrictions?.itemPlayLocked === true) return null;
  const bound = ownPrintedDeckLowerBound(view, registeredSixty, DARKNESS);
  if (!bound.physicallyConsistent ||
    bound.guaranteedDeckCopies < 2) return null;

  return {
    version: VERSION, sourceInventoryAuthenticationRequired: true,
    searchPrinting: LETTER, handIndex, targetPrinting: DARKNESS,
    guaranteedTwoTargets: true, targetBound: bound,
    printedItemCost: 'no additional hand discard',
    ownerPublicItemLockSeen: false,
    certificateScope: 'two exact basic Energy targets and generic public gate',
    printedCardEffectsFullyAudited: false,
    targetPromptOrTransferSettled: false,
    nativeStoreActionAccepted: false,
    alternativeActionsCompared: false,
    strategicallyPreferred: false,
    competitiveGameQualified: false
  };
}

module.exports = {
  VERSION, LETTER, DARKNESS,
  ownPrintedDeckLowerBound, certifyRank11LetterTwoDarkness
};
