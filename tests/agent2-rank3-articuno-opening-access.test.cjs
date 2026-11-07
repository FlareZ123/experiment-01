'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {analyze, choose} =
  require('../simulation/evaluation/agent2-rank3-articuno-opening-access.cjs');

test('BigInt binomial coefficients are exact', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(49, 7), 85900584n);
  assert.equal(choose(53, 6), 22957480n);
  assert.equal(choose(3, 7), 0n);
  assert.equal(choose(0, 0), 1n);
});

test('rank3 inventory and card-text routes are validated', () => {
  const result = analyze();
  assert.equal(result.source.deckSize, 60);
  assert.equal(result.source.articunoCopies, 1);
  assert.equal(result.source.basicWaterCopies, 2);
  assert.equal(result.source.captureEnergyCopies, 3);
  assert.equal(result.source.otherBasicCopies, 10);
  assert.equal(result.source.quickBallCopies, 1);
  assert.equal(result.source.hisuianHeavyBallCopies, 1);
  assert.equal(result.source.arvenCopies, 4);
  assert.equal(result.source.pokemonToolCopies, 4);
  assert.equal(result.source.nestBallCopiesExcluded, 3);
  assert.match(result.cardText.articunoAbility, /from your hand onto your Bench/);
  assert.equal(result.cardText.nestBallPutsDirectlyOntoBench, true);
  assert.equal(result.cardText.captureEnergyProvidesColorless, true);
  assert.equal(result.cardText.captureEnergySearchesDirectlyToBench, true);
});

test('exact opening and Prize prior matches independent calculation', () => {
  const result = analyze();
  assert.equal(result.assumptions.validOpeningHands, '300306336');
  assert.equal(result.counts.waterAndOtherBasicOpenings, '59277504');
  assert.equal(result.percentagesAmongValidOpenings.articunoInHand,
    '1.839115042847');
  assert.equal(result.percentagesAmongValidOpenings.quickBallInHand,
    '1.506667568217');
  assert.equal(result.percentagesAmongValidOpenings.heavyBallInHand,
    '0.192340540623');
  assert.equal(result.percentagesAmongValidOpenings.arvenRoute,
    '4.921652821266');
  assert.equal(result.percentagesAmongValidOpenings.itemOnly,
    '3.538123151687');
  assert.equal(result.percentagesAmongValidOpenings.allIncludedRoutes,
    '8.459775972953');
  assert.equal(result.exactProbability,
    '1402020105757/16572780535080');
});

test('disjoint route components sum to the exact favorable count', () => {
  const result = analyze();
  const total = Object.values(result.counts.components)
    .reduce((sum, value) => sum + BigInt(value), 0n);
  assert.equal(total, BigInt(result.counts.favorablePrizeWeightedHands));
});
