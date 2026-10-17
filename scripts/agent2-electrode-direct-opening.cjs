'use strict';

/**
 * Binomial coefficient for the small paper-TCG opening deck.
 * @param {number} n
 * @param {number} k
 * @returns {number}
 */
function combinations(n, k) {
  if (k < 0 || n < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i += 1) {
    result = result * (n - i + 1) / i;
  }
  return result;
}

/**
 * Exact probability that one unique Basic, one unique Item and one unique
 * Tool appear within the first `seen` cards, conditioning on at least one
 * Basic in the initial seven. All source cards are distinct singletons.
 *
 * This is a draw event, not an operational Pokémon attack or Prize estimate.
 * Opponent mulligan draws, searches and all turn actions are excluded.
 *
 * @param {number} basicCount Deck Basic count INCLUDING the target Basic.
 * @param {number} seen Number of distinct cards naturally observed.
 * @returns {{unconditional:number,conditionalValidStart:number,validStart:number}}
 */
function directThreeSingletons(basicCount = 15, seen = 9) {
  if (!Number.isInteger(basicCount) || basicCount < 1 || basicCount > 58 ||
      !Number.isInteger(seen) || seen < 7 || seen > 60) {
    throw new RangeError('Invalid 60-card deck Basic count or first-seven observation window');
  }
  let favorableWithValidStart = 0;
  for (let basicPos = 1; basicPos <= seen; basicPos += 1) {
    for (let itemPos = 1; itemPos <= seen; itemPos += 1) {
      if (itemPos === basicPos) continue;
      for (let toolPos = 1; toolPos <= seen; toolPos += 1) {
        if (toolPos === basicPos || toolPos === itemPos) continue;
        const occupiedNonBasic = Number(itemPos <= 7) + Number(toolPos <= 7);
        const openSlots = 7 - occupiedNonBasic;
        const pNoOtherBasic = basicPos <= 7 ? 0 :
          combinations(58 - basicCount, openSlots) /
          combinations(57, openSlots);
        favorableWithValidStart += 1 - pNoOtherBasic;
      }
    }
  }
  const denominator = 60 * 59 * 58;
  const validStart = 1 - combinations(60 - basicCount, 7) /
    combinations(60, 7);
  return {
    unconditional: favorableWithValidStart / denominator,
    conditionalValidStart: favorableWithValidStart / denominator / validStart,
    validStart
  };
}

module.exports = {combinations, directThreeSingletons};

if (require.main === module) {
  process.stdout.write(JSON.stringify({
    schema: 'electrode-direct-three-singleton-observation-v1',
    cards: ['Hisuian Electrode V', 'Spicy Seasoned Curry', 'Supereffective Glasses'],
    assumptions: '60 cards, 15 Basics including Electrode, one of each combo card, first seven plus two ordinary draws, valid seven',
    ...directThreeSingletons()
  }, null, 2) + '\n');
}
