'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {choose, calculate} = require('../scripts/rank31-fog-energy-direct.cjs');

test('exact joint Chimecho/Fog/Energy opportunity uses prize-aware source 60', () => {
  const result = calculate();
  assert.deepEqual(result.direct, {numerator: 1203713n, denominator: 21455940n});
  assert.deepEqual(result.fogBridge, {numerator: 51799174n, denominator: 1984053357n});
  assert.deepEqual(result.union, {numerator: 61980957227n, denominator: 753940275660n});
  assert.deepEqual(result.conditionalUnion, {numerator: 61980957227n, denominator: 665351694150n});
  assert.equal(Number(result.union.numerator) / Number(result.union.denominator), 0.08220937284818988);
});

test('two searchable Basic Psychic remain in the 52-card unseen pool', () => {
  assert.equal(choose(52, 6), 20358520n);
  assert.equal(choose(50, 4), 230300n);
  assert.equal(choose(59, 7), 341149446n);
  assert.throws(() => choose(4, 5), RangeError);
});
