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
    const nativeBlocked=Array.isArray(names)&&names.length>0&&
      (Array.isArray(before.candidatePrintedPowerChecks)?
        before.candidatePrintedPowerChecks.some(power=>
          power?.blocked===true&&names.includes(power.name)):
        names.includes('New Moon')&&
          before.candidatePrintedNewMoonBlocked===true);
    return pressure.pressureKind==='item-enabled-ability-lock' &&
      window?.schema==='agent41-authentic-rank11-garbotoxin-ability-window-v1' &&
      before?.globalTurn===2&&before.sourceGarbodorHasTool===true&&
      nativeBlocked &&
      (!hasLedger||(root?.action==='PlayCardAction'&&root.card==='Boost Shake'));
  }
  return false;
}

module.exports={sourceFirstNativePressureVerified};
