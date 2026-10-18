'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {runWithResearchProfile, RANK11_AUTONOMOUS_PROFILE} =
  require('./policy-profiles.cjs');

const ARCHIVED_SEED = 1244180408;

/**
 * One authentic source-dealt rank-11 starting opportunity. No hand, deck,
 * board or prompt injection occurs. This is an automatic-policy regression
 * against the previously published forced-action capability witness.
 * @returns {object}
 */
function run() {
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const opponent = plan.opponents.find(deck => deck.rank === 11);
  assert.equal(opponent?.status, 'ready');
  assert.equal(plan.candidate.cards?.length, 60);
  const request = {
    deckA: opponent.cards,
    deckB: plan.candidate.cards,
    seed: ARCHIVED_SEED,
    maxActions: 450,
    label: 'rank11-source-autonomous-Boost-Shake-v1',
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    battleCompressorPositiveSelectionCorrection: true,
    isolatePolicyRandomness: true,
    captureDecisionTrace: true
  };
  const control = runMatch(request);
  const game = runWithResearchProfile(
    {...request, rank11SourceSeat: 0}, RANK11_AUTONOMOUS_PROFILE);
  const audit = game.rank11AutonomousPolicy;
  assert.equal(game.firstTurnSlot, 0, 'Source rank11 must genuinely start first');
  assert.equal(control.firstTurnSlot, game.firstTurnSlot);
  assert.deepEqual(control.deckHashes, game.deckHashes);
  assert.equal(audit?.opportunityDetected, true,
    'Automatic player did not recognize the public/own-hand source opportunity');
  assert.equal(audit?.attemptedActions, 11,
    'Automatic decision line did not finish eleven Store actions: ' + JSON.stringify(audit));
  assert.equal(audit?.aborted, null);
  assert.equal(audit?.completeAtDecisionBoundary, true,
    'Automatic line must produce the Tool-bearing Garbodor before opponent acts');
  assert.equal(game.researchPolicyProfile, RANK11_AUTONOMOUS_PROFILE);
  return {
    study: 'rank11 information-set-correct automatic policy source regression',
    archivedSeed: ARCHIVED_SEED,
    engine: plan.engineRevision,
    opponentRank: 11,
    candidateRank: 1,
    sourcePhysicalSeat: 0,
    actualFirstTurn: game.firstTurnSlot,
    sourceIdentity: plan.manifestDigest,
    candidateIdentity: plan.candidateDigest,
    sourceEngineCards: opponent.cards.length,
    candidateEngineCards: plan.candidate.cards.length,
    policyAudit: audit,
    control: {
      finished: control.finished,
      winner: control.winner,
      actions: control.actions,
      turns: control.turns,
      remainingPrizes: control.prizesRemaining,
      firstTurnSourceActions: control.decisionTrace.filter(action =>
        action.playerSlot === 0 && action.turnBefore === 1).slice(0, 20)
    },
    automatic: {
      finished: game.finished,
      winner: game.winner,
      actions: game.actions,
      turns: game.turns,
      remainingPrizes: game.prizesRemaining,
      firstTurnSourceActions: game.decisionTrace.filter(action =>
        action.playerSlot === 0 && action.turnBefore === 1).slice(0, 20),
      firstOpponentResponse: game.decisionTrace.filter(action =>
        action.playerSlot === 1 && action.turnBefore === 2).slice(0, 20)
    },
    fullPromptReplayCertified: false,
    simulatorPaperRuleFidelityCertified: false,
    opponentPolicyCompetenceCertified: false,
    qualifiedForCompetitiveInference: false,
    caution: 'One selected source deal with an early opportunity; no winner or win-rate inference'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {run, ARCHIVED_SEED};
