'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,BLOB}=
  require('../simulation/evaluation/agent42-v3-known-witness-reply-v2.cjs');
test('two-candidate v2 fixes real source runner group invariant in sealed registration',()=>{
 const {r,original}=preflight();
 assert.equal(BLOB,'e1f283b88dd691c40d18271b286d0912d93341b6');
 assert.equal(r.expectedAttempts,6);
 assert.equal(r.trials.length,2);
 assert.deepEqual(r.trials.map(t=>t.candidateId),
  ['champion-reference','new-moon-lockbreaker-v1']);
 assert.equal(r.trials[0].seed,r.trials[1].seed);
 assert.equal(r.trials[0].candidateSlot,'A');
 assert.equal(r.sourcePrintedSixtyUnchanged,true);
 assert.equal(r.candidatePrintedSixtiesUnchanged,true);
 assert.equal(original.selectedV3CommonPolicy.nativeRootActionLimit,180);
 assert.equal(r.extendedNativeActionCap,240);
});
