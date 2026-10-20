'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {choose, fraction, printedGengarWindow} =
  require('../scripts/new-moon-printed-gengar-thorns-window.cjs');

test('exact elementary combinations and fraction reduction', () => {
  assert.equal(choose(5, 0), 1n);
  assert.equal(choose(5, 2), 10n);
  assert.equal(choose(5, 5), 1n);
  assert.equal(choose(5, 6), 0n);
  assert.deepEqual(fraction(6n, 8n), {
    numerator: '3', denominator: '4', probability: 0.75
  });
});

test('frozen New Moon printed Gengar resource event is exactly decomposed', () => {
  const r = printedGengarWindow();
  assert.equal(r.sourceManifestHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(r.basicPokemon, 17);
  assert.deepEqual(r.physicalCounts, {
    gengar: 1, attachableEnergy: 6, basicSearchableEnergy: 3, fog: 4
  });
  assert.equal(r.gengarInLegalSeven.numerator, '1185723');
  assert.equal(r.gengarInLegalSeven.denominator, '9315337');
  assert.equal(r.directlySeenEnergy.numerator, '12349477');
  assert.equal(r.directlySeenEnergy.denominator, '176991403');
  assert.equal(r.fogBasicEnergySupplement.numerator, '263689004544');
  assert.equal(r.fogBasicEnergySupplement.denominator, '10365501516695');
  assert.equal(r.total.numerator, '986936125049');
  assert.equal(r.total.denominator, '10365501516695');
  assert.ok(Math.abs(r.total.probability - 0.09521354306488788) < 1e-14);
  assert.ok(Math.abs(r.directlySeenEnergy.probability +
    r.fogBasicEnergySupplement.probability - r.total.probability) < 1e-14);
});
