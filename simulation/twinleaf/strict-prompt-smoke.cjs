'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { resolveManifestFile } = require('./resolve-field.cjs');
const { runMatch } = require('./headless.cjs');

/**
 * Probe an exact published match using the opt-in pre-dispatch prompt gate.
 * A policy/engine failure is useful diagnostic evidence. The generic bot's
 * result is not representative competitive game-win evidence.
 * @returns {object} Compact, reproducible outcome or explicit error.
 */
function probeStrictPromptPolicy() {
  const manifest = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    { allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true }
  );
  const ranks = new Map(manifest.decks.map(deck => [deck.rank, deck]));
  const a = ranks.get(1);
  const b = ranks.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine,
    'Pinned engine must resolve both published 60-card decks');

  const result = runMatch({
    deckA: a.cardIds,
    deckB: b.cardIds,
    seed: 20261016,
    maxActions: 600,
    strictPromptValidation: true,
    label: 'Aichi rank 1 vs rank 10 prompt-integrity readiness'
  });
  assert.equal(result.promptValidationMode, 'predispatch-prompt-validate');
  assert.equal(result.attackDeclarationTraceProtocol,
    'real-store-attack-log-declarations-v1');
  assert.ok(Array.isArray(result.attackDeclarationTrace));
  assert.ok(result.attackDeclarationTrace.length > 0,
    'An actual source-dealt game must exercise the Store attack-log observer');
  for (const declaration of result.attackDeclarationTrace) {
    assert.equal(declaration.kind, 'engine-attack-declaration');
    assert.equal(declaration.resolutionStatus, 'not-independently-verified');
    assert.ok(Number.isInteger(declaration.actionOrdinal) &&
      declaration.actionOrdinal < result.actions);
    assert.ok(typeof declaration.attackName === 'string' &&
      declaration.attackName.length > 0);
    assert.ok([0, 1].includes(declaration.playerSlot));
  }
  return {
    ranks: [1, 10],
    seed: result.seed,
    actions: result.actions,
    finished: result.finished,
    endReason: result.endReason,
    promptValidationMode: result.promptValidationMode,
    engineAttackDeclarations: result.attackDeclarationTrace.length,
    rawAttackActions: result.actionCounts.AttackAction || 0,
    firstTurnPlayerId: result.firstTurnPlayerId,
    verifiedByDrawLog: result.verifiedByDrawLog,
    engine: result.engine,
    policy: result.policy,
    caveat: 'Strict prompt feasibility only, with an unvalidated generic AI policy'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(probeStrictPromptPolicy(), null, 2));
}

module.exports = { probeStrictPromptPolicy };
