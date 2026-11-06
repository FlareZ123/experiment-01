'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {C}=require('../simulation/evaluation/agent5-adp-paid-opening.cjs');
const {minimumProtectedPayments:pay}=require('../simulation/evaluation/agent27-adp-protected-payment-cost.cjs');
const {PROFILES,countProtectedPaymentFrontier:calc}=require('../simulation/evaluation/agent27-adp-protected-payment-frontier.cjs');
const bits=n=>n.toString(2).replaceAll('0','').length;
test('all labeled miniature hand prize and draw deals reproduce exact histogram',()=>{
 const toy=[1,2,1,1,1,1,1,1,2,0,0,1],cards=toy.flatMap((n,k)=>Array(n).fill(k));
 const full=(1<<cards.length)-1, expected=calc(toy,{handSize:4,prizeCount:2});
 const seen=Object.fromEntries(PROFILES.map(p=>[p,Array(5).fill(0n)]));let denom=0n;
 for(let hand=0;hand<=full;hand++){if(bits(hand)!==4)continue;
  const h=Array(12).fill(0);for(let i=0;i<cards.length;i++)if(hand&(1<<i))h[cards[i]]++;
  if(!h[C.adp]&&!h[C.basic])continue;
  for(let prize=0;prize<=full;prize++){if(bits(prize)!==2||hand&prize)continue;
   for(let d=0;d<cards.length;d++){if((hand|prize)&(1<<d))continue;denom++;
    const s=[...h];s[cards[d]]++;
    const a={adp:false,gh:false,dde:false};
    for(let i=0;i<cards.length;i++)if(!((hand|prize|(1<<d))&(1<<i))){
     if(cards[i]===C.adp)a.adp=true;if(cards[i]===C.gh)a.gh=true;if(cards[i]===C.dde)a.dde=true;
    }
    for(const p of PROFILES){const k=pay(h,s,a,p);if(k!==null)seen[p][k]++;}
   }
  }
 }
 assert.equal(denom,expected.denominator);assert.deepEqual(seen,expected.histograms);
});
