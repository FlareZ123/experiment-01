'use strict';

const fs = require('node:fs');
const path = require('node:path');

const RANK31_BASIC_NAMES = new Set([
  'Duskull', 'Unown', 'Koffing', 'Chimecho',
  'Gengar & Mimikyu-GX', 'Radiant Alakazam',
  'Bloodmoon Ursaluna ex', 'Latias ex', 'Tapu Lele-GX'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
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
 * Exact direct joint Koffing and Roxie access after h opening cards and d
 * ordinary draws, conditional on at least one Basic in the first h.
 * The six unexamined Prize cards are marginalized under a random shuffle.
 *
 * @param {{n:number,b:number,k:number,r:number,h:number,d:number}} counts
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function exactPairAccess({n, b, k, r, h, d}) {
  const selected = h + d;
  const pairGroups = choose(selected, h) * (
    choose(n, selected) - choose(n - k, selected) -
    choose(n - r, selected) + choose(n - k - r, selected)
  );
  const invalidPairGroups =
    choose(n - b, h) * choose(n - h, d) -
    choose(n - b, h) * choose(n - h - k, d) -
    choose(n - b - r, h) * choose(n - h - r, d) +
    choose(n - b - r, h) * choose(n - h - k - r, d);
  const numerator = pairGroups - invalidPairGroups;
  const denominator = (choose(n, h) - choose(n - b, h)) *
    choose(n - h, d);
  const factor = gcd(numerator, denominator);
  return {numerator:numerator / factor, denominator:denominator / factor};
}

/** @returns {{n:number,b:number,k:number,r:number,h:number}} */
function rank31Counts() {
  const file = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  const deck = source.decks.find(item => item.rank === 31);
  const count = name => deck.cards.filter(row => row.name === name)
    .reduce((n, row) => n + row.count, 0);
  const counts = {
    n:deck.cards.reduce((n, row) => n + row.count, 0),
    b:deck.cards.filter(row => RANK31_BASIC_NAMES.has(row.name))
      .reduce((n, row) => n + row.count, 0),
    k:count('Koffing'),
    r:count('Roxie'),
    h:7
  };
  if (counts.n !== 60 || counts.b !== 15 ||
      counts.k !== 3 || counts.r !== 4) {
    throw new Error('Rank-31 source counts changed; revalidate Basic names.');
  }
  return counts;
}

function main() {
  const counts = rank31Counts();
  const draws = [1, 2].map(d => {
    const fraction = exactPairAccess({...counts, d});
    return {ordinaryDraws:d, fraction:
      String(fraction.numerator) + '/' + String(fraction.denominator),
      probability:Number(fraction.numerator) / Number(fraction.denominator)};
  });
  return {scope:'Direct joint hand visibility, no search, no legal-use or win estimate',
    sourceRank:31, counts, draws};
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {choose, exactPairAccess, rank31Counts, main};
