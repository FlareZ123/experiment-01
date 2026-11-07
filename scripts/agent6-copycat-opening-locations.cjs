'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./hood-t2-joint.cjs');

const ZONES = ['hand', 'prizes', 'deck'];

/**
 * Exact locations of singleton Mimikyu, Dialga-GX and Hisuian Heavy Ball
 * after a legal seven-card opener and six face-down Prizes.
 *
 * The two named Pokemon are Basic, the Ball is not. The distribution
 * conditions on at least one Basic in the initial seven, without modelling
 * opponent mulligan draws, search, Prize-taking or playable actions.
 *
 * @param {{basicCount?: number}} [options]
 * @returns {object} Conditional probabilities over the 27 labelled locations.
 */
function openingLocations(options = {}) {
  const basicCount = options.basicCount ?? 14;
  assert.ok(Number.isSafeInteger(basicCount) && basicCount >= 2 && basicCount <= 59);
  const otherBasics = basicCount - 2;
  const otherNonBasics = 59 - basicCount;
  const totalDealWays = choose(60, 7) * choose(53, 6);
  const states = [];
  let totalValidWays = 0;

  for (const mimikyu of ZONES) {
    for (const dialga of ZONES) {
      for (const heavyBall of ZONES) {
        const positions = [mimikyu, dialga, heavyBall];
        const unidentifiedHand = 7 - positions.filter(z => z === 'hand').length;
        const unidentifiedPrizes = 6 - positions.filter(z => z === 'prizes').length;
        let ways = 0;
        for (let handBasics = 0; handBasics <= otherBasics; handBasics += 1) {
          const handOther = unidentifiedHand - handBasics;
          if (handOther < 0 || handOther > otherNonBasics) continue;
          if (handBasics + Number(mimikyu === 'hand') + Number(dialga === 'hand') === 0) continue;
          const handWays = choose(otherBasics, handBasics) * choose(otherNonBasics, handOther);
          for (let prizeBasics = 0; prizeBasics <= otherBasics - handBasics; prizeBasics += 1) {
            const prizeOther = unidentifiedPrizes - prizeBasics;
            if (prizeOther < 0 || prizeOther > otherNonBasics - handOther) continue;
            ways += handWays * choose(otherBasics - handBasics, prizeBasics) *
              choose(otherNonBasics - handOther, prizeOther);
          }
        }
        states.push({mimikyu, dialga, heavyBall, ways});
        totalValidWays += ways;
      }
    }
  }

  const validOpeningProbability = 1 - choose(60 - basicCount, 7) / choose(60, 7);
  assert.ok(Math.abs(totalValidWays / totalDealWays - validOpeningProbability) < 1e-12);
  /** @param {(state: object) => boolean} predicate */
  const probability = predicate => states.reduce((sum, s) => sum + (predicate(s) ? s.ways : 0), 0) / totalValidWays;
  /** @param {object} s */
  const prizedCoreCount = s => Number(s.mimikyu === 'prizes') + Number(s.dialga === 'prizes');
  const oneCore = s => prizedCoreCount(s) === 1;
  const immediateCut = s => prizedCoreCount(s) === 2 || (oneCore(s) && s.heavyBall === 'prizes');
  const output = {
    basicCount,
    validOpeningProbability,
    bothCorePrized: probability(s => prizedCoreCount(s) === 2),
    exactlyOneCorePrized: probability(oneCore),
    singleCorePrizedBallInHand: probability(s => oneCore(s) && s.heavyBall === 'hand'),
    singleCorePrizedBallInDeck: probability(s => oneCore(s) && s.heavyBall === 'deck'),
    singleCorePrizedBallPrized: probability(s => oneCore(s) && s.heavyBall === 'prizes'),
    bothCoreInOpeningHand: probability(s => s.mimikyu === 'hand' && s.dialga === 'hand'),
    immediatePrizeOnlyCut: probability(immediateCut),
    states: states.map(s => ({mimikyu: s.mimikyu, dialga: s.dialga,
      heavyBall: s.heavyBall, probability: s.ways / totalValidWays}))
  };
  output.ballHeldGivenSingleCorePrizeAndBallNotPrize =
    output.singleCorePrizedBallInHand /
    (output.singleCorePrizedBallInHand + output.singleCorePrizedBallInDeck);
  return output;
}

module.exports = {openingLocations};
