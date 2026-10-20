'use strict';
const assert = require('node:assert/strict');

/**
 * Diagnose the actual source owner's recorded turn-22 choices only after the
 * game and each action were decided. No owner-private data enters a policy.
 * @param {object} game Completed Store trace
 * @param {0|1} sourceSeat Source player's physical seat
 * @returns {object} Source-owned hand printings and recorded decisions
 */
function sourceTurn22OwnerReply(game, sourceSeat) {
  assert.ok(sourceSeat === 0 || sourceSeat === 1);
  const turn = (game.decisionTrace || []).filter(row =>
    row.playerSlot === sourceSeat && row.turnBefore === 22);
  const lele = turn.find(row => row.actionOrdinal === 155 &&
    row.action === 'PlayCardAction' && row.card === 'Tapu Lele-GX');
  const pass = turn.find(row => row.actionOrdinal === 157 &&
    row.action === 'PassTurnAction');
  assert.ok(lele, 'Missing historical source Tapu Lele at root155');
  assert.ok(pass, 'Missing historical source Pass at root157');
  assert.equal(lele.decisionHandBefore?.perspectiveSeat, sourceSeat);
  assert.equal(pass.decisionHandBefore?.perspectiveSeat, sourceSeat);
  const before = lele.decisionHandBefore.ownHandPrintings;
  const after = pass.decisionHandBefore.ownHandPrintings;
  assert.ok(Array.isArray(before) && Array.isArray(after));
  return {
    sourceSeat, globalTurn: 22,
    firstCopiedAttackRoot: 149, firstSettledRoot: 154,
    tapuLeleRoot: 155, actualPassRoot: 157,
    secondCopiedAttackRoot: 162,
    sourceOwnerHandBeforeTapuLele: [...before],
    sourceOwnerHandBeforePass: [...after],
    sourceRootDecisionsThroughPass: turn.filter(row =>
      row.actionOrdinal <= pass.actionOrdinal).map(row => ({
      ordinal: row.actionOrdinal, action: row.action,
      card: row.card || null, ability: row.ability || null,
      handSize: row.decisionHandBefore?.ownHandPrintings?.length ?? null
    })),
    trainerLegalityCertified: false,
    candidatePolicySawSourceHand: false,
    caveat: 'Retrospective owner information. Printed names alone do not prove any Trainer is legally playable through effects, board constraints, targets and the one-Supporter limit.'
  };
}

/** @returns {object} The original four-arm retrospective with one new owner-only hand observation */
function runSourceReplyAudit() {
  const headless = require('../twinleaf/headless.cjs');
  const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
  const {FROZEN_ROOT_SHA} = require('./agent37-late14-public-replay.cjs');
  const original = headless.runMatch;
  let ownerReply = null;
  let captured = 0;
  function observe(request) {
    const game = original(request);
    captured++;
    if(request.label.endsWith('11:2:B:new-moon-lockbreaker-v1')) {
      const candidateSeat = request.capturePerfectionPassProbeSeat;
      assert.ok(candidateSeat === 0 || candidateSeat === 1);
      ownerReply = sourceTurn22OwnerReply(game, 1 - candidateSeat);
    }
    return game;
  }
  let output;
  headless.runMatch = observe;
  try {
    output = runDevelopment({
      compressorPayload: true, lateCompressorPayload: true
    });
  } finally {
    headless.runMatch = original;
  }
  assert.equal(headless.runMatch, original);
  assert.equal(captured, 4);
  assert.equal(output.rows.length, 4);
  for(const row of output.rows) {
    assert.equal(row.error, undefined);
    assert.equal(row.rootActionLedgerSha256,
      FROZEN_ROOT_SHA[row.trial.id], 'Changed frozen root actions');
  }
  const target = output.rows.find(row =>
    row.trial.id === '11:2:B:new-moon-lockbreaker-v1');
  assert.ok(target);
  assert.equal(target.sourceSeat, ownerReply?.sourceSeat);
  assert.equal(target.actualStarterSeat, target.candidateSeat);
  assert.equal(target.attackDeclarations.candidate, 2);
  return {
    schema: 'agent6-retrospective-rank11-source-response-hand-v1',
    originalGame: {
      id: target.trial.id, seed: target.trial.seed,
      sourceDealFingerprint: target.sourceDealFingerprint,
      rootActionLedgerSha256: target.rootActionLedgerSha256,
      sourceActuallyFirst: target.sourceActuallyFirst,
      winner: target.winner, endReason: target.endReason
    },
    rootHashes: output.rows.map(row => ({
      id: row.trial.id, sha256: row.rootActionLedgerSha256
    })),
    ownerReply, competitiveQualifiedGames: 0,
    sourceCounterfactualTested: false
  };
}
if(require.main === module) {
  process.stdout.write(JSON.stringify(runSourceReplyAudit(), null, 2) + '\n');
}
module.exports = {sourceTurn22OwnerReply, runSourceReplyAudit};
