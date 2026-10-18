'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withoutTrace} = require('./trace-noninterference.cjs');

const SOURCE_SEED = 387039398;
const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Compare an authentic published-rank-9 Horror House source deal with and
 * without read-only root capture. This is one retrospectively known positive
 * mechanical control, never an independent sampled game or policy certificate.
 * @returns {object} Bounded noninterference and source-declaration evidence.
 */
function run() {
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const rank9 = plan.opponents.find(row => row.rank === 9);
  assert.equal(rank9?.status, 'ready');
  assert.equal(plan.engineRevision, PIN);
  const request = {
    deckA: plan.candidate.cards, deckB: rank9.cards,
    seed: SOURCE_SEED, maxActions: 180,
    label: 'rank9-source-root-ledger-readonly-noninterference',
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    supporterDecisionCorrection: true,
    leleEntryAbilityLockCorrection: true,
    entryDrawLockCorrection: true,
    isolatePolicyRandomness: true,
    pendingEndTurnSwitchCleanupCorrection: true
  };
  const control = runMatch({...request, captureDecisionTrace: false});
  const captured = runMatch({...request, captureDecisionTrace: true});
  assert.equal(control.verifiedByDrawLog, true);
  assert.equal(captured.verifiedByDrawLog, true);
  assert.equal(captured.firstTurnSlot, control.firstTurnSlot);
  assert.deepEqual(withoutTrace(captured), withoutTrace(control),
    'Root-ledger capture changed a source game result, Store declaration or final state');
  assert.equal(control.rootActionLedger, null);
  assert.equal(control.decisionTrace, null);
  assert.equal(captured.rootActionLedgerProtocol,
    'actual-store-root-action-ledger-v1');
  const roots = captured.rootActionLedger;
  assert.equal(roots.length, captured.actions);
  for (let i = 0; i < roots.length; i++) {
    assert.equal(roots[i].actionOrdinal, i);
    if (i) assert.equal(roots[i].turnBefore, roots[i - 1].turnAfter);
  }
  const declarations = captured.attackDeclarationTrace.filter(row =>
    row.playerSlot === 1 && row.attackName === 'Horror House-GX');
  assert.ok(declarations.length > 0,
    'Published rank9 source seed should show a native Horror House declaration');
  for (const row of declarations) {
    const root = roots[row.actionOrdinal];
    assert.equal(root.playerSlot, 1);
    assert.equal(root.action, row.triggerAction);
    assert.equal(root.attack, row.attackName);
  }
  const sha256 = createHash('sha256').update(JSON.stringify(roots)).digest('hex');
  return {
    kind: 'published-rank9-root-ledger-readonly-noninterference-v1',
    pinnedEngine: PIN, sourceRank: 9, referenceRank: 1,
    sourceSeat: 1, seed: SOURCE_SEED,
    drawLogVerified: captured.verifiedByDrawLog,
    actualFirstTurnSlot: captured.firstTurnSlot,
    totalRootActions: captured.actions, rootLedgerEntries: roots.length,
    rootLedgerSha256: sha256,
    sourceNativeHorrorHouseDeclarations: declarations.map(row => ({
      ordinal: row.actionOrdinal, turn: row.turnBefore,
      triggeringRootAction: row.triggerAction, printedAttack: row.attackName
    })),
    identicalWithoutReadOnlyCapture: true,
    engineFinished: captured.finished,
    qualifiedCompetitiveGames: 0,
    inference: 'Retrospective single-deal observer integrity only; no independent replay, opponent-policy competence, or game-win rate.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = {run, SOURCE_SEED};
