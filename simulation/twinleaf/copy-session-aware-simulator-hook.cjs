'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Transfer only an existing printed-copy session into a pinned Simulator
 * clone whose Card identities are preserved. Requires the State-scoped
 * research loader to be installed before Twinleaf is imported.
 *
 * @returns {() => void} Restore the previous Simulator constructor.
 */
function installCopySessionAwareSimulatorHook() {
  const simulation = require(path.join(output, 'game/bots/simulator'));
  const prefab = require(path.join(output, 'game/store/prefabs/copy-attack-delegation'));
  const inherit = prefab.inheritCopyAttackSessionsFromState;
  if (typeof inherit !== 'function') {
    throw new Error('State-scoped copy session loader must be installed first');
  }

  const BaseSimulator = simulation.Simulator;
  class CopySessionAwareSimulator extends BaseSimulator {
    /**
     * @param {any} state
     * @param {object} [options]
     */
    constructor(state, options) {
      super(state, options);
      inherit(state, this.store.state);
    }
  }
  simulation.Simulator = CopySessionAwareSimulator;
  return () => {
    if (simulation.Simulator !== CopySessionAwareSimulator) {
      throw new Error('Copy-session-aware Simulator export ownership lost');
    }
    simulation.Simulator = BaseSimulator;
  };
}

module.exports = {installCopySessionAwareSimulatorHook};
