'use strict';

/**
 * Printing-aware positional coupling audit for the Aichi fixed campaigns.
 * This does not run the simulator or estimate a competitive win probability.
 */

/**
 * @param {Array<{name:string,count:number,printing:{set:string,number:string|number,language?:string}}>} rows
 * @returns {string[]}
 */
function expandPrintings(rows) {
  if (!Array.isArray(rows)) throw new TypeError('Expected source rows');
  const copies = [];
  for (const row of rows) {
    if (!row || typeof row.name !== 'string' || !row.name.trim() ||
        !row.printing || !row.printing.set ||
        !String(row.printing.number ?? '').trim() ||
        !Number.isInteger(row.count) || row.count < 1) {
      throw new TypeError('Invalid source row');
    }
    const id = JSON.stringify([row.name.trim(), String(row.printing.set).toUpperCase(),
      String(row.printing.number), row.printing.language ?? '']);
    for (let i = 0; i < row.count; i += 1) copies.push(id);
  }
  if (copies.length !== 60) throw new RangeError('Expected 60 card copies');
  return copies;
}

/**
 * Chance that k uniform source positions all lie among m matching positions.
 * @param {number} m
 * @param {number} k
 * @param {number} [n]
 * @returns {number}
 */
function samplingProbability(m, k, n = 60) {
  if (![m, k, n].every(Number.isInteger) || n < 1 ||
      m < 0 || m > n || k < 0 || k > n) {
    throw new RangeError('Invalid sampling dimensions');
  }
  if (k > m) return 0;
  let p = 1;
  for (let i = 0; i < k; i += 1) p *= (m - i) / (n - i);
  return p;
}

/** @param {string[]} a @param {string[]} b */
function auditAlignment(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) ||
      a.length !== 60 || b.length !== 60) {
    throw new RangeError('Expected two expanded 60-card lists');
  }
  const counts = new Map();
  for (const id of b) counts.set(id, (counts.get(id) || 0) + 1);
  let matchingPositions = 0;
  let sharedCopies = 0;
  for (let i = 0; i < 60; i += 1) {
    const id = a[i];
    if (id === b[i]) matchingPositions += 1;
    if ((counts.get(id) || 0) > 0) {
      sharedCopies += 1;
      counts.set(id, counts.get(id) - 1);
    }
  }
  return {
    matchingPositions, sharedCopies,
    observedSeven: samplingProbability(matchingPositions, 7),
    attainableSeven: samplingProbability(sharedCopies, 7),
    observedThirteen: samplingProbability(matchingPositions, 13),
    attainableThirteen: samplingProbability(sharedCopies, 13)
  };
}

/**
 * Return a new arrangement with maximum identity overlap to reference.
 * Caller must version any engine protocol that uses this ordering.
 * @param {string[]} reference
 * @param {string[]} candidate
 * @returns {string[]}
 */
function alignToReference(reference, candidate) {
  auditAlignment(reference, candidate);
  const available = new Map();
  for (const id of candidate) available.set(id, (available.get(id) || 0) + 1);
  const placed = new Map();
  const result = Array(60);
  for (let i = 0; i < 60; i += 1) {
    const id = reference[i];
    if ((available.get(id) || 0) > 0) {
      result[i] = id;
      available.set(id, available.get(id) - 1);
      placed.set(id, (placed.get(id) || 0) + 1);
    }
  }
  const extras = [];
  for (const id of candidate) {
    if ((placed.get(id) || 0) > 0) {
      placed.set(id, placed.get(id) - 1);
    } else {
      extras.push(id);
    }
  }
  let next = 0;
  for (let i = 0; i < 60; i += 1) {
    if (result[i] === undefined) result[i] = extras[next++];
  }
  return result;
}

module.exports = {
  expandPrintings, samplingProbability, auditAlignment, alignToReference
};
