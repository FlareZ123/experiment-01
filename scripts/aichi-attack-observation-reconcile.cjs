'use strict';

/**
 * Reconcile legacy root AttackAction counts with the additive real-Store
 * attack-declaration log. This checks internal record consistency only.
 * Engine declarations do not independently prove completed attack effects.
 *
 * @param {object} record Archived campaign trial
 * @param {number} candidateSlot 0 for A, 1 for B
 * @returns {{status:string,candidateDeclarations:number|null,
 *   opponentDeclarations:number|null,candidateRootUndercount:boolean,
 *   opponentRootUndercount:boolean,candidateRootUnlogged:boolean,
 *   opponentRootUnlogged:boolean}}
 */
function reconcileAttackObservations(record, candidateSlot) {
  const unknown = {
    status: 'attack-observation-incomplete',
    candidateDeclarations: null,
    opponentDeclarations: null,
    candidateRootUndercount: false,
    opponentRootUndercount: false,
    candidateRootUnlogged: false,
    opponentRootUnlogged: false
  };
  const protocol = 'real-store-attack-log-declarations-v1';
  if (record?.attackObservationStatus !== protocol) return unknown;

  const trace = record.traceSummary;
  const events = trace?.attackDeclarationTrace;
  const valid = trace?.attackDeclarationTraceProtocol === protocol &&
    trace.attackDeclarationsAreCompleteEffects === false &&
    Array.isArray(events) && Number.isInteger(record.actions) &&
    record.actions >= 0 && [0, 1].includes(candidateSlot) &&
    events.every((event, index) =>
      event?.kind === 'engine-attack-declaration' &&
      Number.isSafeInteger(event.logIndex) && event.logIndex >= 0 &&
      (index === 0 || event.logIndex > events[index - 1].logIndex) &&
      Number.isSafeInteger(event.actionOrdinal) &&
      event.actionOrdinal >= 0 && event.actionOrdinal < record.actions &&
      (index === 0 || event.actionOrdinal >= events[index - 1].actionOrdinal) &&
      (event.playerSlot === 0 || event.playerSlot === 1) &&
      event.playerName === (event.playerSlot === 0 ? 'research-A' : 'research-B') &&
      typeof event.attackName === 'string' && event.attackName.length > 0);
  if (!valid) return {...unknown, status: 'attack-observation-integrity-mismatch'};

  const candidate = events.filter(e => e.playerSlot === candidateSlot).length;
  const opponent = events.length - candidate;
  if (record.candidateAttackDeclarations !== candidate ||
      record.opponentAttackDeclarations !== opponent) {
    return {...unknown, status: 'attack-observation-integrity-mismatch'};
  }
  return {
    status: 'self-consistent-engine-attack-declarations',
    candidateDeclarations: candidate,
    opponentDeclarations: opponent,
    candidateRootUndercount: record.candidateAttacks < candidate,
    opponentRootUndercount: record.opponentAttacks < opponent,
    candidateRootUnlogged: record.candidateAttacks > candidate,
    opponentRootUnlogged: record.opponentAttacks > opponent
  };
}

module.exports = {reconcileAttackObservations};
