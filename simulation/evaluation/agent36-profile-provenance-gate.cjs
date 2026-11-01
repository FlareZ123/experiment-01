'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const VERSION = 'agent36-external-profile-blob-and-selected-object-v1';

/** @param {Buffer} bytes @returns {string} */
function gitBlobHash(bytes) {
  return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}

/**
 * Bind the effective selected options to a profile whose exact bytes were
 * independently registered before the run. A self-declared SHA in `selected`
 * is never an acceptable trust anchor. Does not execute game code.
 *
 * @param {string} repositoryRoot
 * @param {string} profilePath Repository-relative JSON path.
 * @param {object} selected Effective profile about to be used by the runner.
 * @param {string} expectedBlobSha Externally frozen 40-character Git blob SHA.
 * @returns {{version:string,profilePath:string,gitBlobSha:string}}
 */
function assertExternallyPinnedSelectedProfile(repositoryRoot, profilePath, selected, expectedBlobSha) {
  assert.ok(typeof repositoryRoot === 'string' && repositoryRoot.length);
  assert.ok(typeof profilePath === 'string' && profilePath.length);
  assert.match(expectedBlobSha, /^[a-f0-9]{40}$/);
  assert.ok(selected && typeof selected === 'object' && !Array.isArray(selected));
  const root = fs.realpathSync(repositoryRoot);
  const file = fs.realpathSync(path.resolve(root, profilePath));
  const relative = path.relative(root, file);
  assert.ok(relative && relative !== '..' &&
    !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative),
  'Profile path escapes repository');
  const bytes = fs.readFileSync(file);
  const actual = gitBlobHash(bytes);
  assert.equal(actual, expectedBlobSha, 'Unregistered profile file bytes');
  const diskProfile = JSON.parse(bytes.toString('utf8'));
  assert.deepEqual(selected, diskProfile, 'Effective selected profile differs from registered file');
  return {version:VERSION, profilePath:relative.split(path.sep).join('/'), gitBlobSha:actual};
}

module.exports = {VERSION, gitBlobHash, assertExternallyPinnedSelectedProfile};
