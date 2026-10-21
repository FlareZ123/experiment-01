'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const runner = path.join(__dirname, 'agent41-bilateral-v2-development.cjs');
const commonEnvironment = Object.freeze({
  AGENT7_CANONICAL_ACTOR_POLICY_DEV: 'true',
  AGENT41_SOURCEFIRST_RETRO_DEV: 'true',
  AGENT5_COMPR_OPPORTUNITY_AUDIT: 'true',
  AGENT44_ACTOR_ENERGY_RECIPIENT_DEV: 'true',
  AGENT6_PAID_RETREAT_ROOT_DEV: 'true',
  AGENT3_SPECIAL_ENERGY_ROOT_DEV: 'true',
  AGENT30_PERFECTION_ROOT_DEV: 'true',
  AGENT3_PAPER_TERMINAL_ATTACK_KO_DEV: 'true',
  AGENT7_NATIVE_GENERIC_FALLBACK_DEV: 'true',
  AGENT41_PAPER_SUPPORTER_DEV: 'true',
  AGENT41_MANDATORY_OPTION_DEV: 'true',
  AGENT41_NATIVE_PRESSURE_DEV: 'true',
  AGENT30_CAPTURE_REJECTED_ACTION_DEV: 'true'
});
const sha256 = value => createHash('sha256').update(
  typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

/**
 * Write one independent job artifact atomically while holding its lock.
 * File names are dedicated to this paired manual experiment.
 * @param {string} name
 * @param {string} content
 */
function writeArtifact(name, content) {
  const target = path.join(root, name);
  const lock = target + '.lock';
  const temporary = target + '.' + process.pid + '.tmp';
  const fd = fs.openSync(lock, 'wx');
  try {
    fs.writeFileSync(temporary, content, 'utf8');
    fs.renameSync(temporary, target);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/**
 * Spawn each whole native engine treatment separately to eliminate
 * in-process Global/Random/Store hook state across the paired conditions.
 * @param {boolean} powerglass
 * @returns {{data:object, rawSha256:string}}
 */
function replay(powerglass) {
  const label = powerglass ? 'treatment' : 'control';
  const env = {
    ...process.env, ...commonEnvironment,
    AGENT41_ACTOR_POWERGLASS_ROOT_DEV: powerglass ? 'true' : 'false'
  };
  const run = spawnSync(process.execPath, [runner], {
    cwd: root, env, encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout: 10 * 60 * 1000
  });
  const filename = 'agent30-powerglass-' + label + '.json';
  if (run.error || run.status !== 0) {
    writeArtifact(filename, JSON.stringify({
      failedExecution: true,
      status: run.status, signal: run.signal,
      error: String(run.error ?? ''),
      stdout: run.stdout?.slice(-3000) ?? null,
      stderr: run.stderr?.slice(-6000) ?? null,
      competitiveQualifiedGames: 0
    }, null, 2) + '\n');
    throw Error('Native paired ' + label + ' failed: ' +
      String(run.error?.message || run.stderr?.slice(-1000) || run.status));
  }
  const data = JSON.parse(run.stdout);
  assert.equal(data.attempted, 4);
  assert.equal(data.sourceFirstRetrospective, true);
  assert.equal(data.competitiveQualifiedGames, 0);
  assert.equal(data.actorOnlyCompositionOptIn, true);
  assert.equal(data.actorNativeFallbackAttributionOptIn, true);
  assert.equal(data.rows.length, 4);
  for (const row of data.rows) {
    assert.equal(row.qualifiesForCompetitiveInference, false);
    if (row.actorOnlyDecisionCoverage) {
      const policy = row.actorOnlyDecisionCoverage.detailedComponentAudits.root;
      assert.equal(policy.powerglassRootOptIn, powerglass);
    }
  }
  writeArtifact(filename, run.stdout);
  return {data, rawSha256: sha256(run.stdout)};
}

/**
 * Find the first recorded actual Store root that differs between same-deal
 * controls, avoiding inference when either sequence was not captured.
 * @param {object} a
 * @param {object} b
 * @returns {object}
 */
function rootDifference(a, b) {
  const left = a.rootActionLedger, right = b.rootActionLedger;
  if (!Array.isArray(left) || !Array.isArray(right)) {
    return {status: 'one-or-both-root-ledgers-absent',
      leftCount: left?.length ?? null,
      rightCount: right?.length ?? null};
  }
  const n = Math.min(left.length, right.length);
  let samePrefix = 0;
  while (samePrefix < n &&
    JSON.stringify(left[samePrefix]) === JSON.stringify(right[samePrefix])) {
    samePrefix++;
  }
  const different = samePrefix < n || left.length !== right.length;
  return {
    status: different ? 'diverged' : 'same-ledger',
    samePrefix,
    leftCount: left.length,
    rightCount: right.length,
    controlNext: left[samePrefix] ?? null,
    treatmentNext: right[samePrefix] ?? null
  };
}

/** @param {object} row */
function summarize(row) {
  const rootAudit = row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  return {
    status: row.status ?? 'recorded',
    actualStarterSeat: row.actualStarterSeat ?? null,
    sourceDeal: row.sourceDealFingerprint ?? null,
    actionCount: row.actionCount ?? null,
    turns: row.turns ?? null,
    finished: row.finished ?? null,
    winner: row.winner ?? null,
    finalPrizes: row.finalPrizes ?? null,
    endReason: row.endReason ?? null,
    rootLedgerSha256: row.rootActionLedgerSha256 ?? null,
    candidateAttackDeclarationEvidence:
      row.sourceAttackSettlement?.candidateAttackDeclarationEvidence ??
      row.candidateAttackDeclarationEvidence ?? null,
    ownerRootPowerglassProposals: rootAudit?.typedIntentCounts?.['equip-powerglass'] ?? 0,
    ownerRootPowerglassPhysicallyConfirmed:
      rootAudit?.nativePhysicalConfirmedByIntent?.['equip-powerglass'] ?? 0,
    ownerRootNativeRejected: rootAudit?.rejectedActorRoots ?? null,
    ownerRootPerfectionProposals: rootAudit?.typedIntentCounts?.perfection ?? 0,
    nativePromptFallbacks: rootAudit?.unsupportedPromptTypes ?? null,
    nativeRejectedActionEvidence: row.nativeRejectedActionEvidence ?? null,
    competitiveQualified: false
  };
}

function runPaired() {
  const control = replay(false);
  const treatment = replay(true);
  const pairs = [];
  for (let i = 0; i < 4; i++) {
    const a = control.data.rows[i], b = treatment.data.rows[i];
    assert.equal(a.trial.id, b.trial.id, 'Treatment trial ordering changed');
    assert.equal(a.trial.seed, b.trial.seed, 'Treatment source seed changed');
    assert.equal(a.trial.candidateSlot, b.trial.candidateSlot);
    const fingerprintPresent = Boolean(
      a.sourceDealFingerprint && b.sourceDealFingerprint);
    if (fingerprintPresent) {
      assert.equal(a.sourceDealFingerprint, b.sourceDealFingerprint,
        'Control and treatment initial physical deals diverged');
    }
    pairs.push({
      trial: a.trial.id,
      targetRank: a.trial.rank,
      candidateId: a.trial.candidateId,
      initialPhysicalDealIdentical: fingerprintPresent ? true : 'unverified',
      actualStarterIdentical:
        a.actualStarterSeat !== undefined &&
        b.actualStarterSeat !== undefined ?
          a.actualStarterSeat === b.actualStarterSeat : 'unverified',
      rootDifference: rootDifference(a, b),
      control: summarize(a), treatment: summarize(b),
      competitiveQualified: false
    });
  }
  const summary = {
    schema: 'agent30-powerglass-same-head-sourcefirst-paired-development-v1',
    checkoutsIdentical: true,
    soleActorRootDifference: 'AGENT41_ACTOR_POWERGLASS_ROOT_DEV',
    enginePin: control.data.enginePin,
    registeredOriginalSelectedDeals: [
      {rank: 6, seed: 407516727, candidateSeat: 'B'},
      {rank: 11, seed: 482443328, candidateSeat: 'B'}
    ],
    controlRawSha256: control.rawSha256,
    treatmentRawSha256: treatment.rawSha256,
    controlAttempted: control.data.attempted,
    treatmentAttempted: treatment.data.attempted,
    controlErrors: control.data.errors,
    treatmentErrors: treatment.data.errors,
    pairs,
    competitiveQualifiedGames: 0,
    winRateCertified: false,
    interpretation: 'Retrospectively chosen pressure fixtures and weak generic fallback. Physical Tool acceptance alone is not a paid copied attack or a win.'
  };
  writeArtifact('agent30-powerglass-pair-summary.json',
    JSON.stringify(summary, null, 2) + '\n');
  return summary;
}
if (require.main === module) {
  const result = runPaired();
  process.stdout.write(JSON.stringify({
    schema: result.schema,
    controlAttempted: result.controlAttempted,
    treatmentAttempted: result.treatmentAttempted,
    controlErrors: result.controlErrors,
    treatmentErrors: result.treatmentErrors,
    trialStatuses: result.pairs.map(p => ({
      id: p.trial, sourceDealVerified: p.initialPhysicalDealIdentical,
      firstDifference: p.rootDifference.status === 'diverged' ?
        p.rootDifference.samePrefix : p.rootDifference.status,
      controlPowerglass: p.control.ownerRootPowerglassProposals,
      treatmentPowerglass: p.treatment.ownerRootPowerglassProposals,
      treatmentToolConfirmed:
        p.treatment.ownerRootPowerglassPhysicallyConfirmed,
      treatmentRejectedAction: p.treatment.nativeRejectedActionEvidence ?? null,
      controlAttacks: p.control.candidateAttackDeclarationEvidence?.length ?? null,
      treatmentAttacks: p.treatment.candidateAttackDeclarationEvidence?.length ?? null
    })),
    competitiveQualifiedGames: 0
  }, null, 2) + '\n');
}
module.exports = {commonEnvironment, rootDifference, summarize, runPaired};
