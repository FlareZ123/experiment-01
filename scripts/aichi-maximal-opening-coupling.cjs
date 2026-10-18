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


/**
 * Maximal equality mass of seven-card hands after each player's independent
 * rejection mulligans until the hand contains at least one Basic Pokémon.
 * "Basic" eligibility is supplied by exact printing identifiers. This does
 * not model optional opponent-mulligan bonus draws or initial board choices.
 *
 * @param {string[]} cardsA
 * @param {string[]} cardsB
 * @param {Set<string>} basicPrintIds
 * @param {number} [k]
 * @returns {{numerator:string,denominator:string,probability:number,
 * basicCounts:number[],neutralBasicCopies:number,
 * neutralOtherCopies:number,model:string}}
 */
function maximalValidOpeningEquality(cardsA, cardsB, basicPrintIds, k = 7) {
  maximalHandEquality(cardsA, cardsB, k);
  if (!(basicPrintIds instanceof Set)) {
    throw new TypeError('Exact Basic-printing identifier set required');
  }
  const n = cardsA.length;
  const basicsA = cardsA.filter(id => basicPrintIds.has(id)).length;
  const basicsB = cardsB.filter(id => basicPrintIds.has(id)).length;
  const validA = choose(n, k) - choose(n - basicsA, k);
  const validB = choose(n, k) - choose(n - basicsB, k);
  if (validA === 0n || validB === 0n) {
    throw new RangeError('One deck has no valid opening of requested size');
  }
  const ca = new Map(), cb = new Map();
  for (const id of cardsA) ca.set(id, (ca.get(id) || 0) + 1);
  for (const id of cardsB) cb.set(id, (cb.get(id) || 0) + 1);
  let neutralBasic = 0, neutralOther = 0;
  const changed = [];
  for (const id of new Set([...ca.keys(), ...cb.keys()])) {
    const a = ca.get(id) || 0, b = cb.get(id) || 0;
    if (a === b) {
      if (basicPrintIds.has(id)) neutralBasic += a;
      else neutralOther += a;
    } else {
      changed.push({a, b, basic: basicPrintIds.has(id)});
    }
  }
  let numerator = 0n;
  /**
   * @param {number} at
   * @param {number} used
   * @param {number} selectedBasics
   * @param {bigint} waysA
   * @param {bigint} waysB
   */
  function visit(at, used, selectedBasics, waysA, waysB) {
    if (at === changed.length) {
      const left = k - used;
      for (let bs = 0; bs <= Math.min(neutralBasic, left); bs += 1) {
        const other = left - bs;
        if (bs + selectedBasics > 0 && other <= neutralOther) {
          const factor = choose(neutralBasic, bs) *
            choose(neutralOther, other);
          const scaledA = waysA * validB, scaledB = waysB * validA;
          numerator += factor * (scaledA < scaledB ? scaledA : scaledB);
        }
      }
      return;
    }
    const {a, b, basic} = changed[at];
    for (let h = 0; h <= Math.min(a, b, k - used); h += 1) {
      visit(at + 1, used + h, selectedBasics + (basic ? h : 0),
        waysA * choose(a, h), waysB * choose(b, h));
    }
  }
  visit(0, 0, 0, 1n, 1n);
  const denominator = validA * validB;
  return {
    numerator: String(numerator), denominator: String(denominator),
    probability: Number(numerator) / Number(denominator),
    basicCounts: [basicsA, basicsB],
    neutralBasicCopies: neutralBasic, neutralOtherCopies: neutralOther,
    model: 'maximal-equality-coupling-conditional-on-valid-seven'
  };
}

module.exports = {choose, maximalHandEquality, maximalValidOpeningEquality};
