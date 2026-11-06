'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent40-artazon-original-deck-target-v1';
const SOURCE = 'results/aichi-2026/full-decklists.json';
const BASICS = 'results/aichi-2026/agent3-original-29-first-seven-basic-census-20261104.json';
const MISSING = [23, 25, 28];

// All 39 distinct original source printings below were cross-checked against
// the supplied card-list.zip as exactly Basic and without a Rule Box.
// Keep printing-specific identity: other prints of the same name may differ.
const ELIGIBLE_PRINTINGS = new Set([
  'Budew|ASC|16', 'Buneary|PFL|83', 'Bunnelby|PRC|121',
  'Chimecho|CIN|43', 'Duskull|PRE|35', 'Electrike|PRC|60',
  'Exeggcute|PLF|4', 'Fan Rotom|SCR|118', 'Flutter Mane|TEF|78',
  'Galarian Stunfisk|SSH|132', 'Girafarig|LOT|94',
  'Jirachi|XYP|67', 'Klefki|SVI|96', 'Koffing|CEC|76',
  'Kyurem|SFA|47', 'Lillipup|CEC|174', 'Marshadow|UNB|81',
  'Mimikyu|GRI|58', 'Mimikyu|PAL|97', 'Minior|PAR|99',
  'Mr. Mime|PLF|47', 'Oddish|UNB|5', 'Pidgey|FLF|75',
  'Pidgey|MEW|16', 'Pikachu|LOR|52', 'Pikachu|XY|42',
  'Regirock|XYP|49', 'Relicanth|TEF|84', 'Snorlax|PGO|55',
  'Sudowoodo|GRI|66', 'Tatsugiri|TWM|131', 'Toedscool|PAR|16',
  'Trubbish|CRI|56', 'Trubbish|FST|168', 'Trubbish|NVI|48',
  'Trubbish|PAR|116', 'Unown|AOR|30', 'Voltorb|ROS|21',
  'Wobbuffet|PHF|36'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k));
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
 * Exact probability that at least one of k distinguishable eligible Basics is
 * in the remaining deck after a Basic-valid initial hand and a fixed count of
 * Prize cards and ordinary draws. The "remaining deck" is a location model:
 * no card plays, searches, shuffles, opponent effects or Bench capacity are
 * simulated. K qualifying Basics are included in b total Basics.
 *
 * @param {number} n Fixed deck size
 * @param {number} h Initial hand size
 * @param {number} prizes Number of random hidden Prize cards
 * @param {number} draws Number of ordinary draws after setting Prizes
 * @param {number} b Total Basic Pokémon copies
 * @param {number} k Eligible non-Rule-Box Basic copies
 * @returns {{numerator:bigint,denominator:bigint,percent:number}}
 */
function exactRemainingTarget(n, h, prizes, draws, b, k) {
  for (const value of [n, h, prizes, draws, b, k]) {
    assert.ok(Number.isSafeInteger(value) && value >= 0);
  }
  assert.ok(b > 0 && b <= n && k <= b);
  assert.ok(h > 0 && h + prizes + draws <= n);
  // In the supported domain, all k cards fit outside the opening hand.
  assert.ok(k <= n - h);
  const totalOpeners = choose(n, h);
  const mulliganOpeners = choose(n - b, h);
  const validOpeners = totalOpeners - mulliganOpeners;
  assert.ok(validOpeners > 0n);

  // P(no eligible card in the remaining deck AND a valid opening):
  // P(all k among the h+prizes+draws visible/Prized positions)
  //   - P(no Basic in opening)
  //       * P(all k among prizes+draws | no Basic in opening).
  // The six Prizes are marginalized; they are never treated as a known search.
  const allPlacements = choose(n, k);
  const remainingPlacements = choose(n - h, k);
  const noTargetNumerator =
    totalOpeners * choose(h + prizes + draws, k) * remainingPlacements -
    mulliganOpeners * choose(prizes + draws, k) * allPlacements;
  const denominator = validOpeners * allPlacements * remainingPlacements;
  const numerator = denominator - noTargetNumerator;
  assert.ok(numerator >= 0n && numerator <= denominator);
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
    percent: 100 * Number(numerator) / Number(denominator)
  };
}

/** @param {object} card @returns {string} */
function printingKey(card) {
  return [card.name, card.printing?.set, card.printing?.number].join('|');
}

/**
 * Use authenticated source printings and the independent original Basic census
 * to avoid promoting a name-only or broad card-pool legalities heuristic.
 * @param {object} field
 * @param {object} basicSnapshot
 * @returns {object}
 */
function analyzeOriginals(field, basicSnapshot) {
  assert.equal(field?.decks?.length, 29);
  assert.deepEqual(
    field.missing_full_lists.map(x => x.rank).sort((a, b) => a - b),
    MISSING
  );
  assert.equal(basicSnapshot?.ranks?.length, 29);
  const basicByRank = new Map(basicSnapshot.ranks.map(x => [x.rank, x.basics]));
  assert.equal(basicByRank.size, 29);
  const ranks = new Set();
  const observedPrints = new Set();
  const rows = field.decks.map(deck => {
    assert.ok(!ranks.has(deck.rank));
    ranks.add(deck.rank);
    assert.equal(deck.cards.reduce((sum, c) => sum + c.count, 0), 60);
    const b = basicByRank.get(deck.rank);
    assert.ok(Number.isSafeInteger(b) && b > 0);
    const qualified = deck.cards.filter(c =>
      c.category === 'Pokémon' && ELIGIBLE_PRINTINGS.has(printingKey(c))
    );
    qualified.forEach(c => observedPrints.add(printingKey(c)));
    const k = qualified.reduce((sum, c) => sum + c.count, 0);
    assert.ok(k <= b);
    const p = exactRemainingTarget(60, 7, 6, 2, b, k);
    return {
      rank: deck.rank,
      archetype: deck.archetype,
      basics: b,
      eligibleBasics: k,
      fraction: p.numerator.toString() + '/' + p.denominator.toString(),
      percent: p.percent
    };
  }).sort((a, b) => a.rank - b.rank);
  assert.equal(observedPrints.size, ELIGIBLE_PRINTINGS.size);
  assert.deepEqual([...ranks].sort((a, b) => a - b), [...basicByRank.keys()].sort((a, b) => a - b));
  assert.deepEqual(rows.filter(x => x.eligibleBasics === 0).map(x => x.rank), [5, 6, 24, 29]);
  return {
    version: VERSION,
    sources: [SOURCE, BASICS],
    model: 'Basic-valid opening seven; six Prizes; two natural draws; no plays',
    known: rows.length,
    missing: MISSING,
    eligibleRanks: rows.filter(x => x.eligibleBasics > 0).length,
    equalRankMeanPercent: rows.reduce((sum, x) => sum + x.percent, 0) / rows.length,
    eligibleRankMeanPercent:
      rows.filter(x => x.eligibleBasics > 0)
        .reduce((sum, x) => sum + x.percent, 0) /
      rows.filter(x => x.eligibleBasics > 0).length,
    rows
  };
}

/** @param {string} relative @returns {object} */
function loadJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../..', relative), 'utf8'));
}

if (require.main === module) {
  console.log(JSON.stringify(analyzeOriginals(loadJson(SOURCE), loadJson(BASICS)), null, 2));
}
module.exports = {
  VERSION, SOURCE, BASICS, MISSING, ELIGIBLE_PRINTINGS,
  choose, exactRemainingTarget, printingKey, analyzeOriginals
};
