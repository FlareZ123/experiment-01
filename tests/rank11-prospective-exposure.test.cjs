'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  CANDIDATES,FROZEN_FILES,makeRank11ExposureFrame,verifyFrameDigest,
  auditRank11Exposure,freezeCurrentRank11Frame
}=require('../scripts/rank11-prospective-exposure.cjs');

const chars=['a','b','c'];
const hex=i=>chars[i].repeat(64);
const blobs=Object.fromEntries(FROZEN_FILES.map((file,i)=>[
  file,((i+1)%10).toString().repeat(40)
]));

/** @returns {object} Source-verification surrogate for the pure contract tests. */
function campaign(){
  return {
    seedProtocol:'decorrelated-slots-v3',
    pilotRanks:[1,6,11],planDigest:hex(0),fieldDigest:hex(1),
    repeats:1,
    candidateRows:CANDIDATES.map((id,i)=>({
      id,deckDigest:hex(i),provisionalEnglishProxy:i===1
    })),
    trials:CANDIDATES.flatMap((id,i)=>
      ['A','B'].map(candidateEngineSlot=>({
        rank:11,phase:'pilot',candidateId:id,candidateDigest:hex(i),
        opponentDigest:hex(2),candidateEngineSlot
      })))
  };
}
function frame(repeats=4){
  return makeRank11ExposureFrame(campaign(),{
    seedBase:20261018,repeats,fileBlobs:blobs
  });
}
/** @param {object} f @param {object} trial @param {object} options */
function observation(f,trial,options={}){
  const sourceFirst=options.sourceFirst!==false;
  const complete=options.complete===true;
  return {
    trialId:trial.trialId,seed:trial.seed,
    candidateDigest:trial.candidateDigest,
    opponentDigest:trial.opponentDigest,
    candidateEngineSlot:trial.candidateEngineSlot,
    observedPolicyProfile:f.policyProfile,
    firstTurnSlot:sourceFirst?trial.opponentEngineSeat:1-trial.opponentEngineSeat,
    verifiedByDrawLog:options.verified!==false,
    finished:options.finished===true,
    status:options.finished===true?'completed':'unfinished',
    sourcePolicyAudit:{
      sourceSeat:trial.opponentEngineSeat,
      opportunityDetected:complete,
      completeAtDecisionBoundary:complete,
      attemptedActions:complete?11:0
    },
    ...(complete ? {
      candidateResponse: {
        playerSlot:trial.candidateEngineSlot==='A'?0:1,
        turnBefore:2,
        legalStateTransitionWitness:options.legalResponse===true
      }
    }:{})
  };
}

test('registration is deterministic, seeded independently by seat and reused across fixed candidates',()=>{
  const f=frame(5),again=frame(5);
  assert.deepEqual(f,again);
  assert.equal(f.trials.length,20);
  assert.equal(f.seedProtocol,'decorrelated-slots-v3');
  assert.equal(f.rank11SourceDigest,hex(2));
  assert.ok(verifyFrameDigest(f));
  const seeds=new Set();
  for(let repeat=0;repeat<5;repeat++){
    const rows=f.trials.filter(row=>row.repeat===repeat);
    assert.equal(rows.length,4);
    const as=rows.filter(row=>row.candidateEngineSlot==='A');
    const bs=rows.filter(row=>row.candidateEngineSlot==='B');
    assert.equal(as[0].seed,as[1].seed);
    assert.equal(bs[0].seed,bs[1].seed);
    assert.notEqual(as[0].seed,bs[0].seed);
    seeds.add(as[0].seed);seeds.add(bs[0].seed);
  }
  assert.equal(seeds.size,10);
  assert.equal(f.candidateRows[1].provisionalEnglishProxy,true);
});

test('registration rejects absent source identity, policy fingerprint and tampering',()=>{
  const original=campaign();
  assert.throws(()=>makeRank11ExposureFrame(
    {...original,seedProtocol:'paired-slots-v1'},
    {seedBase:20261018,repeats:4,fileBlobs:blobs}),/verified source-locked/);
  assert.throws(()=>makeRank11ExposureFrame(
    {...original,candidateRows:[original.candidateRows[0]]},
    {seedBase:20261018,repeats:4,fileBlobs:blobs}),/Missing source-locked candidate/);
  assert.throws(()=>makeRank11ExposureFrame(original,{
    seedBase:20261018,repeats:4,fileBlobs:{}
  }),/pinned Git blob/);
  assert.throws(()=>makeRank11ExposureFrame(original,{
    seedBase:20261018,repeats:1,fileBlobs:blobs
  }),/Predeclare/);
  const f=frame();
  f.trials[0].seed++;
  assert.equal(verifyFrameDigest(f),false);
  assert.throws(()=>auditRank11Exposure(f,[]),/digest mismatch/);
});

test('missing and unverified trials stay visible in denominators',()=>{
  const f=frame(2);
  const [a,b]=f.trials;
  const rows=[
    observation(f,a,{complete:true}),
    observation(f,b,{verified:false})
  ];
  const report=auditRank11Exposure(f,rows);
  assert.equal(report.scheduled,8);
  assert.equal(report.received,2);
  assert.equal(report.fullyObserved,false);
  assert.equal(report.allCellsExposed,false);
  assert.equal(report.cells.reduce((sum,c)=>sum+c.missing,0),6);
  assert.equal(report.cells.reduce((sum,c)=>sum+c.unverifiedStart,0),1);
  assert.equal(report.cells.reduce((sum,c)=>sum+c.rank11First,0),1);
  assert.equal(report.cells.reduce((sum,c)=>sum+c.completedFirstTurnGarbodor,0),1);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.equal(report.attempts.length,8);
});

test('policy opportunities cannot appear when the source player did not start first',()=>{
  const f=frame(2),trial=f.trials[0];
  const invalid=observation(f,trial,{complete:true,sourceFirst:false});
  assert.throws(()=>auditRank11Exposure(f,[invalid]),/fired on second start/);
  const wrong=observation(f,trial);
  wrong.sourcePolicyAudit.sourceSeat=1-trial.opponentEngineSeat;
  assert.throws(()=>auditRank11Exposure(f,[wrong]),/wrong physical seat/);
  const unsupported=observation(f,trial,{complete:true});
  unsupported.sourcePolicyAudit.attemptedActions=10;
  assert.throws(()=>auditRank11Exposure(f,[unsupported]),/completion lacks/);
});

test('reject duplicated, unscheduled, altered-seed and policy-drift observations',()=>{
  const f=frame(2),x=observation(f,f.trials[0]);
  assert.throws(()=>auditRank11Exposure(f,[x,x]),/repeated trial/);
  assert.throws(()=>auditRank11Exposure(f,[{...x,trialId:'invented'}]),/Unknown/);
  assert.throws(()=>auditRank11Exposure(f,[{...x,seed:x.seed+1}]),/conflicts/);
  assert.throws(()=>auditRank11Exposure(f,[{
    ...x,observedPolicyProfile:'rank11-generic-legacy'
  }]),/conflicts/);
});

test('coverage requires both actual first-turn strata and a witnessed legal response in all four cells',()=>{
  const f=frame(4);
  const rows=f.trials.map(trial=>{
    const sourceFirst=trial.repeat<2;
    return observation(f,trial,{
      sourceFirst,complete:sourceFirst&&trial.repeat===0,
      legalResponse:sourceFirst&&trial.repeat===0,
      finished:true
    });
  });
  const pass=auditRank11Exposure(f,rows);
  assert.equal(pass.scheduled,16);
  assert.equal(pass.fullyObserved,true);
  assert.equal(pass.allCellsExposed,true);
  assert.ok(pass.cells.every(c=>c.rank11First===2 && c.rank11Second===2));
  assert.ok(pass.cells.every(c=>c.completedFirstTurnGarbodor===1));
  const negative=rows.map((row,i)=>
    i===0?{...row,candidateResponse:{...row.candidateResponse,
      legalStateTransitionWitness:false}}:row);
  const fail=auditRank11Exposure(f,negative);
  assert.equal(fail.allCellsExposed,false);
  assert.equal(fail.qualifiedCompetitiveGames,0);
});

test('the real repository campaign freezes two 60-card identities and all 64 prospects',()=>{
  const current=freezeCurrentRank11Frame();
  assert.equal(current.trials.length,64);
  assert.equal(current.candidateRows.length,2);
  assert.equal(current.sourceCampaignPlanDigest.length,64);
  assert.equal(current.rank11SourceDigest.length,64);
  assert.equal(current.engineRevision.length,40);
  assert.ok(verifyFrameDigest(current));
  assert.equal(new Set(current.trials.map(row=>row.trialId)).size,64);
  assert.deepEqual(current.trials.map(row=>row.candidateId).filter((_,i)=>i<4),
    ['champion-reference','champion-reference',
      'new-moon-lockbreaker-v1','new-moon-lockbreaker-v1']);
});
