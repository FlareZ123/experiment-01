'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent5-v7-teamflare-native-damage-prize-aba-forensic-v4';
const PREFIX = 'agent41-bilateral-v2-common-policy-development-';
const TARGET = '6:201:B:champion-reference';
const PHASES = ['A', 'B', 'ARepeat'];
const OUTPUT_NAME = 'agent5-v7-teamflare-damage-prize-aba-v4.json';

/**
 * @param {object} row
 * @returns {object}
 */
function summarizeMatch(row) {
  const attacks = row.attackAudit?.attacks ?? [];
  return {
    phase: row.phase,
    label: row.label,
    trialId: row.trialId,
    status: row.status,
    attackActions: attacks.length,
    damageEffects: attacks.reduce((n, attack) =>
      n + attack.effects.filter(effect =>
        /Damage|PutCounters/i.test(effect.effectType ?? '') ||
        effect.damage !== null).length, 0),
    knockOutEffects: attacks.reduce((n, attack) =>
      n + attack.effects.filter(effect =>
        /KnockOut/i.test(effect.effectType ?? '')).length, 0),
    completedAttackPromptChains: attacks.filter(attack =>
      attack.settlement?.complete === true).length,
    prizePromptRecords: row.prizeAudit?.records?.length ?? 0,
    prizeTransfersToOwnerHand: row.prizeAudit?.exactOwnerHandTransfers ?? 0,
    nativeFinished: row.nativeFinished,
    nativeWinner: row.nativeWinner,
    error: row.error ?? null
  };
}

/**
 * Read-only replay of the already registered v7 Team Flare A/B/A cohort.
 * This adds only actual Store effect and Prize custody observation to the
 * existing generic Team Flare prompt reproduction. No game decision changes.
 *
 * @param {{headless?:object,runner?:Function,Store?:Function}} [deps]
 * @returns {object}
 */
function run(deps = {}) {
  const baseHeadless = deps.headless ?? require('../twinleaf/headless.cjs');
  const baseRunMatch = baseHeadless.runMatch;
  assert.equal(typeof baseRunMatch, 'function');
  const runGenericTeamFlareV3 =
    require('./agent5-v7-generic-owner-teamflare-aba-v3.cjs').run;
  const runStewardCommonVoltV7 =
    require('./agent36-issue25-common-v7.cjs').runStewardCommonVoltV7;
  const withNativeAttackDamageObserver =
    require('../twinleaf/agent5-native-attack-damage-observer.cjs')
      .withNativeAttackDamageObserver;
  const withOwnerKoPrizeSettlementEvidence =
    require('../twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs')
      .withOwnerKoPrizeSettlementEvidence;
  const Store = deps.Store ?? require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const observedMatches = [];
  let phaseIndex = 0;
  let activePhase = 'unassigned';

  const runtime = baseHeadless;
  const instrumentedRunMatch = request => {
    try {
      const prize = withOwnerKoPrizeSettlementEvidence(() =>
        withNativeAttackDamageObserver(
          () => baseRunMatch.call(baseHeadless, request), {Store}
        ), {Store});
      const game = prize.result.result;
      observedMatches.push({
        phase: activePhase,
        label: request?.label ?? null,
        trialId: String(request?.label ?? '').startsWith(PREFIX)
          ? String(request.label).slice(PREFIX.length)
          : null,
        status: 'returned',
        attackAudit: prize.result.audit,
        prizeAudit: prize.audit,
        nativeFinished: game.finished === true,
        nativeWinner: game.winner ?? null,
        nativeFinalPrizes: game.finalPrizes ?? null
      });
      return game;
    } catch (error) {
      observedMatches.push({
        phase: activePhase,
        label: request?.label ?? null,
        trialId: String(request?.label ?? '').startsWith(PREFIX)
          ? String(request.label).slice(PREFIX.length)
          : null,
        status: 'engine-error',
        attackAudit: error?.agent5AttackDamageAudit ?? null,
        prizeAudit: error?.agent3KoPrizeSettlementAudit ?? null,
        nativeFinished: false,
        nativeWinner: null,
        nativeFinalPrizes: null,
        error: String(error?.message ?? error).slice(0, 320)
      });
      throw error;
    }
  };
  runtime.runMatch = instrumentedRunMatch;

  const runner = options => {
    activePhase = PHASES[phaseIndex++] ?? 'unexpected-phase';
    return (deps.runner ?? runStewardCommonVoltV7)({
      ...options,
      headless: runtime
    });
  };

  let result;
  try {
    result = runGenericTeamFlareV3({
      ...deps,
      headless: runtime,
      runner
    });
  } finally {
    runtime.runMatch = baseRunMatch;
  }

  assert.equal(phaseIndex, 3, 'Expected exactly A, B and ARepeat native cohorts');
  assert.equal(observedMatches.length, 24, 'Every original registered attempt must be observed');
  assert.deepEqual(observedMatches.map(row => row.phase)
    .filter((phase,index,array) => index === 0 || phase !== array[index - 1]),
    PHASES);
  assert.ok(observedMatches.every(row => row.trialId !== null),
    'Every observed native match must retain its registered trial identity');

  const targetByPhase = Object.fromEntries(PHASES.map(phase => {
    const matches = observedMatches.filter(row =>
      row.phase === phase && row.trialId === TARGET);
    assert.equal(matches.length, 1, 'Expected one target match in ' + phase);
    return [phase, matches[0]];
  }));
  const targetAttacks = Object.fromEntries(PHASES.map(phase => [
    phase,
    targetByPhase[phase].attackAudit?.attacks ?? []
  ]));
  const energyDrive = Object.fromEntries(PHASES.map(phase => [
    phase,
    targetAttacks[phase].filter(attack => attack.attackName === 'Energy Drive')
  ]));
  const targetPrizeAudit = Object.fromEntries(PHASES.map(phase => [
    phase,
    targetByPhase[phase].prizeAudit ?? null
  ]));
  const firstOpponentPrizeTurn = Object.fromEntries(PHASES.map(phase => {
    const records = targetPrizeAudit[phase]?.records ?? [];
    const row = records.filter(record => record.seat === 1)
      .sort((a,b) => a.turn - b.turn)[0];
    return [phase, row?.turn ?? null];
  }));

  const targetSummary = Object.fromEntries(PHASES.map(phase => [
    phase,
    {
      status: targetByPhase[phase].status,
      attackActions: targetAttacks[phase].length,
      energyDriveAttacks: energyDrive[phase].map(attack => ({
        id: attack.id,
        turn: attack.turn,
        actorSeat: attack.actorSeat,
        attackName: attack.attackName,
        accepted: attack.accepted,
        beforePublicBoard: attack.beforePublicBoard,
        afterActionPublicBoard: attack.afterActionPublicBoard,
        damageAndKoEffects: attack.effects,
        promptResolutions: attack.promptResolutions,
        settlement: attack.settlement
      })),
      prizeAudit: targetPrizeAudit[phase],
      firstOpponentPrizeTurn: firstOpponentPrizeTurn[phase]
    }
  ]));

  const targetControlAttackTapeExact =
    JSON.stringify(targetAttacks.A) === JSON.stringify(targetAttacks.ARepeat);
  const targetRootRow = result.byId.find(row => row.id === TARGET);
  const targetRootTapesExact =
    targetRootRow?.repeatedControlPublicActionTapeExact === true;
  const targetPhysicalDealSame = result.targetTreatmentPhysicalSameAsControl === true;
  const allDealsSame = result.allSourceAndEntirePhysicalDealsIdentical === true;
  assert.equal(targetControlAttackTapeExact, true,
    'Passive attack observer must reproduce the A/ARepeat target tape');
  assert.equal(targetRootTapesExact, true);
  assert.equal(targetPhysicalDealSame, true);
  assert.equal(allDealsSame, true);

  return {
    schema: VERSION,
    parentGenericPromptReproduction: result.genericRegistration,
    pinnedTwinleaf: result.pinnedTwinleaf,
    originalRegisteredTrials: 8,
    phases: PHASES,
    originalNativeAttempts: 24,
    passiveObserver: {
      version: require('../twinleaf/agent5-native-attack-damage-observer.cjs').VERSION,
      prizeObserver: require('../twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs').VERSION,
      observerReadOnly: true,
      opponentConcealedZonesRead: false,
      ownerHandReadOnlyForPrizeTransfer: true,
      actionPolicyChanged: false
    },
    allInitialPhysicalDealsIdentical: allDealsSame,
    targetTreatmentPhysicalSameAsControl: targetPhysicalDealSame,
    targetControlAttackTapeExact,
    targetRootTapesExact,
    target: {
      trialId: TARGET,
      sourceSeat: 0,
      candidateSeat: 1,
      firstOpponentPrizeTurn,
      phases: targetSummary
    },
    allAttemptSummaries: observedMatches.map(summarizeMatch),
    sourceV7GenericTeamFlareResult: result,
    competitiveQualifiedGames: 0,
    estimatedWinRate: null,
    paperQualified: false
  };
}

module.exports = {VERSION,run,summarizeMatch};
if (require.main === module) {
  const dir = process.env.AGENT5_V7_TEAMFLARE_DAMAGE_PRIZE_DIR;
  assert.ok(dir, 'Set AGENT5_V7_TEAMFLARE_DAMAGE_PRIZE_DIR');
  const result = run();
  require('./agent5-v7-postvolt-teamflare-prompt-aba-v2.cjs')
    .writeLocked(path.join(dir, OUTPUT_NAME), result);
  process.stdout.write(JSON.stringify({
    schema: VERSION,
    attempts: result.originalNativeAttempts,
    physicalDeals: result.allInitialPhysicalDealsIdentical,
    targetRootParity: result.targetRootTapesExact,
    targetControlAttackTapeExact: result.targetControlAttackTapeExact,
    firstOpponentPrizeTurn: result.target.firstOpponentPrizeTurn,
    energyDriveAttackCounts: Object.fromEntries(PHASES.map(phase => [
      phase, result.target.phases[phase].energyDriveAttacks.length
    ])),
    competitiveQualifiedGames: 0
  }) + '\n');
}
