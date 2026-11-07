'use strict';

/**
 * Exact Prize-only obstruction model for the rank-1 Mimikyu/Copycat four-Basic
 * response package. This is an optimistic access bound, not a game simulator.
 *
 * @typedef {object} CopycatPackage
 * @property {number} mimikyuCopies
 * @property {number} dialgaGxCopies
 * @property {number} radiantEternatusCopies
 * @property {number} lilliesClefairyExCopies
 * @property {number} otherBasicCopies
 * @property {number} heavyBallCopies
 * @property {number} totalCards
 * @property {number} handSize
 * @property {number} prizeCount
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    throw new TypeError('Combination arguments must be integers');
  }
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    value = value * BigInt(n - i + 1) / BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a < 0n ? -a : a;
}

/**
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {{numerator:string,denominator:string}}
 */
function reduceFraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: String(numerator / divisor),
    denominator: String(denominator / divisor)
  };
}

/**
 * Enumerate the joint distribution of six Prizes and a legal seven-card
 * opening hand. A role is missing only when every copy of that role is prized.
 * Each unprized Heavy Ball is optimistically counted as one recovery.
 *
 * @param {CopycatPackage & {fieldCopies?:number,fieldSize?:number}} input
 * @returns {object}
 */
function enumerateCopycatPrizeCut(input) {
  const {
    mimikyuCopies, dialgaGxCopies, radiantEternatusCopies,
    lilliesClefairyExCopies, otherBasicCopies, heavyBallCopies,
    totalCards, handSize, prizeCount,
    fieldCopies = 11, fieldSize = 32
  } = input;
  const counts = [mimikyuCopies, dialgaGxCopies, radiantEternatusCopies,
    lilliesClefairyExCopies, otherBasicCopies, heavyBallCopies,
    totalCards, handSize, prizeCount, fieldCopies, fieldSize];
  if (counts.some(value => !Number.isInteger(value) || value < 0) ||
      totalCards <= 0 || handSize > totalCards - prizeCount ||
      prizeCount > totalCards || fieldSize <= 0 || fieldCopies > fieldSize) {
    throw new RangeError('Invalid Prize-cut model configuration');
  }
  const basicCopies = mimikyuCopies + dialgaGxCopies +
    radiantEternatusCopies + lilliesClefairyExCopies + otherBasicCopies;
  const otherNonBasicCopies = totalCards - basicCopies - heavyBallCopies;
  if (otherNonBasicCopies < 0) {
    throw new RangeError('Card counts exceed the fixed deck size');
  }

  const totalOpeningHands = choose(totalCards - prizeCount, handSize);
  let totalWeight = 0n;
  let blockedWeight = 0n;
  let prizeCompositions = 0;

  for (let pm = 0; pm <= mimikyuCopies; pm++) {
    for (let pd = 0; pd <= dialgaGxCopies; pd++) {
      for (let pr = 0; pr <= radiantEternatusCopies; pr++) {
        for (let pc = 0; pc <= lilliesClefairyExCopies; pc++) {
          for (let ph = 0; ph <= heavyBallCopies; ph++) {
            for (let pb = 0; pb <= otherBasicCopies; pb++) {
              const po = prizeCount - pm - pd - pr - pc - ph - pb;
              if (po < 0 || po > otherNonBasicCopies) continue;
              const prizeWays = choose(mimikyuCopies, pm) *
                choose(dialgaGxCopies, pd) *
                choose(radiantEternatusCopies, pr) *
                choose(lilliesClefairyExCopies, pc) *
                choose(heavyBallCopies, ph) *
                choose(otherBasicCopies, pb) *
                choose(otherNonBasicCopies, po);
              const remainingBasics = mimikyuCopies - pm +
                dialgaGxCopies - pd +
                radiantEternatusCopies - pr +
                lilliesClefairyExCopies - pc +
                otherBasicCopies - pb;
              const legalOpeningHands = totalOpeningHands -
                choose(totalCards - prizeCount - remainingBasics, handSize);
              const weight = prizeWays * legalOpeningHands;
              const missingRoles = Number(pm === mimikyuCopies) +
                Number(pd === dialgaGxCopies) +
                Number(pr === radiantEternatusCopies) +
                Number(pc === lilliesClefairyExCopies);
              const availableHeavyBalls = heavyBallCopies - ph;
              totalWeight += weight;
              prizeCompositions += 1;
              if (missingRoles > availableHeavyBalls) blockedWeight += weight;
            }
          }
        }
      }
    }
  }

  const cut = reduceFraction(blockedWeight, totalWeight);
  const fieldWeighted = reduceFraction(
    blockedWeight * BigInt(fieldCopies),
    totalWeight * BigInt(fieldSize)
  );
  const cutPercent = Number(blockedWeight) / Number(totalWeight) * 100;
  const fieldWeightedPercentagePoints =
    Number(fieldWeighted.numerator) / Number(fieldWeighted.denominator) * 100;

  return {
    heavyBallCopies,
    otherNonBasicCopies,
    basicCopies,
    totalWeight: String(totalWeight),
    blockedWeight: String(blockedWeight),
    prizeCompositions,
    prizeOnlyObstruction: cut,
    prizeOnlyObstructionPercent: cutPercent,
    fieldWeightedContribution: fieldWeighted,
    fieldWeightedContributionPercentagePoints: fieldWeightedPercentagePoints,
    legalOpeningProbability: 1 -
      Number(choose(totalCards - basicCopies, handSize)) /
      Number(choose(totalCards, handSize))
  };
}

/** @returns {object} Reproducible 1x/2x/3x Heavy Ball sensitivity table. */
function runCopycatHeavyBallSensitivity() {
  const base = {
    mimikyuCopies: 1,
    dialgaGxCopies: 1,
    radiantEternatusCopies: 1,
    lilliesClefairyExCopies: 2,
    otherBasicCopies: 9,
    totalCards: 60,
    handSize: 7,
    prizeCount: 6,
    fieldCopies: 11,
    fieldSize: 32
  };
  const variants = [1, 2, 3].map(heavyBallCopies =>
    enumerateCopycatPrizeCut({...base, heavyBallCopies}));
  const basePercent = variants[0].prizeOnlyObstructionPercent;
  for (const variant of variants) {
    variant.reductionVsOneCopy = basePercent /
      variant.prizeOnlyObstructionPercent;
  }
  return {
    schema: 'agent6-copycat-four-basic-heavyball-prize-cut-v1',
    evidenceClass: 'exact finite combinatorics, optimistic necessary-condition bound',
    assumptions: {
      deck: 'rank-1 Aichi Open 2026 list, 60 cards',
      requiredBasicRoles: [
        'Mimikyu GRI 58',
        'Dialga-GX UPR 100',
        'Radiant Eternatus CRZ 105',
        "at least one Lillie's Clefairy ex JTG 56"
      ],
      otherBasics: 9,
      prizeCount: 6,
      openingHand: 7,
      legalOpening: 'at least one Basic Pokémon',
      recovery: 'each unprized Heavy Ball can recover one missing Basic role',
      fieldWeight: '11 Regidrago lists out of 32, with every Prize obstruction treated as a loss'
    },
    variants
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runCopycatHeavyBallSensitivity(), null, 2) + '\n');
}

module.exports = {
  choose,
  reduceFraction,
  enumerateCopycatPrizeCut,
  runCopycatHeavyBallSensitivity
};
