'use strict';

const assert = require('node:assert/strict');

/**
 * Derive the K0 draw-card mixture using only an actorObservation projection
 * and the player's own registered exact-printing 60. The projection itself
 * must come from actor-observation-contract.cjs, which never reads physical
 * deck or face-down Prize identities.
 *
 * All currently unlocated own cards are exchangeable between deck and Prize
 * slots only if the caller has established that the next-card order is
 * unknown and uniformly randomized. Top-deck reveal or stacking effects,
 * recalled K1 membership, and non-random ordering invalidate this premise.
 * This is a statistical prior, not a legal-action oracle or a full policy.
 *
 * @param {object} observation Detached actorObservation result.
 * @param {{printing:string,copies:number}[]} registered60 Source-owned 60.
 * @param {{assumeFullyExchangeableUnseenCards:true}} assumptions Explicit premise.
 * @returns {{knowledge:'K0',unknownTotal:number,deckCount:number,
 *   prizeCount:number,drawAvailable:boolean,
 *   distribution:{printing:string,copies:number,numerator:number,denominator:number}[]}}
 */
function ownerK0NextDrawBelief(observation, registered60, assumptions) {
  assert.equal(assumptions?.assumeFullyExchangeableUnseenCards, true,
    'Requires evidence that unseen deck and Prize identities are exchangeable');
  assert.ok(observation && observation.ownPublic &&
    Array.isArray(observation.ownHand));
  assert.ok(observation.ownerK1 === null ||
    observation.ownerK1?.exactMembershipKnown === false,
    'A K1 owner needs a separate provenance-checked deck-membership model');
  const history=assumptions?.ownerKnowledgeEpoch;
  assert.ok(history && history.exactMembership===false &&
    ['liveSearches','fullPrizeReviews','hiddenPrizeRedeals'].every(key=>
      Number.isSafeInteger(history[key])&&history[key]===0),
    'Requires authenticated owner K0 search/Prize epoch');
  assert.ok(Array.isArray(registered60));

  const counts = new Map();
  let registeredCount = 0;
  for (const entry of registered60) {
    assert.ok(typeof entry.printing === 'string' && entry.printing.length > 0);
    assert.ok(Number.isSafeInteger(entry.copies) && entry.copies > 0);
    counts.set(entry.printing, (counts.get(entry.printing) || 0) + entry.copies);
    registeredCount += entry.copies;
  }
  assert.equal(registeredCount, 60,
    'Registered input must contain exactly 60 physical cards');

  const pub = observation.ownPublic;
  const zones = [observation.ownHand, pub.stadium, pub.discard,
    pub.lostZone, pub.resolvingSupporter];
  for (const slot of [pub.active, ...(pub.bench || [])]) {
    if (slot !== null) {
      zones.push(slot.evolutionPrintings, slot.tools);
    }
  }
  for (const zone of zones) {
    assert.ok(Array.isArray(zone), 'Missing public exact-printing card zone');
    for (const printing of zone) {
      assert.ok(counts.has(printing),
        `Observed own printing is absent from registered 60: ${printing}`);
      const remaining = counts.get(printing) - 1;
      assert.ok(remaining >= 0,
        `Observed more copies than registered 60: ${printing}`);
      counts.set(printing, remaining);
    }
  }

  assert.ok(Number.isSafeInteger(pub.deckCount) && pub.deckCount >= 0);
  assert.ok(Number.isSafeInteger(pub.prizeCount) && pub.prizeCount >= 0);
  const unknownTotal = [...counts.values()].reduce((a,b) => a + b, 0);
  assert.equal(unknownTotal, pub.deckCount + pub.prizeCount,
    'Owner visibility and registered 60 do not account for every card');

  const distribution = [...counts.entries()]
    .filter(([,copies]) => copies > 0)
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([printing,copies]) => ({printing,copies,
      numerator: pub.deckCount > 0 ? copies : 0,
      denominator: pub.deckCount > 0 ? unknownTotal : 1}));

  return {
    knowledge:'K0',unknownTotal,deckCount:pub.deckCount,
    prizeCount:pub.prizeCount,drawAvailable:pub.deckCount > 0,
    distribution
  };
}

module.exports = {ownerK0NextDrawBelief};
