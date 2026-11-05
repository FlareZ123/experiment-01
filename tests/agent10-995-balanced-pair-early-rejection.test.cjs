'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  RANKS, NECESSARY_RANK_WIN_RATE, GLOBAL_E_THRESHOLD, ALTERNATIVES,
  pairedRankLogEValue, assessBalancedPairRejection
} = require('../simulation/evaluation/agent10-995-balanced-pair-early-rejection.cjs');

const FIXED = 'one-frozen-60-and-policy';

/**
 * @param {number} rank Original opponent rank.
 * @param {number} index Unique registered block ID.
 * @param {Array<'win'|'loss'|'tie'>} outcomes Two independent results.
 * @param {Array<0|1>} [seats] Physical original seats.
 * @returns {object} Synthetic fully admitted block; labels are not proof.
 */
function block(rank, index, outcomes, seats = [0, 1]) {
  return {
    id: 'block-' + index,
    design: 'PRECOMMITTED_ONE_PER_SEAT',
    candidateId: FIXED,
    originalRank: rank,
    games: outcomes.map((outcome, j) => ({
      id: 'game-' + index + '-' + j,
      sourceSeat: seats[j],
      outcome,
      qualification: 'QUALIFIED'
    }))
  };
}

test('the 99.5% field requires an equal-seat 84% per-rank floor', () => {
  assert.equal(RANKS, 32);
  assert.equal(NECESSARY_RANK_WIN_RATE, 0.84);
  assert.equal((31 + NECESSARY_RANK_WIN_RATE) / 32, 0.995);
  assert.equal(ALTERNATIVES.reduce((n, a) => n + a.weight, 0), 1);
  assert.equal(Math.exp(pairedRankLogEValue(0, 0)), 1);
});

test('pairwise likelihood ratio expectations are <=1 under asymmetric null', () => {
  for (let index = 0; index <= 32; index++) {
    const r0 = index / 100;
    const r1 = 0.32 - r0;
    const probability = [
      (1 - r0) * (1 - r1),
      r0 * (1 - r1) + r1 * (1 - r0),
      r0 * r1
    ];
    for (const {nonwinRate: q} of ALTERNATIVES) {
      const ratio = [
        ((1 - q) / 0.84) ** 2,
        (q / 0.16) * ((1 - q) / 0.84),
        (q / 0.16) ** 2
      ];
      const expectation = probability.reduce((sum, p, j) =>
        sum + p * ratio[j], 0);
      assert.ok(expectation <= 1 + 1e-12,
        'Null pair cannot grow expected e-value for q=' + q);
    }
  }
});

test('two complete all-nonwin blocks conditionally reject the field target', () => {
  const result = assessBalancedPairRejection([
    block(5, 1, ['loss', 'tie']),
    block(5, 2, ['loss', 'loss'])
  ], FIXED);
  assert.equal(result.rejectionFlag, true);
  assert.equal(result.firstCrossing.completedBlockOrdinal, 2);
  assert.equal(result.firstCrossing.originalRank, 5);
  assert.ok(Math.exp(result.ranks[4].logEValue) > 640);
  assert.ok(Math.exp(result.globalLogEValue) > GLOBAL_E_THRESHOLD);
  assert.equal(result.observedQualifiedGameClaims, 4);
  assert.equal(result.qualifiedGamesVerifiedExternally, false);
});

test('single all-nonwin block cannot cross global 5% boundary', () => {
  const result = assessBalancedPairRejection([
    block(5, 1, ['loss', 'loss'])
  ], FIXED);
  assert.equal(result.firstCrossing, null);
  assert.equal(result.rejectionFlag, false);
  assert.equal(result.completedBlockClaims, 1);
});

test('adaptive interleaving of completed rank blocks preserves rank counts', () => {
  const result = assessBalancedPairRejection([
    block(5, 1, ['loss', 'loss']),
    block(22, 2, ['win', 'win']),
    block(5, 3, ['loss', 'loss'])
  ], FIXED);
  assert.equal(result.firstCrossing.completedBlockOrdinal, 3);
  assert.equal(result.ranks[4].pairedBlocks, 2);
  assert.equal(result.ranks[21].pairedBlocks, 1);
  assert.deepEqual(result.ranks[4].sourceSeatCounts, [2, 2]);
  assert.equal(result.observedQualifiedGameClaims, 6);
});

test('an anytime rejection remains recorded after later wins reduce the current e-value', () => {
  const losses = [
    block(1, 1, ['loss', 'loss']),
    block(1, 2, ['loss', 'loss'])
  ];
  const later = Array.from({length: 12}, (_, i) =>
    block(1, i + 3, ['win', 'win']));
  const result = assessBalancedPairRejection([...losses, ...later], FIXED);
  assert.equal(result.firstCrossing.completedBlockOrdinal, 2);
  assert.equal(result.firstCrossing.originalRank, 1);
  assert.equal(result.rejectionFlag, true);
  assert.ok(result.globalLogEValue < Math.log(GLOBAL_E_THRESHOLD));
});

test('zero blocks and all-win blocks give no positive strength certification', () => {
  const empty = assessBalancedPairRejection([], FIXED);
  assert.equal(empty.globalLogEValue, 0);
  const winBlocks = Array.from({length: 32}, (_, i) =>
    block(i + 1, i + 1, ['win', 'win']));
  const result = assessBalancedPairRejection(winBlocks, FIXED);
  assert.equal(result.rejectionFlag, false);
  assert.equal(result.observedQualifiedGameClaims, 64);
  assert.match(result.interpretation, /never evidence/);
});

test('high-count logs stay finite without falsely converting wins to proof', () => {
  const logE = pairedRankLogEValue(10000, 0);
  assert.ok(Number.isFinite(logE));
  assert.ok(logE < 0);
  const allLosses = pairedRankLogEValue(0, 10000);
  assert.ok(Number.isFinite(allLosses));
  assert.ok(allLosses > 10000);
});

test('reject duplicate IDs, incompatible candidates and empty or invalid outcomes', () => {
  const good = block(1, 1, ['loss', 'win']);
  assert.throws(() => assessBalancedPairRejection([good, good], FIXED));
  assert.throws(() => assessBalancedPairRejection([
    {...good, candidateId: 'another-deck'}
  ], FIXED));
  assert.throws(() => assessBalancedPairRejection([
    {...good, originalRank: 33}
  ], FIXED));
  assert.throws(() => assessBalancedPairRejection([
    {...good, games: [good.games[0]]}
  ], FIXED));
  assert.throws(() => assessBalancedPairRejection([
    {...good, design: 'RETROSPECTIVE_HAND_PICK'}
  ], FIXED));
  assert.throws(() => pairedRankLogEValue(1, 0));
});

test('reject duplicate physical seats, unqualified games and repeated game IDs', () => {
  const badSeat = block(2, 1, ['win', 'loss'], [0, 0]);
  assert.throws(() => assessBalancedPairRejection([badSeat], FIXED));
  const good = block(2, 1, ['win', 'loss']);
  const unqualified = {...good, games: [
    good.games[0], {...good.games[1], qualification: 'CAPPED'}
  ]};
  assert.throws(() => assessBalancedPairRejection([unqualified], FIXED));
  const duplicate = {...good, id: 'another-block'};
  assert.throws(() => assessBalancedPairRejection([good, duplicate], FIXED));
});

test('rejected pair evidence cannot silently import a one-seat losing streak', () => {
  const first = block(1, 1, ['loss', 'loss'], [0, 0]);
  assert.throws(() => assessBalancedPairRejection([first], FIXED));
  assert.equal(Math.exp(pairedRankLogEValue(0, 4)) > 640, true);
});
