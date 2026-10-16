'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {loadDefaultCampaign} = require('../scripts/aichi-comparison-campaign.cjs');

/** @param {string} name @returns {string} */
function workflow(name) {
  return fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', name), 'utf8');
}

/** @param {string} text @returns {void} */
function manualOnly(text) {
  assert.match(text, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(text, /^\s*(?:push|pull_request|schedule):\s*$/m);
}

test('new bounded three-candidate diagnostics default to v3, with explicit v2 replay', () => {
  const content = workflow('aichi-first-game.yml');
  manualOnly(content);
  const input = content.split('      seat_seed_protocol:\n')[1]
    .split('      expanded_action_policy:\n')[0];
  assert.match(input, /- independent-slots-v2/);
  assert.match(input, /- decorrelated-slots-v3/);
  assert.match(input, /default: decorrelated-slots-v3/);
  assert.match(content, /AICHI_DIAGNOSTIC_SEED_PROTOCOL: \$\{\{ inputs\.seat_seed_protocol \|\| 'decorrelated-slots-v3' \}\}/);
  assert.doesNotMatch(content, /default: independent-slots-v2/);
});

test('source-locked fixed-campaign diagnostics use the same v3 default', () => {
  const content = workflow('aichi-source-locked-campaign.yml');
  manualOnly(content);
  const input = content.split('      seat_seed_protocol:\n')[1]
    .split('\npermissions:')[0];
  assert.match(input, /- independent-slots-v2/);
  assert.match(input, /- decorrelated-slots-v3/);
  assert.match(input, /default: decorrelated-slots-v3/);
  assert.match(content, /CAMPAIGN_SEED_PROTOCOL: \$\{\{ inputs\.seat_seed_protocol \|\| 'decorrelated-slots-v3' \}\}/);
});

test('both historical and new schedules retain different immutable identities', () => {
  const v2 = loadDefaultCampaign('independent-slots-v2');
  const v3 = loadDefaultCampaign('decorrelated-slots-v3');
  assert.equal(v2.schemaVersion, 2);
  assert.equal(v3.schemaVersion, 3);
  assert.notEqual(v2.planDigest, v3.planDigest);
  assert.notEqual(v2.trials[0].seed, v3.trials[0].seed);
  assert.deepEqual(v2.candidateRows, v3.candidateRows);
});
