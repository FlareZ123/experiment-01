'use strict';

const assert = require('node:assert/strict');
const base = require('../results/als/new-moon-perfection-english-proxy-60.json');
const variant = require('../results/als/new-moon-lockbreak-english-proxy-60.json');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isInteger(n) && Number.isInteger(k) && 0 <= k && k <= n);
  const j = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= j; i++) {
    result = result * BigInt(n - j + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} x @param {bigint} y */
function gcd(x, y) {
  while (y) [x, y] = [y, x % y];
  return x;
}

/**
 * Direct access to >=1 out of k specifically designated non-Basic cards in
 * starting seven plus the next turn's mandatory draw. All physical-card
 * positions (including six Prizes) are exchangeable prior to setup. Condition
 * only on having >=1 Basic in the initial seven.
 *
 * @param {number} basics Number of Basic Pokemon in the fixed 60.
 * @param {number} copies Number of designated non-Basic cards.
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function directByFirstDraw(basics, copies) {
  assert.ok(0 <= basics && basics <= 60 && 0 <= copies &&
    copies <= 60 - basics);
  const initialValid = choose(60, 7) - choose(60 - basics, 7);
  const noItemEight = choose(60 - copies, 8);
  const noItemFirstSevenValid =
    choose(60 - copies, 7) - choose(60 - copies - basics, 7);
  const denominator = choose(60, 8) * choose(60 - copies, 7) * initialValid;
  const numerator = denominator -
    noItemEight * noItemFirstSevenValid * choose(60, 7);
  const d = gcd(numerator, denominator);
  return {
    numerator: String(numerator / d),
    denominator: String(denominator / d),
    probability: Number(numerator) / Number(denominator)
  };
}

/** Report only direct unconditional Item visibility; all search paths unmodeled. */
function main() {
  const count = (manifest, name) => manifest.entries
    .filter(x => x.name_en === name).reduce((n, x) => n + x.count, 0);
  const basics = 17; // Source and variant preserve all 17 source Basic Pokemon.
  assert.equal(base.counts['Pokémon'], 19);
  assert.equal(variant.counts['Pokémon'], 19);
  assert.equal(count(base, 'Field Blower'), 0);
  assert.equal(count(base, 'Canceling Cologne'), 0);
  assert.equal(count(variant, 'Field Blower'), 2);
  assert.equal(count(variant, 'Canceling Cologne'), 2);
  return {
    schema: 'new-moon-direct-lockbreak-access-v1',
    fixedListHash: variant.canonical_id_count_sha256,
    initialBasicCount: basics,
    initialSevenCondition: 'at least one Basic Pokemon',
    window: 'first seven cards plus first mandatory draw, no extra mulligan bonus',
    qualifier: 'Direct visibility only. Search, costs, locks, Prize recovery and actual successful use are not represented.',
    source: {fieldBlower: directByFirstDraw(basics, 0),
      cologne: directByFirstDraw(basics, 0)},
    lockbreak: {
      fieldBlower: directByFirstDraw(basics, 2),
      cologne: directByFirstDraw(basics, 2),
      eitherNamedItem: directByFirstDraw(basics, 4)
    }
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
module.exports = {choose, directByFirstDraw, main};
