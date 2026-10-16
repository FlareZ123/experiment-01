'use strict';

const path = require('node:path');

/**
 * Pre-clone state including Card objects before passing to pinned Simulator,
 * whose built-in clone otherwise preserves Card references.
 *
 * This is an experimental research hook. Verify behavior with real engine
 * effects before enabling it for matchup decisions.
 *
 * @param {Function} BaseSimulator Pinned class.
 * @param {(state:object)=>object} clone Full object-graph clone.
 * @returns {Function} Wrapped simulator class.
 */
function makeDetachedSimulatorClass(BaseSimulator, clone) {
  return class DetachedSimulator extends BaseSimulator {
    /** @param {object} state @param {object} [arbiterOptions] */
    constructor(state, arbiterOptions) {
      super(clone(state), arbiterOptions);
    }
  };
}

/**
 * Install a reversible research-only simulator isolation experiment.
 * Vendor files remain untouched.
 *
 * @returns {()=>void} Restore preceding simulator export.
 */
function installDetachedSimulatorHook() {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const simModule = require(path.join(root, 'game/bots/simulator'));
  const {deepClone} = require(path.join(root, 'utils'));
  const original = simModule.Simulator;
  const wrapped = makeDetachedSimulatorClass(original, state => deepClone(state));
  simModule.Simulator = wrapped;
  return () => {
    if (simModule.Simulator !== wrapped) {
      throw new Error('Detached simulator export changed before restoration.');
    }
    simModule.Simulator = original;
  };
}

module.exports = {makeDetachedSimulatorClass, installDetachedSimulatorHook};
