'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {auditTicketPaperOrder}=require('../simulation/twinleaf/redeemable-ticket-paper-regression.cjs');
test('genuine Ticket Store action obeys corrected paper deck order',()=>{
 const result=auditTicketPaperOrder();
 assert.equal(result.baselineWrongEnd,true);
 assert.equal(result.correctedNormalDrawOrder,true);
 assert.equal(result.correctedShortDeck,true);
 assert.equal(result.restored,true);
});
