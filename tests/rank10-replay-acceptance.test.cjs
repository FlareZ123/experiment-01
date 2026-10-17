'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {requireCompleteRank10Replay} = require('../simulation/twinleaf/rank10-replay-acceptance.cjs');

/** @returns {object} */
function validReport() {
  return {
    schema:'rank10-archived-input-fresh-process-test-v1',
    controlsAndForksQualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false,
    findings:[
      {arm:'control',status:'complete-reconstructed-live-input-trace',
        verifiedDispatches:350,sourceActions:350,matchSummaryIdentical:true,
        graphVerifiedDispatches:350,storeDataGraphContract:'live-store-own-data-stats-clock-normalized-v2'},
      {arm:'alternate',status:'complete-reconstructed-live-input-trace',
        verifiedDispatches:235,sourceActions:235,matchSummaryIdentical:true,
        graphVerifiedDispatches:235,storeDataGraphContract:'live-store-own-data-stats-clock-normalized-v2'}
    ]
  };
}

test('accepts complete separately reconstructed source inputs with an unqualified verdict', () => {
  assert.deepEqual(requireCompleteRank10Replay(validReport()), [
    {arm:'control',dispatches:350},{arm:'alternate',dispatches:235}
  ]);
});

test('fails when an archived arm is blocked although the diagnostic process succeeded', () => {
  const report=validReport();
  report.findings[1]={arm:'alternate',status:'blocked',reason:'Zone digest drift',
    sourceActions:235,matchSummaryIdentical:false};
  assert.throws(()=>requireCompleteRank10Replay(report), /alternate replay is incomplete/);
});

test('fails on partial actions, changed result, empty replay, or bad provenance labels', () => {
  for(const mutation of [
    r=>{r.findings[0].verifiedDispatches=349;},
    r=>{r.findings[0].graphVerifiedDispatches=349;},
    r=>{delete r.findings[0].storeDataGraphContract;},
    r=>{r.findings[0].matchSummaryIdentical=false;},
    r=>{r.findings[0].verifiedDispatches=0;r.findings[0].sourceActions=0;},
    r=>{r.findings[1].arm='control';},
    r=>{r.findings.pop();},
    r=>{r.schema='unknown';},
    r=>{r.sourceReplayMechanicsVerified=true;},
    r=>{r.controlsAndForksQualifiedForCompetitiveInference=true;}
  ]) {
    const report=validReport();
    mutation(report);
    assert.throws(()=>requireCompleteRank10Replay(report));
  }
});
