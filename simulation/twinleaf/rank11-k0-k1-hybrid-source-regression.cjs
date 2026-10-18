'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {
  runWithResearchProfile, RANK11_K1_HYBRID_PROFILE,
  RANK11_K0_K1_HYBRID_PROFILE
} = require('./policy-profiles.cjs');

const SOURCES = Object.freeze([
  {seed: 100383471, sourceSeat: 1, label: 'direct-positive'},
  {seed: 1043379306, sourceSeat: 1, label: 'K1-only'},
  {seed: 1804615887, sourceSeat: 1, label: 'K0-held-pair'},
  {seed: 1244180408, sourceSeat: 0, label: 'VSTAR-source-positive'}
]);

/** @param {object} game */
function summary(game) {
  return {finished:game.finished, winner:game.winner,
    actions:game.actions,turns:game.turns,prizesRemaining:game.prizesRemaining};
}

/** @param {object} game @param {0|1} seat */
function firstOwnRoot(game, seat) {
  return game.rootActionLedger.filter(action =>
    action.playerSlot === seat && action.turnBefore === 1)
    .slice(0, 30).map(action => ({
      ordinal: action.actionOrdinal, action: action.action,
      card: action.card || null, ability: action.ability || null,
      pendingPrompt: action.pendingPrompt
    }));
}

/**
 * Historical exact published source pair, frozen controls against the
 * existing K1 hybrid. This is a policy regression, never match-win evidence.
 * @returns {object}
 */
function run() {
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const source = plan.opponents.find(deck => deck.rank === 11);
  assert.equal(source?.status, 'ready');
  const rows = [];
  for (const record of SOURCES) {
    const request = {
      deckA: record.sourceSeat === 0 ? source.cards : plan.candidate.cards,
      deckB: record.sourceSeat === 1 ? source.cards : plan.candidate.cards,
      rank11SourceSeat: record.sourceSeat,
      seed: record.seed,
      maxActions: 85,
      strictPromptValidation: true,
      forestSealSearchCorrection: true,
      battleCompressorPositiveSelectionCorrection: true,
      isolatePolicyRandomness: true,
      captureDecisionTrace: true,
      label: record.label + '-K0-K1-hybrid'
    };
    const v3 = runWithResearchProfile(request, RANK11_K1_HYBRID_PROFILE);
    const v4 = runWithResearchProfile(request, RANK11_K0_K1_HYBRID_PROFILE);
    assert.equal(v3.firstTurnSlot, record.sourceSeat);
    assert.equal(v4.firstTurnSlot, record.sourceSeat);
    assert.deepEqual(v3.deckHashes, v4.deckHashes);
    assert.equal(v4.rank11DirectPolicy.k0AvoidAllGarbodorHeld, true);
    assert.equal(v3.rank11DirectPolicy.k0AvoidAllGarbodorHeld, false);
    assert.equal(v3.rank11DirectPolicy.k1AvoidMissingGarbodor, true);
    assert.equal(v4.rank11DirectPolicy.k1AvoidMissingGarbodor, true);
    if (record.label === 'K0-held-pair') {
      assert.equal(v3.rank11DirectPolicy.actions.length, 2);
      assert.equal(v4.rank11DirectPolicy.actions.length, 0);
      assert.equal(v4.rank11DirectPolicy.opportunityTurn, null);
    } else {
      assert.deepEqual(v3.decisionTrace, v4.decisionTrace,
        'Unchanged K1 or successful source trace drift: ' + record.label);
      assert.deepEqual(summary(v3), summary(v4));
      assert.deepEqual(v3.rank11DirectPolicy.actions,
        v4.rank11DirectPolicy.actions);
      assert.deepEqual(v3.rank11AutonomousPolicy.selectedLine,
        v4.rank11AutonomousPolicy.selectedLine);
    }
    rows.push({
      ...record,
      printedRank11Copies: source.cards.length,
      v3: {direct:v3.rank11DirectPolicy,
        autonomous:v3.rank11AutonomousPolicy, game:summary(v3),
        firstSourceRoot:firstOwnRoot(v3, record.sourceSeat)},
      v4: {direct:v4.rank11DirectPolicy,
        autonomous:v4.rank11AutonomousPolicy, game:summary(v4),
        firstSourceRoot:firstOwnRoot(v4, record.sourceSeat)},
      tracesSame: JSON.stringify(v3.decisionTrace) ===
        JSON.stringify(v4.decisionTrace)
    });
  }
  return {study:'rank11 shared hybrid K0-K1 exact source resource guard',
    oldProfile:RANK11_K1_HYBRID_PROFILE,
    newProfile:RANK11_K0_K1_HYBRID_PROFILE,
    opponentRank:11,candidateRank:1,
    engineRevision:plan.engineRevision,
    sourceManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    maxActions:85,rows,
    qualifiedForCompetitiveInference:false};
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {run, SOURCES};
