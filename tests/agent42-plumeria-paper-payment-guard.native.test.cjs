'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probePlumeriaShortPayment}=require('../simulation/twinleaf/agent42-plumeria-shortpayment-native.cjs');
const {withPaperPlumeriaPayment}=require('../simulation/twinleaf/agent42-plumeria-paper-payment-guard.cjs');
test('native Plumeria exactly two physical cards required in both seats',()=>{
 for(const seat of [0,1])for(const count of [0,1,2]){
  const {result:r,audit:a}=withPaperPlumeriaPayment(()=>
   probePlumeriaShortPayment(seat,count));
  console.log('AGENT42_PLUMERIA_GUARD '+JSON.stringify({seat,count,audit:a,result:r}));
  assert.equal(a.observed,1);
  assert.equal(a.accepted,count===2?1:0);
  assert.equal(a.rejected,count===2?0:1);
  if(count<2){
   assert.match(r.paymentError,/PAPER_PLUMERIA_INVALID_TWO_CARD_PAYMENT/);
   assert.equal(r.targetPromptFound,false);
   assert.equal(r.opposingEnergyCustody.inOpponentActive,true);
  }else{
   assert.equal(r.paymentError,null);
   assert.equal(r.targetValidatorAccepted,true);
   assert.equal(r.energyValidatorAccepted,true);
   assert.equal(r.opposingEnergyCustody.inOpponentDiscard,true);
  }
  assert.equal(a.qualifiedGames,0);
 }
});
