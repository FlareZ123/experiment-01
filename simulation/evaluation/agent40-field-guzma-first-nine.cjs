'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent40-field-guzma-first-nine-v1';
const SOURCE = 'results/aichi-2026/full-decklists.json';
const BASICS = 'results/aichi-2026/agent3-original-29-first-seven-basic-census-20261104.json';
const MISSING = [23, 25, 28];

/**
 * Exact integer binomial coefficient.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  const m = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= m; i++) {
    value = (value * BigInt(n - m + i)) / BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * Condition on at least one Basic in the first seven cards of one fixed 60.
 * Count an original direct Guzma if it occurs among the initial seven or
 * the next (seen-7) ordinary draws; six hidden Prizes are marginalized.
 * This is a sighting event, never a certificate that Guzma remains held or
 * can be legally and advantageously played after a lock turn.
 *
 * @param {number} guzmaCopies Genuine 'Guzma' printed card count.
 * @param {number} basicCopies Basic Pokémon card count.
 * @param {7|8|9} [seen]
 * @returns {{numerator:bigint,denominator:bigint,percent:number}}
 */
function exactNaturalGuzmaSighting(guzmaCopies, basicCopies, seen = 9) {
  assert.ok(Number.isSafeInteger(guzmaCopies) && guzmaCopies >= 0);
  assert.ok(Number.isSafeInteger(basicCopies) && basicCopies >= 1);
  assert.ok(guzmaCopies + basicCopies <= 60);
  assert.ok([7, 8, 9].includes(seen));
  const draws = seen - 7;
  const validOpeners = choose(60, 7) - choose(60 - basicCopies, 7);
  const denominator = validOpeners * choose(53, draws);
  const validNoGuzmaOpeners =
    choose(60 - guzmaCopies, 7) -
    choose(60 - guzmaCopies - basicCopies, 7);
  const noGuzma = validNoGuzmaOpeners * choose(53 - guzmaCopies, draws);
  const numerator = denominator - noGuzma;
  assert.ok(denominator > 0n && numerator >= 0n && numerator <= denominator);
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
    percent: 100 * Number(numerator) / Number(denominator)
  };
}

/**
 * Inventory-verified read-only census of all currently authenticated sources.
 * The separate Basic snapshot is an existing repository source derivation;
 * neither input is a source of live hidden cards to an automated player.
 *
 * @param {object} field
 * @param {object} basicSnapshot
 * @returns {{version:string,known:number,missing:number[],guzmaRanks:number,
 *   guzmaCopies:number,zeroGuzmaRanks:number[],equalRankMeanPercent:number,
 *   rows:object[]}}
 */
function analyzeOriginalField(field, basicSnapshot) {
  assert.equal(field?.decks?.length, 29);
  assert.deepEqual(field.missing_full_lists.map(x => x.rank).sort((a, b) => a - b), MISSING);
  assert.equal(basicSnapshot?.ranks?.length, 29);
  const basics = new Map(basicSnapshot.ranks.map(x => [x.rank, x.basics]));
  assert.equal(basics.size, 29);
  const uniqueRanks = new Set();
  const rows = field.decks.map(deck => {
    assert.ok(!uniqueRanks.has(deck.rank));
    uniqueRanks.add(deck.rank);
    assert.equal(deck.cards.reduce((sum, card) => sum + card.count, 0), 60);
    const basicCopies = basics.get(deck.rank);
    const guzmaCopies = deck.cards
      .filter(card => card.name === 'Guzma' && card.category === 'Trainer')
      .reduce((sum, card) => sum + card.count, 0);
    assert.ok(Number.isSafeInteger(basicCopies) && basicCopies >= 1);
    assert.ok(guzmaCopies + basicCopies <= 60);
    const opportunity = exactNaturalGuzmaSighting(guzmaCopies, basicCopies);
    return {
      rank: deck.rank,
      archetype: deck.archetype,
      basicCopies,
      guzmaCopies,
      numerator: opportunity.numerator.toString(),
      denominator: opportunity.denominator.toString(),
      percent: opportunity.percent
    };
  }).sort((a, b) => a.rank - b.rank);
  assert.deepEqual([...uniqueRanks].sort((a, b) => a - b), [...basics.keys()].sort((a, b) => a - b));
  return {
    version: VERSION,
    sources: [SOURCE, BASICS],
    known: rows.length,
    missing: MISSING,
    guzmaRanks: rows.filter(row => row.guzmaCopies > 0).length,
    guzmaCopies: rows.reduce((sum, row) => sum + row.guzmaCopies, 0),
    zeroGuzmaRanks: rows.filter(row => !row.guzmaCopies).map(row => row.rank),
    equalRankMeanPercent: rows.reduce((sum, row) => sum + row.percent, 0) / rows.length,
    rows
  };
}

/** @param {string} relative @returns {object} */
function loadRepositoryJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../..', relative), 'utf8'));
}

if (require.main === module) {
  console.log(JSON.stringify(analyzeOriginalField(
    loadRepositoryJson(SOURCE), loadRepositoryJson(BASICS)), null, 2));
}
module.exports = {
  VERSION, SOURCE, BASICS, MISSING, choose, exactNaturalGuzmaSighting,
  analyzeOriginalField
};
