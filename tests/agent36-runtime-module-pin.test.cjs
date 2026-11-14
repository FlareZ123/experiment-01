'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const {createRequire} = require('node:module');
const {sha256, withPinnedResearchModuleLoads} =
  require('../simulation/evaluation/agent36-runtime-module-pin.cjs');

/** @param {(root:string, requireFromRoot:NodeRequire)=>void} run */
function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent36-loadpin-'));
  const localRequire = createRequire(path.join(root, 'test-caller.cjs'));
  const cleanup=()=>{
    for (const id of Object.keys(require.cache))
      if (id.startsWith(root + path.sep)) delete require.cache[id];
    fs.rmSync(root, {recursive: true, force: true});
  };
  try {
    const result=run(root,localRequire);
    if(result&&typeof result.then==='function') return result.finally(cleanup);
    cleanup();
    return result;
  } catch(error) {
    cleanup();
    throw error;
  }
}

/** @param {string} root @param {string} name @param {string} content */
function create(root, name, content) {
  const filename = path.join(root, name);
  fs.writeFileSync(filename, content);
  return sha256(fs.readFileSync(filename));
}

test('frozen preloaded entry and dynamic dependency run; both hashes are attested', () =>
  fixture((root, localRequire) => {
    const first = create(root, 'entry.cjs',
      "module.exports = () => require('./late.cjs').value;\n");
    const second = create(root, 'late.cjs', 'exports.value = 42;\n');
    // Both role closure files must be loaded before the pin is installed.
    localRequire('./late.cjs');
    localRequire('./entry.cjs');
    const prior = Module._load;
    const {result, audit} = withPinnedResearchModuleLoads(root, {
      'entry.cjs':first, 'late.cjs':second
    }, () => localRequire('./entry.cjs')());
    assert.equal(result, 42);
    assert.deepEqual(audit.files, ['entry.cjs', 'late.cjs']);
    assert.deepEqual(audit.preloadedFiles, ['entry.cjs', 'late.cjs']);
    assert.equal(audit.preloadedChecks, 2);
    assert.ok(audit.requireChecks >= 2);
    assert.equal(audit.endChecks, 2);
    assert.equal(audit.guardRestored, true);
    assert.strictEqual(Module._load, prior);
  }));

test('expected but not preloaded research module is rejected before game execution', () =>
  fixture((root, localRequire) => {
    const first = create(root, 'entry.cjs',
      "module.exports = () => require('./late.cjs');\n");
    const second = create(root, 'late.cjs', 'exports.value = 42;\n');
    localRequire('./entry.cjs');
    assert.throws(() => withPinnedResearchModuleLoads(root, {
      'entry.cjs':first, 'late.cjs':second
    }, () => localRequire('./entry.cjs')()),
    /Expected research module not preloaded before runtime pin: late.cjs/);
  }));

test('unknown dynamic module blocked before executing its code', () =>
  fixture((root, localRequire) => {
    const marker = path.join(root, 'unwanted-side-effect');
    const first = create(root, 'entry.cjs',
      "module.exports = () => require('./late.cjs');\n");
    create(root, 'late.cjs',
      "require('node:fs').writeFileSync(" + JSON.stringify(marker) + ",'ran');\n");
    localRequire('./entry.cjs');
    const prior = Module._load;
    assert.throws(() => withPinnedResearchModuleLoads(root,
      {'entry.cjs':first}, () => localRequire('./entry.cjs')()),
    /Unregistered research module before execution: late.cjs/);
    assert.equal(fs.existsSync(marker), false);
    assert.strictEqual(Module._load, prior);
  }));

test('modified source rejected before first run', () =>
  fixture((root, localRequire) => {
    const original = create(root, 'entry.cjs', 'module.exports = 1;\n');
    localRequire('./entry.cjs');
    fs.writeFileSync(path.join(root, 'entry.cjs'), 'module.exports = 2;\n');
    assert.throws(() => withPinnedResearchModuleLoads(root,
      {'entry.cjs':original}, () => localRequire('./entry.cjs')),
    /Research module changed from independently frozen manifest/);
  }));

test('module already in require.cache is attested at installation', () =>
  fixture((root, localRequire) => {
    create(root, 'entry.cjs', 'module.exports = 1;\n');
    localRequire('./entry.cjs');
    assert.throws(() => withPinnedResearchModuleLoads(root, {},
      () => 'never executed'),
    /Unregistered research module before execution/);
  }));

test('a loaded source file changed during game fails final check', () =>
  fixture((root, localRequire) => {
    const first = create(root, 'entry.cjs', 'module.exports = 1;\n');
    localRequire('./entry.cjs');
    assert.throws(() => withPinnedResearchModuleLoads(root,
      {'entry.cjs':first}, () => {
        fs.writeFileSync(path.join(root, 'entry.cjs'), 'module.exports = 99;\n');
        return 1;
      }), /Research module changed from independently frozen manifest/);
  }));

test('unexpected game exception restores global native loader exactly', () =>
  fixture((root) => {
    const prior = Object.getOwnPropertyDescriptor(Module, '_load');
    assert.throws(() => withPinnedResearchModuleLoads(root, {},
      () => {throw Error('game abort');}), /game abort/);
    assert.deepEqual(Object.getOwnPropertyDescriptor(Module, '_load'), prior);
  }));


test('async callback remains under the module-load guard until it settles', async () =>
  fixture(async (root, localRequire) => {
    const entryHash=create(root,'entry.cjs','module.exports=1;\\n');
    create(root,'late.cjs','module.exports=2;\\n');
    localRequire('./entry.cjs');
    const prior=Module._load;
    const pinned=await withPinnedResearchModuleLoads(root,
      {'entry.cjs':entryHash},async()=>{
        await Promise.resolve();
        assert.notStrictEqual(Module._load,prior);
        assert.throws(()=>localRequire('./late.cjs'),
          /Unregistered research module before execution: late.cjs/);
        return 'async-ok';
      });
    assert.equal(pinned.result,'async-ok');
    assert.equal(pinned.audit.guardRestored,true);
    assert.strictEqual(Module._load,prior);
  }));

test('noncanonical manifest aliases are rejected before games', () =>
  fixture((root) => {
    const hash = create(root, 'entry.cjs', 'module.exports = 1;\n');
    assert.throws(() => withPinnedResearchModuleLoads(root,
      {'sub/../entry.cjs':hash}, () => 'never started'),
    /Frozen manifest paths must be canonical/);
  }));

test('relative research import escaping repository is blocked before evaluation', () =>
  fixture((root, localRequire) => {
    const outer = fs.mkdtempSync(path.join(os.tmpdir(), 'agent36-foreign-'));
    const outside = path.join(outer, 'escape.cjs');
    const marker = path.join(outer, 'did-execute');
    fs.writeFileSync(outside,
      "require('node:fs').writeFileSync(" + JSON.stringify(marker) +
      ",'ran'); module.exports=1;\n");
    const request = path.relative(root, outside);
    const entryHash = create(root, 'entry.cjs',
      'module.exports = () => require(' + JSON.stringify(request) + ');\n');
    localRequire('./entry.cjs');
    try {
      assert.throws(() => withPinnedResearchModuleLoads(root,
        {'entry.cjs':entryHash}, () => localRequire('./entry.cjs')()),
      /Relative research import escapes repository/);
      assert.equal(fs.existsSync(marker), false);
    } finally {
      fs.rmSync(outer, {recursive: true, force: true});
    }
  }));
