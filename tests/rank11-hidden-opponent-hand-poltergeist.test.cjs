'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {makeFixture, observation, audit} =
  require('../simulation/twinleaf/rank11-hidden-opponent-hand-poltergeist.cjs');

test('rank-11 full 60 supports observationally identical opposing hidden hands',
  () => {
    const energy = makeFixture(false);
    const trainer = makeFixture(true);
    assert.deepEqual(observation(energy), observation(trainer));
    assert.equal(energy.sourceDigest, trainer.sourceDigest);
    assert.equal(energy.defender.hand.cards.length, 4);
    assert.equal(trainer.defender.hand.cards.length, 4);
  });

test('printed Poltergeist speculative score sees unrevealed source hand identity',
  () => {
    const result = audit();
    assert.equal(result.sourceRank, 11);
    assert.equal(result.sourceInventoryCards, 60);
    assert.equal(result.sameAttackerObservation, true);
    assert.equal(result.sameSourceCardMultiset, true);
    assert.deepEqual(result.variants.map(v => v.opponentHiddenTrainers), [0, 4]);
    assert.notEqual(result.variants[0].poltergeistScore,
      result.variants[1].poltergeistScore);
    assert.deepEqual(result.variants.map(v => v.selectedActionClass),
      ['AttackAction', 'AttackAction']);
    assert.deepEqual(result.variants.map(v => v.selectedAttack),
      ['Poltergeist', 'Poltergeist']);
    assert.equal(result.preAttackHiddenHandForecastLeak, true);
  });
