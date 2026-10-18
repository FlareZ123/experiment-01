'use strict';

const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');

const target = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/prefabs/copy-attack-delegation.js');

/**
 * Fail closed when the pinned compiled module has changed.
 * @param {string} source
 * @param {string} oldText
 * @param {string} newText
 * @returns {string}
 */
function replaceOnce(source, oldText, newText) {
  const first = source.indexOf(oldText);
  if (first < 0 || source.indexOf(oldText, first + oldText.length) !== -1) {
    throw new Error('Copy-session hook source anchor missing or ambiguous: ' + oldText);
  }
  return source.slice(0, first) + newText + source.slice(first + oldText.length);
}

/**
 * Keep sticky copied-attack sessions per State, not in one process-global
 * array. This prevents one independent Store from deleting another's session.
 * A cloned State deliberately receives no implicit copy of the source State's
 * ongoing session; qualified Simulator semantics require separate validation.
 * @param {string} source Compiled Twinleaf CommonJS module source
 * @returns {string}
 */
function stateScopeCopiedSessions(source) {
  let output = replaceOnce(source, 'const copyAttackSessions = [];',
    `let copyAttackSessionsByState = new WeakMap();
function sessionsForState(state) {
    let sessions = copyAttackSessionsByState.get(state);
    if (!sessions) {
        sessions = [];
        copyAttackSessionsByState.set(state, sessions);
    }
    return sessions;
}`);
  output = replaceOnce(output,
    'function openCopyAttackSession(state, player, copycatCard, sourceCard, clonedAttacks, selectedClonedAttack) {',
    'function openCopyAttackSession(state, player, copycatCard, sourceCard, clonedAttacks, selectedClonedAttack) {\n    const copyAttackSessions = sessionsForState(state);');
  output = replaceOnce(output,
    'function resolveCopyAttackSessions(store, state, effect) {',
    'function resolveCopyAttackSessions(store, state, effect) {\n    const copyAttackSessions = sessionsForState(state);');
  output = replaceOnce(output,
    'function clearCopyTurnDelegationsForTests() {\n    copyAttackSessions.length = 0;',
    'function clearCopyTurnDelegationsForTests() {\n    copyAttackSessionsByState = new WeakMap();');
  output = replaceOnce(output,
    'function clearCopyAttackSessionsForTests() {\n    copyAttackSessions.length = 0;',
    'function clearCopyAttackSessionsForTests() {\n    copyAttackSessionsByState = new WeakMap();');
  output += `
function inheritCopyAttackSessionsFromState(parentState, clonedState, mapCard) {
  const entries = copyAttackSessionsByState.get(parentState) || [];
  if (copyAttackSessionsByState.has(clonedState)) throw new Error("Clone already has sessions");
  const translated = entries.map(entry => {
    const clonedAttacks = entry.clonedAttacks.slice();
    const parentAttack = parentState.playerLastAttack?.[entry.playerId]?.attack;
    const cloneAttack = clonedState.playerLastAttack?.[entry.playerId]?.attack;
    const selectedIndex = clonedAttacks.indexOf(parentAttack);
    if (selectedIndex !== -1) {
      if (!cloneAttack || cloneAttack.name !== parentAttack.name) {
        throw new Error("Copied session cloned selected attack mismatch");
      }
      clonedAttacks[selectedIndex] = cloneAttack;
    }
    return {
      ...entry,
      copycatCard: mapCard ? mapCard(entry.copycatCard) : entry.copycatCard,
      sourceCard: mapCard ? mapCard(entry.sourceCard) : entry.sourceCard,
      clonedAttacks
    };
  });
  for (const entry of translated) {
    if (!isCopycatInPlay(clonedState, entry.copycatCard)) {
      throw new Error("Cloned Pokemon identity differs");
    }
  }
  copyAttackSessionsByState.set(clonedState, translated);
  return entries.length;
}
exports.inheritCopyAttackSessionsFromState = inheritCopyAttackSessionsFromState;
function transferCopyAttackSessionsOnRollback(parentState, backupState) {
  const copied = inheritCopyAttackSessionsFromState(parentState, backupState);
  copyAttackSessionsByState.delete(parentState);
  return copied;
}
exports.transferCopyAttackSessionsOnRollback = transferCopyAttackSessionsOnRollback;
function describeCopySessionsForState(state, attack) {
  return (copyAttackSessionsByState.get(state) || []).map(entry => ({
    copiedPokemon: entry.copycatCard.fullName,
    sourcePokemon: entry.sourceCard.fullName,
    selectedHistory: state.playerLastAttack?.[entry.playerId]?.attack?.name || null,
    clonedAttackNames: entry.clonedAttacks.map(a => a.name),
    matchesEffectAttack: attack ? entry.clonedAttacks.includes(attack) : null
  }));
}
exports.describeCopySessionsForState = describeCopySessionsForState;
`;
  return output;
}

/**
 * Opt-in in-memory loader for one pinned compiled module. Invoke before any
 * Twinleaf import, in a dedicated test or experiment process. The original
 * compiled files on disk are never modified.
 *
 * The returned cleanup restores the loader interception; already imported
 * module objects intentionally stay patched until process exit.
 * @returns {() => void}
 */
function installStateScopedCopySessionLoader() {
  if (require.cache[target]) {
    throw new Error('Install copy-session State scope before loading Twinleaf');
  }
  const previous = Module._extensions['.js'];
  /** @param {NodeModule} module @param {string} filename */
  function intercept(module, filename) {
    if (path.resolve(filename) !== target) {
      return previous(module, filename);
    }
    Module._extensions['.js'] = previous;
    const source = fs.readFileSync(filename, 'utf8');
    module._compile(stateScopeCopiedSessions(source), filename);
  }
  Module._extensions['.js'] = intercept;
  return () => {
    if (Module._extensions['.js'] === intercept) {
      Module._extensions['.js'] = previous;
    }
  };
}

module.exports = {stateScopeCopiedSessions,installStateScopedCopySessionLoader};
