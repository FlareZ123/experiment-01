'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {sourcePolicyForOrdinal}=require('../simulation/twinleaf/rank10-hidden-order-live-probe.cjs');

test('archived root uses historical v3 and turn 27 uses current v4',()=>{
  assert.deepEqual(sourcePolicyForOrdinal(),{
    doubleDragonRecovery:true,doubleDragonArchiveV3:false
  });
  assert.deepEqual(sourcePolicyForOrdinal(215),{
    doubleDragonRecovery:true,doubleDragonArchiveV3:true
  });
  assert.throws(()=>sourcePolicyForOrdinal(216));
});
