'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');

/** @param {object[]} events */
function digestTrace(events) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(events)).digest('hex');
}

/**
 * Compare meaningful actions under three Simulator profiles with source-locked
 * decklists, one physical seed and one frozen bot policy. Differences are
 * mechanistic diagnostics. Paired fixed-seed bot results are not win samples.
 *
 * @returns {object}
 */
function compareSourceRankSimulatorProfiles() {
  const resolved = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const byRank = new Map(resolved.decks.map(deck => [deck.rank,deck]));
  const deckA = byRank.get(1), deckB = byRank.get(10);
  assert.ok(deckA?.playableUnderEngine && deckB?.playableUnderEngine);

  const options = {
    deckA:deckA.cardIds,deckB:deckB.cardIds,
    seed:20261049,maxActions:350,
    label:'agent48-source-locked-three-simulator-profiles',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,
    doubleDragonRecovery:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true
  };

  const baseline = runMatch(options);
  const prototypeSafe = runMatch({
    ...options,prototypeSafeSimulatorIsolation:true
  });
  const postSuper = runMatch({
    ...options,postSuperAliasRepairIsolation:true
  });

  const games = [baseline,prototypeSafe,postSuper];
  for (const game of games) {
    assert.deepEqual(game.deckHashes,baseline.deckHashes);
    assert.equal(game.seed,baseline.seed);
    assert.equal(game.firstTurnSlot,baseline.firstTurnSlot);
    assert.equal(game.verifiedByDrawLog,true);
    assert.ok(game.decisionTrace?.length>0);
  }

  const originalReplay = runMatch(options);
  assert.deepEqual(originalReplay,baseline,
    'Repeated original Store run must remain deterministic and unmodified');

  const oldActions = prototypeSafe.decisionTrace;
  const newActions = postSuper.decisionTrace;
  let divergence = null;
  for (let i=0;i<Math.max(oldActions.length,newActions.length);i++) {
    if (JSON.stringify(oldActions[i]) !== JSON.stringify(newActions[i])) {
      divergence = {
        index:i,
        prototypeSafe:oldActions[i] ? {
          action:oldActions[i].action,
          card:oldActions[i].card||null,
          turn:oldActions[i].turnBefore,
          playerSlot:oldActions[i].playerSlot
        } : null,
        postSuper:newActions[i] ? {
          action:newActions[i].action,
          card:newActions[i].card||null,
          turn:newActions[i].turnBefore,
          playerSlot:newActions[i].playerSlot
        } : null
      };
      break;
    }
  }

  /** @param {object} game */
  function summarize(game) {
    return {
      policy:game.policy,
      actions:game.actions,
      turns:game.turns,
      finished:game.finished,
      endReason:game.endReason,
      engineWinner:game.winner,
      prizesRemaining:game.prizesRemaining,
      attackDispatches:game.attackTrace.length,
      capturedMeaningfulActions:game.decisionTrace.length,
      traceDigest:digestTrace(game.decisionTrace)
    };
  }

  return {
    experiment:'one-seed-source-ranked-three-simulator-profile-contrast',
    sourceRanks:[1,10],seed:options.seed,maxActions:options.maxActions,
    pinnedRevision:baseline.engine,
    deckHashes:baseline.deckHashes,
    firstTurnSlot:baseline.firstTurnSlot,
    original:summarize(baseline),
    prototypeSafe:summarize(prototypeSafe),
    postSuperRepair:summarize(postSuper),
    oldAndRepairedActionTracesEqual:divergence===null,
    firstOldVersusRepairedActionDivergence:divergence,
    originalReplayByteEqual:true,
    qualifiedForCompetitiveInference:false,
    caution:'One reused seed and weak bots. Speculative clone changes can alter decisions, random event order and terminal outcomes. No statistical win estimate follows.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(
    compareSourceRankSimulatorProfiles(),null,2)+'\n');
}

module.exports = {compareSourceRankSimulatorProfiles};
