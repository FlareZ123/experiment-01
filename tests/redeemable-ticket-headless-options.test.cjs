'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,upstreamSmokeDeck}=require('../simulation/twinleaf/headless.cjs');
const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
test('headless Ticket correction opt-in is labeled and restored',()=>{
 const {RedeemableTicket}=require(path.join(ROOT,
  'sets/10-scarlet-and-violet/set-journey-together/exchange-ticket'));
 const before=RedeemableTicket.prototype.reduceEffect;
 const deck=upstreamSmokeDeck();
 const args={deckA:deck,deckB:deck,seed:18026,maxActions:35};
 const corrected=runMatch({...args,redeemableTicketPaperOrderCorrection:true});
 assert.equal(corrected.redeemableTicketPaperOrderCorrection,true);
 assert.match(corrected.policy,/TicketPaperPrizeOrder-v1/);
 assert.equal(RedeemableTicket.prototype.reduceEffect,before);
 const unpatched=runMatch(args);
 assert.equal(unpatched.redeemableTicketPaperOrderCorrection,false);
 assert.doesNotMatch(unpatched.policy,/TicketPaperPrizeOrder-v1/);
 assert.equal(RedeemableTicket.prototype.reduceEffect,before);
});
