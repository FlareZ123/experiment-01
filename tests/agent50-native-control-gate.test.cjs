'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyNativeHistoricalControls}=require(
  '../simulation/evaluation/agent50-native-control-gate.cjs');

function fixture(){
  return {attempts:4,independentlyQualifiedCompetitiveGames:0,
    rows:[0,1,2,3].map(i=>({
      trialId:'trial-'+i,
      classification:i===0?'authentic-tape-same-world-parity-only':
        'authentic-tape-same-world-parity-veto',
      samePlayback:true,
      actualExecutionAuthenticated:true,
      noninterferenceVerified:true
    }))};
}

test('one valid parity and three genuine replay vetoes preserve all four controls',()=>{
  assert.deepEqual(verifyNativeHistoricalControls(fixture()),
    {authenticatedTrials:4,competitiveGames:0});
});

test('four unexecuted control errors cannot pass a workflow status gate',()=>{
  const f=fixture();
  for(const row of f.rows){
    row.classification='control-engine-error';
    delete row.samePlayback;
    delete row.actualExecutionAuthenticated;
    delete row.noninterferenceVerified;
  }
  assert.throws(()=>verifyNativeHistoricalControls(f),
    /Native original-Store control\/probe failed: trial-0/);
});

test('a failed probe, partial instrumentation or inflated competitive count is rejected',()=>{
  const a=fixture();
  a.rows[1].classification='probe-engine-or-audit-error';
  assert.throws(()=>verifyNativeHistoricalControls(a),/trial-1/);
  const b=fixture();
  b.rows[2].noninterferenceVerified=false;
  assert.throws(()=>verifyNativeHistoricalControls(b),/trial-2/);
  const c=fixture();
  c.independentlyQualifiedCompetitiveGames=1;
  assert.throws(()=>verifyNativeHistoricalControls(c),
    /Historical development controls cannot certify match wins/);
});
