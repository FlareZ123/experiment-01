'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runSelectedIssue25V0}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

test('Issue25 selected v0 actually runs four real native historical arms on both seats',()=>{
  const {manifest,diagnostic}=runSelectedIssue25V0();
  console.log('AGENT36_ISSUE25_SELECTED_V0',JSON.stringify({
    manifest,diagnostic
  }));
  assert.equal(manifest.policyEntryPoint,
    'simulation/evaluation/agent36-issue25-selected-v0.cjs');
  assert.equal(manifest.releaseQualified,false);
  assert.equal(manifest.competitiveGamesQualified,0);
  assert.equal(diagnostic.registered.length,4);
  assert.equal(diagnostic.attemptedRows.length,4);
  assert.equal(diagnostic.allRegisteredAttemptsReturned,true);
  assert.equal(diagnostic.rawDecoderExecuted,false);
  assert.equal(diagnostic.competitiveGamesQualified,0);
  assert.ok(diagnostic.attemptedRows.every(row=>
    ['engine-error','returned-unqualified','native-terminal-unqualified',
      'engine-physical-invalid'].includes(row.status)));
  assert.equal(diagnostic.audit.agent50AllEligibleInitialBasics?.proposals,8);
  assert.ok(diagnostic.audit.publicMulliganAndWaitAcks?.waitAcks>=10);
});
