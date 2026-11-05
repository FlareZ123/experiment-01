'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const r = Math.min(k, n - k);
  let out = 1n;
  for (let j = 1; j <= r; j += 1) {
    out = (out * BigInt(n - r + j)) / BigInt(j);
  }
  return out;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a;
}

/**
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {{numerator: bigint, denominator: bigint}}
 */
function fraction(numerator, denominator) {
  assert(denominator > 0n, 'positive denominator required');
  const d = gcd(numerator, denominator);
  return { numerator: numerator / d, denominator: denominator / d };
}

/**
 * Exact physical-card location count. Cards are partitioned into five disjoint
 * categories: Iron Thorns, Speed Lightning, DCE, Guzma and all other printings.
 * firstWindowSize is opening hand plus the first normal draw; laterWindowSize
 * includes the next turn's normal draw and any Speed-triggered extra draws.
 *
 * The event is: >=2 Thorns and >=1 Speed in the first window, plus >=1 DCE
 * and >=1 Guzma somewhere in both windows. When firstWindowSize is exactly
 * openingSize+1, >=2 early Thorns implies a valid Basic in the opening hand.
 *
 * @param {{thorns: number, speed: number, dce: number, guzma: number, other: number}} counts
 * @param {number} openingSize
 * @param {number} firstWindowSize
 * @param {number} laterWindowSize
 * @returns {{favorableWays: bigint, allWays: bigint,
 *   unconditional: {numerator: bigint, denominator: bigint},
 *   conditionalValidOpening: {numerator: bigint, denominator: bigint}}}
 */
function exactAccess(counts, openingSize, firstWindowSize, laterWindowSize) {
  const values = [counts.thorns, counts.speed, counts.dce, counts.guzma, counts.other];
  assert(values.every(n => Number.isSafeInteger(n) && n >= 0));
  const total = values.reduce((a, b) => a + b, 0);
  assert(firstWindowSize === openingSize + 1);
  assert(openingSize >= 1 && laterWindowSize >= 0 && total >= firstWindowSize + laterWindowSize);
  const allWays = choose(total, firstWindowSize) * choose(total - firstWindowSize, laterWindowSize);
  let favorableWays = 0n;

  for (let t = 2; t <= Math.min(counts.thorns, firstWindowSize); t += 1) {
    for (let s = 1; s <= Math.min(counts.speed, firstWindowSize - t); s += 1) {
      for (let d = 0; d <= Math.min(counts.dce, firstWindowSize - t - s); d += 1) {
        for (let g = 0; g <= Math.min(counts.guzma, firstWindowSize - t - s - d); g += 1) {
          const o = firstWindowSize - t - s - d - g;
          if (o < 0 || o > counts.other) continue;
          const firstWays = choose(counts.thorns, t) * choose(counts.speed, s) *
            choose(counts.dce, d) * choose(counts.guzma, g) * choose(counts.other, o);
          const remaining = [counts.thorns - t, counts.speed - s,
            counts.dce - d, counts.guzma - g, counts.other - o];

          for (let tt = 0; tt <= Math.min(remaining[0], laterWindowSize); tt += 1) {
            for (let ss = 0; ss <= Math.min(remaining[1], laterWindowSize - tt); ss += 1) {
              for (let dd = 0; dd <= Math.min(remaining[2], laterWindowSize - tt - ss); dd += 1) {
                for (let gg = 0; gg <= Math.min(remaining[3], laterWindowSize - tt - ss - dd); gg += 1) {
                  const oo = laterWindowSize - tt - ss - dd - gg;
                  if (oo < 0 || oo > remaining[4] || d + dd === 0 || g + gg === 0) continue;
                  const laterWays = choose(remaining[0], tt) * choose(remaining[1], ss) *
                    choose(remaining[2], dd) * choose(remaining[3], gg) * choose(remaining[4], oo);
                  favorableWays += firstWays * laterWays;
                }
              }
            }
          }
        }
      }
    }
  }
  const validOpeningWays = choose(total, openingSize) -
    choose(total - counts.thorns, openingSize);
  assert(validOpeningWays > 0n);
  return {
    favorableWays,
    allWays,
    unconditional: fraction(favorableWays, allWays),
    conditionalValidOpening: fraction(
      favorableWays * choose(total, openingSize),
      allWays * validOpeningWays
    )
  };
}

/** @returns {{thorns: number, speed: number, dce: number, guzma: number, other: number}} */
function originalRank6Counts() {
  const source = require(path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'));
  const deck = source.decks.find(row => row.rank === 6);
  assert(deck, 'authenticated original rank 6 required');
  const count = (name, set, number) => deck.cards
    .filter(card => card.name === name && card.printing.set === set &&
      card.printing.number === number)
    .reduce((n, card) => n + card.count, 0);
  const thorns = count('Iron Thorns ex', 'TWM', '77');
  const speed = count('Speed Lightning Energy', 'RCL', '173');
  const dce = count('Double Colorless Energy', 'SUM', '136');
  const guzma = count('Guzma', 'BUS', '115');
  const total = deck.cards.reduce((n, card) => n + card.count, 0);
  assert.equal(total, 60);
  assert.deepEqual([thorns, speed, dce, guzma], [4, 4, 1, 3]);
  assert.equal(deck.category_counts['Pokémon'], 4, 'all initial Basics are Iron Thorns');
  return { thorns, speed, dce, guzma, other: total - thorns - speed - dce - guzma };
}

/**
 * @param {0|1|2} additionalSpeedDraws
 * @returns {ReturnType<typeof exactAccess>}
 */
function originalRank6Counterwindow(additionalSpeedDraws) {
  assert([0, 1, 2].includes(additionalSpeedDraws));
  return exactAccess(originalRank6Counts(), 7, 8, 1 + additionalSpeedDraws);
}

module.exports = { choose, fraction, exactAccess, originalRank6Counts, originalRank6Counterwindow };
