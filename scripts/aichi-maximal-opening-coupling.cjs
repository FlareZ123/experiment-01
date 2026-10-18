'use strict';

/**
 * Exact maximal probability of obtaining the same unordered k-card hand from
 * two uniform without-replacement draws of equally sized printing multisets.
 * This is an abstract maximal coupling bound, not an engine shuffle algorithm.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) ||
      n < 0 || k < 0 || k > n) return 0n;
  const r = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= r; i += 1) {
    value = value * BigInt(n - i + 1) / BigInt(i);
  }
  return value;
}

/**
 * Equality mass of the two multivariate-hypergeometric distributions:
 * sum over unordered hands h of min(P_A(h), P_B(h)).
 * Common equal-count card types can be combined into one neutral pool
 * using Vandermonde's convolution without losing any equality mass.
 *
 * @param {string[]} cardsA
 * @param {string[]} cardsB
 * @param {number} [k]
 * @returns {{numerator:string,denominator:string,probability:number,
 *  neutralCopies:number,affectedTypes:number,statesEvaluated:number,
 *  model:string}}
 */
function maximalHandEquality(cardsA, cardsB, k = 7) {
  if (!Array.isArray(cardsA) || !Array.isArray(cardsB) ||
      cardsA.length === 0 || cardsA.length !== cardsB.length ||
      cardsA.some(x => typeof x !== 'string' || x.length === 0) ||
      cardsB.some(x => typeof x !== 'string' || x.length === 0) ||
      !Number.isInteger(k) || k < 0 || k > cardsA.length) {
    throw new RangeError('Expected equal-sized printing arrays and valid draw');
  }
  const countA = new Map(), countB = new Map();
  for (const x of cardsA) countA.set(x, (countA.get(x) || 0) + 1);
  for (const x of cardsB) countB.set(x, (countB.get(x) || 0) + 1);
  const all = new Set([...countA.keys(), ...countB.keys()]);
  let neutral = 0;
  const changed = [];
  for (const id of all) {
    const a = countA.get(id) || 0, b = countB.get(id) || 0;
    if (a === b) neutral += a;
    else changed.push([a, b]);
  }
  let numerator = 0n, statesEvaluated = 0;
  /** @param {number} at @param {number} drawn
   *  @param {bigint} waysA @param {bigint} waysB */
  function visit(at, drawn, waysA, waysB) {
    if (at === changed.length) {
      const neutralDrawn = k - drawn;
      if (neutralDrawn >= 0 && neutralDrawn <= neutral) {
        numerator += choose(neutral, neutralDrawn) *
          (waysA < waysB ? waysA : waysB);
      }
      statesEvaluated += 1;
      return;
    }
    const [a, b] = changed[at];
    for (let h = 0; h <= Math.min(a, b, k - drawn); h += 1) {
      visit(at + 1, drawn + h,
        waysA * choose(a, h), waysB * choose(b, h));
    }
  }
  visit(0, 0, 1n, 1n);
  const denominator = choose(cardsA.length, k);
  return {
    numerator: String(numerator), denominator: String(denominator),
    probability: Number(numerator) / Number(denominator),
    neutralCopies: neutral, affectedTypes: changed.length,
    statesEvaluated,
    model: 'abstract-maximal-equality-coupling-of-unordered-hands'
  };
}

module.exports = {choose, maximalHandEquality};
