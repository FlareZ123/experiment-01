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
  '../../results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v7-namespace-20261107.json'
);
const EXPECTED_REGISTRATION_SHA = '9787aa2ea7b1fd9d49072fbbe502bab2c2be2f8b';
const ARTIFACT_DIR = path.resolve(
  process.cwd(),
  'artifacts/agent36-issue25-public-prompt-zone-diagnostic-v7'
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
 * @param {any} event
 * @param {any} origin
 * @param {any} sourceProof
 * @returns {boolean}
 */
function exactPromptZoneJoin(event, sourceProof) {
  const zone = event?.zoneMatches?.[0];
  const attack = event?.currentAttack ?? event?.lastAttack ?? null;
  const origin = event?.sourceOrigin ?? null;
  return Boolean(
    event
    && sourceProof
    && origin === sourceProof
    && sourceProof.pendingNativePromptId
    && event.promptId === sourceProof.pendingNativePromptId
    && event.promptIdBeforeStore === String(sourceProof.promptIdBeforeStore)
    && event.promptIdAfterStore === String(sourceProof.promptIdAfterStore)
    && event.promptIdAssignedByStore === true
    && sourceProof.promptIdAssignedByStore === true
    && event.stateIsLiveStore === true
    && event.promptStateArgumentMatchesLiveState === true
    && event.promptPlayerMatches === true
    && event.turn === sourceProof.turn
    && event.activePlayerSeat === sourceProof.attackerSeat
    && event.ownerSeat === sourceProof.promptOwnerSeat
    && event.opponentSeat === sourceProof.attackerSeat
    && event.promptType === sourceProof.promptType
    && event.message === sourceProof.promptMessage
    && event.filterIsExactSuperTypeEnergy === true
    && event.filterMatchesEnergySubzone === true
    && event.eligibleSubzone === 'energies'
    && event.offeredCount === sourceProof.eligibleEnergyCount
    && JSON.stringify(event.offeredPrintings) === JSON.stringify(sourceProof.eligibleEnergyPrintings)
    && event.zoneMatches.length === 1
    && zone.zone === 'opponent-active-pokemon-list'
    && zone.match === 'exact-container'
    && zone.visibility === 'public'
    && zone.eligibleSubzone === 'energies'
    && zone.subzoneReferenceMatch === true
    && zone.eligibleCount === sourceProof.eligibleEnergyCount
    && event.ownerActive?.printing === sourceProof.sourcePrinting
    && event.opponentActive?.printing === sourceProof.attackerPrinting
    && event.opponentActive?.energyCount === sourceProof.eligibleEnergyCount
    && attack?.seat === sourceProof.attackerSeat
    && attack?.turn === sourceProof.turn
    && event.promptSourceMetadataPresent === false
    && sourceProof.sourcePrinting === 'Galarian Stunfisk SSH'
    && sourceProof.sourceAbility === 'Snap Trap'
    && sourceProof.sourceCardPublic === true
    && sourceProof.sourceZone === 'owner-active-pokemon-list'
    && sourceProof.attackerZone === 'opponent-active-pokemon-list'
    && sourceProof.sourceSeat === sourceProof.promptOwnerSeat
    && sourceProof.attackerSeat !== sourceProof.sourceSeat
    && sourceProof.promptCardsIsAttackingPokemonList === true
    && sourceProof.promptEnergyListIsAttackingEnergySublist === true
  );
}

/**
 * Run frozen v10b phase A under Agent10's reducer-scoped marker and the
 * State-first, post-ID live Store.prompt/zone observer. No treatment phase is run.
 */
function main() {
  const registration = JSON.parse(fs.readFileSync(REGISTRATION_PATH, 'utf8'));
  assert.equal(registration.schema, 'agent36-issue25-public-prompt-zone-diagnostic-v7');
  assert.equal(registration.status, 'FROZEN_BEFORE_EXECUTION');
  assert.equal(gitBlobSha(REGISTRATION_PATH), EXPECTED_REGISTRATION_SHA,
    'Diagnostic registration changed; create a new versioned registration');

  const sourceRunnerPath = path.resolve(process.cwd(), registration.sourceRunnerPath);
  const sourceRegistrationPath = path.resolve(process.cwd(), registration.sourceRegistrationPath);
  const sourceMarkerPath = path.resolve(process.cwd(), registration.sourceMarkerPath);
  const observerPath = path.resolve(process.cwd(), registration.observerPath);

  assert.equal(gitBlobSha(sourceRunnerPath), registration.sourceRunnerGitBlobSha,
    'Pinned v10b source runner changed');
  assert.equal(gitBlobSha(sourceRegistrationPath), registration.sourceRegistrationGitBlobSha,
    'Pinned v10b source registration changed');
  assert.equal(gitBlobSha(sourceMarkerPath), registration.sourceMarkerGitBlobSha,
    'Pinned Agent10 Snap Trap marker changed');
  assert.equal(gitBlobSha(observerPath), registration.observerGitBlobSha,
    'Live prompt observer changed; create a new diagnostic registration');

  const sourceRegistration = JSON.parse(fs.readFileSync(sourceRegistrationPath, 'utf8'));
  assert.equal(sourceRegistration.schema, registration.sourceRegistrationSchema);
  assert.deepEqual(sourceRegistration.trials.map(trial => trial.id), registration.sourceTrialIds);
  assert.equal(sourceRegistration.pinnedTwinleaf, registration.pinnedTwinleafCommit);

  const sourceRunner = require(sourceRunnerPath);
  assert.equal(sourceRunner.VERSION, registration.sourceRunnerVersion);
  assert.equal(typeof sourceRunner.runPhase, 'function');
  assert.equal(typeof sourceRunner.phaseSummary, 'function');
  assert.equal(registration.phase, 'A');

  const sourceMarker = require(sourceMarkerPath);
  assert.equal(sourceMarker.VERSION, registration.sourceMarkerVersion);
  assert.equal(typeof sourceMarker.withStunfiskSnapTrapPromptMarker, 'function');
  const observer = require(observerPath);
  assert.equal(observer.VERSION, registration.observerVersion);
  assert.equal(typeof observer.withIssue25PublicPromptZoneAuditV7, 'function');

  let phase = null;
  let markerAudit = null;
  let promptZoneAudit = null;
  let thrown = null;
  try {
    const marked = sourceMarker.withStunfiskSnapTrapPromptMarker(
      getOriginForPrompt => observer.withIssue25PublicPromptZoneAuditV7(
        () => sourceRunner.runPhase(registration.phase),
        {getOriginForPrompt}
      )
    );
    phase = marked.result.result;
    promptZoneAudit = marked.result.audit;
    markerAudit = marked.audit;
  } catch (error) {
    markerAudit = error?.stunfiskSnapTrapPromptMarkerAudit ?? null;
    promptZoneAudit = error?.issue25PublicPromptZoneAuditV7 ?? null;
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
  const exactSourcePrompts = Array.isArray(markerAudit?.exactSourcePromptsStamped)
    ? markerAudit.exactSourcePromptsStamped
    : [];
  const blockedOrigins = Array.isArray(markerAudit?.blockedPromptOriginEvents)
    ? markerAudit.blockedPromptOriginEvents
    : [];
  const sourceProof = exactSourcePrompts.length === 1 ? exactSourcePrompts[0] : null;
  const origin = sourceProof;
  const promptEvents = Array.isArray(promptZoneAudit?.events)
    ? promptZoneAudit.events
    : [];
  const promptEventsById = origin
    ? promptEvents.filter(event => event.sourceOrigin === sourceProof
      && event.promptId === sourceProof.pendingNativePromptId)
    : [];
  const promptEvent = promptEventsById.length === 1 ? promptEventsById[0] : null;

  const sourceMarkerProof = Boolean(
    markerAudit?.version === sourceMarker.VERSION
    && markerAudit.printedSourceInvocations === 1
    && exactSourcePrompts.length === 1
    && markerAudit.hiddenCardIdentitiesInspected === false
    && markerAudit.rawStateDecoderExecutedByMarker === false
    && markerAudit.decisionActionsIssuedByMarker === 0
    && origin?.pendingNativePromptId
    && origin.promptIdAssignedByStore === true
    && (origin.promptIdBeforeStore === 0 || origin.promptIdBeforeStore === '0')
    && String(origin.promptIdAfterStore) === origin.pendingNativePromptId
    && origin.sourcePrinting === 'Galarian Stunfisk SSH'
    && origin.sourceAbility === 'Snap Trap'
    && origin.sourceCardPublic === true
    && origin.sourceZone === 'owner-active-pokemon-list'
    && origin.attackerZone === 'opponent-active-pokemon-list'
    && origin.sourceSeat === origin.promptOwnerSeat
    && origin.attackerSeat !== origin.sourceSeat
    && origin.promptCardsIsAttackingPokemonList === true
    && origin.promptEnergyListIsAttackingEnergySublist === true
    && origin.eligibleSubzone === 'attacker-active-energies'
    && origin.eligibleEnergyCount >= 1
    && origin.min === 1
    && origin.max === 1
    && origin.allowCancel === false
    && origin.isSecret === false
    && origin.promptSourceCardMetadataPresent === false
  );
  const zoneAndPromptIdProof = sourceMarkerProof
    && promptEventsById.length === 1
    && exactPromptZoneJoin(promptEvent, sourceProof);
  const joinedEvent = zoneAndPromptIdProof
    ? {
        ...promptEvent,
        sourceCardPublic: true,
        sourcePrinting: origin.sourcePrinting,
        sourceAttribution: 'agent30-reducer-scoped-marker-v2',
        sourceEffect: origin.sourceAbility,
        sourceMarker: {
          pendingNativePromptId: origin.pendingNativePromptId,
          sourceSeat: origin.sourceSeat,
          attackerSeat: origin.attackerSeat,
          promptCardsIsAttackingPokemonList: origin.promptCardsIsAttackingPokemonList,
          promptEnergyListIsAttackingEnergySublist: origin.promptEnergyListIsAttackingEnergySublist,
          eligibleEnergyCount: origin.eligibleEnergyCount
        }
      }
    : null;
  const selection = resolveBlockedPromptZoneEvent(
    quarantineRecords,
    joinedEvent ? [joinedEvent] : []
  );
  const phaseSummary = phase ? sourceRunner.phaseSummary(phase) : null;
  const status = zoneAndPromptIdProof
    && selection.status === 'FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED'
    ? 'FALLBACK_CAPTURED_SNAP_TRAP_SOURCE_AND_ACTIVE_ENERGY_ZONE_MATCHED'
    : 'FALLBACK_CAPTURED_BUT_SOURCE_ZONE_OR_QUARANTINE_JOIN_INCOMPLETE';
  const artifact = {
    schema: registration.schema,
    status,
    diagnosticRunnerPath: 'simulation/evaluation/agent36-issue25-public-prompt-zone-diagnostic-v7.cjs',
    diagnosticRunnerGitBlobSha: gitBlobSha(__filename),
    diagnosticRunnerCommit: process.env.GITHUB_SHA ?? null,
    registrationPath: 'results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v7-namespace-20261107.json',
    registrationGitBlobSha: gitBlobSha(REGISTRATION_PATH),
    sourceRunnerPath: registration.sourceRunnerPath,
    sourceRunnerGitBlobSha: registration.sourceRunnerGitBlobSha,
    sourceRunnerVersion: sourceRunner.VERSION,
    sourceRegistrationPath: registration.sourceRegistrationPath,
    sourceRegistrationGitBlobSha: registration.sourceRegistrationGitBlobSha,
    sourceRegistrationSchema: sourceRegistration.schema,
    sourceTrialIds: registration.sourceTrialIds,
    sourceMarkerPath: registration.sourceMarkerPath,
    sourceMarkerGitBlobSha: registration.sourceMarkerGitBlobSha,
    sourceMarkerVersion: sourceMarker.VERSION,
    observerPath: registration.observerPath,
    observerGitBlobSha: registration.observerGitBlobSha,
    observerVersion: observer.VERSION,
    pinnedTwinleafCommit: registration.pinnedTwinleafCommit,
    phase: registration.phase,
    nativeRootActionLimit: registration.nativeRootActionLimit,
    nativeAttemptCount: diagnostic?.nativeAttempts?.length ?? 0,
    quarantineRecordCount: quarantineRecords.length,
    quarantineRecords,
    markerAudit,
    promptZoneAudit,
    sourceProof,
    sourceOrigin: origin,
    blockedPromptOrigins: blockedOrigins,
    promptIdJoin: {
      sourceMarkerProof,
      markerOriginCount: promptEvents.filter(event => event.sourceOrigin === sourceProof).length,
      blockedPromptOriginCount: blockedOrigins.length,
      exactSourcePromptCount: exactSourcePrompts.length,
      livePromptEventCount: promptEvents.length,
      promptEventsByIdCount: promptEventsById.length,
      sourceOriginSameObject: Boolean(promptEvent && promptEvent.sourceOrigin === sourceProof),
      pendingNativePromptId: origin?.pendingNativePromptId ?? null,
      matchedPromptId: promptEvent?.promptId ?? null,
      zoneAndPromptIdProof,
      attackFingerprintSource: promptEvent?.currentAttack
        ? 'currentAttack'
        : promptEvent?.lastAttack ? 'lastAttack' : null
    },
    promptZoneSelectionVersion: PROMPT_ZONE_SELECTION_VERSION,
    promptZoneSelection: selection,
    phaseSummary,
    treatmentAttributionComputed: false,
    competitiveGamesQualified: 0,
    winRateEstimate: null,
    thrown,
    phaseManifest: phase?.manifest ?? null
  };

  const runId = process.env.GITHUB_RUN_ID ?? String(process.pid);
  const artifactPath = path.join(
    ARTIFACT_DIR,
    'run-' + runId + '-agent36-issue25-public-prompt-zone-diagnostic-v7.json'
  );
  const saved = writeAtomicJson(artifactPath, artifact);

  console.log(JSON.stringify({
    status: artifact.status,
    artifactPath: saved.file,
    artifactSha256: saved.sha256,
    nativeAttemptCount: artifact.nativeAttemptCount,
    quarantineRecordCount: artifact.quarantineRecordCount,
    markerOriginCount: promptEvents.filter(event => event.sourceOrigin === sourceProof).length,
    blockedPromptOriginCount: blockedOrigins.length,
    exactSourcePromptCount: exactSourcePrompts.length,
    livePromptEventCount: promptEvents.length,
    promptIdJoin: artifact.promptIdJoin,
    selectionStatus: selection.status
  }, null, 2));

  if (status !== 'FALLBACK_CAPTURED_SNAP_TRAP_SOURCE_AND_ACTIVE_ENERGY_ZONE_MATCHED') {
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {gitBlobSha, writeAtomicJson, exactPromptZoneJoin, main};
