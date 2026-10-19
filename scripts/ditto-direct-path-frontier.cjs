'use strict';

/**
 * Exact first-eight-card visibility frontier for the limited Ditto 30C 115
 * Tag Call / Guzma & Hala / Glimwood Tangle Stage-2 direct-search route.
 *
 * Cards are disjoint classes: 4 Ditto, 8 connectors, targetCopies Stage-2
 * targets, otherBasics non-Ditto Basics, and all remaining cards.
 * Observations: opening 7, six face-down Prizes, one ordinary turn draw.
 * The Stage-2 target must remain in the 46-card deck after that draw.
 * No assumptions about actually playing the cards or winning are made.
 */

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n || n < 0) return 0;
  const count = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= count; i += 1) value *= (n - i + 1) / i;
  return value;
}

/**
 * @param {number} otherBasics Additional Basic Pokemon, excluding 4 Ditto.
 * @param {number} targetCopies Copies of one searchable Stage-2 lock target.
 * @returns {{legalOpening: number, directVisibility: number, withOneRerollCeiling: number}}
 */
function dittoDirectPathFrontier(otherBasics, targetCopies) {
  if (!Number.isInteger(otherBasics) || otherBasics < 0 ||
      !Number.isInteger(targetCopies) || targetCopies < 1 || targetCopies > 4 ||
      otherBasics + targetCopies > 48) {
    throw new RangeError('Expect 0..48 other Basics and 1..4 targets within 60 slots');
  }

  const other = 60 - 4 - 8 - targetCopies - otherBasics;
  const openingDenominator = choose(60, 7);
  const prizeDenominator = choose(53, 6);
  const legalOpening = 1 - choose(56 - otherBasics, 7) / openingDenominator;
  let jointEvent = 0;

  for (let ditto = 1; ditto <= 4; ditto += 1) {
    for (let connector = 0; connector <= 8; connector += 1) {
      for (let target = 0; target <= targetCopies; target += 1) {
        for (let basic = 0; basic <= otherBasics; basic += 1) {
          const filler = 7 - ditto - connector - target - basic;
          if (filler < 0 || filler > other) continue;
          const openingWeight = (
            choose(4, ditto) * choose(8, connector) *
            choose(targetCopies, target) * choose(otherBasics, basic) *
            choose(other, filler) / openingDenominator
          );

          const remainingConnector = 8 - connector;
          const remainingTarget = targetCopies - target;
          const remainingOther = 53 - remainingConnector - remainingTarget;

          for (let prizedConnector = 0; prizedConnector <= Math.min(6, remainingConnector); prizedConnector += 1) {
            for (let prizedTarget = 0; prizedTarget <= Math.min(6 - prizedConnector, remainingTarget); prizedTarget += 1) {
              const prizeWeight = (
                choose(remainingConnector, prizedConnector) *
                choose(remainingTarget, prizedTarget) *
                choose(remainingOther, 6 - prizedConnector - prizedTarget) /
                prizeDenominator
              );
              const targetInDeckBeforeDraw = remainingTarget - prizedTarget;
              if (!targetInDeckBeforeDraw) continue;

              // With a connector already in the initial seven, the eighth
              // draw must not take the last deck target.
              const nextDrawWeight = connector > 0
                ? (targetInDeckBeforeDraw === 1 ? 46 / 47 : 1)
                : (remainingConnector - prizedConnector) / 47;
              jointEvent += openingWeight * prizeWeight * nextDrawWeight;
            }
          }
        }
      }
    }
  }

  const directVisibility = jointEvent / legalOpening;
  return {
    legalOpening,
    directVisibility,
    // One independent Glimwood Tangle retry: heads on either attempt.
    withOneRerollCeiling: directVisibility * 0.75
  };
}

module.exports = { choose, dittoDirectPathFrontier };
