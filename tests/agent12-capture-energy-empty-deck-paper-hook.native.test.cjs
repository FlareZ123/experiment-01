'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {probe} =
  require('../simulation/twinleaf/agent12-capture-energy-empty-deck-native.cjs');
const {withPaperCaptureEnergyEmptyDeck, VERSION} =
  require('../simulation/twinleaf/agent12-capture-energy-empty-deck-paper-hook.cjs');

for (const seat of [0, 1]) {
  test('live pinned Store owner ' + seat +
    ' repairs empty deck Energy attachment while preserving printed no-search', () => {
    const original = probe(seat, 0);
    assert.ok(original.thrown, 'Unpatched source must expose native rejection');
    assert.equal(original.afterAttach.handHasCapture, true);
    assert.equal(original.afterAttach.energyPlayedTurn, 3);
    assert.equal(original.afterAttach.activeEnergyContainsCapture, false);

    const patched = withPaperCaptureEnergyEmptyDeck(() => probe(seat, 0));
    assert.equal(patched.result.thrown, null);
    assert.equal(patched.result.afterAttach.handHasCapture, false);
    assert.equal(patched.result.afterAttach.activeEnergyContainsCapture, true);
    assert.equal(patched.result.afterAttach.activeContainsCapture, true);
    assert.equal(patched.result.afterAttach.energyPlayedTurn, 3);
    assert.equal(patched.result.afterPrompts.deckCount, 0);
    assert.equal(patched.result.afterPrompts.benchHasBasic, false);
    assert.equal(patched.result.afterPrompts.pending.length, 0);
    assert.deepEqual(patched.result.answers, []);
    assert.equal(patched.audit.version, VERSION);
    assert.ok(patched.audit.skippedOnlyEmptySearch >= 1);
    assert.equal(patched.audit.paperGameQualified, false);
    console.log('CAPTURE_ENERGY_EMPTY_DECK_PATCHED ' +
      JSON.stringify({seat, original, patched}));
  });

  test('live pinned Store owner ' + seat +
    ' retains ordinary positive Basic Bench search under scoped hook', () => {
    const patched = withPaperCaptureEnergyEmptyDeck(() => probe(seat, 1));
    const row = patched.result;
    assert.equal(row.thrown, null);
    assert.equal(row.afterAttach.activeEnergyContainsCapture, true);
    assert.equal(row.afterPrompts.benchHasBasic, true);
    assert.equal(row.afterPrompts.deckCount, 0);
    assert.ok(row.answers.some(a => a.type === 'ChooseCardsPrompt' &&
      a.resultCount === 1));
    assert.ok(row.answers.some(a => a.type === 'ShuffleDeckPrompt'));
    assert.equal(patched.audit.skippedOnlyEmptySearch, 0);
    assert.equal(row.paperGameQualified, false);
    console.log('CAPTURE_ENERGY_ONE_BASIC_PATCHED ' +
      JSON.stringify({seat, patched}));
  });
}
