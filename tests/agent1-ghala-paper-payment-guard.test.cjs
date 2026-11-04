'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withGuard}=require('../simulation/twinleaf/agent1-ghala-paper-payment-guard.cjs');
const {probeGuzmaHalaPayment:probe}=require('../simulation/twinleaf/agent30-guzma-hala-optional-payment-native.cjs');
test('native G&H paper payments both seats',()=>{
 for(const seat of [0,1])for(const count of [0,1,2]){
  const {result:r,audit:a}=withGuard(()=>probe(seat,count));
  console.log('GHALA_GUARD '+JSON.stringify({seat,count,error:r.paymentError,audit:a}));
  assert.equal(a.observedPayments,1);
  assert.equal(a.rejectedPayments,count===2?0:1);
  if(count===2)assert.equal(r.paymentError,null);
  else assert.match(r.paymentError,/PAPER_GHALA_INVALID/);
 }
});


test('native G&H redirects original-rank6 Prism Star payment to Lost Zone on both seats',()=>{
 for(const seat of [0,1]){
  const {result:r,audit:a}=withGuard(()=>probe(seat,2,{prismStarCost:true}));
  console.log('GHALA_PRISM_CUSTODY '+JSON.stringify({seat,error:r.paymentError,audit:a}));
  assert.equal(r.paymentError,null);
  assert.equal(r.retrievalError,null);
  assert.deepEqual(r.physicalPaymentCards.map(c=>c.inDiscard),[true,false]);
  assert.deepEqual(r.physicalPaymentCards.map(c=>c.inLostZone),[false,true]);
  assert.equal(a.acceptedPayments,1);
  assert.equal(a.settledPhysicalPayments,1);
  assert.equal(a.unresolvedPhysicalPayments,0);
  assert.equal(a.physicalPaymentReceipts.length,1);
  assert.deepEqual(a.physicalPaymentReceipts[0].cardCustody.map(x=>x.expectedDestination),
   ['discard','lostzone']);
  assert.ok(a.physicalPaymentReceipts[0].cardCustody.every(x=>x.paidCorrectly));
  assert.equal(a.paperQualifiedGames,0);
 }
});
