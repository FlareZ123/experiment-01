'use strict';

const DECK_CARDS = 60;
const OPENING_CARDS = 7;

/**
 * Exact P(no Basic Pokémon in a random opening 7) for a 60-card paper deck.
 * Multiplies sequential without factorial overflow.
 *
 * @param {number} basics Number of cards eligible as Basic at game setup.
 * @returns {number} Probability of an opening mulligan.
 */
function openingMulliganProbability(basics) {
  if (!Number.isInteger(basics) || basics < 1 || basics > DECK_CARDS) {
    throw new RangeError('basics must be an integer between 1 and 60');
  }
  let result = 1;
  for (let i = 0; i < OPENING_CARDS; i++) {
    const nonBasicsRemaining = DECK_CARDS - basics - i;
    if (nonBasicsRemaining <= 0) return 0;
    result *= nonBasicsRemaining / (DECK_CARDS - i);
  }
  return result;
}

/**
 * Exact simultaneous mulligan protocol in the supplied Advanced Rulebook
 * section I.G.5-7:
 * - Both players fail: both shuffle/restart, with no one-sided extra-draw
 *   eligibility awarded by that shared restart.
 * - Exactly one player fails: the player with Basics fixes its setup, the
 *   other redraws independently until it has a Basic. All failed redraws
 *   after that decisive round count toward optional extra-draw eligibility.
 * - Both players succeed: nobody earns a mulligan extra-draw allowance.
 *
 * Assumes independent perfectly random seven-card draws after full shuffles.
 * The returned numbers are eligible OPTIONAL draws, not actual drawn cards,
 * effective hand resources, tactical impact, or game win probability.
 *
 * @param {number} myBasics Basic Pokémon in first player's sixty.
 * @param {number} opposingBasics Basic Pokémon in second player's sixty.
 * @returns {object} Exact expectations, simultaneous-restart and tail data.
 */
function pairedSetupMulligans(myBasics, opposingBasics) {
  const qMe = openingMulliganProbability(myBasics);
  const qThem = openingMulliganProbability(opposingBasics);
  const pMe = 1 - qMe;
  const pThem = 1 - qThem;
  const den = 1 - qMe * qThem;
  const firstDecisiveMeFails = qMe * pThem / den;
  const firstDecisiveThemFails = pMe * qThem / den;
  const firstDecisiveBothSucceed = pMe * pThem / den;
  return {
    myBasics, opposingBasics, qMe, qThem,
    expectedIndependentMyFailedHands: qMe / pMe,
    expectedIndependentOpposingFailedHands: qThem / pThem,
    expectedSharedRestartRounds: qMe * qThem / den,
    probabilityOnlyMySetupNeedsRedraws: firstDecisiveMeFails,
    probabilityOnlyOpposingSetupNeedsRedraws: firstDecisiveThemFails,
    probabilityNeitherSetupNeedsRedraws: firstDecisiveBothSucceed,
    expectedOptionalDrawsAvailableToOpponent:
      firstDecisiveMeFails / pMe,
    expectedOptionalDrawsAvailableToMe:
      firstDecisiveThemFails / pThem
  };
}

/**
 * P(the opponent can optionally draw AT LEAST n extra cards) due to my
 * mulligans, respecting simultaneous resets and subsequent failed hands.
 * The offer itself is optional under official setup rules.
 *
 * @param {number} myBasics Basic count in my sixty.
 * @param {number} opposingBasics Basic count in the opponent's sixty.
 * @param {number} n Nonnegative whole-number optional-draw eligibility.
 * @returns {number} Probability of the specified threshold or more.
 */
function opponentEligibleAtLeast(myBasics, opposingBasics, n) {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new RangeError('threshold must be a nonnegative integer');
  }
  if (n === 0) return 1;
  const result = pairedSetupMulligans(myBasics, opposingBasics);
  return result.probabilityOnlyMySetupNeedsRedraws *
    result.qMe ** (n - 1);
}

module.exports = {
  DECK_CARDS, OPENING_CARDS, openingMulliganProbability,
  pairedSetupMulligans, opponentEligibleAtLeast
};
