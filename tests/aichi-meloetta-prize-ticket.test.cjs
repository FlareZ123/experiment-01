'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {ticketOpportunity,verifyRank26}=require('../scripts/aichi-meloetta-prize-ticket.cjs');
/** Independent physical ordered-deal enumerator. @param {string[]} pool @param {number} h @param {number} q */
function exhaustive(pool,h,q){
 const cards=pool.slice();let accepted=0,prized=0,initial=0,draw=0;
 function visit(pos){
  if(pos===cards.length){
   if(!cards.slice(0,h).some(x=>x.startsWith('B')))return;
   accepted++;
   if(!cards.slice(h,h+q).includes('D'))return;
   prized++;
   if(cards.slice(0,h).includes('T'))initial++;
   if(cards[h+q]==='T')draw++;
   return;
  }
  for(let i=pos;i<cards.length;i++){
   [cards[pos],cards[i]]=[cards[i],cards[pos]];
   visit(pos+1);
   [cards[pos],cards[i]]=[cards[i],cards[pos]];
  }
 }
 visit(0);
 return {requiredPrized:prized/accepted,ticketInitially:initial/accepted,ticketTurnDraw:draw/accepted};
}
test('rank-26 conditional exact probabilities',()=>{
 const a=ticketOpportunity(60,12,7,6);
 assert.ok(Math.abs(a.validOpening-0.8093533072892635)<1e-12);
 assert.ok(Math.abs(a.requiredPrized-0.10077777379917645)<1e-12);
 assert.ok(Math.abs(a.prizedAndTicketInEight-0.012988068548897478)<1e-12);
 assert.ok(Math.abs(a.prizedWithoutDirectTicket-0.08778970525027897)<1e-12);
 assert.ok(Math.abs(a.directTicketGivenPrized-0.12887830380912438)<1e-12);
});
test('independent exhaustive physical-card deals agree',()=>{
 for(const [deck,h,q] of [
  [['B1','B2','D','T','F1','F2','F3','F4'],2,2],
  [['B1','B2','B3','D','T','F1','F2','F3'],3,1],
 ]){
  const a=ticketOpportunity(deck.length,deck.filter(x=>x.startsWith('B')).length,h,q);
  const e=exhaustive(deck,h,q);
  for(const k of ['requiredPrized','ticketInitially','ticketTurnDraw'])assert.ok(Math.abs(a[k]-e[k])<1e-12,k);
 }
});
test('reject drift in source card counts',()=>{
 const data={decks:[{rank:26,cards:Object.entries({
  'Double Colorless Energy':1,'Redeemable Ticket':1,'Lightning Energy':2,
  'Meloetta ex':1,'Technical Machine: Crisis Punch':2,'Tapu Koko ♢':1,Filler:52
 }).map(([name,count])=>({name,count}))}]};
 assert.ok(verifyRank26(data));
 data.decks[0].cards=data.decks[0].cards.filter(x=>x.name!=='Redeemable Ticket');
 assert.throws(()=>verifyRank26(data),/source drift/);
 assert.throws(()=>ticketOpportunity(60,12,7,54),/Invalid setup/);
});
