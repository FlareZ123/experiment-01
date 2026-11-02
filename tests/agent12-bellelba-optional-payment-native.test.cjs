'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run,VERSION}=require('../simulation/twinleaf/agent12-bellelba-optional-payment-native.cjs');

test('actual pinned Bellelba and Brycen-Man optional payment native both-seat matrix',()=>{
  const x=run();
  assert.equal(x.version,VERSION);
  assert.equal(x.rows.length,10);
  for(const row of x.rows){
    console.log('AGENT12_BELLELBA_NATIVE '+JSON.stringify(row));
    assert.equal(row.competitiveQualifiedGames,0);
    assert.deepEqual(row.sourceRanksContainingPrinting,[2,7,24]);
    assert.equal(row.confirmFound,true);
    assert.equal(row.costPromptFound,true,
      'Prepared four-Bench state should offer optional hand payment');
    assert.deepEqual(row.costPromptBounds,{min:3,max:3});
    assert.equal(row.begin.sourceBench,4);
    assert.equal(row.begin.opponentBench,4);
    assert.equal(row.begin.sourceDeck,7);
    assert.equal(row.begin.opponentDeck,7);
    assert.equal(row.end.sourceDeck,4);
    assert.equal(row.end.opponentDeck,4);
    assert.ok(row.receipts.every(r=>r.error===null),JSON.stringify(row));
    assert.equal(row.cost.valid,row.offered===3);
    assert.deepEqual(row.originalHandCardStatus.map(s=>s.inDiscard),
      row.originalHandCardStatus.map((_,i)=>i<row.offered));
    assert.equal(row.end.sourceBench,3,
      'Actual Store gave optional bench-discard after short/valid replies');
    assert.equal(row.end.opponentBench,3,
      'Both players discarded a real Benched Pokémon in native Store');
    assert.equal(row.pending.length,0);
  }
  assert.equal(x.competitiveQualifiedGames,0);
});
