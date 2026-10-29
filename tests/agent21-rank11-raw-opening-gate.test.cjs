'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const source = require('../results/aichi-2026/full-decklists.json');

const rank11 = source.decks.find(deck => deck.rank === 11);
assert.ok(rank11, 'Published Aichi rank-11 source must be present');

/** @param {string} name @returns {number} */
function copies(name) {
  return rank11.cards.filter(card => card.name === name)
    .reduce((count, card) => count + card.count, 0);
}

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= k; i++) {
    result = result * BigInt(n - k + i) / BigInt(i);
  }
  return result;
}

const basics = ['Mega Absol ex', 'Trubbish', 'Oranguru V',
  'Latias ex', 'Tapu Lele-GX', 'Crobat V', 'Squawkabilly ex'];
const basicCount = basics.reduce((count, name) => count + copies(name), 0);
const counts = [copies('Oranguru V'), copies('Battle VIP Pass'),
  copies('Float Stone'), copies('Forest Seal Stone') + copies('Boost Shake')];
counts.push(60 - counts.reduce((sum, n) => sum + n, 0));

/**
 * Exact count of ordered (opening-seven set, turn draw) outcomes. The opening
 * seven must contain Oranguru V so it could have started Active. The first
 * eight cards must include VIP and Float. The strict branch also rejects any
 * Forest Seal Stone or Boost Shake among those eight. This is a raw card-location
 * event only: there is no play sequencing, search, draw effect, or bot decision.
 * @param {boolean} rejectUsefulHeldCards
 * @returns {bigint}
 */
function favorableOrderedOutcomes(rejectUsefulHeldCards) {
  const [oranguru, vip, floatStone, excluded, other] = counts;
  let favorable = 0n;
  for (let o = 1; o <= oranguru; o++) {
    for (let v = 0; v <= vip; v++) {
      for (let f = 0; f <= floatStone; f++) {
        for (let b = 0; b <= excluded; b++) {
          const z = 7 - o - v - f - b;
          if (z < 0 || z > other) continue;
          const openingWays = choose(oranguru, o) * choose(vip, v) *
            choose(floatStone, f) * choose(excluded, b) *
            choose(other, z);
          const remaining = [oranguru - o, vip - v, floatStone - f,
            excluded - b, other - z];
          for (let next = 0; next < remaining.length; next++) {
            if (v + Number(next === 1) < 1 ||
                f + Number(next === 2) < 1 ||
                (rejectUsefulHeldCards && b + Number(next === 3) !== 0)) {
              continue;
            }
            favorable += openingWays * BigInt(remaining[next]);
          }
        }
      }
    }
  }
  return favorable;
}

const total = choose(60, 7) * 53n;
const basicValid = (choose(60, 7) - choose(60 - basicCount, 7)) * 53n;

/** @param {bigint} n @param {bigint} d @returns {number} */
function probability(n, d) {
  return Number(n) / Number(d);
}

test('source printing and 60-card partition are authenticated', () => {
  assert.equal(rank11.cards.reduce((sum, card) => sum + card.count, 0), 60);
  assert.deepEqual(counts, [2, 4, 3, 4, 47]);
  assert.equal(basicCount, 11);
});

test('exact direct eight-card gate conditions given a basic-valid opening seven', () => {
  const actual = probability(favorableOrderedOutcomes(true), basicValid);
  assert.ok(Math.abs(actual - 0.02274234023462136) < 1e-14, String(actual));
  assert.ok(Math.abs(probability(favorableOrderedOutcomes(true), total) -
    0.01768396295934967) < 1e-14);
});

test('holding Forest Seal Stone or Boost Shake removes direct v1 opportunities', () => {
  const strict = favorableOrderedOutcomes(true);
  const relaxed = favorableOrderedOutcomes(false);
  assert.ok(relaxed > strict);
  assert.ok(Math.abs(probability(relaxed, basicValid) -
    0.0338796479585307) < 1e-14);
  assert.ok(Math.abs(probability(relaxed - strict, basicValid) -
    0.01113730772390934) < 1e-14);
});

console.log(JSON.stringify({
  sourceRank: rank11.rank,
  categoryCounts: counts,
  basicCount,
  totalOrderedOpeningDraws: String(total),
  basicValidOpeningDraws: String(basicValid),
  strictRawEventCount: String(favorableOrderedOutcomes(true)),
  strictConditionalProbability: probability(favorableOrderedOutcomes(true), basicValid),
  relaxedConditionalProbability: probability(favorableOrderedOutcomes(false), basicValid)
}, null, 2));
