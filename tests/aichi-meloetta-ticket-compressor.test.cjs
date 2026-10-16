'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {ticketCompressor,verifyCompressor}=require('../scripts/aichi-meloetta-ticket-compressor.cjs');
/** Enumerate physical permutations, preserving all Prize and draw zones. */
function exhaustive(cards,h,q){
 let total=0,hits=0;
 function visit(i){
  if(i===cards.length){
   if(!cards.slice(0,h).some(x=>x[0]==='B'))return;
   total++;
   if(!cards.slice(h,h+q).includes('D'))return;
   const first=cards.slice(0,h).concat(cards[h+q]);
   if(first.includes('T')&&first.some(x=>x[0]==='C'))hits++;
   return;
  }
  for(let j=i;j<cards.length;j++){
   [cards[i],cards[j]]=[cards[j],cards[i]];
   visit(i+1);
   [cards[i],cards[j]]=[cards[j],cards[i]];
  }
 }
 visit(0);return hits/total;
}
test('rank26 exact direct Ticket plus Compressor rate',()=>{
 const r=ticketCompressor(60,12,7,6,4);
 assert.ok(Math.abs(r.directRoute-0.0050618334516683156)<1e-13);
 assert.ok(Math.abs(r.bothOpening-0.0038126628930664048)<1e-13);
 assert.ok(Math.abs(r.compressorDraw-0.0005733876066321353)<1e-13);
 assert.ok(Math.abs(r.ticketDraw-0.0006757829519697752)<1e-13);
});
test('independent physical deals for multiple miniature decks',()=>{
 for(const [cards,h,q,c] of [
  [['B1','B2','D','T','C1','C2','F1','F2','F3'],3,2,2],
  [['B1','B2','D','T','C1','F1','F2','F3'],3,2,1],
 ]){
  const p=ticketCompressor(cards.length,cards.filter(x=>x[0]==='B').length,h,q,c).directRoute;
  assert.ok(Math.abs(p-exhaustive(cards,h,q))<1e-12);
 }
});
test('source guard and configuration check',()=>{
 const names={'Double Colorless Energy':1,'Redeemable Ticket':1,
 'Lightning Energy':2,'Meloetta ex':1,'Technical Machine: Crisis Punch':2,'Tapu Koko ♢':1,
 'Battle Compressor':4,Filler:48};
 const data={decks:[{rank:26,cards:Object.entries(names).map(([name,count])=>({name,count}))}]};
 assert.equal(verifyCompressor(data),4);
 assert.throws(()=>ticketCompressor(60,12,7,54,4),/Invalid setup/);
});
