'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { exactDirectWithBonus, fourBasicSourceMixture } =
  require('../scripts/agent3-jellicent-thorns-mulligan-access.cjs');

/** @param {number} value @param {number} expected */
function near(value, expected) {
  assert.ok(Math.abs(value - expected) < 1e-11, `${value} != ${expected}`);
}

test('zero bonus equals independent strict direct Lab + Boost opener', () => {
  const base = exactDirectWithBonus(0);
  near(base.probability, 0.07642609697569731);
  assert.ok(base.numerator > 0n && base.denominator > base.numerator);
});

test('one and two extra draws preserve Jellicent in searchable deck', () => {
  near(exactDirectWithBonus(1).probability, 0.09587726583388122);
  near(exactDirectWithBonus(2).probability, 0.116113224886456);
  near(exactDirectWithBonus(3).probability, 0.13681028751488677);
});

test('four-Basic opponent geometric mulligans, not assumed free infinite draw', () => {
  const out = fourBasicSourceMixture();
  near(out.sourceValidOpeningProbability, 0.3994996257446656);
  near(out.expectedSourceMulligans, 1.503131256095683);
  near(out.probability, 0.10650445960870358);
  assert.ok(out.tailProbabilityUpperBound < 4e-11);
  assert.ok(out.tailProbabilityUpperBound > 3e-11);
});

test('large bonuses can draw all Jellicent and destroy Boost-search access', () => {
  assert.equal(exactDirectWithBonus(46).numerator, 0n);
  assert.ok(exactDirectWithBonus(23).probability > exactDirectWithBonus(30).probability);
});

test('invalid requested bonuses and deck counts are rejected', () => {
  assert.throws(() => exactDirectWithBonus(-1), RangeError);
  assert.throws(() => exactDirectWithBonus(47), RangeError);
  assert.throws(() => exactDirectWithBonus(0, {frillish:5}), RangeError);
  assert.throws(() => exactDirectWithBonus(0, {totalBasics:2}), RangeError);
});
