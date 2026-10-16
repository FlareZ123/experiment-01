'use strict';

/**
 * Exact, Prize-aware static rescue capacity for two unique Basic Pokémon.
 *
 * Main use: Aichi 2026 champion's Mimikyu GRI and Dialga-GX UPR,
 * rescued by one or more Hisuian Heavy Ball copies if Prized.
 * The independent source list has 14 Basic Pokémon, including the targets.
 * The model conditions on at least one Basic in the ordinary starting hand.
 *
 * Availability of unprized Heavy Balls is assumed. This counts physically
 * impossible rescue-capacity configurations, NOT overall route access or wins.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const steps = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= steps; i++) {
    value = value * BigInt(n - steps + i) / BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

/**
 * @param {{deckSize:number,openingSize:number,prizeSize:number,
 *   otherBasics:number,recoveryCopies:number}} setup
 * @returns {{badNumerator:bigint,legalDenominator:bigint,
 *   reducedNumerator:bigint,reducedDenominator:bigint,probability:number}}
 */
function criticalPrizeCollapse(setup) {
  const {deckSize, openingSize, prizeSize, otherBasics, recoveryCopies} = setup;
  const otherNonbasic = deckSize - 2 - otherBasics - recoveryCopies;
  if (![deckSize, openingSize, prizeSize, otherBasics, recoveryCopies]
    .every(n => Number.isInteger(n) && n >= 0) ||
    otherNonbasic < 0 || deckSize <= openingSize + prizeSize ||
    otherBasics + 2 < 1) {
    throw new Error('Invalid basic/Pokémon rescue scenario');
  }

  let badNumerator = 0n;
  let legalDenominator = 0n;
  const remaining = deckSize - prizeSize;
  for (let prizedM = 0; prizedM <= 1; prizedM++) {
    for (let prizedD = 0; prizedD <= 1; prizedD++) {
      for (let prizedRecovery = 0; prizedRecovery <= recoveryCopies; prizedRecovery++) {
        for (let prizedOtherBasic = 0;
          prizedOtherBasic <= Math.min(otherBasics, prizeSize); prizedOtherBasic++) {
          const prizedNonbasic = prizeSize - prizedM - prizedD -
            prizedRecovery - prizedOtherBasic;
          if (prizedNonbasic < 0 || prizedNonbasic > otherNonbasic) continue;

          const prizeWays =
            choose(recoveryCopies, prizedRecovery) *
            choose(otherBasics, prizedOtherBasic) *
            choose(otherNonbasic, prizedNonbasic);
          const nonbasicRemaining = recoveryCopies - prizedRecovery +
            otherNonbasic - prizedNonbasic;
          const validHands =
            choose(remaining, openingSize) -
            choose(nonbasicRemaining, openingSize);
          const configurations = prizeWays * validHands;
          legalDenominator += configurations;
          if (prizedM + prizedD > recoveryCopies - prizedRecovery) {
            badNumerator += configurations;
          }
        }
      }
    }
  }
  const factor = gcd(badNumerator, legalDenominator);
  return {
    badNumerator, legalDenominator,
    reducedNumerator: badNumerator / factor,
    reducedDenominator: legalDenominator / factor,
    probability: Number(badNumerator) / Number(legalDenominator)
  };
}

if (require.main === module) {
  const result = [0, 1, 2, 3].map(recoveryCopies => {
    const sample = criticalPrizeCollapse({
      deckSize: 60, openingSize: 7, prizeSize: 6,
      otherBasics: 12, recoveryCopies
    });
    return {
      hisuianHeavyBallCopies: recoveryCopies,
      collapseProbabilityGivenValidOpener: sample.probability,
      exactFraction: String(sample.reducedNumerator) + '/' +
        String(sample.reducedDenominator),
      assumptions: 'Unprized Heavy Balls retrievable; no Prizes taken'
    };
  });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = {choose, criticalPrizeCollapse};
