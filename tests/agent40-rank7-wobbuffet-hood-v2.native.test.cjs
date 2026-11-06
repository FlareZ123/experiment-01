'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { PIN, VERSION, run } =
  require('../simulation/twinleaf/agent40-rank7-wobbuffet-hood-native-v2.cjs');

test('corrected authentic original rank7 staged Nest Ball pays and resolves under source Wobbuffet', () => {
  const result = run();
  assert.equal(result.pin, PIN);
  assert.equal(result.version, VERSION);
  assert.equal(result.attempted, 10);
  assert.equal(result.qualifiedCompetitiveGames, 0);
  assert.equal(result.parity, 10,
    'Corrected native source paper parity failure: ' +
    JSON.stringify(result.rows.filter(row => !row.paperParity)));
  for (const row of result.rows) {
    assert.equal(row.emptyBefore, 4);
    assert.equal(row.sourcePhysical, 60);
    assert.equal(row.opponentPhysical, 60);
    assert.equal(row.paperParity, true);
    assert.equal(row.nativeAbilityBlocked, row.expectedAbilityBlocked);
    if (row.paperItemBlocked) {
      assert.equal(row.rootError, 'CANNOT_PLAY_THIS_CARD');
      assert.equal(row.rootHadPrompt, false);
      assert.equal(row.itemHeldAfter, true);
      assert.equal(row.itemDiscarded, false);
      assert.equal(row.movedBasic, false);
    } else {
      assert.equal(row.rootError, null);
      assert.equal(row.rootHadPrompt, true);
      assert.equal(row.rootItemInPlayZone, true);
      assert.equal(row.rootItemHeld, false);
      assert.equal(row.settlementError, null);
      assert.equal(row.choice, 'Regirock XYP');
      assert.equal(row.movedBasic, true);
      assert.equal(row.itemDiscarded, true);
      assert.equal(row.itemHeldAfter, false);
      assert.equal(row.remainingPrompts, 0);
    }
  }
  console.log('AGENT40_WOBBUFFET_HOOD_CORRECTED_NATIVE', JSON.stringify(result));
});
