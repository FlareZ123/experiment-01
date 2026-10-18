'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11HeldShake} = require('./rank11-held-shake-opener.cjs');
const {schedule} = require('./rank11-held-shake-source-screen.cjs');

const POSITIVE_INDICES = Object.freeze([1, 18, 54, 61]);

/**
 * A post-observation forensic replay of all four original frozen-80 rank11
 * held-Shake opportunities. Selection follows the first source screen and
 * cannot estimate population success. Capture every meaningful candidate
 * action on their first normal turn after the actual setup, including Pass.
 * @returns {object}
 */
function run() {
  const sources = schedule();
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const source = plan.opponents.find(o => o.rank === 11);
  assert.equal(source?.status, 'ready');
  assert.equal(source.cards.length, 60);
  assert.equal(plan.candidate.cards.length, 60);
  const rows = [];
  for (const index of POSITIVE_INDICES) {
    const row = sources[index];
    assert.equal(row.trialId, 'held-shake:' + index);
    const candidateSeat = 1 - row.sourceSeat;
    const request = {
      deckA: row.sourceSeat === 0 ? source.cards : plan.candidate.cards,
      deckB: row.sourceSeat === 1 ? source.cards : plan.candidate.cards,
      seed: row.seed, maxActions: 85,
      strictPromptValidation: true,
      forestSealSearchCorrection: true,
      battleCompressorPositiveSelectionCorrection: true,
      isolatePolicyRandomness: true,
      captureDecisionTrace: true,
      label: 'held-Shake-forensic:' + index
    };
    const wrapped = withRank11HeldShake(row.sourceSeat,
      () => runMatch(request));
    const game = wrapped.result;
    const audit = wrapped.policyAudit;
    assert.equal(game.firstTurnSlot, candidateSeat,
      'Frozen trigger was rank11 actually second');
    assert.equal(audit.opportunityDetected, true);
    assert.equal(audit.attemptedActions, 6);
    assert.equal(audit.aborted, null);
    const responseTurn = audit.openingTurn + 1;
    const firstResponse = game.decisionTrace.filter(action =>
      action.turnBefore === responseTurn &&
      action.playerSlot === candidateSeat);
    const firstSourceNextTurn = game.decisionTrace.filter(action =>
      action.turnBefore === responseTurn + 1 &&
      action.playerSlot === row.sourceSeat);
    const trim = actions => actions.map(event => ({
      actionOrdinal: event.actionOrdinal, turnBefore: event.turnBefore,
      action: event.action, card: event.card ?? null,
      attack: event.attack ?? null,
      selectedCards: event.cardSelection?.selectedCards ?? null,
      ownHandAtDecision: event.decisionHandBefore?.ownHandPrintings ?? null,
      publicBoardBeforePass: event.publicBoardBeforePass ?? null,
      printedBasicEnergyBeforePass: event.printedBasicEnergyBeforePass ?? null
    }));
    rows.push({
      ...row,
      actualFirstSlot: game.firstTurnSlot,
      openingTurn: audit.openingTurn,
      chosenTool: audit.selectedTool,
      stage6Actions: audit.actions,
      immediateNextTurnWitness: audit.witness,
      immediateWitnessPassed: audit.completeAtDecisionBoundary,
      responseTurn, candidateFirstResponseActions: trim(firstResponse),
      nextSourceTurnActions: trim(firstSourceNextTurn),
      responseObserved: firstResponse.length > 0,
      originalGameIdentity: game.deckHashes,
      terminal: {
        finished: game.finished, winner: game.winner,
        actions: game.actions, turns: game.turns,
        prizesRemaining: game.prizesRemaining
      }
    });
  }
  return {
    study:'posthoc four-source-opportunity immediate candidate reply forensic',
    selection:'ALL pre-identified held-Shake opportunities from frozen first 80',
    first80ScheduleDigest:
      '2acd32fbdac8dbe9c3366c496f26583e7db0a4689855f2f12d8881fcc17956b6',
    selectedIndices:POSITIVE_INDICES,
    sourceRank:11, candidateRank:1,
    engineRevision:plan.engineRevision,
    sourceManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    responseObservedCount:rows.filter(r => r.responseObserved).length,
    firstOpponentBoundaryLockWitnesses:rows.filter(r =>
      r.immediateWitnessPassed).length,
    rows,
    qualifiedForCompetitiveInference:false
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {POSITIVE_INDICES, run};
