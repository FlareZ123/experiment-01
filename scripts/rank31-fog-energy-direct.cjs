'use strict';

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
    throw new RangeError('Invalid combination arguments');
  }
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    result = result * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function ratio(numerator, denominator) {
  if (denominator <= 0n) throw new RangeError('Nonpositive denominator');
  const factor = gcd(numerator, denominator);
  return {numerator: numerator / factor, denominator: denominator / factor};
}

/** @param {{numerator:bigint,denominator:bigint}} a @param {{numerator:bigint,denominator:bigint}} b */
const multiply = (a, b) => ratio(a.numerator * b.numerator, a.denominator * b.denominator);
/** @param {{numerator:bigint,denominator:bigint}} a @param {{numerator:bigint,denominator:bigint}} b */
const add = (a, b) => ratio(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
/** @param {{numerator:bigint,denominator:bigint}} a @param {{numerator:bigint,denominator:bigint}} b */
const subtract = (a, b) => ratio(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
/** @param {{numerator:bigint,denominator:bigint}} a @param {{numerator:bigint,denominator:bigint}} b */
const divide = (a, b) => ratio(a.numerator * b.denominator, a.denominator * b.numerator);

/**
 * Rank-31 source-60 restricted first reply, one Chimecho, four Fog Crystal,
 * two Basic Psychic Energy, three Telepathic Psychic Energy and 15 Basics.
 * Seven initial hand, six face-down Prize cards, one first normal draw.
 * Fog can fetch Basic Psychic Energy still in deck; Special Energy provides
 * Psychic only while attached, and is not a search target in the deck.
 * @returns {{direct:object,fogBridge:object,union:object,openingValid:object,conditionalUnion:object}}
 */
function calculate() {
  const one = ratio(1n, 1n);
  const chimechoOpening = ratio(7n, 60n);
  const otherSeven = choose(59, 7);
  // Other six opening cards plus the first draw, conditional on Chimecho in H.
  const direct = multiply(chimechoOpening,
    subtract(one, ratio(choose(54, 7), otherSeven)));
  const noEnergyWithFog = ratio(choose(54, 7) - choose(50, 7), otherSeven);
  // Once seven other observed cards contain no eligible Energy, 2 Basic Psychic
  // remain among 52 unseen cards; only 6 are in Prizes rather than 46 deck.
  const basicAvailableInDeck = subtract(one, ratio(choose(50, 4), choose(52, 6)));
  const fogBridge = multiply(multiply(chimechoOpening, noEnergyWithFog), basicAvailableInDeck);
  const union = add(direct, fogBridge);
  const openingValid = subtract(one, ratio(choose(45, 7), choose(60, 7)));
  return {direct, fogBridge, union, openingValid, conditionalUnion: divide(union, openingValid)};
}

module.exports = {choose, calculate};
