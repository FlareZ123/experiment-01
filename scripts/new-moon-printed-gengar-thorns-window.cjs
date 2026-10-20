'use strict';

const assert = require('node:assert/strict');
const manifest = require('../results/als/new-moon-lockbreak-english-proxy-60.json');

/**
 * Exact binomial coefficient in BigInt arithmetic.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  const count = Math.min(k, n - k);
  for (let i = 1; i <= count; i++) {
    result = result * BigInt(n - count + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function fraction(numerator, denominator) {
  assert.ok(denominator > 0n && numerator >= 0n && numerator <= denominator);
  const common = gcd(numerator, denominator);
  return {
    numerator: String(numerator / common),
    denominator: String(denominator / common),
    probability: Number(numerator) / Number(denominator)
  };
}

/**
 * Conditional legal-seven, first-draw, six-hidden-Prize opportunity for the
 * directly Active printed Horror House-GX pivot, with no Ability required.
 *
 * Conditions counted: unique Gengar & Mimikyu-GX is among the original seven,
 * and one Psychic-providing Energy is among the first eight physical cards,
 * OR one Fog Crystal is among those eight and an unprized Basic Psychic Energy
 * remains searchable in the deck. The three Telepathic Psychic Energy are
 * directly attachable but do not provide Psychic Energy while in the deck.
 *
 * The event is resource availability, not a played/settled attack or matchup.
 * It ignores optional mulligan draws, other searchers, tool/ability interactions,
 * alternative pivot attackers, retreats and the opponent's actual actions.
 *
 * @returns {object}
 */
function printedGengarWindow() {
  const counts = new Map(manifest.entries.map(e => [e.name_en, e.count]));
  assert.equal(manifest.counts.total, 60);
  assert.equal(manifest.counts['Pokémon'], 19);
  assert.equal(counts.get('Dusclops'), 2);
  assert.equal(counts.get('Gengar & Mimikyu-GX'), 1);
  assert.equal(counts.get('Basic Psychic Energy'), 3);
  assert.equal(counts.get('Telepathic Psychic Energy'), 3);
  assert.equal(counts.get('Fog Crystal'), 4);
  const basicPokemon = 19 - 2;
  const attachableEnergy = 6;
  const basicSearchableEnergy = 3;
  const fog = 4;
  const initialHand = 7;
  const nextDraw = 1;
  const prizes = 6;
  assert.equal(initialHand + nextDraw, 8);
  assert.equal(prizes, 6);
  assert.equal(attachableEnergy, 2 * basicSearchableEnergy);

  // Given Gengar in opening seven, the other six hand cards and next draw
  // form a uniform seven-card sample of the other 59 distinct cards.
  const legalSeven = choose(60, 7) - choose(60 - basicPokemon, 7);
  const gengarInLegalSeven = choose(59, 6);
  const remainingSeven = choose(59, 7);
  const noEnergy = choose(59 - attachableEnergy, 7);
  const noEnergyOrFog = choose(59 - attachableEnergy - fog, 7);
  const directEnergy = remainingSeven - noEnergy;
  const fogWithNoEnergy = noEnergy - noEnergyOrFog;

  // If the first eight show no Energy, all 3 Basic Psychic Energy cards
  // remain in the other 52. Six Prize cards contain all three with probability
  // choose(49,3) / choose(52,6). (First draw and Prizes are exchangeable.)
  const prizeConfigurations = choose(52, prizes);
  const allBasicEnergyPrized = choose(52 - basicSearchableEnergy,
    prizes - basicSearchableEnergy);
  const usableFog = prizeConfigurations - allBasicEnergyPrized;
  const denominator = legalSeven * remainingSeven * prizeConfigurations;
  const directNumerator = gengarInLegalSeven * directEnergy * prizeConfigurations;
  const fogNumerator = gengarInLegalSeven * fogWithNoEnergy * usableFog;

  return {
    sourceManifestHash: manifest.canonical_id_count_sha256,
    basicPokemon,
    physicalCounts: {gengar: 1, attachableEnergy, basicSearchableEnergy, fog},
    legalSeven: fraction(legalSeven, choose(60, 7)),
    gengarInLegalSeven: fraction(gengarInLegalSeven, legalSeven),
    directlySeenEnergy: fraction(directNumerator, denominator),
    fogBasicEnergySupplement: fraction(fogNumerator, denominator),
    total: fraction(directNumerator + fogNumerator, denominator)
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(printedGengarWindow(), null, 2) + '\n');
}

module.exports = {choose, fraction, printedGengarWindow};
