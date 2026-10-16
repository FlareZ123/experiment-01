'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');

/** @param {object} record */
function withoutTrace(record) {
  const {decisionTrace, ...game} = record;
  return game;
}

/**
 * A positive control for diagnostic observability: the real physical game
 * must not change when instrumented ChooseCards selections are also recorded.
 * The two sequential runs use identical 60-card source lists and game/policy
 * seeds, with only the captureDecisionTrace option toggled.
 */
function checkNoninterference() {
  const source = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const field = resolveManifestFile(source, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const byRank = new Map(field.decks.map(deck => [deck.rank, deck.cardIds]));
  const params = {
    deckA: byRank.get(1),
    deckB: byRank.get(6),
    seed: 20261030,
    maxActions: 300,
    label: 'rank1-rank6 selected-card trace noninterference',
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    supporterDecisionCorrection: true,
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true
  };
  const untraced = runMatch({...params, captureDecisionTrace: false});
  const traced = runMatch({...params, captureDecisionTrace: true});
  assert.deepEqual(withoutTrace(traced), withoutTrace(untraced),
    'Enabling diagnostic capture changed a game result or sequence');
  assert.ok(Array.isArray(traced.decisionTrace));
  const actingEntries = traced.decisionTrace.filter(row =>
    row.playerSlot === 0 || row.playerSlot === 1);
  assert.ok(actingEntries.length > 0, 'Expected at least one acting-player decision');
  assert.ok(actingEntries.every(row =>
    row.decisionHandBefore?.perspectiveSeat === row.playerSlot &&
    Array.isArray(row.decisionHandBefore.ownHandPrintings)),
  'Every attributed meaningful action must carry its own pre-dispatch hand');
  assert.equal(untraced.decisionTrace, null);
  return {
    diagnostic: 'instrumentation-isolation-only',
    fixedSourceRanks: [1, 6],
    seed: params.seed,
    firstTurnSlot: traced.firstTurnSlot,
    actions: traced.actions,
    capturedActions: traced.decisionTrace.length,
    observedHandSamples: actingEntries.length,
    selectedCardPrompts: traced.decisionTrace.filter(row => row.cardSelection).length,
    finished: traced.finished,
    noninterferenceVerified: true,
    caution: 'One deterministic fixture is not a complete policy or simulator qualification'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(checkNoninterference(), null, 2) + '\n');
}

module.exports = {checkNoninterference, withoutTrace};
