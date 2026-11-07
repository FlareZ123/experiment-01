'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {ownerHandDiscardCopyReserveFrontier} =
  require('../../simulation/twinleaf/planning/owner-hand-discard-copy-reserve-frontier.cjs');

const BOX = 'Secret Box TWM';
const VIP = 'Battle VIP Pass FST';
const CARRIER = 'Rescue Carrier EVS';
const LILLIE = "Lillie's Determination M1L";

test('identical soft-reserved copies share one printing-count payment group', () => {
  const hand = [
    VIP, CARRIER, VIP, CARRIER, LILLIE, LILLIE,
    'Powerglass SFA', 'Forest Seal Stone SIT', 'Mysterious Treasure FLI'
  ];
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: hand,
    sourceIndex: null,
    cost: 3,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1},
    softAdditionalCopiesByPrinting: {[LILLIE]: 1},
    deadPrintings: [VIP],
    nextHandDiscardCost: 2
  });
  const lilliePayment = result.structurallyUndominatedPaymentGroups.find(group =>
    group.representativePaymentPrintings.join('|') ===
      [VIP, VIP, LILLIE].join('|'));
  const carrierPayment = result.structurallyUndominatedPaymentGroups.find(group =>
    group.representativePaymentPrintings.join('|') ===
      [VIP, VIP, CARRIER].join('|'));
  assert.ok(lilliePayment);
  assert.ok(carrierPayment);
  assert.equal(lilliePayment.equivalentPhysicalPayments, 2);
  assert.equal(result.paymentScoreGroupPhysicalPayments,
    result.possibleFirstPaymentCount);
  assert.equal(lilliePayment.vector.protectedSacrificed, 0);
  assert.equal(lilliePayment.vector.softReserveDeficitByPrinting[LILLIE], 0);
  assert.equal(lilliePayment.vector.nextUnprotectedPaymentWays, '6');
  assert.equal(lilliePayment.vector.unprotectedRemainingByPrinting[CARRIER], 1);
  assert.equal(lilliePayment.vector.unprotectedRemainingByPrinting[LILLIE], 0);
  assert.equal(carrierPayment.vector.protectedSacrificed, 0);
  assert.equal(carrierPayment.vector.nextUnprotectedPaymentWays, '6');
  assert.equal(carrierPayment.vector.unprotectedRemainingByPrinting[CARRIER], 0);
  assert.equal(carrierPayment.vector.unprotectedRemainingByPrinting[LILLIE], 1);
  for (const group of result.structurallyUndominatedPaymentGroups) {
    assert.equal(group.representativePaymentIndices.length, 3);
    assert.equal(new Set(group.representativePaymentIndices).size, 3);
    assert.ok(group.representativePaymentIndices.every(index =>
      index >= 0 && index < hand.length));
  }
});

test('soft reserve deficit appears only when remaining copies fall below the count', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [BOX, LILLIE, LILLIE, 'A', 'B'],
    sourceIndex: 0,
    cost: 2,
    softAdditionalCopiesByPrinting: {[LILLIE]: 1}
  });
  const group = result.structurallyUndominatedPaymentGroups.find(row =>
    row.representativePaymentIndices.join(',') === '1,2');
  assert.ok(group);
  assert.equal(group.vector.protectedSacrificed, 1);
  assert.equal(group.vector.softReserveDeficitByPrinting[LILLIE], 1);
});

test('multiple soft printing reserves are count-based and independently visible', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [BOX, CARRIER, CARRIER, LILLIE, LILLIE, VIP],
    sourceIndex: 0,
    cost: 2,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1},
    softAdditionalCopiesByPrinting: {
      [CARRIER]: 1,
      [LILLIE]: 1
    },
    deadPrintings: [VIP]
  });
  const group = result.structurallyUndominatedPaymentGroups.find(row =>
    row.representativePaymentIndices.join(',') === '2,3');
  assert.ok(group);
  assert.equal(group.vector.softReserveDeficitByPrinting[CARRIER], 1);
  assert.equal(group.vector.softReserveDeficitByPrinting[LILLIE], 0);
  assert.equal(group.vector.protectedSacrificed, 1);
});

test('post-play prompt hand returns actual indices with no source sentinel', () => {
  const hand = [VIP, VIP, CARRIER, LILLIE];
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: hand,
    sourceIndex: null,
    cost: 2,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1},
    softAdditionalCopiesByPrinting: {[LILLIE]: 1}
  });
  assert.equal(result.sourceIndex, null);
  assert.equal(result.handLength, hand.length);
  assert.deepEqual(result.hardReservedIndices, [2]);
  assert.ok(result.structurallyUndominatedPaymentGroups.every(group =>
    group.representativePaymentIndices.every(index => index < hand.length)));
});

test('source-in-hand index is excluded from reserve counts and payment indices', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [BOX, CARRIER, CARRIER, LILLIE],
    sourceIndex: 0,
    cost: 2,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1}
  });
  assert.deepEqual(result.hardReservedIndices, [1]);
  assert.equal(result.availableOtherPhysicalCards, 2);
  assert.ok(result.structurallyUndominatedPaymentGroups.every(group =>
    group.representativePaymentIndices.every(index => index !== 0)));
});

test('hard reserve shortfall remains explicit', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [BOX, VIP, LILLIE],
    sourceIndex: 0,
    cost: 2,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1}
  });
  assert.equal(result.hardRequirementsSatisfied, false);
  assert.equal(result.reserveRows.find(row=>row.printing===CARRIER).hardShortfall,1);
  assert.equal(result.noFirstPaymentAvailable, false);
});

test('desired discard multiplicity is retained by exact printing', () => {
  const result = ownerHandDiscardCopyReserveFrontier({
    handPrintings: [BOX, VIP, VIP, LILLIE, LILLIE, 'A'],
    sourceIndex: 0,
    cost: 2,
    desiredDiscardPrintings: [VIP]
  });
  const group = result.structurallyUndominatedPaymentGroups.find(row =>
    row.representativePaymentIndices.join(',') === '1,2');
  assert.ok(group);
  assert.equal(group.vector.desiredDiscardCountsByPrinting[VIP], 2);
});

test('deterministic small-domain sweep preserves count-based invariants', () => {
  const hands = [
    [BOX, VIP, CARRIER, LILLIE],
    [BOX, VIP, VIP, CARRIER, CARRIER],
    [BOX, VIP, VIP, VIP, CARRIER, LILLIE, LILLIE],
    [CARRIER, BOX, CARRIER, VIP, LILLIE, VIP]
  ];
  let cases = 0;
  for (const hand of hands) {
    for (let hardCount = 0; hardCount <= 2; hardCount++) {
      for (let softCount = 0; softCount <= 2; softCount++) {
        for (let cost = 0; cost <= 3; cost++) {
          const result = ownerHandDiscardCopyReserveFrontier({
            handPrintings: hand,
            sourceIndex: 0,
            cost,
            hardMinimumCopiesByPrinting: {[CARRIER]: hardCount},
            softAdditionalCopiesByPrinting: {[LILLIE]: softCount},
            deadPrintings: [VIP]
          });
          const heldCarrier = hand.filter((name,index) =>
            index!==0&&name===CARRIER).length;
          const hardReserved = Math.min(hardCount,heldCarrier);
          assert.equal(result.hardReservedIndices.length,hardReserved);
          assert.equal(result.hardRequirementsSatisfied,
            heldCarrier>=hardCount);
          assert.equal(result.softPreferenceCapacityAvailable,
            hand.filter((name,index)=>index!==0&&name===LILLIE).length>=softCount);
          for (const group of result.structurallyUndominatedPaymentGroups) {
            assert.equal(group.representativePaymentIndices.length,cost);
            assert.equal(new Set(group.representativePaymentIndices).size,cost);
            assert.ok(group.representativePaymentIndices.every(index=>
              index!==0&&!result.hardReservedIndices.includes(index)));
            assert.ok(Object.values(group.vector.unprotectedRemainingByPrinting)
              .every(count=>Number.isSafeInteger(count)&&count>=0));
            assert.ok(Object.values(group.vector.softReserveDeficitByPrinting)
              .every(count=>Number.isSafeInteger(count)&&count>=0));
          }
          cases++;
        }
      }
    }
  }
  assert.equal(cases,hands.length*3*3*4);
});
