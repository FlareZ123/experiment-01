'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {auditIronThornsGate} = require('../scripts/aichi_iron_thorns_gate_lock.cjs');

test('three published Aichi Iron Thorns lists all force active Initialization from setup', () => {
  const evidence = auditIronThornsGate();
  assert.equal(evidence.championRank, 1);
  assert.equal(evidence.fieldPlacements, 32);
  assert.deepEqual(evidence.affectedRanks, [6, 24, 29]);
  assert.equal(evidence.observedExactLists.length, 3);
  for (const opponent of evidence.observedExactLists) {
    assert.equal(opponent.gateBlockedWhileInitializationActive, true);
    assert.equal(opponent.basicCopies, 4);
    assert.deepEqual(opponent.possibleStartingActive, ['Iron Thorns ex']);
  }
  console.log(JSON.stringify(evidence, null, 2));
});
