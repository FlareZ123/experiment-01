'use strict';

/** Exact binomial coefficient, with zero for impossible terms. */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let j = 1; j <= Math.min(k, n - k); j++) {
    result = result * BigInt(n - Math.min(k, n - k) + j) / BigInt(j);
  }
  return result;
}

/**
 * Prize-only cut of two essential Basic singleton cards.
 * @param {number} heavyBallCopies 1 to 4 Hisuian Heavy Balls.
 */
function prizeCut(heavyBallCopies) {
  const n = heavyBallCopies;
  let sum = 0n;
  for (let key = 0; key <= 2; key++) {
    for (let heavy = 0; heavy <= n; heavy++) {
      if (key <= n - heavy) continue;
      for (let basic = 0; basic <= 12; basic++) {
        const ways = choose(2, key) * choose(n, heavy)
          * choose(12, basic) * choose(46 - n, 6 - key - heavy - basic);
        sum += ways * (choose(54, 7) - choose(40 + key + basic, 7));
      }
    }
  }
  const numerator = sum * choose(60, 7);
  const denominator = choose(60, 6) * choose(54, 7)
    * (choose(60, 7) - choose(46, 7));
  return { numerator, denominator, probability: Number(numerator) / Number(denominator) };
}

module.exports = { choose, prizeCut };
