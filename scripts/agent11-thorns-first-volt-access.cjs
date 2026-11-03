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
 * The unordered eight-card hand has weight 7 when exactly one Basic is
 * present because it appeared in the starting seven with probability 7/8.
 * Otherwise a hand with 2+ Basics has weight 8.
 *
 * @param {1 | 3} doubleColorlessCopies
 * @returns {{denominator:bigint,available:bigint,direct:bigint,supporter:bigint}}
 */
function exactAccess(doubleColorlessCopies) {
  const d = doubleColorlessCopies;
  const others = 51 - d;
  let denominator = 0n;
  let available = 0n;
  let direct = 0n;
  let supporter = 0n;

  for (let b = 1; b <= 4; b++) {
    const startWeight = b === 1 ? 7n : 8n;
    for (let tag = 0; tag <= 2; tag++) {
      for (let gh = 0; gh <= 2; gh++) {
        for (let mountain = 0; mountain <= 1; mountain++) {
          for (let energy = 0; energy <= d; energy++) {
            const otherHand = 8 - b - tag - gh - mountain - energy;
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
                  if (mountainAvailable && energyAvailable && (bothHeld || ghAccessible)) {
                    available += ways;
                    if (bothHeld) direct += ways;
                    else supporter += ways;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return { denominator, available, direct, supporter };
}

module.exports = { choose, exactAccess };
