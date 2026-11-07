'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const source60 = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const {choose, twoTargetSearchAvailability} =
  require('../simulation/evaluation/agent21-root93-k0-two-target-availability.cjs');

/** @param {string} name @returns {number} */
function printedCopies(name) {
  return source60.entries.filter(row => row.name_en === name)
    .reduce((sum, row) => sum + row.count, 0);
}

test('the fixed 60 contains three searchable Basic Psychic and four Fog', () => {
  assert.equal(source60.counts.total, 60);
  assert.equal(printedCopies('Basic Psychic Energy'), 3);
  assert.equal(printedCopies('Fog Crystal'), 4);
  assert.equal(printedCopies('Telepathic Psychic Energy'), 3);
});

test('exact root93 K0 conditional distinguishes Basic from all Energy', () => {
  // Historical owner-visible evidence: two Basic Psychic and one Fog played;
  // ten hand, five board, four discard, 35 deck, six face-down Prizes.
  const r = twoTargetSearchAvailability({
    deckCount:35, prizeCount:6,
    firstTargetRemaining:1, secondTargetRemaining:3
  });
  assert.deepEqual([r.hiddenCount, r.deckCount, r.prizeCount],
    [41, 35, 6]);
  assert.equal(r.firstTargetUnavailable.numerator, '6');
  assert.equal(r.firstTargetUnavailable.denominator, '41');
  assert.equal(r.secondTargetUnavailable.numerator, '1');
  assert.equal(r.secondTargetUnavailable.denominator, '533');
  assert.equal(r.bothUnavailable.numerator, '3');
  assert.equal(r.bothUnavailable.denominator, '20254');
  assert.equal(r.bothAvailable.numerator, '17255');
  assert.equal(r.bothAvailable.denominator, '20254');
  assert.equal(r.empiricalNativeGameProbability, false);
});

test('with no Prizes, both searches have a target', () => {
  const r = twoTargetSearchAvailability({
    deckCount:7, prizeCount:0,
    firstTargetRemaining:1, secondTargetRemaining:3
  });
  assert.equal(r.bothAvailable.decimal, 1);
  assert.equal(r.firstTargetUnavailable.decimal, 0);
  assert.equal(r.secondTargetUnavailable.decimal, 0);
});

test('if every remaining slot is a Prize, neither target is in deck', () => {
  const r = twoTargetSearchAvailability({
    deckCount:0, prizeCount:6,
    firstTargetRemaining:1, secondTargetRemaining:3
  });
  assert.equal(r.bothAvailable.decimal, 0);
  assert.equal(r.bothUnavailable.decimal, 1);
});

test('a single deck slot cannot house two distinct search targets', () => {
  const r = twoTargetSearchAvailability({
    deckCount:1, prizeCount:3,
    firstTargetRemaining:1, secondTargetRemaining:1
  });
  assert.equal(r.bothAvailable.decimal, 0);
  assert.equal(r.firstTargetUnavailable.decimal, 0.75);
});

test('small exhaustive labeled-position calculation independently matches', () => {
  // Five unresolved physical slots, positions 0..1 Prized, 2..4 in deck.
  // Two distinguishable target cards occupy 5*4 ordered distinct positions.
  let valid = 0, total = 0;
  for (let first = 0; first < 5; first++) {
    for (let second = 0; second < 5; second++) {
      if (first === second) continue;
      total++;
      if (first >= 2 && second >= 2) valid++;
    }
  }
  assert.equal(total,20);
  assert.equal(valid,6);
  const r = twoTargetSearchAvailability({
    deckCount:3, prizeCount:2,
    firstTargetRemaining:1, secondTargetRemaining:1
  });
  assert.equal(r.bothAvailable.decimal, valid / total);
});

test('invalid physical population and target counts fail closed', () => {
  const base = {
    deckCount:35, prizeCount:6,
    firstTargetRemaining:1, secondTargetRemaining:3
  };
  const rejected = [
    {...base, deckCount:-1},
    {...base, deckCount:55},
    {...base, prizeCount:7},
    {...base, firstTargetRemaining:0},
    {...base, secondTargetRemaining:0},
    {...base, secondTargetRemaining:41},
    {...base, deckCount:0, prizeCount:1}
  ];
  for (const trial of rejected)
    assert.throws(() => twoTargetSearchAvailability(trial));
  assert.equal(choose(60,61),0n);
  assert.equal(choose(5,2),10n);
});
