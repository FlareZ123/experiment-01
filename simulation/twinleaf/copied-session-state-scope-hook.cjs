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
  output += '\nfunction inheritCopyAttackSessionsFromState(parentState, clonedState, mapCard) {\n' +
    '  const entries = copyAttackSessionsByState.get(parentState) || [];\n' +
    '  if (copyAttackSessionsByState.has(clonedState)) throw new Error("Clone already has sessions");\n' +
    '  const translated = entries.map(entry => ({\n' +
    '    ...entry,\n' +
    '    copycatCard: mapCard ? mapCard(entry.copycatCard) : entry.copycatCard,\n' +
    '    sourceCard: mapCard ? mapCard(entry.sourceCard) : entry.sourceCard,\n' +
    '    clonedAttacks: entry.clonedAttacks.slice()\n' +
    '  }));\n' +
    '  for (const entry of translated) {\n' +
    '    if (!isCopycatInPlay(clonedState, entry.copycatCard)) {\n' +
    '      throw new Error("Cloned Pokemon identity differs");\n' +
    '    }\n' +
    '  }\n' +
    '  copyAttackSessionsByState.set(clonedState, translated);\n' +
    '  return entries.length;\n' +
    '}\nexports.inheritCopyAttackSessionsFromState = inheritCopyAttackSessionsFromState;\n';
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
