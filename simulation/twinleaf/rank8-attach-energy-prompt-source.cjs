'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { planAichi } = require('../evaluation/aichi-pilot.cjs');
const { deriveSlotSeeds } = require('../../scripts/aichi-decorrelated-seeds.cjs');
const { runMatch, initializeCards } = require('./headless.cjs');

/**
 * Re-run only the archived rank-8 Temple-A source game under the current
 * revision, testing whether the historical invalid AttachEnergyPrompt 57
 * persists and collecting the strict validator's post-choice evidence.
 * This is diagnostic, never a qualified competitive game.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const seed = deriveSlotSeeds(20261016, 'pilot', 8, 0).A;
  assert.equal(seed, 3755937400, 'Source rank-8 slot-A seed must stay pinned');
  const sourceDir = path.resolve(__dirname, '../../results/aichi-2026');
  const temple = JSON.parse(fs.readFileSync(path.join(sourceDir,
    'candidate-temple-shadow-rider.json'), 'utf8'));
  const mapped = planAichi(temple, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const rank8 = mapped.opponents.find(o => o.rank === 8);
  assert.ok(rank8 && Array.isArray(rank8.cards));
  assert.equal(mapped.candidate.cards.length, 60);
  assert.equal(rank8.cards.length, 60);
  const request = {
    deckA: mapped.candidate.cards, deckB: rank8.cards,
    label: 'agent11:rank8:templeA:archived-prompt57',
    seed, maxActions: 600,
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    doubleDragonRecovery: true,
    supporterDecisionCorrection: true,
    isolatePolicyRandomness: true,
    captureDecisionTrace: true,
    captureAttackPassProbes: true,
    leleEntryAbilityLockCorrection: true,
    radiantGateLockCorrection: true,
    entryDrawLockCorrection: true
  };
  const basis = {
    kind: 'rank8-temple-A-prompt57-source-recheck',
    seed, candidatePhysicalSlot: 'A', targetRank: 8,
    historicalRun: 39041216040,
    qualification: 'one source deal, current policy; no qualified game'
  };
  try {
    const game = runMatch(request);
    assert.equal(game.seed, seed);
    return {
      ...basis, status: 'historical-error-not-reproduced',
      policy: game.policy, deckHashes: game.deckHashes,
      actions: game.actions, turns: game.turns,
      finished: game.finished, winner: game.winner,
      actualFirstTurnSlot: game.actualFirstTurnSlot ?? game.firstTurnSlot ?? null,
      prizesRemaining: game.prizesRemaining,
      actionsBySeat: game.actionsBySeat,
      attackBySeat: [0, 1].map(seat => ({
        seat,
        attacks: game.attackTrace.filter(action => action.seat === seat)
          .map(action => ({turn: action.turn,
            attack: action.attack, attacker: action.activePokemon || null}))
      })),
      passCountBySeat: [0, 1].map(seat => ({
        seat, count: game.decisionTrace.filter(event =>
          event.playerSlot === seat &&
          String(event.action).includes('PassTurn')).length
      })),
      invalidPromptSourceResult: false
    };
  } catch (error) {
    const message = String(error?.message || error);
    const prefix = 'Twinleaf bot supplied an invalid result to AttachEnergyPrompt ';
    if (!message.startsWith(prefix)) throw error;
    const at = message.indexOf(' {"evidenceType":');
    let evidence = null;
    if (at >= 0) evidence = JSON.parse(message.slice(at + 1));
    return {
      ...basis, status: 'invalid-attach-energy-proposal',
      error: message.slice(0, 220), evidence
    };
  }
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { runTest };
