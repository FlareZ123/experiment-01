'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {comparePair, auditV3SeedDistribution} =
  require('../scripts/aichi-v3-seed-distribution-audit.cjs');

test('same physical shuffle seed must reproduce all 60 positions', () => {
  assert.deepEqual(comparePair(123456, 123456), {
    alignedFirstCoinSame: true, matchingPositions: 60, openingOverlap: 7
  });
});

test('v3 derives stable, decorrelated shuffle-only metrics on the fixed grid', () => {
  const observed = auditV3SeedDistribution();
  assert.equal(observed.pairs, 6400);
  assert.equal(observed.uniqueNonzeroV3Seeds, 12800);
  assert.equal(observed.protocolV2.alignedFirstCoinAgreement, 1);
  assert.equal(observed.protocolV3.alignedFirstCoinAgreement, 0.50625);
  assert.equal(observed.protocolV2.meanMatchingPositions, 2.73109375);
  assert.equal(observed.protocolV3.meanMatchingPositions, 1.003125);
  assert.equal(observed.protocolV2.meanOpeningSevenOverlap, 0.8765625);
  assert.equal(observed.protocolV3.meanOpeningSevenOverlap, 0.80546875);
  assert.equal(observed.independentPermutationReference.meanMatchingPositions, 1);
  assert.equal(observed.independentPermutationReference.meanOpeningSevenOverlap,
    49 / 60);
  assert.match(observed.caveat, /not game outcome independence/);
});

test('audit rejects invalid grids and is deterministic across short repetitions', () => {
  for (const options of [
    {repeats:0}, {repeats:101}, {highestRank:0}, {highestRank:33},
    {seedBase:-1}, {seedBase:2**32}
  ]) {
    assert.throws(() => auditV3SeedDistribution(options), /Invalid bounded seed/);
  }
  const a = auditV3SeedDistribution({highestRank:3,repeats:2});
  assert.deepEqual(a, auditV3SeedDistribution({highestRank:3,repeats:2}));
  assert.equal(a.pairs, 12);
  assert.equal(a.uniqueNonzeroV3Seeds, 24);
  assert.equal(a.protocolV2.alignedFirstCoinAgreement, 1);
});
