'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {run} = require('../simulation/twinleaf/agent20-palace-book-turnend-native.cjs');

test('three physical source decks: Palace Book draws up to three and immediately ends turn',()=>{
  const out=run();
  assert.equal(out.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(out.rows.length,6);
  for(const r of out.rows){
    assert.equal(r.printing,'Palace Book SMP NAN25');
    assert.deepEqual(r.sourceRanks,[6,7,24]);
    assert.equal(r.canPlay,true);
    assert.equal(r.accepted,true,JSON.stringify(r));
    assert.equal(r.error,null);
    const drawn=Math.min(3,r.deckSize);
    assert.equal(r.handCountAfter,drawn,JSON.stringify(r));
    assert.equal(r.deckCountAfter,r.deckSize-drawn,JSON.stringify(r));
    assert.equal(r.palaceInHand,false);
    assert.equal(r.resultingTurn,4,JSON.stringify(r));
    assert.equal(r.resultingActiveSeat,1-r.seat,JSON.stringify(r));
  }
});
