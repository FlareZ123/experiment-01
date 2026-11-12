'use strict';

const assert=require('node:assert/strict');

const PREDEAL_PERSISTENCE_RECEIPT_SCHEMA='aichi-predeal-artifact-persistence-receipt-v1';
const DEAL_GENERATION_RECEIPT_SCHEMA='aichi-physical-deal-generation-receipt-v1';
const PERSISTENCE_TIME_SOURCE='github-actions-run-started-at';
const DEAL_GENERATION_STEP_NAME='Generate physical deal';
const RUN_ID=/^[1-9]\d*$/;
const GIT_SHA=/^[0-9a-f]{40}$/;
const SHA256=/^[0-9a-f]{64}$/;

function object(value,label) {
  assert.ok(value!==null&&typeof value==='object'&&!Array.isArray(value),
    label+' must be an object');
  return value;
}

function positiveId(value,label) {
  const id=String(value??'');
  assert.match(id,RUN_ID,label+' must be a positive numeric GitHub ID');
  return id;
}

function timestamp(value,label) {
  assert.equal(typeof value,'string',label+' must be an ISO timestamp');
  const parsed=Date.parse(value);
  assert.ok(Number.isFinite(parsed),label+' must be parseable');
  return parsed;
}

/**
 * Convert the GitHub Actions workflow-run API response and independently
 * verified artifact commit/blob facts into the builder's existing receipt.
 * Do not synthesize these fields from commit committer dates or local clocks.
 */
function createPreDealPersistenceReceipt({preDeal,run,artifact}) {
  object(preDeal,'preDeal');
  object(preDeal.gameRegistration,'preDeal.gameRegistration');
  object(run,'workflow run');
  object(run.repository,'workflow run repository');
  object(artifact,'persisted artifact');
  assert.equal(run.repository.full_name,artifact.repositoryFullName,
    'workflow run repository must equal the artifact repository');
  assert.equal(artifact.artifactRef,preDeal.preDealArtifactRef,
    'persisted artifact ref must equal the preregistered ref');
  assert.equal(artifact.artifactSha256,preDeal.preDealArtifactSha256,
    'persisted artifact digest must equal the preregistered digest');
  assert.match(artifact.repositoryFullName??'',/^[^/]+\/[^/]+$/,
    'repositoryFullName must identify owner/repository');
  assert.match(artifact.commitSha??'',GIT_SHA,'artifact commit SHA is invalid');
  assert.match(artifact.blobSha??'',GIT_SHA,'artifact blob SHA is invalid');
  const workflowRunId=positiveId(run.id,'workflow run id');
  assert.match(run.head_sha??'',GIT_SHA,'workflow head SHA is invalid');
  assert.equal(run.head_sha,artifact.commitSha,
    'workflow head must be the exact commit containing the pre-deal artifact');
  const registeredAt=timestamp(preDeal.gameRegistration.registeredAt,
    'registration time');
  const plannedDealAt=timestamp(preDeal.gameRegistration.dealGeneratedAt,
    'planned deal time');
  const workflowRunStartedAt=timestamp(run.run_started_at,
    'GitHub Actions run_started_at');
  assert.ok(workflowRunStartedAt>=registeredAt,
    'workflow run must start after preregistration');
  assert.ok(workflowRunStartedAt<plannedDealAt,
    'workflow run must start before the planned physical deal');
  return {
    schema:PREDEAL_PERSISTENCE_RECEIPT_SCHEMA,
    trialId:preDeal.trialId,
    repositoryFullName:artifact.repositoryFullName,
    artifactRef:artifact.artifactRef,
    artifactSha256:artifact.artifactSha256,
    serverTimestampSource:PERSISTENCE_TIME_SOURCE,
    workflowRunId,
    workflowHeadSha:run.head_sha,
    commitSha:artifact.commitSha,
    blobSha:artifact.blobSha,
    workflowRunStartedAt:run.run_started_at
  };
}

/**
 * Convert the completed generation job's server-reported step metadata into
 * the builder's existing deal receipt. The caller must ensure the deal was
 * physically generated only inside this dedicated step.
 */
function createDealGenerationReceipt({preDeal,trial,run,job,persistenceReceipt}) {
  object(preDeal,'preDeal');
  object(preDeal.gameRegistration,'preDeal.gameRegistration');
  object(trial,'trial');
  object(run,'workflow run');
  object(run.repository,'workflow run repository');
  object(job,'workflow job');
  object(persistenceReceipt,'pre-deal persistence receipt');
  assert.equal(run.repository.full_name,persistenceReceipt.repositoryFullName,
    'generation workflow repository must equal the persisted artifact repository');
  const workflowRunId=positiveId(run.id,'workflow run id');
  const jobId=positiveId(job.id,'workflow job id');
  assert.equal(persistenceReceipt.schema,PREDEAL_PERSISTENCE_RECEIPT_SCHEMA,
    'persistence receipt schema must be the existing V3 receipt');
  assert.equal(persistenceReceipt.serverTimestampSource,PERSISTENCE_TIME_SOURCE,
    'persistence receipt must use GitHub Actions server time');
  assert.equal(persistenceReceipt.trialId,preDeal.trialId,
    'persistence receipt trial identity must match preregistration');
  assert.equal(persistenceReceipt.artifactRef,preDeal.preDealArtifactRef,
    'persistence receipt artifact ref must match preregistration');
  assert.equal(persistenceReceipt.artifactSha256,preDeal.preDealArtifactSha256,
    'persistence receipt artifact digest must match preregistration');
  assert.equal(persistenceReceipt.workflowRunId,workflowRunId,
    'generation receipt must use the same workflow run as persistence');
  assert.equal(persistenceReceipt.workflowRunStartedAt,run.run_started_at,
    'workflow run_started_at must remain the same server timestamp');
  assert.equal(job.run_id===undefined?null:String(job.run_id),workflowRunId,
    'generation job must belong to the persisted workflow run');
  assert.equal(run.head_sha,persistenceReceipt.workflowHeadSha,
    'workflow head changed between persistence and generation receipts');
  if(job.head_sha!==undefined)
    assert.equal(job.head_sha,run.head_sha,
      'generation job head SHA must equal workflow head SHA');
  assert.equal(persistenceReceipt.workflowHeadSha,run.head_sha,
    'generation receipt must use the same workflow head as persistence');
  assert.match(persistenceReceipt.commitSha??'',GIT_SHA,
    'persisted artifact commit SHA is invalid');
  assert.match(persistenceReceipt.blobSha??'',GIT_SHA,
    'persisted artifact blob SHA is invalid');
  assert.match(persistenceReceipt.artifactSha256??'',SHA256,
    'persisted artifact digest is invalid');
  assert.equal(persistenceReceipt.commitSha,run.head_sha,
    'persisted artifact commit must equal workflow head SHA');
  assert.equal(job.status,'completed',
    'generation job must be completed before its server step time is used');
  assert.equal(job.conclusion,'success',
    'generation job must complete successfully');
  const steps=Array.isArray(job.steps)?job.steps:[];
  const matches=steps.filter(step=>step?.name===DEAL_GENERATION_STEP_NAME);
  assert.equal(matches.length,1,
    'generation job must contain exactly one dedicated physical-deal step');
  const step=object(matches[0],'physical deal generation step');
  assert.equal(step.status,'completed',
    'physical deal generation step must be completed');
  assert.equal(step.conclusion,'success',
    'physical deal generation step must complete successfully');
  const runStartedAt=timestamp(persistenceReceipt.workflowRunStartedAt,
    'persisted workflow run_started_at');
  const plannedDealAt=timestamp(preDeal.gameRegistration.dealGeneratedAt,
    'planned deal time');
  const stepStartedAt=timestamp(step.started_at,
    'GitHub Actions generation step started_at');
  const stepCompletedAt=timestamp(step.completed_at,
    'GitHub Actions generation step completed_at');
  assert.ok(stepCompletedAt>=stepStartedAt,
    'generation step completed_at must not precede started_at');
  assert.ok(stepStartedAt>runStartedAt,
    'generation step must start after the persisted workflow run');
  assert.ok(stepStartedAt>=plannedDealAt,
    'generation step must start at or after the planned physical deal');
  assert.equal(trial.trialId,preDeal.trialId,
    'trial identity must match preregistration');
  assert.equal(trial.dealGenerationStepStartedAt,step.started_at,
    'trial dealGenerationStepStartedAt must be the server-reported generation step start');
  assert.match(trial.researchRevisionSha??'',GIT_SHA,
    'runner research revision SHA is invalid');
  assert.match(trial.initialSourceDealFingerprint??'',SHA256,
    'source-deal fingerprint is invalid');
  return {
    schema:DEAL_GENERATION_RECEIPT_SCHEMA,
    trialId:trial.trialId,
    artifactRef:persistenceReceipt.artifactRef,
    artifactSha256:persistenceReceipt.artifactSha256,
    commitSha:persistenceReceipt.commitSha,
    blobSha:persistenceReceipt.blobSha,
    workflowRunId,
    workflowHeadSha:run.head_sha,
    jobId,
    stepName:step.name,
    stepStartedAt:step.started_at,
    runnerRevision:trial.researchRevisionSha,
    sourceDealFingerprint:trial.initialSourceDealFingerprint
  };
}

module.exports={
  PERSISTENCE_TIME_SOURCE,DEAL_GENERATION_STEP_NAME,
  createPreDealPersistenceReceipt,createDealGenerationReceipt
};
