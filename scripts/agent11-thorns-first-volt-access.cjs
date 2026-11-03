'use strict';

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    v = v * BigInt(n + 1 - i) / BigInt(i);
  }
  return v;
}

/**
 * Exact physical availability of going-second first-turn Volt Cyclone through
 * Thunder Mountain Prism Star + Double Colorless Energy, with optional
 * Tag Call -> Guzma & Hala and one ordinary hand Energy attachment.
 *
 * Conditions: 4 Iron Thorns ex are the only Basics; 2 Tag Call; 2
 * Guzma & Hala; 1 Thunder Mountain; d Double Colorless. Opening seven must
 * contain a Basic. Six uniformly random Prizes are set before the ordinary
 * turn draw. No mulligan bonuses, other draw/search, opposing interaction,
 * or strategically protected discards are modeled.
 *
 * The physical 2-card Guzma & Hala cost is always possible from the starting
 * eight-card hand if enhanced search is needed, even after playing Tag Call.
 * This says nothing about the strategic desirability of those discards.
 *
 * For a hand of size H=8+bonusDraws, its numerator multiplier is
 * C(H,7)-C(H-Basics,7), counting starting-seven placements with a Basic.
 * For H=8 this gives weights 7 (one Basic) or 8 (two or more Basics).
 *
 * @param {1 | 3} doubleColorlessCopies
 * @param {number} bonusDraws Maximum optional opponent-mulligan bonus cards actually drawn
 * @returns {{denominator:bigint,available:bigint,direct:bigint,supporter:bigint,mountainPrized:bigint,dcePrized:bigint,noConnector:bigint,ghHand:bigint,tagBridge:bigint}}
 */
function exactAccess(doubleColorlessCopies, bonusDraws = 0) {
  const d = doubleColorlessCopies;
  const handSize = 8 + bonusDraws;
  const others = 51 - d;
  let denominator = 0n;
  let available = 0n;
  let direct = 0n;
  let supporter = 0n;
  let mountainPrized = 0n;
  let dcePrized = 0n;
  let noConnector = 0n;
  let ghHand = 0n;
  let tagBridge = 0n;

  for (let b = 1; b <= 4; b++) {
    const startWeight = choose(handSize, 7) - choose(handSize - b, 7);
    for (let tag = 0; tag <= 2; tag++) {
      for (let gh = 0; gh <= 2; gh++) {
        for (let mountain = 0; mountain <= 1; mountain++) {
          for (let energy = 0; energy <= d; energy++) {
            const otherHand = handSize - b - tag - gh - mountain - energy;
            if (otherHand < 0 || otherHand > others) continue;
            const handWays = startWeight * choose(4, b) * choose(2, tag)
              * choose(2, gh) * choose(1, mountain) * choose(d, energy)
              * choose(others, otherHand);
            const ordinaryRemainder = (4 - b) + (2 - tag) + (others - otherHand);
            for (let pg = 0; pg <= 2 - gh; pg++) {
              for (let pm = 0; pm <= 1 - mountain; pm++) {
                for (let pe = 0; pe <= d - energy; pe++) {
                  const otherPrize = 6 - pg - pm - pe;
                  if (otherPrize < 0 || otherPrize > ordinaryRemainder) continue;
                  const ways = handWays * choose(2 - gh, pg)
                    * choose(1 - mountain, pm) * choose(d - energy, pe)
                    * choose(ordinaryRemainder, otherPrize);
                  denominator += ways;
                  const mountainAvailable = mountain > 0 || pm === 0;
                  const energyAvailable = energy > 0 || d - energy - pe > 0;
                  const bothHeld = mountain > 0 && energy > 0;
                  const ghAccessible = gh > 0 || (tag > 0 && 2 - gh - pg > 0);
                  if (!mountainAvailable) mountainPrized += ways;
                  else if (!energyAvailable) dcePrized += ways;
                  else if (bothHeld) {
                    available += ways;
                    direct += ways;
                  } else if (ghAccessible) {
                    available += ways;
                    supporter += ways;
                    if (gh > 0) ghHand += ways;
                    else tagBridge += ways;
                  } else noConnector += ways;
                }
              }
            }
          }
        }
      }
    }
  }
  return { denominator, available, direct, supporter, mountainPrized, dcePrized, noConnector, ghHand, tagBridge };
}

/**
 * Source receives max(0, Y-X) optional bonus draws. X/Y are independent
 * geometric counts of valid opening seven attempts for source/opponent.
 * Source has 4 Basics; opponent has opposingBasics.
 * @param {number} opposingBasics
 * @param {number} k
 * @returns {number}
 */
function bonusProbability(opposingBasics, k) {
  const pSource = 1 - Number(choose(56, 7)) / Number(choose(60, 7));
  const pOpponent = 1 - Number(choose(60 - opposingBasics, 7)) / Number(choose(60, 7));
  const denominator = pSource + pOpponent - pSource * pOpponent;
  if (k === 0) return 1 - pSource * (1 - pOpponent) / denominator;
  return pSource * pOpponent * (1 - pOpponent) ** k / denominator;
}

/**
 * Exactly enumerates conditional physical access for each bonus count and
 * mixes over the simultaneous two-player mulligan process. Ignores strategic
 * choices to decline any bonus draw; assumes the owner takes all available.
 *
 * @param {1 | 3} doubleColorlessCopies
 * @param {number} opposingBasics
 * @param {number} maximumBonus
 * @returns {{probability:number,omittedMass:number}}
 */
function withMaxMulliganBonuses(doubleColorlessCopies, opposingBasics, maximumBonus = 40) {
  const pSource = 1 - Number(choose(56, 7)) / Number(choose(60, 7));
  const pOpponent = 1 - Number(choose(60 - opposingBasics, 7)) / Number(choose(60, 7));
  const denominator = pSource + pOpponent - pSource * pOpponent;
  let probability = 0;
  for (let k = 0; k <= maximumBonus; k++) {
    const counts = exactAccess(doubleColorlessCopies, k);
    probability += bonusProbability(opposingBasics, k)
      * Number(counts.available) / Number(counts.denominator);
  }
  const omittedMass = pSource * (1 - pOpponent) ** (maximumBonus + 1) / denominator;
  return { probability, omittedMass };
}

module.exports = { choose, exactAccess, bonusProbability, withMaxMulliganBonuses };
