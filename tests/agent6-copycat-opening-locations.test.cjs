'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {openingLocations} = require('../scripts/agent6-copycat-opening-locations.cjs');

/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12,
    'expected ' + expected + '; got ' + actual);
}

const cases = [
  {basics: 14, valid: 0.8614093191287199, both: 0.008086712420603534,
    held: 0.020161493995095238, deck: 0.143832822930647,
    prized: 0.015582378613092276, doubleHeld: 0.013773251015744033,
    cut: 0.02366909103369581},
  {basics: 15, valid: 0.8824992053482629, both: 0.00815359379512899,
    held: 0.020331752922463045, deck: 0.14421847736619808,
    prized: 0.015625531276279934, doubleHeld: 0.013444099108258053,
    cut: 0.023779125071408926}
];

for (const c of cases) {
  test('exact three-zone distribution with ' + c.basics + ' Basics', () => {
    const a = openingLocations({basicCount: c.basics});
    assert.equal(a.states.length, 27);
    near(a.states.reduce((sum, s) => sum + s.probability, 0), 1);
    near(a.validOpeningProbability, c.valid);
    near(a.bothCorePrized, c.both);
    near(a.singleCorePrizedBallInHand, c.held);
    near(a.singleCorePrizedBallInDeck, c.deck);
    near(a.singleCorePrizedBallPrized, c.prized);
    near(a.bothCoreInOpeningHand, c.doubleHeld);
    near(a.exactlyOneCorePrized, c.held + c.deck + c.prized);
    near(a.immediatePrizeOnlyCut, c.cut);
    near(a.immediatePrizeOnlyCut, c.both + c.prized);
  });
}

test('role and zone symmetries preserve exact probabilities', () => {
  for (const basics of [2, 5, 14, 15, 30, 59]) {
    const a = openingLocations({basicCount: basics});
    for (const s of a.states) {
      const reverse = a.states.find(t => t.mimikyu === s.dialga &&
        t.dialga === s.mimikyu && t.heavyBall === s.heavyBall);
      assert.ok(reverse);
      near(s.probability, reverse.probability);
    }
    near(a.immediatePrizeOnlyCut, a.bothCorePrized + a.singleCorePrizedBallPrized);
  }
});

test('invalid initial Basic counts fail closed', () => {
  for (const basics of [-1, 0, 1, 60, 1.5, NaN, Infinity]) {
    assert.throws(() => openingLocations({basicCount: basics}));
  }
});
