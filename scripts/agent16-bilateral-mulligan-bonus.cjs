'use strict';

/**
 * Exact opening-mulligan bonus opportunities for two independently shuffled
 * 60-card decks under the simultaneous-failure rule.
 *
 * An offered extra card is optional: these results measure opportunities,
 * not decisions to draw or the contents of those draws.
 */

/**
 * @param {number} basicCount Number of starting-eligible Basic Pokémon cards.
 * @param {number} [deckSize=60] Physical cards in the deck.
 * @param {number} [openingSize=7] Physical cards in an opening hand.
 * @returns {number} Probability the opening hand has no starting-eligible Basic.
 */
function mulliganProbability(basicCount, deckSize = 60, openingSize = 7) {
  if (!Number.isInteger(deckSize) || deckSize < 1 ||
      !Number.isInteger(openingSize) || openingSize < 1 || openingSize > deckSize ||
      !Number.isInteger(basicCount) || basicCount < 1 || basicCount > deckSize) {
    throw new RangeError('Require 1 <= openingSize, basicCount <= deckSize, with integer counts.');
  }
  let probability = 1;
  for (let draw = 0; draw < openingSize; draw += 1) {
    probability *= Math.max(0, deckSize - basicCount - draw) / (deckSize - draw);
  }
  return probability;
}

/**
 * Independently drawn valid hands have zero-based geometric failure counts
 * M_source and M_candidate. Simultaneous failures yield no bonus. The offered
 * bonuses are max(M_source-M_candidate,0) and max(M_candidate-M_source,0).
 *
 * @param {number} sourceBasics Number of starting-eligible Basics in source 60.
 * @param {number} candidateBasics Number of starting-eligible Basics in candidate 60.
 * @param {number} [deckSize=60] Physical cards in each deck.
 * @param {number} [openingSize=7] Cards in each attempted opening hand.
 * @returns {{sourceMulligan: number, candidateMulligan: number,
 * candidateOfferedAtLeastOne: number, sourceOfferedAtLeastOne: number,
 * neitherOffered: number, candidateExpectedOfferedCards: number,
 * sourceExpectedOfferedCards: number}}
 */
function bilateralBonus(sourceBasics, candidateBasics, deckSize = 60, openingSize = 7) {
  const sourceMulligan = mulliganProbability(sourceBasics, deckSize, openingSize);
  const candidateMulligan = mulliganProbability(candidateBasics, deckSize, openingSize);
  const normalizer = 1 - sourceMulligan * candidateMulligan;
  const candidateOfferedAtLeastOne = sourceMulligan * (1 - candidateMulligan) / normalizer;
  const sourceOfferedAtLeastOne = candidateMulligan * (1 - sourceMulligan) / normalizer;
  return {
    sourceMulligan,
    candidateMulligan,
    candidateOfferedAtLeastOne,
    sourceOfferedAtLeastOne,
    neitherOffered: (1 - sourceMulligan) * (1 - candidateMulligan) / normalizer,
    candidateExpectedOfferedCards: candidateOfferedAtLeastOne / (1 - sourceMulligan),
    sourceExpectedOfferedCards: sourceOfferedAtLeastOne / (1 - candidateMulligan)
  };
}

module.exports = { mulliganProbability, bilateralBonus };
