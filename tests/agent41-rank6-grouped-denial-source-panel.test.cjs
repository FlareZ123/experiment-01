'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  REGISTRATION_BLOB,readRegistration,summarizeNativeResult
}=require('../simulation/evaluation/agent41-rank6-grouped-denial-source-panel.cjs');

const ENGINE='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** Make one artificial row without claiming any genuine Store execution. */
function fabricatedRow(trial,{coheld=0,missing=false,error=false}={}){
  const groupedDenialRootCounts={
    plumeriaRoots:1,plumeriaPhysicalOffers:2,
    plumeriaAndFlareCoheldRoots:coheld,
    plumeriaAndFlareBothOfferedRoots:coheld,
    plumeriaAndPayableAttackRoots:1,
    plumeriaWithBenchTargetRoots:0,
    coheldFlareRootSamples:coheld?[{seat:trial.candidateSlot==='A'?1:0,
      rootOrdinal:3,globalTurn:4}]:[]
  };
  return {trial,status:error?'native-failure':undefined,
    finished:!error,winner:'development-only',
    sourceDealFingerprint:'source-seed-'+trial.seed,
    fullPhysicalDealFingerprint:'full-'+trial.id,
    actorOnlyDecisionCoverage:missing?null:{
      detailedComponentAudits:{root:{
        sameRootProposalChoice:{ownerRoots:5,groupedDenialRootCounts}
      }}
    }
  };
}

test('frozen 24 distinct original seeds pair two candidate 60s with both actual physical seats',()=>{
  const plan=readRegistration();
  assert.equal(REGISTRATION_BLOB,'6f4a694403069674f33daf81eff18971e214b758');
  assert.equal(plan.distinctSeedGroups,24);
  assert.equal(plan.trials.length,48);
  assert.equal(new Set(plan.trials.map(x=>x.seed)).size,24);
  assert.deepEqual(
    plan.trials.reduce((p,t)=>{
      p[t.candidateSlot]++;return p;
    },{A:0,B:0}),{A:24,B:24});
  assert.equal(plan.sameRootChoiceApply,false);
});

test('coheld root counts retain physical-offer multiplicity and correlated seed groups',()=>{
  const plan=readRegistration();
  const rows=plan.trials.map(trial=>fabricatedRow(trial,{
    coheld:trial.repeat===3?1:0
  }));
  const survey=summarizeNativeResult({
    attempted:48,rows,enginePin:ENGINE
  },plan);
  assert.equal(survey.scheduled,48);
  assert.equal(survey.ownerRoots,240);
  assert.equal(survey.plumeriaOwnerRoots,48);
  assert.equal(survey.physicalPlumeriaCopyOffers,96);
  assert.equal(survey.coheldFlareOwnerRoots,2);
  assert.equal(survey.bothSupporterOffersRoots,2);
  assert.equal(survey.armsWithCoheldFlare.length,2);
  assert.equal(survey.distinctSeedGroupsWithCoheldFlare,1);
  assert.ok(survey.perSeed.every(p=>p.sameSourcePhysicalDeal));
  assert.equal(survey.competitiveQualifiedGames,0);
});

test('original native aborted and missing audits remain explicit denominator rows',()=>{
  const plan=readRegistration();
  const rows=plan.trials.map((trial,i)=>fabricatedRow(trial,{
    missing:i===0,error:i===0
  }));
  const survey=summarizeNativeResult({
    attempted:48,rows,enginePin:ENGINE
  },plan);
  assert.equal(survey.resultsWithNativeActorAudit,47);
  assert.deepEqual(survey.unobservedActorAudits,[plan.trials[0].id]);
  assert.deepEqual(survey.errorOrUnsupportedArms,
    [{id:plan.trials[0].id,status:'native-failure'}]);
  assert.equal(survey.ownerRoots,235);
  assert.equal(survey.engineTerminals,47);
  assert.equal(survey.competitiveQualifiedGames,0);
});

test('cannot silently drop a registered pair or change the pinned engine',()=>{
  const plan=readRegistration();
  const rows=plan.trials.map(t=>fabricatedRow(t));
  assert.throws(()=>summarizeNativeResult({
    attempted:47,rows:rows.slice(1),enginePin:ENGINE
  },plan));
  assert.throws(()=>summarizeNativeResult({
    attempted:48,rows,enginePin:'unknown-revision'
  },plan));
});
