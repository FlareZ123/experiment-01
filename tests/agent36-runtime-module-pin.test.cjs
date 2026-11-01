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
  try {
    run(root, localRequire);
  } finally {
    for (const id of Object.keys(require.cache))
      if (id.startsWith(root + path.sep)) delete require.cache[id];
    fs.rmSync(root, {recursive: true, force: true});
  }
}

/** @param {string} root @param {string} name @param {string} content */
function create(root, name, content) {
  const filename = path.join(root, name);
  fs.writeFileSync(filename, content);
  return sha256(fs.readFileSync(filename));
}

test('frozen declared entry and dynamic dependency run; both hashes are attested', () =>
  fixture((root, localRequire) => {
    const first = create(root, 'entry.cjs',
      "module.exports = () => require('./late.cjs').value;\n");
    const second = create(root, 'late.cjs', 'exports.value = 42;\n');
    const prior = Module._load;
    const {result, audit} = withPinnedResearchModuleLoads(root, {
      'entry.cjs':first, 'late.cjs':second
    }, () => localRequire('./entry.cjs')());
    assert.equal(result, 42);
    assert.deepEqual(audit.files, ['entry.cjs', 'late.cjs']);
    assert.equal(audit.preloadedChecks, 0);
    assert.ok(audit.requireChecks >= 2);
    assert.equal(audit.endChecks, 2);
    assert.equal(audit.guardRestored, true);
    assert.strictEqual(Module._load, prior);
  }));

test('unknown dynamic module blocked before executing its code', () =>
  fixture((root, localRequire) => {
    const marker = path.join(root, 'unwanted-side-effect');
    const first = create(root, 'entry.cjs',
      "module.exports = () => require('./late.cjs');\n");
    create(root, 'late.cjs',
      "require('node:fs').writeFileSync(" +
      JSON.stringify(marker) + ",'ran');\n");
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
    fs.writeFileSync(path.join(root, 'entry.cjs'), 'module.exports = 2;\n');
    assert.throws(() => withPinnedResearchModuleLoads(root,
      {'entry.cjs':original}, () => localRequire('./entry.cjs')),
    /Research module changed from independently frozen manifest/);
  }));

test('module already in require.cache is attested at installation', () =>
  fixture((root, localRequire) => {
    create(root, 'entry.cjs', 'module.exports = 1;\n');
    assert.equal(localRequire('./entry.cjs'), 1);
    assert.throws(() => withPinnedResearchModuleLoads(root, {},
      () => 'never executed'), /Unregistered research module before execution/);
  }));

test('a loaded source file changed during game fails final check', () =>
  fixture((root, localRequire) => {
    const first = create(root, 'entry.cjs',
      "require('node:fs').writeFileSync(__filename,"+
      "'module.exports = 99;\\n'); module.exports = 1;\n");
    assert.throws(() => withPinnedResearchModuleLoads(root,
      {'entry.cjs':first}, () => localRequire('./entry.cjs')),
    /Research module changed from independently frozen manifest/);
  }));

test('unexpected game exception restores global native loader exactly', () =>
  fixture((root) => {
    const prior = Object.getOwnPropertyDescriptor(Module, '_load');
    assert.throws(() => withPinnedResearchModuleLoads(root, {},
      () => {throw Error('game abort');}), /game abort/);
    assert.deepEqual(Object.getOwnPropertyDescriptor(Module, '_load'), prior);
  }));
