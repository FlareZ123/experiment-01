'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const SOURCE_RANK = 11;
const BASICS = new Set([
  'Mega Absol ex', 'Trubbish', 'Oranguru V', 'Latias ex',
  'Tapu Lele-GX', 'Crobat V', 'Squawkabilly ex'
]);
const KEY = Object.freeze([
  'Boost Shake', 'Tool', 'Trubbish', 'Battle VIP Pass',
  'Quick Ball', 'Garbodor', 'Other Basic', 'Other'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  const count = Math.min(k, n - k);
  for (let i = 1; i <= count; i++)
    result = result * BigInt(n - count + i) / BigInt(i);
  return result;
}

/**
 * Marginal first-eight appearance of a non-Basic card, conditioned on at
 * least one Basic in the initial seven. This ignores all added draw/search.
 * @param {number} copies
 * @param {number} basicCount
 * @param {number} independentDeals
 * @returns {object}
 */
function namedFirstEight(copies, basicCount, independentDeals) {
  assert.ok(Number.isSafeInteger(copies) && copies >= 0 &&
    Number.isSafeInteger(basicCount) && basicCount >= 1 &&
    Number.isSafeInteger(independentDeals) && independentDeals >= 1);
  assert.ok(copies + basicCount <= 60);
  const validSevenWays = choose(60, 7) - choose(60 - basicCount, 7);
  const avoidNamedSeven = choose(60 - copies, 7) -
    choose(60 - copies - basicCount, 7);
  const noNamedNumerator = avoidNamedSeven * BigInt(53 - copies);
  const denominator = validSevenWays * 53n;
  const noNamed = Number(noNamedNumerator) / Number(denominator);
  return {
    copies, basicCount,
    noNamedConditionalValidSeven: noNamed,
    namedConditionalValidSeven: 1 - noNamed,
    noNamedAcrossIndependentDeals: noNamed ** independentDeals,
    independentDeals
  };
}

/**
 * Assert exact source inventory and partition into disjoint card classes.
 * @param {object} document The pinned exact-printed Aichi source corpus.
 * @returns {number[]}
 */
function rank11Counts(document) {
  const deck = document.decks.find(row => row.rank === SOURCE_RANK);
  assert.ok(deck, 'Exact Aichi rank-11 source deck required');
  const byName = new Map(deck.cards.map(card => [card.name, card.count]));
  const total = deck.cards.reduce((s, card) => s + card.count, 0);
  assert.equal(total, 60);
  assert.equal(byName.get('Boost Shake'), 2);
  assert.equal(byName.get('Carmine'), 3);
  assert.equal(byName.get('Battle VIP Pass'), 4);
  assert.equal(byName.get('Quick Ball'), 4);
  assert.equal(byName.get('Trubbish'), 2);
  assert.equal(byName.get('Garbodor'), 2);
  const toolNames = ['Float Stone', 'Forest Seal Stone', 'Muscle Band'];
  const tools = toolNames.reduce((n, name) => n + (byName.get(name) ?? 0), 0);
  assert.equal(tools, 6);
  const basic = deck.cards
    .filter(card => BASICS.has(card.name))
    .reduce((n, card) => n + card.count, 0);
  assert.equal(basic, 11, 'Basic-stage source printing assumption changed');
  const known = 2 + tools + 2 + 4 + 4 + 2;
  return [2, tools, 2, 4, 4, 2, basic - 2, 60 - known - (basic - 2)];
}

/**
 * Enumerate an opening-seven sample, an ordinary first draw, then the
 * conditional six-Prize locations of required evolution targets.
 * Order of dealing Prize cards and the eighth card does not affect the
 * conditional uniform six-subset of the other 52 cards.
 *
 * Counts partition the exact printed 60 in KEY order.
 * @param {number[]} counts
 * @returns {object}
 */
function enumerate(counts) {
  assert.deepEqual(counts.length, KEY.length);
  assert.ok(counts.every(n => Number.isSafeInteger(n) && n >= 0));
  assert.equal(counts.reduce((a, b) => a + b), 60);
  const sevenDenom = choose(60, 7);
  const prizeDenom = choose(52, 6);
  const denominator = sevenDenom * 53n * prizeDenom;
  const picked = Array(counts.length).fill(0);
  let validSeven = 0n;
  let direct = 0n;
  let directLive = 0n;
  let quickBallPermissive = 0n;
  let quickBallLive = 0n;

  /** @param {number} index @param {number} remaining @param {bigint} ways */
  function walk(index, remaining, ways) {
    if (index === counts.length) {
      if (remaining !== 0) return;
      const validOpening = picked[2] + picked[6] > 0;
      if (!validOpening) return;
      validSeven += ways;
      for (let drawn = 0; drawn < counts.length; drawn++) {
        const remainingCopies = counts[drawn] - picked[drawn];
        if (!remainingCopies) continue;
        const hand = picked.slice();
        hand[drawn]++;
        const hasShakeAndTool = hand[0] > 0 && hand[1] > 0;
        const directAccess = hasShakeAndTool &&
          (hand[2] > 0 || hand[3] > 0);
        const permissiveAccess = hasShakeAndTool &&
          (hand[2] > 0 || hand[3] > 0 || hand[4] > 0);
        if (!permissiveAccess) continue;
        const weight = ways * BigInt(remainingCopies);
        if (directAccess) direct += weight * prizeDenom;
        quickBallPermissive += weight * prizeDenom;

        // For Boost Shake to evolve Trubbish, a Garbodor must still be
        // in the unprized deck. If Trubbish has not been drawn, VIP or
        // Quick Ball also needs a remaining unprized Trubbish.
        const remainingG = counts[5] - hand[5];
        const remainingT = counts[2] - hand[2];
        /** @param {number} k @returns {bigint} */
        const allPrized = k => choose(52 - k, 6 - k);
        let live = prizeDenom - allPrized(remainingG);
        if (hand[2] === 0) {
          live -= allPrized(remainingT);
          live += allPrized(remainingG + remainingT);
        }
        assert.ok(live >= 0n && live <= prizeDenom);
        if (directAccess) directLive += weight * live;
        quickBallLive += weight * live;
      }
      return;
    }
    const bound = Math.min(remaining, counts[index]);
    for (let n = 0; n <= bound; n++) {
      picked[index] = n;
      walk(index + 1, remaining - n, ways * choose(counts[index], n));
    }
    picked[index] = 0;
  }

  walk(0, 7, 1n);
  const validDenom = validSeven * 53n * prizeDenom;
  /** @param {bigint} a @param {bigint} b @returns {bigint} */
  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }
  /** @param {bigint} n @param {bigint} d */
  const proportion = (n, d) => {
    const divisor = gcd(n, d);
    return {
      numerator: (n / divisor).toString(),
      denominator: (d / divisor).toString(),
      decimal: Number(n) / Number(d)
    };
  };
  return {
    schema: 'aichi-rank11-direct-hand8-sourcefirst-v1',
    counts: Object.fromEntries(KEY.map((name, i) => [name, counts[i]])),
    validOpening: proportion(validSeven, sevenDenom),
    directUnconditional: proportion(direct, denominator),
    directConditionalValid: proportion(direct, validDenom),
    directLiveConditionalValid: proportion(directLive, validDenom),
    quickBallPermissiveConditionalValid: proportion(quickBallPermissive, validDenom),
    quickBallLiveConditionalValid: proportion(quickBallLive, validDenom),
    uniqueSourceFirstDealsInScout: 6,
    sourceFirstArmsInScout: 12,
    noDirectLiveInSixIndependentDealsModel:
      (1 - Number(directLive) / Number(validDenom)) ** 6
  };
}

if (require.main === module) {
  const corpus = require(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'));
  const result = enumerate(rank11Counts(corpus));
  result.carmineFirstEight = namedFirstEight(3, 11, 6);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = {SOURCE_RANK, BASICS, KEY, choose, namedFirstEight, rank11Counts, enumerate};
