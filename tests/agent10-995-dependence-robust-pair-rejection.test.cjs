'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MAX_NULL_EXPECTED_NONWINS_PER_PAIR, BETS,
  dependenceRobustBlockFactor, assessDependenceRobustPairedRejection
} = require('../simulation/evaluation/agent10-995-dependence-robust-pair-rejection.cjs');

const FROZEN = 'single-frozen-sixty-and-player-policy';

/**
 * @param {number} rank Original Top32 placement.
 * @param {number} index Globally unique independent full-block identifier.
 * @param {Array<'win'|'loss'|'tie'>} outcomes One result in each seat.
 * @returns {object} Synthetic block; externally verified qualification absent.
 */
function pair(rank, index, outcomes) {
  return {
    id: 'block-' + index, design: 'PRECOMMITTED_ONE_PER_SEAT',
    candidateId: FROZEN, originalRank: rank,
    games: outcomes.map((outcome, seat) => ({
      id: 'game-' + index + '-' + seat, sourceSeat: seat,
      outcome, qualification: 'QUALIFIED'
    }))
  };
}

test('conditional null sum floor is exactly 0.32', () => {
  assert.equal(MAX_NULL_EXPECTED_NONWINS_PER_PAIR, 0.32);
  assert.equal(BETS.reduce((sum, bet) => sum + bet.weight, 0), 1);
  assert.ok(BETS.every(bet => bet.eta <= 1 / 0.32));
});

test('fixed betting factors are nonnegative for all three block outcomes', () => {
  for (const {eta} of BETS) {
    const values = [0, 1, 2].map(n =>
      dependenceRobustBlockFactor(n, eta));
    assert.ok(values.every(x => x >= 0));
    assert.ok(values[0] <= values[1] && values[1] <= values[2]);
  }
  assert.equal(dependenceRobustBlockFactor(0, 3.125), 0);
  assert.equal(dependenceRobustBlockFactor(2, 3.125), 6.25);
});

test('perfectly correlated null pair satisfies e-factor expectation one', () => {
  for (const {eta} of BETS) {
    const expectation = 0.84 * dependenceRobustBlockFactor(0, eta) +
      0.16 * dependenceRobustBlockFactor(2, eta);
    assert.ok(Math.abs(expectation - 1) < 1e-12);
  }
  // Invalid independence-based q=1 paired multiplier would have
  // expectation 6.25 in the SAME legal correlated null.
  const unsafeIndependentPairExpected = 0.16 * (1 / 0.16) ** 2;
  assert.equal(unsafeIndependentPairExpected, 6.25);
});

test('single-nonwin null with 0.32 probability has expectation one', () => {
  for (const {eta} of BETS) {
    const expectation = 0.68 * dependenceRobustBlockFactor(0, eta) +
      0.32 * dependenceRobustBlockFactor(1, eta);
    assert.ok(Math.abs(expectation - 1) < 1e-12);
  }
});

test('exact 4-pair all nonwin path crosses the global 5% boundary', () => {
  const sequence = Array.from({length: 4}, (_, i) =>
    pair(11, i + 1, ['loss', 'tie']));
  const result = assessDependenceRobustPairedRejection(sequence, FROZEN);
  assert.equal(result.firstCrossing.blockOrdinal, 4);
  assert.equal(result.rejectionFlag, true);
  assert.equal(result.ranks[10].pairedBlocks, 4);
  assert.deepEqual(result.ranks[10].sourceSeatCounts, [4, 4]);
  assert.equal(result.qualifiedGameClaims, 8);
  assert.ok(result.globalLogEValue >= Math.log(20));
  assert.equal(result.withinPairIndependenceRequired, false);
  assert.equal(result.externallyVerifiedCompetitiveGameQualification, false);
});

test('three all-nonwin blocks cannot cross, nor can no blocks', () => {
  const empty = assessDependenceRobustPairedRejection([], FROZEN);
  assert.ok(Math.abs(empty.globalLogEValue) < 1e-12);
  assert.equal(empty.rejectionFlag, false);
  const sequence = Array.from({length: 3}, (_, i) =>
    pair(11, i + 1, ['loss', 'loss']));
  const result = assessDependenceRobustPairedRejection(sequence, FROZEN);
  assert.equal(result.rejectionFlag, false);
  assert.equal(result.firstCrossing, null);
});

test('first anytime crossing survives later fully winning paired blocks', () => {
  const losses = Array.from({length: 4}, (_, i) =>
    pair(12, i + 1, ['loss', 'loss']));
  const wins = Array.from({length: 10}, (_, i) =>
    pair(12, i + 5, ['win', 'win']));
  const result = assessDependenceRobustPairedRejection(
    [...losses, ...wins], FROZEN);
  assert.equal(result.firstCrossing.blockOrdinal, 4);
  assert.equal(result.rejectionFlag, true);
  assert.ok(result.globalLogEValue < Math.log(20));
});

test('adaptive scheduling between ranks retains independent rank e-processes', () => {
  const sequence = [
    pair(5, 1, ['loss', 'loss']),
    pair(21, 2, ['win', 'win']),
    pair(5, 3, ['loss', 'loss']),
    pair(21, 4, ['loss', 'win']),
    pair(5, 5, ['loss', 'loss']),
    pair(5, 6, ['loss', 'loss'])
  ];
  const result = assessDependenceRobustPairedRejection(sequence, FROZEN);
  assert.equal(result.firstCrossing.blockOrdinal, 6);
  assert.equal(result.ranks[4].pairedBlocks, 4);
  assert.equal(result.ranks[20].pairedBlocks, 2);
});

test('malformed blocks fail closed using shared rigorous shape validator', () => {
  const good = pair(1, 1, ['win', 'loss']);
  assert.throws(() => assessDependenceRobustPairedRejection([
    {...good, candidateId: 'changed'}
  ], FROZEN));
  assert.throws(() => assessDependenceRobustPairedRejection([
    {...good, games: [good.games[0]]}
  ], FROZEN));
  assert.throws(() => assessDependenceRobustPairedRejection([
    {...good, games: [good.games[0],
      {...good.games[1], sourceSeat: 0}]}
  ], FROZEN));
  assert.throws(() => assessDependenceRobustPairedRejection([
    {...good, games: [good.games[0],
      {...good.games[1], qualification: 'UNQUALIFIED'}]}
  ], FROZEN));
  assert.throws(() => assessDependenceRobustPairedRejection([
    good, {...good, id: 'different-block'}
  ], FROZEN));
});

test('invalid counts and betting rates cannot enter the e-factor', () => {
  assert.throws(() => dependenceRobustBlockFactor(-1, 1));
  assert.throws(() => dependenceRobustBlockFactor(3, 1));
  assert.throws(() => dependenceRobustBlockFactor(1, -1));
  assert.throws(() => dependenceRobustBlockFactor(1, 3.126));
});

test('no positive certificate can be obtained from all hypothetical wins', () => {
  const rows = Array.from({length: 32}, (_, i) =>
    pair(i + 1, i + 1, ['win', 'win']));
  const result = assessDependenceRobustPairedRejection(rows, FROZEN);
  assert.equal(result.rejectionFlag, false);
  assert.match(result.verdict, /NEVER-A-POSITIVE/);
  assert.equal(result.qualifiedGameClaims, 64);
  assert.equal(result.externallyVerifiedConditionalNullMean, false);
});
