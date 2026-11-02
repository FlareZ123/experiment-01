'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {flexibleFirstTurnBoxOffer} =
  require('../simulation/twinleaf/agent44-flexible-box-k0-plan.cjs');

/** @param {string[]} handNames @param {(string|null)[]} benchNames */
function offer(handNames, benchNames = Array(5).fill(null)) {
  return flexibleFirstTurnBoxOffer({
    turn: 1,
    handNames,
    benchNames,
    activeName: 'Mega Absol ex',
    itemLocked: false,
    toolLocked: false
  });
}

test('native flexible Box K0 always discards available unreserved VIP first', () => {
  const before = offer([
    'Secret Box', 'Trubbish', 'Float Stone', 'Battle VIP Pass',
    'Dark Patch', 'VS Seeker', 'Lightning Energy', 'Quick Ball'
  ]);
  assert.equal(before.eligible, true);
  assert.deepEqual(before.discardNames,
    ['Battle VIP Pass', 'Dark Patch', 'Quick Ball']);

  // Model a legitimate first-turn VIP targeting a Basic from deck and
  // preserving the owner-held physical cards before the Box cost.
  const after = offer([
    'Secret Box', 'Trubbish', 'Float Stone',
    'Dark Patch', 'VS Seeker', 'Lightning Energy', 'Quick Ball'
  ], ['Budew', null, null, null, null]);
  assert.equal(after.eligible, true);
  assert.deepEqual(after.discardNames,
    ['Dark Patch', 'Quick Ball', 'VS Seeker']);
});

test('VIP-before-Box is not automatically payable in every Box-VIP opener', () => {
  const before = offer([
    'Secret Box', 'Trubbish', 'Float Stone',
    'Battle VIP Pass', 'Dark Patch', 'VS Seeker'
  ]);
  assert.equal(before.eligible, true);
  assert.deepEqual(before.discardNames,
    ['Battle VIP Pass', 'Dark Patch', 'VS Seeker']);
  const after = offer([
    'Secret Box', 'Trubbish', 'Float Stone', 'Dark Patch', 'VS Seeker'
  ], ['Budew', null, null, null, null]);
  assert.equal(after.eligible, false);
  assert.equal(after.reason, 'NO_BOX_UPFRONT_THREE_DISCARDS');
});

test('full Bench forbids treating held VIP as another executable line', () => {
  const selected = offer([
    'Secret Box', 'Float Stone', 'Battle VIP Pass',
    'Dark Patch', 'VS Seeker', 'Lightning Energy'
  ], ['Trubbish', 'Budew', 'Mega Absol ex', 'Crobat V', 'Dedenne-GX']);
  assert.equal(selected.eligible, true);
  assert.equal(selected.discardNames[0], 'Battle VIP Pass');
  // A VIP line is still unavailable: all five public Bench slots are full.
  // The mathematical comparison must explicitly exclude these positions.
});
