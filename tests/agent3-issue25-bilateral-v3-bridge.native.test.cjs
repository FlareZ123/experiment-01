'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {runNightWatchFutureSightIssue25V3}=
  require('../simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs');
const {reconcileRegisteredAttempts}=
  require('../simulation/evaluation/agent3-registered-attempt-reconciliation.cjs');

test('frozen 48-root v3 exact attack owners and v1 shared two-seat resources',()=>{
  const out=runNightWatchFutureSightIssue25V3({
    runner:options=>runDevelopment({
      ...options,sourceIndependentCommonPolicy:true
    })
  });
  const rows=out.rawDevelopment?.rows??[];
  const expected=out.diagnostic.registered;
  const admission=reconcileRegisteredAttempts(expected,rows);
  const receipts=rows.map(row=>({
    id:row.trial?.id??row.id,
    status:row.status??(row.finished===false?'nonterminal-unqualified':'unknown'),
    rootCount:row.nativeRootActionCount??row.rootActionCount??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    resourceVersion:row.policyAudit?.twoSeatVersion??null,
    installedSeats:row.policyAudit?.installedPhysicalSeats??null
  }));
  const summary={
    schema:'agent3-issue25-bilateral-v3-bridge-native-v1',
    fourRegistered:admission.exactlyReconciled,
    optedIn:out.rawDevelopment?.sourceIndependentCommonPolicyOptIn??null,
    vendor:out.manifest.runtimeGitAttestationStatus,
    rawStateDecoderExecuted:out.diagnostic.rawDecoderExecuted,
    preservedSourceDeals:receipts.filter(x=>x.sourceDealFingerprint).length,
    verifiedFirstTurns:receipts.filter(x=>x.verifiedFirstTurn===true).length,
    resourceRows:receipts.filter(x=>x.resourceVersion).length,
    installedPhysicalSeats:receipts.map(x=>x.installedSeats),
    nightWatch:out.diagnostic.sourceStampedNightWatch,
    futureSight:out.diagnostic.sourceStampedFutureSight,
    competitiveQualified:false
  };
  console.log('AGENT3_ISSUE25_BILATERAL_V3_BRIDGE',
    JSON.stringify({summary,receipts}));
  assert.equal(admission.exactlyReconciled,true);
  assert.equal(expected.length,4);
  assert.equal(out.rawDevelopment.sourceIndependentCommonPolicyOptIn,true);
  assert.equal(out.manifest.runtimeGitAttestationStatus,'VERIFIED');
  assert.equal(out.diagnostic.rawDecoderExecuted,false);
  assert.equal(summary.preservedSourceDeals,4);
  assert.equal(summary.verifiedFirstTurns,4);
  assert.equal(out.manifest.releaseQualified,false);
  assert.equal(out.diagnostic.competitiveGamesQualified,0);
});
