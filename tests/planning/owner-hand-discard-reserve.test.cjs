'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION,
  ownerHandDiscardWithCopyReserves
} = require('../../simulation/twinleaf/planning/owner-hand-discard-reserve.cjs');

const BOX = 'Secret Box TWM';
const VIP = 'Battle VIP Pass FST';
const CARRIER = 'Rescue Carrier EVS';
const LILLIE = "Lillie's Determination M1L";

test('hard copy reserve preserves one Carrier while three dead VIPs pay', () => {
  const hand = [BOX, VIP, VIP, VIP, CARRIER, CARRIER, LILLIE];
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: hand,
    sourceIndex: 0,
    cost: 3,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1},
    deadPrintings: [VIP]
  });
  assert.equal(result.version, VERSION);
  assert.deepEqual(result.hardReservedIndices, [4]);
  assert.deepEqual(result.softProtectedIndices, []);
  assert.equal(result.hardRequirementsSatisfied, true);
  assert.equal(result.softPreferenceCapacityAvailable, true);
  assert.ok(result.frontier.structurallyUndominatedPaymentGroups.some(group =>
    group.representativePaymentIndices.join(',') === '1,2,3' &&
    group.vector.deadCardsSpent === 3 &&
    group.vector.protectedSacrificed === 0));
});

test('soft extra copy reserve preserves a nondominated future-liquidity tradeoff', () => {
  const hand = [BOX, VIP, VIP, CARRIER, CARRIER, LILLIE, LILLIE];
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: hand,
    sourceIndex: 0,
    cost: 3,
    softAdditionalCopiesByPrinting: {[CARRIER]: 1},
    deadPrintings: [VIP],
    nextHandDiscardCost: 2
  });
  assert.deepEqual(result.softProtectedIndices, [3]);
  const frontier = result.frontier.structurallyUndominatedPaymentGroups;
  assert.ok(frontier.some(group =>
    group.representativePaymentIndices.join(',') === '1,2,4' &&
    group.vector.protectedSacrificed === 0 &&
    group.vector.nextUnprotectedPaymentWays === '1'));
  assert.ok(frontier.some(group =>
    group.representativePaymentIndices.join(',') === '1,2,3' &&
    group.vector.protectedSacrificed === 1 &&
    group.vector.nextUnprotectedPaymentWays === '3'));
});

test('root93-style ten-card hand retains distinct carrier and Lillie choices', () => {
  const hand = [
    VIP, BOX, CARRIER, VIP, CARRIER, LILLIE, LILLIE,
    'Powerglass SFA', 'Forest Seal Stone SIT', 'Mysterious Treasure FLI'
  ];
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: hand,
    sourceIndex: 1,
    cost: 3,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1},
    softAdditionalCopiesByPrinting: {[LILLIE]: 1},
    deadPrintings: [VIP],
    nextHandDiscardCost: 2
  });
  assert.deepEqual(result.hardReservedIndices, [2]);
  assert.deepEqual(result.softProtectedIndices, [5]);
  const frontier = result.frontier.structurallyUndominatedPaymentGroups;
  assert.ok(frontier.some(group =>
    group.representativePaymentPrintings.join('|') ===
      [VIP, VIP, CARRIER].join('|') &&
    group.vector.protectedSacrificed === 0 &&
    group.vector.nextUnprotectedPaymentWays === '6'));
  assert.ok(frontier.some(group =>
    group.representativePaymentPrintings.join('|') ===
      [VIP, VIP, LILLIE].join('|') &&
    group.vector.protectedSacrificed === 1 &&
    group.vector.nextUnprotectedPaymentWays === '10'));
});

test('unavailable hard reserve is explicit and does not erase raw payment options', () => {
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: [BOX, VIP, LILLIE],
    sourceIndex: 0,
    cost: 2,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1}
  });
  assert.equal(result.hardRequirementsSatisfied, false);
  assert.deepEqual(result.hardReservedIndices, []);
  assert.equal(result.reserveRows[0].hardShortfall, 1);
  assert.equal(result.frontier.noFirstPaymentAvailable, false);
});

test('soft reserve shortfall is a preference limit, not a hard payment veto', () => {
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: [BOX, VIP, CARRIER],
    sourceIndex: 0,
    cost: 1,
    softAdditionalCopiesByPrinting: {[CARRIER]: 2}
  });
  assert.equal(result.hardRequirementsSatisfied, true);
  assert.equal(result.softPreferenceCapacityAvailable, false);
  assert.equal(result.reserveRows[0].softShortfall, 1);
  assert.equal(result.frontier.noFirstPaymentAvailable, false);
});

test('the played source copy cannot satisfy its own future reserve', () => {
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: [CARRIER, CARRIER, BOX],
    sourceIndex: 0,
    cost: 2,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1}
  });
  assert.deepEqual(result.hardReservedIndices, [1]);
  assert.equal(result.reserveRows[0].copiesAvailableAfterSource, 1);
  assert.equal(result.frontier.noFirstPaymentAvailable, true);
});

test('hard and soft requirements for one printing reserve additive copies', () => {
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: [BOX, CARRIER, CARRIER, CARRIER],
    sourceIndex: 0,
    cost: 1,
    hardMinimumCopiesByPrinting: {[CARRIER]: 1},
    softAdditionalCopiesByPrinting: {[CARRIER]: 1}
  });
  assert.deepEqual(result.hardReservedIndices, [1]);
  assert.deepEqual(result.softProtectedIndices, [2]);
  assert.equal(result.reserveRows[0].softShortfall, 0);
});

test('multiple hard printing reserves remain disjoint from one soft reserve', () => {
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: [BOX, CARRIER, LILLIE, VIP, CARRIER, LILLIE, 'A'],
    sourceIndex: 0,
    cost: 2,
    hardMinimumCopiesByPrinting: {
      [CARRIER]: 1,
      [LILLIE]: 1
    },
    softAdditionalCopiesByPrinting: {[VIP]: 1},
    deadPrintings: [VIP]
  });
  assert.deepEqual(result.hardReservedIndices, [1, 2]);
  assert.deepEqual(result.softProtectedIndices, [3]);
  assert.deepEqual(result.deadIndices, [3]);
  assert.equal(result.hardRequirementsSatisfied, true);
  assert.equal(result.softPreferenceCapacityAvailable, true);
});

test('soft-protected copies do not inflate future unprotected payment ways', () => {
  const result = ownerHandDiscardWithCopyReserves({
    handPrintings: [BOX, VIP, CARRIER, LILLIE, 'A', 'B'],
    sourceIndex: 0,
    cost: 1,
    softAdditionalCopiesByPrinting: {[LILLIE]: 1},
    hardMinimumCopiesByPrinting: {[CARRIER]: 1},
    nextHandDiscardCost: 2
  });
  const group = result.frontier.structurallyUndominatedPaymentGroups.find(row =>
    row.representativePaymentIndices.join(',') === '1');
  assert.ok(group);
  assert.equal(group.vector.nextUnprotectedPaymentWays, '1');
});

test('invalid counts and malformed printing sets fail closed', () => {
  assert.throws(() => ownerHandDiscardWithCopyReserves({
    handPrintings: [BOX, VIP, CARRIER, LILLIE],
    sourceIndex: 0,
    cost: 1,
    hardMinimumCopiesByPrinting: {[CARRIER]: -1}
  }), /nonnegative safe integer/);
  assert.throws(() => ownerHandDiscardWithCopyReserves({
    handPrintings: [BOX, VIP, CARRIER, LILLIE],
    sourceIndex: 0,
    cost: 1,
    deadPrintings: [null]
  }), /every/);
});

test('multiple soft-reserved printings fail closed until frontier identity is preserved', () => {
  assert.throws(() => ownerHandDiscardWithCopyReserves({
    handPrintings: [BOX, VIP, VIP, CARRIER, CARRIER, LILLIE, LILLIE],
    sourceIndex: 0,
    cost: 3,
    softAdditionalCopiesByPrinting: {
      [CARRIER]: 1,
      [LILLIE]: 1
    }
  }), /does not preserve protected-printing identity/);
});

test('input arrays and requirement objects remain unchanged', () => {
  const hand = [BOX, VIP, VIP, CARRIER, LILLIE];
  const hard = {[CARRIER]: 1};
  const soft = {[LILLIE]: 1};
  const before = {hand: [...hand], hard: {...hard}, soft: {...soft}};
  ownerHandDiscardWithCopyReserves({
    handPrintings: hand,
    sourceIndex: 0,
    cost: 2,
    hardMinimumCopiesByPrinting: hard,
    softAdditionalCopiesByPrinting: soft,
    deadPrintings: [VIP]
  });
  assert.deepEqual(hand, before.hand);
  assert.deepEqual(hard, before.hard);
  assert.deepEqual(soft, before.soft);
});

test('deterministic small-domain sweep preserves reserve and payment invariants', () => {
  const choose = (n, k) => {
    if (k > n) return 0n;
    let value = 1n;
    for (let i = 1; i <= Math.min(k, n - k); i++)
      value = value * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
    return value;
  };
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
          const result = ownerHandDiscardWithCopyReserves({
            handPrintings: hand,
            sourceIndex: 0,
            cost,
            hardMinimumCopiesByPrinting: {[CARRIER]: hardCount},
            softAdditionalCopiesByPrinting: {[CARRIER]: softCount},
            deadPrintings: [VIP]
          });
          const available = hand.map((name, index) =>
            name === CARRIER && index !== 0 ? index : -1)
            .filter(index => index >= 0);
          const expectedHard = available.slice(0, hardCount);
          const expectedSoft = available.slice(hardCount,
            hardCount + softCount);
          assert.deepEqual(result.hardReservedIndices, expectedHard);
          assert.deepEqual(result.softProtectedIndices, expectedSoft);
          assert.equal(result.hardRequirementsSatisfied,
            expectedHard.length === hardCount);
          assert.equal(result.softPreferenceCapacityAvailable,
            expectedSoft.length === softCount);
          assert.equal(result.deadIndices.join(','),
            hand.map((name, index) =>
              name === VIP && index !== 0 ? index : -1)
              .filter(index => index >= 0).join(','));
          const eligibleCount = hand.length - 1 - expectedHard.length;
          assert.equal(result.frontier.availableOtherPhysicalCards,
            eligibleCount);
          assert.equal(result.frontier.possibleFirstPaymentCount,
            choose(eligibleCount, cost).toString());
          assert.equal(result.frontier.noFirstPaymentAvailable,
            cost > eligibleCount);
          for (const group of result.frontier.structurallyUndominatedPaymentGroups) {
            const indexes = group.representativePaymentIndices;
            assert.equal(indexes.length, cost);
            assert.equal(new Set(indexes).size, cost);
            assert.ok(indexes.every(index => index !== 0 &&
              !expectedHard.includes(index)));
            assert.deepEqual(group.representativePaymentPrintings,
              indexes.map(index => hand[index]));
            assert.ok(group.equivalentPhysicalPayments >= 1);
          }
          cases++;
        }
      }
    }
  }
  assert.equal(cases, hands.length * 3 * 3 * 4);
});
