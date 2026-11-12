'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  PERSISTENCE_TIME_SOURCE,DEAL_GENERATION_STEP_NAME,
  createPreDealPersistenceReceipt,createDealGenerationReceipt
}=require('../../simulation/evaluation/2026-11/agent44-actions-metadata-receipts.cjs');

function fixture() {
  const preDeal={
    trialId:'agent44-actions-receipt-fixture',
    preDealArtifactRef:'results/aichi-2026/agent44-predeal.json',
    preDealArtifactSha256:'a'.repeat(64),
    gameRegistration:{
      registeredAt:'2026-11-12T17:00:00.000Z',
      dealGeneratedAt:'2026-11-12T17:10:00.000Z'
    }
  };
  const run={
    id:12345,
    head_sha:'b'.repeat(40),
    run_started_at:'2026-11-12T17:05:00.000Z',
    repository:{full_name:'FlareZ123/experiment-01'}
  };
  const artifact={
    repositoryFullName:'FlareZ123/experiment-01',
    artifactRef:preDeal.preDealArtifactRef,
    artifactSha256:preDeal.preDealArtifactSha256,
    commitSha:run.head_sha,
    blobSha:'c'.repeat(40)
  };
  const persistenceReceipt=createPreDealPersistenceReceipt({
    preDeal,run,artifact
  });
  const step={
    name:DEAL_GENERATION_STEP_NAME,
    status:'completed',conclusion:'success',
    started_at:'2026-11-12T17:11:00.000Z',
    completed_at:'2026-11-12T17:12:00.000Z'
  };
  const job={
    id:67890,run_id:run.id,head_sha:run.head_sha,
    status:'completed',conclusion:'success',steps:[step]
  };
  const trial={
    trialId:preDeal.trialId,
    dealGeneratedAt:'2026-11-12T17:11:02.000Z',
    dealGenerationStepStartedAt:step.started_at,
    researchRevisionSha:'d'.repeat(40),
    initialSourceDealFingerprint:'e'.repeat(64)
  };
  return {preDeal,run,artifact,persistenceReceipt,job,trial,step};
}

test('Actions run/job/step metadata maps to the existing V3 receipt contract',()=>{
  const x=fixture();
  assert.deepEqual(createPreDealPersistenceReceipt({
    preDeal:x.preDeal,run:x.run,artifact:x.artifact
  }),{
    schema:'aichi-predeal-artifact-persistence-receipt-v1',
    trialId:x.preDeal.trialId,
    repositoryFullName:x.artifact.repositoryFullName,
    artifactRef:x.artifact.artifactRef,
    artifactSha256:x.artifact.artifactSha256,
    serverTimestampSource:PERSISTENCE_TIME_SOURCE,
    workflowRunId:'12345',
    workflowHeadSha:x.run.head_sha,
    commitSha:x.artifact.commitSha,
    blobSha:x.artifact.blobSha,
    workflowRunStartedAt:x.run.run_started_at
  });
  assert.deepEqual(createDealGenerationReceipt({
    preDeal:x.preDeal,trial:x.trial,run:x.run,job:x.job,
    persistenceReceipt:x.persistenceReceipt
  }),{
    schema:'aichi-physical-deal-generation-receipt-v1',
    trialId:x.trial.trialId,
    artifactRef:x.persistenceReceipt.artifactRef,
    artifactSha256:x.persistenceReceipt.artifactSha256,
    commitSha:x.persistenceReceipt.commitSha,
    blobSha:x.persistenceReceipt.blobSha,
    workflowRunId:'12345',
    workflowHeadSha:x.run.head_sha,
    jobId:'67890',
    stepName:DEAL_GENERATION_STEP_NAME,
    stepStartedAt:x.step.started_at,
    runnerRevision:x.trial.researchRevisionSha,
    sourceDealFingerprint:x.trial.initialSourceDealFingerprint
  });
});

test('persistence receipt rejects a workflow from another repo or whose head omits the artifact commit',()=>{
  const x=fixture();
  assert.throws(()=>createPreDealPersistenceReceipt({
    ...x,run:{...x.run,repository:{full_name:'someone/else'}}
  }),/workflow run repository must equal the artifact repository/);
  assert.throws(()=>createPreDealPersistenceReceipt({
    ...x,run:{...x.run,head_sha:'f'.repeat(40)}
  }),/workflow head must be the exact commit/);
});

test('persistence receipt rejects run timestamps outside the preregistered window or without an offset',()=>{
  const x=fixture();
  assert.throws(()=>createPreDealPersistenceReceipt({
    ...x,run:{...x.run,run_started_at:'2026-11-12T17:10:00.000Z'}
  }),/before the planned physical deal/);
  assert.throws(()=>createPreDealPersistenceReceipt({
    ...x,run:{...x.run,run_started_at:'2026-11-12T16:59:59.000Z'}
  }),/after preregistration/);
  assert.throws(()=>createPreDealPersistenceReceipt({
    ...x,run:{...x.run,run_started_at:'2026-11-12T17:05:00'}
  }),/explicit UTC offset/);
  assert.throws(()=>createPreDealPersistenceReceipt({
    ...x,run:{...x.run,run_started_at:'2026-11-12'}
  }),/explicit UTC offset/);
});

test('deal receipt requires the generation job and workflow to remain in the persisted run/repository',()=>{
  const x=fixture();
  assert.throws(()=>createDealGenerationReceipt({
    ...x,job:{...x.job,run_id:99999}
  }),/belong to the persisted workflow run/);
  assert.throws(()=>createDealGenerationReceipt({
    ...x,job:{...x.job,head_sha:'f'.repeat(40)}
  }),/generation job head SHA must equal workflow head SHA/);
  const {head_sha,...jobWithoutHead}=x.job;
  assert.throws(()=>createDealGenerationReceipt({
    ...x,job:jobWithoutHead
  }),/generation job head SHA is invalid/);
  assert.throws(()=>createDealGenerationReceipt({
    ...x,run:{...x.run,repository:{full_name:'someone/else'}}
  }),/workflow repository must equal the persisted artifact repository/);
  assert.throws(()=>createDealGenerationReceipt({
    ...x,run:{...x.run,run_started_at:'2026-11-12T17:05:01.000Z'}
  }),/same server timestamp/);
  assert.throws(()=>createDealGenerationReceipt({
    ...x,persistenceReceipt:{...x.persistenceReceipt,commitSha:'f'.repeat(40)}
  }),/persisted artifact commit must equal workflow head SHA/);
});

test('deal receipt requires exactly one successful dedicated generation step',()=>{
  const x=fixture();
  assert.throws(()=>createDealGenerationReceipt({
    ...x,job:{...x.job,steps:[]}
  }),/exactly one dedicated physical-deal step/);
  assert.throws(()=>createDealGenerationReceipt({
    ...x,job:{...x.job,steps:[x.step,x.step]}
  }),/exactly one dedicated physical-deal step/);
  assert.throws(()=>createDealGenerationReceipt({
    ...x,job:{...x.job,conclusion:'failure'}
  }),/complete successfully/);
  assert.throws(()=>createDealGenerationReceipt({
    ...x,job:{...x.job,steps:[{...x.step,conclusion:'failure'}]}
  }),/step must complete successfully/);
});

test('deal receipt rejects a generation step before the planned time or run start',()=>{
  const x=fixture();
  const early={...x.step,started_at:'2026-11-12T17:09:59.999Z'};
  const trial={...x.trial,dealGeneratedAt:early.started_at};
  assert.throws(()=>createDealGenerationReceipt({
    ...x,step:early,trial,job:{...x.job,steps:[early]}
  }),/at or after the planned physical deal/);
});

test('deal receipt requires the trial server step time and a valid source-deal fingerprint',()=>{
  const x=fixture();
  assert.throws(()=>createDealGenerationReceipt({
    ...x,trial:{...x.trial,dealGenerationStepStartedAt:'2026-11-12T17:11:00.001Z'}
  }),/server-reported generation step start/);
  assert.throws(()=>createDealGenerationReceipt({
    ...x,trial:{...x.trial,initialSourceDealFingerprint:'f'.repeat(63)}
  }),/source-deal fingerprint is invalid/);
});
