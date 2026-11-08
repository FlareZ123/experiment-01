'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {run: runNative} =
  require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');
const {REGISTRATION, firstDivergence} =
  require('./agent38-v8-owner-mail-pass-four-arm.cjs');
const {HANDIWORK} =
  require('../twinleaf/agent9-mail-selected-handiwork-follow.cjs');

const VERSION = 'agent9-v8-mail-handiwork-native-four-arm-v1';
const OUTPUT = path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent9-mail-handiwork-four-arm.json');

/**
 * Require an actual opponent strategic root and source own-turn root strictly
 * after the native action; defensive prompt acknowledgements are excluded.
 * @param {number} ownerSeat
 * @param {number} rootOrdinal
 * @param {object[]} tape
 * @returns {object}
 */
function afterSupporterSequence(ownerSeat, rootOrdinal, tape) {
  const from = tape.findIndex(r => r.ordinal === rootOrdinal);
  if (from < 0) return {opponent: null, sourceNextTurn: null, settled: false};
  const substantive = r => !new Set([
    'PassTurnAction', 'ResolvePromptAction', 'WaitPromptAction',
    'WaitForOpponentAction'
  ]).has(r.action);
  const later = tape.slice(from + 1);
  const opponent = later.find(r => r.seat !== ownerSeat && substantive(r)) ?? null;
  const source = opponent ? later.find(r =>
    r.seat === ownerSeat && r.turn > opponent.turn && substantive(r)) ?? null
    : null;
  return {
    opponent: opponent ? {ordinal: opponent.ordinal, turn: opponent.turn,
      action: opponent.action} : null,
    sourceNextTurn: source ? {ordinal: source.ordinal, turn: source.turn,
      action: source.action} : null,
    settled: Boolean(opponent && source)
  };
}

/**
 * Save one immutable JSON receipt and SHA digest with exclusive file lock.
 * @param {object} data
 * @returns {string}
 */
function save(data) {
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  const buffer = Buffer.from(JSON.stringify(data, null, 2) + '\n');
  const digest = crypto.createHash('sha256').update(buffer).digest('hex');
  const fd = fs.openSync(OUTPUT + '.lock', 'wx');
  const tmp = OUTPUT + '.' + process.pid + '.' + crypto.randomUUID() + '.tmp';
  const sha = OUTPUT + '.sha256';
  const shaTmp = sha + '.' + process.pid + '.' + crypto.randomUUID() + '.tmp';
  try {
    fs.writeFileSync(tmp, buffer, {flag: 'wx'});
    fs.renameSync(tmp, OUTPUT);
    fs.writeFileSync(shaTmp, digest + '  ' + path.basename(OUTPUT) + '\n',
      {flag: 'wx'});
    fs.renameSync(shaTmp, sha);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    if (fs.existsSync(shaTmp)) fs.unlinkSync(shaTmp);
    fs.closeSync(fd);
    fs.unlinkSync(OUTPUT + '.lock');
  }
  return OUTPUT;
}

/** @returns {object} Execute paired, same-seed original-source native policy. */
function run() {
  assert.equal(REGISTRATION.trials.length, 4);
  const common = {ownerAbilityConfirm: true, ownerMailAfterPass: true,
    captureRootTape: true};
  const baseline = runNative(common);
  const treatment = runNative({...common, followMailHandiwork: true});
  const expected = REGISTRATION.trials.map(t => t.id);
  assert.deepEqual(baseline.exactOriginalTrialIds, expected);
  assert.deepEqual(treatment.exactOriginalTrialIds, expected);
  assert.equal(baseline.preservedNativeRootCap, 260);
  assert.equal(treatment.preservedNativeRootCap, 260);
  const audit = treatment.ownerMailAudit;
  assert.deepEqual(audit.registeredTrialIds, expected);
  assert.equal(audit.opponentPrivateZonesRead, false);

  const panels = REGISTRATION.trials.map(trial => {
    const before = baseline.attempts.find(r => r.id === trial.id);
    const after = treatment.attempts.find(r => r.id === trial.id);
    assert.ok(before && after);
    assert.equal(before.seed, trial.seed);
    assert.equal(after.seed, trial.seed);
    const firstTape = baseline.publicRootTape.filter(r => r.trialId === trial.id);
    const secondTape = treatment.publicRootTape.filter(r => r.trialId === trial.id);
    const handiwork = audit.handiworkFromMailNativeDeckChanges
      .filter(row => row.trialId === trial.id);
    const played = audit.selectedTrainerLaterPlayed
      .filter(row => row.trialId === trial.id && row.printing === HANDIWORK);
    const playedRoots = secondTape.filter(row =>
      row.previouslyMailSelectedTrainerPlayed === true &&
      row.action === 'PlayCardAction' &&
      handiwork.some(item => item.ownerSeat === row.seat &&
        item.turnBefore === row.turn));
    return {
      id: trial.id, seed: trial.seed,
      sourceSeat: trial.sourceSeat,
      firstDivergence: firstDivergence(firstTape, secondTape),
      control: {status: before.nativeStatus, finished: before.nativeFinished,
        winner: before.nativeWinner, endReason: before.nativeEndReason,
        finalPrizes: before.nativeFinalPrizes,
        rootCount: before.nativeActionCount},
      treatment: {status: after.nativeStatus,
        nativeFailureStage: after.nativeFailureStage,
        nativeFailureTurn: after.nativeFailureTurn,
        nativeFailureDiagnostic: after.nativeFailureDiagnostic ?? null,
        finished: after.nativeFinished,
        winner: after.nativeWinner, endReason: after.nativeEndReason,
        finalPrizes: after.nativeFinalPrizes,
        rootCount: after.nativeActionCount},
      nativeAcceptedHandiwork: handiwork,
      sourceMailSelectedHandiworkPlayed: played,
      nativeRootPlayed: playedRoots.map(root => ({
        ordinal: root.ordinal, seat: root.seat, turn: root.turn,
        continuation: afterSupporterSequence(
          root.seat, root.ordinal, secondTape)
      }))
    };
  });
  const acted = panels.reduce((n,p) => n+p.nativeAcceptedHandiwork.length,0);
  const nativeTreatmentErrors = panels.filter(p =>
    p.treatment.status === 'engine-error' ||
    (p.treatment.endReason === null && p.treatment.rootCount === null));
  assert.equal(acted,audit.handiworkFromMailAccepted);
  return {
    schema: VERSION,
    gitHead: process.env.GITHUB_SHA ?? null,
    pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registeredOriginalArms: expected,
    experimentalNativeActions: acted,
    offers: audit.handiworkFromMailOffers,
    rejected: audit.handiworkFromMailRejected,
    nativeTreatmentErrors: nativeTreatmentErrors.map(p => p.id),
    physicalDeckCardsRemovedAtDispatch:
      panels.reduce((n,p) => n+p.nativeAcceptedHandiwork.reduce(
        (m,r) => m+r.physicalDeckCardsRemoved,0),0),
    arms: panels,
    qualification: {completeCompetentGames: 0, finalDeckSelected: false,
      matchupsMeasured: 0, winRate: null,
      status: nativeTreatmentErrors.length > 0 ? 'NATIVE_TREATMENT_ENGINE_ERROR'
        : acted > 0 ? 'NATIVE_SUPPORTER_ACCEPTED_DEVELOPMENTAL'
        : 'NO_NATIVE_HANDIWORK_TREATMENT_ACCEPTED'}
  };
}

if (require.main === module) {
  let result;
  try { result = run(); }
  catch (error) {
    result = {schema: VERSION, failure: {name: error.name,
      message: error.message, stack: String(error.stack).slice(0,1200)},
      qualification: {completeCompetentGames: 0, winRate: null,
        status: 'NATIVE_RUN_ERROR'}};
    process.exitCode = 1;
  }
  const saved = save(result);
  if (result.qualification.status === 'NATIVE_TREATMENT_ENGINE_ERROR')
    process.exitCode = 1;
  process.stdout.write(JSON.stringify({schema: result.schema,
    saved, status: result.qualification.status,
    handiworkNativeActions: result.experimentalNativeActions ?? 0,
    physicalDeckCardsRemovedAtDispatch:
      result.physicalDeckCardsRemovedAtDispatch ?? 0,
    arms: result.arms?.map(a => ({id: a.id,
      n: a.nativeAcceptedHandiwork.length,
      before: a.control.endReason, after: a.treatment.endReason,
      prizesBefore: a.control.finalPrizes,
      prizesAfter: a.treatment.finalPrizes,
      continuations: a.nativeRootPlayed.map(r => r.continuation.settled)})),
    failure: result.failure ?? null}, null, 2) + '\n');
}
module.exports = {VERSION, afterSupporterSequence, run, save};
