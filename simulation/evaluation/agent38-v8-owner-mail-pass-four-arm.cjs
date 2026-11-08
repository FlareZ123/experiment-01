'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  run: runNative
} = require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');

const VERSION = 'agent38-v8-owner-mail-after-pass-four-arm-v1';
const ROOT = path.resolve(__dirname, '../..');
const REGISTRATION = require('../../results/aichi-2026/registrations/agent38-v8-owner-mail-after-pass-four-arm-20261108.json');
const OUTPUT = path.join(ROOT, 'artifacts/agent43-v8-snaptrap-owner-root/agent38-early-mail-comparison.json');

const MECHANICAL = new Set([
  'PassTurnAction', 'WaitForOpponentAction',
  'WaitPromptAction', 'ResolvePromptAction'
]);

/**
 * Write an immutable machine-readable receipt and digest with an exclusive
 * file lock and atomic rename. Native Store may fail, so retain a redacted
 * failure receipt instead of creating a misleading successful experiment.
 *
 * @param {object} value
 * @returns {string}
 */
function save(value) {
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n');
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  const lockPath = OUTPUT + '.lock';
  const lockFd = fs.openSync(lockPath, 'wx');
  const temporary = OUTPUT + '.' + process.pid + '.' +
    crypto.randomUUID() + '.tmp';
  const digestPath = OUTPUT + '.sha256';
  const digestTemporary = digestPath + '.' + process.pid + '.' +
    crypto.randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temporary, bytes, {flag: 'wx'});
    fs.renameSync(temporary, OUTPUT);
    fs.writeFileSync(digestTemporary,
      digest + '  ' + path.basename(OUTPUT) + '\n', {flag: 'wx'});
    fs.renameSync(digestTemporary, digestPath);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    if (fs.existsSync(digestTemporary)) fs.unlinkSync(digestTemporary);
    fs.closeSync(lockFd);
    fs.unlinkSync(lockPath);
  }
  return OUTPUT;
}

/**
 * Determine the first native root divergence in a frozen same-seed arm.
 *
 * @param {object[]} control
 * @param {object[]} treatment
 * @returns {object|null}
 */
function firstDivergence(control, treatment) {
  const signature = root => JSON.stringify([
    root.action, root.seat, root.turn, root.promptId, root.responseType
  ]);
  const limit = Math.min(control.length, treatment.length);
  for (let index = 0; index < limit; index++) {
    if (signature(control[index]) !== signature(treatment[index]))
      return {index, control: control[index], treatment: treatment[index]};
  }
  if (control.length !== treatment.length)
    return {index: limit, control: control[limit] ?? null,
      treatment: treatment[limit] ?? null};
  return null;
}

/**
 * One real Mail action, then the first later opponent strategic action and
 * one subsequent source-own-turn strategic action, using actual Store roots.
 * @param {object} mail
 * @param {object[]} tape
 * @returns {object}
 */
function mailContinuation(mail, tape) {
  const rootIndex = tape.findIndex(entry =>
    entry.ordinal === mail.ordinal &&
    entry.ownerMailAfterPassAction === true);
  assert.ok(rootIndex >= 0);
  const after = tape.slice(rootIndex + 1);
  const opponent = after.find(entry =>
    entry.seat !== mail.seat && !MECHANICAL.has(entry.action)) ?? null;
  const nextSource = opponent ? after.find(entry =>
    entry.seat === mail.seat &&
    entry.turn > opponent.turn &&
    !MECHANICAL.has(entry.action)
  ) ?? null : null;
  return {
    mailActionOrdinal: mail.ordinal,
    seat: mail.seat,
    turn: mail.turn,
    opponentMeaningfulRoot: opponent,
    sourceOwnTurnMeaningfulRoot: nextSource,
    continuityPassed: Boolean(opponent && nextSource)
  };
}

/** @returns {object} Execute the preregistered actual native A/B comparison. */
function run() {
  assert.equal(REGISTRATION.schema, VERSION);
  assert.equal(REGISTRATION.status, 'FROZEN_BEFORE_EXECUTION');
  assert.equal(REGISTRATION.nativeRootActionsPerArm, 260);
  assert.equal(REGISTRATION.trials.length, 4);
  const options = {ownerAbilityConfirm: true, captureRootTape: true};
  const control = runNative(options);
  const treatment = runNative({...options, ownerMailAfterPass: true});
  const ids = REGISTRATION.trials.map(trial => trial.id);
  assert.deepEqual(control.exactOriginalTrialIds, ids);
  assert.deepEqual(treatment.exactOriginalTrialIds, ids);
  assert.equal(control.preservedNativeRootCap, 260);
  assert.equal(treatment.preservedNativeRootCap, 260);
  assert.ok(treatment.ownerMailAudit);
  assert.equal(treatment.ownerMailAudit.registeredTrialIds.length, ids.length);
  assert.deepEqual(treatment.ownerMailAudit.registeredTrialIds, ids);
  assert.equal(treatment.ownerMailAudit.opponentPrivateZonesRead, false);
  const panel = REGISTRATION.trials.map(trial => {
    const before = control.attempts.find(row => row.id === trial.id);
    const after = treatment.attempts.find(row => row.id === trial.id);
    assert.ok(before && after);
    assert.equal(before.seed, trial.seed);
    assert.equal(after.seed, trial.seed);
    const baselineTape = control.publicRootTape.filter(
      row => row.trialId === trial.id);
    const treatmentTape = treatment.publicRootTape.filter(
      row => row.trialId === trial.id);
    const mailRoots = treatmentTape.filter(
      row => row.ownerMailAfterPassAction === true);
    const continuations = mailRoots.map(mail =>
      mailContinuation(mail, treatmentTape));
    const choiceReceipts = treatment.ownerMailAudit.revealedTrainers.filter(
      row => row.trialId === trial.id);
    return {
      trialId: trial.id,
      rank: trial.rank,
      seed: trial.seed,
      candidateSeat: trial.candidateSeat,
      sourceSeat: trial.sourceSeat,
      firstRootDivergence: firstDivergence(baselineTape, treatmentTape),
      baseline: {
        actionCount: before.nativeActionCount,
        status: before.nativeStatus,
        finished: before.nativeFinished,
        winner: before.nativeWinner,
        endReason: before.nativeEndReason,
        finalPrizes: before.nativeFinalPrizes,
        blockedStage: before.nativeFailureStage
      },
      treatment: {
        actionCount: after.nativeActionCount,
        status: after.nativeStatus,
        finished: after.nativeFinished,
        winner: after.nativeWinner,
        endReason: after.nativeEndReason,
        finalPrizes: after.nativeFinalPrizes,
        blockedStage: after.nativeFailureStage
      },
      nativeAcceptedMailRoots: mailRoots,
      nativeMailContinuations: continuations,
      ownerMailTrainerSelectionReceipts: choiceReceipts,
      actualFullSequenceGate: continuations.some(x => x.continuityPassed) &&
        choiceReceipts.length > 0
    };
  });
  const audit = treatment.ownerMailAudit;
  const positiveMailRoots = panel.reduce((n, p) =>
    n + p.nativeAcceptedMailRoots.length, 0);
  const physicalSelections = audit.physicalTrainerToHandBySeat[0] +
    audit.physicalTrainerToHandBySeat[1];
  const noUnsettledPrompts = audit.unsettledPromptActions === 0 &&
    audit.rejectedPromptActions === 0;
  const acceptedOwnerMail = positiveMailRoots > 0 &&
    physicalSelections > 0 &&
    noUnsettledPrompts;
  const fullSequence = panel.some(p => p.actualFullSequenceGate);
  return {
    schema: VERSION,
    registrationPath: 'results/aichi-2026/registrations/agent38-v8-owner-mail-after-pass-four-arm-20261108.json',
    runnerGitSha: process.env.GITHUB_SHA ?? null,
    enginePinned: REGISTRATION.cardsUnchanged,
    exactOriginalTrialIds: ids,
    nativeRootCap: 260,
    exactControlOptions: options,
    exactTreatmentOptions: {...options, ownerMailAfterPass: true},
    audit,
    control,
    treatment,
    panel,
    acceptance: {
      positiveMailRoots,
      physicallySelectedTrainers: physicalSelections,
      noUnsettledPrompts,
      acceptedOwnerMail,
      fullSequence,
      status: acceptedOwnerMail && fullSequence ?
        'EARLY_MAIL_OWNER_ACTION_AND_OPPONENT_NEXT_TURN_OBSERVED' :
        'DEVELOPMENTAL_GATE_UNMET'
    },
    competitiveGamesQualified: 0,
    selectedFinalFixedSixty: false,
    estimatedWinRate: null
  };
}

if (require.main === module) {
  let artifact;
  try {
    artifact = run();
  } catch (error) {
    artifact = {
      schema: VERSION,
      status: 'NATIVE_OR_CONTRACT_ERROR',
      failure: {name: error.name, message: error.message},
      competitiveGamesQualified: 0,
      estimatedWinRate: null
    };
    process.exitCode = 1;
  }
  const filename = save(artifact);
  process.stdout.write(JSON.stringify({
    schema: artifact.schema,
    status: artifact.acceptance?.status ?? artifact.status,
    filename,
    nativeMailRoots: artifact.acceptance?.positiveMailRoots ?? 0,
    physicallySelectedTrainers:
      artifact.acceptance?.physicallySelectedTrainers ?? 0,
    fullSequence: artifact.acceptance?.fullSequence ?? false,
    failure: artifact.failure ?? null
  }, null, 2) + '\n');
  if (!artifact.acceptance?.acceptedOwnerMail) process.exitCode = 1;
}

module.exports = {VERSION, REGISTRATION, firstDivergence, mailContinuation, run, save};
