'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { planAichi } = require('../evaluation/aichi-pilot.cjs');
const { deriveSlotSeeds } = require('../../scripts/aichi-decorrelated-seeds.cjs');
const { runMatch, initializeCards } = require('./headless.cjs');
const { installDistinctAttachTargetsHook } = require('./distinct-attach-targets-hook.cjs');

/** @param {string[]} cards */
function deckHash(cards) {
  return createHash('sha256').update(JSON.stringify(cards)).digest('hex');
}

/**
 * Pre-registered eight-source-deal rank-8 starting-order exposure panel.
 * Every result, exception and actual starting seat is retained. No outcome
 * here is eligible for competitive-inference promotion.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const dir = path.resolve(__dirname, '../../results/aichi-2026');
  const temple = JSON.parse(fs.readFileSync(path.join(dir,
    'candidate-temple-shadow-rider.json'), 'utf8'));
  const mapped = planAichi(temple, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const opponent = mapped.opponents.find(o => o.rank === 8);
  assert.ok(opponent && opponent.cards.length === 60);
  assert.equal(mapped.candidate.cards.length, 60);
  const plannedSeeds = [
    {repeat: 1, A: 1684484268, B: 10367207},
    {repeat: 2, A: 604403731, B: 1260748957},
    {repeat: 3, A: 1514133819, B: 715542693},
    {repeat: 4, A: 2704896409, B: 2378175508}
  ];
  for (const row of plannedSeeds) {
    assert.deepEqual(deriveSlotSeeds(20261016, 'pilot', 8, row.repeat),
      {A: row.A, B: row.B}, 'Seed v3 protocol drift');
  }
  const originalHashes = {
    candidate: deckHash(mapped.candidate.cards),
    opponent: deckHash(opponent.cards)
  };
  const records = [];
  const restore = installDistinctAttachTargetsHook();
  let stats;
  try {
    for (const seeds of plannedSeeds) {
      for (const slot of ['A', 'B']) {
        const candidateSeat = slot === 'A' ? 0 : 1;
        const deckA = candidateSeat === 0 ?
          mapped.candidate.cards : opponent.cards;
        const deckB = candidateSeat === 1 ?
          mapped.candidate.cards : opponent.cards;
        const identity = {
          sourceRank: 8, candidateId: 'temple-v1',
          candidatePhysicalSlot: slot,
          candidateSeat, repeat: seeds.repeat, seed: seeds[slot]
        };
        try {
          const game = runMatch({
            deckA, deckB, seed: seeds[slot], maxActions: 600,
            label: 'rank8:temple:predeclared-start-panel:' +
              seeds.repeat + ':' + slot,
            strictPromptValidation: true,
            forestSealSearchCorrection: true,
            doubleDragonRecovery: true,
            supporterDecisionCorrection: true,
            isolatePolicyRandomness: true,
            captureDecisionTrace: true,
            leleEntryAbilityLockCorrection: true,
            radiantGateLockCorrection: true,
            entryDrawLockCorrection: true
          });
          const first = game.actualFirstTurnSlot ?? game.firstTurnSlot;
          assert.ok(first === 0 || first === 1);
          assert.deepEqual(game.deckHashes, [deckHash(deckA), deckHash(deckB)]);
          records.push({
            ...identity, status: 'engine-run',
            candidateWentSecond: first !== candidateSeat,
            actualFirstTurnSlot: first,
            finished: game.finished, actionCount: game.actions,
            turnCount: game.turns, winner: game.winner,
            prizeRemaining: game.prizesRemaining,
            attackCounts: [0, 1].map(seat =>
              game.attackTrace.filter(attack => attack.seat === seat).length),
            passCounts: [0, 1].map(seat =>
              game.actionsBySeat[seat].PassTurnAction || 0),
            enginePolicy: game.policy + '+DistinctAttachTargetsPolicy-v1'
          });
        } catch (error) {
          records.push({
            ...identity, status: 'engine-exception',
            error: String(error?.message || error).slice(0, 600)
          });
        }
      }
    }
    stats = { ...restore.stats };
  } finally {
    restore();
  }
  assert.equal(records.length, 8);
  return {
    kind: 'rank8-temple-predeclared-next-four-repeats-both-physical-slots',
    fixedSourceDeckHashes: originalHashes,
    seedProtocol: 'decorrelated-slots-v3',
    sourceSeedBase: 20261016,
    selectedRepeats: [1, 2, 3, 4],
    pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    hookPolicy: 'DistinctAttachTargetsPolicy-v1',
    noQualifiedCompetitiveOutcomes: true,
    records,
    summary: {
      totalTrials: records.length,
      completed: records.filter(x => x.status === 'engine-run' && x.finished).length,
      exceptions: records.filter(x => x.status === 'engine-exception').length,
      candidateActuallySecond: records.filter(x => x.candidateWentSecond).length,
      candidateActuallyFirst: records.filter(x => x.candidateWentSecond === false).length
    },
    resolverPromptStats: stats
  };
}
if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { runTest };
