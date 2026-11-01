'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { run } = require('../simulation/twinleaf/agent20-steven-zero-search-native.cjs');

test('original rank-7 Steven search offers native zero despite printed Trainer minimum one', () => {
  const { rows, enginePin } = run();
  assert.equal(enginePin, 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(rows.length, 4);
  for (const row of rows) {
    assert.equal(row.sourcePrinting, "Steven's Resolve CES 145");
    assert.equal(row.originalRank, 7);
    assert.equal(row.min, 0, 'Pinned original card asks for a zero-minimum search');
    assert.equal(row.max, 3);
    assert.equal(row.validatorAcceptedZero, true);
    assert.equal(row.choiceValidated, true);
    assert.equal(row.dispatched, true, JSON.stringify(row.errors));
    assert.deepEqual(row.errors, [], JSON.stringify(row));
    assert.ok(row.opponentHandAfter.length <= 1,
      'At most one physical opponent draw occurs on handoff');
    if (row.pickedCards === 0) {
      assert.equal(row.ownerDeckBefore, row.ownerDeckAfter,
        'An accepted zero-card search must move no physical card');
    } else {
      assert.equal(row.ownerDeckAfter, row.ownerDeckBefore - 1);
      assert.ok(row.ownerHandAfter.includes('Psychic Energy MEE'));
    }
  }
});
