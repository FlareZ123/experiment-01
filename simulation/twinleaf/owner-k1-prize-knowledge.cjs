'use strict';

const assert = require('node:assert/strict');
const {actorObservation} = require('./actor-observation-contract.cjs');

/** @param {string[]} cards @returns {Map<string,number>} */
function countPrintings(cards) {
  const counts = new Map();
  for (const name of cards) {
    assert.equal(typeof name, 'string');
    assert.ok(name.length > 0);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return counts;
}

/** @param {Map<string,number>} counts */
function sortedCounts(counts) {
  return [...counts].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([printing, copies]) => Object.freeze({printing, copies}));
}

/**
 * Complete owner-known zones at the instant of an authenticated deck search.
 * All listed cards are in the acting player's own hand or face-up public zones.
 * The actor's evolutionPrintings represents the entire native Pokémon stack,
 * including attached Energy. The separate energies array projects some of the
 * same physical cards and must never be counted twice. Tools are separate.
 * @param {object} ownerView Frozen detached actor observation.
 * @returns {string[]}
 */
function knownOutsideDeck(ownerView) {
  const own = ownerView.ownPublic;
  const cards = [
    ...ownerView.ownHand, ...own.stadium, ...own.discard,
    ...own.lostZone, ...own.resolvingSupporter
  ];
  for (const pokemon of [own.active, ...own.bench]) {
    if (pokemon === null) continue;
    // PokémonCardList.cards (evolutionPrintings) already includes Energy.
    // Unlike the gameplay Energy projection, this counts physical cards.
    cards.push(...pokemon.evolutionPrintings, ...pokemon.tools);
  }
  return cards;
}

/**
 * Obtain an owner-authorized deck observation. This function is the sole
 * boundary permitted to access a native deck identity; it checks exact live
 * prompt ownership and zone reference before reading deck.cards.
 * No face-down Prize or opponent concealed card is accessed.
 * @param {object} state Real native Store state.
 * @param {0|1} ownerSeat Acting physical seat.
 * @param {string[]} registeredPrintings Original 60 card printings.
 * @param {object|null} [previous] Previously obtained owner K1 snapshot.
 * @param {Function} [observe] Pure fixture seam; production uses actorObservation.
 * @returns {object}
 */
function captureOwnerK1(state, ownerSeat, registeredPrintings,
  previous = null, observe = actorObservation) {
  assert.ok(ownerSeat === 0 || ownerSeat === 1);
  assert.equal(registeredPrintings.length, 60);
  const owner = state.players[ownerSeat];
  const prompt = state.prompts.find(p => p.result === undefined);
  assert.ok(prompt?.constructor?.name === 'ChooseCardsPrompt' &&
    prompt.playerId === owner.id && prompt.cards === owner.deck,
    'K1 requires an actual current owner-deck ChooseCardsPrompt');
  const detachedActorView = observe(state, ownerSeat);
  assert.equal(detachedActorView.actorSeat, ownerSeat);
  assert.equal(detachedActorView.decisionKind, 'owner-prompt');
  assert.equal(detachedActorView.pendingOwnerDeckSearch, true);
  assert.equal(detachedActorView.ownPublic.prizeCount,
    owner.prizes.reduce((n, group) => n + group.cards.length, 0));

  const deck = countPrintings(prompt.cards.cards.map(c => c.fullName));
  const outside = countPrintings(knownOutsideDeck(detachedActorView));
  const registered = countPrintings(registeredPrintings);
  const unaccounted = new Map();
  for (const [name, copies] of registered) {
    const hidden = copies - (deck.get(name) ?? 0) - (outside.get(name) ?? 0);
    assert.ok(hidden >= 0,
      'Own known zones must not exceed original registered printing count');
    if (hidden > 0) unaccounted.set(name, hidden);
  }
  const unaccountedTotal = [...unaccounted.values()]
    .reduce((sum, n) => sum + n, 0);
  const prizedCertified = unaccountedTotal ===
    detachedActorView.ownPublic.prizeCount;
  return Object.freeze({
    ownerSeat, epoch: (previous?.epoch ?? 0) + 1,
    exactMembershipKnown: true, deckMembershipStale: false,
    registeredPrintings: Object.freeze(sortedCounts(registered)),
    knownPrintings: Object.freeze(sortedCounts(deck)),
    knownPrized: prizedCertified ? Object.freeze(sortedCounts(unaccounted)) : null,
    prizeInferenceCertified: prizedCertified,
    observedOwnPrizeCount: detachedActorView.ownPublic.prizeCount,
    observedAt: Object.freeze({turn: state.turn, promptId: String(prompt.id)}),
    unaccountedTotal, invalidationReason: null
  });
}

/**
 * Conservatively update retained owner knowledge after a real Store change.
 * A deck movement invalidates last-known deck membership. A Prize-zone change
 * also invalidates previously inferred Prize identities; a fresh owner search
 * can restore information without ever inspecting hidden Prize contents.
 * @param {object} snapshot Prior authenticated K1.
 * @param {{currentOwnPrizeCount:number,deckMayHaveChanged:boolean,
 *   prizeCompositionMayHaveChanged:boolean}} transition
 * @returns {object}
 */
function advanceOwnerK1(snapshot, transition) {
  assert.equal(typeof transition.deckMayHaveChanged, 'boolean');
  assert.equal(typeof transition.prizeCompositionMayHaveChanged, 'boolean');
  assert.ok(Number.isSafeInteger(transition.currentOwnPrizeCount) &&
    transition.currentOwnPrizeCount >= 0 &&
    transition.currentOwnPrizeCount <= 6);
  const prizesChanged = transition.currentOwnPrizeCount !==
    snapshot.observedOwnPrizeCount ||
    transition.prizeCompositionMayHaveChanged === true;
  if (!prizesChanged && !transition.deckMayHaveChanged) return snapshot;
  const deckStale = snapshot.deckMembershipStale ||
    transition.deckMayHaveChanged || prizesChanged;
  return Object.freeze({
    ...snapshot, epoch: snapshot.epoch + 1,
    deckMembershipStale: deckStale,
    exactMembershipKnown: !deckStale,
    knownPrized: prizesChanged ? null : snapshot.knownPrized,
    prizeInferenceCertified: prizesChanged ? false :
      snapshot.prizeInferenceCertified,
    observedOwnPrizeCount: transition.currentOwnPrizeCount,
    invalidationReason: prizesChanged ? 'own-prizes-changed' :
      'own-deck-may-have-changed'
  });
}

/**
 * Create a host-only, fail-closed witness that the owner's *physical Prize
 * multiset* has remained unchanged across Store mutations. The witness never
 * reads Prize card names, card IDs, deck order, or opponent concealed zones.
 * Only the exact original State object and the original Prize-card object
 * references may satisfy it; detached/redeterminized states are not admitted.
 *
 * Store this capability solely in the trusted host adapter. Do not serialize
 * it or expose native handles to actor observations/worker decisions.
 *
 * If the pinned Store re-creates Prize Card objects, this witness safely
 * declines to certify continuity. It does not assume face identity can change
 * in place on an existing Card object without a physical Prize-zone mutation.
 *
 * @param {object} state Native current Store State, not a sampled clone.
 * @param {0|1} ownerSeat Owner's fixed physical seat.
 * @returns {{unchanged:(state:object)=>boolean}|null} Opaque custody proof.
 */
function createOwnerPrizeCompositionGuard(state, ownerSeat) {
  assert.ok(ownerSeat === 0 || ownerSeat === 1, 'Invalid owner seat');
  assert.ok(state?.players?.length === 2, 'A two-seat native State is required');
  const owner = state.players[ownerSeat];
  const collect = () => {
    if (!Array.isArray(owner?.prizes)) return null;
    const cards = [];
    for (const slot of owner.prizes) {
      if (!Array.isArray(slot?.cards) || slot.cards.length > 1) return null;
      for (const card of slot.cards) {
        if (card === null || typeof card !== 'object') return null;
        cards.push(card);
      }
    }
    if (new Set(cards).size !== cards.length) return null;
    return cards;
  };
  let original;
  try { original = collect(); } catch { return null; }
  if (original === null) return null;
  const originalRefs = new Set(original);
  return Object.freeze({
    unchanged(nextState) {
      if (nextState !== state || nextState.players[ownerSeat] !== owner)
        return false;
      let current;
      try { current = collect(); } catch { return false; }
      return current !== null && current.length === originalRefs.size &&
        current.every(card => originalRefs.has(card));
    }
  });
}

/**
 * Refuse an unreachable deck-search line when the actor legitimately knows
 * that every registered copy of its required printing was Prized.
 * Otherwise remain conservative about draws, recovery and search costs.
 * @param {object|null} snapshot K0 null or authenticated K1.
 * @param {string} target Exact registered printing.
 * @returns {'known-prized'|'unknown'}
 */
function assessRequiredDeckPrinting(snapshot, target) {
  if (!snapshot?.prizeInferenceCertified || snapshot.knownPrized === null)
    return 'unknown';
  const registered = snapshot.registeredPrintings.find(x => x.printing === target)?.copies ?? 0;
  const knownPrized = snapshot.knownPrized.find(x => x.printing === target)?.copies ?? 0;
  return registered > 0 && knownPrized === registered ?
    'known-prized' : 'unknown';
}

module.exports = {
  countPrintings, knownOutsideDeck, captureOwnerK1,
  advanceOwnerK1, assessRequiredDeckPrinting,
  createOwnerPrizeCompositionGuard
};
