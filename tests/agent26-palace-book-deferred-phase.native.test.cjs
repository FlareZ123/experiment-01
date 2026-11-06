'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent20-palace-book-turnend-native.cjs');

test('Palace Book printed native Item settles after deferred WaitPrompt chain',()=>{
  const result=run();
  assert.equal(result.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(result.rows.length,6);
  for(const row of result.rows){
    assert.equal(row.canPlay,true,JSON.stringify(row));
    assert.equal(row.accepted,true,JSON.stringify(row));
    assert.equal(row.error,null,JSON.stringify(row));
    assert.equal(row.palaceInHand,false,JSON.stringify(row));
    assert.equal(row.palaceInSupporter,false,JSON.stringify(row));
    assert.equal(row.palaceInDiscard,true,JSON.stringify(row));
    assert.equal(row.handCountAfter,Math.min(3,row.deckSize),
      JSON.stringify(row));
    assert.equal(row.deckCountAfter,Math.max(0,row.deckSize-3),
      JSON.stringify(row));
    assert.equal(row.resultingTurn,4,JSON.stringify(row));
    assert.equal(row.resultingActiveSeat,1-row.seat,JSON.stringify(row));
    assert.ok(row.resolvedPrompts.includes('WaitPrompt'),
      'expect deferred phase transition '+JSON.stringify(row));
    assert.deepEqual(row.pendingPrompts,[],JSON.stringify(row));
  }
  console.log('AGENT26_PALACE_BOOK_POSTWAIT_FIDELITY',
    JSON.stringify({printed:'Palace Book SMP NAN25',
      sourceModule:'agent20-palace-book-turnend-native',
      seats:[0,1],controlledDeckSizes:[1,3,5],
      allSixNativeItemOutcomesVerified:true,
      deferredPromptResolutionRequired:true,
      competitiveQualifiedGames:0}));
});
