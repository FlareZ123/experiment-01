'use strict';

const path = require('node:path');
const {severClonePrototypeAliases} =
  require('./prototype-safe-simulator-hook.cjs');
const {normalizeDeepClonePrototypes, assertVendorCloneCompatibleSource} =
  require('./normalize-deep-clone.cjs');

/**
 * Pinned Simulator deep-clones inside its constructor after our pre-clone.
 * Its Card exception can break repeated attack/history identities on that
 * second pass. Reconcile the *final* clone against the original source graph.
 * This is an experimental, reversible research profile only.
 *
 * @param {Function} BaseSimulator Actual pinned Simulator.
 * @param {(state:object)=>object} preclone Existing detached clone preparation.
 * @param {(source:object,copy:object)=>object} [reconcile]
 * @returns {Function}
 */
function makePostSuperAliasRepairClass(
  BaseSimulator, preclone, reconcile = normalizeDeepClonePrototypes
) {
  return class PostSuperAliasRepairSimulator extends BaseSimulator {
    /** @param {object} sourceState @param {object} [arbiterOptions] */
    constructor(sourceState, arbiterOptions) {
      super(preclone(sourceState), arbiterOptions);
      reconcile(sourceState, this.store.state);
    }
  };
}

/**
 * Install an opt-in source-graph reconciliation experiment over the pinned
 * Simulator. No vendor files or shared default headless options are changed.
 *
 * @returns {()=>void} Restores the previous Simulator export.
 */
function installPostSuperAliasRepairHook() {
  const root = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const modulePath = path.join(root, 'game/bots/simulator');
  const simulatorModule = require(modulePath);
  const {deepClone} = require(path.join(root, 'utils'));
  const original = simulatorModule.Simulator;
  const Wrapped = makePostSuperAliasRepairClass(original, source => {
    assertVendorCloneCompatibleSource(source);
    const first = deepClone(source);
    severClonePrototypeAliases(source, first);
    return first;
  });
  simulatorModule.Simulator = Wrapped;
  return () => {
    if (simulatorModule.Simulator !== Wrapped) {
      throw new Error('Post-super alias repair hook lost Simulator export ownership');
    }
    simulatorModule.Simulator = original;
  };
}

module.exports = {
  makePostSuperAliasRepairClass, installPostSuperAliasRepairHook
};
