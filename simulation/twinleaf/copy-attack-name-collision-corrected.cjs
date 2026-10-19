'use strict';

const assert = require('node:assert/strict');
const {probe} = require('./copy-attack-name-collision-source.cjs');
const {installCopyAttackSourceIdentityHook} =
  require('./copy-attack-source-identity-hook.cjs');

/** @returns {object} */
function run() {
  const raw = [probe('latios-first'),probe('pheromosa-first')];
  assert.deepEqual(raw.map(row=>row.observedDefenderDamage),[40,30]);
  const restore = installCopyAttackSourceIdentityHook();
  let corrected;
  try {
    corrected = [probe('latios-first'),probe('pheromosa-first')];
    assert.deepEqual(corrected.map(row=>row.observedDefenderDamage),[40,40]);
    assert.ok(corrected.every(row=>row.selectedPrinting==='Latios-EX ROS'));
    assert.ok(corrected.every(row=>row.blockedOtherSource));
  } finally {
    restore();
  }
  const restored = probe('pheromosa-first');
  assert.equal(restored.observedDefenderDamage,30,
    'Original engine semantics must return after restoring the local hook');
  return {
    schema:'perfection-exact-donor-reversible-hook-paired-contract-v1',
    raw:raw.map(row=>({order:row.order,damage:row.observedDefenderDamage})),
    corrected:corrected.map(row=>({order:row.order,damage:row.observedDefenderDamage})),
    restoredDamage:restored.observedDefenderDamage,
    selectedPrinting:'Latios-EX ROS',
    scope:'Staged Store; only optional research hook changes temporary prompt-source order',
    sourceGameQualified:false
  };
}
if (require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
