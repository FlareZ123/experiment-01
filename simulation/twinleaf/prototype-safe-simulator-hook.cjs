'use strict';

const path = require('node:path');
const {makeDetachedSimulatorClass} =
  require('./detached-simulator-hook.cjs');

const root = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * The pinned Twinleaf deepClone uses Object.create(source) for nonarrays.
 * Its cloned objects therefore inherit their exact source instances as
 * prototypes. Replace those direct instance prototypes with each source's
 * actual class prototype. This keeps methods and instanceof semantics while
 * avoiding inherited changes to source-instance properties.
 *
 * @param {object} source Original object graph.
 * @param {object} clone Pinned deepClone(source) result.
 * @param {WeakMap<object,WeakSet<object>>} [seen] Identity-pair registry.
 * @returns {number} Number of source-instance prototypes severed.
 */
function severClonePrototypeAliases(source, clone, seen = new WeakMap()) {
  if (source === null || clone === null ||
      typeof source !== 'object' || typeof clone !== 'object') {
    return 0;
  }
  let visitedClones = seen.get(source);
  if (visitedClones?.has(clone)) return 0;
  if (!visitedClones) {
    visitedClones = new WeakSet();
    seen.set(source, visitedClones);
  }
  visitedClones.add(clone);
  let severed = 0;
  if (Object.getPrototypeOf(clone) === source) {
    Object.setPrototypeOf(clone, Object.getPrototypeOf(source));
    severed++;
  }
  // Exact keys cloned by pinned deepClone: enumerable own string properties.
  for (const key of Object.keys(source)) {
    if (Object.prototype.hasOwnProperty.call(clone, key)) {
      severed += severClonePrototypeAliases(source[key], clone[key], seen);
    }
  }
  return severed;
}

/**
 * Reversible, opt-in research clone profile with detached Card objects and
 * without the original deepClone's source-instance prototype inheritance.
 *
 * @returns {()=>void} Restore the previous Simulator module export.
 */
function installPrototypeSafeSimulatorHook() {
  const modulePath = path.join(root, 'game/bots/simulator');
  const simulatorModule = require(modulePath);
  const {deepClone} = require(path.join(root, 'utils'));
  const original = simulatorModule.Simulator;
  const Wrapped = makeDetachedSimulatorClass(original, state => {
    const clone = deepClone(state);
    severClonePrototypeAliases(state, clone);
    return clone;
  });
  simulatorModule.Simulator = Wrapped;
  return () => {
    if (simulatorModule.Simulator !== Wrapped) {
      throw new Error('Prototype-safe Simulator hook lost export ownership');
    }
    simulatorModule.Simulator = original;
  };
}

module.exports = {
  severClonePrototypeAliases, installPrototypeSafeSimulatorHook
};
