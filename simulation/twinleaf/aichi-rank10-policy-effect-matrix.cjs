'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch, initializeCards} = require('./headless.cjs');
const {withRank10PaleMoonWindow} = require('./rank10-pale-moon-window.cjs');
const {withPendingEndTurnSwitchCleanup} = require('./pending-end-turn-switch-cleanup.cjs');
const {withRank10SourceKoraidonFork} = require('./rank10-koraidon-source-attack-fork.cjs');

const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine = name => require(path.join(compiled, name));

/**
 * Compare the identical source decision under distinct policy and paper-effect
 * semantics. Each run uses physical published 60s, identical seed and game
 * flags. No cards or choices are injected into a prepared board.
 * @param {object} request Immutable source matchup request.
 * @param {'original'|'aligned'|'retreat'} policy Source action choice.
 * @param {boolean} corrected Enable research-only Active exit correction.
 * @param {object} engineTypes Compiled game classes.
 * @returns {object}
 */
function runArm(request, policy, corrected, engineTypes) {
  const {Store, Player} = engineTypes;
  const execute = () => withRank10PaleMoonWindow(Store, () => {
    if (policy === 'retreat') {
      return withRank10SourceKoraidonFork(engineTypes,
        () => runMatch(request), {forceRetreat: true});
    }
    return {result: runMatch(policy === 'aligned'
      ? {...request, passHorizonAttack: true,
        passHorizonAttackSeat: 1, passHorizonAttackTurn: 5}
      : request), sourceDecisions: []};
  });
  const observation = corrected
    ? withPendingEndTurnSwitchCleanup({Store, Player}, execute)
    : {result: execute(), removedFromRoot: 0,
      removedFromSimulatedStores: 0, rootEvents: []};
  const game = observation.result.result.result;
  const sourceDecisions = observation.result.result.sourceDecisions;
  const window = observation.result.events;
  return {
    policy, corrected, winner: game.winner, finished: game.finished,
    prizesRemaining: game.prizesRemaining, turns: game.turns,
    firstTurnSlot: game.firstTurnSlot, deckHashes: game.deckHashes,
    beforeTurnFiveActions: game.decisionTrace.filter(a => a.turnBefore < 5),
    onTurnFiveActions: game.decisionTrace.filter(a =>
      a.turnBefore === 5 && a.playerSlot === 1)
      .map(a => ({action: a.action, attack: a.attack ?? null})),
    turnFiveOpponentAttacks: game.attackTrace.filter(a =>
      a.turn === 5 && a.seat === 1),
    sourceDecisions, window,
    removedRootQueue: observation.removedFromRoot,
    removedSpeculativeQueue: observation.removedFromSimulatedStores,
    queueCleanupEvents: observation.rootEvents
  };
}

/**
 * Source-ranked fixed-horizon choice sensitivity to one delayed KO rule.
 * A source winner is a diagnostic outcome, never competitive win-rate evidence.
 */
function main() {
  initializeCards();
  const seed = deriveSlotSeeds(20261016, 'pilot', 10, 0).A;
  assert.equal(seed, 3162592764);
  const field = planAichi(1, {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const opponent = field.opponents.find(d => d.rank === 10);
  assert.equal(field.candidate.cards.length, 60);
  assert.equal(opponent?.cards?.length, 60);
  const request = {
    deckA: field.candidate.cards, deckB: opponent.cards,
    label: 'rank10:turn5:decision-effect-matrix:A', seed, maxActions: 600,
    strictPromptValidation: true, forestSealSearchCorrection: true,
    doubleDragonRecovery: true, supporterDecisionCorrection: true,
    isolatePolicyRandomness: true, captureDecisionTrace: true,
    leleEntryAbilityLockCorrection: true,
    radiantGateLockCorrection: true, entryDrawLockCorrection: true
  };
  const engineTypes = {
    Store: engine('game/store/store').Store,
    Player: engine('game/store/state/player').Player,
    Bot: engine('simple-bot/simple-tactics-ai').SimpleTacticsAi,
    AttackAction: engine('game/store/actions/game-actions').AttackAction,
    RetreatAction: engine('game/store/actions/game-actions').RetreatAction
  };
  const arms = [];
  for (const corrected of [false, true]) {
    for (const policy of ['original', 'aligned', 'retreat']) {
      arms.push(runArm(request, policy, corrected, engineTypes));
    }
  }
  const original = arms[0];
  assert.equal(original.firstTurnSlot, 1);
  for (const arm of arms) {
    assert.equal(arm.firstTurnSlot, 1);
    assert.deepEqual(arm.deckHashes, original.deckHashes);
    assert.deepEqual(arm.beforeTurnFiveActions, original.beforeTurnFiveActions,
      'The frozen source game diverged before the intended decision');
    if (arm.policy === 'retreat') {
      assert.equal(arm.sourceDecisions.length, 1);
      assert.equal(arm.sourceDecisions[0].originalAction, 'PassTurnAction');
      assert.ok(arm.onTurnFiveActions.some(a => a.action === 'RetreatAction'));
    }
  }
  const originalRetreat = arms.find(a => a.policy === 'retreat' && !a.corrected);
  const correctedRetreat = arms.find(a => a.policy === 'retreat' && a.corrected);
  assert.equal(originalRetreat.sourceDecisions[0].stateDigest,
    correctedRetreat.sourceDecisions[0].stateDigest,
    'Actual pre-retreat source public/hidden State is not identical');
  assert.ok(correctedRetreat.removedRootQueue >= 1,
    'The correction was not exercised on the genuine source retreat');
  return {
    schema: 'rank10-source-policy-pale-moon-matrix-v1',
    sourceRank: 10, candidate: 'published-rank1-shadow-rider',
    sourceSeat: 'champion-physical-A-actually-second',
    seed, engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    qualifiedForCompetitiveInference: false,
    sourceReplayMechanicsVerified: false,
    matchingPreTurnFiveActionStream: true,
    note: 'The original and aligned options follow generic bot decisions. Retreat is an explicit source-state fork. This does not repair information leakage, speculative clone integrity, opponent skill or other card rules.',
    arms: arms.map(({beforeTurnFiveActions, deckHashes, ...arm}) => arm),
    originalDeckHashes: original.deckHashes
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
}
module.exports = {runArm, main};
