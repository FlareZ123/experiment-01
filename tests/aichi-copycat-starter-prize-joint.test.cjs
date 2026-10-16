'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {criticalStarterPrizeJoint} =
  require('../scripts/aichi-copycat-starter-prize-joint.cjs');
const {criticalPrizeCollapse, choose} =
  require('../scripts/aichi-champion-critical-prize-collapse.cjs');

/** @param {number[]} set @param {number} size */
function subsets(set, size) {
  const output = [];
  /** @param {number} start @param {number[]} selected */
  function visit(start, selected) {
    if (selected.length === size) {
      output.push([...selected]);
      return;
    }
    for (let i = start; i <= set.length - (size - selected.length); i++) {
      selected.push(set[i]);
      visit(i + 1, selected);
      selected.pop();
    }
  }
  visit(0, []);
  return output;
}

/**
 * Physical-card enumeration (not a hypergeometric category calculation).
 * Uniformly deal the opening, then the Prizes from distinct remaining slots.
 * @param {number} balls
 */
function bruteMiniDeck(balls) {
  const deck = ['M', 'D', 'B', 'B',
    ...Array(balls).fill('H'), ...Array(4 - balls).fill('N')];
  const indices = deck.map((_, i) => i);
  let valid = 0;
  let forced = 0;
  let stranded = 0;
  let intersection = 0;
  for (const opener of subsets(indices, 2)) {
    const basics = opener.filter(i => ['M', 'D', 'B'].includes(deck[i]));
    if (!basics.length) continue;
    const forcedStarter = basics.every(i => deck[i] !== 'B');
    const remaining = indices.filter(i => !opener.includes(i));
    for (const prize of subsets(remaining, 2)) {
      const targets = prize.filter(i => ['M', 'D'].includes(deck[i])).length;
      const availableBalls = balls - prize.filter(i => deck[i] === 'H').length;
      const fail = targets > availableBalls;
      valid++;
      forced += Number(forcedStarter);
      stranded += Number(fail);
      intersection += Number(forcedStarter && fail);
    }
  }
  return {
    forcedCriticalStarter: forced / valid,
    strandedPrizeCapacity: stranded / valid,
    simultaneous: intersection / valid,
    either: (forced + stranded - intersection) / valid
  };
}

test('all four joint events match exhaustive physical-slot deals', () => {
  for (let balls = 0; balls <= 3; balls++) {
    const exact = criticalStarterPrizeJoint({
      deckSize: 8, openingSize: 2, prizeSize: 2,
      otherBasics: 2, recoveryCopies: balls
    });
    const brute = bruteMiniDeck(balls);
    for (const key of Object.keys(brute)) {
      assert.ok(Math.abs(exact[key].probability - brute[key]) < 1e-14, key);
    }
  }
});

test('60-card source exact fractions and prior independent Prize marginal', () => {
  const fractions = {
    forcedCriticalStarter: ['6923/114560', '6923/114560', '6923/114560'],
    simultaneous: ['851529/133576960', '185115/347300096', '12341/340621248'],
    either: ['83949311/347300096', '1233474499/14760254080',
      '355324181/5677020800']
  };
  for (let balls = 0; balls <= 2; balls++) {
    const exact = criticalStarterPrizeJoint({
      deckSize: 60, openingSize: 7, prizeSize: 6,
      otherBasics: 12, recoveryCopies: balls
    });
    for (const [key, expected] of Object.entries(fractions)) {
      const row = exact[key];
      assert.equal(String(row.numerator) + '/' + String(row.denominator),
        expected[balls], key);
    }
    const old = criticalPrizeCollapse({
      deckSize: 60, openingSize: 7, prizeSize: 6,
      otherBasics: 12, recoveryCopies: balls
    });
    assert.equal(exact.strandedPrizeCapacity.numerator, old.reducedNumerator);
    assert.equal(exact.strandedPrizeCapacity.denominator, old.reducedDenominator);
    const accepted = choose(60, 7) - choose(46, 7);
    const forced = choose(48, 7) - choose(46, 7);
    assert.equal(exact.forcedCriticalStarter.probability,
      Number(forced) / Number(accepted));
  }
});

test('rejects impossible physical inventories', () => {
  assert.throws(() => criticalStarterPrizeJoint({
    deckSize: 8, openingSize: 7, prizeSize: 2,
    otherBasics: 2, recoveryCopies: 1
  }), /Invalid/);
});
