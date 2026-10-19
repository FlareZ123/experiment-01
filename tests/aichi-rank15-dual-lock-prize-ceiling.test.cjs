'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  choose, ceilingForBasicCount, prerequisiteFailurePartition, lockTopologyPartition, fromSourceManifest,
} = require('../scripts/aichi-rank15-dual-lock-prize-ceiling.cjs');

test('binomial combinatorics and invalid-choice boundaries are exact', () => {
  assert.equal(choose(60, 6), 50063860n);
  assert.equal(choose(55, 6) - choose(53, 4), 28696850n);
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

test('prioritized source six-Prize failure categories exhaust and separate causes', () => {
  const result = prerequisiteFailurePartition(14);
  assert.equal(result.length, 5);
  assert.deepEqual(result.map(x => x.randomSixPrizes.numerator), [
    '1','2997','663507','58565','409955'
  ]);
  assert.deepEqual(result.map(x => x.randomSixPrizes.denominator), [
    '10','17110','4551260','10012772','715198'
  ]);
  assert.deepEqual(result.map(x => x.givenLegalOpening.numerator), [
    '13444083','5063328051','20393419889','4358254913','18289402231011'
  ]);
  assert.deepEqual(result.map(x => x.givenLegalOpening.denominator), [
    '133576960','29520508160','138562152960',
    '734379410688','31823107796480'
  ]);
  const sum = result.reduce((total, row) =>
    total + row.givenLegalOpening.probability, 0);
  assert.ok(Math.abs(sum - 1) < 1e-12);
  assert.equal(result[4].givenLegalOpening.probability,
    ceilingForBasicCount(14).availabilityGivenLegalFirstSeven.probability);
});

test('single-lock resource feasibility greatly exceeds true two-chain coexistence', () => {
  const topology = lockTopologyPartition(14);
  assert.equal(topology.length, 5);
  assert.deepEqual(topology.map(x => x.givenLegalOpening.numerator), [
    '822691415081','3631373723987','52937152069',
    '287571609092921','18289402231011'
  ]);
  assert.deepEqual(topology.map(x => x.givenLegalOpening.denominator), [
    '47734661694720','36718970534400','6676176460800',
    '954693233894400','31823107796480'
  ]);
  const p = topology.map(x => x.givenLegalOpening.probability);
  assert.ok(Math.abs(p.reduce((a,b)=>a+b,0) - 1) < 1e-12);
  const singleAOR = p[1] + p[3] + p[4];
  const singleBUS = p[2] + p[3] + p[4];
  assert.ok(Math.abs(singleAOR - 0.9748360623134528) < 1e-12);
  assert.ok(Math.abs(singleBUS - 0.8838689317268741) < 1e-12);
  assert.equal(p[4],
    ceilingForBasicCount(14).availabilityGivenLegalFirstSeven.probability);
});
