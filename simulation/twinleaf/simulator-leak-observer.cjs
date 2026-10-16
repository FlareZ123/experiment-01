'use strict';

const path = require('node:path');
const root = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Collect card field snapshots from all zones in one live State.
 * Counts individual physical Card objects, preserving alias identity.
 *
 * @param {object} state Pinned Twinleaf State.
 * @param {Function} Card Constructor from pinned engine.
 * @returns {Map<object,number>}
 */
function liveCardDamageSnapshots(state, Card) {
  const snapshots = new Map();
  for (const player of state.players) {
    const zones = [player.active, ...player.bench, player.hand, player.deck,
      player.discard, player.lostzone, ...player.prizes];
    for (const zone of zones) {
      for (const card of zone.cards) {
        if (card instanceof Card &&
            typeof card.damageTakenLastTurn === 'number') {
          snapshots.set(card, card.damageTakenLastTurn);
        }
      }
    }
  }
  return snapshots;
}

/**
 * Observe leaks from ordinary speculative Simulator dispatches. The observer
 * only reads source-card fields after the simulated effect. It leaves default
 * bot scoring, Card objects, randomness and reducer code untouched.
 *
 * @returns {{report:object,restore:()=>void}}
 */
function installCardReferenceLeakObserver() {
  const modulePath = path.join(root, 'game/bots/simulator');
  const simulatorModule = require(modulePath);
  const {Card} = require(path.join(root, 'game/store/card/card'));
  const original = simulatorModule.Simulator;
  const report = {
    profile: 'read-only-speculative-card-leak-observer-v1',
    simulatorInstances: 0,
    dispatches: 0,
    changes: 0,
    cardChanges: {},
    samples: []
  };
  class ObservedSimulator extends original {
    /** @param {object} state @param {object} options */
    constructor(state, options) {
      super(state, options);
      report.simulatorInstances++;
      this.liveCardSnapshots = liveCardDamageSnapshots(state, Card);
    }
    /** @param {object} action */
    dispatch(action) {
      const result = super.dispatch(action);
      report.dispatches++;
      for (const [card, before] of this.liveCardSnapshots) {
        const after = card.damageTakenLastTurn;
        if (after === before) continue;
        report.changes++;
        const name = card.fullName || card.name || '?';
        report.cardChanges[name] = (report.cardChanges[name] || 0) + 1;
        if (report.samples.length < 24) {
          report.samples.push({
            card: name, before, after,
            speculativeAction: action.constructor.name,
            attackName: action.name || null
          });
        }
        this.liveCardSnapshots.set(card, after);
      }
      return result;
    }
  }
  simulatorModule.Simulator = ObservedSimulator;
  return {
    report,
    restore() {
      if (simulatorModule.Simulator !== ObservedSimulator) {
        throw new Error('Card leak observer lost Simulator export ownership');
      }
      simulatorModule.Simulator = original;
    }
  };
}

module.exports = {liveCardDamageSnapshots,installCardReferenceLeakObserver};
