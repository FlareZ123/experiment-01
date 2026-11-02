'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const original = require('./fixtures/agent47-frozen-rank6-native-v1-real-fields.json');
const {nativeRowStatus,auditFrozenNativeArchive} =
  require('../simulation/evaluation/agent47-frozen-v1-native-status-derived.cjs');

test('archived native v1 rows are all engine terminals although release labeled UNREPORTED',()=>{
  assert.equal(original.sourceRawOutputSha256,
    '0f03c717a86d2a70f922e5c08085830a22e6db7f08b42e83f62dd4b4643c2b89');
  assert.deepEqual(original.releaseDisposition.nativeStatusCounts,{UNREPORTED:4});
  const out=auditFrozenNativeArchive(original);
  assert.equal(out.nativeCompleted,true);
  assert.deepEqual(out.statuses,{NATIVE_TERMINAL:4});
  assert.equal(out.attempts.length,4);
  for(const attempt of out.attempts){
    assert.equal(attempt.reportedNativeStatus,'UNREPORTED');
    assert.equal(attempt.originalReportedEngineTerminal,null);
    assert.equal(attempt.observedEngineTerminal,true);
    assert.equal(attempt.nativeEndReason,'engine-game-end');
    assert.equal(attempt.competitiveGameQualified,false);
  }
  assert.equal(out.competitiveGameQualified,false);
  assert.equal(out.paperPaymentVerified,false);
  assert.equal(out.opponentContinuationVerified,false);
});

test('finite status classifier separates real native terminal, action cap and error',()=>{
  assert.equal(nativeRowStatus({
    finished:true,endReason:'engine-game-end',winner:1
  }).category,'NATIVE_TERMINAL');
  assert.equal(nativeRowStatus({
    finished:false,endReason:'action-limit',winner:null
  }).category,'ACTION_CAP');
  assert.equal(nativeRowStatus({
    status:'engine-physical-invalid',error:'card lost'
  }).category,'NATIVE_ERROR');
  assert.equal(nativeRowStatus({
    finished:true,endReason:'action-limit',winner:0
  }).category,'UNKNOWN');
  assert.equal(nativeRowStatus({
    finished:true,endReason:'engine-game-end',winner:null
  }).category,'UNKNOWN');
  assert.equal(nativeRowStatus({finished:false}).category,'UNKNOWN');
});

test('joins by registered trial ID regardless of native row order',()=>{
  const permuted=structuredClone(original);
  permuted.rawNativeResult.rows.reverse();
  const out=auditFrozenNativeArchive(permuted);
  assert.deepEqual(out.attempts.map(a=>a.trialId),
    original.releaseDisposition.attempts.map(a=>a.trialId));
  assert.deepEqual(out.statuses,{NATIVE_TERMINAL:4});
});

test('duplicated or absent native trial cannot become successful execution',()=>{
  const duplicate=structuredClone(original);
  duplicate.rawNativeResult.rows[1]=duplicate.rawNativeResult.rows[0];
  const result=auditFrozenNativeArchive(duplicate);
  assert.equal(result.nativeCompleted,false);
  assert.deepEqual(result.statuses,{UNKNOWN:2,NATIVE_TERMINAL:2});
  assert.equal(result.attempts[0].reason,'duplicate-native-trial');
  assert.equal(result.attempts[1].reason,'missing-native-trial');
  assert.equal(result.competitiveGameQualified,false);
});

test('missing registered source is explicit PRECHECK_FAILURE',()=>{
  const out=auditFrozenNativeArchive({releaseDisposition:{},rawNativeResult:{}});
  assert.equal(out.status,'PRECHECK_FAILURE');
  assert.equal(out.competitiveGameQualified,false);
});
