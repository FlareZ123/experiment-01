'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./hood-t2-joint.cjs');
const {openingLocations} = require('./agent6-copycat-opening-locations.cjs');

const ZONES = ['hand', 'prizes', 'deck'];

/**
 * Locate the exact starting-hand Forest Seal Stone + Pokemon V engine for
 * retrieving a deck-resident Hisuian Heavy Ball while one core Basic is Prized.
 * The resulting line is hypothetical until printed-action/payment/lock gates
 * are checked; its only claim is location of the required physical cards.
 *
 * @param {{basicCount:number,shadowRiderVCopies:number}} options
 * @returns {object}
 */
function starAlchemyOpening(options) {
  const {basicCount, shadowRiderVCopies} = options;
  assert.ok(Number.isSafeInteger(basicCount) && Number.isSafeInteger(shadowRiderVCopies));
  assert.ok(shadowRiderVCopies >= 1 && shadowRiderVCopies <= 4 &&
    basicCount >= shadowRiderVCopies + 2 && basicCount <= 58);
  const otherBasics = basicCount - 2 - shadowRiderVCopies;
  const otherNonBasics = 60 - basicCount - 2;
  const totalDeals = choose(60, 7) * choose(53, 6);
  let validWays = 0;
  let singleCorePrizeBallDeck = 0;
  let starAlchemyDirect = 0;
  let sealInHand = 0;
  let sealInHandWithoutV = 0;
  let sealPrized = 0;
  let sealDeckWithV = 0;

  for (const mimikyu of ZONES) for (const dialga of ZONES)
    for (const ball of ZONES) for (const seal of ZONES) {
      const names = [mimikyu, dialga, ball, seal];
      const namedHand = names.filter(x => x === 'hand').length;
      const namedPrize = names.filter(x => x === 'prizes').length;
      const caseOfInterest = Number(mimikyu === 'prizes') +
        Number(dialga === 'prizes') === 1 && ball === 'deck';
      for (let vHand = 0; vHand <= shadowRiderVCopies; vHand++) {
        for (let vPrize = 0; vPrize <= shadowRiderVCopies - vHand; vPrize++) {
          for (let bHand = 0; bHand <= otherBasics; bHand++) {
            const nHand = 7 - namedHand - vHand - bHand;
            if (nHand < 0 || nHand > otherNonBasics) continue;
            if (vHand + bHand + Number(mimikyu === 'hand') +
              Number(dialga === 'hand') === 0) continue;
            const handWays = choose(shadowRiderVCopies, vHand) *
              choose(otherBasics, bHand) * choose(otherNonBasics, nHand);
            for (let bPrize = 0; bPrize <= otherBasics - bHand; bPrize++) {
              const nPrize = 6 - namedPrize - vPrize - bPrize;
              if (nPrize < 0 || nPrize > otherNonBasics - nHand) continue;
              const ways = handWays * choose(shadowRiderVCopies - vHand, vPrize) *
                choose(otherBasics - bHand, bPrize) *
                choose(otherNonBasics - nHand, nPrize);
              validWays += ways;
              if (!caseOfInterest) continue;
              singleCorePrizeBallDeck += ways;
              if (seal === 'hand') {
                sealInHand += ways;
                if (vHand > 0) starAlchemyDirect += ways;
                else sealInHandWithoutV += ways;
              }
              if (seal === 'prizes') sealPrized += ways;
              if (seal === 'deck' && vHand > 0) sealDeckWithV += ways;
            }
          }
        }
      }
    }
  const expected = 1 - choose(60 - basicCount, 7) / choose(60, 7);
  assert.ok(Math.abs(validWays / totalDeals - expected) < 1e-12);
  const p = n => n / validWays;
  const base = openingLocations({basicCount});
  assert.ok(Math.abs(p(singleCorePrizeBallDeck) - base.singleCorePrizedBallInDeck) < 1e-12);
  return {
    basicCount, shadowRiderVCopies,
    singleCorePrizeBallDeck: p(singleCorePrizeBallDeck),
    sealInOpeningHand: p(sealInHand),
    sealInHandWithoutV: p(sealInHandWithoutV),
    sealPrized: p(sealPrized),
    sealDeckWithVInOpening: p(sealDeckWithV),
    directSealVPhysicalOpening: p(starAlchemyDirect),
    directFractionAmongBallDeck: starAlchemyDirect / singleCorePrizeBallDeck,
    interpretedAs: 'physical opportunity only; requires Tool, VSTAR Ability, Item use and opportunity-cost gates'
  };
}

module.exports = {starAlchemyOpening};
