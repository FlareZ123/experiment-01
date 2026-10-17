'use strict';

const path = require('node:path');
const {liveCardDamageSnapshots} = require('./simulator-leak-observer.cjs');

/**
 * Observe source-Card attack-history writes across one real bot decision.
 * In repair mode, undo only that numerical field on its physical source card
 * before the game dispatches the selected action. No vendor code is edited.
 *
 * @param {Function} BotClass SimpleTacticsAi or a test constructor.
 * @param {Function} Card Actual Card constructor or test constructor.
 * @param {{restoreDamageHistory?:boolean}} options
 * @returns {{report:object,restore:()=>void}}
 */
function observeOrRestoreDecisionDamageHistory(
  BotClass, Card, {restoreDamageHistory = false} = {}
) {
  const prototype = BotClass.prototype;
  const previous = Object.getOwnPropertyDescriptor(prototype,'decodeNextAction');
  const original = prototype.decodeNextAction;
  if (typeof original !== 'function') {
    throw new TypeError('decodeNextAction must be a synchronous method');
  }
  const report = {
    protocol: restoreDamageHistory ?
      'restore-source-damage-history-after-bot-decision-v1' :
      'observe-source-damage-history-after-bot-decision-v1',
    decisions: 0,
    changedDecisionCount: 0,
    changedCardFields: 0,
    firstWriteDecision: null,
    sampleWrites: [],
    decisionActions: []
  };

  function observed(state) {
    const before = liveCardDamageSnapshots(state, Card);
    let action;
    try {
      action = original.call(this,state);
      return action;
    } finally {
      const index = ++report.decisions;
      report.decisionActions.push({
        index, turn: state.turn, actorSeat: state.activePlayer,
        action: action?.constructor?.name || '<threw>',
        name: action?.name || null,
        handIndex: Number.isInteger(action?.handIndex) ? action.handIndex : null
      });
      let changed = false;
      for (const [card, value] of before) {
        const now = card.damageTakenLastTurn;
        if (Object.is(now,value)) continue;
        changed = true;
        report.changedCardFields++;
        if (report.firstWriteDecision === null) report.firstWriteDecision = index;
        if (report.sampleWrites.length < 30) {
          report.sampleWrites.push({
            decision: index, turn: state.turn,
            card: card.fullName || card.name || '?',
            before: value, after: now,
            nextAction: action?.constructor?.name || '<threw>'
          });
        }
        if (restoreDamageHistory) card.damageTakenLastTurn = value;
      }
      if (changed) report.changedDecisionCount++;
    }
  }
  Object.defineProperty(prototype,'decodeNextAction',{
    value: observed, writable: true, configurable: true
  });
  return {
    report,
    restore() {
      if (prototype.decodeNextAction !== observed) {
        throw new Error('Damage-history wrapper lost method ownership');
      }
      if (previous) Object.defineProperty(prototype,'decodeNextAction',previous);
      else delete prototype.decodeNextAction;
    }
  };
}

/**
 * @param {{restoreDamageHistory?:boolean}} options
 * @returns {{report:object,restore:()=>void}}
 */
function installDecisionDamageHistoryRollback(options = {}) {
  const root = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi} = require(path.join(root,'simple-bot/simple-tactics-ai'));
  const {Card} = require(path.join(root,'game/store/card/card'));
  return observeOrRestoreDecisionDamageHistory(SimpleTacticsAi,Card,options);
}

module.exports = {
  observeOrRestoreDecisionDamageHistory,
  installDecisionDamageHistoryRollback
};
