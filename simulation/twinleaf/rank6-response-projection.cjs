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

module.exports = {publicTurnLedger,responseTurnEndingActionObserved};
