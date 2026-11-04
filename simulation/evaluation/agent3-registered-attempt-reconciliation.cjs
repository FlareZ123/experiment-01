'use strict';

const VERSION = 'agent3-registered-attempt-reconciliation-v1';

/**
 * Reconcile a declared finite trial registration to the rows genuinely
 * returned by the runner. This is solely a custody check; no row becomes a
 * qualified game because it was reconciled.
 *
 * @param {readonly string[]} registeredIds Frozen registered trial IDs.
 * @param {readonly object[]} returnedRows Raw rows, including failures and caps.
 * @returns {{schema:string,registeredCount:number,returnedCount:number,
 *   countMatches:boolean,exactlyReconciled:boolean,
 *   duplicateRegisteredIds:string[],duplicateReturnedIds:string[],
 *   missingRegisteredIds:string[],unexpectedReturnedIds:string[],
 *   missingRowIdentifiers:number[],conflictingRowIdentifiers:number[]}}
 */
function reconcileRegisteredAttempts(registeredIds, returnedRows) {
  if (!Array.isArray(registeredIds) || !Array.isArray(returnedRows)) {
    throw new TypeError('Registered IDs and returned rows must be arrays');
  }
  const registeredCounts = new Map();
  for (const id of registeredIds) {
    if (typeof id !== 'string' || id.length === 0) {
      throw new TypeError('Every registered trial ID must be nonempty text');
    }
    registeredCounts.set(id, (registeredCounts.get(id) ?? 0) + 1);
  }
  const returnedCounts = new Map();
  const missingRowIdentifiers = [];
  const conflictingRowIdentifiers = [];
  returnedRows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      missingRowIdentifiers.push(index);
      return;
    }
    const nested = row.trial?.id;
    const direct = row.id;
    if (nested !== undefined && direct !== undefined && nested !== direct) {
      conflictingRowIdentifiers.push(index);
      return;
    }
    const id = nested ?? direct;
    if (typeof id !== 'string' || id.length === 0) {
      missingRowIdentifiers.push(index);
      return;
    }
    returnedCounts.set(id, (returnedCounts.get(id) ?? 0) + 1);
  });
  const sorted = values => values.sort();
  const duplicateRegisteredIds = sorted([...registeredCounts]
    .filter(([, count]) => count !== 1).map(([id]) => id));
  const duplicateReturnedIds = sorted([...returnedCounts]
    .filter(([, count]) => count !== 1).map(([id]) => id));
  const missingRegisteredIds = sorted([...registeredCounts.keys()]
    .filter(id => !returnedCounts.has(id)));
  const unexpectedReturnedIds = sorted([...returnedCounts.keys()]
    .filter(id => !registeredCounts.has(id)));
  const countMatches = registeredIds.length === returnedRows.length;
  const exactlyReconciled = countMatches &&
    duplicateRegisteredIds.length === 0 &&
    duplicateReturnedIds.length === 0 &&
    missingRegisteredIds.length === 0 &&
    unexpectedReturnedIds.length === 0 &&
    missingRowIdentifiers.length === 0 &&
    conflictingRowIdentifiers.length === 0;
  return {
    schema: VERSION,
    registeredCount: registeredIds.length,
    returnedCount: returnedRows.length,
    countMatches, exactlyReconciled,
    duplicateRegisteredIds, duplicateReturnedIds,
    missingRegisteredIds, unexpectedReturnedIds,
    missingRowIdentifiers, conflictingRowIdentifiers
  };
}

module.exports = {VERSION, reconcileRegisteredAttempts};
