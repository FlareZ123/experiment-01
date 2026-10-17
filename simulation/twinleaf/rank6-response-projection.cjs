'use strict';

const assert = require('node:assert/strict');

/**
 * Show only observable own/opponent actions from an archived, physical Store
 * turn. The headless decisionTrace also includes private-hand and private
 * card-selection fields, which this positive-allowlist deliberately excludes.
 *
 * @param {object[]} decisionTrace Headless action history, never bot input.
 * @param {{seat:number,turn:number,limit?:number}} options
 * @returns {object[]} Public-only action and attack decisions.
 */
function publicTurnLedger(decisionTrace, options) {
  assert.ok(Array.isArray(decisionTrace), 'Expected captured decisionTrace');
  assert.ok(Number.isInteger(options?.seat) && options.seat >= 0);
  assert.ok(Number.isInteger(options?.turn) && options.turn > 0);
  const limit = options.limit ?? 50;
  assert.ok(Number.isInteger(limit) && limit > 0 && limit <= 100);
  const selected = decisionTrace.filter(event =>
    event.playerSlot === options.seat && event.turnBefore === options.turn);
  assert.ok(selected.length <= limit,
    'Source turn contains ' + selected.length + ' actions, exceeding cap ' + limit);
  return selected.map(event => ({
    actionOrdinal: event.actionOrdinal,
    action: event.action,
    ...(event.action === 'PlayCardAction' && typeof event.card === 'string'
      ? {playedCard:event.card} : {}),
    ...(typeof event.ability === 'string'
      ? {announcedAbility:event.ability} : {}),
    ...(event.action === 'AttackAction' && typeof event.attack === 'string'
      ? {announcedAttack:event.attack} : {}),
    prizesRemaining:Array.isArray(event.prizesAfter)
      ? event.prizesAfter.slice() : null,
    decksRemaining:Array.isArray(event.decksAfter)
      ? event.decksAfter.slice() : null,
    turnEndingActionAccepted:['PassTurnAction','AttackAction'].includes(event.action),
    observedTurnNumberAdvanced:event.turnAfter > event.turnBefore
  }));
}

/** @param {object[]} ledger @returns {boolean} */
function responseTurnEndingActionObserved(ledger) {
  return ledger.some(event => event.turnEndingActionAccepted);
}


/**
 * Derive publicly visible Prize-count changes from the authentic root Store
 * transcript, omitting Prize identities and all private-choice payloads.
 *
 * @param {object[]} actionTrace
 * @returns {object[]}
 */
function publicPrizeTransitions(actionTrace) {
  assert.ok(Array.isArray(actionTrace));
  const result=[];
  for(let i=0;i<actionTrace.length;i++) {
    const event=actionTrace[i];
    const before=event.before?.prizesRemaining;
    const after=event.after?.prizesRemaining;
    if(!Array.isArray(before)||!Array.isArray(after)||
        before.length!==2||after.length!==2) continue;
    if(before[0]===after[0] && before[1]===after[1]) continue;
    result.push({
      rootActionOrdinal:i,turn:event.before.turn,
      action:event.action,
      promptKind:event.pendingPrompt?.kind??null,
      prizesBefore:before.slice(),
      prizesAfter:after.slice()
    });
  }
  return result;
}

module.exports = {publicTurnLedger,responseTurnEndingActionObserved,
  publicPrizeTransitions};
