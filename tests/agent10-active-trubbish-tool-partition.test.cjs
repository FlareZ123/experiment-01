'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose, sourceCategories, census, percent} =
  require('../scripts/agent10-active-trubbish-tool-partition.cjs');

const EXPECTED = Object.freeze({
  any: 2583674027686640n,
  float: 1537670613426920n,
  floatAndMuscle: 180886624269400n,
  noFloatMuscle: 395984300549880n,
  noFloatNoMuscleSeal: 650019113709840n,
  otherBasicDraw: 391601283181920n
});

test('frozen published rank-11 physical source categories are complete', () => {
  assert.deepEqual(sourceCategories(), [2, 3, 1, 2, 2, 2, 4, 9, 35]);
  assert.equal(sourceCategories().reduce((a, b) => a + b, 0), 60);
  assert.equal(choose(52, 6), 20358520n);
  assert.equal(choose(52, 51), 52n);
  assert.equal(choose(52, 53), 0n);
});

test('forced Active route reproduces the prior exact 0.79735395% event', () => {
  const result = census();
  assert.equal(result.denominator, 324031005021884160n);
  assert.deepEqual(result.events, EXPECTED);
  const probability = percent(result.events.any, result.denominator);
  assert.ok(Math.abs(probability - 0.7973539530614195) < 1e-10);
  console.log('source rank11 H7-valid exact chance:', probability.toFixed(10), '%');
});

test('active Float-versus-Muscle overlap and genuine first-draw Basic', () => {
  const {events, denominator} = census();
  assert.equal(events.float + events.noFloatMuscle +
    events.noFloatNoMuscleSeal, events.any);
  assert.ok(events.floatAndMuscle > 0n);
  assert.ok(events.floatAndMuscle < events.float);
  assert.ok(events.otherBasicDraw > 0n);
  assert.ok(events.otherBasicDraw < events.any);
  for (const [name, numerator] of Object.entries(events)) {
    console.log(name, numerator.toString(),
      percent(numerator, denominator).toFixed(8) + '%');
  }
});
