'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SOURCE = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
const CATEGORY_NAMES = Object.freeze([
  'Boost Shake', 'Float Stone', 'Muscle Band', 'Forest Seal Stone',
  'Trubbish', 'Garbodor', 'Battle VIP Pass', 'Other Basic', 'Other'
]);
const BASIC_NAMES = Object.freeze([
  'Mega Absol ex', 'Trubbish', 'Oranguru V', 'Latias ex',
  'Tapu Lele-GX', 'Crobat V', 'Squawkabilly ex'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) {
    throw new TypeError('Nonnegative integer n and integer k required.');
  }
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= k; i++) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/** @returns {number[]} Frozen published rank-11 inventory category counts. */
function sourceCategories() {
  const source = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const deck = source.decks.find(item => item.rank === 11);
  assert.ok(deck, 'Exact published rank-11 source must exist.');
  assert.equal(deck.cards.reduce((total, row) => total + row.count, 0), 60);
  const named = name => deck.cards.filter(row => row.name === name)
    .reduce((total, row) => total + row.count, 0);
  const basics = BASIC_NAMES.reduce((total, name) => total + named(name), 0);
  const categories = [
    named('Boost Shake'), named('Float Stone'), named('Muscle Band'),
    named('Forest Seal Stone'), named('Trubbish'), named('Garbodor'),
    named('Battle VIP Pass'), basics - named('Trubbish')
  ];
  categories.push(60 - categories.reduce((sum, count) => sum + count, 0));
  assert.deepEqual(categories, [2, 3, 1, 2, 2, 2, 4, 9, 35],
    'Source printing/count or Basic roster changed; re-evaluate the model.');
  return categories;
}

/**
 * Exhaustive, exact count of physical H7, first normal draw and six Prize
 * configurations. The first draw can be another Basic. Every prospective
 * Garbodor must remain in the searchable, unprized deck.
 *
 * @returns {{categories: readonly string[], counts: number[], denominator: bigint,
 *   events: Record<string,bigint>}}
 */
function census() {
  const counts = sourceCategories();
  const events = {
    any: 0n, float: 0n, floatAndMuscle: 0n, noFloatMuscle: 0n,
    noFloatNoMuscleSeal: 0n, otherBasicDraw: 0n
  };
  const denominator = (choose(60, 7) - choose(49, 7))
    * 53n * choose(52, 6);

  /** @param {number} index @param {number} remaining @param {number[]} hand
   * @param {bigint} handWays */
  function walk(index, remaining, hand, handWays) {
    if (index === counts.length) {
      if (remaining !== 0 || hand[4] !== 1 || hand[7] !== 0 ||
          hand[6] !== 0) return;
      for (let draw = 0; draw < counts.length; draw++) {
        const available = counts[draw] - hand[draw];
        if (available <= 0) continue;
        const h8 = hand.slice();
        h8[draw]++;
        if (h8[4] !== 1 || h8[6] !== 0 || h8[0] === 0 ||
            h8[1] + h8[2] + h8[3] === 0) continue;
        const searchableGarbodor = counts[5] - h8[5];
        if (searchableGarbodor <= 0) continue;
        const successfulPrizes = choose(52, 6)
          - choose(52 - searchableGarbodor, 6 - searchableGarbodor);
        const worlds = handWays * BigInt(available) * successfulPrizes;
        events.any += worlds;
        if (h8[1] > 0) {
          events.float += worlds;
          if (h8[2] > 0) events.floatAndMuscle += worlds;
        } else if (h8[2] > 0) {
          events.noFloatMuscle += worlds;
        } else {
          events.noFloatNoMuscleSeal += worlds;
        }
        if (draw === 7) events.otherBasicDraw += worlds;
      }
      return;
    }
    for (let take = 0; take <= Math.min(remaining, counts[index]); take++) {
      hand.push(take);
      walk(index + 1, remaining - take, hand,
        handWays * choose(counts[index], take));
      hand.pop();
    }
  }
  walk(0, 7, [], 1n);
  assert.equal(events.any,
    events.float + events.noFloatMuscle + events.noFloatNoMuscleSeal);
  return {categories: CATEGORY_NAMES, counts, denominator, events};
}

/** @param {bigint} count @param {bigint} denominator @returns {number} */
function percent(count, denominator) {
  return Number(count) / Number(denominator) * 100;
}

if (require.main === module) {
  const result = census();
  console.log(JSON.stringify({
    source: 'published Aichi 2026 rank11 exact source 60',
    categories: result.categories, counts: result.counts,
    validWorlds: result.denominator.toString(),
    events: Object.fromEntries(Object.entries(result.events)
      .map(([name, count]) => [name, {
        numerator: count.toString(),
        conditionalPct: percent(count, result.denominator)
      }])),
    claim: 'Combinatorial setup only; zero qualified games.'
  }, null, 2));
}

module.exports = {choose, sourceCategories, census, percent};
