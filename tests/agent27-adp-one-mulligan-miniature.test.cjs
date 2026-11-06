'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {C}=require('../simulation/evaluation/agent5-adp-paid-opening.cjs');
const {minimumProtectedPayments:pay}=require('../simulation/evaluation/agent27-adp-protected-payment-cost.cjs');
const {countOneMulliganBonus:calc,PROFILES}=require('../simulation/evaluation/agent27-adp-one-mulligan-bonus.cjs');
const bits=n=>n.toString(2).replace(/0/g,'').length;
test('labeled-card toy deck enumerates all ordered bonus and first draws',()=>{
 const toy=[1,2,1,1,1,1,1,1,2,0,0,1],cards=toy.flatMap((n,i)=>Array(n).fill(i));
 const all=(1<<cards.length)-1,out=calc(toy,{handSize:4,prizeCount:2});
 const got=Object.fromEntries(PROFILES.map(p=>[p,Array(5).fill(0n)]));
 let den=0n;
 for(let hand=0;hand<=all;hand++){if(bits(hand)!==4)continue;
  const h=Array(12).fill(0);for(let i=0;i<cards.length;i++)if(hand&(1<<i))h[cards[i]]++;
  if(!h[C.adp]&&!h[C.basic])continue;
  for(let prize=0;prize<=all;prize++){if(bits(prize)!==2||hand&prize)continue;
   for(let b=0;b<cards.length;b++)for(let d=0;d<cards.length;d++){
    if(b===d||(hand|prize)&(1<<b)||(hand|prize)&(1<<d))continue;den++;
    const s=[...h];s[cards[b]]++;s[cards[d]]++;
    const left=cards.filter((_,i)=>!((hand|prize|(1<<b)|(1<<d))&(1<<i)));
    const a={adp:left.includes(C.adp),gh:left.includes(C.gh),dde:left.includes(C.dde)};
    for(const p of PROFILES){const k=pay(h,s,a,p);if(k!==null)got[p][k]++;}
   }
  }
 }
 assert.equal(den,out.denominator);assert.deepEqual(got,out.histograms);
});
