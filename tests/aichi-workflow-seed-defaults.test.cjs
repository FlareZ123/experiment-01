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

test('canonical manual Actions dispatcher stays within 25 inputs with packed Agent41 modes',()=>{
  const content=workflow('aichi-source-locked-campaign.yml');
  manualOnly(content);
  const inputs=content.split('    inputs:\n')[1].split('\npermissions:')[0];
  const declarations=inputs.match(/^      [a-z][a-z0-9_]*:/gm)||[];
  assert.equal(declarations.length,25,
    'GitHub workflow_dispatch allows no more than 25 named inputs');
  assert.ok(declarations.includes('      agent41_dev_options:'));
  for(const legacy of [
    'agent41_bilateral_mandatory_options',
    'agent41_bilateral_native_pressure',
    'agent41_bilateral_sourcefirst_retrospective',
    'agent41_bilateral_late_compressor',
    'agent41_crossrank_partition'
  ]){
    assert.equal(declarations.includes('      '+legacy+':'),false);
  }
  for(const [token,env] of [
    ['mandatory-options','AGENT41_MANDATORY_OPTION_DEV'],
    ['native-pressure','AGENT41_NATIVE_PRESSURE_DEV'],
    ['sourcefirst-retro','AGENT41_SOURCEFIRST_RETRO_DEV'],
    ['late-compressor','AGENT5_COMPR_LATE14_DEV'],
    ['partition1','AGENT41_PARTITION']
  ]){
    const declaration=content.split('          '+env+': ')[1]?.split('\n')[0];
    assert.ok(declaration?.includes(
      "contains(format(',{0},', inputs.agent41_dev_options)"),
      'Expected packed input expression for '+env);
    assert.ok(declaration?.includes("',"+token+",'"),
      'Expected comma-delimited option token for '+env);
  }
});
