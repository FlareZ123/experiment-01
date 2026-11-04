'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runSymmetricIssue25V1}=
  require('../simulation/evaluation/agent36-issue25-symmetric-v1.cjs');

test('Issue25 v1 selected four original arms, same source-independent two-seat hooks',()=>{
  const {manifest,diagnostic}=runSymmetricIssue25V1();
  console.log('AGENT36_ISSUE25_SYMMETRIC_V1',JSON.stringify({manifest,diagnostic}));
  assert.equal(manifest.sourceIndependentCommonPolicy,true);
  assert.equal(manifest.actualRunnerConfirmedOption,true);
  assert.equal(manifest.originalSourceRankScriptsDisabledByOptIn,true);
  assert.equal(diagnostic.reportedSourceIndependentOptIn,true);
  assert.equal(diagnostic.registered.length,4);
  assert.equal(diagnostic.attemptedRows.length,4);
  assert.equal(diagnostic.allRegisteredAttemptsReturned,true);
  assert.equal(diagnostic.rawDecoderExecuted,false);
  assert.equal(manifest.releaseQualified,false);
  assert.equal(diagnostic.competitiveGamesQualified,0);
  assert.ok(manifest.resolvedSourceAndPolicyHashes.every(entry=>
    /^[a-f0-9]{64}$/.test(entry.sha256)));
});
