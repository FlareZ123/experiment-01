'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash, randomUUID} = require('node:crypto');
const v1 = require('./agent36-v8-snap-trap-vertical-slice-v1.cjs');
const {runSelectedIssue25V0} = require('./agent36-issue25-selected-v0.cjs');
const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
const {withStewardOwnerPromptFrontier} = require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts} = require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withCommonOwnerThornsRoot} = require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches} = require('./agent36-issue25-common-v7.cjs');
const {withSnapTrapInsideNativeMatchesV3} =
  require('../twinleaf/agent36/snap-trap-native-match-integration-v3.cjs');

const VERSION = 'agent43-snaptrap-owner-root-diagnostic-v1';
const ROOT = path.resolve(__dirname, '../..');
const ROOT_LIMIT = 260;
const REGISTRATION = require('../../results/aichi-2026/registrations/agent36-v8-snap-trap-vertical-slice-v1-20261108.json');

/**
 * Keep the original opponent, candidate, physical seeds and policy layers.
 * Diagnostic actor-only fallback recording is the sole intervention.
 * @returns {object}
 */
function run() {
  const registered = v1.trials().filter(t => t.candidateSlot === 'A');
  assert.equal(registered.length, 2);
  assert.deepEqual(registered.map(t => t.repeat), [312, 213]);
  const headless = require('../twinleaf/headless.cjs');
  let selectedResult = null;
  const execute = () => withCommonOwnerThornsRoot(() => {
    selectedResult = runSelectedIssue25V0({
      runner: options => runDevelopment({
        ...options,
        actorOnlyComposition: true,
        sourceIndependentCommonPolicy: true,
        bilateralSpecialEnergyRoot: true,
        nativeAcceptedTargets: true,
        nativeRootActionLimit: ROOT_LIMIT,
        registeredTrials: registered.map(t => ({...t})),
        registeredFrameName: REGISTRATION.registeredFrameName,
        allowAdditionalOriginalSourceRanks: true,
        allowSingleCandidatePerGroup: true,
        capturePublicAttackTransitions: true,
        nativeSetupCoinChoiceReceipt: true,
        isolatePolicyRandomness: true,
        isolatePhysicalShuffleRandomnessAfterSetup: true,
        // The following flags capture the first actor-public root that
        // would otherwise invoke the quarantined native raw-State decoder.
        nativeOwnerTrainerFallback: true,
        ownerFallbackDiagnosticView: true,
        actorGenericFallbackAttribution: true,
        firstBlockedPromptContractObserver: true
      }),
      layers: {firstBlockedPromptEnvelope: withStewardOwnerPromptFrontier},
      registeredTrialIds: registered.map(t => t.id),
      nativeRootActionLimit: ROOT_LIMIT
    });
    return selectedResult;
  });
  const integrated = withSnapTrapInsideNativeMatchesV3(() =>
    withOwnerVoltAcrossNativeMatches(() =>
      withStewardInnermostOwnerPrompts(execute, {headless}), {headless}
    ).result.result,
  {headless});
  const result = selectedResult ?? integrated.result;
  assert.ok(result);
  const rows = result.rawDevelopment?.rows ?? [];
  const attempts = registered.map(trial => {
    const row = rows.find(x => (x.trial?.id ?? x.id) === trial.id) ?? {};
    const first = row.actorNativeTrainerFallbackAbortAudit?.firstUnsupportedOwnerRoot ?? null;
    const native = row.nativeAbortEvidence ?? row.nativeAbortProvenance ?? {};
    const view = first?.ownerView ?? null;
    const actionOrdinal = native.actionOrdinal ?? null;
    const declaredError = row.error?.code ?? native.errorCode ??
      result.diagnostic?.thrownCode ?? null;
    const ownerPublic = view ? {
      actorSeat: view.actorSeat,
      globalTurn: view.globalTurn,
      phase: view.phase,
      ownHand: view.ownHand,
      ownPublic: view.ownPublic,
      opponentPublic: view.opponentPublic,
      ownTurnResources: view.ownTurnResources
    } : null;
    return {
      id: trial.id,
      candidateSeat: trial.candidateSlot === 'A' ? 0 : 1,
      sourceSeat: trial.candidateSlot === 'A' ? 1 : 0,
      seed: trial.seed,
      firstUnsupportedOwnerRootCaptured: ownerPublic !== null,
      ownerPublic,
      actorObservationSha256: first?.ownerVisibleSha256 ?? null,
      hiddenSourceIdentitiesIncluded: first?.hiddenSourceIdentitiesIncluded ?? null,
      rejectedActionOrdinal: actionOrdinal,
      acceptedRootLedgerLength: native.rootActionLedger?.length ?? null,
      quarantineError: declaredError,
      errorMessage: row.error?.message ?? null,
      promptType: row.firstBlockedPromptContract?.promptType ?? null
    };
  });
  const report = {
    schema: VERSION,
    originalV1RegistrationPath: v1.REGISTRATION_PATH,
    frozenOriginalTrialIds: registered.map(t => t.id),
    originalSeeds: registered.map(t => t.seed),
    nativeRootLimit: ROOT_LIMIT,
    experimentalChange: 'owner-public-first-unsupported-root-diagnostic-only',
    nativeRawStateDecoderAllowed: false,
    fullOpponentAndCandidateSixtiesUnchanged: true,
    nativeAttemptCount: rows.length,
    attempts,
    allFirstUnsupportedCaptured: attempts.every(a => a.firstUnsupportedOwnerRootCaptured),
    policyStrengthInferenceAllowed: false,
    competitiveGamesQualified: 0
  };
  return report;
}

/**
 * Preserve a reproducible owner-public diagnostic through an exclusive lock.
 * @param {object} value
 * @returns {string}
 */
function writeArchive(value) {
  const dir = path.join(ROOT, 'artifacts/agent43-v8-snaptrap-owner-root');
  fs.mkdirSync(dir, {recursive: true});
  const target = path.join(dir, 'owner-root.json');
  const lock = target + '.lock';
  const fd = fs.openSync(lock, 'wx');
  const tmp = target + '.' + process.pid + '.' + randomUUID() + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
    fs.renameSync(tmp, target);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return target;
}

if (require.main === module) {
  const output = run();
  const target = writeArchive(output);
  const viewSummary = output.attempts.map(a => ({
    id: a.id,
    sourceSeat: a.sourceSeat,
    firstUnsupportedOwnerRootCaptured: a.firstUnsupportedOwnerRootCaptured,
    rejectedActionOrdinal: a.rejectedActionOrdinal,
    error: a.quarantineError,
    actorSeat: a.ownerPublic?.actorSeat ?? null,
    turn: a.ownerPublic?.globalTurn ?? null,
    hand: a.ownerPublic?.ownHand ?? null,
    active: a.ownerPublic?.ownPublic?.active ?? null,
    bench: a.ownerPublic?.ownPublic?.bench ?? null,
    opponentActive: a.ownerPublic?.opponentPublic?.active ?? null,
    resources: a.ownerPublic?.ownTurnResources ?? null
  }));
  process.stdout.write(JSON.stringify({
    schema: VERSION,
    target,
    status: output.allFirstUnsupportedCaptured ? 'ACTIONABLE_OWNER_ROOTS' :
      'PARTIAL_OR_NO_OWNER_ROOT_CAPTURE',
    trials: viewSummary,
    competitiveGamesQualified: 0
  }, null, 2) + '\n');
  if (!output.allFirstUnsupportedCaptured) process.exitCode = 1;
}

module.exports = {VERSION, ROOT_LIMIT, run, writeArchive};
