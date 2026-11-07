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
  '../../results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v3.json'
);
const EXPECTED_REGISTRATION_SHA = 'facb1b46ef15f601bc85cba5d5fdff2c056e3af5';
const ARTIFACT_DIR = path.resolve(
  process.cwd(),
  'artifacts/agent36-issue25-public-prompt-zone-diagnostic-v3'
);

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
 * Run the frozen v10b phase A under the read-only Snap Trap prompt observer.
 * No treatment phase is executed and no prompt is resolved by the observer.
 */
function main() {
  const registration = JSON.parse(fs.readFileSync(REGISTRATION_PATH, 'utf8'));
  assert.equal(registration.schema, 'agent36-issue25-public-prompt-zone-diagnostic-v3');
  assert.equal(registration.status, 'FROZEN_BEFORE_EXECUTION');
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
  assert.equal(typeof observer.withIssue25PublicPromptZoneAuditV3, 'function');

  let phase = null;
  let promptZoneAudit = null;
  let thrown = null;
  try {
    const observed = observer.withIssue25PublicPromptZoneAuditV3(
      () => sourceRunner.runPhase(registration.phase)
    );
    phase = observed.result;
    promptZoneAudit = observed.audit;
  } catch (error) {
    promptZoneAudit = error?.issue25PublicPromptZoneAuditV3 ?? null;
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
  const selection = resolveBlockedPromptZoneEvent(quarantineRecords, events);
  const selectedEvent = selection.blockedPromptZoneEvent;
  const marker = selectedEvent?.sourceMarker ?? null;
  const snapTrapSourceProof = Boolean(
    selection.status === 'FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED'
    && selectedEvent?.stateIsLiveStore === true
    && selectedEvent?.reducerStateMatchesLiveStore === true
    && selectedEvent?.promptOwnerArgumentMatches === true
    && selectedEvent?.sourceAttribution === 'reducer-scoped'
    && selectedEvent?.sourceCardPublic === true
    && selectedEvent?.sourcePrinting === 'Galarian Stunfisk SSH'
    && selectedEvent?.sourceEffect === 'Snap Trap'
    && marker?.valid === true
    && marker?.sourceCardPublic === true
    && marker?.sourceSeat !== marker?.attackerSeat
    && marker?.promptCardsExact === true
    && marker?.energySubzoneExact === true
    && marker?.promptOwnerMatches === true
    && marker?.attackerActiveContainer === true
    && marker?.activeEnergyMatch === true
    && marker?.mandatoryOneEnergy === true
    && marker?.filterMatchesEnergySubzone === true
    && selectedEvent?.eligibleSubzone === 'energies'
    && selectedEvent?.filterMatchesEnergySubzone === true
    && selectedEvent?.offeredCount >= 1
    && selectedEvent?.zoneMatches?.length === 1
    && selectedEvent?.zoneMatches[0]?.zone === 'opponent-active-pokemon-list'
    && selectedEvent?.zoneMatches[0]?.match === 'exact-container'
    && selectedEvent?.zoneMatches[0]?.subzoneReferenceMatch === true
    && selectedEvent?.zoneMatches[0]?.visibility === 'public'
  );
  const status = selection.status === 'FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED'
    ? snapTrapSourceProof
      ? 'FALLBACK_CAPTURED_SNAP_TRAP_SOURCE_AND_ACTIVE_ENERGY_ZONE_MATCHED'
      : 'FALLBACK_CAPTURED_SNAP_TRAP_SOURCE_PROOF_INCOMPLETE'
    : selection.status;
  const phaseSummary = phase ? sourceRunner.phaseSummary(phase) : null;
  const artifact = {
    schema: registration.schema,
    status,
    diagnosticRunnerPath: 'simulation/evaluation/agent36-issue25-public-prompt-zone-diagnostic-v3.cjs',
    diagnosticRunnerGitBlobSha: gitBlobSha(__filename),
    diagnosticRunnerCommit: process.env.GITHUB_SHA ?? null,
    registrationPath: 'results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v3.json',
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
    promptZoneSelection: selection,
    snapTrapSourceProof,
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
    'run-' + runId + '-agent36-issue25-public-prompt-zone-diagnostic-v3.json'
  );
  const saved = writeAtomicJson(artifactPath, artifact);

  console.log(JSON.stringify({
    status: artifact.status,
    artifactPath: saved.file,
    artifactSha256: saved.sha256,
    nativeAttemptCount: artifact.nativeAttemptCount,
    quarantineRecordCount: artifact.quarantineRecordCount,
    snapTrapReducerCount: promptZoneAudit?.snapTrapReducerCount ?? 0,
    blockedPromptZoneEvent: selectedEvent,
    snapTrapSourceProof
  }, null, 2));

  if (status !== 'FALLBACK_CAPTURED_SNAP_TRAP_SOURCE_AND_ACTIVE_ENERGY_ZONE_MATCHED') {
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {gitBlobSha, writeAtomicJson, main};
