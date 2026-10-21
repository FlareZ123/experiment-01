'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {sourceRank26TicketCompressor}=require('../simulation/twinleaf/ticket-rank26-source-compressor.cjs');
test('source 60 stage confirms Ticket and Compressor effect path',()=>{
 const x=sourceRank26TicketCompressor();
 assert.equal(x.sourceRank,26);
 assert.equal(x.exactRegisteredCopies,60);
 assert.equal(x.postFirstDrawDeckCount,46);
 assert.equal(x.postCompressorDeckCount,45);
 assert.equal(x.mandatoryCompressorDiscardAccepted,true);
 assert.equal(x.zeroSelectionRejected,true);
 assert.equal(x.paperMinimumCorrection,true);
 assert.equal(x.conditionalSevenCardAccess,7/45);
 assert.equal(x.ticketAndCompressorItemsDispatched,true);
 assert.equal(x.dceReturnedToBottomThenShuffledToTop,true);
 assert.equal(x.winRateMeasured,false);
});
