'use strict';

const COUNTS = Object.freeze({
  jet: 1, nest: 1, wobbuffet: 3, otherBasics: 9, remaining: 46
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) ||
      n < 0 || k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    value = value * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return value;
}

/**
 * Count allocations of one printed identity into hand, Prizes, two draws,
 * and the remaining deck. Hand/Prize/draw groups are unordered, with
 * original physical cards treated as distinguishable within categories.
 * @param {number} categorySize
 * @param {number} hand
 * @param {number} prize
 * @param {number} draw
 * @returns {bigint}
 */
function allocation(categorySize, hand, prize, draw) {
  return choose(categorySize, hand) *
    choose(categorySize - hand, prize) *
    choose(categorySize - hand - prize, draw);
}

/** @param {number} zone @returns {[number, number, number]} */
function occupied(zone) {
  return [Number(zone === 0), Number(zone === 1), Number(zone === 2)];
}

/**
 * Exhaust all valid unsequenced category placements for 7 opening cards,
 * 6 hidden Prizes, and the first 2 natural draws. The original source 60
 * contains 1 Jet Energy, 1 Nest Ball, 3 Wobbuffet and 9 other Basics.
 *
 * The event is a resource LOCATION SCREEN, conditional on a legal initial
 * seven: both singletons available through those nine visible cards and
 * at least one Wobbuffet still in the remaining deck. It says nothing
 * about Item lock being active, opposing Artazon availability, being able
 * to attach Jet, or the payoff and winner of a game.
 *
 * @returns {{denominator:bigint, numerator:bigint,
 *   strictOtherBasicNumerator:bigint, sourceBasicCount:number}}
 */
function calculate() {
  const { jet, nest, wobbuffet, otherBasics, remaining } = COUNTS;
  const total = jet + nest + wobbuffet + otherBasics + remaining;
  const denominator =
    (choose(total, 7) - choose(total - wobbuffet - otherBasics, 7)) *
    choose(total - 7, 6) * choose(total - 13, 2);
  let numerator = 0n;
  let strictOtherBasicNumerator = 0n;

  // Zones: 0=opening seven; 1=Prize; 2=first two natural draws;
  // 3=remaining deck. Both required singletons must be zone 0 or 2.
  for (const jetZone of [0, 2]) {
    for (const nestZone of [0, 2]) {
      const [jh, jp, jd] = occupied(jetZone);
      const [nh, np, nd] = occupied(nestZone);
      for (let wh = 0; wh <= wobbuffet; wh++) {
        for (let wp = 0; wp <= wobbuffet - wh; wp++) {
          for (let wd = 0; wd <= Math.min(2, wobbuffet - wh - wp); wd++) {
            if (wobbuffet - wh - wp - wd < 1) continue;
            const wweight = allocation(wobbuffet, wh, wp, wd);
            for (let bh = 0; bh <= Math.min(7, otherBasics); bh++) {
              if (bh + wh === 0) continue;
              for (let bp = 0; bp <= Math.min(6, otherBasics - bh); bp++) {
                for (let bd = 0; bd <= Math.min(2, otherBasics - bh - bp); bd++) {
                  const rh = 7 - jh - nh - wh - bh;
                  const rp = 6 - jp - np - wp - bp;
                  const rd = 2 - jd - nd - wd - bd;
                  if (Math.min(rh, rp, rd) < 0 || rh + rp + rd > remaining) {
                    continue;
                  }
                  const ways = wweight *
                    allocation(otherBasics, bh, bp, bd) *
                    allocation(remaining, rh, rp, rd);
                  numerator += ways;
                  if (bh > 0) strictOtherBasicNumerator += ways;
                }
              }
            }
          }
        }
      }
    }
  }
  return {
    denominator, numerator, strictOtherBasicNumerator,
    sourceBasicCount: wobbuffet + otherBasics
  };
}

if (require.main === module) {
  const result = calculate();
  process.stdout.write(JSON.stringify({
    ...Object.fromEntries(
      Object.entries(result).map(([k, v]) => [k,
        typeof v === 'bigint' ? v.toString() : v])),
    resourceScreenPercent:
      Number(result.numerator * 100000000000n / result.denominator) / 1000000000,
    otherBasicStarterScreenPercent:
      Number(result.strictOtherBasicNumerator * 100000000000n /
        result.denominator) / 1000000000,
    competitiveQualifiedGames: 0
  }, null, 2) + '\n');
}
module.exports = { COUNTS, choose, allocation, calculate };
