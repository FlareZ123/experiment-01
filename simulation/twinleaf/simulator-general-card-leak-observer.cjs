'use strict';

const path = require('node:path');
const output = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/** @param {unknown} value @returns {boolean} */
function isPrimitive(value) {
  return value === null || ['string', 'number', 'boolean', 'undefined']
    .includes(typeof value);
}

/**
 * Capture mutable-looking own scalar fields and arrays of scalar values on a
 * live Card. Structural card metadata is deliberately included, since
 * unexpected mutations of IDs and names would also affect validity.
 *
 * @param {object} card
 * @returns {Record<string,string>}
 */
function cardPrimitiveSnapshot(card) {
  const result = {};
  for (const key of Object.keys(card)) {
    const value = card[key];
    if (isPrimitive(value)) {
      result[key] = JSON.stringify(value) ?? '<undefined>';
    } else if (Array.isArray(value) && value.every(isPrimitive)) {
      result[key] = JSON.stringify(value);
    }
  }
  return result;
}

/**
 * Gather the physical Card objects referenced by the actual current game.
 *
 * @param {object} state
 * @param {Function} Card
 * @returns {Map<object,Record<string,string>>}
 */
function snapshotLiveCardPrimitives(state, Card) {
  const snapshots = new Map();
  for (const player of state.players) {
    const zones = [player.active, ...player.bench, player.hand, player.deck,
      player.discard, player.lostzone, ...player.prizes];
    for (const zone of zones) {
      for (const card of zone.cards) {
        if (card instanceof Card && !snapshots.has(card)) {
          snapshots.set(card, cardPrimitiveSnapshot(card));
        }
      }
    }
  }
  return snapshots;
}

/**
 * Read-only instrumentation of ordinary speculative Simulator dispatches.
 * Reports every scalar/flat-scalar-array Card property changed in the source
 * state, including fields such as damageTakenLastTurn and _runtimeTags.
 *
 * @returns {{report:object,restore:()=>void}}
 */
function installGeneralCardLeakObserver() {
  const simModule = require(path.join(output, 'game/bots/simulator'));
  const {Card} = require(path.join(output, 'game/store/card/card'));
  const original = simModule.Simulator;
  const report = {
    protocol: 'read-only-primitive-and-flat-array-card-leak-v1',
    simulatorInstances: 0, simulatedDispatches: 0,
    changedFields: 0, changesByField: {}, changesByCard: {},
    examples: []
  };
  class ObservedSimulator extends original {
    /** @param {object} state @param {object} options */
    constructor(state, options) {
      super(state, options);
      report.simulatorInstances++;
      this.liveCards = snapshotLiveCardPrimitives(state, Card);
    }
    /** @param {object} action */
    dispatch(action) {
      const result = super.dispatch(action);
      report.simulatedDispatches++;
      for (const [card, before] of this.liveCards) {
        const after = cardPrimitiveSnapshot(card);
        const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
        for (const key of keys) {
          if (before[key] === after[key]) continue;
          report.changedFields++;
          report.changesByField[key] = (report.changesByField[key] || 0) + 1;
          const print = card.fullName || card.name || '?';
          report.changesByCard[print] = (report.changesByCard[print] || 0) + 1;
          if (report.examples.length < 36) {
            report.examples.push({
              card: print, field: key, before: before[key] ?? '<absent>',
              after: after[key] ?? '<absent>',
              action: action.constructor.name
            });
          }
        }
        this.liveCards.set(card, after);
      }
      return result;
    }
  }
  simModule.Simulator = ObservedSimulator;
  return {
    report,
    restore() {
      if (simModule.Simulator !== ObservedSimulator) {
        throw new Error('Card primitive observer lost Simulator export ownership');
      }
      simModule.Simulator = original;
    }
  };
}

module.exports = {
  isPrimitive,cardPrimitiveSnapshot,snapshotLiveCardPrimitives,
  installGeneralCardLeakObserver
};
