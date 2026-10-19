'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');

const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ARCHIVED = [
  {
    seed: 2333978800, sourceSeat: 0, repeat: 2,
    originalRootOrdinals: [51,65,72,83,91,103,110,133,159,173]
  },
  {
    seed: 3230260408, sourceSeat: 0, repeat: 5,
    originalRootOrdinals: [95,125,161]
  },
  {
    seed: 2464307628, sourceSeat: 1, repeat: 0,
    originalRootOrdinals: [69,77,84,93,100,113,146,160,173]
  }
];

/**
 * Read-only 3-deal replay of previously published rank9 16-deal source
 * exposure archive: run 39140412430 artifact 12141313214. The three are
 * selected *post hoc* because they contain all 22 native Terminal Period
 * declarations, not as a new random trial denominator. The historical
 * attack root ordinals are retained as an exact behavioral parity gate.
 *
 * @returns {object} Source-printed, public-only attack-condition evidence.
 */
function runAudit() {
  const plan = planAichi(1,{
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const rank9 = plan.opponents.find(row => row.rank === 9);
  assert.equal(rank9?.status, 'ready');
  assert.equal(rank9.cards.length, 60);
  assert.equal(plan.candidate.cards.length, 60);

  const rows = [];
  for (const prior of ARCHIVED) {
    const game = runMatch({
      deckA: prior.sourceSeat === 0 ? rank9.cards : plan.candidate.cards,
      deckB: prior.sourceSeat === 1 ? rank9.cards : plan.candidate.cards,
      seed: prior.seed,
      maxActions: 180,
      strictPromptValidation: true,
      forestSealSearchCorrection: true,
      supporterDecisionCorrection: true,
      leleEntryAbilityLockCorrection: true,
      entryDrawLockCorrection: true,
      isolatePolicyRandomness: true,
      pendingEndTurnSwitchCleanupCorrection: true,
      captureHorrorHouseRootResolution: true,
      capturePublicAttackTransitions: true
    });
    assert.equal(game.engine, 'twinleafgg/' + PIN);
    assert.equal(game.verifiedByDrawLog, true);
    assert.equal(game.publicAttackTransitionsProtocol,
      'actual-store-public-attack-transitions-v1');

    const declared = game.attackDeclarationTrace.filter(row =>
      row.playerSlot === prior.sourceSeat &&
      row.attackName === 'Terminal Period');
    const ordinals = declared.map(row => row.actionOrdinal);
    const matchesHistoricalRootTrace = ordinals.length ===
      prior.originalRootOrdinals.length &&
      ordinals.every((root, index) => root === prior.originalRootOrdinals[index]);

    const sourceRecords = declared.map(row => {
      const evidence = game.publicAttackTransitions.find(item =>
        item.actionOrdinal === row.actionOrdinal &&
        item.triggerPlayerSlot === prior.sourceSeat &&
        item.declarations.some(item => item.attackName === 'Terminal Period'));
      assert.ok(evidence, 'Missing the real Store public attack root');
      const defenderSeat = 1 - prior.sourceSeat;
      const activeBefore = evidence.before[defenderSeat]?.active;
      assert.ok(activeBefore, 'An opponent Active must exist to declare the attack');
      const requiredSixDamageCounters = activeBefore.damage === 60;
      const settled = evidence.settled;
      return {
        ordinal: row.actionOrdinal,
        turn: row.turnBefore,
        attacker: evidence.before[prior.sourceSeat]?.active?.name ?? null,
        defender: activeBefore.name,
        defenderDamageBefore: activeBefore.damage,
        exactSixCounterCondition: requiredSixDamageCounters,
        rootPromptsClosed: settled !== null,
        defenderAfter: settled?.after?.[defenderSeat]?.active ?? null,
        prizeCountsBefore: evidence.beforePrizesRemaining,
        prizeCountsAfter: settled?.prizesRemaining ?? null
      };
    });
    rows.push({
      seed: prior.seed, sourceSeat: prior.sourceSeat, repeat: prior.repeat,
      originalRootOrdinals: prior.originalRootOrdinals,
      newRootOrdinals: ordinals, matchesHistoricalRootTrace,
      originalSelectedAttackCount: prior.originalRootOrdinals.length,
      replayTerminalPeriodAttacks: sourceRecords,
      actualFirstSeat: game.firstTurnSlot,
      originalDealsOnly: true,
      actionCount: game.actions,
      endReason: game.endReason,
      finished: game.finished,
      gameWinnerIsNotQualified: game.finished ? game.winner : null,
      sourceDeal: game.deckHashes,
      qualifiedCompetitiveGames: 0
    });
  }
  const attacks = rows.flatMap(row => row.replayTerminalPeriodAttacks);
  const historicalParity = rows.every(row => row.matchesHistoricalRootTrace);
  return {
    schema: 'rank9-terminal-period-posthoc-public-root-audit-v1',
    sourceRank: 9,
    sourcePlayer: 'Shun Ito',
    sourceArtifactId: 12141313214,
    sourceRunId: 39140412430,
    historicalRegisteredDeals: 16,
    retrospectivelySelectedReplayDeals: 3,
    sourcePin: PIN,
    historicalParity,
    terminalPeriodOriginalRootCount: 22,
    terminalPeriodReplayCount: attacks.length,
    rootConditionAtSixDamageCounters: attacks.filter(row =>
      row.exactSixCounterCondition).length,
    rootConditionNotAtSixDamageCounters: attacks.filter(row =>
      !row.exactSixCounterCondition).length,
    promptClosedCount: attacks.filter(row => row.rootPromptsClosed).length,
    results: rows,
    policyCompetenceCertified: false,
    printedRuleFidelityCertified: false,
    competitiveQualifiedGames: 0
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runAudit(), null, 2) + '\n');
}
module.exports = {ARCHIVED, runAudit};
