'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probePlumeriaShortPayment}=require('../simulation/twinleaf/agent42-plumeria-shortpayment-native.cjs');
test('original rank6 Plumeria Store prompt and card custody both physical seats',()=>{
 for(const seat of [0,1])for(const count of [0,1,2]){
  const r=probePlumeriaShortPayment(seat,count);
  console.log('AGENT42_PLUMERIA_PAYMENT '+JSON.stringify(r));
  assert.equal(r.sourceRank,6);
  assert.equal(r.ownerSeat,seat);
  assert.equal(r.supporterPrinting,'Plumeria BUS');
  assert.equal(r.rootError,null,JSON.stringify(r));
  assert.equal(r.paymentPromptFound,true,JSON.stringify(r));
  assert.deepEqual(r.paymentPromptBounds,{min:2,max:2});
  assert.equal(r.paymentValidatorAccepted,count===2);
  assert.equal(r.paymentError,null,JSON.stringify(r));
  assert.equal(r.paymentPromptSettled,true);
  assert.deepEqual(r.paymentCustody.map(c=>c.inOwnerDiscard),[count>=1,count===2]);
  assert.equal(r.targetPromptFound,count>0,JSON.stringify(r));
  assert.equal(r.energyPromptFound,count>0,JSON.stringify(r));
  if(count>0){
   assert.equal(r.targetValidatorAccepted,true,JSON.stringify(r));
   assert.equal(r.targetError,null,JSON.stringify(r));
   assert.equal(r.energyValidatorAccepted,true,JSON.stringify(r));
   assert.equal(r.energyError,null,JSON.stringify(r));
  }
  assert.equal(r.opposingEnergyCustody.inOpponentDiscard,count>0,JSON.stringify(r));
  assert.equal(r.opposingEnergyCustody.inOpponentActive,count===0);
  assert.equal(r.competitiveQualifiedGames,0);
 }
});
