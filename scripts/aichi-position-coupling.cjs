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
 * Maximize source-position identity overlap with reference while preserving
 * every printing. With secondary supplied, remaining positions also maximize
 * agreement with that already-aligned secondary deck. The secondary comparison
 * does not move any card already matched to reference.
 * @param {string[]} reference
 * @param {string[]} candidate
 * @param {string[]} [secondary]
 * @returns {string[]}
 */
function alignToReference(reference, candidate, secondary) {
  auditAlignment(reference, candidate);
  if (secondary !== undefined) auditAlignment(reference, secondary);
  const remaining = new Map();
  for (const id of candidate) remaining.set(id, (remaining.get(id) || 0) + 1);
  const result = Array(60);
  for (let i = 0; i < 60; i += 1) {
    const id = reference[i];
    if ((remaining.get(id) || 0) > 0) {
      result[i] = id;
      remaining.set(id, remaining.get(id) - 1);
    }
  }
  if (secondary !== undefined) {
    for (let i = 0; i < 60; i += 1) {
      const id = secondary[i];
      if (result[i] === undefined && (remaining.get(id) || 0) > 0) {
        result[i] = id;
        remaining.set(id, remaining.get(id) - 1);
      }
    }
  }
  const extras = [];
  for (const id of candidate) {
    if ((remaining.get(id) || 0) > 0) {
      extras.push(id);
      remaining.set(id, remaining.get(id) - 1);
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
