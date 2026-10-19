'use strict';

const {createHash} = require('node:crypto');

const PROTOCOL = 'actual-store-root-action-ledger-v1';

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Reconcile an exhaustive, post-dispatch root-action ledger against the
 * selective decision trace and actual Store attack log. This is an archive
 * self-consistency check, not an independent engine replay or a ruling that
 * any declared attack completed its printed effects.
 *
 * @param {object} record Archived source-game record.
 * @returns {{status:string,events:object[],joinedAttackDeclarations:number,
 *   originLineageStatus:string}}
 */
function inspectRootActionLedger(record) {
  const summary = record?.traceSummary;
  const events = summary?.rootActionLedger;
  if (summary?.rootActionLedgerProtocol !== PROTOCOL ||
      !Array.isArray(events)) {
    return {status:'root-ledger-unavailable',events:[],joinedAttackDeclarations:0,
      originLineageStatus:'unavailable'};
  }
  const invalid = {status:'root-ledger-integrity-mismatch',events:[],
    joinedAttackDeclarations:0,originLineageStatus:'integrity-mismatch'};
  if (!Number.isSafeInteger(record.actions) ||
      events.length !== record.actions ||
      summary.rootActionLedgerSha256 !== digest(events)) return invalid;

  for (let i=0;i<events.length;i+=1) {
    const event=events[i];
    if (!event || event.actionOrdinal !== i ||
        ![-1,0,1].includes(event.playerSlot) ||
        typeof event.action !== 'string' || !event.action ||
        !Number.isSafeInteger(event.turnBefore) ||
        !Number.isSafeInteger(event.turnAfter) ||
        event.turnAfter < event.turnBefore ||
        (i > 0 && event.turnBefore !== events[i-1].turnAfter)) return invalid;
  }

  if (Number.isSafeInteger(record.turns) && events.length &&
      events[events.length-1].turnAfter !== record.turns) return invalid;

  const hasOrigins=events.some(event=>
    Object.hasOwn(event,'initiatingRootActionOrdinal'));
  if (hasOrigins) {
    let initiatingOrdinal=null;
    for (const event of events) {
      if (!Object.hasOwn(event,'initiatingRootActionOrdinal')) return invalid;
      if (event.action!=='ResolvePromptAction') {
        initiatingOrdinal=event.actionOrdinal;
      }
      if (event.initiatingRootActionOrdinal!==initiatingOrdinal) return invalid;
    }
  }

  const selected=summary.chronologicalActionTrace;
  if (Array.isArray(selected)) {
    for (const event of selected) {
      const root=events[event.actionOrdinal];
      if (!root || root.action !== event.action ||
          root.playerSlot !== event.playerSlot ||
          root.turnBefore !== event.turnBefore ||
          root.turnAfter !== event.turnAfter ||
          (event.card !== undefined && root.card !== event.card) ||
          (event.ability !== undefined && root.ability !== event.ability) ||
          (event.attack !== undefined && root.attack !== event.attack) ||
          (event.attackChoice?.selection &&
            (root.attackChoice?.attackName !== event.attackChoice.selection.attackName ||
             root.attackChoice?.printing !== event.attackChoice.selection.printing))) {
        return invalid;
      }
    }
  }
  const declarations=summary.attackDeclarationTrace;
  let joinedAttackDeclarations=0;
  if (Array.isArray(declarations)) {
    for (const event of declarations) {
      const root=events[event.actionOrdinal];
      if (!root || root.action !== event.triggerAction ||
          root.playerSlot !== event.triggerPlayerSlot ||
          root.playerSlot !== event.playerSlot ||
          root.turnBefore !== event.turnBefore ||
          root.turnAfter !== event.turnAfter ||
          (root.attackChoice &&
           root.attackChoice.attackName !== event.attackName) ||
          (root.attack && root.attack !== event.attackName)) {
        return invalid;
      }
      joinedAttackDeclarations++;
    }
  }
  return {status:'complete-root-ledger-self-consistent',
    events,joinedAttackDeclarations,
    originLineageStatus:hasOrigins ? 'self-consistent-origin-lineage' :
      'unavailable'};
}

module.exports={PROTOCOL,inspectRootActionLedger};
