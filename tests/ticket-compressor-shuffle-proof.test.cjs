'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ticketCompressorWitness}=require('../simulation/twinleaf/ticket-compressor-shuffle-proof.cjs');
test('corrected Ticket and actual Compressor search permit a later DCE draw',()=>{
 const r=ticketCompressorWitness();
 assert.equal(r.oldPrizeDceReturnedToBottom,true);
 assert.equal(r.oneMandatoryDiscardAccepted,true);
 assert.equal(r.zeroSelectionRejected,true);
 assert.equal(r.paperMinimumCorrection,true);
 assert.equal(r.compressorShufflePrompt,true);
 assert.equal(r.dceAccessibleToDraw,true);
});
