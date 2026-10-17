'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { sourceTempleProfile, wobbuffetNaturalTurnTwo } =
  require('../scripts/aichi-temple-wobbuffet-thorns-t2.cjs');

/**
 * Brute-force every permutation of a tiny distinct-card deck. Opening three,
 * first ordinary draw, second ordinary draw; one otherwise-ordinary Basic B.
 * @param {string[]} cards
 * @param {number} start
 * @param {{accepted:number, favorable:number}} stats
 */
function enumerate(cards, start, stats) {
  if (start === cards.length) {
    const opening = cards.slice(0, 3);
    if (!opening.some(card => ['W', 'V', 'B'].includes(card[0]))) return;
    stats.accepted++;
    if (opening.includes('W') && cards.slice(0, 4).some(card => card[0] === 'V')
      && cards.slice(0, 5).some(card => card[0] === 'M')
      && cards.slice(0, 5).some(card => card[0] === 'E')) stats.favorable++;
    return;
  }
  for (let i = start; i < cards.length; i++) {
    [cards[i], cards[start]] = [cards[start], cards[i]];
    enumerate(cards, start + 1, stats);
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

test('independent physical permutation enumerator agrees on all legal openings', () => {
  const profile = {
    size: 8, opening: 3, wobbuffet: 1,
    v: 2, vmax: 1, psychic: 2, other: 2, basics: 4,
  };
  const cards = ['W', 'V1', 'V2', 'M', 'E1', 'E2', 'B', 'X'];
  const stats = { accepted: 0, favorable: 0 };
  enumerate(cards, 0, stats);
  assert.ok(stats.accepted > 0 && stats.favorable > 0);
  const exact = wobbuffetNaturalTurnTwo(profile);
  assert.ok(Math.abs(stats.favorable / stats.accepted - exact.percent / 100) < 1e-14);
});
