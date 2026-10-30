'use strict';

/**
 * Exact first-valid-seven Active Frillish -> Silent Lab + Boost Shake
 * opportunity with opponent mulligan bonus draws. The opponent has exactly
 * four Basic Pokémon and remulligans until its opening seven is Basic-valid.
 * The candidate has 12 Basics, draws the maximum allowed bonus count and
 * then one ordinary first-turn draw, with six unobserved Prizes.
 *
 * Conditional on the candidate's ORIGINAL seven being Basic-valid, no
 * candidate mulligans and no opponent action or other card effects. Source
 * mulligan count is independent and geometric. Only the direct held
 * Silent Lab + Boost Shake line is evaluated, not Supporter search or Wally.
 *
 * @typedef {{frillish?:number,boostShake?:number,jellicent?:number,
 *   silentLab?:number,totalBasics?:number}} Options
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/**
 * @param {number} bonusDraws
 * @param {Options} [options]
 * @returns {{numerator:bigint,denominator:bigint,probability:number}}
 */
function exactDirectWithBonus(bonusDraws, options = {}) {
  if (!Number.isInteger(bonusDraws) || bonusDraws < 0 || bonusDraws > 46) {
    throw new RangeError('0..46 bonus draws allow the ordinary turn draw');
  }
  const f = options.frillish ?? 4;
  const b = options.boostShake ?? 4;
  const j = options.jellicent ?? 4;
  const l = options.silentLab ?? 4;
  const basics = options.totalBasics ?? 12;
  if ([f, b, j, l].some(n => !Number.isInteger(n) || n < 0 || n > 4)) {
    throw new RangeError('Card counts must be 0..4');
  }
  if (!Number.isInteger(basics) || basics < f || basics > 60 - b - j - l) {
    throw new RangeError('Invalid total Basic Pokémon count');
  }

  const drawn = bonusDraws + 1;
  const otherCards = 60 - f - b - j - l;
  let numerator = 0n;
  for (let hf = 1; hf <= f; hf++) {
    for (let hb = 0; hb <= b; hb++) {
      for (let hl = 0; hl <= l; hl++) {
        for (let hj = 0; hj <= j; hj++) {
          const ho = 7 - hf - hb - hl - hj;
          if (ho < 0 || ho > otherCards) continue;
          const handWays = choose(f, hf) * choose(b, hb) *
            choose(l, hl) * choose(j, hj) * choose(otherCards, ho);
          if (handWays === 0n) continue;
          const rb = b - hb, rl = l - hl, rj = j - hj;
          const remainingOther = 53 - rb - rl - rj;
          for (let db = Number(hb === 0); db <= Math.min(rb, drawn); db++) {
            for (let dl = Number(hl === 0); dl <= Math.min(rl, drawn - db); dl++) {
              for (let dj = 0; dj <= Math.min(rj, drawn - db - dl); dj++) {
                const dOther = drawn - db - dl - dj;
                const remainingJellicent = rj - dj;
                if (remainingJellicent === 0) continue;
                const drawWays = choose(rb, db) * choose(rl, dl) *
                  choose(rj, dj) * choose(remainingOther, dOther);
                if (drawWays === 0n) continue;
                const deckAfterDraw = 53 - drawn;
                const prizeWays = choose(deckAfterDraw, 6) -
                  choose(deckAfterDraw - remainingJellicent, 6 - remainingJellicent);
                numerator += handWays * drawWays * prizeWays;
              }
            }
          }
        }
      }
    }
  }
  const denominator = (choose(60, 7) - choose(60 - basics, 7)) *
    choose(53, drawn) * choose(53 - drawn, 6);
  return { numerator, denominator, probability: Number(numerator) / Number(denominator) };
}

/**
 * Finite geometric mixture through 46 allowed bonus draws. Rare >=47 source
 * mulligans are excluded, with their entire probability separately bounded.
 * The source four-Basic valid opener probability uses exact 60/7 counting.
 *
 * @param {Options} [options]
 * @returns {{probability:number,sourceValidOpeningProbability:number,
 *   tailProbabilityUpperBound:number,expectedSourceMulligans:number}}
 */
function fourBasicSourceMixture(options = {}) {
  const p = 1 - Number(choose(56, 7)) / Number(choose(60, 7));
  let probability = 0;
  let weight = p;
  for (let m = 0; m <= 46; m++) {
    probability += weight * exactDirectWithBonus(m, options).probability;
    weight *= 1 - p;
  }
  return {
    probability,
    sourceValidOpeningProbability: p,
    tailProbabilityUpperBound: weight / p * (1 - p),
    expectedSourceMulligans: (1 - p) / p
  };
}

module.exports = { choose, exactDirectWithBonus, fourBasicSourceMixture };
