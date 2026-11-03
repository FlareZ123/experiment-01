'use strict';

const { choose } = require('./agent43-muk-search-eight-bound.cjs');

/** @param {number[]} sizes @param {(counts:number[], probability:number)=>void} inspect */
function eachEight(sizes, inspect) {
  const counts = new Array(sizes.length).fill(0);
  const denominator = choose(60, 8);

  /** @param {number} index @param {number} left @param {number} numerator */
  function enumerate(index, left, numerator) {
    if (index === sizes.length - 1) {
      if (left > sizes[index]) return;
      counts[index] = left;
      inspect(counts, numerator * choose(sizes[index], left) / denominator);
      return;
    }
    for (let n = 0; n <= Math.min(sizes[index], left); n += 1) {
      counts[index] = n;
      enumerate(index + 1, left - n, numerator * choose(sizes[index], n));
    }
  }

  enumerate(0, 8, 1);
}

/** @param {number} n @returns {number} */
function allPrized(n) {
  return n <= 6 ? choose(52 - n, 6 - n) / choose(52, 6) : 0;
}

/**
 * Necessary direct-Muk line where the only Basic(s) in initial seven
 * were Alolan Grimer; after first draw and six Prizes, a Muk remains
 * searchable by Boost Shake. This conditional opening is vulnerable
 * to a follow-up opponent attacking the Active Muk only if no
 * Benched Grimer is established. This is a legacy broad species-only
 * classifier, NOT a forced-Active-Muk probability.
 *
 * @returns {{basicValid:number,forcedGrimerActive:number,directForcedMukUnconditional:number,directForcedMukAmongBasicValid:number}}
 */
function candidateForcedActiveMuk() {
  const sizes = [2, 2, 3, 10, 43]; // Grimer, Muk, Shake, other Basic, other non-Basic
  const basicValid = 1 - choose(48, 7) / choose(60, 7);
  let forcedGrimerActive = 0;
  let directForcedMukUnconditional = 0;

  eachEight(sizes, ([grimer, muk, shake, otherBasic], p8) => {
    let forcedSeven = 0;
    if (grimer >= 1 && otherBasic === 0) {
      forcedSeven = grimer === 1 ? 7 / 8 : 1;
    } else if (grimer >= 1 && otherBasic === 1) {
      forcedSeven = 1 / 8; // other Basic could be precisely the eighth draw
    }
    const pForced = p8 * forcedSeven;
    forcedGrimerActive += pForced;
    if (shake >= 1 && 2 - muk >= 1) {
      directForcedMukUnconditional += pForced * (1 - allPrized(2 - muk));
    }
  });

  return {
    basicValid,
    forcedGrimerActive,
    directForcedMukUnconditional,
    directForcedMukAmongBasicValid: directForcedMukUnconditional / basicValid
  };
}

/**
 * Separate true opening-seven single-Grimer geometry from the broader
 * historical "Grimer-only species" classifier. The eighth card may itself
 * be another Grimer, allowing a fresh Benched Grimer before Boost Shake.
 * A held Mysterious Treasure or Quick Ball can potentially search for
 * that second Grimer, but affordability and play legality remain untested.
 *
 * These are access probabilities, never game outcomes or forced decisions.
 *
 * @returns {{
 *  basicValid:number,
 *  sevenSingleGrimerDirectAmongBasicValid:number,
 *  eighthSecondGrimerBenchAmongBasicValid:number,
 *  noNaturalSecondGrimerByEightAmongBasicValid:number,
 *  secondGrimerSearchOpportunityAmongBasicValid:number,
 *  noDemonstratedSecondGrimerAccessAmongBasicValid:number
 * }}
 */
function candidateMukBenchGeometry() {
  // Grimer, Muk, Boost Shake, Mysterious Treasure, Quick Ball,
  // other Basics, remaining filler. All seven categories total 60.
  const sizes = [2, 2, 3, 4, 3, 10, 36];
  const basicValid = 1 - choose(48, 7) / choose(60, 7);
  let sevenSingle = 0;
  let secondFromEighth = 0;
  let noNaturalSecond = 0;
  let searchableSecond = 0;

  eachEight(sizes, ([grimer, muk, shake, treasure, quick, otherBasic], p8) => {
    if (shake === 0 || grimer === 0 || muk === 2) return;
    const mukLeft = 2 - muk;
    const mukAvailable = 1 - allPrized(mukLeft);

    // Eight-card multivariate hypergeometric composition is symmetric:
    // a named eighth-card category has weight count / 8.
    const oneByEightWeight = grimer === 1 && otherBasic === 0 ? 7 / 8
      : grimer === 1 && otherBasic === 1 ? 1 / 8
        : 0;
    const secondGrimerEighthWeight = grimer === 2 && otherBasic === 0 ? 2 / 8 : 0;
    const oneInSevenWeight = oneByEightWeight + secondGrimerEighthWeight;

    sevenSingle += p8 * oneInSevenWeight * mukAvailable;
    secondFromEighth += p8 * secondGrimerEighthWeight * mukAvailable;
    noNaturalSecond += p8 * oneByEightWeight * mukAvailable;

    if (oneByEightWeight > 0 && treasure + quick > 0) {
      // The other physical Grimer and at least one Muk must both survive
      // the six Prize cards among the 52 cards outside the first eight.
      const bothInDeck = 1 - allPrized(mukLeft)
        - allPrized(1) + allPrized(mukLeft + 1);
      searchableSecond += p8 * oneByEightWeight * bothInDeck;
    }
  });

  return {
    basicValid,
    sevenSingleGrimerDirectAmongBasicValid: sevenSingle / basicValid,
    eighthSecondGrimerBenchAmongBasicValid: secondFromEighth / basicValid,
    noNaturalSecondGrimerByEightAmongBasicValid: noNaturalSecond / basicValid,
    secondGrimerSearchOpportunityAmongBasicValid: searchableSecond / basicValid,
    noDemonstratedSecondGrimerAccessAmongBasicValid:
      (noNaturalSecond - searchableSecond) / basicValid
  };
}

/**
 * Optimistic opening-screen for the unchanged original Aichi rank-6
 * Iron Thorns 60: four only Basics, two Guzma & Hala, two Tag Call,
 * singleton Double Colorless Energy and Thunder Mountain Prism Star.
 *
 * Starts with an Iron Thorns; sees Guzma & Hala or Tag Call by first
 * draw; singleton Energy and Stadium are not Prized; if only Tag Call
 * is held, at least one Guzma & Hala remains searchable after Prizes.
 * It DOES NOT model two payable other discard cards, attack choices,
 * timing after Item lock, Tools, Stadium replacement, or outcomes.
 *
 * @returns {{sourceBasicValid:number,sourceOpportunityUnconditional:number,sourceOpportunityAmongBasicValid:number}}
 */
function rank6GuzmaHalaVoltWindow() {
  const sizes = [4, 2, 2, 1, 1, 50];
  const sourceBasicValid = 1 - choose(56, 7) / choose(60, 7);
  let sourceOpportunityUnconditional = 0;
  eachEight(sizes, ([thorns, gh, tag, dce, thunder], p8) => {
    const startValidWeight = thorns === 0 ? 0 : (thorns === 1 ? 7 / 8 : 1);
    if (startValidWeight === 0 || gh + tag === 0) return;
    const specialOutsideHand = (1 - dce) + (1 - thunder);
    let survival = choose(52 - specialOutsideHand, 6) / choose(52, 6);
    if (gh === 0) {
      const remainingGH = 2;
      survival -= choose(52 - specialOutsideHand - remainingGH, 6 - remainingGH) / choose(52, 6);
    }
    sourceOpportunityUnconditional += p8 * startValidWeight * survival;
  });

  return {
    sourceBasicValid,
    sourceOpportunityUnconditional,
    sourceOpportunityAmongBasicValid: sourceOpportunityUnconditional / sourceBasicValid
  };
}

module.exports = { candidateForcedActiveMuk, candidateMukBenchGeometry, rank6GuzmaHalaVoltWindow };
