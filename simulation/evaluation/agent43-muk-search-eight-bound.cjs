'use strict';

/**
 * Exact, pre-search card-access screen for the first seven cards,
 * one ordinary first-turn draw, and six face-down Prize cards.
 * This is a hand/Prize opportunity model, not a gameplay simulator.
 */

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) value *= (n - i + 1) / i;
  return Math.round(value);
}

/** @param {number} left @returns {number} */
function allRemainingPrized(left) {
  return left <= 6 ? choose(52 - left, 6 - left) / choose(52, 6) : 0;
}

/**
 * @typedef {object} EightAccess
 * @property {number} basicValidInitialSeven
 * @property {number} directUnconditional
 * @property {number} directAmongBasicValid
 * @property {number} searchAssistedUnconditional
 * @property {number} searchAssistedAmongBasicValid
 */

/**
 * @param {{grimer?:number,muk?:number,shake?:number,treasure?:number,quick?:number,otherBasic?:number}} [copies]
 * @returns {EightAccess}
 */
function openingEightAccess(copies = {}) {
  const {
    grimer = 2,
    muk = 2,
    shake = 3,
    treasure = 4,
    quick = 3,
    otherBasic = 10
  } = copies;
  const known = [grimer, muk, shake, treasure, quick, otherBasic];
  if (!known.every((n) => Number.isInteger(n) && n >= 0) || known.reduce((a, b) => a + b, 0) > 60) {
    throw new RangeError('Nonnegative integer categories must fit 60 cards');
  }
  const slots = known.concat(60 - known.reduce((a, b) => a + b, 0));
  const firstEightDenominator = choose(60, 8);
  const basicValidInitialSeven = 1 - choose(60 - grimer - otherBasic, 7) / choose(60, 7);
  const counts = Array(7).fill(0);
  let directUnconditional = 0;
  let directAndValid = 0;
  let searchAssistedUnconditional = 0;
  let searchAssistedAndValid = 0;

  /** @param {number} index @param {number} left @param {number} numerator */
  function enumerate(index, left, numerator) {
    if (index === 6) {
      if (left > slots[index]) return;
      counts[index] = left;
      inspect(numerator * choose(slots[index], left) / firstEightDenominator);
      return;
    }
    for (let count = 0; count <= Math.min(slots[index], left); count += 1) {
      counts[index] = count;
      enumerate(index + 1, left - count, numerator * choose(slots[index], count));
    }
  }

  /** @param {number} p8 */
  function inspect(p8) {
    const [handGrimer, handMuk, handShake, handTreasure, handQuick, handOtherBasic] = counts;
    if (handShake === 0) return;
    const mukLeft = muk - handMuk;
    if (mukLeft === 0) return;
    const firstEightBasics = handGrimer + handOtherBasic;
    const initialValidWeight = firstEightBasics === 0 ? 0 : (firstEightBasics === 1 ? 7 / 8 : 1);
    const mukAvailable = 1 - allRemainingPrized(mukLeft);

    if (handGrimer > 0) {
      const p = p8 * mukAvailable;
      directUnconditional += p;
      directAndValid += p * initialValidWeight;
      searchAssistedUnconditional += p;
      searchAssistedAndValid += p * initialValidWeight;
      return;
    }
    const grimerLeft = grimer - handGrimer;
    if (handTreasure + handQuick === 0 || grimerLeft === 0) return;
    const bothAvailable = 1 - allRemainingPrized(mukLeft)
      - allRemainingPrized(grimerLeft) + allRemainingPrized(mukLeft + grimerLeft);
    const p = p8 * bothAvailable;
    searchAssistedUnconditional += p;
    searchAssistedAndValid += p * initialValidWeight;
  }

  enumerate(0, 8, 1);
  return {
    basicValidInitialSeven,
    directUnconditional,
    directAmongBasicValid: directAndValid / basicValidInitialSeven,
    searchAssistedUnconditional,
    searchAssistedAmongBasicValid: searchAssistedAndValid / basicValidInitialSeven
  };
}

module.exports = { choose, openingEightAccess };
