'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyNativeBoundedContrast}=
  require('../simulation/evaluation/agent23-native-hidden-contrast-gate.cjs');

function scan({eligible=4,success=2,failed=0,zone='deck',swapSize=2}={}){
  const attempted=success+failed;
  return {
    targetZone:zone,swapSize,eligibleExchangePaths:eligible,
    attemptedExchangePaths:attempted,successfulExchangePaths:success,
    failedExchangePaths:failed,actionReversals:0,
    eligibleDistinctOpponentHandCompositions:eligible,
    testedDistinctOpponentHandCompositions:attempted,
    successfulDistinctOpponentHandCompositions:success,
    cases:Array.from({length:attempted},(_,i)=>({executable:i<success})),
    sourceRootUnchanged:true,baselineReplayStable:true,
    contrastExecutable:success>0&&failed===0,error:null
  };
}

function packet(scans=Array.from({length:4},()=>scan())){
  return {
    attempts:4,independentlyQualifiedCompetitiveGames:0,
    rows:scans.map((s,i)=>({
      trialId:'historical-'+i,samePlayback:true,
      actualExecutionAuthenticated:true,noninterferenceVerified:true,
      classification:'development-only',
      diagnostic:s===null?{}:{nativeOpponentHiddenHandContrast:s}
    }))
  };
}
const expected={zone:'deck',swapSize:2};

test('genuine four-arm bounded native playback receives a developmental receipt',()=>{
  const result=verifyNativeBoundedContrast(packet(),expected);
  assert.equal(result.authenticatedHistoricalArms,4);
  assert.equal(result.attempted,8);
  assert.equal(result.successful,8);
  assert.equal(result.failed,0);
  assert.equal(result.successfulDistinctHandCompositions,8);
  assert.equal(result.competitiveGameQualified,false);
});

test('explicit no-opportunities strata remain visible without fabricating actions',()=>{
  const noOpportunity=scan({eligible:0,success:0});
  const result=verifyNativeBoundedContrast(packet([
    scan(),noOpportunity,noOpportunity,noOpportunity
  ]),expected);
  assert.equal(result.successful,2);
});

test('old native TDZ bug cannot pass as zero-action-reversal evidence',()=>{
  const broken=scan({eligible:4,success:0,failed:4});
  broken.error="Cannot access 'fingerprint' before initialization";
  const all=packet([broken,broken,broken,broken]);
  assert.throws(()=>verifyNativeBoundedContrast(all,expected),
    /fingerprint|bounded native playback failures/);
});

test('all four no-opportunities is a declared unexercised CI error',()=>{
  const empty=scan({eligible:0,success:0});
  assert.throws(()=>verifyNativeBoundedContrast(
    packet([empty,empty,empty,empty]),expected),
  /No bounded native concealed-world comparison/);
});

test('missing report, altered root and inconsistent counters veto CI',()=>{
  const original=packet();
  original.rows[0].diagnostic={};
  assert.throws(()=>verifyNativeBoundedContrast(original,expected),
    /Missing native concealed-world report/);
  const changed=packet();
  changed.rows[1].diagnostic.nativeOpponentHiddenHandContrast
    .sourceRootUnchanged=false;
  assert.throws(()=>verifyNativeBoundedContrast(changed,expected));
  const malformed=packet();
  malformed.rows[0].diagnostic.nativeOpponentHiddenHandContrast
    .successfulExchangePaths=3;
  assert.throws(()=>verifyNativeBoundedContrast(malformed,expected));
});

test('a mode mismatch cannot reuse a success receipt from a different zone',()=>{
  assert.throws(()=>verifyNativeBoundedContrast(packet(),
    {zone:'prizes',swapSize:2}));
  assert.throws(()=>verifyNativeBoundedContrast(packet(),
    {zone:'deck',swapSize:1}));
});
