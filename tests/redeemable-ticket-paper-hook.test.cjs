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

const {auditTicketK1EpochContrast}=
  require('../simulation/twinleaf/ticket-k1-epoch-contrast.cjs');

test('Ticket loses exact owner deck membership after a real hidden Prize redeal',()=>{
  const result=auditTicketK1EpochContrast();
  assert.equal(result.priorDeckSize,16);
  assert.equal(result.postRedealPublicViewsMatch,true);
  assert.deepEqual(result.physicallyPrizedTarget,[true,false]);
  assert.deepEqual(result.literalDeckPresence,[false,true]);
  assert.deepEqual(result.sourcePossibilityAfterRedeal,[true,true]);
  assert.equal(result.targetNewPrizeProbabilityUnderUniformOrder,6/16);
  assert.equal(result.qualifiedForCompetitiveInference,false);
});
