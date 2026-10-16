'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {ticketPostShuffleAccess}=require('../scripts/aichi-ticket-postshuffle-access.cjs');
test('direct Ticket plus Compressor and one subsequent draw',()=>{
  const result=ticketPostShuffleAccess(60,12,7,6,4,1);
  assert.equal(result.cardsRemaining,46);
  assert.ok(Math.abs(result.unconditionalAfterShuffle-0.00011003985764496337)<1e-12);
});
