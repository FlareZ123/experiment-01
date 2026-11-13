'use strict';

const assert = require('node:assert/strict');

function countPrintings(printings, label) {
  assert.ok(Array.isArray(printings), label + ' must be an array');
  const counts = new Map();
  for (const printing of printings) {
    assert.ok(typeof printing === 'string' && printing.length > 0,
      label + ' contains an invalid printing');
    counts.set(printing, (counts.get(printing) || 0) + 1);
  }
  return counts;
}

function subtractCounts(pool, printings, label) {
  for (const [printing, count] of countPrintings(printings, label)) {
    const remaining = (pool.get(printing) || 0) - count;
    assert.ok(remaining >= 0,
      label + ' exceeds registered copies for ' + printing);
    if (remaining === 0) pool.delete(printing);
    else pool.set(printing, remaining);
  }
}

function expandCounts(counts) {
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([printing, count]) => Array(count).fill(printing));
}

function shuffle(values, random) {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/**
 * Sample one player's hidden hand/deck/Prize partition without inspecting
 * the engine's actual hidden card identities.
 *
 * The registered deck is an exact 60-card physical-printing multiset. Known
 * public cards, the actor's known hand, face-up/known Prize positions, K1
 * Prize membership, known deck prefixes, and known bottom-deck cards are
 * subtracted before sampling. Unknown cards are sampled uniformly without
 * replacement from the remaining multiset.
 *
 * @param {object} input
 * @param {string[]} input.registered60 Exact physical 60-card deck.
 * @param {string[]} input.knownPublic Public cards in play/discard/Lost Zone.
 * @param {string[]|null} input.knownHand Exact hand if visible to this actor.
 * @param {number} input.hiddenHandCount Number of concealed hand cards.
 * @param {number} input.deckCount Current deck size.
 * @param {{index:number,printing?:string|null}[]} input.prizeSlots Physical Prize slots.
 * @param {boolean} [input.exactPrizeMembership=false] Whether full Prize multiset is known.
 * @param {string[]} [input.knownPrizeCards=[]] Full known Prize multiset when exact.
 * @param {string[]} [input.knownTopDeck=[]] Verified ordered top-deck prefix.
 * @param {string[]} [input.knownBottomDeck=[]] Known bottom-deck multiset.
 * @param {boolean} [input.knownBottomDeckOrder=false] Whether bottom order is known.
 * @param {()=>number} input.random Uniform source in [0,1).
 * @returns {{hand:string[],deck:string[],prizes:{index:number,printing:string}[],
 *   audit:object}}
 */
function sampleHiddenPartition(input) {
  assert.ok(input && typeof input === 'object');
  assert.equal(typeof input.random, 'function');
  const registered = countPrintings(input.registered60, 'Registered 60');
  assert.equal(expandCounts(registered).length, 60,
    'Registered input must contain exactly 60 cards');
  assert.ok(Number.isSafeInteger(input.hiddenHandCount) && input.hiddenHandCount >= 0);
  assert.ok(Number.isSafeInteger(input.deckCount) && input.deckCount >= 0);
  assert.ok(Array.isArray(input.prizeSlots));
  const prizeSlots = input.prizeSlots.map(slot => {
    assert.ok(Number.isSafeInteger(slot.index) && slot.index >= 0);
    assert.ok(slot.printing === undefined || slot.printing === null ||
      (typeof slot.printing === 'string' && slot.printing.length > 0));
    return {index:slot.index,printing:slot.printing ?? null};
  });
  assert.equal(new Set(prizeSlots.map(slot => slot.index)).size, prizeSlots.length,
    'Prize slot indexes must be unique');
  const knownTopDeck = input.knownTopDeck ?? [];
  const knownBottomDeck = input.knownBottomDeck ?? [];
  const knownPrizeCards = input.knownPrizeCards ?? [];
  const knownPublic = input.knownPublic ?? [];
  const exactPrizeMembership = input.exactPrizeMembership === true;
  if (exactPrizeMembership) {
    assert.equal(knownPrizeCards.length, prizeSlots.length,
      'Exact Prize membership must identify every current Prize card');
  } else {
    assert.equal(knownPrizeCards.length, 0,
      'Partial Prize knowledge must use known prize slots, not a partial full-membership list');
  }
  assert.ok(knownTopDeck.length + knownBottomDeck.length <= input.deckCount,
    'Known deck cards exceed current deck size');

  const pool = new Map(registered);
  subtractCounts(pool, knownPublic, 'Known public zones');
  const knownHand = input.knownHand;
  const visibleHand = knownHand === null || knownHand === undefined ? [] : knownHand;
  subtractCounts(pool, visibleHand, 'Known hand');

  const knownPrizeByIndex = new Map();
  if (exactPrizeMembership) {
    subtractCounts(pool, knownPrizeCards, 'Known Prize membership');
    const membership = countPrintings(knownPrizeCards, 'Known Prize membership');
    for (const slot of prizeSlots) {
      if (slot.printing !== null) {
        const remaining = (membership.get(slot.printing) || 0) - 1;
        assert.ok(remaining >= 0,
          'Known Prize slot is absent from exact Prize membership');
        if (remaining === 0) membership.delete(slot.printing);
        else membership.set(slot.printing, remaining);
        knownPrizeByIndex.set(slot.index, slot.printing);
      }
    }
    const unlocated = expandCounts(membership);
    const unlocatedSlots = prizeSlots.filter(slot => slot.printing === null);
    assert.equal(unlocated.length, unlocatedSlots.length,
      'Exact Prize membership does not fit unobserved Prize positions');
    const placed = shuffle(unlocated, input.random);
    unlocatedSlots.forEach((slot, i) => knownPrizeByIndex.set(slot.index, placed[i]));
  } else {
    const faceUp = prizeSlots.filter(slot => slot.printing !== null);
    subtractCounts(pool, faceUp.map(slot => slot.printing), 'Known Prize slots');
    for (const slot of faceUp) knownPrizeByIndex.set(slot.index, slot.printing);
  }

  subtractCounts(pool, knownTopDeck, 'Known top-deck prefix');
  subtractCounts(pool, knownBottomDeck, 'Known bottom-deck cards');

  const knownHandCount = visibleHand.length;
  const hiddenPrizeCount = prizeSlots.length - knownPrizeByIndex.size;
  const unknownDeckCount = input.deckCount - knownTopDeck.length - knownBottomDeck.length;
  const unknownHandCount = input.hiddenHandCount;
  const expectedUnknown = unknownHandCount + hiddenPrizeCount + unknownDeckCount;
  const unseen = expandCounts(pool);
  assert.equal(unseen.length, expectedUnknown,
    'Registered 60, known cards and hidden-zone counts do not reconcile');

  const sampled = shuffle(unseen, input.random);
  let cursor = 0;
  const hiddenHand = sampled.slice(cursor, cursor += unknownHandCount);
  const hand = [...visibleHand, ...hiddenHand];
  if (input.canonicalHandOrder === true) hand.sort((a,b) => a.localeCompare(b));
  const hiddenPrizeCardsSampled = sampled.slice(cursor, cursor += hiddenPrizeCount);
  const unknownDeck = sampled.slice(cursor, cursor += unknownDeckCount);
  assert.equal(cursor, sampled.length);

  const hiddenPrizeSlots = prizeSlots.filter(slot => !knownPrizeByIndex.has(slot.index));
  const prizes = prizeSlots.map(slot => ({
    index:slot.index,
    printing:knownPrizeByIndex.has(slot.index) ?
      knownPrizeByIndex.get(slot.index) : null
  }));
  hiddenPrizeSlots.forEach((slot, i) => {
    prizes.find(prize => prize.index === slot.index).printing = hiddenPrizeCardsSampled[i];
  });

  const bottom = input.knownBottomDeckOrder === true ?
    knownBottomDeck.slice() : shuffle(knownBottomDeck, input.random);
  const deck = [...knownTopDeck, ...unknownDeck, ...bottom];
  assert.equal(deck.length, input.deckCount);
  assert.equal(hand.length, knownHandCount + unknownHandCount);
  assert.equal(prizes.length, prizeSlots.length);

  return {
    hand,deck,prizes:prizes.map(({index,printing})=>({index,printing})),
    audit:{
      protocol:'registered-60-observation-consistent-hidden-partition-v1',
      registeredCount:60,
      knownPublicCount:knownPublic.length,
      knownHandCount,
      hiddenHandCount:unknownHandCount,
      knownPrizeCount:knownPrizeByIndex.size,
      hiddenPrizeCount,
      knownTopDeckCount:knownTopDeck.length,
      knownBottomDeckCount:knownBottomDeck.length,
      unknownDeckCount,
      exactPrizeMembership,
      unknownPoolCount:unseen.length
    }
  };
}

/**
 * Select a plausible hidden opponent deck from a public decklist prior.
 * Every observed opponent card must be present in the selected 60; the exact
 * opponent identity is not supplied to the sampler.
 *
 * @param {{id:string,cards:string[],weight?:number}[]} prior
 * @param {string[]} observedPublicCards
 * @param {()=>number} random
 * @returns {{id:string,cards:string[],weight:number}}
 */
function sampleDecklistPrior(prior, observedPublicCards, random) {
  assert.ok(Array.isArray(prior) && prior.length > 0);
  assert.equal(typeof random, 'function');
  const observed = countPrintings(observedPublicCards, 'Observed opponent public cards');
  const eligible = prior.filter(entry => {
    if (!entry || typeof entry.id !== 'string' || !Array.isArray(entry.cards) ||
        entry.cards.length !== 60) return false;
    const counts = countPrintings(entry.cards, 'Prior decklist');
    for (const [printing, copies] of observed) {
      if ((counts.get(printing) || 0) < copies) return false;
    }
    return true;
  }).map(entry => ({
    id:entry.id,cards:entry.cards.slice(),weight:entry.weight ?? 1
  }));
  for (const entry of eligible) {
    assert.ok(Number.isFinite(entry.weight) && entry.weight > 0,
      'Eligible decklist prior weights must be finite and positive');
  }
  assert.ok(eligible.length > 0,
    'No opponent decklist prior contains all observed public printings');
  const total = eligible.reduce((sum, entry) => sum + entry.weight, 0);
  let draw = random() * total;
  for (const entry of eligible) {
    draw -= entry.weight;
    if (draw < 0) return entry;
  }
  return eligible[eligible.length - 1];
}

module.exports = {sampleHiddenPartition,sampleDecklistPrior};
