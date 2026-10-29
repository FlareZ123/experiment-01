'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {verifyActiveEvolution} = require(
  '../simulation/twinleaf/agent39-active-boostshake-store-control.cjs');

for (const sourceSeat of [0, 1]) {
  test('pinned real Store: printed Active Trubbish Tool/Shake/Garbodor source seat ' + sourceSeat, () => {
    const receipt = verifyActiveEvolution(sourceSeat);
    assert.equal(receipt.sourceSeat, sourceSeat);
    assert.equal(receipt.active, 'Garbodor BKP');
    assert.equal(receipt.preservedTool, 'Float Stone BKT');
    assert.equal(receipt.sourceBenchSize, 5);
    assert.equal(receipt.abilityBlocked, true);
  });
}
