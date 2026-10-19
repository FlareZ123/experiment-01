'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const frame=
  require('../results/aichi-2026/registrations/rank11-prospective-exposure-v1-20261018.json');
const {auditRank11Exposure}=require('../scripts/rank11-prospective-exposure.cjs');
const {ARCHIVES,auditCompleteRank11}=
  require('../scripts/rank11-prospective-complete-census.cjs');

/** @param {object} trial */
function observation(trial){
  const sourceSeat=trial.opponentEngineSeat;
  return {
    trialId:trial.trialId,seed:trial.seed,
    candidateDigest:trial.candidateDigest,
    opponentDigest:trial.opponentDigest,
    candidateEngineSlot:trial.candidateEngineSlot,
    observedPolicyProfile:frame.policyProfile,
    finished:false,status:'action-capped',
    firstTurnSlot:trial.seed%2===0?sourceSeat:1-sourceSeat,
    verifiedByDrawLog:true,
    sourcePolicyAudit:{sourceSeat,opportunityDetected:false,
      attemptedActions:0,completeAtDecisionBoundary:false},
    candidateResponse:{playerSlot:1-sourceSeat,turnBefore:2,
      legalStateTransitionWitness:false}
  };
}

/** @returns {object[]} */
function fixture(){
  return ARCHIVES.map(({partition})=>{
    const rows=frame.trials.filter(t=>Math.floor(t.repeat/4)===partition)
      .map(observation);
    const audit=auditRank11Exposure(frame,rows);
    return {
      executedPartition:partition,partitionRange:[4*partition,4*partition+3],
      engineRevision:frame.engineRevision,
      fixedRegistrationSha256:frame.frameSha256,
      phase:'diagnostic-only',independentlyQualifiedCompetitiveGames:0,
      totalRegisteredTrialCount:64,observedTrialCount:16,
      actionCapPerTrial:90,observations:rows,audit,
      actionSamples:rows.map(x=>({trialId:x.trialId}))
    };
  });
}

test('full cohort proves all 64 source attempts, 32 unique paired deals and no win rate',()=>{
  const report=auditCompleteRank11(fixture());
  assert.equal(report.registered,64);
  assert.equal(report.observed,64);
  assert.equal(report.verifiedActualStarts,64);
  assert.equal(report.verifiedUniqueActualStart,32);
  assert.equal(report.uniquePhysicalSeatSeedDeals,32);
  assert.equal(report.policyOpportunities,0);
  assert.equal(report.completedGarbodor,0);
  assert.equal(report.byStatus['action-capped'],64);
  assert.equal(report.allCellsExposed,false);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.ok(report.candidateSeatCells.every(x=>x.missing===0 &&
    x.independentlyAuditedResponses===0 && x.rank11First+x.rank11Second===16));
});

test('missing, duplicated or swapped physical partition rows fail closed',()=>{
  const missing=fixture();
  missing[1].observations.pop();
  assert.throws(()=>auditCompleteRank11(missing),/16|trial IDs/);

  const duplicate=fixture();
  duplicate[2].observations[0]=duplicate[2].observations[1];
  assert.throws(()=>auditCompleteRank11(duplicate),/trial IDs/);

  const swapped=fixture();
  const row=swapped[1].observations[0];
  swapped[1].observations[0]=swapped[3].observations[0];
  swapped[3].observations[0]=row;
  assert.throws(()=>auditCompleteRank11(swapped),/trial IDs/);

  const repeated=fixture();
  repeated[3].executedPartition=2;
  assert.throws(()=>auditCompleteRank11(repeated),/Repeated archive partition/);
});

test('reject source identity, archive audit or policy-data mutation',()=>{
  const drift=fixture();
  drift[0].fixedRegistrationSha256='unregistered';
  assert.throws(()=>auditCompleteRank11(drift),/registration/i);

  const policy=fixture();
  policy[0].observations[0].observedPolicyProfile='generic';
  assert.throws(()=>auditCompleteRank11(policy),/conflicts/);

  const falseClaim=fixture();
  falseClaim[0].observations[0].candidateResponse.legalStateTransitionWitness=true;
  assert.throws(()=>auditCompleteRank11(falseClaim),/never independently certified/);

  const corrupted=fixture();
  corrupted[2].audit.received=999;
  assert.throws(()=>auditCompleteRank11(corrupted),/partition audit drift/);
});

test('paired candidates must agree on same-seed actual starting order',()=>{
  const reports=fixture();
  const a=reports[0].observations.find(x=>x.candidateEngineSlot==='A' &&
    x.trialId.includes('new-moon-lockbreaker-v1'));
  a.firstTurnSlot=1-a.firstTurnSlot;
  a.verifiedByDrawLog=true;
  reports[0].audit=auditRank11Exposure(frame,reports[0].observations);
  assert.throws(()=>auditCompleteRank11(reports),
    /inconsistent actual starting order/);
});

test('incomplete archive set and invalid registration fail before aggregation',()=>{
  assert.throws(()=>auditCompleteRank11(fixture().slice(1)),/four archived/);
  assert.throws(()=>auditCompleteRank11(fixture(),
    {...frame,frameSha256:'forged'}),/digest mismatch/);
});
