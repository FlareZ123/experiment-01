'use strict';

const {choose} = require('./aichi-maximal-opening-coupling.cjs');

/**
 * Exact disagreement about whether an opening k-card subset contains a Basic
 * under an identical uniformly sampled set of physical input indices.
 * This is idealized, pre-mulligan mathematical evidence, not a played game.
 *
 * @param {string[]} first Expanded cards in actual input order.
 * @param {string[]} second Expanded cards in actual input order.
 * @param {Set<string>} basicPrintIds Printing-level Basic eligibility.
 * @param {number} [draw]
 * @returns {object}
 */
function basicOpeningDiscordance(first, second, basicPrintIds, draw = 7) {
  if (!Array.isArray(first) || !Array.isArray(second) ||
      first.length !== second.length || first.length < 1 ||
      first.some(x => typeof x !== 'string' || !x) ||
      second.some(x => typeof x !== 'string' || !x) ||
      !(basicPrintIds instanceof Set) ||
      !Number.isInteger(draw) || draw < 0 || draw > first.length) {
    throw new TypeError('Expected equal-sized ordered card IDs, Basic set and valid draw');
  }
  let a = 0, b = 0, intersection = 0;
  for (let i = 0; i < first.length; i += 1) {
    const ba = basicPrintIds.has(first[i]);
    const bb = basicPrintIds.has(second[i]);
    if (ba) a += 1;
    if (bb) b += 1;
    if (ba && bb) intersection += 1;
  }
  const union = a + b - intersection;
  const denominator = choose(first.length, draw);
  const noFirst = choose(first.length - a, draw);
  const noSecond = choose(first.length - b, draw);
  const noEither = choose(first.length - union, draw);
  const firstMulligansOnly = noFirst - noEither;
  const secondMulligansOnly = noSecond - noEither;
  const discordant = firstMulligansOnly + secondMulligansOnly;
  return {
    schema: 'ideal-same-index-basic-opening-discordance-v1',
    deckSize: first.length,
    draw,
    basicCounts: [a, b],
    matchingBasicPositions: intersection,
    basicUnionPositions: union,
    discordantWays: String(discordant),
    denominator: String(denominator),
    probability: Number(discordant) / Number(denominator),
    firstMulligansOnlyWays: String(firstMulligansOnly),
    secondMulligansOnlyWays: String(secondMulligansOnly),
    bothMulliganWays: String(noEither),
    bothValidWays: String(denominator - noFirst - noSecond + noEither)
  };
}

module.exports = {basicOpeningDiscordance};
