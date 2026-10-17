'use strict';

const path = require('node:path');
const {snapshotLiveCardPrimitives, cardPrimitiveSnapshot} =
  require('./simulator-general-card-leak-observer.cjs');

/**
 * Compare Card-owned primitive fields at two points in the same live decision.
 * Objects are keyed by physical source identity, so repeated aliases count once.
 *
 * @param {Map<object,Record<string,string>>} before
 * @returns {Array<{card:string,field:string,before:string,after:string}>}
 */
function changedSourceCardFields(before) {
  const changes = [];
  for (const [card, previous] of before) {
    const current = cardPrimitiveSnapshot(card);
    for (const field of new Set([...Object.keys(previous), ...Object.keys(current)])) {
      if (previous[field] === current[field]) continue;
      changes.push({
        card: card.fullName || card.name || '?',
        field,
        before: previous[field] ?? '<absent>',
        after: current[field] ?? '<absent>'
      });
    }
  }
  return changes;
}

/**
 * Record source-Card changes that survive a complete real bot decision.
 * This only observes immediately before and after decodeNextAction; it never
 * modifies the returned action, card fields, random stream, or real Store.
 *
 * @param {Function} BotClass Pinned SimpleTacticsAi constructor, or a test class.
 * @param {Function} Card Pinned Card constructor, or a test class.
 * @returns {{report:object,restore:()=>void}}
 */
function observeDecisionBoundaries(BotClass, Card) {
  const prototype = BotClass.prototype;
  const ownDescriptor = Object.getOwnPropertyDescriptor(prototype, 'decodeNextAction');
  const original = prototype.decodeNextAction;
  if (typeof original !== 'function') {
    throw new TypeError('Expected a synchronous decodeNextAction method');
  }
  const report = {
    protocol: 'live-bot-decision-card-boundary-v1',
    decisions: 0,
    decisionsWithChanges: 0,
    changedFields: 0,
    changesByField: {},
    samples: []
  };
  function observedDecision(state) {
    const before = snapshotLiveCardPrimitives(state, Card);
    let action;
    try {
      action = original.call(this, state);
      return action;
    } finally {
      const changes = changedSourceCardFields(before);
      report.decisions++;
      if (changes.length) report.decisionsWithChanges++;
      report.changedFields += changes.length;
      for (const change of changes) {
        report.changesByField[change.field] =
          (report.changesByField[change.field] || 0) + 1;
        if (report.samples.length < 36) {
          report.samples.push({
            decision: report.decisions,
            turn: state.turn,
            actor: this.player?.id ?? null,
            returnedAction: action?.constructor?.name ?? '<threw>',
            ...change
          });
        }
      }
    }
  }
  Object.defineProperty(prototype, 'decodeNextAction', {
    configurable: true, writable: true, value: observedDecision
  });
  return {
    report,
    restore() {
      if (prototype.decodeNextAction !== observedDecision) {
        throw new Error('Decision-boundary Card observer lost method ownership');
      }
      if (ownDescriptor) {
        Object.defineProperty(prototype, 'decodeNextAction', ownDescriptor);
      } else {
        delete prototype.decodeNextAction;
      }
    }
  };
}

/** @returns {{report:object,restore:()=>void}} */
function installDecisionBoundaryCardObserver() {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi} = require(path.join(root,'simple-bot/simple-tactics-ai'));
  const {Card} = require(path.join(root,'game/store/card/card'));
  return observeDecisionBoundaries(SimpleTacticsAi, Card);
}

module.exports = {
  changedSourceCardFields, observeDecisionBoundaries,
  installDecisionBoundaryCardObserver
};
