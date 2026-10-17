'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {cursedBlastAceTrainerContract} = require('../simulation/twinleaf/new-moon-cursed-blast-ace-trainer.cjs');

test('New Moon Cursed Blast self-KO creates real Ace Trainer Prize inequality', () => {
  const r = cursedBlastAceTrainerContract();
  assert.equal(r.before.canPlayAce, false);
  assert.equal(r.afterBlast.otherPrizes, 5);
  assert.equal(r.afterBlast.canPlayAce, true);
  assert.equal(r.afterSupporter.otherHand, 3);
  assert.equal(r.afterSupporter.ownHand, 6);
});
