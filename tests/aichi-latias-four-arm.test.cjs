'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {firstDifference,recordSummary}=
  require('../simulation/evaluation/aichi-latias-four-arm.cjs');

/** @param {object[]} events @param {string} id */
function record(events,id='pilot:10:0:temple-v1:A') {
  return {
    trialId:id,status:'completed-engine-game',seed:42,
    candidateDigest:'candidate',opponentDigest:'opponent',
    candidateAttacks:events.filter(e=>e.action==='AttackAction').length,
    opponentAttacks:0,
    traceSummary:{
      chronologicalActionTrace:events,
      capturedMeaningfulActions:events.length,
      chronologicalActionTraceSha256:'sample',
      prizesRemaining:[6,6],finalState:[]
    }
  };
}

test('first divergence detects exactly changed original policy decision',()=>{
  const shared=[{actionOrdinal:1,turnBefore:1,playerSlot:0,action:'PlayCardAction',card:'Quick Ball'}];
  const left=record([...shared,{actionOrdinal:2,turnBefore:6,playerSlot:0,action:'PlayCardAction',card:'Psychic Energy',optionSelection:{target:'Bench Tapu Lele-GX'}}]);
  const right=record([...shared,{actionOrdinal:2,turnBefore:6,playerSlot:0,action:'PlayCardAction',card:'Psychic Energy',optionSelection:{target:'Active Latias ex'}}]);
  const delta=firstDifference(left,right);
  assert.equal(delta.status,'diverged');
  assert.equal(delta.index,1);
  assert.equal(delta.first.card,'Psychic Energy');
  assert.equal(delta.second.optionSelection.target,'Active Latias ex');
  assert.deepEqual(delta.lengths,[2,2]);
});

test('identical action traces are reported without game-strength inference',()=>{
  const events=[{actionOrdinal:1,turnBefore:1,action:'PassTurnAction'}];
  assert.equal(firstDifference(record(events),record(events)).status,
    'identical-captured-actions');
  assert.equal(firstDifference(record(events),record([])).status,'different-length');
  const summary=recordSummary(record(events));
  assert.deepEqual(summary.prizesByPhysicalSeat,[6,6]);
  assert.equal(summary.traceLength,1);
  assert.equal(summary.candidateAttacks,0);
});
