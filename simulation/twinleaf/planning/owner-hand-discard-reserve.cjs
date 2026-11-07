'use strict';

const assert = require('node:assert/strict');
const {ownerHandDiscardPareto} =
  require('./owner-hand-discard-pareto.cjs');

const VERSION = 'owner-hand-discard-copy-reserve-v1';

/**
 * Normalize a JSON-friendly exact-printing requirement map.
 * @param {object|undefined} value
 * @param {string} label
 * @returns {Map<string,number>}
 */
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

/**
 * Normalize a set or array of exact card printings.
 * @param {Set<string>|string[]|undefined} value
 * @param {string} label
 * @returns {Set<string>}
 */
function normalizePrintingSet(value, label) {
  const entries = value === undefined ? [] :
    (value instanceof Set ? [...value] : value);
  assert.ok(Array.isArray(entries), `${label} must be an array or Set`);
  assert.ok(entries.every(printing =>
    typeof printing === 'string' && printing.length > 0));
  return new Set(entries);
}

/**
 * Derive physical hand indices for explicit copy-retention obligations, then
 * return the underlying structural frontier under the supplied role labels.
 *
 * `hardMinimumCopiesByPrinting` are copies that cannot be paid.
 * `softAdditionalCopiesByPrinting` are extra copies that are preferred to
 * remain, but may be spent and appear as a protected-sacrifice tradeoff.
 * Soft counts are additional to hard counts for the same exact printing.
 *
 * The caller supplies these requirements from an owner-visible intended line.
 * This helper does not infer strategy, inspect hidden zones, validate card
 * text, or choose a winning payment.
 *
 * @param {{
 *   handPrintings:string[],
 *   sourceIndex:number,
 *   cost:number,
 *   hardMinimumCopiesByPrinting?:Record<string,number>,
 *   softAdditionalCopiesByPrinting?:Record<string,number>,
 *   deadPrintings?:(Set<string>|string[]),
 *   desiredDiscardPrintings?:(Set<string>|string[]),
 *   nextHandDiscardCost?:number
 * }} input
 * @returns {object}
 */
function ownerHandDiscardWithCopyReserves(input) {
  assert.ok(input && typeof input === 'object');
  const {
    handPrintings,
    sourceIndex,
    cost,
    nextHandDiscardCost = 0
  } = input;
  assert.ok(Array.isArray(handPrintings) &&
    handPrintings.every(printing =>
      typeof printing === 'string' && printing.length > 0));
  assert.ok(Number.isSafeInteger(sourceIndex) &&
    sourceIndex >= 0 && sourceIndex < handPrintings.length);
  assert.ok(Number.isSafeInteger(cost) && cost >= 0 && cost <= 3);
  assert.ok(Number.isSafeInteger(nextHandDiscardCost) &&
    nextHandDiscardCost >= 0 && nextHandDiscardCost <= 3);

  const hard = normalizeRequirements(
    input.hardMinimumCopiesByPrinting, 'hardMinimumCopiesByPrinting');
  const soft = normalizeRequirements(
    input.softAdditionalCopiesByPrinting,
    'softAdditionalCopiesByPrinting');
  const activeSoftPrintings = [...soft.entries()]
    .filter(([, count]) => count > 0);
  assert.ok(activeSoftPrintings.length <= 1,
    'The current Pareto helper does not preserve protected-printing identity; ' +
    'use at most one soft-reserved printing until its vector is extended');
  const deadPrintings = normalizePrintingSet(
    input.deadPrintings, 'deadPrintings');
  const desiredDiscardPrintings = normalizePrintingSet(
    input.desiredDiscardPrintings, 'desiredDiscardPrintings');

  const names = [...new Set([...hard.keys(), ...soft.keys()])].sort();
  const hardReservedIndices = [];
  const softProtectedIndices = [];
  const reserveRows = [];

  for (const printing of names) {
    // The source card is played now, so it cannot satisfy a future reserve.
    const available = handPrintings.map((name, index) =>
      name === printing && index !== sourceIndex ? index : -1)
      .filter(index => index >= 0);
    const hardRequired = hard.get(printing) ?? 0;
    const softAdditionalRequired = soft.get(printing) ?? 0;
    const hardCount = Math.min(hardRequired, available.length);
    const hardIndices = available.slice(0, hardCount);
    const afterHard = available.slice(hardCount);
    const softCount = Math.min(softAdditionalRequired, afterHard.length);
    const softIndices = afterHard.slice(0, softCount);

    hardReservedIndices.push(...hardIndices);
    softProtectedIndices.push(...softIndices);
    reserveRows.push({
      printing,
      heldCopies: handPrintings.filter(name => name === printing).length,
      copiesAvailableAfterSource: available.length,
      hardRequired,
      hardReservedIndices: hardIndices,
      hardShortfall: hardRequired - hardCount,
      softAdditionalRequired,
      softProtectedIndices: softIndices,
      softShortfall: softAdditionalRequired - softCount
    });
  }

  const deadIndices = handPrintings.map((printing, index) =>
    index !== sourceIndex && deadPrintings.has(printing) ? index : -1)
    .filter(index => index >= 0);

  const frontier = ownerHandDiscardPareto({
    hand: handPrintings,
    sourceIndex,
    cost,
    reservedIndices: new Set(hardReservedIndices),
    protectedIndices: new Set(softProtectedIndices),
    deadIndices: new Set(deadIndices),
    desiredDiscardPrintings,
    nextHandDiscardCost
  });

  const hardRequirementsSatisfied =
    reserveRows.every(row => row.hardShortfall === 0);
  const softPreferenceCapacityAvailable =
    reserveRows.every(row => row.softShortfall === 0);

  return {
    version: VERSION,
    sourcePrinting: handPrintings[sourceIndex],
    hardReservedIndices: hardReservedIndices.sort((a, b) => a - b),
    softProtectedIndices: softProtectedIndices.sort((a, b) => a - b),
    deadIndices,
    reserveRows,
    hardRequirementsSatisfied,
    softPreferenceCapacityAvailable,
    frontierIdentityScope: 'at-most-one-soft-reserved-printing',
    frontier,
    paperCardPlayabilityCertified: false,
    downstreamTargetAccessCertified: false,
    strategicOptimalityCertified: false
  };
}

module.exports = {VERSION, ownerHandDiscardWithCopyReserves};
