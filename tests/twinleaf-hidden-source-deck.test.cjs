'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { auditSourceHiddenPolicy } =
  require('../simulation/twinleaf/hidden-source-deck-policy.cjs');

test('actual 60-card Aichi rank-10 inventory still reveals hidden draw order', () => {
  const outcome = auditSourceHiddenPolicy();
  assert.equal(outcome.sourceRank, 10);
  assert.equal(outcome.sourceDeckCards, 60);
  assert.match(outcome.candidateDigest, /^[0-9a-f]{64}$/);
  assert.equal(outcome.identicalObservedZonesAndCompleteSourceDeck, true);
  assert.notEqual(outcome.unproductiveTopScore, outcome.productiveTopScore);
  assert.equal(outcome.lateFourteenCardDeck.actionChanged, true);
  assert.equal(outcome.lateFourteenCardDeck.unproductiveTopAction, 'PassTurnAction');
  assert.equal(outcome.lateFourteenCardDeck.productiveTopAction, 'PlayCardAction');
  assert.ok(outcome.lateFourteenCardDeck.unproductiveTopScore <
    outcome.lateFourteenCardDeck.supporterThreshold);
  assert.ok(outcome.lateFourteenCardDeck.productiveTopScore >
    outcome.lateFourteenCardDeck.supporterThreshold);
});
