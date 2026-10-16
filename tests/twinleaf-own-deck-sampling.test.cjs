'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditOwnDeckSampling} =
  require('../simulation/twinleaf/own-deck-determinization-audit.cjs');

test('opt-in speculative own-deck samples are insensitive to unknown physical order', () => {
  const result = auditOwnDeckSampling();
  assert.deepEqual(result.originalActions,['PassTurnAction','PlayCardAction']);
  assert.equal(result.sampledScores[0],result.sampledScores[1]);
  assert.equal(result.sampledActions[0],result.sampledActions[1]);
  assert.equal(result.originalRealDeckOrdersRestored,true);
});
