'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {executeRank11ExposurePartition}=
  require('../simulation/evaluation/rank11-prospective-exposure-run.cjs');
const registration=require('../results/aichi-2026/registrations/rank11-prospective-exposure-v1-20261018.json');
const hash=rows=>createHash('sha256').update(JSON.stringify(rows)).digest('hex');
const rev='twinleafgg/'+registration.engineRevision;
function prepare(candidate){
  return {
    engineRevision:registration.engineRevision,
    candidate:{cards:Array(60).fill(candidate.id==='champion-reference'?'C':'N')},
    opponents:[{rank:11,status:'ready',cards:Array(60).fill('O')}]
  };
}
function game(request){
  const rank11First=request.seed%2===0;
  const firstTurnSlot=rank11First?request.rank11SourceSeat:1-request.rank11SourceSeat;
  return {
    researchPolicyProfile:registration.policyProfile,
    seed:request.seed,engine:rev,
    deckHashes:[hash(request.deckA),hash(request.deckB)],
    firstTurnSlot,verifiedByDrawLog:true,
    rank11AutonomousPolicy:{
      sourceSeat:request.rank11SourceSeat,
      opportunityDetected:false,
      attemptedActions:0,
      completeAtDecisionBoundary:false
    },
    decisionTrace:[],actions:90,turns:8,finished:false
  };
}
test('opt-in actual-engine runner binds all 16 unchanged precommitted source rows',()=>{
  const report=executeRank11ExposurePartition({
    partition:0,maxActions:90,resolveCandidate:prepare,play:game
  });
  assert.equal(report.observedTrialCount,16);
  assert.equal(report.totalRegisteredTrialCount,64);
  assert.equal(report.fixedRegistrationSha256,registration.frameSha256);
  assert.equal(report.audit.scheduled,64);
  assert.equal(report.audit.received,16);
  assert.equal(report.audit.fullyObserved,false);
  assert.equal(report.audit.qualifiedCompetitiveGames,0);
  assert.equal(report.actionSamples.length,16);
  assert.equal(new Set(report.observations.map(o=>o.trialId)).size,16);
  assert.ok(report.observations.every(o=>o.verifiedByDrawLog));
  assert.deepEqual(new Set(report.observations.map(o=>o.candidateEngineSlot)),
    new Set(['A','B']));
});

test('an engine exception retains the exact trial in the denominator',()=>{
  let n=0;
  const report=executeRank11ExposurePartition({
    partition:1,maxActions:60,resolveCandidate:prepare,
    play(request){
      n++;
      if(n===1)throw Error('constructed simulator failure');
      return game(request);
    }
  });
  assert.equal(n,16);
  assert.equal(report.observations.length,16);
  assert.equal(report.observations[0].status,'engine-exception');
  assert.ok(report.observations[0].error.includes('constructed simulator failure'));
  assert.equal(report.audit.received,16);
  assert.equal(report.audit.cells.reduce((s,c)=>s+c.unverifiedStart,0),1);
  assert.equal(report.audit.qualifiedCompetitiveGames,0);
});

test('invalid experiment partitions fail before execution',()=>{
  assert.throws(()=>executeRank11ExposurePartition({
    partition:4,resolveCandidate:prepare,play:game
  }),/predeclared partition/);
  assert.throws(()=>executeRank11ExposurePartition({
    partition:0,maxActions:0,resolveCandidate:prepare,play:game
  }),/predeclared partition/);
});
