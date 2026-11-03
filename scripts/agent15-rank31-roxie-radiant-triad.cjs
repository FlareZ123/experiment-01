'use strict';

/**
 * Exact no-search first-own-turn physical opportunity for the ORIGINAL rank-31
 * Roxie -> Koffing Blow-Away Bomb -> Radiant Alakazam Painful Spoons line.
 *
 * The opening Active is chosen before the eighth draw, preferring any Basic
 * other than Koffing, and only taking Koffing Active when unavoidable.
 * A distinct, implementable Bench-Radiant policy starts a non-Radiant,
 * non-Koffing Basic when one is present, otherwise Koffing if >=2 copies
 * are available, otherwise Radiant. All events require a valid first seven.
 *
 * Counts hand/board identity access, NOT actual card plays, Abilities,
 * opponent board targets, game wins, or an assertion of paper legality.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { choose, classify } = require('./agent15-rank31-roxie-firstdraw.cjs');

const KEYS = ['koffing', 'eligibleBasicExceptRadiant', 'radiant', 'otherBasic',
  'eligibleEvolution', 'roxie', 'other'];

/**
 * @param {object} source Authenticated rank-31 manifest deck
 * @param {{includeModernEx?:boolean}} [options]
 * @returns {number[]} Disjoint 60-card physical partition
 */
function inventory(source, options = {}) {
  const base = classify(source, options);
  const radiant = source.cards.filter(card => card.name === 'Radiant Alakazam');
  assert.equal(radiant.length, 1);
  assert.equal(radiant[0].count, 1);
  assert.deepEqual([radiant[0].printing.set, String(radiant[0].printing.number)],
    ['SIT', '59']);
  const counts = [base.koffing, base.eligibleBasic - 1, 1,
    base.otherBasic, base.eligibleEvolution, base.roxie, base.other];
  assert.equal(counts.reduce((sum, value) => sum + value, 0), 60);
  return counts;
}

/**
 * @param {number[]} counts Physical partition in KEYS order
 * @returns {{validSeven:string,denominator:string,events:Record<string,{numerator:string,denominator:string,percent:number}>}}
 */
function countTriad(counts) {
  assert.equal(counts.length, KEYS.length);
  assert.equal(counts.reduce((sum, value) => sum + value, 0), 60);
  assert.equal(counts[2], 1);
  const x = new Array(KEYS.length).fill(0);
  let validSeven = 0n;
  const total = {
    roxieRetainedKoffing: 0n,
    roxieRetainedKoffingAndRadiant: 0n,
    radiantFromOpening: 0n,
    radiantFromEighthDraw: 0n,
    radiantBenchWithPreselectedOpeningActive: 0n,
    radiantForcedActiveUnderBenchPriority: 0n,
    triadAndSecondEligibleRoxiePayment: 0n,
  };

  /** @param {number} index @param {number} remaining @param {bigint} multiplicity */
  function visit(index, remaining, multiplicity) {
    if (index === KEYS.length) {
      if (remaining !== 0 || x[0] + x[1] + x[2] + x[3] === 0) return;
      validSeven += multiplicity;

      // If there is no non-Koffing Basic in the opening seven, one
      // Koffing must be Active and cannot subsequently pay Roxie.
      const retainedKoffing = x[0] - Number(x[1] + x[2] + x[3] === 0);
      const retainedEligible = x[0] + x[1] + x[2] + x[4] -
        Number(x[3] === 0);
      for (let draw = 0; draw < KEYS.length; draw++) {
        const available = counts[draw] - x[draw];
        if (available === 0) continue;
        const roxie = x[5] + Number(draw === 5);
        const koffing = retainedKoffing + Number(draw === 0);
        if (roxie === 0 || koffing === 0) continue;

        const weight = multiplicity * BigInt(available);
        total.roxieRetainedKoffing += weight;
        if (x[2] + Number(draw === 2) === 0) continue;

        total.roxieRetainedKoffingAndRadiant += weight;
        if (x[2] > 0) total.radiantFromOpening += weight;
        else total.radiantFromEighthDraw += weight;

        // This starter policy is selected on the initial seven; it
        // does not cheat by choosing an Active after seeing the draw.
        // It can place Radiant on Bench while keeping a Koffing only
        // with a non-Radiant/non-Koffing starter or 2 opening Koffing.
        const canBench = x[1] + x[3] > 0 || x[0] >= 2;
        if (canBench) total.radiantBenchWithPreselectedOpeningActive += weight;
        else total.radiantForcedActiveUnderBenchPriority += weight;

        const eligible = retainedEligible +
          Number(draw === 0 || draw === 1 || draw === 2 || draw === 4);
        if (eligible >= 2) total.triadAndSecondEligibleRoxiePayment += weight;
      }
      return;
    }
    for (let taken = 0; taken <= Math.min(remaining, counts[index]); taken++) {
      x[index] = taken;
      visit(index + 1, remaining - taken,
        multiplicity * choose(counts[index], taken));
    }
  }
  visit(0, 7, 1n);
  const denominator = validSeven * 53n;
  assert(denominator > 0n);
  return {
    validSeven: validSeven.toString(),
    denominator: denominator.toString(),
    events: Object.fromEntries(Object.entries(total).map(([name, numerator]) =>
      [name, { numerator: numerator.toString(), denominator: denominator.toString(),
        percent: Number(numerator) / Number(denominator) * 100 }])),
  };
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'results', 'aichi-2026', 'full-decklists.json'),
    'utf8'));
  const source = manifest.decks.find(deck => deck.rank === 31);
  assert(source, 'Missing original rank-31 source sixty');
  console.log(JSON.stringify({
    rank: 31,
    scope: 'opening seven Basic-valid, six unknown Prizes, one mandatory draw',
    conservative: countTriad(inventory(source)),
    lowercaseModernExEligible: countTriad(inventory(source, {includeModernEx: true})),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { inventory, countTriad };
