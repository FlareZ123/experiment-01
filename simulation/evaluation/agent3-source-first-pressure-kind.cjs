'use strict';

/**
 * Evidence-type boundary for a paper-Expanded source-first hard lock.
 *
 * An attack completed on a later turn cannot impersonate a first-turn
 * continuous Ability. Native observations remain producer assertions until
 * the Store transcript and observer are independently audited. This does
 * not certify tactical relevance, opponent play quality, or a game result.
 *
 * @param {object} row Registered rank-6 or rank-11 bilateral observation.
 * @returns {boolean} Whether the asserted early pressure has the right
 *   source-specific, native-observed mechanism and root action class.
 */
function sourceFirstNativePressureVerified(row){
  const pressure=row?.sourcePressure;
  if(!pressure||pressure.turnBefore!==1||
    pressure.completionTurnBefore!==1)return false;
  const ledger=row.rootActionLedger;
  const hasLedger=Array.isArray(ledger);
  const root=hasLedger?ledger[pressure.rootActionOrdinal]:null;
  if(row.rank===6){
    const evidence=row.rank6PassivePressure;
    const sourceEnd=evidence?.sourceTurnOneEndRoot;
    return pressure.pressureKind==='passive-ability-suppression' &&
      evidence?.schema==='agent41-rank6-passive-initialization-root-classification-v1' &&
      evidence.status==='native-capability-suppression-with-rooted-turn-continuity' &&
      evidence.sourceSeat===pressure.actorSeat &&
      evidence.candidateSeat===1-pressure.actorSeat &&
      evidence.sourceActuallyFirst===true &&
      evidence.sourceActiveContinuity===true &&
      evidence.nativeCapabilitySuppressed===true &&
      evidence.rootedReplyAndReturn===true &&
      sourceEnd?.ordinal===pressure.rootActionOrdinal &&
      sourceEnd.turn===1&&sourceEnd.seat===pressure.actorSeat &&
      sourceEnd.action==='PassTurnAction' &&
      pressure.completionOrdinal===pressure.rootActionOrdinal &&
      (!hasLedger||root?.action==='PassTurnAction');
  }
  if(row.rank===11){
    const window=row.garbotoxinWindowAudit;
    const before=window?.before;
    const names=before?.candidatePrintedPowerNames;
    // Prefer the newer full public board audit. The historical Active-only
    // packet remains readable, but cannot attest a Benched-only block.
    const fullChecks=before?.candidateInPlayPrintedPowerChecks;
    const nativeBlocked=Array.isArray(fullChecks)?
      fullChecks.some(power=>power?.blocked===true&&
        typeof power.printing==='string'&&power.printing.length>0&&
        typeof power.name==='string'&&power.name.length>0):
      Array.isArray(names)&&names.length>0&&
        (Array.isArray(before.candidatePrintedPowerChecks)?
          before.candidatePrintedPowerChecks.some(power=>
            power?.blocked===true&&names.includes(power.name)):
          names.includes('New Moon')&&
            before.candidatePrintedNewMoonBlocked===true);
    return pressure.pressureKind==='item-enabled-ability-lock' &&
      window?.schema==='agent41-authentic-rank11-garbotoxin-ability-window-v1' &&
      window.sourceSeat===pressure.actorSeat &&
      window.candidateSeat===1-pressure.actorSeat &&
      window.turn===2&&window.realStoreOnly===true&&
      before?.globalTurn===2&&before.sourceGarbodorHasTool===true&&
      nativeBlocked &&
      (!hasLedger||(root?.action==='PlayCardAction'&&root.card==='Boost Shake'));
  }
  return false;
}

/**
 * Distinguish an authenticated, actually blocked printed Power from a
 * source-first passive lock with no eligible candidate-side Power to block.
 * A missing target alone cannot prove Initialization is functional: the
 * separate positive-control arm is required at the paired-intake level.
 * Source-borne observations are still untrusted until independently tied
 * to their authentic Store root ledger.
 *
 * @param {object} row Registered bilateral observation.
 * @returns {'native-blocked-eligible-power'|'no-eligible-power-present'|'unverified'}
 */
function sourceFirstNativeExposureKind(row){
  if(sourceFirstNativePressureVerified(row))
    return 'native-blocked-eligible-power';
  if(row?.rank===11){
    const pressure=row.sourcePressure;
    const window=row.garbotoxinWindowAudit;
    const before=window?.before;
    const ledger=row.rootActionLedger;
    const root=Array.isArray(ledger)?ledger[pressure?.rootActionOrdinal]:null;
    const noTarget=pressure?.pressureKind==='item-enabled-ability-lock' &&
      pressure.turnBefore===1&&pressure.completionTurnBefore===1 &&
      pressure.completionOrdinal===pressure.rootActionOrdinal &&
      window?.schema==='agent41-authentic-rank11-garbotoxin-ability-window-v1' &&
      window.sourceSeat===pressure.actorSeat &&
      window.candidateSeat===1-pressure.actorSeat &&
      window.turn===2&&window.realStoreOnly===true &&
      before?.globalTurn===2&&before.sourceGarbodorHasTool===true &&
      Array.isArray(before.candidateInPlayPrintedPowerChecks) &&
      before.candidateInPlayPrintedPowerChecks.length===0 &&
      Array.isArray(before.candidatePrintedPowerChecks) &&
      before.candidatePrintedPowerChecks.length===0 &&
      Array.isArray(before.candidatePrintedPowerNames) &&
      before.candidatePrintedPowerNames.length===0 &&
      (!Array.isArray(ledger)||
        (root?.action==='PlayCardAction'&&root.card==='Boost Shake'));
    return noTarget?'no-eligible-power-present':'unverified';
  }
  if(row?.rank!==6)return 'unverified';
  const pressure=row.sourcePressure;
  const evidence=row.rank6PassivePressure;
  const sourceEnd=evidence?.sourceTurnOneEndRoot;
  const ledger=row.rootActionLedger;
  const root=Array.isArray(ledger)?ledger[pressure?.rootActionOrdinal]:null;
  const exactNoTarget=pressure?.turnBefore===1 &&
    pressure.completionTurnBefore===1 &&
    pressure.pressureKind==='passive-ability-suppression' &&
    evidence?.schema==='agent41-rank6-passive-initialization-root-classification-v1' &&
    evidence.status==='no-eligible-visible-power' &&
    evidence.sourceSeat===pressure.actorSeat &&
    evidence.candidateSeat===1-pressure.actorSeat &&
    evidence.sourceActuallyFirst===true &&
    evidence.observedBoundaryActors===true &&
    evidence.sourceActiveContinuity===true &&
    evidence.rootedReplyAndReturn===true &&
    evidence.nativeCapabilitySuppressed===false &&
    evidence.examinedPrintedPowerCount===0 &&
    evidence.sourceTurnOneSnapshotPresent===true &&
    evidence.candidateTurnTwoSnapshotPresent===true &&
    evidence.sourceReturnSnapshotPresent===true &&
    evidence.targetPrinting===null &&
    evidence.targetPowerName===null &&
    sourceEnd?.ordinal===pressure.rootActionOrdinal &&
    sourceEnd.turn===1 &&
    sourceEnd.seat===pressure.actorSeat &&
    sourceEnd.action==='PassTurnAction' &&
    pressure.completionOrdinal===pressure.rootActionOrdinal &&
    (!Array.isArray(ledger)||root?.action==='PassTurnAction');
  return exactNoTarget?'no-eligible-power-present':'unverified';
}

module.exports={sourceFirstNativePressureVerified,sourceFirstNativeExposureKind};
