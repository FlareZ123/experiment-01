'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent9-rank5-vip-prize-bench-window-v1';
const GROUPS = Object.freeze([
  'Mew V', 'Genesect V', 'Crobat V', 'Dedenne-GX',
  "Lillie's Clefairy ex", 'Battle VIP Pass', 'Mew VMAX', 'Other'
]);
const SOURCE_COUNTS = Object.freeze([4, 4, 1, 1, 1, 3, 3, 43]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  const r = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= r; i++) result = result * BigInt(n - r + i) / BigInt(i);
  return result;
}

/**
 * Number of Prize-card combinations retaining at least one deck-searchable
 * card of each of the four physical target groups. Inclusion-exclusion
 * excludes simultaneous total-Prize collapses, not just singleton Prizes.
 * @param {number[]} remaining Number of each required printing after first 8.
 * @param {number} pool Number of cards available after first 8.
 * @param {number} prizes Size of Prize sample.
 * @returns {bigint}
 */
function retainedPrizeChoices(remaining, pool, prizes) {
  if (remaining.some(n => n < 1)) return 0n;
  let total = 0n;
  for (let mask = 0; mask < (1 << remaining.length); mask++) {
    let excluded = 0;
    let parity = 0;
    for (let i = 0; i < remaining.length; i++) {
      if ((mask & (1 << i)) !== 0) {
        excluded += remaining[i];
        parity++;
      }
    }
    const term = choose(pool - excluded, prizes - excluded);
    total += parity % 2 === 0 ? term : -term;
  }
  return total;
}

/**
 * Exact ordered first-draw / unordered opening-hand / unordered Prize model.
 * The eight categories are Mew, Genesect, Crobat, Dedenne, Clefairy, VIP,
 * Mew VMAX, Other. One ordinary first-turn draw follows an opening seven.
 * Prize order is irrelevant; exchangeability permits choosing the draw card
 * first and six Prizes from the remaining physical cards for enumeration.
 *
 * The event requires: first seven contain Mew V; first eight hold VIP, no
 * Genesect/Crobat, at most four Basic Pokémon; and after six Prizes all
 * Mew V, Genesect V, Crobat V, Mew VMAX targets remain deck-accessible.
 * This is an access event, not a native game or strategic win probability.
 *
 * @param {readonly number[]} counts Eight original printing-group counts.
 * @param {number} opener Number of cards in opening hand, normally 7.
 * @param {number} prizes Number of Prize cards, normally 6.
 * @param {number} basicLimit Largest count of Basics in opener plus draw.
 * @returns {{favorable:bigint,total:bigint,states:number,percentage:number}}
 */
function calculateWindow(counts = SOURCE_COUNTS, opener = 7,
  prizes = 6, basicLimit = 4) {
  assert.equal(counts.length, GROUPS.length);
  assert.ok(counts.every(n => Number.isSafeInteger(n) && n >= 0));
  assert.ok(Number.isSafeInteger(opener) && opener > 0);
  assert.ok(Number.isSafeInteger(prizes) && prizes >= 0);
  assert.ok(Number.isSafeInteger(basicLimit) && basicLimit >= 0);
  const totalCards = counts.reduce((sum, n) => sum + n, 0);
  const observed = opener + 1;
  assert.ok(totalCards >= observed + prizes);
  const remainingPool = totalCards - observed;
  const denominator = BigInt(observed) * choose(totalCards, observed) *
    choose(remainingPool, prizes);
  const hand = Array(GROUPS.length).fill(0);
  let favorable = 0n;
  let states = 0;

  /** @param {number} group @param {number} selected */
  function visit(group, selected) {
    if (group === counts.length - 1) {
      const other = observed - selected;
      if (other < 0 || other > counts[group]) return;
      hand[group] = other;
      const mew = hand[0];
      const basics = mew + hand[3] + hand[4];
      if (mew < 1 || hand[5] < 1 || hand[1] !== 0 ||
          hand[2] !== 0 || basics > basicLimit) return;
      const wanted = [0, 1, 2, 6].map(i => counts[i] - hand[i]);
      if (wanted.some(n => n < 1)) return;
      const eligibleDrawPositions = hand.reduce((sum, count, i) =>
        sum + (mew - (i === 0 ? 1 : 0) >= 1 ? count : 0), 0);
      if (eligibleDrawPositions === 0) return;
      const handCount = hand.reduce((p, n, i) =>
        p * choose(counts[i], n), 1n);
      const validPrizes = retainedPrizeChoices(wanted, remainingPool, prizes);
      assert.ok(validPrizes >= 0n);
      favorable += handCount * BigInt(eligibleDrawPositions) * validPrizes;
      states++;
      return;
    }
    for (let n = 0; n <= Math.min(counts[group], observed - selected); n++) {
      hand[group] = n;
      visit(group + 1, selected + n);
    }
  }
  visit(0, 0);
  const percentage = 100 * Number(favorable) / Number(denominator);
  return { favorable, total: denominator, states, percentage };
}

/**
 * Assert original rank-five published physical printing inventory, then use
 * fixed role categories. Other cards are never guessed to be Basics.
 * @param {object} fullDecklists Authenticated original-source manifest.
 * @returns {number[]}
 */
function sourceRank5Counts(fullDecklists) {
  const source = fullDecklists.decks.find(d => d.rank === 5);
  assert.equal(source?.archetype, 'Mew Genesect');
  assert.equal(source.cards.reduce((sum, c) => sum + c.count, 0), 60);
  const names = GROUPS.slice(0, 7);
  const counts = names.map(name => source.cards
    .filter(c => c.name === name)
    .reduce((sum, c) => sum + c.count, 0));
  const other = 60 - counts.reduce((sum, n) => sum + n, 0);
  const derived = [...counts, other];
  assert.deepEqual(derived, SOURCE_COUNTS);
  const ownBasics = new Set(['Mew V','Genesect V','Crobat V',
    'Dedenne-GX',"Lillie's Clefairy ex"]);
  assert.ok(source.cards.filter(c => c.category === 'Pokémon')
    .every(c => ownBasics.has(c.name) || c.name === 'Mew VMAX'));
  return derived;
}

if (require.main === module) {
  const source = require('../results/aichi-2026/full-decklists.json');
  const out = calculateWindow(sourceRank5Counts(source));
  process.stdout.write(JSON.stringify({version:VERSION,
    numerator:out.favorable.toString(),denominator:out.total.toString(),
    states:out.states,percentage:out.percentage,
    competitivelyQualifiedGames:0,sourceRank:5}, null, 2) + '\n');
}

module.exports = { VERSION, GROUPS, SOURCE_COUNTS, choose,
  retainedPrizeChoices, calculateWindow, sourceRank5Counts };
