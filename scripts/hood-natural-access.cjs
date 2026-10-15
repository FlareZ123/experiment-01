'use strict';

/**
 * Exact finite-population count with BigInt intermediate results.
 *
 * @param {number} n Population size.
 * @param {number} k Selected count.
 * @returns {bigint} Number of unordered k-card selections.
 */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0) {
    throw new RangeError('Combination inputs must be nonnegative integers');
  }
  if (k > n) return 0n;
  const size = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= size; i++) {
    result = result * BigInt(n - size + i) / BigInt(i);
  }
  return result;
}

/**
 * Chance of naturally finding >=1 Stealthy Hood in a hypothetical 60-card
 * list with the champion's 14 Basic Pokémon unchanged. The h Hood cards
 * replace only non-Basic slots; no cards are drawn through Trainer effects.
 * First-draw models six uniform prizes after the legal initial seven cards.
 *
 * @param {number} hoodCopies Number of Hoods included (0-4).
 * @param {number} [basicPokemon] Number of Basic Pokémon, default 14.
 * @returns {{hoodCopies:number,basicPokemon:number,validOpening:number,hoodInValidOpening:number,hoodAfterFirstDraw:number}}
 */
function hoodNaturalAccess(hoodCopies, basicPokemon = 14) {
  if (!Number.isInteger(hoodCopies) || hoodCopies < 0 || hoodCopies > 4) {
    throw new RangeError('hoodCopies must be an integer from 0 through 4');
  }
  if (!Number.isInteger(basicPokemon) || basicPokemon < 1 ||
      basicPokemon + hoodCopies > 60) {
    throw new RangeError('Invalid Basic count');
  }

  const total = choose(60, 7);
  const valid = total - choose(60 - basicPokemon, 7);
  const validNoHood = choose(60 - hoodCopies, 7) -
    choose(60 - hoodCopies - basicPokemon, 7);
  const noHoodProbability = Number(validNoHood) / Number(valid);

  return {
    hoodCopies, basicPokemon,
    validOpening: Number(valid) / Number(total),
    hoodInValidOpening: 1 - noHoodProbability,
    hoodAfterFirstDraw: 1 - noHoodProbability * (53 - hoodCopies) / 53
  };
}

if (require.main === module) {
  console.log(JSON.stringify({
    kind: 'exact-conditional-natural-hood-access',
    sourceBaseline: 'Aichi rank-1 Shadow Rider Calyrex, 14 Basic Pokémon',
    limitations: 'No search, mulligan bonus draws, evolution requirements, or opponent interaction',
    counts: [0, 1, 2, 3, 4].map(h => hoodNaturalAccess(h))
  }, null, 2));
}

module.exports = { choose, hoodNaturalAccess };
