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
 * Joint resource window: original seven forces TAG, a directly held VIP Pass
 * is available by the one mandatory draw, and a designated non-TAG Latias ex
 * is absent from the six Prize cards. Latias is among "otherBasics".
 *
 * Conditional activity assumes VIP may be used and Skyliner is not blocked.
 * No arbitrary prize subset or speculative engine state is inspected.
 *
 * @param {{deckSize:number,openingSize:number,tagBasics:number,
 *   otherBasics:number,vipCopies:number,prizeCount:number}} p
 */
function forcedTagVipLatiasWindow(p) {
  const {deckSize:n,openingSize:k,tagBasics:t,
    otherBasics:o,vipCopies:v,prizeCount:prizes}=p;
  assert.ok([n,k,t,o,v,prizes].every(x=>Number.isSafeInteger(x)&&x>=0));
  assert.ok(t>0 && o>0 && v>0 && t+o+v<=n);
  const remaining=n-k;
  assert.ok(k<n && prizes<remaining-1 && v<=remaining);
  const forced=choose(n-o,k)-choose(n-o-t,k);
  const noVip=choose(n-o-v,k)-choose(n-o-t-v,k);
  const valid=choose(n,k)-choose(n-o-t,k);
  const r=BigInt(remaining);
  const numerator=(forced-noVip)*(r-BigInt(prizes))*(r-1n)+
    noVip*BigInt(v)*(r-1n-BigInt(prizes));
  const denominator=r*(r-1n);
  return {
    forcedSevenCount:String(forced),
    forcedWithoutVipCount:String(noVip),
    vipAndLatiasUnprizedGivenForced:
      fraction(numerator,forced*denominator),
    vipAndLatiasUnprizedGivenValid:
      fraction(numerator,valid*denominator),
    scope:'Direct first-turn resource window only; cannot certify a retreat or match win'
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

/**
 * Exact one-draw visibility of non-Basic target cards after valid Basic seven.
 * @param {{deckSize:number,openingSize:number,basics:number,targets:number}} c
 */
function directTargetByOneDraw(c) {
  const {deckSize:n,openingSize:k,basics:b,targets:t}=c;
  assert.ok([n,k,b,t].every(x=>Number.isSafeInteger(x)&&x>=0));
  assert.ok(k<n && b>0 && t>0 && b+t<=n && t<=n-k);
  const all=choose(n,k),valid=all-choose(n-b,k);
  const noTargetValid=choose(n-t,k)-choose(n-t-b,k);
  const unseen=BigInt(n-k);
  return fraction(valid*unseen-noTargetValid*BigInt(n-k-t),
    valid*unseen);
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
  choose, fraction, exactForcedOpening, directTargetByOneDraw,
  forcedTagVipLatiasWindow, countFrozenInventory,
  frozenOpeningAudit
};

if (require.main === module) {
  process.stdout.write(JSON.stringify(frozenOpeningAudit(), null, 2) + '\n');
}
