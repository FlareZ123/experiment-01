'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11HeldShake} = require('./rank11-held-shake-opener.cjs');
const {schedule} = require('./rank11-held-shake-source-screen.cjs');

const POSITIVE_INDICES = Object.freeze([1, 18, 54, 61]);
// Every second-cohort opportunity was identified from the original complete
// 160-trial artifact. This is a post-observation conditional replay, never a
// population success sample; negative trials remain archived in that artifact.
const EXTENDED_POSITIVE_INDICES = Object.freeze([
  82, 98, 101, 107, 112, 131, 137, 153, 155, 166,
  198, 224, 225, 230, 231
]);
const EXTENDED_SOURCE_FIRST = new Set([
  98, 101, 107, 112, 131, 137, 155, 166, 198, 224, 225, 230
]);
const EXTENDED_ABORTED = new Set([137, 155]);

/**
 * A post-observation forensic replay of all four original frozen-80 rank11
 * held-Shake opportunities. Selection follows the first source screen and
 * cannot estimate population success. Capture every meaningful candidate
 * action on their first normal turn after the actual setup, including Pass.
 * @returns {object}
 */
function run({extended = false} = {}) {
  const sources = extended ? schedule(80, 160) : schedule();
  const indices = extended ? EXTENDED_POSITIVE_INDICES : POSITIVE_INDICES;
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const source = plan.opponents.find(o => o.rank === 11);
  assert.equal(source?.status, 'ready');
  assert.equal(source.cards.length, 60);
  assert.equal(plan.candidate.cards.length, 60);
  const rows = [];
  for (const index of indices) {
    const row = sources[extended ? index - 80 : index];
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
    if (extended) {
      assert.equal(game.firstTurnSlot === row.sourceSeat,
        EXTENDED_SOURCE_FIRST.has(index),
        'Second-cohort actual turn order drifted from archived source run');
    } else {
      assert.equal(game.firstTurnSlot, candidateSeat,
        'Frozen trigger was rank11 actually second');
    }
    assert.equal(audit.opportunityDetected, true);
    assert.equal(audit.attemptedActions,
      extended && EXTENDED_ABORTED.has(index) ? 4 : 6);
    assert.equal(Boolean(audit.aborted),
      extended && EXTENDED_ABORTED.has(index));
    assert.equal(audit.completeAtDecisionBoundary,
      !(extended && EXTENDED_ABORTED.has(index)));
    const responseTurn = audit.witness?.turn ??
      (extended ? null : audit.openingTurn + 1);
    const firstResponse = game.decisionTrace.filter(action =>
      responseTurn !== null && action.turnBefore === responseTurn &&
      action.playerSlot === candidateSeat);
    const firstSourceNextTurn = game.decisionTrace.filter(action =>
      responseTurn !== null && action.turnBefore === responseTurn + 1 &&
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
    const responseHand = firstResponse[0]?.decisionHandBefore?.ownHandPrintings ?? null;
    const responsePass = firstResponse.find(action => action.action === 'PassTurnAction');
    const sourceBoardAtPass = responsePass?.publicBoardBeforePass?.[row.sourceSeat];
    const sourceToolGarbodorAtPass = sourceBoardAtPass ?
      sourceBoardAtPass.bench.some(slot => slot.name === 'Garbodor' &&
        slot.toolCards.length > 0) : null;
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
      responseFirstOwnHand: responseHand,
      heldFieldBlowerAtResponse: responseHand?.some(name =>
        name.startsWith('Field Blower ')) ?? null,
      playedFieldBlowerOnResponse: firstResponse.some(action =>
        action.action === 'PlayCardAction' && action.card === 'Field Blower'),
      responsePassObserved: Boolean(responsePass),
      sourceToolGarbodorAtResponsePass: sourceToolGarbodorAtPass,
      originalGameIdentity: game.deckHashes,
      terminal: {
        finished: game.finished, winner: game.winner,
        actions: game.actions, turns: game.turns,
        prizesRemaining: game.prizesRemaining
      }
    });
  }
  return {
    study: extended ?
      'posthoc 15-source-opportunity second-cohort immediate candidate replies' :
      'posthoc four-source-opportunity immediate candidate reply forensic',
    selection: extended ?
      'ALL fifteen preidentified trigger opportunities from separately preregistered indices 80..239' :
      'ALL pre-identified held-Shake opportunities from frozen first 80',
    scheduleDigest: extended ?
      '55b103b4ff5c24fd95b76bf5ce39c773fcde6cb502218586a91cedfde5c3fbbf' :
      '2acd32fbdac8dbe9c3366c496f26583e7db0a4689855f2f12d8881fcc17956b6',
    selectedIndices:indices,
    sourceRank:11, candidateRank:1,
    engineRevision:plan.engineRevision,
    sourceManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    responseObservedCount:rows.filter(r => r.responseObserved).length,
    abortedAfterSourceOwnerSearch:rows.filter(r => !r.immediateWitnessPassed).length,
    fieldBlowerHeldAtFirstResponse:rows.filter(r =>
      r.heldFieldBlowerAtResponse === true).length,
    fieldBlowerPlayedAtFirstResponse:rows.filter(r =>
      r.playedFieldBlowerOnResponse).length,
    firstOpponentBoundaryLockWitnesses:rows.filter(r =>
      r.immediateWitnessPassed).length,
    rows,
    qualifiedForCompetitiveInference:false
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run({
    extended: process.env.AICHI_HELD_SHAKE_FORENSIC_EXTENDED === 'true'
  }), null, 2) + '\n');
}
module.exports = {POSITIVE_INDICES, EXTENDED_POSITIVE_INDICES, run};
