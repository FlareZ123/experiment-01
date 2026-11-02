'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {PRINTING,probeGuzmaHalaPayment}=
  require('../simulation/twinleaf/agent30-guzma-hala-optional-payment-native.cjs');

test('prospective original rank6 G&H zero/one/two physical payments in each genuine native owner seat',()=>{
  assert.equal(PRINTING,'Guzma & Hala CEC');
  for(const seat of [0,1]){
    for(const count of [0,1,2]){
      const row=probeGuzmaHalaPayment(seat,count);
      console.log('AGENT30_GUZMA_HALA_PAYMENT '+JSON.stringify(row));
      assert.equal(row.sourceRank,6);
      assert.equal(row.rootError,null,JSON.stringify(row));
      assert.equal(row.choiceFound,true,JSON.stringify(row));
      assert.equal(row.choiceError,null,JSON.stringify(row));
      assert.equal(row.paymentPromptFound,true,JSON.stringify(row));
      assert.deepEqual(row.paymentPromptLimits,{min:2,max:2});
      assert.equal(row.paperPaid,count===2);
      assert.equal(row.paymentValidatorAccepted,count===2);
      assert.equal(row.paymentError,null,JSON.stringify(row));
      assert.equal(row.retrievalPromptFound,true,JSON.stringify(row));
      assert.equal(row.retrievalValidatorAccepted,true,JSON.stringify(row));
      assert.equal(row.retrievalError,null,JSON.stringify(row));
      assert.ok(row.recoveredPrintings.every(card=>card.inHand&&!card.inDeck),
        JSON.stringify(row));
      assert.deepEqual(row.physicalPaymentCards.map(c=>c.inDiscard),
        [count>0,count>1]);
      assert.deepEqual(row.physicalPaymentCards.map(c=>c.inHand),
        [count===0,count<2]);
      assert.equal(row.competitiveQualifiedGames,0);
    }
  }
});

test('Guzma and Hala zero Stadium search does not schedule printed shuffle in native Store',()=>{
  const {probe}=require('../simulation/twinleaf/agent1-ghala-zero-search-native.cjs');
  for(const seat of [0,1]){
    const skipped=probe(seat,false);
    const chosen=probe(seat,true);
    console.log('AGENT1_GHALA_ZERO_SEARCH '+JSON.stringify({skipped,chosen}));
    assert.equal(skipped.valid,true);
    assert.equal(chosen.valid,true);
    assert.equal(chosen.shufflePrompt,true);
    assert.equal(skipped.sameOrder,true);
    assert.equal(skipped.shufflePrompt,false);
  }
});
