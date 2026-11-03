'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {gitBlobSha, runFrozenCanary, writeAtomicLocked} =
  require('./agent20-frozen-rank6-canary-v1.cjs');

const ROOT = path.resolve(__dirname, '../..');
const HISTORICAL_OUTPUT = path.join(ROOT, 'agent20-frozen-rank6-canary-v1-output.json');
const OUTPUT = path.join(ROOT, 'agent20-ghala-natural-custody-replay-v1-output.json');
const OBSERVER_PATH = 'simulation/twinleaf/agent7-ghala-owner-zone-lineage.cjs';
const VERSION = 'agent20-ghala-natural-custody-frozen-v1';

/**
 * Match one genuine Store prompt event to its single native game and physical
 * source seat. A Store game ordinal is a linkage hypothesis, not a substitute
 * for auditing actual owner-hand physical card references.
 *
 * @param {object} event Post-dispatch observer receipt.
 * @param {Array<object>} rows Complete ordered native attempts.
 * @returns {object}
 */
function classifySourceEvent(event, rows) {
  const ordinal = event?.gameOrdinal;
  const inRange = Number.isSafeInteger(ordinal) &&
    ordinal >= 0 && ordinal < rows.length;
  const row = inRange ? rows[ordinal] : null;
  const trial = row?.trial ?? null;
  const candidateSlot = trial?.candidateSlot ?? null;
  const expectedSourceSeat = candidateSlot === 'A' ? 1 :
    candidateSlot === 'B' ? 0 : null;
  const matched = expectedSourceSeat !== null &&
    Number.isSafeInteger(event?.ownerSeat) &&
    event.ownerSeat === expectedSourceSeat;
  const valid = matched && event?.paperTwoCardZoneWitness === true &&
    event?.requestedCount === 2 && event?.distinctSelected === 2 &&
    event?.validPhysicalSelectionBefore === true &&
    event?.nativeDispatchCompleted === true &&
    event?.actualSelectedCardMovementToDiscard === true;
  return {
    ...event,
    linkedTrialId: trial?.id ?? null,
    sourceRank: trial?.rank ?? null,
    sourcePhysicalSeat: expectedSourceSeat,
    ownerIsOriginalSource: matched,
    sourceDealFingerprint: row?.sourceDealFingerprint ??
      row?.initialSourceDealFingerprint?.digestSha256 ?? null,
    sourceNativeStatus: row?.status ?? null,
    paperSourcePaymentZoneWitness: valid,
    linkageStatus: !inRange || expectedSourceSeat === null ?
      'GAME_UNMATCHED' : matched ?
      'SOURCE_OWNER_MATCH' : 'OTHER_ACTOR',
    competitiveGameQualified: false
  };
}

/**
 * Report all failures and null observations without promoting native
 * acceptance into paper-match certification.
 *
 * @param {object} frozen Original frozen run result, with all four rows.
 * @param {object} audit Read-only live Store observer result.
 * @returns {object}
 */
function buildEvidence(frozen, audit) {
  assert.equal(frozen.releaseProfile, 'agent20-frozen-bilateral-rank6-canary-v1');
  const rows = frozen.rawNativeResult?.rows ?? [];
  const events = (audit?.events ?? []).map(event =>
    classifySourceEvent(event, rows));
  const originalSourceEvents = events.filter(e => e.ownerIsOriginalSource);
  const sourceWitnesses = originalSourceEvents.filter(e =>
    e.paperSourcePaymentZoneWitness);
  const invalidSourcePayments = originalSourceEvents.filter(e =>
    !e.paperSourcePaymentZoneWitness);
  const unmatched = events.filter(e => e.linkageStatus === 'GAME_UNMATCHED');
  const sourceTrials = rows.map((row,i) => {
    const original = originalSourceEvents.filter(e => e.gameOrdinal === i);
    return {
      trialId:row?.trial?.id ?? null,
      nativeStatus:row?.status ?? 'UNREPORTED',
      sourceDealFingerprint:row?.sourceDealFingerprint ??
        row?.initialSourceDealFingerprint?.digestSha256 ?? null,
      sourcePaymentPromptCount:original.length,
      actualTwoCardSourceCustodyWitnesses:original.filter(e =>
        e.paperSourcePaymentZoneWitness).length,
      unverifiedOrInvalidSourcePayments:original.filter(e =>
        !e.paperSourcePaymentZoneWitness).length,
      noSourcePaymentPromptObserved:original.length === 0,
      paperWholeGameQualified:false,
      competitiveGameQualified:false
    };
  });
  return {
    schema:VERSION,
    previousFrozenProfile:frozen.releaseProfile,
    originalSourceTrialCount:rows.length,
    observerSchema:audit?.schema ?? null,
    nativeStoreOwnerPaymentPrompts:audit?.observedPaymentPrompts ?? 0,
    sourcePaymentPrompts:originalSourceEvents.length,
    witnessedNaturalSourceTwoCardZoneMovements:sourceWitnesses.length,
    rejectedOrUnverifiedSourcePaymentPrompts:invalidSourcePayments.length,
    unmatchedGameOrdinalEvents:unmatched.length,
    otherActorPaymentPrompts:events.filter(e =>
      e.linkageStatus === 'OTHER_ACTOR').length,
    anyNaturalSourcePaymentCustodyWitness:sourceWitnesses.length > 0,
    allObservedSourcePaymentsPaperTwoCardZoneValid:
      originalSourceEvents.length > 0 && invalidSourcePayments.length === 0 &&
      unmatched.length === 0,
    sourceTrials,events,
    limits:{
      historicalSelectedDeals:true,
      newProspectiveWinSample:false,
      nativeProofOnlyForObservedExactPaymentPrompts:true,
      paidSearchAndAttackSameRootChainNotCertified:true,
      originalSourceOwnerInformationPolicyNotCertified:true,
      paperWholeGameQualified:false,
      paperTwentyFiveMinuteClockQualified:false,
      competitivelyQualifiedGames:0
    }
  };
}

/** @returns {object} Run exact old four-arm frozen profile under read-only hook. */
function runNaturalCustodyReplay() {
  const {withGuzmaHalaOwnerZoneLineage} =
    require('../twinleaf/agent7-ghala-owner-zone-lineage.cjs');
  const bytes = fs.readFileSync(path.join(ROOT,OBSERVER_PATH));
  const observer = withGuzmaHalaOwnerZoneLineage(runFrozenCanary,{
    liveOnly:true
  });
  // Persist the canonical historical archive for the existing source-pair
  // auditor; there is precisely one native execution, shared by both files.
  writeAtomicLocked(HISTORICAL_OUTPUT,
    JSON.stringify(observer.result,null,2)+'\n');
  const evidence = buildEvidence(observer.result, observer.audit);
  return {
    schema:VERSION,
    frozenProfileSha256:observer.result.profileSha256,
    historicalFrozenDisposition:observer.result.releaseDisposition,
    historicalFrozenRuntime:observer.result.runtime,
    nativeObserverBlobSha:gitBlobSha(bytes),
    nativeObserverSha256:createHash('sha256').update(bytes).digest('hex'),
    naturalCustodyEvidence:evidence,
    historicalOriginalNativeArchive:HISTORICAL_OUTPUT.split(path.sep).pop(),
    wholeGamePaperQualified:false,
    competitiveGameQualified:false
  };
}

if (require.main === module) {
  let output;
  try {
    output = runNaturalCustodyReplay();
  } catch(error) {
    output = {
      schema:VERSION,
      error:String(error?.stack ?? error),
      paperSourcePaymentZoneWitness:false,
      wholeGamePaperQualified:false,
      competitiveGameQualified:false
    };
    process.exitCode = 1;
  }
  writeAtomicLocked(OUTPUT,JSON.stringify(output,null,2)+'\n');
  process.stdout.write(JSON.stringify({
    schema:VERSION,
    attemptCount:output.naturalCustodyEvidence?.originalSourceTrialCount ?? 0,
    sourcePaymentPrompts:output.naturalCustodyEvidence?.sourcePaymentPrompts ?? 0,
    physicalTwoCardSourceCustody:
      output.naturalCustodyEvidence?.witnessedNaturalSourceTwoCardZoneMovements ?? 0,
    allPaperQualified:false,
    competitiveGameQualified:false,
    error:output.error ?? null
  })+'\n');
}

module.exports={VERSION,classifySourceEvent,buildEvidence,
  runNaturalCustodyReplay};
