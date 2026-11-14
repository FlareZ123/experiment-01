'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const {createHash} = require('node:crypto');

const VERSION = 'agent36-pre-execution-commonjs-module-pin-v1';
const EXTENSIONS = new Set(['.cjs', '.js', '.json']);

/** @param {Buffer} bytes @returns {string} */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} value @returns {boolean} */
function withinRoot(value) {
  return Boolean(value) && value !== '..' &&
    !value.startsWith('../') && !path.isAbsolute(value);
}

/**
 * Intercept all synchronous CommonJS loads for a reproducible native game.
 * Unknown research module bytes fail *before* their JavaScript executes.
 * Every research-owned module in the frozen map must already be loaded before
 * the guard is installed; expected-but-lazy modules are not admitted later.
 * Caller must independently pin the expected file/SHA manifest before seeing
 * outcomes. This hook cannot establish paper legality, account for dynamic
 * fs/eval/ESM imports, or verify vendor/game-engine semantics.
 *
 * @template T
 * @param {string} repositoryRoot
 * @param {Record<string,string>} expectedByPath Frozen repo-relative SHA-256.
 * @param {()=>T|Promise<T>} execute Synchronous or awaited game/regression.
 * @returns {{result:T,audit:object}|Promise<{result:T,audit:object}>}
 */
function withPinnedResearchModuleLoads(repositoryRoot, expectedByPath, execute) {
  assert.equal(typeof execute, 'function');
  assert.ok(expectedByPath && typeof expectedByPath === 'object' &&
    !Array.isArray(expectedByPath));
  const root = fs.realpathSync(repositoryRoot);
  const pinned = new Map();
  for (const [name, hash] of Object.entries(expectedByPath)) {
    const normalized = name.split(path.sep).join('/');
    assert.equal(path.posix.normalize(normalized), normalized,
      'Frozen manifest paths must be canonical relative paths');
    assert.ok(withinRoot(normalized) && EXTENSIONS.has(path.extname(normalized)) &&
      !normalized.startsWith('vendor/') &&
      !normalized.startsWith('node_modules/'),
    'Invalid research file in frozen manifest: ' + name);
    assert.match(hash, /^[a-f0-9]{64}$/, 'Invalid frozen SHA-256: ' + name);
    assert.ok(!pinned.has(normalized), 'Duplicate manifest path: ' + normalized);
    pinned.set(normalized, hash);
  }

  const previous = Object.getOwnPropertyDescriptor(Module, '_load');
  assert.equal(typeof previous?.value, 'function');
  const observed = new Map();
  const preloaded = new Set();
  const audit = {version: VERSION, preloadedChecks: 0, requireChecks: 0,
    endChecks: 0, files: [], preloadedFiles: [], guardRestored: false,
    competitiveGameQualified: false,
    limitation: 'CommonJS loads are guarded across synchronous or awaited callbacks; ESM/dynamic-fs and paper/vendor/runtime-state verification remain separate.'};

  /**
   * @param {string} filename
   * @returns {{filename:string,name:string}|null}
   */
  function researchFile(filename) {
    const original = path.resolve(filename);
    const relative = path.relative(root, original).split(path.sep).join('/');
    if (!withinRoot(relative) ||
      relative.startsWith('vendor/') ||
      relative.startsWith('node_modules/') ||
      !EXTENSIONS.has(path.extname(relative))) return null;
    const real = fs.realpathSync(original);
    const actual = path.relative(root, real).split(path.sep).join('/');
    assert.ok(withinRoot(actual) && actual === relative,
      'Research module symlink or path escape is unregistered: ' + relative);
    return {filename: real, name: actual};
  }

  /** @param {string} filename @param {'preloaded'|'require'|'end'} stage */
  function check(filename, stage) {
    const file = researchFile(filename);
    if (!file) return;
    const expected = pinned.get(file.name);
    assert.ok(expected, 'Unregistered research module before execution: ' + file.name);
    assert.equal(sha256(fs.readFileSync(file.filename)), expected,
      'Research module changed from independently frozen manifest: ' + file.name);
    observed.set(file.name, file.filename);
    if (stage === 'preloaded') {
      audit.preloadedChecks++;
      preloaded.add(file.name);
    }
    if (stage === 'require') audit.requireChecks++;
    if (stage === 'end') audit.endChecks++;
  }

  // First prove that no already-loaded research code is outside the manifest.
  for (const filename of Object.keys(require.cache)) check(filename, 'preloaded');
  // Then prove the reverse: no manifest-only module can be lazily loaded later.
  for (const name of pinned.keys()) {
    assert.ok(preloaded.has(name),
      'Expected research module not preloaded before runtime pin: ' + name);
  }
  audit.preloadedFiles = [...preloaded].sort();

  function pinnedLoad(request, parent, isMain) {
    const resolved = Module._resolveFilename(request, parent, isMain);
    if (typeof resolved === 'string' &&
      !Module.builtinModules.includes(resolved) &&
      !resolved.startsWith('node:')) {
      const source = parent?.filename && path.relative(root,
        path.resolve(parent.filename)).split(path.sep).join('/');
      if (withinRoot(source) &&
        !source.startsWith('vendor/') &&
        !source.startsWith('node_modules/') &&
        (request.startsWith('.') || path.isAbsolute(request))) {
        const resolvedName = path.relative(root,
          path.resolve(resolved)).split(path.sep).join('/');
        assert.ok(withinRoot(resolvedName),
          'Relative research import escapes repository: ' + request);
      }
      const file = researchFile(resolved);
      if (file) {
        // Check the manifest first so an unregistered late load gets the
        // precise unregistered-module failure, then reject expected-but-late.
        check(resolved, 'require');
        assert.ok(preloaded.has(file.name),
          'Research module was not preloaded before runtime pin: ' + file.name);
      }
    }
    return previous.value.apply(this, arguments);
  }

  Object.defineProperty(Module, '_load', {...previous, value: pinnedLoad});
  let asyncExecution=false;
  let restored=false;
  const restore=()=>{
    if(restored)return;
    assert.equal(Module._load, pinnedLoad,
      'CommonJS module loader was modified during pinned evaluation');
    Object.defineProperty(Module, '_load', previous);
    audit.guardRestored=true;
    restored=true;
  };
  const finish=result=>{
    for (const filename of observed.values()) check(filename, 'end');
    audit.files=[...observed.keys()].sort();
    return {result,audit};
  };
  const fail=error=>{
    if(error&&typeof error==='object'){
      audit.files=[...observed.keys()].sort();
      error.agent36ModulePinAudit=audit;
    }
    throw error;
  };
  try {
    const result=execute();
    if(result&&typeof result.then==='function'){
      asyncExecution=true;
      return result.then(finish).catch(fail).finally(restore);
    }
    return finish(result);
  } catch(error) {
    return fail(error);
  } finally {
    if(!asyncExecution) restore();
  }
}

module.exports = {VERSION, sha256, withPinnedResearchModuleLoads};
