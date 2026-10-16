'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {auditK0BunnelbyDetachedSampling}=
  require('../simulation/twinleaf/k0-detached-bunnelby-audit.cjs');

test('real pinned Store K0-different Prize partitions yield the same conditional score',()=>{
  const result=auditK0BunnelbyDetachedSampling();
  assert.deepEqual(result.physicallyHiddenTarget,[true,false]);
  assert.equal(result.pairedConditionalScores.length,2);
  assert.equal(result.pairedConditionalScores[0],result.pairedConditionalScores[1]);
  assert.equal(result.exactPublicStateMatch,true);
  assert.equal(result.sourceZonesPreserved,true);
});
