'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const REGISTRATION_PATH = path.resolve(
  __dirname,
  '../../results/aichi-2026/registrations/agent3-owner-information-fallback-diagnostic-v1.json'
);
const ARTIFACT_PATH = path.resolve(
  process.cwd(),
  'artifacts/agent3-owner-information-fallback-diagnostic/agent3-owner-information-fallback-diagnostic.json'
);

/**
 * Compute the Git object SHA-1 for a file's exact bytes.
 * @param {string} filePath
 * @returns {string}
 */
function gitBlobSha(filePath) {
  const bytes = fs.readFileSync(filePath);
  return crypto.createHash('sha1')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex');
}

/**
 * Atomically write a JSON artifact while holding an exclusive lock.
 * @param {string} filePath
 * @param {unknown} value
 */
function writeAtomicJson(filePath, value) {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
  const lockPath = `${filePath}.lock`;
  const lockFd = fs.openSync(lockPath, 'wx');
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(
      temporaryPath,
      `${JSON.stringify(value, null, 2)}\n`,
      { flag: 'wx' }
    );
    fs.renameSync(temporaryPath, filePath);
  } finally {
    fs.closeSync(lockFd);
    fs.unlinkSync(lockPath);
  }
}

/**
 * Run phase A only and preserve the raw-state fallback quarantine evidence.
 * No A/B/A comparison or treatment attribution is performed.
 */
function main() {
  const registration = JSON.parse(fs.readFileSync(REGISTRATION_PATH, 'utf8'));
  assert.equal(registration.schema, 'agent3-owner-information-fallback-diagnostic-v1');

  const sourceRunnerPath = path.resolve(process.cwd(), registration.sourceRunnerPath);
  const sourceRegistrationPath = path.resolve(process.cwd(), registration.sourceRegistrationPath);
  assert.equal(
    gitBlobSha(sourceRunnerPath),
    registration.sourceRunnerGitBlobSha,
    'Source v10b runner changed; create a new diagnostic registration'
  );
  assert.equal(
    gitBlobSha(sourceRegistrationPath),
    registration.sourceRegistrationGitBlobSha,
    'Source v10b registration changed; create a new diagnostic registration'
  );

  const sourceRegistration = JSON.parse(fs.readFileSync(sourceRegistrationPath, 'utf8'));
  assert.equal(sourceRegistration.schema, registration.sourceRegistrationSchema);
  assert.deepEqual(
    sourceRegistration.trials.map(trial => trial.id),
    registration.sourceTrialIds
  );

  const sourceRunner = require(sourceRunnerPath);
  assert.equal(sourceRunner.VERSION, registration.sourceRunnerVersion);
  assert.equal(typeof sourceRunner.runPhase, 'function');
  assert.equal(registration.phase, 'A');

  let phase = null;
  let thrown = null;
  try {
    phase = sourceRunner.runPhase(registration.phase);
  } catch (error) {
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
  const records = Array.isArray(quarantine?.records) ? quarantine.records : [];
  const nativeAttempts = Array.isArray(diagnostic?.nativeAttempts)
    ? diagnostic.nativeAttempts
    : [];

  const artifact = {
    schema: registration.schema,
    status: records.length > 0 ? 'FALLBACK_CAPTURED' : 'NO_FALLBACK_RECORD',
    diagnosticRunnerPath: 'simulation/evaluation/agent3-owner-information-fallback-diagnostic.cjs',
    diagnosticRunnerCommit: process.env.GITHUB_SHA ?? null,
    registrationPath: 'results/aichi-2026/registrations/agent3-owner-information-fallback-diagnostic-v1.json',
    registrationGitBlobSha: gitBlobSha(REGISTRATION_PATH),
    sourceRunnerPath: registration.sourceRunnerPath,
    sourceRunnerGitBlobSha: registration.sourceRunnerGitBlobSha,
    sourceRunnerVersion: sourceRunner.VERSION,
    sourceRegistrationPath: registration.sourceRegistrationPath,
    sourceRegistrationGitBlobSha: registration.sourceRegistrationGitBlobSha,
    sourceRegistrationSchema: sourceRegistration.schema,
    sourceTrialIds: registration.sourceTrialIds,
    phase: registration.phase,
    nativeRootActionLimit: registration.nativeRootActionLimit,
    nativeAttemptCount: nativeAttempts.length,
    quarantineRecordCount: records.length,
    quarantineRecords: records,
    treatmentAttributionComputed: false,
    competitiveGamesQualified: 0,
    winRateEstimate: null,
    thrown,
    phaseManifest: phase?.manifest ?? null,
    phaseDiagnostic: diagnostic,
    rawDevelopment: phase?.rawDevelopment ?? null
  };

  writeAtomicJson(ARTIFACT_PATH, artifact);
  console.log(JSON.stringify({
    status: artifact.status,
    artifactPath: ARTIFACT_PATH,
    nativeAttemptCount: artifact.nativeAttemptCount,
    quarantineRecordCount: artifact.quarantineRecordCount,
    quarantineRecords: artifact.quarantineRecords
  }, null, 2));

  if (records.length === 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { gitBlobSha, writeAtomicJson, main };
