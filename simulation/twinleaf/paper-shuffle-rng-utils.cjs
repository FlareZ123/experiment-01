'use strict';

const {fisherYatesPermutation} =
  require('../evaluation/agent37-independent-rng-v1.cjs');

/**
 * @param {any[]} values
 * @param {()=>number & {randomInt?:(bound:number)=>number}} random
 * @returns {any[]}
 */
function shuffleInPlace(values, random) {
  if (!Array.isArray(values)) throw new TypeError('Shuffle input must be an array');
  if (!random || typeof random.randomInt !== 'function') {
    throw new TypeError('Paper shuffle requires an unbiased randomInt stream');
  }
  if (values.length < 2) return values;
  const order = fisherYatesPermutation(values.length, bound => random.randomInt(bound));
  const original = values.slice();
  for (let index = 0; index < values.length; index += 1) {
    values[index] = original[order[index]];
  }
  return values;
}

/**
 * Shuffle only nonempty face-down Prize positions, preserving face-up and
 * empty positions. The returned array contains the original CardList objects.
 *
 * @param {any[]} positions
 * @param {()=>number & {randomInt?:(bound:number)=>number}} random
 * @returns {any[]}
 */
function shufflePrizePositions(positions, random) {
  if (!Array.isArray(positions)) throw new TypeError('Prize positions must be an array');
  const faceDown = positions.filter(position =>
    position.isSecret && position.cards.length > 0);
  shuffleInPlace(faceDown, random);
  const result = [];
  let next = 0;
  for (const position of positions) {
    if (position.cards.length === 0 || !position.isSecret) {
      result.push(position);
    } else {
      result.push(faceDown[next]);
      next += 1;
    }
  }
  if (next !== faceDown.length) throw new Error('Prize shuffle lost a physical position');
  return result;
}

/**
 * Apply a shuffled CardList ordering to existing physical Prize slot objects.
 * This is required when a caller ignores the returned filtered-array order.
 *
 * @param {any[]} positions
 * @param {any[]} shuffled
 * @returns {any[]}
 */
function copyPrizeContents(positions, shuffled) {
  if (!Array.isArray(positions) || !Array.isArray(shuffled) ||
      positions.length !== shuffled.length) {
    throw new Error('Prize shuffle must preserve the original position count');
  }
  const contents = shuffled.map(position => position.cards.slice());
  for (let index = 0; index < positions.length; index += 1) {
    positions[index].cards.splice(0, positions[index].cards.length, ...contents[index]);
  }
  return positions;
}

module.exports = {shuffleInPlace, shufflePrizePositions, copyPrizeContents};
