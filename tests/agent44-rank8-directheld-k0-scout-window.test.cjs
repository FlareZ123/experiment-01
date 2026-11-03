'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {choose,allUnseenCopiesPrized,exactDirectHeldWindow,
  countFromPrintedSource} =
  require('../scripts/agent44-rank8-directheld-k0-scout-window.cjs');

const counts = Object.freeze({box: 1, quickBall: 4, trubbish: 2,
  otherBasic: 8, other: 45});

test('exact combinations handle boundaries and avoid floating-point count error', () => {
  assert.equal(choose(60, 8), 2558620845n);
  assert.equal(choose(60, -1), 0n);
  assert.equal(choose(5, 6), 0n);
  assert.equal(choose(10, 0), 1n);
  assert.equal(choose(10, 10), 1n);
});

test('original rank8 eight-card held scout inventory conditional on valid opening', () => {
  const result = exactDirectHeldWindow(counts);
  assert.ok(Math.abs(result.opening7ValidProbability.probability -
    0.7413707657024893) < 1e-12);
  assert.ok(Math.abs(result.directHeldEightUnconditional.probability -
    0.043086789) < 1e-8);
  assert.ok(Math.abs(result.directHeldEightGivenValidOpening.probability -
    0.0336778344053913) < 1e-12);
  assert.ok(result.directHeldEightGivenValidOpening.probability <
    result.directHeldEightUnconditional.probability);
});

test('source census counts 10 Basic across original printed categories', () => {
  const names = [
    ['Mega Absol ex', 2], ['Trubbish', 2], ['Tapu Koko ♢', 1],
    ['Dedenne-GX', 1], ['Crobat V', 1], ['Squawkabilly ex', 1],
    ['Tapu Lele-GX', 1], ['Budew', 1], ['Garbodor', 2],
    ['Secret Box', 1], ['Quick Ball', 4], ['Other Trainer', 43]
  ];
  // Non-Basic categories are chosen to total exactly 60.
  const cards = names.map(([name, count]) => ({name, count}));
  assert.equal(cards.reduce((n, card) => n + card.count, 0), 60);
  assert.deepEqual(countFromPrintedSource(cards), counts);
});

test('conditional all-Prized location risk differs by singleton vs doubleton', () => {
  const rank8 = allUnseenCopiesPrized(1, 8);
  const rank11 = allUnseenCopiesPrized(2, 8);
  assert.equal(rank8.numerator, '3');
  assert.equal(rank8.denominator, '26');
  assert.ok(Math.abs(rank8.probability - 6 / 52) < 1e-15);
  assert.equal(rank11.numerator, '5');
  assert.equal(rank11.denominator, '442');
  assert.ok(Math.abs(rank11.probability - 15 / 1326) < 1e-15);
  assert.ok(Math.abs(rank8.probability / rank11.probability - 10.2) < 1e-12);
  assert.equal(allUnseenCopiesPrized(1, 0).probability, 0.1);
  assert.ok(Math.abs(allUnseenCopiesPrized(2, 0).probability -
    15 / 1770) < 1e-15);
  assert.throws(() => allUnseenCopiesPrized(0), /at least one/);
});
