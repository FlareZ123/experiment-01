'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) ||
      n < 0 || k < 0 || k > n) throw new RangeError('Invalid binomial arguments');
  let result = 1n;
  const limit = Math.min(k, n - k);
  for (let i = 1; i <= limit; i++) {
    result = result * BigInt(n - limit + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x, y) {
  while (y) [x, y] = [y, x % y];
  return x;
}

/** @param {bigint} n @param {bigint} d */
function ratio(n, d) {
  if (d <= 0n) throw new RangeError('Nonpositive denominator');
  const factor = gcd(n, d);
  return {n: n / factor, d: d / factor};
}

/** @param {{n:bigint,d:bigint}} x @param {{n:bigint,d:bigint}} y */
const mul = (x, y) => ratio(x.n * y.n, x.d * y.d);
/** @param {{n:bigint,d:bigint}} x @param {{n:bigint,d:bigint}} y */
const minus = (x, y) => ratio(x.n * y.d - y.n * x.d, x.d * y.d);
/** @param {{n:bigint,d:bigint}} x @param {{n:bigint,d:bigint}} y */
const divide = (x, y) => ratio(x.n * y.d, x.d * y.n);
/** @param {{n:bigint,d:bigint}} fraction */
const expose = fraction => ({
  numerator: fraction.n.toString(),
  denominator: fraction.d.toString(),
  probability: Number(fraction.n) / Number(fraction.d)
});

/**
 * Resolve exact source-printed Pokémon against the local card database to
 * establish how many Basic Pokémon exist. Do not infer Basics from all Pokémon.
 * @returns {{basicCount:number,adpCount:number,doubleDragonCount:number}}
 */
function rank19Counts() {
  const manifest = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const deck = manifest.decks.find(row => row.rank === 19);
  if (!deck || deck.player !== 'Mark Takahashi' ||
      deck.archetype !== 'Raging Bolt' ||
      deck.cards.reduce((n, card) => n + card.count, 0) !== 60) {
    throw new Error('Source rank19 registration changed');
  }
  const setRows = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/sets/en.json'), 'utf8'));
  const setIds = new Map(setRows.filter(row => row.ptcgoCode)
    .map(row => [row.ptcgoCode, row.id]));
  const cached = new Map();
  let basicCount = 0;
  for (const row of deck.cards.filter(card => card.category === 'Pokémon')) {
    const setId = setIds.get(row.printing.set);
    if (!setId) throw new Error('Unknown printed source set ' + row.printing.set);
    if (!cached.has(setId)) {
      cached.set(setId, JSON.parse(fs.readFileSync(
        path.join(ROOT, 'resources/cards/en', setId + '.json'), 'utf8')));
    }
    const card = cached.get(setId).find(print =>
      String(print.number) === String(row.printing.number));
    if (!card || !Array.isArray(card.subtypes)) {
      throw new Error('Missing Pokémon printing ' + row.printing.set + '/' +
        row.printing.number);
    }
    if (card.subtypes.includes('Basic')) basicCount += row.count;
  }
  const count = (name, set, number) => deck.cards.filter(card =>
    card.name === name && card.printing.set === set &&
    String(card.printing.number) === number)
    .reduce((n, card) => n + card.count, 0);
  return {
    basicCount,
    adpCount: count('Arceus & Dialga & Palkia-GX', 'CEC', '156'),
    doubleDragonCount: count('Double Dragon Energy', 'ROS', '97')
  };
}

/**
 * The restricted direct going-second GX resource event is:
 * singleton ADP in opening 7, Double Dragon Energy among opening 7 or the
 * first ordinary draw (after 6 unseen Prizes). ADP is chosen Active at setup.
 * No Pokémon search, retreat, abilities, alternate attachments or opponents
 * are modeled. The exact sampling frame is one uniformly shuffled source 60.
 *
 * @returns {object} Rational probabilities and printing-verified counts.
 */
function calculate() {
  const counts = rank19Counts();
  const {basicCount: basics, adpCount: adp, doubleDragonCount: energy} = counts;
  if (basics !== 16 || adp !== 1 || energy !== 4) {
    throw new Error('Rank19 source counts differ from predeclared calculation');
  }
  const one = ratio(1n, 1n);
  const basicValid = minus(one, ratio(choose(60 - basics, 7), choose(60, 7)));
  const startingAdp = ratio(7n, 60n);
  const initialBoth = mul(startingAdp,
    minus(one, ratio(choose(59 - energy, 6), choose(59, 6))));
  const firstDrawBoth = mul(startingAdp,
    minus(one, ratio(choose(59 - energy, 7), choose(59, 7))));
  const adpPrizedAmongValid = divide(mul(ratio(6n, 60n),
    minus(one, ratio(choose(60 - basics, 7), choose(59, 7)))), basicValid);
  return {
    sourceRank: 19, counts,
    validOpening: expose(basicValid),
    adpInInitialSeven: expose(startingAdp),
    directInitialSeven: expose(initialBoth),
    directAfterFirstDraw: expose(firstDrawBoth),
    drawOnlyAdded: expose(minus(firstDrawBoth, initialBoth)),
    directConditionalValid: expose(divide(firstDrawBoth, basicValid)),
    singletonAdpPrizedConditionalValid: expose(adpPrizedAmongValid),
    sourceScope: 'opening-resources-only; no verified GX resolution or wins'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(calculate(), null, 2) + '\n');

module.exports = {choose, rank19Counts, calculate};
