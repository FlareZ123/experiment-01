'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {HELD_ITEM,runAudit}=
  require('../simulation/twinleaf/agent40-natural-stoutland-owner-item.cjs');
const {TARGET,ORIGINAL_HAND,ORIGINAL_LEDGER_SHA256}=
  require('../simulation/twinleaf/agent40-natural-sentinel-owner-carmine.cjs');

test('natural source Item probe is a separate observed hand printing',()=>{
  assert.equal(HELD_ITEM,'Mysterious Treasure FLI');
  assert.notEqual(HELD_ITEM,TARGET);
  assert.ok(ORIGINAL_HAND.includes(HELD_ITEM));
  assert.match(ORIGINAL_LEDGER_SHA256,/^[0-9a-f]{64}$/);
  assert.equal(typeof runAudit,'function');
});
