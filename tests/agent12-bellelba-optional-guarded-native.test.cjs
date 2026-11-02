'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {guardedProbe}=require('../simulation/twinleaf/agent12-bellelba-optional-guarded-native.cjs');

test('Bellelba paper-guard rejects 0/1/2 other cards and permits fully paid Bench discard on both native seats',()=>{
  for(const seat of [0,1])for(const offered of [0,1,2,3]){
    const row=guardedProbe(seat,offered);
    console.log('AGENT12_BELLELBA_GUARDED_NATIVE '+JSON.stringify(row));
    assert.equal(row.audit.qualifiedGames,0);
    assert.equal(row.audit.optionalConfirms,1);
    assert.equal(row.audit.optionalCostReplies,1);
    assert.equal(row.audit.rejectedShortOrAlienPayments,
      offered===3?0:1);
    assert.equal(row.audit.acceptedPayments,offered===3?1:0);
    assert.equal(row.result.costPromptFound,true);
    assert.equal(row.result.cost.valid,offered===3);
    if(offered===3){
      assert.equal(row.result.cost.error,null);
      assert.equal(row.result.end.sourceBench,3);
      assert.equal(row.result.end.opponentBench,3);
      assert.equal(row.result.pending.length,0);
    }else{
      assert.match(row.result.cost.error,
        /PAPER_BELLELBA_OPTION_PAYMENT_INVALID/);
      assert.equal(row.result.end.sourceBench,4);
      assert.equal(row.result.end.opponentBench,4);
      assert.ok(row.result.pending.includes('ChooseCardsPrompt'));
    }
    assert.equal(row.result.end.sourceDeck,4);
    assert.equal(row.result.end.opponentDeck,4);
  }
});

test('Bellelba three-other-card optional action is vetoed with only two other cards',()=>{
  for(const seat of [0,1]){
    const row=guardedProbe(seat,2,2);
    console.log('AGENT12_BELLELBA_GUARDED_NATIVE '+JSON.stringify(row));
    assert.equal(row.audit.optionalConfirms,1);
    assert.equal(row.audit.rejectedUnaffordableConfirm,1);
    assert.equal(row.audit.optionalCostReplies,0);
    assert.equal(row.result.confirmFound,true);
    assert.equal(row.result.costPromptFound,false);
    assert.equal(row.result.end.sourceBench,4);
    assert.equal(row.result.end.opponentBench,4);
    assert.ok(row.result.pending.includes('ConfirmPrompt'));
    assert.equal(row.result.end.sourceDeck,4);
    assert.equal(row.result.end.opponentDeck,4);
  }
});
