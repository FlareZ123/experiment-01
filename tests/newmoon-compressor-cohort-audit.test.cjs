'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditCohort}=require('../scripts/newmoon-compressor-cohort-audit.cjs');
const {scheduledRepeats}=require(
  '../simulation/twinleaf/newmoon-payload-partition-plan.cjs');

function packets(){
  return Array.from({length:4},(_,partitionIndex)=>{
    const repeats=scheduledRepeats(partitionIndex);
    const observations={
      nativeOrCopiedAttacks:[],compressorPlays:[],
      payloadDiscards:[],finished:false,actualStartingSeat:partitionIndex%2,
      rootActions:200,turns:30,prizesRemaining:[6,6],policy:'fixed'
    };
    return {
      schema:'newmoon-rank11-prospective-compressor-attack-source-v1',
      printedSourceRank:11,candidateSeat:1,sourceSeat:0,
      seedBase:20261018,repeats:12,
      candidatePrintHash:'fixed-source',engineRevision:'fixed-engine',
      seedProtocol:'frozen',policyComparison:'frozen',
      partitionIndex,partitionCount:4,scheduledRepeats:repeats,
      retainedAttemptCount:3,fullCohortPresent:false,
      rows:repeats.map(repeat=>({
        repeat,seed:repeat+100,qualifiedForCompetitiveInference:false,
        control:{ok:true,observations:{...observations}},
        payload:{ok:true,observations:{...observations}}
      }))
    };
  });
}

test('four immutable partitions produce one verified twelve-pair summary',()=>{
  const result=auditCohort(packets().reverse());
  assert.equal(result.exactCoverageVerified,true);
  assert.equal(result.pairedOriginalDeals,12);
  assert.equal(result.successfulArms,24);
  assert.equal(result.successfulPairs,12);
  assert.deepEqual(result.pairedActualStartingSeats,[6,6]);
  assert.equal(result.actionCapped,24);
  assert.equal(result.qualifiedCompetitiveGames,0);
});

test('preserve real engine failure as one failed arm in its originally assigned repeat',()=>{
  const p=packets();
  p[1].rows[0].payload={ok:false,error:'actual failing Store'};
  const result=auditCohort(p);
  assert.equal(result.failedArms,1);
  assert.equal(result.successfulPairs,11);
  assert.equal(result.rows[3].payload.error,'actual failing Store');
});

test('reject skipped rows, duplicate partitions and changed candidate identity',()=>{
  const p=packets();
  p[2].rows.pop();
  assert.throws(()=>auditCohort(p),/3|rows|repeat/);
  const duplicate=packets();
  duplicate[3]=duplicate[0];
  assert.throws(()=>auditCohort(duplicate),/partitionIndex/);
  const changed=packets();
  changed[3].candidatePrintHash='another deck';
  assert.throws(()=>auditCohort(changed),/candidatePrintHash/);
});

test('GX selections are never reported as confirmed Battle Compressor discards',()=>{
  const p=packets();
  p[0].rows[0].payload.observations.payloadDiscards=[
    {ordinal:7,turn:0,cards:['Trevenant & Dusknoir-GX SMP']}];
  const result=auditCohort(p);
  assert.equal(result.unattributedGxSelections,1);
  assert.equal(result.payloadCompressorActions,0);
});
