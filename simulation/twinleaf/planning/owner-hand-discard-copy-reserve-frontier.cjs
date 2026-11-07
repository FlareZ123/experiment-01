'use strict';

const assert = require('node:assert/strict');
const {combinations} =
  require('../agent27-owner-trainer-discard-contention.cjs');

const VERSION = 'owner-hand-discard-copy-reserve-count-v2';

/** @param {object|undefined} value @param {string} label */
function normalizeRequirements(value, label) {
  assert.ok(value === undefined ||
    (value !== null && typeof value === 'object' && !Array.isArray(value)),
  `${label} must be a printing-to-count object`);
  const result = new Map();
  for (const [printing, count] of Object.entries(value ?? {})) {
    assert.ok(typeof printing === 'string' && printing.length > 0);
    assert.ok(Number.isSafeInteger(count) && count >= 0,
      `${label}.${printing} must be a nonnegative safe integer`);
    result.set(printing, count);
  }
  return result;
}

/** @param {Set<string>|string[]|undefined} value @param {string} label */
function normalizePrintingSet(value, label) {
  const entries = value === undefined ? [] :
    (value instanceof Set ? [...value] : value);
  assert.ok(Array.isArray(entries), `${label} must be an array or Set`);
  assert.ok(entries.every(printing =>
    typeof printing === 'string' && printing.length > 0));
  return new Set(entries);
}

/** @param {Map<string,number>} a @param {Map<string,number>} b
 *  @param {(x:number,y:number)=>boolean} compare
 */
function mapNoWorse(a, b, compare) {
  const keys = new Set([...a.keys(), ...b.keys()]);
  return [...keys].every(key => compare(a.get(key) ?? 0, b.get(key) ?? 0));
}

/** @param {Map<string,number>} a @param {Map<string,number>} b
 *  @param {(x:number,y:number)=>boolean} compare
 */
function mapStrict(a, b, compare) {
  const keys = new Set([...a.keys(), ...b.keys()]);
  return [...keys].some(key => compare(a.get(key) ?? 0, b.get(key) ?? 0));
}

/**
 * Count-based copy-reserve frontier. Physical indices are retained only for
 * payment selection; soft reserve status is computed from remaining printing
 * multiplicities after each payment.
 *
 * @param {{
 *   handPrintings:string[],
 *   sourceIndex?:number|null,
 *   cost:number,
 *   hardMinimumCopiesByPrinting?:Record<string,number>,
 *   softAdditionalCopiesByPrinting?:Record<string,number>,
 *   deadPrintings?:(Set<string>|string[]),
 *   desiredDiscardPrintings?:(Set<string>|string[]),
 *   nextHandDiscardCost?:number
 * }} input
 */
function ownerHandDiscardCopyReserveFrontier(input) {
  assert.ok(input && typeof input === 'object');
  const {
    handPrintings,
    sourceIndex = null,
    cost,
    nextHandDiscardCost = 0
  } = input;
  assert.ok(Array.isArray(handPrintings) &&
    handPrintings.every(printing =>
      typeof printing === 'string' && printing.length > 0));
  const sourceCardPresentInHand = sourceIndex !== null;
  if (sourceCardPresentInHand) {
    assert.ok(Number.isSafeInteger(sourceIndex) &&
      sourceIndex >= 0 && sourceIndex < handPrintings.length);
  }
  assert.ok(Number.isSafeInteger(cost) && cost >= 0 && cost <= 3);
  assert.ok(Number.isSafeInteger(nextHandDiscardCost) &&
    nextHandDiscardCost >= 0 && nextHandDiscardCost <= 3);

  const hard = normalizeRequirements(
    input.hardMinimumCopiesByPrinting, 'hardMinimumCopiesByPrinting');
  const soft = normalizeRequirements(
    input.softAdditionalCopiesByPrinting,
    'softAdditionalCopiesByPrinting');
  const dead = normalizePrintingSet(input.deadPrintings, 'deadPrintings');
  const desired = normalizePrintingSet(
    input.desiredDiscardPrintings, 'desiredDiscardPrintings');

  const actualIndices = handPrintings.map((_, index) => index)
    .filter(index => !sourceCardPresentInHand || index !== sourceIndex);
  const printingNames = [...new Set([
    ...handPrintings.filter((_, index) =>
      !sourceCardPresentInHand || index !== sourceIndex),
    ...hard.keys(),
    ...soft.keys()
  ])].sort();

  const hardReservedIndices = [];
  const reserveRows = [];
  const hardHeld = new Map();
  const softHeld = new Map();

  for (const printing of printingNames) {
    const heldIndices = actualIndices.filter(index =>
      handPrintings[index] === printing);
    const hardRequired = hard.get(printing) ?? 0;
    const softAdditionalRequired = soft.get(printing) ?? 0;
    const hardCount = Math.min(hardRequired, heldIndices.length);
    const hardIndices = heldIndices.slice(0, hardCount);
    const afterHard = Math.max(0, heldIndices.length - hardRequired);
    const softAvailable = Math.min(softAdditionalRequired, afterHard);
    hardReservedIndices.push(...hardIndices);
    hardHeld.set(printing, hardRequired);
    softHeld.set(printing, softAdditionalRequired);
    reserveRows.push({
      printing,
      heldCopies: heldIndices.length,
      copiesAvailableAfterSource: heldIndices.length,
      hardRequired,
      hardReservedIndices: hardIndices,
      hardShortfall: hardRequired - hardCount,
      softAdditionalRequired,
      softCopiesAvailableAboveHard: afterHard,
      softCapacityShortfall: softAdditionalRequired - softAvailable
    });
  }

  const baselineSoftReserveDeficitByPrinting = Object.fromEntries(
    reserveRows.map(row => [row.printing, row.softCapacityShortfall]));
  const baselineSoftReserveDeficit = reserveRows.reduce((sum, row) =>
    sum + row.softCapacityShortfall, 0);

  const hardReservedSet = new Set(hardReservedIndices);
  const eligibleIndices = actualIndices.filter(index =>
    !hardReservedSet.has(index));
  const possibleFirstPayments = combinations(eligibleIndices.length, cost);
  const counts = new Map();
  let visited = 0n;
  const selected = [];

  function visit(start, need) {
    if (need !== 0) {
      for (let i = start; i <= eligibleIndices.length - need; i++) {
        selected.push(eligibleIndices[i]);
        visit(i + 1, need - 1);
        selected.pop();
      }
      return;
    }

    visited++;
    const selectedSet = new Set(selected);
    const remainingCounts = new Map();
    for (const index of actualIndices) {
      if (selectedSet.has(index)) continue;
      const printing = handPrintings[index];
      remainingCounts.set(printing,
        (remainingCounts.get(printing) ?? 0) + 1);
    }

    const remainingCopiesByPrinting = {};
    const softReserveDeficitByPrinting = {};
    const unprotectedRemainingByPrinting = {};
    let softReserveDeficit = 0;
    let unprotectedRemainingCount = 0;

    for (const printing of printingNames) {
      const remaining = remainingCounts.get(printing) ?? 0;
      remainingCopiesByPrinting[printing] = remaining;
      const hardRequired = hardHeld.get(printing) ?? 0;
      const softRequired = softHeld.get(printing) ?? 0;
      const copiesAboveHard = Math.max(0, remaining - hardRequired);
      const softDeficit = Math.max(0, softRequired - copiesAboveHard);
      const unprotected = Math.max(0,
        remaining - hardRequired - softRequired);
      softReserveDeficitByPrinting[printing] = softDeficit;
      unprotectedRemainingByPrinting[printing] = unprotected;
      softReserveDeficit += softDeficit;
      unprotectedRemainingCount += unprotected;
    }

    const paymentInducedSoftReserveDeficitByPrinting = {};
    let paymentInducedSoftReserveDeficit = 0;
    for (const printing of printingNames) {
      const baseline = baselineSoftReserveDeficitByPrinting[printing] ?? 0;
      const post = softReserveDeficitByPrinting[printing] ?? 0;
      const incremental = post - baseline;
      assert.ok(incremental >= 0,
        `${printing} soft reserve deficit cannot improve through payment`);
      paymentInducedSoftReserveDeficitByPrinting[printing] = incremental;
      paymentInducedSoftReserveDeficit += incremental;
    }
    assert.equal(paymentInducedSoftReserveDeficit,
      softReserveDeficit - baselineSoftReserveDeficit);

    const desiredCounts = new Map();
    for (const index of selected) {
      const printing = handPrintings[index];
      if (desired.has(printing))
        desiredCounts.set(printing, (desiredCounts.get(printing) ?? 0) + 1);
    }
    const distinctDesiredTargets = [...desiredCounts.keys()].sort();
    const desiredDiscardCountsByPrinting =
      Object.fromEntries([...desiredCounts.entries()]
        .sort(([a], [b]) => a.localeCompare(b)));
    const deadCardsSpent = selected.filter(index =>
      dead.has(handPrintings[index])).length;
    const nextWays = combinations(unprotectedRemainingCount,
      nextHandDiscardCost);

    const vector = {
      // Legacy fields remain total post-payment shortfall for compatibility.
      softReserveDeficit,
      protectedSacrificed: softReserveDeficit,
      softReserveDeficitByPrinting,
      baselineSoftReserveDeficit,
      baselineSoftReserveDeficitByPrinting,
      postPaymentSoftReserveDeficit: softReserveDeficit,
      postPaymentSoftReserveDeficitByPrinting: softReserveDeficitByPrinting,
      paymentInducedSoftReserveDeficit,
      paymentInducedSoftReserveDeficitByPrinting,
      remainingCopiesByPrinting,
      desiredDiscardCountsByPrinting,
      distinctDesiredDiscardPrintings: distinctDesiredTargets.length,
      deadCardsSpent,
      unprotectedRemainingByPrinting,
      nextUnprotectedPaymentWays: nextWays.toString()
    };
    const key = JSON.stringify({vector, distinctDesiredTargets});
    const group = counts.get(key);
    if (group) {
      group.equivalentPhysicalPayments++;
      return;
    }
    counts.set(key, {
      vector,
      representativePaymentIndices: [...selected],
      representativePaymentPrintings:
        selected.map(index => handPrintings[index]),
      distinctDesiredTargets,
      equivalentPhysicalPayments: 1
    });
  }

  if (cost <= eligibleIndices.length) visit(0, cost);
  assert.equal(visited, possibleFirstPayments);

  const groups = [...counts.values()];
  const groupedPhysicalPaymentCount = groups.reduce((sum, group) =>
    sum + BigInt(group.equivalentPhysicalPayments), 0n);
  assert.equal(groupedPhysicalPaymentCount, possibleFirstPayments);
  function dominates(a, b) {
    const x = a.vector, y = b.vector;
    const xSoft = new Map(Object.entries(x.softReserveDeficitByPrinting));
    const ySoft = new Map(Object.entries(y.softReserveDeficitByPrinting));
    const xUnprotected = new Map(Object.entries(x.unprotectedRemainingByPrinting));
    const yUnprotected = new Map(Object.entries(y.unprotectedRemainingByPrinting));
    const xDesired = new Map(Object.entries(x.desiredDiscardCountsByPrinting));
    const yDesired = new Map(Object.entries(y.desiredDiscardCountsByPrinting));
    const coversAllTargets = b.distinctDesiredTargets.every(target =>
      a.distinctDesiredTargets.includes(target));
    const softNoWorse = mapNoWorse(xSoft, ySoft, (left, right) =>
      left <= right);
    const unprotectedNoWorse = mapNoWorse(xUnprotected, yUnprotected,
      (left, right) => left >= right);
    const desiredNoWorse = mapNoWorse(xDesired, yDesired,
      (left, right) => left >= right);
    const notWorse = softNoWorse && unprotectedNoWorse &&
      desiredNoWorse && coversAllTargets &&
      x.deadCardsSpent >= y.deadCardsSpent &&
      BigInt(x.nextUnprotectedPaymentWays) >=
        BigInt(y.nextUnprotectedPaymentWays);
    const strictlyBetter =
      mapStrict(xSoft, ySoft, (left, right) => left < right) ||
      mapStrict(xUnprotected, yUnprotected,
        (left, right) => left > right) ||
      mapStrict(xDesired, yDesired, (left, right) => left > right) ||
      x.distinctDesiredDiscardPrintings >
        y.distinctDesiredDiscardPrintings ||
      x.deadCardsSpent > y.deadCardsSpent ||
      BigInt(x.nextUnprotectedPaymentWays) >
        BigInt(y.nextUnprotectedPaymentWays);
    return notWorse && strictlyBetter;
  }

  const frontier = groups.filter(group =>
    !groups.some(other => other !== group && dominates(other, group)));
  frontier.sort((a, b) =>
    a.vector.protectedSacrificed - b.vector.protectedSacrificed ||
    b.vector.distinctDesiredDiscardPrintings -
      a.vector.distinctDesiredDiscardPrintings ||
    b.vector.deadCardsSpent - a.vector.deadCardsSpent ||
    Number(BigInt(b.vector.nextUnprotectedPaymentWays) -
      BigInt(a.vector.nextUnprotectedPaymentWays)));

  const hardRequirementsSatisfied =
    reserveRows.every(row => row.hardShortfall === 0);
  const softPreferenceCapacityAvailable =
    reserveRows.every(row => row.softCapacityShortfall === 0);

  return {
    version: VERSION,
    sourceIndex,
    sourceCardPresentInHand,
    sourcePrinting: sourceCardPresentInHand ?
      handPrintings[sourceIndex] : null,
    handLength: handPrintings.length,
    hardReservedIndices: hardReservedIndices.sort((a, b) => a - b),
    reservedSourceOrConnectorIndices: [
      ...(sourceCardPresentInHand ? [sourceIndex] : []),
      ...hardReservedIndices
    ].sort((a, b) => a - b),
    hardMinimumCopiesByPrinting: Object.fromEntries(hard),
    softAdditionalCopiesByPrinting: Object.fromEntries(soft),
    reserveRows,
    hardRequirementsSatisfied,
    softPreferenceCapacityAvailable,
    availableOtherPhysicalCards: eligibleIndices.length,
    possibleFirstPaymentCount: possibleFirstPayments.toString(),
    paymentScoreGroups: groups.length,
    paymentScoreGroupPhysicalPayments: groupedPhysicalPaymentCount.toString(),
    frontierPhysicalPaymentCount: frontier.reduce((sum, group) =>
      sum + BigInt(group.equivalentPhysicalPayments), 0n).toString(),
    structurallyUndominatedPaymentGroups: frontier,
    noFirstPaymentAvailable: possibleFirstPayments === 0n,
    futurePaymentMinimum: nextHandDiscardCost,
    frontierIdentityScope: 'printing-count-based',
    softReserveCopyInvariant: true,
    softReserveCountSemantics: 'remaining-printing-multiplicities',
    paperCardPlayabilityCertified: false,
    downstreamTargetAccessCertified: false,
    strategicOptimalityCertified: false
  };
}

module.exports = {VERSION, ownerHandDiscardCopyReserveFrontier};
