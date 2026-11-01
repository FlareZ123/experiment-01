'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {gitBlobHash, assertExternallyPinnedSelectedProfile} =
  require('../simulation/evaluation/agent36-profile-provenance-gate.cjs');

/** @param {(root:string)=>void} run */
function withFixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent36-profile-anchor-'));
  try { run(root); } finally { fs.rmSync(root, {recursive:true, force:true}); }
}

test('exact registered profile bytes and effective object pass', () => withFixture(root => {
  const selected = {schema:'immutable',policyOptions:{physicalZoneGate:true}};
  const bytes = Buffer.from(JSON.stringify(selected) + '\n');
  fs.writeFileSync(path.join(root, 'profile.json'), bytes);
  const expected = gitBlobHash(bytes);
  const result = assertExternallyPinnedSelectedProfile(root, 'profile.json', selected, expected);
  assert.equal(result.gitBlobSha, expected);
}));

test('same unchanged manifest file rejects altered effective policy options', () => withFixture(root => {
  const registered = {schema:'immutable',policyOptions:{physicalZoneGate:true}};
  const bytes = Buffer.from(JSON.stringify(registered) + '\n');
  fs.writeFileSync(path.join(root, 'profile.json'), bytes);
  const expected = gitBlobHash(bytes);
  const modified = {schema:'immutable',policyOptions:{physicalZoneGate:false}};
  assert.throws(() => assertExternallyPinnedSelectedProfile(
    root,'profile.json',modified,expected),/Effective selected profile differs/);
}));

test('same effective options reject silent file-byte drift', () => withFixture(root => {
  const registered = {schema:'immutable',policyOptions:{physicalZoneGate:true}};
  const bytes = Buffer.from(JSON.stringify(registered) + '\n');
  fs.writeFileSync(path.join(root, 'profile.json'), bytes);
  const expected = gitBlobHash(bytes);
  fs.writeFileSync(path.join(root,'profile.json'),JSON.stringify(registered,null,2) + '\n');
  assert.throws(() => assertExternallyPinnedSelectedProfile(
    root,'profile.json',registered,expected),/Unregistered profile file bytes/);
}));

test('reject profile paths outside the repository', () => withFixture(root => {
  const outer = path.join(os.tmpdir(),'agent36-external-profile.json');
  const bytes = Buffer.from('{}');
  fs.writeFileSync(outer, bytes);
  try {
    assert.throws(() => assertExternallyPinnedSelectedProfile(
      root,outer,{},gitBlobHash(bytes)),/Profile path escapes repository/);
  } finally { fs.rmSync(outer, {force:true}); }
}));
