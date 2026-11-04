'use strict';

const {createHash} = require('node:crypto');

const SOURCE_RECEIPT_SCHEMA = 'headless-native-abort-public-v1';
const FULL_DEAL_SCHEMA = 'initial-full-physical-deal-sha256-v1';
const SHA256 = /^[0-9a-f]{64}$/;

/**
 * Publish only native-observed, post-abort provenance. A registered seed is
 * never substituted for a missing physical receipt, and an aborted native
 * match never becomes a qualified game.
 *
 * @param {{candidateSlot:'A'|'B'}} trial Registered physical seat.
 * @param {object|null|undefined} receipt Native abort witness.
 * @returns {object} Validated, explicitly unqualified comparison fields.
 */
function extractNativeAbortProvenance(trial, receipt) {
  if (trial?.candidateSlot !== 'A' && trial?.candidateSlot !== 'B') {
    throw new TypeError('Registered trial must have a physical candidate slot');
  }
  const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
  const validReceipt = receipt?.schema === SOURCE_RECEIPT_SCHEMA;
  const source = validReceipt ? receipt.sourceDealFingerprint : null;
  const sourceStatus = !validReceipt ? 'NO_VERIFIED_RECEIPT' :
    source == null ? 'NOT_CAPTURED' :
    source.seat !== sourceSeat ? 'SOURCE_SEAT_MISMATCH' :
    !SHA256.test(source.digestSha256) ? 'INVALID_SOURCE_DIGEST' : 'VERIFIED';
  const full = validReceipt ? receipt.fullPhysicalDealFingerprint : null;
  const fullStatus = !validReceipt ? 'NO_VERIFIED_RECEIPT' :
    full == null ? 'NOT_CAPTURED' :
    full.schema !== FULL_DEAL_SCHEMA ||
      !SHA256.test(full.digestSha256) ? 'INVALID_FULL_DEAL' : 'VERIFIED';
  const turnOrder=validReceipt?receipt.initialTurnOrderEvidence:null;
  const firstTurnStatus=!validReceipt?'NO_VERIFIED_RECEIPT':
    turnOrder===null||turnOrder===undefined?'NOT_CAPTURED':
    turnOrder.verifiedByDrawLog===true &&
      (turnOrder.firstTurnSlot===0||turnOrder.firstTurnSlot===1)?
      'VERIFIED':'UNVERIFIED';
  const ledger = validReceipt ? receipt.rootActionLedger : null;
  const ledgerStatus = !validReceipt ? 'NO_VERIFIED_RECEIPT' :
    ledger == null ? 'NOT_CAPTURED' :
    !Array.isArray(ledger) ||
      !Number.isSafeInteger(receipt.rootActionCount) ||
      receipt.rootActionCount !== ledger.length ||
      !SHA256.test(receipt.rootActionLedgerSha256) ||
      createHash('sha256').update(JSON.stringify(ledger)).digest('hex') !==
        receipt.rootActionLedgerSha256 ? 'INVALID_LEDGER' : 'VERIFIED';
  return {
    sourceDealFingerprint: sourceStatus === 'VERIFIED' ?
      source.digestSha256 : null,
    fullPhysicalDealFingerprint: fullStatus === 'VERIFIED' ?
      full.digestSha256 : null,
    actualStarterSeat:firstTurnStatus==='VERIFIED'?
      turnOrder.firstTurnSlot:null,
    verifiedFirstTurn:firstTurnStatus==='VERIFIED',
    nativeRootActionCount: ledgerStatus === 'VERIFIED' ?
      receipt.rootActionCount : null,
    nativeAbortProvenance: {
      schema: 'agent18-aborted-native-physical-provenance-v1',
      sourceSeat,
      sourceDealStatus: sourceStatus,
      fullPhysicalDealStatus: fullStatus,
      acceptedRootLedgerStatus: ledgerStatus,
      firstTurnStatus,
      aborted: true,
      paperLegalGameCertified: false,
      competitiveGameQualified: false
    }
  };
}

module.exports = {extractNativeAbortProvenance};
