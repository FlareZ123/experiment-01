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

test('independent inclusion-exclusion validates strict opening count', () => {
  const fullEight = choose(56, 8) - choose(54, 8) - choose(52, 8) -
    choose(53, 8) + choose(50, 8) + choose(51, 8) +
    choose(49, 8) - choose(47, 8);
  const oranguruOnlyAsEighth = 2n * (choose(54, 7) -
    choose(50, 7) - choose(51, 7) + choose(47, 7));
  assert.equal(8n * fullEight - oranguruOnlyAsEighth, 361972450n);
  assert.equal(favorableOrderedOutcomes(true),
    8n * fullEight - oranguruOnlyAsEighth);
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

/**
 * Necessary raw eight-card locations for the simpler direct Boost Shake line:
 * held Boost Shake, any generic attachable Tool, and Trubbish or a Basic search
 * Item. The opening seven contains a Basic. This assumes unblocked Item plays
 * and disregards the legality/availability of Quick Ball's discard and the
 * searched Pokémon, so this is a card-location screen, not a playable line.
 * @param {boolean} requireOtherBasicInOpeningSeven
 * @param {boolean} [includeQuickBall] Whether to count the route NOT implemented in the existing direct policy.
 * @returns {bigint}
 */
function directBoostToolLocations(requireOtherBasicInOpeningSeven, includeQuickBall = true) {
  const raw = [copies('Trubbish'), basicCount - copies('Trubbish'),
    copies('Battle VIP Pass'), copies('Quick Ball'), copies('Boost Shake'),
    copies('Float Stone') + copies('Forest Seal Stone') + copies('Muscle Band')];
  raw.push(60 - raw.reduce((sum, n) => sum + n, 0));
  let favorable = 0n;

  /** @param {number} index @param {number} remaining @param {bigint} ways @param {number[]} seven */
  function accumulate(index, remaining, ways, seven) {
    if (index < raw.length - 1) {
      for (let drawn = 0; drawn <= Math.min(remaining, raw[index]); drawn++) {
        accumulate(index + 1, remaining - drawn,
          ways * choose(raw[index], drawn), [...seven, drawn]);
      }
      return;
    }
    if (remaining > raw[index]) return;
    const first = [...seven, remaining];
    if (first[0] + first[1] === 0 ||
        (requireOtherBasicInOpeningSeven && first[1] === 0)) return;
    const firstWays = ways * choose(raw[index], remaining);
    for (let i = 0; i < raw.length; i++) {
      const remainingCopies = raw[i] - first[i];
      if (remainingCopies === 0) continue;
      const eight = [...first];
      eight[i] += 1;
      if (eight[4] && eight[5] &&
          (eight[0] || eight[2] || (includeQuickBall && eight[3]))) {
        favorable += firstWays * BigInt(remainingCopies);
      }
    }
  }
  accumulate(0, 7, 1n, []);
  return favorable;
}

test('direct held-Boost, Tool and Trubbish access are wider raw locations', () => {
  assert.equal(directBoostToolLocations(false), 1422950438n);
  assert.equal(directBoostToolLocations(true), 1192975377n);
  assert.ok(Math.abs(probability(directBoostToolLocations(false), basicValid) -
    0.08940244761168846) < 1e-14);
  assert.ok(Math.abs(probability(directBoostToolLocations(true), basicValid) -
    0.07495336154798442) < 1e-14);
});

test('canonical direct policy omits only Quick-Ball-only raw access', () => {
  // The canonical bilateral runner already wraps rank11-direct-boostshake,
  // whose plain direct predicate handles hand Trubbish and VIP, not Quick Ball.
  assert.equal(directBoostToolLocations(false, false), 1070319020n);
  assert.equal(directBoostToolLocations(true, false), 840343959n);
  assert.equal(directBoostToolLocations(false, true) -
    directBoostToolLocations(false, false), 352631418n);
  assert.ok(Math.abs(probability(directBoostToolLocations(false, false), basicValid) -
    0.06724699438431442) < 1e-14);
  assert.ok(Math.abs(probability(directBoostToolLocations(true, false), basicValid) -
    0.052797908320610376) < 1e-14);
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
