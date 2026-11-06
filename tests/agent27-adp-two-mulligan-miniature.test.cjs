'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {C}=require('../simulation/evaluation/agent5-adp-paid-opening.cjs');
const {minimumProtectedPayments:cost}=
 require('../simulation/evaluation/agent27-adp-protected-payment-cost.cjs');
const {PROFILES,countTwoMulliganBonuses:calc}=
 require('../simulation/evaluation/agent27-adp-two-mulligan-bonus.cjs');
/** @param {number} n @returns {number} */
const bitcount=n=>n.toString(2).replace(/0/g,'').length;
test('independent labeled toy deck exactly matches 2-bonus weighted histogram',()=>{
 const toy=[1,2,1,1,1,1,1,1,2,0,0,1],cards=toy.flatMap((n,j)=>Array(n).fill(j));
 const all=(1<<cards.length)-1, expected=calc(toy,{handSize:4,prizeCount:2});
 const hist=Object.fromEntries(PROFILES.map(p=>[p,Array(5).fill(0n)]));
 let denom=0n,mechanical=0n;
 for(let h=0;h<=all;h++){
  if(bitcount(h)!==4)continue;
  const hand=Array(12).fill(0);
  cards.forEach((card,i)=>{if(h&(1<<i))hand[card]++;});
  if(!hand[C.adp]&&!hand[C.basic])continue;
  for(let p=0;p<=all;p++){
   if(bitcount(p)!==2||h&p)continue;
   const free=cards.map((_,i)=>i).filter(i=>!((h|p)&(1<<i)));
   for(const b1 of free)for(const b2 of free)for(const d of free){
    if(b1===b2||b1===d||b2===d)continue;denom++;
    const seen=[...hand];seen[cards[b1]]++;seen[cards[b2]]++;seen[cards[d]]++;
    const left=free.filter(i=>i!==b1&&i!==b2&&i!==d);
    const available={adp:left.some(i=>cards[i]===C.adp),
      gh:left.some(i=>cards[i]===C.gh),dde:left.some(i=>cards[i]===C.dde)};
    const out=PROFILES.map(name=>cost(hand,seen,available,name));
    if(out[0]!==null)mechanical++;
    out.forEach((k,j)=>{if(k!==null)hist[PROFILES[j]][k]++;});
   }
  }
 }
 assert.equal(denom,expected.denominator);
 assert.equal(mechanical,expected.mechanical);
 assert.deepEqual(hist,expected.histograms);
});
