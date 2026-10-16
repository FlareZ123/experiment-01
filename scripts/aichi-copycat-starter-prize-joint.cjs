'use strict';

const {choose} = require('./aichi-champion-critical-prize-collapse.cjs');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
    probability: Number(numerator) / Number(denominator)
  };
}

/**
 * Joint distribution of an opening that *forces* Mimikyu or Dialga-GX
 * as the Active starter, and of insufficient unprized Hisuian Heavy
 * Ball copies to recover these two singleton Basic Pokémon if Prized.
 *
 * Four uniform physical zones: seven-card opening; six subsequent
 * face-down Prizes; remaining deck; unassigned Active chosen from
 * opening Basics. Condition on an opening containing at least one Basic.
 * This model uses a category combinatorial census, including overlap;
 * it does not model attacks, board choices, Item lock, searching, or wins.
 *
 * @param {{deckSize:number,openingSize:number,prizeSize:number,
 *   otherBasics:number,recoveryCopies:number}} config
 */
function criticalStarterPrizeJoint(config) {
  const {deckSize, openingSize, prizeSize, otherBasics, recoveryCopies} = config;
  const otherNonbasics = deckSize - 2 - otherBasics - recoveryCopies;
  if (![deckSize, openingSize, prizeSize, otherBasics, recoveryCopies]
    .every(n => Number.isInteger(n) && n >= 0) ||
    openingSize < 1 || prizeSize < 1 ||
    deckSize <= openingSize + prizeSize || otherNonbasics < 0) {
    throw new Error('Invalid starter/rescue configuration');
  }

  const initial = [1, 1, otherBasics, recoveryCopies, otherNonbasics];
  let valid = 0n;
  let forced = 0n;
  let stranded = 0n;
  let intersection = 0n;

  // Counts of Mimikyu, Dialga-GX, other Basics and Heavy Balls
  // in the initial seven; remaining slots are other nonbasics.
  for (let m = 0; m <= 1; m++) {
    for (let d = 0; d <= 1; d++) {
      for (let b = 0; b <= Math.min(otherBasics, openingSize); b++) {
        for (let h = 0; h <= Math.min(recoveryCopies, openingSize); h++) {
          const n = openingSize - m - d - b - h;
          if (m + d + b === 0 || n < 0 || n > otherNonbasics) continue;
          const hand = [m, d, b, h, n];
          const handWays = hand.reduce(
            (ways, count, i) => ways * choose(initial[i], count), 1n);
          if (!handWays) continue;
          const remaining = initial.map((count, i) => count - hand[i]);
          const forcedStarter = b === 0 && m + d > 0;

          // Enumerate Prizes conditional on this physical opening.
          for (let pm = 0; pm <= remaining[0]; pm++) {
            for (let pd = 0; pd <= remaining[1]; pd++) {
              for (let pb = 0; pb <= Math.min(remaining[2], prizeSize); pb++) {
                for (let ph = 0; ph <= Math.min(remaining[3], prizeSize); ph++) {
                  const pn = prizeSize - pm - pd - pb - ph;
                  if (pn < 0 || pn > remaining[4]) continue;
                  const prize = [pm, pd, pb, ph, pn];
                  const prizeWays = prize.reduce(
                    (ways, count, i) => ways * choose(remaining[i], count), 1n);
                  const ways = handWays * prizeWays;
                  const rescueFailure = pm + pd > recoveryCopies - ph;
                  valid += ways;
                  if (forcedStarter) forced += ways;
                  if (rescueFailure) stranded += ways;
                  if (forcedStarter && rescueFailure) intersection += ways;
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    validDealCount: valid,
    forcedCriticalStarter: fraction(forced, valid),
    strandedPrizeCapacity: fraction(stranded, valid),
    simultaneous: fraction(intersection, valid),
    either: fraction(forced + stranded - intersection, valid)
  };
}

if (require.main === module) {
  const cases = [0, 1, 2, 3].map(recoveryCopies => {
    const result = criticalStarterPrizeJoint({
      deckSize: 60, openingSize: 7, prizeSize: 6,
      otherBasics: 12, recoveryCopies
    });
    const visible = {};
    for (const name of ['forcedCriticalStarter', 'strandedPrizeCapacity',
      'simultaneous', 'either']) {
      const row = result[name];
      visible[name] = {
        probability: row.probability,
        fraction: String(row.numerator) + '/' + String(row.denominator)
      };
    }
    return {recoveryCopies, ...visible};
  });
  process.stdout.write(JSON.stringify(cases, null, 2) + '\n');
}

module.exports = {criticalStarterPrizeJoint};
