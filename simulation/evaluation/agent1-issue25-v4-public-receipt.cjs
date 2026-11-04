'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {executionRow} =
  require('./agent7-issue25-v3-executed-receipt.cjs');
const VERSION = 'agent1-issue25-joined-v4-public-execution-receipt-v1';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

/**
 * Bind all raw native outcomes to registered ID and retain errors and capped
 * trials. Native public action ledger is emitted without owner concealed hands.
 * @param {{manifest:object,diagnostic:object,rawDevelopment:object|null}} execution
 * @returns {object}
 */
function buildReceipt(execution) {
  const {manifest, diagnostic, rawDevelopment} = execution;
  assert.equal(manifest.policyEntryPoint,
    'simulation/evaluation/agent1-issue25-joined-two-seat-attacks-v4.cjs');
  assert.ok(Array.isArray(diagnostic.registered));
  assert.ok(Array.isArray(diagnostic.attemptedRows));
  const rawRows = rawDevelopment?.rows ?? [];
  assert.ok(Array.isArray(rawRows));
  const rawById = new Map();
  const conflicts = [];
  for (const row of rawRows) {
    const nestedId = row.trial?.id ?? null;
    const flatId = row.id ?? null;
    if (nestedId !== null && flatId !== null && nestedId !== flatId) {
      conflicts.push({nestedId,flatId});
      continue;
    }
    const id = nestedId ?? flatId;
    if (typeof id !== 'string') {
      conflicts.push({missingRawId: true});
      continue;
    }
    if (rawById.has(id)) {
      conflicts.push({duplicateRawId: id});
      rawById.set(id, null);
    } else rawById.set(id, row);
  }
  const attempts = diagnostic.attemptedRows.map(status =>
    executionRow(status, rawById.get(status.id) ?? null));
  const exactJoin = conflicts.length === 0 &&
    rawRows.length === attempts.length &&
    attempts.every(row => row.actualRawTrialId === row.id);
  const presentSeats = [...new Set(attempts
    .map(row => row.originalSourceSeat)
    .filter(seat => seat === 0 || seat === 1))].sort();
  const publicRootLedgersComplete = attempts.every(row =>
    row.publicRootActionCount !== null &&
    row.publicRootActionsTruncated === false);
  const rawResourceAuditRows = rawRows.filter(row =>
    row?.policyAudit?.twoSeatVersion !== undefined).length;

  return {
    schema: VERSION,
    provenance: {
      reporterSourceSha256: sha256(fs.readFileSync(__filename)),
      githubRunId: process.env.GITHUB_RUN_ID ?? null,
      githubRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
      githubCommit: process.env.GITHUB_SHA ?? null,
      observedRepositoryCommit: manifest.observedRepositoryGitCommit ?? null,
      observedTwinleafCommit: manifest.observedTwinleafGitCommit ?? null,
      readout: 'Native source-derived public action/terminal status only; no concealed deck order'
    },
    actuallyExecutingManifest: manifest,
    registration: {
      expectedIds: diagnostic.registered,
      returnedIds: diagnostic.attemptedRows.map(row => row.id),
      registeredReconciliation: diagnostic.registeredAttemptReconciliation,
      rawRowReconciliation: diagnostic.rawRowIdentityReconciliation,
      rawIdentityConflicts: conflicts,
      exactJoinedByTrialId: exactJoin
    },
    attempts,
    observedSelectedAttackLayers: {
      futureSight: diagnostic.sourceStampedFutureSight ?? null,
      nightWatch: diagnostic.sourceStampedNightWatch ?? null,
      printingAttribution: diagnostic.printedAttackOrigins ?? null,
      firstPromptEnvelope:
        diagnostic.audit?.firstBlockedPromptEnvelope ?? null
    },
    developmentGate: {
      symmetricRunnerActuallyOptedIn:
        manifest.actualRunnerConfirmedOption === true,
      sourceSpecificResourceScriptOptedOut:
        manifest.originalSourceRankScriptsDisabledByOptIn === true,
      resourcePolicyVersionObservedPerNativeRow: rawResourceAuditRows,
      originalSourcePhysicalSeatsSeen: presentSeats,
      exactRegisteredReturn:
        diagnostic.allRegisteredAttemptsReturned === true && exactJoin,
      completePublicRootsAllArms: publicRootLedgersComplete,
      privateEntropyCommitmentRecorded:
        typeof diagnostic.nightWatchSeedCommitmentSha256 === 'string',
      nativeStorePaymentsPaperValid: 'UNRESOLVED',
      ownerInformationNoninterference: 'UNRESOLVED',
      promptRandomnessPerIndependentGame: 'UNRESOLVED',
      matchClock: 'UNRESOLVED',
      all32OriginalDecks: 'FAIL',
      competitiveGameQualified: false,
      fieldWinRateEstablished: false,
      overall: 'FAIL-development-only'
    },
    qualifiedCompetitiveGames: 0,
    verdict: diagnostic.verdict
  };
}

/**
 * Exclusive lock + atomic rename. Never expose a half-written native receipt
 * as successful evidence.
 * @param {object} execution
 * @param {string} directory
 * @returns {{file:string,sha256:string,bytes:number}}
 */
function writeReceipt(execution, directory) {
  const content = JSON.stringify(buildReceipt(execution), null, 2) + '\n';
  const bytes = Buffer.from(content);
  assert.ok(bytes.length <= 8*1024*1024, 'Native archive exceeded 8 MiB');
  fs.mkdirSync(directory, {recursive:true});
  const lock = path.join(directory, '.agent1-issue25-v4.lock');
  const fd = fs.openSync(lock, 'wx');
  const file = path.join(directory, 'issue25-joined-v4.json');
  const digestFile = path.join(directory, 'issue25-joined-v4.sha256');
  const tmp = file + '.' + process.pid + '.tmp';
  const digestTmp = digestFile + '.' + process.pid + '.tmp';
  const digest = sha256(bytes);
  try {
    fs.writeFileSync(tmp, bytes, {flag:'wx'});
    fs.renameSync(tmp, file);
    fs.writeFileSync(digestTmp,
      digest + '  issue25-joined-v4.json\n', {flag:'wx'});
    fs.renameSync(digestTmp, digestFile);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    if (fs.existsSync(digestTmp)) fs.unlinkSync(digestTmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {file,sha256:digest,bytes:bytes.length};
}

module.exports = {VERSION,buildReceipt,writeReceipt};
