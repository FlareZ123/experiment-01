'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  ownerHandDiscardCopyReserveFrontier
} = require('../simulation/twinleaf/planning/owner-hand-discard-copy-reserve-frontier.cjs');

const LILLIE = "Lillie's Determination M1L";

/**
 * @param {object} result Count-based v2 frontier result
 * @param {number[]} indices Physical payment indices
 * @returns {object} Matching undominated group
 */
function findGroup(result, indices) {
  const key = indices.join(',');
  const group = result.structurallyUndominatedPaymentGroups.find(row =>
    row.representativePaymentIndices.join(',') === key);
  assert.ok(group, `missing undominated payment group ${key}`);
  return group;
}

/**
 * Derive baseline, total post-payment, and incremental soft shortfall from
 * the current v2 output. The explicit incremental fields are not implemented
 * in the adapter yet.
 * @param {object} result Count-based v2 frontier result
 * @param {object} group Frontier payment group
 * @param {string} printing Exact printing name
 * @returns {{baseline:number,post:number,incremental:number}}
 */
function shortfall(result, group, printing) {
  const row = result.reserveRows.find(item => item.printing === printing);
  assert.ok(row, `missing reserve row for ${printing}`);
  const baseline = row.softCapacityShortfall;
  const post = group.vector.softReserveDeficitByPrinting[printing] ?? 0;
  return {baseline, post, incremental: post - baseline};
}

/**
 * Assert the existing aggregate aliases still describe total post-payment
 * deficit, while payment-induced change is derived relative to the baseline.
 * @param {object} group Frontier payment group
 * @param {number} expectedPost Aggregate post-payment deficit
 * @param {number} expectedIncremental Aggregate payment-induced deficit
 */
function assertAggregate(result, group, expectedPost, expectedIncremental) {
  const baseline = result.reserveRows.reduce((sum, row) =>
    sum + row.softCapacityShortfall, 0);
  assert.equal(group.vector.softReserveDeficit, expectedPost);
  assert.equal(group.vector.protectedSacrificed, expectedPost);
  assert.equal(expectedPost - baseline, expectedIncremental);
  assert.ok(expectedIncremental >= 0);
}

test('pre-existing soft deficit unchanged by unrelated payment has zero increment', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [LILLIE, 'A', 'B', 'C'],
    sourceIndex: null,
    cost: 2,
    softAdditionalCopiesByPrinting: {[LILLIE]: 2}
  });
  const group = findGroup(result, [1, 2]);
  const value = shortfall(result, group, LILLIE);
  assert.deepEqual(value, {baseline: 1, post: 1, incremental: 0});
  assertAggregate(result, group, 1, 0);
});

test('payment that spends the last held soft printing increases existing deficit', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [LILLIE, 'A', 'B', 'C'],
    sourceIndex: null,
    cost: 2,
    softAdditionalCopiesByPrinting: {[LILLIE]: 2},
    deadPrintings: [LILLIE]
  });
  const group = findGroup(result, [0, 1]);
  const value = shortfall(result, group, LILLIE);
  assert.deepEqual(value, {baseline: 1, post: 2, incremental: 1});
  assertAggregate(result, group, 2, 1);
});

test('a satisfied soft reserve can be retained or consumed by the payment', () => {
  const retained = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [LILLIE, LILLIE, 'A', 'B'],
    sourceIndex: null,
    cost: 2,
    softAdditionalCopiesByPrinting: {[LILLIE]: 1},
    desiredDiscardPrintings: [LILLIE]
  });
  const retainedGroup = findGroup(retained, [0, 2]);
  assert.deepEqual(shortfall(retained, retainedGroup, LILLIE),
    {baseline: 0, post: 0, incremental: 0});

  const consumed = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [LILLIE, 'A', 'B'],
    sourceIndex: null,
    cost: 1,
    softAdditionalCopiesByPrinting: {[LILLIE]: 1},
    desiredDiscardPrintings: [LILLIE]
  });
  const consumedGroup = findGroup(consumed, [0]);
  assert.deepEqual(shortfall(consumed, consumedGroup, LILLIE),
    {baseline: 0, post: 1, incremental: 1});
  assertAggregate(consumed, consumedGroup, 1, 1);
});

test('zero-held soft printing remains a baseline deficit, not payment cost', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: ['A', 'B', 'C'],
    sourceIndex: null,
    cost: 2,
    softAdditionalCopiesByPrinting: {L: 2}
  });
  const row = result.reserveRows.find(item => item.printing === 'L');
  assert.ok(row);
  assert.equal(row.heldCopies, 0);
  assert.equal(row.softCapacityShortfall, 2);
  const group = findGroup(result, [0, 1]);
  assert.deepEqual(shortfall(result, group, 'L'),
    {baseline: 2, post: 2, incremental: 0});
  assertAggregate(result, group, 2, 0);
});

test('hard-reserved physical copy is excluded from every available payment', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: ['C', 'A', 'B'],
    sourceIndex: null,
    cost: 1,
    hardMinimumCopiesByPrinting: {C: 1},
    softAdditionalCopiesByPrinting: {C: 1}
  });
  const row = result.reserveRows.find(item => item.printing === 'C');
  assert.deepEqual(row.hardReservedIndices, [0]);
  assert.deepEqual(result.hardReservedIndices, [0]);
  assert.equal(result.availableOtherPhysicalCards, 2);
  assert.ok(result.structurallyUndominatedPaymentGroups.every(group =>
    group.representativePaymentIndices.every(index => index !== 0)));
  for (const group of result.structurallyUndominatedPaymentGroups) {
    assert.deepEqual(shortfall(result, group, 'C'),
      {baseline: 1, post: 1, incremental: 0});
    assertAggregate(result, group, 1, 0);
  }
});

test('hard shortage and hard-plus-soft reserve remain separate', () => {
  const shortage = ownerHandDiscardCopyReserveFrontier({
    handPrintings: ['C', 'A', 'B'],
    sourceIndex: null,
    cost: 2,
    hardMinimumCopiesByPrinting: {C: 2},
    softAdditionalCopiesByPrinting: {C: 1}
  });
  const shortageRow = shortage.reserveRows.find(item => item.printing === 'C');
  assert.equal(shortageRow.hardShortfall, 1);
  assert.deepEqual(shortage.hardReservedIndices, [0]);
  assert.equal(shortage.availableOtherPhysicalCards, 2);
  const shortageGroup = findGroup(shortage, [1, 2]);
  assert.deepEqual(shortfall(shortage, shortageGroup, 'C'),
    {baseline: 1, post: 1, incremental: 0});
  assertAggregate(shortage, shortageGroup, 1, 0);

  const hardAndSoft = ownerHandDiscardCopyReserveFrontier({
    handPrintings: ['C', 'C', 'A', 'B'],
    sourceIndex: null,
    cost: 2,
    hardMinimumCopiesByPrinting: {C: 1},
    softAdditionalCopiesByPrinting: {C: 1},
    desiredDiscardPrintings: ['C']
  });
  const row = hardAndSoft.reserveRows.find(item => item.printing === 'C');
  assert.deepEqual(row.hardReservedIndices, [0]);
  assert.deepEqual(hardAndSoft.hardReservedIndices, [0]);
  const group = findGroup(hardAndSoft, [1, 2]);
  assert.deepEqual(shortfall(hardAndSoft, group, 'C'),
    {baseline: 0, post: 1, incremental: 1});
  assertAggregate(hardAndSoft, group, 1, 1);
});

test('sourceIndex is excluded before baseline and payment shortfall are measured', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [LILLIE, LILLIE, 'A', 'B'],
    sourceIndex: 0,
    cost: 1,
    softAdditionalCopiesByPrinting: {[LILLIE]: 1},
    desiredDiscardPrintings: [LILLIE]
  });
  const row = result.reserveRows.find(item => item.printing === LILLIE);
  assert.equal(row.heldCopies, 1);
  const group = findGroup(result, [1]);
  assert.deepEqual(shortfall(result, group, LILLIE),
    {baseline: 0, post: 1, incremental: 1});
  assert.ok(group.representativePaymentIndices.every(index => index !== 0));
});

test('multiple soft printings expose independent baseline and incremental deficits', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [LILLIE, LILLIE, 'X', 'A', 'B'],
    sourceIndex: null,
    cost: 2,
    softAdditionalCopiesByPrinting: {[LILLIE]: 1, X: 1},
    desiredDiscardPrintings: [LILLIE, 'X']
  });
  const group = findGroup(result, [0, 2]);
  assert.deepEqual(shortfall(result, group, LILLIE),
    {baseline: 0, post: 0, incremental: 0});
  assert.deepEqual(shortfall(result, group, 'X'),
    {baseline: 0, post: 1, incremental: 1});
  assertAggregate(result, group, 1, 1);
});


test('sourceIndex is null or a valid in-range physical hand index', () => {
  const hand = ['A', 'B'];
  const absent = ownerHandDiscardCopyReserveFrontier({
    handPrintings: hand,
    sourceIndex: null,
    cost: 1
  });
  assert.equal(absent.sourceCardPresentInHand, false);
  assert.equal(absent.sourceIndex, null);

  const present = ownerHandDiscardCopyReserveFrontier({
    handPrintings: hand,
    sourceIndex: 0,
    cost: 1
  });
  assert.equal(present.sourceCardPresentInHand, true);
  assert.equal(present.sourcePrinting, 'A');

  for (const sourceIndex of [-1, hand.length, 0.5, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => ownerHandDiscardCopyReserveFrontier({
      handPrintings: hand,
      sourceIndex,
      cost: 1
    }));
  }
});
