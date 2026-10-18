'use strict';

const {createHash} = require('node:crypto');
const {expandPrintings,alignToReference,auditAlignment} =
  require('../../scripts/aichi-position-coupling.cjs');

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Preserve each source-printing copy's resolved engine ID while rearranging
 * the candidate's *input* array to match the reference wherever possible.
 * This is a common-random-number experiment, not a deck construction change.
 *
 * @param {object[]} referenceRows The frozen reference source printing rows.
 * @param {object[]} candidateRows The frozen candidate source printing rows.
 * @param {string[]} sourceEngineIds Engine IDs in resolver/source-row copy order.
 * @param {'source-row-order-v1'|'reference-aligned-v1'} protocol
 * @returns {{engineIds:string[],protocol:string,sourceInputHash:string,
 *   executedInputHash:string,sourcePrintingOrderHash:string,
 *   executedPrintingOrderHash:string,referencePrintingOrderHash:string,
 *   sharedCopies:number,matchingPositionsBefore:number,
 *   matchingPositionsAfter:number}}
 */
function prepareCandidateInputOrder(referenceRows,candidateRows,sourceEngineIds,protocol) {
  if (!['source-row-order-v1','reference-aligned-v1'].includes(protocol)) {
    throw new RangeError('Unsupported candidate input-order protocol');
  }
  const reference = expandPrintings(referenceRows);
  const source = expandPrintings(candidateRows);
  if (!Array.isArray(sourceEngineIds) || sourceEngineIds.length !== source.length ||
      sourceEngineIds.some(id => typeof id !== 'string' || !id.trim())) {
    throw new TypeError('Resolved engine IDs must align with all 60 source printing copies');
  }
  const target = protocol === 'reference-aligned-v1' ?
    alignToReference(reference,source) : [...source];

  // Carry resolved identities with their actual source printing, including
  // rare cases where different printings map onto a shared engine card ID.
  const copiesByPrinting = new Map();
  for (let i=0;i<source.length;i++) {
    if (!copiesByPrinting.has(source[i])) copiesByPrinting.set(source[i],[]);
    copiesByPrinting.get(source[i]).push(sourceEngineIds[i]);
  }
  const engineIds = target.map(printing => copiesByPrinting.get(printing).shift());
  if ([...copiesByPrinting.values()].some(copies => copies.length)) {
    throw new Error('Candidate input alignment did not consume exact source copies');
  }
  const before = auditAlignment(reference,source);
  const after = auditAlignment(reference,target);
  if (after.sharedCopies !== before.sharedCopies ||
      (protocol === 'reference-aligned-v1' &&
       after.matchingPositions !== after.sharedCopies)) {
    throw new Error('Aligned source printing copies lost maximum reference overlap');
  }
  return {
    engineIds,protocol,sourceInputHash:digest(sourceEngineIds),
    executedInputHash:digest(engineIds),
    sourcePrintingOrderHash:digest(source),
    executedPrintingOrderHash:digest(target),
    referencePrintingOrderHash:digest(reference),
    sharedCopies:after.sharedCopies,
    matchingPositionsBefore:before.matchingPositions,
    matchingPositionsAfter:after.matchingPositions
  };
}

module.exports = {prepareCandidateInputOrder};
