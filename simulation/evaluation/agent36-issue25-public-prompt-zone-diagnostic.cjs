'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  VERSION: PROMPT_ZONE_SELECTION_VERSION,
  resolveBlockedPromptZoneEvent
} = require('./agent36-issue25-public-prompt-zone-selection.cjs');

const REGISTRATION_PATH = path.resolve(
  __dirname,
  '../../results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v1.json'
);
const EXPECTED_REGISTRATION_SHA = '19d70f52263d91629cf965e439f46660ed9d7a5c';
const ARTIFACT_DIR = path.resolve(
  process.cwd(),
  'artifacts/agent36-issue25-public-prompt-zone-diagnostic'
);
const SOURCE_RUNNER_PATH = 'simulation/evaluation/agent36-issue25-common-v10b-paired-fresh-aba.cjs';
const SOURCE_REGISTRATION_PATH =
  'results/aichi-2026/registrations/agent36-issue25-common-v10b-paired-fresh-aba-260root-20261107.json';
const OBSERVER_PATH = 'simulation/twinleaf/agent36-issue25-public-prompt-zone-audit.cjs';

/**
 * Compute the Git object SHA-1 for a file's exact bytes.
 * @param {string} filePath
 * @returns {string}
 */
function gitBlobSha(filePath) {
  const bytes = fs.readFileSync(filePath);
  return crypto.createHash('sha1')
    .update('blob ' + bytes.length + '\0')
    .update(bytes)
    .digest('hex');
}

/**
 * Atomically write an artifact and SHA-256 sidecar while holding an exclusive lock.
 * @param {string} filePath
 * @param {unknown} value
 * @returns {{file:string,sha256:string,bytes:number}}
 */
function writeAtomicJson(filePath, value) {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, {recursive: true});
  const lockPath = filePath + '.lock';
  const lockFd = fs.openSync(lockPath, 'wx');
  const temporaryPath = filePath + '.' + process.pid + '.' + crypto.randomUUID() + '.tmp';
  const digestPath = filePath + '.sha256';
  const digestTemporaryPath = digestPath + '.' + process.pid + '.' + crypto.randomUUID() + '.tmp';
  const data = Buffer.from(JSON.stringify(value, null, 2) + '\n');
  const digest = crypto.createHash('sha256').update(data).digest('hex');
  try {
    fs.writeFileSync(temporaryPath, data, {flag: 'wx'});
    fs.renameSync(temporaryPath, filePath);
    fs.writeFileSync(
      digestTemporaryPath,
      digest + '  ' + path.basename(filePath) + '\n',
      {flag: 'wx'}
    );
    fs.renameSync(digestTemporaryPath, digestPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    if (fs.existsSync(digestTemporaryPath)) fs.unlinkSync(digestTemporaryPath);
    fs.closeSync(lockFd);
    fs.unlinkSync(lockPath);
  }
  return {
    file: path.relative(process.cwd(), filePath),
    sha256: digest,
    bytes: data.length
  };
}

/**
 * Run the pinned v10b phase A under a read-only public prompt-zone observer.
 * No treatment phase is executed and no prompt is resolved by the observer.
 */
function main() {
  const registration = JSON.parse(fs.readFileSync(REGISTRATION_PATH, 'utf8'));
  assert.equal(registration.schema, 'agent36-issue25-public-prompt-zone-diagnostic-v1');
  assert.equal(gitBlobSha(REGISTRATION_PATH), EXPECTED_REGISTRATION_SHA,
    'Diagnostic registration changed; create a new versioned registration');

  const sourceRunnerPath = path.resolve(process.cwd(), registration.sourceRunnerPath);
  const sourceRegistrationPath = path.resolve(process.cwd(), registration.sourceRegistrationPath);
  const observerPath = path.resolve(process.cwd(), registration.observerPath);

  assert.equal(gitBlobSha(sourceRunnerPath), registration.sourceRunnerGitBlobSha,
    'Pinned v10b source runner changed');
  assert.equal(gitBlobSha(sourceRegistrationPath), registration.sourceRegistrationGitBlobSha,
    'Pinned v10b source registration changed');
  assert.equal(gitBlobSha(observerPath), registration.observerGitBlobSha,
    'Read-only prompt observer changed; create a new diagnostic registration');

  const sourceRegistration = JSON.parse(fs.readFileSync(sourceRegistrationPath, 'utf8'));
  assert.equal(sourceRegistration.schema, registration.sourceRegistrationSchema);
  assert.deepEqual(sourceRegistration.trials.map(trial => trial.id), registration.sourceTrialIds);
  assert.equal(sourceRegistration.pinnedTwinleaf, registration.pinnedTwinleafCommit);

  const sourceRunner = require(sourceRunnerPath);
  assert.equal(sourceRunner.VERSION, registration.sourceRunnerVersion);
  assert.equal(typeof sourceRunner.runPhase, 'function');
  assert.equal(typeof sourceRunner.phaseSummary, 'function');
  assert.equal(registration.phase, 'A');

  const observer = require(observerPath);
  assert.equal(observer.VERSION, registration.observerVersion);
  assert.equal(typeof observer.withIssue25PublicPromptZoneAudit, 'function');

  let phase = null;
  let promptZoneAudit = null;
  let thrown = null;
  try {
    const observed = observer.withIssue25PublicPromptZoneAudit(
      () => sourceRunner.runPhase(registration.phase)
    );
    phase = observed.result;
    promptZoneAudit = observed.audit;
  } catch (error) {
    promptZoneAudit = error?.issue25PublicPromptZoneAudit ?? null;
    thrown = {
      name: error?.name ?? null,
      message: error?.message ?? String(error),
      code: error?.code ?? null,
      stack: error?.stack ?? null,
      nativeRawStateFallbackQuarantine:
        error?.nativeRawStateFallbackQuarantine ?? null
    };
  }

  const diagnostic = phase?.diagnostic ?? null;
  const quarantine =
    diagnostic?.audit?.nativeRawStateQuarantine ??
    thrown?.nativeRawStateFallbackQuarantine ??
    null;
  const quarantineRecords = Array.isArray(quarantine?.records)
    ? quarantine.records
    : [];
  const events = Array.isArray(promptZoneAudit?.events)
    ? promptZoneAudit.events
    : [];
  const promptZoneSelection = resolveBlockedPromptZoneEvent(quarantineRecords, events);
  const {status, blockedPromptZoneEvent} = promptZoneSelection;

  const phaseSummary = phase ? sourceRunner.phaseSummary(phase) : null;
  const artifact = {
    schema: registration.schema,
    status,
    diagnosticRunnerPath: 'simulation/evaluation/agent36-issue25-public-prompt-zone-diagnostic.cjs',
    diagnosticRunnerGitBlobSha: gitBlobSha(__filename),
    diagnosticRunnerCommit: process.env.GITHUB_SHA ?? null,
    registrationPath: 'results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v1.json',
    registrationGitBlobSha: gitBlobSha(REGISTRATION_PATH),
    sourceRunnerPath: registration.sourceRunnerPath,
    sourceRunnerGitBlobSha: registration.sourceRunnerGitBlobSha,
    sourceRunnerVersion: sourceRunner.VERSION,
    sourceRegistrationPath: registration.sourceRegistrationPath,
    sourceRegistrationGitBlobSha: registration.sourceRegistrationGitBlobSha,
    sourceRegistrationSchema: sourceRegistration.schema,
    sourceTrialIds: registration.sourceTrialIds,
    observerPath: registration.observerPath,
    observerGitBlobSha: registration.observerGitBlobSha,
    observerVersion: observer.VERSION,
    pinnedTwinleafCommit: registration.pinnedTwinleafCommit,
    phase: registration.phase,
    nativeRootActionLimit: registration.nativeRootActionLimit,
    nativeAttemptCount: diagnostic?.nativeAttempts?.length ?? 0,
    quarantineRecordCount: quarantineRecords.length,
    quarantineRecords,
    promptZoneAudit,
    promptZoneSelectionVersion: PROMPT_ZONE_SELECTION_VERSION,
    blockedPromptZoneCandidateCount: promptZoneSelection.candidateCount,
    blockedPromptZoneCandidates: promptZoneSelection.blockedPromptZoneCandidates,
    blockedPromptZoneCandidateGroups: promptZoneSelection.candidateGroups,
    blockedPromptZoneEventIndex: promptZoneSelection.blockedPromptZoneEventIndex,
    blockedPromptZoneEvent,
    phaseSummary,
    treatmentAttributionComputed: false,
    competitiveGamesQualified: 0,
    winRateEstimate: null,
    thrown,
    phaseManifest: phase?.manifest ?? null,
    phaseDiagnostic: diagnostic,
    rawDevelopment: phase?.rawDevelopment ?? null
  };

  const runId = process.env.GITHUB_RUN_ID ?? String(process.pid);
  const artifactPath = path.join(
    ARTIFACT_DIR,
    'run-' + runId + '-agent36-issue25-public-prompt-zone-diagnostic.json'
  );
  const saved = writeAtomicJson(artifactPath, artifact);

  console.log(JSON.stringify({
    status: artifact.status,
    artifactPath: saved.file,
    artifactSha256: saved.sha256,
    nativeAttemptCount: artifact.nativeAttemptCount,
    quarantineRecordCount: artifact.quarantineRecordCount,
    blockedPromptZoneCandidateCount: artifact.blockedPromptZoneCandidateCount,
    blockedPromptZoneCandidates: artifact.blockedPromptZoneCandidates,
    blockedPromptZoneEvent: artifact.blockedPromptZoneEvent
  }, null, 2));

  if (status !== 'FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED') {
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {gitBlobSha, writeAtomicJson, main};
