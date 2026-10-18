'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const HOOK_TAG = Symbol.for('experiment-01.copy-session-rollback-hook');

/**
 * Opt-in rollback bridge for a State-keyed copied-attack session registry.
 * Pinned Store.reduce restores a cloned State after an invalid root action.
 * That rollback must carry sticky copied-attack sessions to the replacement
 * State while preserving the original exception.
 *
 * Install the State-scope loader first, before importing Twinleaf.
 * @returns {() => void} Restore the unwrapped Store dispatch.
 */
function installCopySessionRollbackHook() {
  const {Store} = require(path.join(root, 'game/store/store'));
  const prefab = require(path.join(root, 'game/store/prefabs/copy-attack-delegation'));
  const transfer = prefab.transferCopyAttackSessionsOnRollback;
  if (typeof transfer !== 'function') {
    throw new Error('State-scoped copied-session loader required before rollback hook');
  }
  const previous = Store.prototype.dispatch;
  if (previous[HOOK_TAG]) {
    throw new Error('Copied-session rollback hook already installed');
  }
  /** @param {any} action @param {number} [clientRoleId] */
  function dispatchWithCopySessionRollback(action, clientRoleId) {
    const initialState = this.state;
    try {
      return previous.call(this, action, clientRoleId);
    } catch (originalError) {
      if (this.state !== initialState) {
        // Fail closed if the cloned State cannot be mapped to its source
        // history; do not silently treat a rolled-back session as intact.
        transfer(initialState, this.state);
      }
      throw originalError;
    }
  }
  dispatchWithCopySessionRollback[HOOK_TAG] = true;
  Store.prototype.dispatch = dispatchWithCopySessionRollback;
  return () => {
    if (Store.prototype.dispatch !== dispatchWithCopySessionRollback) {
      throw new Error('Copied-session rollback hook lost dispatch ownership');
    }
    Store.prototype.dispatch = previous;
  };
}

module.exports = {installCopySessionRollbackHook};
