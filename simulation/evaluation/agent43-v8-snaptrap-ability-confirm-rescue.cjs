'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const {run} = require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');

const VERSION = 'agent43-v8-snaptrap-ability-confirm-rescue-v1';
const DIR = path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root');

/**
 * Prospectively turn on only the already-existing, source-attributed,
 * both-seat owner ability confirmation policy; every trial, seed, sixty,
 * policy layer and native action budget remains identical to the control.
 */
function runTreatment() {
  const result = run({ownerAbilityConfirm: true});
  const events = result.ownerAbilityConfirmAudit?.confirmEvents ?? [];
  const relevant = result.attempts.filter(x =>
    x.id === '3:312:A:champion-reference' ||
    x.id === '3:213:A:champion-reference'
  );
  assert.equal(relevant.length, 2);
  const byTrial = relevant.map(x => {
    const originalBlockedOrdinal = x.id.startsWith('3:312:') ? 32 : 99;
    return {
      id: x.id,
      originalBlockedOrdinal,
      treatmentFailureOrdinal: x.nativeFailureActionOrdinal,
      treatmentFailureStage: x.nativeFailureStage,
      treatmentAcceptedRootCount: x.acceptedRootCount,
      treatmentPromptCount: x.promptCount,
      treatmentNativeStatus: x.nativeStatus,
      treatmentFinished: x.nativeFinished,
      treatmentWinner: x.nativeWinner,
      treatmentEndReason: x.nativeEndReason,
      treatmentFinalPrizes: x.nativeFinalPrizes,
      treatmentTurnCount: x.nativeTurnCount,
      nowPastOriginalBlock:
        x.nativeFailureActionOrdinal == null ||
        x.nativeFailureActionOrdinal > originalBlockedOrdinal,
      recentPrompts: x.recentPromptEvents.slice(-4),
      unresolvedPrompts: x.pendingPrompts.slice(-4)
    };
  });
  const summary = {
    schema: VERSION,
    sourceRunnerSchema: result.schema,
    unchangedRegisteredTrialIds: result.exactOriginalTrialIds,
    unchangedFrameName: result.originalFrameName,
    sameFourSixtiesAndPhysicalSeeds: true,
    unchangedNativeRootLimit: result.preservedNativeRootCap,
    ownerAbilityConfirmOptIn: result.experimentalOwnerAbilityConfirm,
    confirmPolicyVersion: result.ownerAbilityConfirmAudit?.version ?? null,
    confirmOffers: result.ownerAbilityConfirmAudit?.confirmOffers ?? 0,
    confirmSettled: result.ownerAbilityConfirmAudit?.confirmSettled ?? 0,
    confirmUnsettled: result.ownerAbilityConfirmAudit?.confirmUnsettled ?? 0,
    confirmEvents: events,
    radiantSearchEvents: result.ownerAbilityConfirmAudit?.radiantSearchEvents ?? [],
    articunoMoveEnergyEvents:
      result.ownerAbilityConfirmAudit?.articunoMoveEnergyEvents ?? [],
    nativeQuarantineFallbackCalls: result.nativeQuarantineFallbackCalls,
    originalBaselineFailureOrdinals: [32, 99],
    perOriginallyBlockedTrial: byTrial,
    allFourTrials: result.attempts.map(x => ({
      id:x.id,candidateSeat:x.candidateSeat,sourceSeat:x.sourceSeat,
      acceptedRoots:x.acceptedRootCount,
      nativeStatus:x.nativeStatus,finished:x.nativeFinished,
      winner:x.nativeWinner,endReason:x.nativeEndReason,
      turns:x.nativeTurnCount,actionCount:x.nativeActionCount,
      finalPrizes:x.nativeFinalPrizes,
      finalPublicBoard:x.nativeFinalPublicBoard,
      rootActionMix:x.nativeRootActionMix,
      lastThirtyPublicRoots:x.nativeFinalThirtyPublicRoots,
      nativeFailureStage:x.nativeFailureStage
    })),
    nativeFinishedGameCount: result.attempts.filter(x =>
      x.nativeFinished === true).length,
    allOriginallyBlockedTrialsAdvanced: byTrial.every(x => x.nowPastOriginalBlock),
    competitiveGamesQualified: 0,
    winRateReported: false
  };
  return summary;
}

/** Atomic exclusive output of all native treatment evidence. */
function writeTreatment(output) {
  fs.mkdirSync(DIR, {recursive: true});
  const target = path.join(DIR, 'ability-confirm-rescue.json');
  const fd = fs.openSync(target + '.lock', 'wx');
  const temp = target + '.' + process.pid + '.' + randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temp, JSON.stringify(output, null, 2) + '\n',
      {flag:'wx'});
    fs.renameSync(temp, target);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(target + '.lock');
  }
  return target;
}

if (require.main === module) {
  const output = runTreatment();
  const target = writeTreatment(output);
  process.stdout.write(JSON.stringify({
    schema: VERSION,
    target,
    confirmOffers: output.confirmOffers,
    confirmSettled: output.confirmSettled,
    confirmUnsettled: output.confirmUnsettled,
    confirms: output.confirmEvents.map(e => ({
      seat:e.seat,turn:e.turn,cardName:e.cardName,
      decision:e.decision,reason:e.reason,settled:e.settled
    })),
    allOriginallyBlockedTrialsAdvanced: output.allOriginallyBlockedTrialsAdvanced,
    nativeFinishedGameCount: output.nativeFinishedGameCount,
    allFourTrials: output.allFourTrials,
    perOriginallyBlockedTrial: output.perOriginallyBlockedTrial.map(x => ({
      id:x.id,originalBlockedOrdinal:x.originalBlockedOrdinal,
      treatmentFailureOrdinal:x.treatmentFailureOrdinal,
      treatmentFailureStage:x.treatmentFailureStage,
      treatmentAcceptedRootCount:x.treatmentAcceptedRootCount,
      treatmentFinished:x.treatmentFinished,
      treatmentWinner:x.treatmentWinner,
      treatmentEndReason:x.treatmentEndReason,
      nowPastOriginalBlock:x.nowPastOriginalBlock,
      unresolvedPrompts:x.unresolvedPrompts
    })),
    competitiveGamesQualified: 0
  }, null, 2) + '\n');
  if (output.confirmSettled === 0) process.exitCode = 1;
}

module.exports = {VERSION, runTreatment, writeTreatment};
