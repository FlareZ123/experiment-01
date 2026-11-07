'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {probe} =
  require('../simulation/twinleaf/agent12-capture-energy-empty-deck-native.cjs');

for (const seat of [0, 1]) {
  test('native Capture Energy owner seat ' + seat +
    ' empty-deck rejected attachment still consumes energy allowance', () => {
    const zero = probe(seat, 0);
    assert.equal(zero.before.handHasCapture, true);
    assert.equal(zero.before.activeEnergyContainsCapture, false);
    assert.ok(zero.thrown, 'Expected native empty-deck search to raise');
    assert.equal(zero.afterAttach.handHasCapture, true);
    assert.equal(zero.afterAttach.activeEnergyContainsCapture, false,
      'Native empty-deck search throws before card is attached');
    assert.equal(zero.afterAttach.activeContainsCapture, false);
    assert.equal(zero.afterAttach.energyPlayedTurn, 3);
    assert.equal(zero.afterPrompts.deckCount, 0);
    assert.equal(zero.paperGameQualified, false);
    console.log('CAPTURE_ENERGY_EMPTY_DECK_NATIVE ' + JSON.stringify(zero));
  });

  test('native Capture Energy owner seat ' + seat +
    ' zero-deck with full Bench has no illegal search or attachment failure', () => {
    const fullBench = probe(seat, 0, {benchFull: true});
    assert.equal(fullBench.thrown, null);
    assert.equal(fullBench.afterAttach.handHasCapture, false);
    assert.equal(fullBench.afterAttach.activeEnergyContainsCapture, true);
    assert.equal(fullBench.afterPrompts.benchOccupiedCount, 5);
    assert.equal(fullBench.afterPrompts.deckCount, 0);
    assert.equal(fullBench.afterPrompts.pending.length, 0);
    assert.deepEqual(fullBench.answers, []);
    console.log('CAPTURE_ENERGY_FULL_BENCH_NATIVE ' + JSON.stringify(fullBench));
  });

  test('native Capture Energy owner seat ' + seat +
    ' non-Basic deck search may choose zero and still attach', () => {
    const noBasic = probe(seat, 1, {deckCardBasic: false});
    assert.equal(noBasic.thrown, null);
    assert.equal(noBasic.afterAttach.activeEnergyContainsCapture, true);
    assert.equal(noBasic.afterPrompts.benchOccupiedCount, 0);
    assert.equal(noBasic.afterPrompts.deckCount, 1);
    assert.ok(noBasic.answers.some(a => a.type === 'ChooseCardsPrompt' &&
      a.resultCount === 0));
    assert.ok(noBasic.answers.some(a => a.type === 'ShuffleDeckPrompt' &&
      a.resultCount === 1));
    console.log('CAPTURE_ENERGY_NO_BASIC_NATIVE ' + JSON.stringify(noBasic));
  });

  test('native Capture Energy owner seat ' + seat +
    ' one-Basic search can resolve and physically bench recipient', () => {
    const positive = probe(seat, 1);
    assert.equal(positive.thrown, null);
    assert.equal(positive.afterAttach.activeEnergyContainsCapture, true);
    assert.equal(positive.afterPrompts.benchHasBasic, true,
      'Original real physical deck Basic must move to own Bench');
    assert.equal(positive.afterPrompts.deckCount, 0);
    assert.ok(positive.answers.some(x => x.type === 'ChooseCardsPrompt'
      && x.resultCount === 1));
    assert.equal(positive.paperGameQualified, false);
    console.log('CAPTURE_ENERGY_ONE_BASIC_NATIVE ' + JSON.stringify(positive));
  });
}
