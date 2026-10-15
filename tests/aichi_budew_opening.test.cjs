'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {choose, openingProbabilities, auditPublishedBudew} = require('../scripts/aichi_budew_opening.cjs');

test('binomial and invalid disjoint categories', () => {
  assert.equal(choose(60,7),386206920);
  assert.throws(()=>openingProbabilities({deckSize:60,handSize:7,basics:2,budew:2,regidragoV:4}),/Invalid/);
});

test('published Budew field coverage and anchor', () => {
  const rows=auditPublishedBudew();
  assert.equal(rows.length,14);
  assert.equal(rows.filter(x=>x.archetype==='Regidrago').length,9);
  const rank10=rows.find(x=>x.rank===10);
  assert.equal(rank10.budewCopies,2);
  assert.ok(Math.abs(rank10.budew-0.25095651668748364)<1e-12);
});
