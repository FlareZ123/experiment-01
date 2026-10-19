'use strict';

const { choose } = require('./ditto-direct-path-frontier.cjs');

/**
 * Exact physical-card exposure screen for a deterministic Will -> Ditto route.
 * Initial seven, six facedown Prizes, and the first ordinary draw are sampled
 * without replacement. A fresh eighth card is exchangeable with the six Prize
 * placements, which allows one compact conditional hypergeometric sum.
 *
 * Required conditions: initially Active-capable Ditto, Will and Double Colorless
 * Energy among the first eight cards, and at least one Stage 2 target in the
 * remaining draw deck. The route omits Items, extra draws, other Supporters,
 * opposition, hand constraints, abilities, and every game outcome.
 *
 * @param {number} otherBasics Copies of non-Ditto Basic Pokemon.
 * @param {number} targetCopies Copies of one chosen Stage 2.
 * @returns {{legalOpening: number, directVisibility: number}}
 */
function willNaturalDceFrontier(otherBasics, targetCopies) {
  if (!Number.isInteger(otherBasics) || otherBasics < 0 ||
      !Number.isInteger(targetCopies) || targetCopies < 1 || targetCopies > 4 ||
      otherBasics + targetCopies > 48) {
    throw new RangeError('Requires 0..48 other Basics and 1..4 Stage 2 within 60 slots');
  }

  const sizes = [4, 4, 4, targetCopies, otherBasics, 48 - targetCopies - otherBasics];
  const openingDenominator = choose(60, 7);
  const prizeDenominator = choose(52, 6);
  const legalOpening = 1 - choose(56 - otherBasics, 7) / openingDenominator;
  let jointEvent = 0;

  for (let ditto = 1; ditto <= 4; ditto += 1) {
    for (let will = 0; will <= 4; will += 1) {
      for (let dce = 0; dce <= 4; dce += 1) {
        for (let target = 0; target <= targetCopies; target += 1) {
          for (let basics = 0; basics <= otherBasics; basics += 1) {
            const filler = 7 - ditto - will - dce - target - basics;
            const hand = [ditto, will, dce, target, basics, filler];
            if (filler < 0 || filler > sizes[5]) continue;
            const openingWays = hand.reduce((ways, count, i) => ways * choose(sizes[i], count), 1);
            if (openingWays === 0) continue;

            for (let nextCategory = 0; nextCategory < sizes.length; nextCategory += 1) {
              const available = sizes[nextCategory] - hand[nextCategory];
              if (available <= 0) continue;
              if (will + Number(nextCategory === 1) === 0 ||
                  dce + Number(nextCategory === 2) === 0) continue;
              const targetsRemaining = targetCopies - target - Number(nextCategory === 3);
              if (targetsRemaining <= 0) continue;
              const allPrized = choose(52 - targetsRemaining, 6 - targetsRemaining) / prizeDenominator;
              jointEvent += (openingWays / openingDenominator) *
                (available / 53) * (1 - allPrized);
            }
          }
        }
      }
    }
  }

  return { legalOpening, directVisibility: jointEvent / legalOpening };
}

module.exports = { willNaturalDceFrontier };
