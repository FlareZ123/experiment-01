'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { auditHiddenDrawForecast } =
  require('../simulation/twinleaf/hidden-draw-forecast.cjs');

test('pinned simple bot predicts physical deck order in speculative score', () => {
  const result = auditHiddenDrawForecast();
  assert.equal(result.identicalVisibleStateAndDeckMultiset, true);
  assert.equal(result.leaksUnseenDrawOrderIntoSpeculativeActionScore, true);
  assert.notEqual(result.energyTopScore, result.pokemonTopScore);
  assert.equal(result.energyTopAction, 'PassTurnAction');
  assert.equal(result.pokemonTopAction, 'PlayCardAction');
  assert.equal(result.selectsDifferentActionFromUnseenDrawOrder, true);
});
