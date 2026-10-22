'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const TAG_TEAM_NAMES = new Set([
  'Mewtwo & Mew-GX',
  'Gengar & Mimikyu-GX',
  'Trevenant & Dusknoir-GX'
]);

const MULTI_PRIZE_BASICS = new Set([
  'Mewtwo & Mew-GX', 'Gengar & Mimikyu-GX',
  'Trevenant & Dusknoir-GX', 'Tapu Lele-GX',
  'Galarian Articuno V', 'Latias ex',
  "Lillie's Clefairy ex", 'Squawkabilly ex',
  'Shadow Rider Calyrex V', 'Dialga-GX'
]);

/**
 * Exact binomial coefficient.
 * @param {number} n Nonnegative population size.
 * @param {number} k Selection size.
 * @returns {bigint}
 */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k) && k >= 0);
  if (k > n) return 0n;
  const m = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= m; i++) {
    result = result * BigInt(n - m + i) / BigInt(i);
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
 * @returns {{numerator:string,denominator:string,percent:number}}
 */
function fraction(numerator, denominator) {
  assert.ok(denominator > 0n && numerator >= 0n &&
    numerator <= denominator);
  const divisor = gcd(numerator, denominator);
  return {
    numerator: String(numerator / divisor),
    denominator: String(denominator / divisor),
    percent: 100 * Number(numerator) / Number(denominator)
  };
}

/**
 * The original seven is redrawn until at least one eligible Basic is present.
 * The forced-marked event occurs if no other Basic is in that opening seven.
 * Any optional opponent-mulligan bonus comes after selecting the starting
 * Active, so it cannot change this opening-Active choice.
 *
 * @param {{deckSize:number,openingSize:number,markedBasics:number,
 *   otherBasics:number}} counts
 * @returns {{validOpening:object,forcedMarkedGivenValid:object,
 *   unconditionalForcedMarked:object,mulligan:object}}
 */
function exactForcedOpening(counts) {
  const {deckSize,openingSize,markedBasics,otherBasics} = counts;
  for (const n of Object.values(counts))
    assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(markedBasics > 0 && openingSize <= deckSize);
  assert.ok(markedBasics + otherBasics <= deckSize);
  const total = choose(deckSize, openingSize);
  const invalid = choose(deckSize - markedBasics - otherBasics,
    openingSize);
  const valid = total - invalid;
  const forced = choose(deckSize - otherBasics, openingSize) - invalid;
  return {
    validOpening: fraction(valid, total),
    forcedMarkedGivenValid: fraction(forced, valid),
    unconditionalForcedMarked: fraction(forced, total),
    mulligan: fraction(invalid, total)
  };
}

/**
 * Categorize the two immutable published/proposed inventories by card name.
 * The only non-Basic Pokémon in these particular lists are checked explicitly
 * rather than inferred from a generic string suffix.
 * @param {Array<{name:string,count:number,category?:string,type?:string}>} rows
 * @param {Set<string>} evolutions
 * @returns {{deckSize:number,basics:number,tagTeams:number,mewtwo:number,multiPrizeBasics:number}}
 */
function countFrozenInventory(rows, evolutions) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  assert.equal(total, 60);
  const pokemon = rows.filter(row =>
    row.category === 'Pokémon' || row.type === 'Pokémon');
  for (const row of pokemon)
    assert.ok(Number.isSafeInteger(row.count) && row.count > 0);
  for (const name of evolutions)
    assert.ok(pokemon.some(row => row.name === name));
  const basics = pokemon.filter(row => !evolutions.has(row.name));
  const basicCount = basics.reduce((sum, row) => sum + row.count, 0);
  const tagTeams = basics.filter(row => TAG_TEAM_NAMES.has(row.name))
    .reduce((sum, row) => sum + row.count, 0);
  const mewtwo = basics.filter(row => row.name === 'Mewtwo & Mew-GX')
    .reduce((sum, row) => sum + row.count, 0);
  const multiPrizeBasics = basics.filter(row =>
    MULTI_PRIZE_BASICS.has(row.name))
    .reduce((sum, row) => sum + row.count, 0);
  return {deckSize:total,basics:basicCount,tagTeams,mewtwo,multiPrizeBasics};
}

/** @returns {object} Independently auditable immutable-deck results. */
function frozenOpeningAudit() {
  const source = require(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'));
  const proposed = require(path.resolve(__dirname,
    '../results/als/new-moon-lockbreak-english-proxy-60.json'));
  const rank1 = source.decks.find(deck => deck.rank === 1);
  assert.ok(rank1);
  const champion = countFrozenInventory(rank1.cards,
    new Set(['Shadow Rider Calyrex VMAX']));
  const newMoon = countFrozenInventory(proposed.entries.map(row => ({
    name:row.name_en,count:row.count,type:row.type
  })), new Set(['Dusclops']));
  assert.deepEqual(
    [champion.basics,champion.tagTeams,newMoon.basics,newMoon.tagTeams,
      newMoon.mewtwo,champion.multiPrizeBasics,newMoon.multiPrizeBasics],
    [14,1,17,4,2,10,9]
  );
  const championRisk = exactForcedOpening({
    deckSize:60,openingSize:7,
    markedBasics:champion.tagTeams,
    otherBasics:champion.basics-champion.tagTeams
  });
  const newMoonRisk = exactForcedOpening({
    deckSize:60,openingSize:7,
    markedBasics:newMoon.tagTeams,
    otherBasics:newMoon.basics-newMoon.tagTeams
  });
  const mewtwoOnly = exactForcedOpening({
    deckSize:60,openingSize:7,
    markedBasics:newMoon.mewtwo,
    otherBasics:newMoon.basics-newMoon.mewtwo
  });
  const championMultiPrize = exactForcedOpening({
    deckSize:60,openingSize:7,
    markedBasics:champion.multiPrizeBasics,
    otherBasics:champion.basics-champion.multiPrizeBasics
  });
  const newMoonMultiPrize = exactForcedOpening({
    deckSize:60,openingSize:7,
    markedBasics:newMoon.multiPrizeBasics,
    otherBasics:newMoon.basics-newMoon.multiPrizeBasics
  });
  return {sourcePublishedRank:1,newMoonCandidate:proposed.schema,
    champion,newMoon,championRisk,newMoonRisk,mewtwoOnly,
    championMultiPrize,newMoonMultiPrize,
    interpretation:'Opening Active exposure event only; not a KO or game loss'};
}

module.exports = {
  choose, fraction, exactForcedOpening, countFrozenInventory,
  frozenOpeningAudit
};

if (require.main === module) {
  process.stdout.write(JSON.stringify(frozenOpeningAudit(), null, 2) + '\n');
}
