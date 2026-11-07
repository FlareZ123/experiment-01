'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {probe} =
  require('../simulation/twinleaf/agent12-capture-energy-empty-deck-native.cjs');

for (const seat of [0, 1]) {
  test('native Capture Energy owner seat ' + seat +
    ' empty-deck search error occurs after card attachment', () => {
    const zero = probe(seat, 0);
    assert.equal(zero.before.handHasCapture, true);
    assert.equal(zero.before.activeEnergyContainsCapture, false);
    assert.ok(zero.thrown, 'Expected native empty-deck search to raise');
    assert.equal(zero.afterAttach.handHasCapture, false);
    assert.equal(zero.afterAttach.activeEnergyContainsCapture, true,
      'Live Store changed physical attachment before rejected effect');
    assert.equal(zero.afterAttach.activeContainsCapture, true);
    assert.equal(zero.afterAttach.energyPlayedTurn, 3);
    assert.equal(zero.afterPrompts.deckCount, 0);
    assert.equal(zero.paperGameQualified, false);
    console.log('CAPTURE_ENERGY_EMPTY_DECK_NATIVE ' + JSON.stringify(zero));
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
