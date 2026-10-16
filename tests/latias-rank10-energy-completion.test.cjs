'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  latiasEnergyCompletionContract, runFixture
} = require('../simulation/twinleaf/latias-rank10-energy-completion.cjs');

test('pinned Store attachment to Active completes Latias Eon Blade', () => {
  const observed = runFixture();
  assert.equal(observed.sourceTrial, 'pilot:10:0:temple-v1:A');
  assert.equal(observed.sourceTurn, 6);
  assert.equal(observed.baselineChoice.attackAccepted, false);
  assert.equal(observed.completionChoice.attackAccepted, true);
  assert.equal(observed.completionChoice.damageToKoraidon, 200);
  assert.match(observed.caveat, /staged/);
});

test('one manual Psychic to Tapu Lele preserves Latias Energy insufficiency', () => {
  const passive = latiasEnergyCompletionContract('bench');
  assert.equal(passive.activePsychicAfterAttachment, 2);
  assert.equal(passive.benchedTapuPsychicAfterAttachment, 1);
  assert.equal(passive.attackAccepted, false);
  assert.ok(passive.attackError);
});
