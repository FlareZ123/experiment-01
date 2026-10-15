'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {targetAccess} = require('../scripts/aichi_bonus_draws.cjs');

/** @returns {() => number} Independent reproducible RNG. */
function randomSource() {
  let state = 20261015;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * Physically simulate a separately shuffled sixty-card deck.
 * @param {() => number} random
 * @returns {number[]}
 */
function shuffledDeck(random) {
  const deck = Array.from({length: 60}, (_, index) => index);
  for (let i = 59; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

test('200,000 independent full-shuffle setups reproduce closed-form Iron Thorns bonuses', () => {
  const random = randomSource();
  const trials = 200000;
  let anyOffer = 0;
  let threeOffers = 0;
  let targetSeen = 0;
  let offeredTotal = 0;
  let doubleMulligans = 0;

  for (let trial = 0; trial < trials; trial += 1) {
    let acceptedA = false;
    let acceptedB = false;
    let candidate = [];
    let offers = 0;
    while (!acceptedA || !acceptedB) {
      if (!acceptedA) {
        const handA = shuffledDeck(random).slice(0, 7);
        acceptedA = handA.some(card => card < 4); // Four Iron Thorns ex.
      }
      if (!acceptedB) {
        candidate = shuffledDeck(random);
        acceptedB = candidate.slice(0, 7).some(card => card < 14);
      }
      if (!acceptedA && acceptedB) offers += 1;
      if (!acceptedA && !acceptedB) doubleMulligans += 1;
    }

    // Three Shadow Rider V are cards 0,1,2 among B's 14 Basics.
    // Prizes occupy shuffled positions 7..12 and stay unobserved.
    const targetInOpening = candidate.slice(0, 7).some(card => card < 3);
    const bonusCards = candidate.slice(13, 13 + Math.min(offers, 47));
    if (targetInOpening || bonusCards.some(card => card < 3)) targetSeen += 1;
    if (offers >= 1) anyOffer += 1;
    if (offers >= 3) threeOffers += 1;
    offeredTotal += offers;
  }

  const empirical = {
    trials,
    anyOffer: anyOffer / trials,
    threeOffers: threeOffers / trials,
    meanOffers: offeredTotal / trials,
    targetSeen: targetSeen / trials,
    doubleMulligans,
  };
  const exact = targetAccess(4, 14, 3);
  console.log('Independent shuffled-deck setup check:', JSON.stringify(empirical));
  assert.ok(Math.abs(empirical.anyOffer - exact.bonusOne) < 0.006);
  assert.ok(Math.abs(empirical.threeOffers - exact.bonusThree) < 0.006);
  assert.ok(Math.abs(empirical.meanOffers - exact.expectedOffers) < 0.025);
  assert.ok(Math.abs(empirical.targetSeen - exact.withAllBonuses) < 0.006);
  assert.ok(doubleMulligans > 0, 'The simulator must encounter joint mulligans.');
});
