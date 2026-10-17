'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  runSourceProfilePair, rank2DecisionReadout, PROFILES
} = require('../simulation/twinleaf/expanded-source-profile-pair.cjs');

test('both Expanded policies accept identical printed rank-1/rank-2 seats and seeds', () => {
  const study = runSourceProfilePair({maxActions: 6});
  assert.equal(study.samples.length, 2);
  assert.equal(PROFILES.length, 2);
  for (const sample of study.samples) {
    assert.equal(sample.equalSourceHashes, true);
    assert.equal(sample.equalFirstTurn, true);
    assert.equal(sample.arms.length, 2);
    for (const arm of sample.arms) {
      assert.equal(arm.strictPromptValidation, 'predispatch-prompt-validate');
      assert.ok(arm.actions <= 6);
      assert.equal(arm.deckHashes.length, 2);
    }
  }
});

test('rank-2 readout filters independent-seat actions without recording wins', () => {
  const game = {
    finished: false, actions: 4, turns: 2, firstTurnSlot: 0,
    verifiedByDrawLog: true, deckHashes: ['a', 'b'], policy: 'test',
    cardsPlayedBySeat: [{}, {'Guzma & Hala': 1}],
    attackTrace: [{seat: 0, attack: 'Evolution'},
      {seat: 1, attack: 'Evolution'}],
    decisionTrace: [
      {playerSlot: 0, card: 'Guzma & Hala'},
      {playerSlot: 1, card: 'Guzma & Hala'},
      {playerSlot: 1, attack: 'Evolution'},
      {playerSlot: 1, card: 'irrelevant'}
    ]
  };
  const result = rank2DecisionReadout(game, 1);
  assert.equal(result.status, 'action-limited');
  assert.equal(result.rank2EvolutionAttacks, 1);
  assert.equal(result.rank2DecisionEvents.length, 2);
  assert.equal(Object.hasOwn(result, 'winner'), false);
});
