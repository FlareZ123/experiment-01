'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { sourceTempleProfile, wobbuffetNaturalTurnTwo, weightedVersusOpponent } =
  require('../scripts/aichi-temple-wobbuffet-thorns-t2.cjs');

/**
 * Brute-force every permutation of a tiny distinct-card deck. Opening three,
 * first ordinary draw, second ordinary draw; one otherwise-ordinary Basic B.
 * @param {string[]} cards
 * @param {number} start
 * @param {{accepted:number, favorable:number}} stats
 */
function enumerate(cards, start, stats, bonusDraws = 0) {
  if (start === cards.length) {
    const opening = cards.slice(0, 3);
    if (!opening.some(card => ['W', 'V', 'B'].includes(card[0]))) return;
    stats.accepted++;
    const t1End = 4 + bonusDraws;
    const t2End = t1End + 1;
    if (opening.includes('W') && cards.slice(0, t1End).some(card => card[0] === 'V')
      && cards.slice(0, t2End).some(card => card[0] === 'M')
      && cards.slice(0, t2End).some(card => card[0] === 'E')) stats.favorable++;
    return;
  }
  for (let i = start; i < cards.length; i++) {
    [cards[i], cards[start]] = [cards[start], cards[i]];
    enumerate(cards, start + 1, stats, bonusDraws);
    [cards[i], cards[start]] = [cards[start], cards[i]];
  }
}

test('source-locked 60 and exact Wobbuffet plus VMAX plus Energy opportunity', () => {
  const p = wobbuffetNaturalTurnTwo(sourceTempleProfile());
  assert.equal(p.fraction, '286599649/21348182700');
  assert.ok(Math.abs(p.percent - 1.3425013877176535) < 1e-12);
  assert.ok(Math.abs(p.wobbuffetOpeningPercent - 13.22003079) < 1e-8);
  assert.ok(Math.abs(p.withoutPsychicPercent - 1.772893330932737) < 1e-12);
});

test('source-locked bonus fractions and four-Basic opponent weighting', () => {
  const p = sourceTempleProfile();
  assert.equal(wobbuffetNaturalTurnTwo(p, 1).fraction, '9780146453/544378658850');
  assert.equal(wobbuffetNaturalTurnTwo(p, 2).fraction, '2661471589/116320226250');
  const weighted = weightedVersusOpponent(4, p);
  assert.ok(Math.abs(weighted.percent - 2.0410636107853466) < 1e-11);
  assert.ok(weighted.atLeastOneBonusOffer > 0.56 && weighted.atLeastOneBonusOffer < 0.58);
  assert.throws(() => wobbuffetNaturalTurnTwo(p, 46), assert.AssertionError);
});

test('independent physical permutation enumerator agrees on all legal openings', () => {
  const profile = {
    size: 8, opening: 3, wobbuffet: 1,
    v: 2, vmax: 1, psychic: 2, other: 2, basics: 4,
  };
  const cards = ['W', 'V1', 'V2', 'M', 'E1', 'E2', 'B', 'X'];
  for (const bonusDraws of [0, 1, 2]) {
    const stats = { accepted: 0, favorable: 0 };
    enumerate(cards, 0, stats, bonusDraws);
    assert.ok(stats.accepted > 0 && stats.favorable > 0);
    const exact = wobbuffetNaturalTurnTwo(profile, bonusDraws);
    assert.ok(Math.abs(stats.favorable / stats.accepted - exact.percent / 100) < 1e-14);
  }
});
