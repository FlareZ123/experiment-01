'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { run } = require('../simulation/twinleaf/agent20-steven-zero-search-native.cjs');

test('original rank-7 Steven search offers native zero despite printed Trainer minimum one', () => {
  const { rows, guardedRows, enginePin } = run();
  assert.equal(enginePin, 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(rows.length, 4);
  for (const row of rows) {
    assert.equal(row.sourcePrinting, "Steven's Resolve CES 145");
    assert.equal(row.originalRank, 7);
    assert.equal(row.sourceStamp, "Steven's Resolve CES");
    assert.equal(row.physicallyOwnedSearch, true);
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
  assert.equal(guardedRows.length,4);
  for(const row of guardedRows){
    assert.equal(row.paperGuard,true);
    assert.equal(row.sourceStamp,"Steven's Resolve CES");
    assert.equal(row.physicallyOwnedSearch,true);
    if(row.pickedCards===0){
      assert.equal(row.dispatched,false);
      assert.match(row.errors[0],/PAPER_STEVEN_CES_SEARCH_REQUIRES_ONE_CARD/);
      assert.equal(row.ownerDeckAfter,row.ownerDeckBefore);
      assert.deepEqual(row.uncompletedPromptFamilies,['ChooseCardsPrompt']);
      assert.equal(row.nextTurnReached,false);
    }else{
      assert.equal(row.dispatched,true,JSON.stringify(row));
      assert.deepEqual(row.errors,[]);
      assert.equal(row.ownerDeckAfter,row.ownerDeckBefore-1);
    }
  }
});
