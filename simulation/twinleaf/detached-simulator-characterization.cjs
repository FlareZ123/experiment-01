'use strict';

const assert = require('node:assert/strict');
const {auditSimulatorCardIsolation} =
  require('./simulator-card-isolation-audit.cjs');
const {installDetachedSimulatorHook} =
  require('./detached-simulator-hook.cjs');

/**
 * Reproduce the aliased-card baseline and test an opt-in full-graph clone
 * against an identical independently staged board and attack.
 *
 * @returns {object} Two conditioned engine probes, not match outcomes.
 */
function characterizeDetachedSimulator() {
  const baseline = auditSimulatorCardIsolation();
  const restore = installDetachedSimulatorHook();
  let detached;
  try {
    detached = auditSimulatorCardIsolation();
  } finally {
    restore();
  }
  assert.equal(baseline.clonedReferenceIdentical, true);
  assert.equal(baseline.liveCardFieldChanged, true);
  assert.equal(detached.clonedReferenceIdentical, false,
    'Detached simulator must use independent Card objects');
  assert.equal(detached.simulatedBoardDamage, baseline.simulatedBoardDamage,
    'Detached simulator must preserve actual Tool attack damage');
  assert.equal(detached.liveCardFieldChanged, false,
    'Detached simulator must not mutate the source Card field');
  assert.equal(detached.liveBoardDamageChanged, false);
  return {
    experiment: 'detached-simulator-real-effect-characterization-v1',
    engineRevision: baseline.engineRevision,
    baseline: {
      cloneSharesCard: baseline.clonedReferenceIdentical,
      simulatedDamage: baseline.simulatedBoardDamage,
      liveCardFieldChanged: baseline.liveCardFieldChanged,
      liveBoardDamageChanged: baseline.liveBoardDamageChanged
    },
    optInDetached: {
      cloneSharesCard: detached.clonedReferenceIdentical,
      simulatedDamage: detached.simulatedBoardDamage,
      liveCardFieldChanged: detached.liveCardFieldChanged,
      liveBoardDamageChanged: detached.liveBoardDamageChanged
    },
    verifiedForThisAttack: true,
    caveat: 'Only one staged Tool attack, without validating all game mechanics, bot decision ordering, or competitive match outcomes.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(characterizeDetachedSimulator(), null, 2) + '\n');
}
module.exports = {characterizeDetachedSimulator};
