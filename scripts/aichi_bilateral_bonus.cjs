'use strict';

const { mulliganProbability } = require('./aichi_opening_audit.cjs');

/**
 * Exact mutually exclusive mulligan bonus-offer outcomes under normal 60-card
 * setup rules. Simultaneous mulligans generate no bonus. Once either player
 * accepts a legal starting hand, only the other player redraws.
 *
 * Candidate refers to the deck being assessed, opponent to its partner.
 * A bonus offer is optional and does not establish an actual card drawn.
 *
 * @param {number} opponentBasics Number of eligible Basic Pokemon in opponent deck.
 * @param {number} candidateBasics Number of eligible Basic Pokemon in candidate deck.
 * @returns {{opponentBasics:number,candidateBasics:number,
 *   candidateAtLeastOne:number,opponentAtLeastOne:number,neither:number,
 *   candidateExpected:number,opponentExpected:number,expectedNet:number}}
 */
function bilateralBonus(opponentBasics, candidateBasics) {
  const pA = mulliganProbability(opponentBasics);
  const pB = mulliganProbability(candidateBasics);
  const denominator = 1 - pA * pB;
  const candidateAtLeastOne = pA * (1 - pB) / denominator;
  const opponentAtLeastOne = pB * (1 - pA) / denominator;
  const neither = (1 - pA) * (1 - pB) / denominator;
  const candidateExpected = candidateAtLeastOne / (1 - pA);
  const opponentExpected = opponentAtLeastOne / (1 - pB);
  return {
    opponentBasics, candidateBasics, candidateAtLeastOne,
    opponentAtLeastOne, neither, candidateExpected,
    opponentExpected, expectedNet: candidateExpected - opponentExpected,
  };
}

/**
 * Equal-rank average over explicitly supplied, source-confirmed opponents.
 * This is a finite published-field average, not a 32-rank value when some
 * source lists are missing.
 *
 * @param {Array<{rank:number,basic_count_known:number}>} opponentRows
 * @param {number} candidateBasics
 * @returns {{coveredRanks:number,missingRanks:number[],candidateBasics:number,
 *   candidateAtLeastOne:number,opponentAtLeastOne:number,neither:number,
 *   candidateExpected:number,opponentExpected:number,expectedNet:number}}
 */
function publishedFieldBilateral(opponentRows, candidateBasics) {
  if (!Array.isArray(opponentRows) || opponentRows.length === 0) {
    throw new RangeError('At least one verified opponent is required.');
  }
  const ranks = new Set();
  const keys = ['candidateAtLeastOne', 'opponentAtLeastOne', 'neither',
    'candidateExpected', 'opponentExpected', 'expectedNet'];
  const totals = Object.fromEntries(keys.map(key => [key, 0]));
  for (const row of opponentRows) {
    if (!Number.isInteger(row.rank) || row.rank < 1 || row.rank > 32 ||
        ranks.has(row.rank)) {
      throw new RangeError('Each source-confirmed rank must be unique and in 1..32.');
    }
    ranks.add(row.rank);
    const outcome = bilateralBonus(row.basic_count_known, candidateBasics);
    for (const key of keys) totals[key] += outcome[key];
  }
  const missingRanks = Array.from({ length: 32 }, (_, i) => i + 1)
    .filter(rank => !ranks.has(rank));
  return {
    coveredRanks: ranks.size, missingRanks, candidateBasics,
    ...Object.fromEntries(keys.map(key => [key, totals[key] / ranks.size])),
  };
}

module.exports = { bilateralBonus, publishedFieldBilateral };
