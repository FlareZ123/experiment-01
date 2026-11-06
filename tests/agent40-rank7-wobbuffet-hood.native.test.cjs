'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  PIN, VERSION, probe, run
} = require('../simulation/twinleaf/agent40-rank7-wobbuffet-hood-native.cjs');

test('actual pinned Store, both source seats, full Wobbuffet/Hood matrix', () => {
  const result = run();
  assert.equal(result.pin, PIN);
  assert.equal(result.version, VERSION);
  assert.equal(result.attempted, 8);
  assert.equal(result.naturalSourceDeals, 0);
  assert.equal(result.qualifiedCompetitiveGames, 0);
  assert.equal(result.rows.length, 8);
  assert.equal(result.paperParityCount, 8,
    'Native Store disagreement with conditional paper expectation: ' +
      JSON.stringify(result.rows.filter(x => !x.paperParity)));
  for (const row of result.rows) {
    assert.equal(row.candidatePhysicalCards, 60);
    assert.equal(row.originalPhysicalCards, 60);
    assert.equal(row.conditionalStagedBoard, true);
    assert.equal(row.paperParity, true);
    if (row.expectedItemRejected) {
      assert.equal(row.nativeItemError, 'CANNOT_PLAY_THIS_CARD');
      assert.equal(row.nativeItemStillHeld, true);
    } else {
      assert.equal(row.nativeItemError, null);
      assert.equal(row.nativeItemRejected, false);
      assert.equal(row.nativeItemStillHeld, false);
    }
  }
  console.log('AGENT40_WOBBUFFET_HOOD_NATIVE', JSON.stringify(result));
});

test('narrow opposite orientation check, protected Vileplume keeps Item lock', () => {
  for (const seat of [0, 1]) {
    const unprotected = probe({ seat, wobbuffetActive: true, hood: false });
    const protectedVileplume = probe({
      seat, wobbuffetActive: true, hood: true
    });
    assert.equal(unprotected.expectedVileplumeAbilityBlocked, true);
    assert.equal(unprotected.expectedItemRejected, false);
    assert.equal(protectedVileplume.expectedVileplumeAbilityBlocked, false);
    assert.equal(protectedVileplume.expectedItemRejected, true);
    assert.equal(unprotected.paperParity, true);
    assert.equal(protectedVileplume.paperParity, true);
  }
});
