'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const r = Math.min(k, n - k);
  let product = 1n;
  for (let i = 1; i <= r; i += 1) {
    product = (product * BigInt(n - r + i)) / BigInt(i);
  }
  return product;
}

/**
 * All four audited frozen lists contain only these non-Basic Pokémon names.
 * This explicit whitelist is a modeling assumption, not a generic stage parser.
 * @type {ReadonlySet<string>}
 */
const EVOLUTION_NAMES = new Set(['Shadow Rider Calyrex VMAX', 'Dusclops']);

/**
 * @param {{name: string, count: number, category?: string, type?: string}[]} entries
 */
function counts(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  const pokemon = entries.filter(entry => (entry.category || entry.type) === 'Pokémon');
  const basic = pokemon
    .filter(entry => !EVOLUTION_NAMES.has(entry.name))
    .reduce((sum, entry) => sum + entry.count, 0);
  if (total !== 60) throw new Error('Expected exactly 60 physical cards, got ' + total);
  return {total, basic, evolutions: pokemon.reduce((sum, entry) => sum + entry.count, 0) - basic};
}

/**
 * Uniform seven-card setup, conditioned on a valid opener having >=1 Basic.
 * No opponent mulligan bonus draws, forced-start exceptions, or player choices.
 * @param {number} basic
 */
function setup(basic) {
  const all = choose(60, 7);
  const invalid = choose(60 - basic, 7);
  const valid = all - invalid;
  const one = BigInt(basic) * choose(60 - basic, 6);
  return {
    basics: basic,
    mulliganProbability: Number(invalid) / Number(all),
    exactlyOneBasicGivenValid: Number(one) / Number(valid),
    atLeastTwoBasicsGivenValid: Number(valid - one) / Number(valid),
    exactCounts: {
      allSeven: all.toString(),
      validSeven: valid.toString(),
      exactlyOneBasicSeven: one.toString()
    }
  };
}

/** @param {string} root */
function audit(root) {
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const field = read('results/aichi-2026/full-decklists.json');
  const candidates = [
    ['rank1-champion', field.decks.find(deck => deck.rank === 1).cards],
    ['hood-v1', read('results/aichi-2026/candidate-hood-shadow-rider.json').cards],
    ['temple-v1', read('results/aichi-2026/candidate-temple-shadow-rider.json').cards],
    ['new-moon-v1', read('results/als/new-moon-lockbreak-english-proxy-60.json').entries.map(
      entry => ({name: entry.name_en, count: entry.count, type: entry.type})
    )]
  ];
  const rank26 = field.decks.find(deck => deck.rank === 26);
  const dce = rank26.cards.filter(entry => entry.name === 'Double Colorless Energy')
    .reduce((sum, entry) => sum + entry.count, 0);
  if (dce !== 1) throw new Error('Unexpected original rank26 DCE count: ' + dce);

  return {
    scope: 'First seven, before optional mulligan cards or player decisions',
    contenders: Object.fromEntries(candidates.map(([name, cards]) => {
      const count = counts(cards);
      return [name, {...count, ...setup(count.basic)}];
    })),
    rank26OpeningDcePrizeProbability: Number(choose(59, 5)) / Number(choose(60, 6)),
    dcePrizeCaveat: 'Rank26 Redeemable Ticket can replace Prizes; initial DCE Prizing is not a hard veto.'
  };
}

if (require.main === module) console.log(JSON.stringify(audit(path.join(__dirname, '..')), null, 2));
module.exports = {choose, counts, setup, audit};
