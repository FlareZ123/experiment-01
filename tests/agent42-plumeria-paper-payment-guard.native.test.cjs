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
  assert.equal(a.physicalPaymentReceipts.length,count===2?1:0);
  assert.equal(a.physicalEffectReceipts.length,count===2?1:0);
  if(count===2){
   const effect=a.physicalEffectReceipts[0];
   assert.equal(effect.ownerSeat,seat);
   assert.equal(effect.paymentIndependentlyPaidTwo,true);
   assert.equal(effect.energyAttachedToTargetBefore,true);
   assert.equal(effect.energyInOpponentDiscardBefore,false);
   assert.equal(effect.energyInOpponentDiscardAfter,true);
   assert.equal(effect.energyStillAttachedAfter,false);
   assert.equal(effect.nativePromptSettled,true);
   assert.equal(effect.independentEnergyRemoval,true);
  }
  if(count===2){
   const receipt=a.physicalPaymentReceipts[0];
   assert.equal(receipt.ownerSeat,seat);
   assert.equal(receipt.handMembersBefore,2);
   assert.equal(receipt.discardMembersBefore,0);
   assert.equal(receipt.movedToOwnerDiscardCount,2);
   assert.equal(receipt.noLongerInOwnerHandCount,2);
   assert.equal(receipt.nativePromptSettled,true);
   assert.equal(receipt.independentlyPaidTwo,true);
  }
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

test('paper Plumeria rejects repeated reference and cards outside owner hand',()=>{
 for(const seat of [0,1])for(const variant of ['duplicate','foreign']){
  const {result:r,audit:a}=withPaperPlumeriaPayment(()=>
   probePlumeriaShortPayment(seat,2,variant));
  console.log('AGENT42_PLUMERIA_GUARD_ADVERSARIAL '+JSON.stringify({seat,variant,audit:a,result:r}));
  assert.equal(a.observed,1);
  assert.equal(a.accepted,0);
  assert.equal(a.rejected,1);
  assert.equal(a.physicalPaymentReceipts.length,0);
  assert.equal(a.physicalEffectReceipts.length,0);
  assert.match(r.paymentError,/PAPER_PLUMERIA_INVALID_TWO_CARD_PAYMENT/);
  assert.equal(r.targetPromptFound,false);
  assert.equal(r.energyPromptFound,false);
  assert.deepEqual(r.paymentCustody.map(c=>c.inOwnerDiscard),[false,false]);
  assert.equal(r.opposingEnergyCustody.inOpponentActive,true);
  assert.equal(r.opposingEnergyCustody.inOpponentDiscard,false);
 }
});
