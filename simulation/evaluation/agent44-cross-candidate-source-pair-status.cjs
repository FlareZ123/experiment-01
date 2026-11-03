'use strict';

const assert = require('node:assert/strict');
const SHA256 = /^[a-f0-9]{64}$/;

/** @param {unknown} v @returns {string|null} */
function physicalDigest(v) {
  return typeof v === 'string' && SHA256.test(v) ? v : null;
}

/** @param {unknown} v @returns {0|1|null} */
function verifiedStarter(v) {
  return v?.verifiedFirstTurn === true &&
    (v.actualStarterSeat === 0 || v.actualStarterSeat === 1) ?
    v.actualStarterSeat : null;
}

/** @param {unknown} a @param {unknown} b @returns {'MATCHED'|'MISMATCHED'|'UNKNOWN'} */
function parityStatus(a, b) {
  if (a === null || b === null) return 'UNKNOWN';
  return JSON.stringify(a) === JSON.stringify(b) ? 'MATCHED' : 'MISMATCHED';
}

/** @param {object} row @returns {{mulligans:number[],bonusDrawn:number[]}|null} */
function publicSetupCounts(row) {
  const setup = row?.initialSetupCompensation;
  if (setup?.schema !== 'real-store-initial-setup-compensation-v1') return null;
  if (!['mulligans', 'bonusDrawn'].every(field =>
    Array.isArray(setup[field]) && setup[field].length === 2 &&
    setup[field].every(x => Number.isSafeInteger(x) && x >= 0))) return null;
  return {mulligans: [...setup.mulligans], bonusDrawn: [...setup.bonusDrawn]};
}

/**
 * Read-only final-state comparison. Does not sample or inspect concealed
 * cards in live policy decisions; all digests must be postgame witnesses.
 * @param {object} first Native champion-reference row
 * @param {object} second Native other candidate row
 * @returns {object}
 */
function auditCrossCandidateSourcePair(first, second) {
  assert.ok(first?.trial && second?.trial);
  assert.equal(first.trial.rank, second.trial.rank);
  assert.equal(first.trial.candidateSlot, second.trial.candidateSlot);
  assert.equal(first.trial.seed, second.trial.seed);
  const leftDigest = physicalDigest(first.sourceDealFingerprint);
  const rightDigest = physicalDigest(second.sourceDealFingerprint);
  const sourceDealStatus = parityStatus(leftDigest, rightDigest);
  const firstStarter = verifiedStarter(first);
  const secondStarter = verifiedStarter(second);
  const actualStarterStatus = parityStatus(firstStarter, secondStarter);
  const leftSetup = publicSetupCounts(first);
  const rightSetup = publicSetupCounts(second);
  const mulliganCountsStatus = parityStatus(
    leftSetup?.mulligans ?? null, rightSetup?.mulligans ?? null);
  const bonusDrawnCountsStatus = parityStatus(
    leftSetup?.bonusDrawn ?? null, rightSetup?.bonusDrawn ?? null);
  const sourceSeat = first.trial.candidateSlot === 'A' ? 1 : 0;
  const crossCandidateOpeningStatus = sourceDealStatus === 'MISMATCHED' ?
    'UNPAIRED_SOURCE_DEAL' : actualStarterStatus === 'MISMATCHED' ?
    'UNPAIRED_ACTUAL_STARTER' : sourceDealStatus === 'UNKNOWN' ||
    actualStarterStatus === 'UNKNOWN' ? 'UNKNOWN' :
    'MATCHED_INITIAL_SOURCE_AND_STARTER';
  return {
    schema: 'agent44-cross-candidate-source-pair-provenance-v1',
    sourceDealStatus, actualStarterStatus,
    mulliganCountsStatus, bonusDrawnCountsStatus,
    crossCandidateOpeningStatus,
    sourceSeat,
    sourceCompensationDrawCounts: leftSetup && rightSetup ?
      [leftSetup.bonusDrawn[sourceSeat],rightSetup.bonusDrawn[sourceSeat]] : null,
    sameSourcePhysicalDeal: sourceDealStatus === 'MATCHED',
    sameActualStarter: actualStarterStatus === 'MATCHED'
  };
}

module.exports = {
  physicalDigest, verifiedStarter, parityStatus, publicSetupCounts,
  auditCrossCandidateSourcePair
};
