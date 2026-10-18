'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  choose, ceilingForBasicCount, fromSourceManifest,
} = require('../scripts/aichi-rank15-dual-lock-prize-ceiling.cjs');

test('binomial combinatorics and invalid-choice boundaries are exact', () => {
  assert.equal(choose(60, 6), 50063860n);
  assert.equal(choose(55, 6) - choose(53, 4), 28695975n);
  assert.equal(choose(6, 7), 0n);
  assert.equal(choose(6, -1), 0n);
});

test('rank-15 unconditioned six-Prize ceiling is the exact source count', () => {
  const result = ceilingForBasicCount(14);
  assert.deepEqual(result.randomSixPrizeAvailability, {
    numerator: '409955',
    denominator: '715198',
    probability: 409955 / 715198,
  });
  assert.deepEqual(result.availabilityGivenLegalFirstSeven, {
    numerator: '18289402231011',
    denominator: '31823107796480',
    probability: 18289402231011 / 31823107796480,
  });
  assert.equal(result.necessaryCardsOutsidePrizes.vileplumeBUS, 1);
  assert.equal(result.countsOnlyNecessaryPrerequisites, true);
  assert.equal(result.qualifiesCompetitiveResults, false);
});

test('Basic-valid opening must be conditioned rather than treated independent', () => {
  const result = ceilingForBasicCount(14);
  assert.equal(result.legalOpeningProbability.probability,
    252032 / 292581);
  assert.ok(result.availabilityGivenLegalFirstSeven.probability >
    result.randomSixPrizeAvailability.probability);
});

test('actual published rank-15 60 and exact Pokémon printings drive the model', () => {
  const source = fromSourceManifest();
  assert.equal(source.rank, 15);
  assert.equal(source.printedBasicCount, 14);
  assert.equal(source.randomSixPrizeAvailability.numerator, '409955');
});
