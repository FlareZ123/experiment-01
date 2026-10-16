'use strict';

const assert = require('node:assert/strict');
const {characterizeToolAttackPolicy} =
  require('./tm-attack-policy-characterization.cjs');
const {replayBunnelbyTmBot} =
  require('./bunnelby-tm-policy-replay.cjs');
const {inspectRaichuStadiumPolicy} =
  require('./temple-raichu-policy-characterization.cjs');
const {installDetachedSimulatorHook} =
  require('./detached-simulator-hook.cjs');

/**
 * A small set of existing source-card, real pinned-engine policy fixtures.
 * These independently assert their intended actions and prompt resolutions.
 */
const FIXTURES = Object.freeze([
  {name: 'tool-attacks-legal-reducer-and-bot', run: characterizeToolAttackPolicy},
  {name: 'bunnelby-double-tm-evolution-line', run: replayBunnelbyTmBot},
  {name: 'raichu-temple-stadium-response', run: inspectRaichuStadiumPolicy}
]);

/**
 * Exercise existing pinned policy reducers both before and during detachment.
 * Return exact equality diagnostics; a mismatch is recorded as sensitivity
 * rather than silently interpreted as proof of better or worse play.
 *
 * @returns {object}
 */
function compareExistingPolicyFixtures() {
  const rows = [];
  for (const fixture of FIXTURES) {
    const baseline = fixture.run();
    const restore = installDetachedSimulatorHook();
    let detached;
    try {
      detached = fixture.run();
    } finally {
      restore();
    }
    rows.push({
      fixture: fixture.name,
      original: baseline,
      detached,
      matched: JSON.stringify(baseline) === JSON.stringify(detached)
    });
  }
  assert.equal(rows.length, FIXTURES.length);
  return {
    experiment: 'detached-simulator-existing-fixture-compatibility-v1',
    engineRevision: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fixtureCount: rows.length,
    matchedCount: rows.filter(row => row.matched).length,
    rows,
    caveat: 'Each source-card fixture exercises limited conditioned state and its own assertions. Equality in three fixtures does not certify all card behaviors or skilled game play.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(compareExistingPolicyFixtures(), null, 2) + '\n');
}
module.exports = {FIXTURES,compareExistingPolicyFixtures};
