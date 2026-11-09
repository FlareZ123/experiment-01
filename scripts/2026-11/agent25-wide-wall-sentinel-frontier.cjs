'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const SOURCE = path.join(ROOT, 'results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.psv');
const CHALLENGER = path.join(ROOT, 'results/aichi-2026/2026-11/agent25-wide-wall-sentinel-v1.psv');

/**
 * @param {string} filename
 * @returns {Map<string, number>}
 */
function readDeck(filename) {
  const result = new Map();
  for (const line of fs.readFileSync(filename, 'utf8').trim().split(/\r?\n/)) {
    const fields = line.split('|');
    assert.equal(fields.length, 5, line);
    const [category, name, set, number, quantity] = fields;
    assert.ok(['Energy', 'Pokémon', 'Trainer'].includes(category), line);
    assert.ok(name && set && number, line);
    assert.match(quantity, /^[1-4]$/, line);
    assert.equal(result.has(line.slice(0, line.lastIndexOf('|'))), false, line);
    result.set(line.slice(0, line.lastIndexOf('|')), Number(quantity));
  }
  assert.equal([...result.values()].reduce((a, b) => a + b, 0), 60);
  return result;
}

/**
 * @param {Map<string, number>} deck
 * @param {string} name
 * @returns {number}
 */
function copies(deck, name) {
  return [...deck.entries()].filter(([key]) => key.split('|')[1] === name)
    .reduce((total, [, quantity]) => total + quantity, 0);
}

/**
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++)
    value = value * BigInt(n - i + 1) / BigInt(i);
  return value;
}

/**
 * @param {bigint} a
 * @param {bigint} b
 * @returns {bigint}
 */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Counts the following narrow physical-access event over uniform disjoint
 * seven-card opening hands and six face-down Prize cards:
 *   - opening contains Rhyhorn and either Tag Call or Guzma & Hala;
 *   - at least one of each specified Grand Tree, Rhydon, Rhyperior,
 *     Oddish, Gloom, Vileplume, Double Colorless, Strong Energy is
 *     NOT Prized (may be in opening or remaining deck).
 *
 * This is a resource-location screen only. It does not grant a legal
 * turn, evolution, hand payment, board slot, Supporter, attack or victory.
 * @param {Map<string, number>} deck
 * @returns {{numerator: bigint, denominator: bigint, unconditionalNumerator: bigint, unconditionalDenominator: bigint, eligiblePrizeFractionNumerator: bigint, eligiblePrizeFractionDenominator: bigint}}
 */
function exactFrontier(deck) {
  const needed = [
    copies(deck, 'Rhyhorn'),
    copies(deck, 'Tag Call') + copies(deck, 'Guzma & Hala'),
    copies(deck, 'Double Colorless Energy'),
    copies(deck, 'Strong Energy'),
    copies(deck, 'Grand Tree'),
    copies(deck, 'Rhydon'),
    copies(deck, 'Rhyperior'),
    copies(deck, 'Oddish'),
    copies(deck, 'Gloom'),
    copies(deck, 'Vileplume')
  ];
  assert.deepEqual(needed, [2, 8, 2, 2, 1, 1, 1, 2, 2, 2]);
  const basics = ['Budew','Buneary','Bunnelby','Fan Rotom','Girafarig',
    'Oddish','Pidgey','Relicanth','Rhyhorn']
    .reduce((n, name) => n + copies(deck, name), 0);
  assert.equal(basics, 14);
  const groups = [...needed, 60 - needed.reduce((a, b) => a + b, 0)];
  let numerator = 0n;
  let eligiblePrizeWays = 0n;

  /**
   * @param {number} group
   * @param {number} remaining
   * @param {bigint} prizeWays
   * @param {number[]} counts
   * @returns {void}
   */
  function enumerate(group, remaining, prizeWays, counts) {
    if (group === groups.length) {
      if (remaining !== 0) return;
      if (needed.some((total, i) => counts[i] === total)) return;
      eligiblePrizeWays += prizeWays;
      const rhyhorn = needed[0] - counts[0];
      const connector = needed[1] - counts[1];
      const openingWays = choose(54, 7) - choose(54 - rhyhorn, 7)
        - choose(54 - connector, 7) + choose(54 - rhyhorn - connector, 7);
      numerator += prizeWays * openingWays;
      return;
    }
    for (let q = 0; q <= Math.min(groups[group], remaining); q++) {
      counts.push(q);
      enumerate(group + 1, remaining - q,
        prizeWays * choose(groups[group], q), counts);
      counts.pop();
    }
  }
  enumerate(0, 6, 1n, []);
  const unconditionalDenominator = choose(60, 6) * choose(54, 7);
  const conditionedDenominator = (choose(60, 7) - choose(46, 7)) * choose(53, 6);
  const factor = gcd(numerator, conditionedDenominator);
  return {
    numerator: numerator / factor,
    denominator: conditionedDenominator / factor,
    unconditionalNumerator: numerator,
    unconditionalDenominator,
    eligiblePrizeFractionNumerator: eligiblePrizeWays,
    eligiblePrizeFractionDenominator: choose(60, 6)
  };
}

/** @returns {object} */
function run() {
  const before = readDeck(SOURCE), after = readDeck(CHALLENGER);
  const changes = [];
  for (const key of new Set([...before.keys(), ...after.keys()])) {
    const delta = (after.get(key) || 0) - (before.get(key) || 0);
    if (delta) changes.push({printing: key, delta});
  }
  const changedCards = changes.reduce((n, c) => n + Math.abs(c.delta), 0) / 2;
  assert.equal(changedCards, 9);
  const expected = {
    'Energy|Capture Energy|RCL|171': -1,
    'Energy|Grass Energy|MEE|9': -1,
    'Energy|Jet Energy|PAL|190': -2,
    'Energy|Double Colorless Energy|SUM|136': 2,
    'Energy|Strong Energy|FFI|104': 2,
    'Pokémon|Herdier|SUM|104': -1,
    'Pokémon|Lillipup|CEC|174': -2,
    'Pokémon|Stoutland|BCR|122': -1,
    'Pokémon|Rhydon|SCR|75': 1,
    'Pokémon|Rhyhorn|SCR|74': 2,
    'Pokémon|Rhyperior|SCR|76': 1,
    'Trainer|Artazon|PAL|171': 1,
    'Trainer|Temple of Sinnoh|ASR|155': -1
  };
  assert.equal(changes.length, Object.keys(expected).length);
  for (const change of changes)
    assert.equal(change.delta, expected[change.printing], change.printing);
  const access = exactFrontier(after);
  return {
    source: path.relative(ROOT, SOURCE),
    challenger: path.relative(ROOT, CHALLENGER),
    changedPhysicalSlots: changedCards,
    changedLines: changes.sort((a, b) => a.printing.localeCompare(b.printing)),
    basicCount: 14,
    opportunity: {
      qualifyingOpeningAndNonPrizedPiecesConditionalOnValidOpening:
        Number(access.numerator) / Number(access.denominator),
      fraction: String(access.numerator) + '/' + String(access.denominator),
      qualifyingPrizesFraction:
        Number(access.eligiblePrizeFractionNumerator) /
        Number(access.eligiblePrizeFractionDenominator)
    },
    qualifiedCompetitiveGames: 0,
    policyOrNativeMatchTested: false
  };
}

module.exports = {readDeck, copies, choose, exactFrontier, run};
if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
